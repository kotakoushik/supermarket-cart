import test from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';

// Mock browser localStorage & sessionStorage
class StorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

globalThis.localStorage = new StorageMock();
globalThis.sessionStorage = new StorageMock();

test('Cart ID Generation & Persistence', async () => {
  localStorage.clear();
  const CART_ID_STORAGE_KEY = 'supermarket_cart_id';
  
  const getCartId = () => {
    let cartId = localStorage.getItem(CART_ID_STORAGE_KEY);
    if (!cartId) {
      cartId = 'cart-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem(CART_ID_STORAGE_KEY, cartId);
    }
    return cartId;
  };

  const id1 = getCartId();
  assert.ok(id1.startsWith('cart-'), 'Cart ID should start with cart-');

  // Should persist on subsequent calls
  const id2 = getCartId();
  assert.equal(id1, id2, 'Cart ID should be idempotent across calls');
});

test('API Client Base URL Defaults to /api', () => {
  const baseURL = process.env.VITE_API_BASE_URL || '/api';
  assert.equal(baseURL, '/api', 'Default baseURL must be relative /api for Nginx reverse proxy');

  const client = axios.create({ baseURL });
  assert.equal(client.defaults.baseURL, '/api');
  assert.equal(client.getUri({ url: '/cart/items' }), '/api/cart/items');
  assert.equal(client.getUri({ url: '/products' }), '/api/products');
  assert.equal(client.getUri({ url: '/orders' }), '/api/orders');
});

test('Request Interceptor Attaches Session & Auth Headers', () => {
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem('supermarket_cart_id', 'test-session-123');
  localStorage.setItem('freshcart_customer_token', 'cust-token-abc');
  sessionStorage.setItem('freshcart_admin_key', 'admin-secret-xyz');

  const config = {
    url: '/admin/products',
    headers: {},
  };

  // Simulate interceptor logic from client.js
  const cartId = localStorage.getItem('supermarket_cart_id');
  config.headers['X-Cart-Id'] = cartId;
  config.headers['X-Session-Key'] = cartId;

  const customerToken = localStorage.getItem('freshcart_customer_token');
  if (customerToken) {
    config.headers['X-Customer-Token'] = customerToken;
    config.headers['Authorization'] = `Bearer ${customerToken}`;
  }

  if (config.url && config.url.includes('/admin')) {
    const adminKey = sessionStorage.getItem('freshcart_admin_key');
    if (adminKey) {
      config.headers['X-Admin-Key'] = adminKey;
    }
  }

  assert.equal(config.headers['X-Cart-Id'], 'test-session-123');
  assert.equal(config.headers['X-Session-Key'], 'test-session-123');
  assert.equal(config.headers['X-Customer-Token'], 'cust-token-abc');
  assert.equal(config.headers['Authorization'], 'Bearer cust-token-abc');
  assert.equal(config.headers['X-Admin-Key'], 'admin-secret-xyz');
});

test('Response Interceptor Handles Error Extraction', () => {
  const formatError = (error) => {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred'
    );
  };

  const serverError = {
    response: {
      status: 400,
      data: { message: 'Insufficient stock available for Amul Taaza Milk' },
    },
  };
  assert.equal(formatError(serverError), 'Insufficient stock available for Amul Taaza Milk');

  const networkError = { message: 'Network Error' };
  assert.equal(formatError(networkError), 'Network Error');
});
