# 🛒 FreshCart AI — Supermarket Cart Management System

An intelligent, full-stack supermarket cart and inventory management system built with **Spring Boot 3 (Java 21)** and **React (Vite)**. Features real-time shopping budget tracking, explainable rule-based AI cheaper product recommendations, and transactional inventory reservations.

---

## 🌟 Key Features

1. **Product Catalog & Inventory**:
   - 20+ realistic supermarket products across 9 categories (Dairy, Bakery, Breakfast, Grains & Pulses, Fruits & Vegetables, Snacks, Beverages, Cooking Essentials, Household Products).
   - Live search by product name/description, category filtering, and price/name sorting.
   - Real-time stock status (In Stock, Low Stock, Out of Stock).

2. **Smart Shopping Cart**:
   - Session-isolated cart identity persisted across browser refreshes via `localStorage` and `X-Cart-Id` header.
   - Real-time quantity adjustments, subtotals, and server-side calculated totals.
   - Stock limits enforced before items can be added.

3. **Explainable AI Savings & Budget Tracker**:
   - **Shopping Budget Tracker**: Shoppers can set a spending limit; a dynamic progress bar monitors expenditure and triggers proactive alerts if exceeded.
   - **Cheaper Alternative Engine**: Rule-based algorithm analyzes active in-stock products in the same category and explains exact cost savings (e.g. *"Save ₹25.00 (9% off) with Nandini Salted Butter 500g in Dairy with verified in-stock availability"*).
   - **1-Click AI Swaps**: Swap high-cost cart items with budget-friendly alternatives directly in the cart.
   - **Complementary Recommendations**: Recommends related groceries based on categories in the current cart.

4. **FreshCart AI Shopping Analyst**:
   - **Floating & Omnipresent Launcher**: Accessible via a floating bot launcher button across catalog & cart, navbar, and checkout sidebar.
   - **Explainable Classification**: Deterministically categorizes cart items into essentials (staples, dairy, grains, produce) vs. discretionary/optional items with clear, non-medical rationales.
   - **Interactive User Control**: Allows instant manual classification overrides; never removes or swaps items without explicit user consent.
   - **Actionable Recommendations**: Computes cheaper alternative replacements, quantity reductions, and optional removals using high-precision `BigDecimal` calculations.
   - **Live Projected Total & Batch Apply**: Previews projected cart totals and savings in real time, with a single-click transactional batch apply.

5. **Reliable Transactional Checkout**:
   - Strict server-side total validation (never trusts client pricing).
   - Atomic database transactions: inventory is safely deducted upon checkout; failed orders rollback completely.
   - Generates instant order receipt with breakdown, customer address, and unique order ID.

6. **Admin Inventory Management**:
   - Manage all store products: add new items, update prices & stock, and toggle active/inactive status in real time.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, React Router DOM 7, Axios, Lucide Icons, Modern Responsive CSS.
- **Backend**: Java 21, Spring Boot 3.3.4, Spring Data JPA, Spring Web, Jakarta Bean Validation.
- **Database**:
  - **Local/Development**: In-memory H2 Database (`jdbc:h2:mem:supermarketdb`, with H2 web console at `/h2-console`).
  - **Production**: MySQL with persistent storage (`application-prod.properties`).
- **Testing**: JUnit 5, Mockito, Spring Boot Test (`mvn test`).

---

## 📂 Project Structure

