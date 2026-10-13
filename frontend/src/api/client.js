import axios from 'axios';

const CART_ID_STORAGE_KEY = 'supermarket_cart_id';

export const getCartId = () => {
  let cartId = localStorage.getItem(CART_ID_STORAGE_KEY);
  if (!cartId) {
    cartId = 'cart-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem(CART_ID_STORAGE_KEY, cartId);
  }
  return cartId;
};

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const cartId = getCartId();
  config.headers['X-Cart-Id'] = cartId;
  config.headers['X-Session-Key'] = cartId;
  
  // Attach customer auth token if available
  const customerToken = localStorage.getItem('freshcart_customer_token');
  if (customerToken) {
    config.headers['X-Customer-Token'] = customerToken;
    config.headers['Authorization'] = `Bearer ${customerToken}`;
  }
  
  // Attach admin key/token for admin endpoint requests if available in session
  if (config.url && config.url.includes('/admin')) {
    const adminKey = sessionStorage.getItem('freshcart_admin_key');
    if (adminKey) {
      config.headers['X-Admin-Key'] = adminKey;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMsg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(errorMsg));
  }
);

export default apiClient;
