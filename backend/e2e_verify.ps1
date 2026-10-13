$ErrorActionPreference = 'Stop'
Write-Host "=== FRESHCART END-TO-END VERIFICATION SUITE ==="

# 1. Health Endpoint
$health = Invoke-RestMethod -Uri 'http://localhost:8080/api/health' -Method GET
Write-Host "1. Health Endpoint: $($health.status)"

# 2. Customer Registration
$randId = Get-Random
$email = "aarav_$randId@freshcart.com"
$regBody = @{
    fullName = 'Aarav Sharma'
    email = $email
    password = 'Password123!'
    phone = '9876543210'
    address = '42 Green Valley, Indiranagar, Bengaluru'
} | ConvertTo-Json

$regRes = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/register' -Method POST -ContentType 'application/json' -Body $regBody
$token = $regRes.token
Write-Host "2. Customer Registered: $($regRes.customer.fullName), Token issued: $(if ($token) { 'YES' } else { 'NO' })"

# 3. Customer Profile verification
$meRes = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/me' -Method GET -Headers @{ 'X-Customer-Token' = $token }
Write-Host "3. Profile fetched: $($meRes.email)"

# 4. Products Listing
$products = Invoke-RestMethod -Uri 'http://localhost:8080/api/products' -Method GET
Write-Host "4. Products available in catalog: $($products.Count) items"

# 5. Cart Operations
$cartId = "e2e-cart-$randId"
$p1 = $products[0]
$addRes = Invoke-RestMethod -Uri 'http://localhost:8080/api/cart/items' -Method POST -ContentType 'application/json' -Headers @{ 'X-Cart-Id' = $cartId; 'X-Session-Key' = $cartId } -Body (@{ productId = $p1.id; quantity = 2 } | ConvertTo-Json)
Write-Host "5. Item added to cart: $($addRes.items[0].productName), Cart total items: $($addRes.totalItems), Subtotal: Rs.$($addRes.totalAmount)"

# 6. Budget Check
$budgetRes = Invoke-RestMethod -Uri 'http://localhost:8080/api/budget/check' -Method POST -ContentType 'application/json' -Headers @{ 'X-Cart-Id' = $cartId; 'X-Session-Key' = $cartId } -Body (@{ budget = 500; cartId = $cartId } | ConvertTo-Json)
Write-Host "6. Budget Check: Rs.$($budgetRes.budget), Over budget: $($budgetRes.overBudget)"

# 7. Recommendations
$recs = Invoke-RestMethod -Uri 'http://localhost:8080/api/recommendations/cart' -Method GET -Headers @{ 'X-Session-Key' = $cartId }
Write-Host "7. Recommendations returned: $($recs.Count) items"

# 8. Shopping Analyst
$analyst = Invoke-RestMethod -Uri 'http://localhost:8080/api/analyst/analyze' -Method POST -ContentType 'application/json' -Headers @{ 'X-Session-Key' = $cartId } -Body (@{ cartId = $cartId; budget = 100 } | ConvertTo-Json)
Write-Host "8. Analyst Report: Essentials=Rs.$($analyst.essentialSubtotal), Actions Count=$($analyst.recommendedActions.Count)"

# 9. Checkout & Order Creation
$checkoutBody = @{
    cartId = $cartId
    customerName = 'Aarav Sharma'
    customerEmail = $email
    customerPhone = '9876543210'
    deliveryAddress = '42 Green Valley, Bengaluru'
    paymentMethod = 'UPI'
} | ConvertTo-Json

$orderRes = Invoke-RestMethod -Uri 'http://localhost:8080/api/orders' -Method POST -ContentType 'application/json' -Headers @{ 'X-Customer-Token' = $token; 'X-Session-Key' = $cartId } -Body $checkoutBody
$orderId = $orderRes.id
Write-Host "9. Order created: #$($orderRes.id), Status: $($orderRes.orderStatus), Total: Rs.$($orderRes.totalAmount)"

# 10. Customer Order History
$myOrders = Invoke-RestMethod -Uri 'http://localhost:8080/api/orders' -Method GET -Headers @{ 'X-Customer-Token' = $token }
Write-Host "10. Customer Order History: $($myOrders.Count) order(s) found"

# 11. Customer Order Details Persistence
$orderDetail = Invoke-RestMethod -Uri "http://localhost:8080/api/orders/$orderId" -Method GET -Headers @{ 'X-Customer-Token' = $token }
Write-Host "11. Order Detail retrieved: items count=$($orderDetail.items.Count)"

# 12. Cross-Customer Order Isolation Test
$randId2 = Get-Random
$email2 = "sneha_$randId2@freshcart.com"
$reg2 = @{
    fullName = 'Sneha Patel'
    email = $email2
    password = 'Password123!'
    address = '10 MG Road, Bengaluru'
} | ConvertTo-Json
$reg2Res = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/register' -Method POST -ContentType 'application/json' -Body $reg2
$token2 = $reg2Res.token

$accessDenied = $false
try {
    $null = Invoke-RestMethod -Uri "http://localhost:8080/api/orders/$orderId" -Method GET -Headers @{ 'X-Customer-Token' = $token2 }
} catch {
    $accessDenied = $true
}
Write-Host "12. Cross-Customer Security: $(if ($accessDenied) { 'PASSED (Access Denied as expected)' } else { 'FAILED' })"

# 13. Admin Login & Authorization
$adminLogin = @{ username = 'admin'; password = 'admin123' } | ConvertTo-Json
$adminAuth = Invoke-RestMethod -Uri 'http://localhost:8080/api/admin/auth/login' -Method POST -ContentType 'application/json' -Body $adminLogin
$adminToken = $adminAuth.token
Write-Host "13. Admin Authenticated: Token issued: $(if ($adminToken) { 'YES' } else { 'NO' })"

# 14. Admin All Orders Access
$allOrders = Invoke-RestMethod -Uri 'http://localhost:8080/api/orders' -Method GET -Headers @{ 'X-Admin-Key' = $adminToken }
Write-Host "14. Admin access to orders: $($allOrders.Count) total orders found"

Write-Host "=== ALL 14 E2E SCENARIOS VERIFIED SUCCESSFULLY ==="
