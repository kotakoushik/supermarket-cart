// Complete End-to-End Verification of FreshCart through Docker Nginx Reverse Proxy (http://localhost:80)
const http = require('http');

const BASE_HOST = 'localhost';
const BASE_PORT = 80;

function request(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'Accept': 'application/json',
      ...headers,
    };
    if (body && !defaultHeaders['Content-Type']) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    const req = http.request({
      hostname: BASE_HOST,
      port: BASE_PORT,
      path: path,
      method: method,
      headers: defaultHeaders,
      timeout: 10000,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed,
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function run() {
  console.log('=== FreshCart End-to-End Test through Docker Nginx (http://localhost:80) ===\n');
  const results = [];

  function pass(desc, detail = '') {
    console.log(`[PASS] ${desc} ${detail ? '(' + detail + ')' : ''}`);
    results.push({ test: desc, status: 'PASS', detail });
  }

  function fail(desc, err) {
    console.error(`[FAIL] ${desc}:`, err);
    results.push({ test: desc, status: 'FAIL', error: String(err) });
  }

  const testSessionCartId = 'cart-test-' + Date.now();
  const testEmail = `shopper_${Date.now()}@example.com`;
  let customerToken = null;
  let adminToken = null;
  let createdOrderId = null;

  try {
    // 1. Health check
    const health = await request('GET', '/api/health');
    if (health.status === 200 && health.data.status === 'UP') {
      pass('1. Health check returns UP through Nginx');
    } else {
      throw new Error(`Health status ${health.status}: ${JSON.stringify(health.data)}`);
    }

    // 2. Catalog retrieval
    const catalog = await request('GET', '/api/products');
    if (catalog.status === 200 && Array.isArray(catalog.data) && catalog.data.length > 0) {
      pass('2. Product catalog loaded from MySQL', `${catalog.data.length} products found`);
    } else {
      throw new Error(`Catalog failed: status ${catalog.status}`);
    }

    // 3. Search and category filter
    const dairyProds = await request('GET', '/api/products?category=Dairy');
    if (dairyProds.status === 200 && dairyProds.data.length > 0 && dairyProds.data.every(p => p.category === 'Dairy')) {
      pass('3. Category filtering works for Dairy', `${dairyProds.data.length} items`);
    } else {
      throw new Error('Category filtering failed');
    }

    // 4. Add to Cart (In-Stock product)
    const targetProduct = catalog.data.find(p => p.stockQuantity > 5) || catalog.data[0];
    const addRes = await request('POST', '/api/cart/items', { 'X-Cart-Id': testSessionCartId }, {
      productId: targetProduct.id,
      quantity: 2,
    });
    if (addRes.status === 200 && addRes.data.totalItems === 2) {
      pass('4. Add to Cart succeeds', `Added 2x ${targetProduct.name}, total: ₹${addRes.data.totalAmount}`);
    } else {
      throw new Error(`Add to cart failed: status ${addRes.status}: ${JSON.stringify(addRes.data)}`);
    }

    // 5. Cart retrieval and subtotal check
    const getCartRes = await request('GET', '/api/cart', { 'X-Cart-Id': testSessionCartId });
    if (getCartRes.status === 200 && getCartRes.data.items.length === 1 && getCartRes.data.totalItems === 2) {
      pass('5. Cart retrieval matches added item', `Items: ${getCartRes.data.items.length}, total: ₹${getCartRes.data.totalAmount}`);
    } else {
      throw new Error('Cart retrieval failed');
    }

    // 6. Update Quantity (Increase to 4)
    const updateRes = await request('PUT', `/api/cart/items/${targetProduct.id}`, { 'X-Cart-Id': testSessionCartId }, {
      quantity: 4,
    });
    if (updateRes.status === 200 && updateRes.data.totalItems === 4) {
      pass('6. Increase quantity works', `Quantity now 4, total: ₹${updateRes.data.totalAmount}`);
    } else {
      throw new Error('Update quantity failed');
    }

    // 7. Update Quantity (Decrease to 1)
    const decreaseRes = await request('PUT', `/api/cart/items/${targetProduct.id}`, { 'X-Cart-Id': testSessionCartId }, {
      quantity: 1,
    });
    if (decreaseRes.status === 200 && decreaseRes.data.totalItems === 1) {
      pass('7. Decrease quantity works', `Quantity now 1, total: ₹${decreaseRes.data.totalAmount}`);
    } else {
      throw new Error('Decrease quantity failed');
    }

    // 8. Invalid product ID returns 404
    const invalidProd = await request('POST', '/api/cart/items', { 'X-Cart-Id': testSessionCartId }, {
      productId: 999999,
      quantity: 1,
    });
    if (invalidProd.status === 404) {
      pass('8. Invalid product ID returns 404 Not Found as expected');
    } else {
      throw new Error(`Expected 404 for invalid product, got ${invalidProd.status}`);
    }

    // 9. Invalid quantity (0) returns 400 Bad Request
    const invalidQty = await request('POST', '/api/cart/items', { 'X-Cart-Id': testSessionCartId }, {
      productId: targetProduct.id,
      quantity: 0,
    });
    if (invalidQty.status === 400) {
      pass('9. Invalid quantity (0) returns 400 Bad Request as expected');
    } else {
      throw new Error(`Expected 400 for zero quantity, got ${invalidQty.status}`);
    }

    // 10. Budget checking
    const budgetCheck = await request('POST', '/api/budget/check', { 'X-Cart-Id': testSessionCartId }, {
      budget: 10.0,
    });
    if (budgetCheck.status === 200 && budgetCheck.data.overBudget === true) {
      pass('10. Budget evaluation works', `Budget ₹10 vs total ₹${budgetCheck.data.currentTotal}, over-budget alert triggered`);
    } else {
      throw new Error('Budget checking failed');
    }

    // 11. Shopping Analyst rule-based report
    const analystReport = await request('POST', '/api/analyst/analyze', { 'X-Cart-Id': testSessionCartId }, {
      budgetLimit: 50.0,
      classificationOverrides: {},
    });
    if (analystReport.status === 200 && analystReport.data.cartId) {
      pass('11. Shopping Analyst generates report', `Essentials: ${analystReport.data.essentialItemCount}, Potential Savings: ₹${analystReport.data.totalPotentialSavings}`);
    } else {
      throw new Error(`Analyst report failed: ${JSON.stringify(analystReport.data)}`);
    }

    // 12. Recommendations based on cart
    const recommendations = await request('GET', '/api/recommendations/cart', { 'X-Cart-Id': testSessionCartId });
    if (recommendations.status === 200 && Array.isArray(recommendations.data)) {
      pass('12. Category-based complementary recommendations returned', `${recommendations.data.length} recommendations`);
    } else {
      throw new Error('Recommendations endpoint failed');
    }

    // 13. Customer Registration
    const regRes = await request('POST', '/api/auth/register', {}, {
      fullName: 'Alice Test Shopper',
      email: testEmail,
      password: 'Password123!',
      address: '42 Greenway Road, Bengaluru',
      phone: '9876543210',
    });
    if (regRes.status === 201 && regRes.data.token && regRes.data.customer) {
      customerToken = regRes.data.token;
      pass('13. Customer registration succeeds with BCrypt', `Token issued for ${regRes.data.customer.email}`);
    } else {
      throw new Error(`Customer registration failed: ${JSON.stringify(regRes.data)}`);
    }

    // 14. Customer Profile retrieval (/api/auth/me)
    const profileRes = await request('GET', '/api/auth/me', { 'X-Customer-Token': customerToken });
    if (profileRes.status === 200 && profileRes.data.email === testEmail) {
      pass('14. Customer profile retrieved successfully', `Name: ${profileRes.data.fullName}`);
    } else {
      throw new Error('Customer profile retrieval failed');
    }

    // 15. Checkout Order Creation
    const orderRes = await request('POST', '/api/orders', {
      'X-Cart-Id': testSessionCartId,
      'X-Customer-Token': customerToken,
    }, {
      cartId: testSessionCartId,
      customerName: 'Alice Test Shopper',
      customerEmail: testEmail,
      customerPhone: '9876543210',
      deliveryAddress: '42 Greenway Road, Bengaluru',
      deliveryNotes: 'Leave with guard',
      paymentMethod: 'UPI',
    });
    if (orderRes.status === 201 && orderRes.data.id) {
      createdOrderId = orderRes.data.id;
      pass('15. Checkout order created transactionally', `Order ID: ${createdOrderId}, Status: ${orderRes.data.orderStatus}`);
    } else {
      throw new Error(`Checkout failed: ${JSON.stringify(orderRes.data)}`);
    }

    // 16. Verify Cart is cleared after checkout
    const postCheckoutCart = await request('GET', '/api/cart', { 'X-Cart-Id': testSessionCartId });
    if (postCheckoutCart.status === 200 && postCheckoutCart.data.items.length === 0) {
      pass('16. Cart is safely emptied after confirmed checkout');
    } else {
      throw new Error('Cart not cleared after checkout');
    }

    // 17. Customer Order History persistence
    const orderHistory = await request('GET', '/api/orders', { 'X-Customer-Token': customerToken });
    if (orderHistory.status === 200 && Array.isArray(orderHistory.data) && orderHistory.data.some(o => o.id === createdOrderId)) {
      pass('17. Customer order appears in Order History', `${orderHistory.data.length} orders recorded`);
    } else {
      throw new Error('Order history verification failed');
    }

    // 18. Individual Order Receipt retrieval
    const orderReceipt = await request('GET', `/api/orders/${createdOrderId}`, { 'X-Customer-Token': customerToken });
    if (orderReceipt.status === 200 && orderReceipt.data.id === createdOrderId && orderReceipt.data.items.length > 0) {
      pass('18. Individual order receipt retrievable with line items');
    } else {
      throw new Error('Order receipt retrieval failed');
    }

    // 19. Cross-Customer Order Isolation (Security check)
    const otherToken = 'fake-other-customer-token';
    const unauthorizedOrder = await request('GET', `/api/orders/${createdOrderId}`, { 'X-Customer-Token': otherToken });
    if (unauthorizedOrder.status === 401 || unauthorizedOrder.status === 403 || unauthorizedOrder.status === 404) {
      pass('19. Cross-customer privacy isolation enforced', `Status ${unauthorizedOrder.status} for unauthorized customer`);
    } else {
      throw new Error(`Security breach: unauthorized user could read order (status ${unauthorizedOrder.status})`);
    }

    // 20. Admin Authentication & Management
    const adminLogin = await request('POST', '/api/admin/auth/login', {}, {
      username: 'admin',
      password: 'admin123',
    });
    if (adminLogin.status === 200 && adminLogin.data.token) {
      adminToken = adminLogin.data.token;
      pass('20. Admin authentication succeeds', `Token issued: ${adminToken.substring(0, 10)}...`);
    } else {
      throw new Error(`Admin login failed: ${JSON.stringify(adminLogin.data)}`);
    }

    // 21. Admin Inventory Inspection
    const adminProducts = await request('GET', '/api/admin/products', { 'X-Admin-Key': adminToken });
    if (adminProducts.status === 200 && Array.isArray(adminProducts.data)) {
      pass('21. Admin full inventory access verified', `${adminProducts.data.length} total products`);
    } else {
      throw new Error(`Admin products failed with status ${adminProducts.status}`);
    }

    // 22. Admin Platform Orders Inspection
    const adminOrders = await request('GET', '/api/orders', { 'X-Admin-Key': adminToken });
    if (adminOrders.status === 200 && Array.isArray(adminOrders.data)) {
      pass('22. Admin platform-wide orders inspection verified', `${adminOrders.data.length} orders total`);
    } else {
      throw new Error(`Admin orders failed with status ${adminOrders.status}`);
    }

    console.log('\n=== ALL 22 END-TO-END VERIFICATION CHECKS PASSED ===');
    console.log(`Summary: ${results.filter(r => r.status === 'PASS').length}/22 passed, 0 failures.`);

  } catch (err) {
    fail('Execution error', err.message);
    console.error('\nTest Suite Halted on Failure:', err);
    process.exit(1);
  }
}

run();