```
supermarket-cart/
├── backend/
│   ├── pom.xml
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/supermarket/cart/
│   │   │   │   ├── SupermarketApplication.java
│   │   │   │   ├── config/          # CorsConfig, DataInitializer
│   │   │   │   ├── controller/      # REST API Controllers (Product, Cart, Order, Admin, Budget, Health)
│   │   │   │   ├── dto/             # Request & Response DTOs
│   │   │   │   ├── entity/          # JPA Entities (Product, CartItem, Order, OrderItem)
│   │   │   │   ├── exception/       # GlobalExceptionHandler & Custom Exceptions
│   │   │   │   ├── repository/      # Spring Data Repositories
│   │   │   │   └── service/         # ProductService, CartService, OrderService, RecommendationService
│   │   │   └── resources/
│   │   │       ├── application.properties        # H2 dev profile
│   │   │       └── application-prod.properties   # MySQL prod profile
│   │   └── test/java/com/supermarket/cart/       # 15 Unit & Integration tests
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── api/client.js            # Axios client with cartId header interceptor
│       ├── context/CartContext.jsx  # Cart state & budget management
│       ├── components/              # Navbar, ProductCard, BudgetBanner, AlternativeModal, Footer
│       ├── pages/                   # CatalogPage, CartPage, CheckoutPage, OrderConfirmationPage, OrderHistoryPage, AdminPage
│       ├── App.jsx
│       └── index.css                # Plus Jakarta Sans design system
├── .gitignore
├── .env.example
├── README.md
└── DEPLOYMENT.md
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Java**: 21 LTS or newer
- **Maven**: 3.8+
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+

### 1. Run the Backend
```bash
cd supermarket-cart/backend
mvn spring-boot:run
```
- The backend starts on: `http://localhost:8080`
- Health check: `http://localhost:8080/api/health`
- H2 Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:supermarketdb`, Username: `sa`, Password: empty)

### 2. Run the Frontend
In a new terminal:
```bash
cd supermarket-cart/frontend
npm install
npm run dev
```
- Open `http://localhost:5173` in your web browser.

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status check |
| `GET` | `/api/products` | Get active catalog (params: `category`, `search`, `sort`) |
| `GET` | `/api/products/{id}` | Get product details by ID |
| `GET` | `/api/products/{id}/alternatives` | Get cheaper alternatives in the same category |
| `GET` | `/api/admin/products` | Get all inventory items (including inactive) |
| `POST` | `/api/admin/products` | Create a new product (validates price & stock) |
| `PUT` | `/api/admin/products/{id}` | Update existing product details |
| `PATCH` | `/api/admin/products/{id}/status` | Toggle active/inactive product status |
| `GET` | `/api/cart` | Get current cart items, subtotal, and total amount |
| `POST` | `/api/cart/items` | Add product to cart with quantity validation |
| `PUT` | `/api/cart/items/{productId}` | Update quantity of item in cart |
| `DELETE` | `/api/cart/items/{productId}` | Remove item from cart |
| `DELETE` | `/api/cart` | Clear all items from current cart |
| `POST` | `/api/budget/check` | Analyze cart total against budget limit |
| `POST` | `/api/analyst/analyze` | AI Shopping Analyst report (essentials, savings, suggestions) |
| `POST` | `/api/analyst/apply` | Apply user-selected action plan to cart transactionally |
| `GET` | `/api/recommendations` | Get complementary product recommendations |
| `POST` | `/api/orders` | Place order, deduct inventory, and clear cart |
| `GET` | `/api/orders/{id}` | Get confirmed order receipt by ID |
| `GET` | `/api/orders` | List order history |

---

## 🧪 Testing

### Backend Tests (JUnit 5 & Mockito)
```bash
cd supermarket-cart/backend
mvn test
```
**Results**:
- `ProductServiceTest`: 5 passed
- `CartServiceTest`: 4 passed
- `CartAnalystServiceTest`: 3 passed (Empty cart, over-budget analysis, batch action execution)
- `OrderServiceTest`: 3 passed
- `RecommendationServiceTest`: 2 passed
- `SupermarketApplicationTests`: 1 passed
- **Total: 18 passed, 0 failures, 0 errors**

### Frontend Production Build
```bash
cd supermarket-cart/frontend
npm run build
```
Generates optimized static bundle in `dist/` ready for production static hosting.

---

## ⚙️ Configuration & Production Environment

Refer to `.env.example` and `DEPLOYMENT.md` for production setup using MySQL, Docker, Vercel/Netlify, or Render.
