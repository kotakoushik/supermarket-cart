# 🛒 FreshCart — Supermarket Cart Management System

FreshCart is a modern, full-stack supermarket cart, inventory management, and intelligent shopping assistance system built with **Spring Boot 3 (Java 21)** and **React 18 (Vite)**. It delivers a premium farm-to-home editorial e-commerce experience, authenticated customer accounts, secure admin portal, real-time budget tracking, rule-based AI Shopping Analyst, and transactional inventory reservations.

---

## 🏛️ Architecture Overview

The system follows a decoupled three-tier architecture:

```
┌────────────────────────────────────────────────────────────┐
│                  Client Browser (SPA)                      │
│   React 18 + Vite | Farm-to-Home Design System             │
│   Cart & Budget Context | Customer & Admin Auth Context     │
└─────────────────────────────┬──────────────────────────────┘
                              │ HTTP / REST (JSON)
                              │ Headers: X-Cart-Id, X-Customer-Token, X-Admin-Token
                              ▼
┌────────────────────────────────────────────────────────────┐
│              Backend Service (Spring Boot 3.3.4)           │
│   REST Controllers | Global Exception Handler              │
│   Service Layer (Cart, Product, Order, Analyst, Auth)      │
│   Spring Data JPA / Hibernate ORM | Transaction Management │
└─────────────────────────────┬──────────────────────────────┘
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
    [Development / Testing]        [Production / Docker]
    In-Memory H2 Database          MySQL 8.4 Relational DB
    jdbc:h2:mem:supermarketdb      jdbc:mysql://mysql:3306/supermarketdb
```

### Core Capabilities
1. **Catalog & Inventory**: Categorized supermarket products, real-time search, category filtering, sorting, stock badges, and fallback image resilience.
2. **Session-Persistent Cart**: Cross-refresh cart persistence via `localStorage` and `X-Cart-Id` / `X-Session-Key`.
3. **Customer Accounts & Order History**: Customer registration, secure BCrypt password hashing, session tokens, customer-isolated order history, and instant order receipts.
4. **Admin Portal**: Authenticated admin dashboard to manage product catalogs, update pricing & stock levels, and review customer orders.
5. **FreshCart AI Shopping Analyst**: Rule-based shopping analyst that classifies cart items into essential vs. discretionary goods, pinpoints in-stock cheaper alternatives, calculates concrete rupee savings, and allows one-click transactional batch swaps.
6. **Transactional Checkout & Inventory Locking**: Server-side price recalculation, atomic database transactions for inventory deduction, duplicate submission protection, and rollback on failure.

---

## 📋 Prerequisites

Before running the application locally, ensure you have installed:

| Tool | Recommended Version | Verification Command |
|---|---|---|
| **Java JDK** | 21 LTS | `java -version` |
| **Apache Maven** | 3.8.0+ | `mvn -v` |
| **Node.js** | 18.x or 20.x+ | `node -v` |
| **npm** | 9.x+ | `npm -v` |
| **Docker Desktop** (optional) | 24.x+ with Compose v2 | `docker compose version` |

---

## ⚙️ Environment Variables

Create a `.env` file in the project root by copying `.env.example`:

```bash
cp .env.example .env
```

### Key Environment Variables

| Variable | Description | Default / Dev Value | Production Example |
|---|---|---|---|
| `SPRING_PROFILES_ACTIVE` | Active Spring profile (`dev` or `prod`) | `dev` | `prod` |
| `SERVER_PORT` | Spring Boot backend port | `8080` | `8080` |
| `SPRING_DATASOURCE_URL` | JDBC connection URL | `jdbc:h2:mem:supermarketdb` | `jdbc:mysql://mysql:3306/supermarketdb?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `sa` | `freshcart_user` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | *(empty)* | `SuperSecurePassword123!` |
| `VITE_API_BASE_URL` | Backend API URL for frontend | `http://localhost:8080` | `/api` (or custom domain) |
| `MYSQL_ROOT_PASSWORD` | Root password for MySQL Docker container | *(none)* | `StrongRootPassword456!` |
| `MYSQL_DATABASE` | Database name | `supermarketdb` | `supermarketdb` |
| `MYSQL_USER` | Least-privilege MySQL user | *(none)* | `freshcart_user` |
| `MYSQL_PASSWORD` | MySQL user password | *(none)* | `SuperSecurePassword123!` |

---

## 💻 Local Development Setup

### 1. Backend (Spring Boot with H2 Database)

Run using Windows PowerShell or bash:

```powershell
cd supermarket-cart/backend
mvn spring-boot:run
```

- **Backend Base URL**: `http://localhost:8080`
- **Health Check**: `http://localhost:8080/api/health`
- **H2 Web Console**: `http://localhost:8080/h2-console`
  - **JDBC URL**: `jdbc:h2:mem:supermarketdb`
  - **User Name**: `sa`
  - **Password**: *(leave blank)*

### 2. Frontend (React 18 + Vite)

In a separate terminal window:

```powershell
cd supermarket-cart/frontend
npm install
npm run dev
```

- **Frontend Application URL**: `http://localhost:5173`
- Default Vite dev proxy and Axios client automatically route requests to `http://localhost:8080`.

---

## 🐳 Docker & Containerized Deployment

FreshCart includes production-ready multi-stage Docker configurations and Docker Compose files (`compose.yaml` / `docker-compose.yml`).

### Architecture of the Containerized Stack

1. **`mysql` Service**:
   - Official `mysql:8.4` image.
   - Dedicated `freshcart_user` with restricted privileges.
   - Persistent named volume `mysql_data` for database durability across restarts.
   - Built-in health check via `mysqladmin ping`.
2. **`backend` Service**:
   - Multi-stage build (`maven:3.9.9-eclipse-temurin-21-alpine` -> `eclipse-temurin:21-jre-alpine`).
   - Runs as non-root user `freshcart`.
   - Depends on `mysql` healthy state.
   - Uses `application-prod.properties` via `SPRING_PROFILES_ACTIVE=prod`.
   - Internal health check on `/api/health`.
3. **`frontend` Service**:
   - Multi-stage build (`node:20-alpine` -> `nginx:1.27-alpine`).
   - Nginx serves optimized production bundle with Gzip compression and security headers.
   - SPA fallback configured (`try_files $uri $uri/ /index.html;`) so direct links like `/orders`, `/cart`, `/checkout`, `/admin` persist on refresh.
   - Built-in reverse proxy routing `/api/` directly to `http://backend:8080/api/`.

### Starting the Docker Stack

Ensure Docker Desktop is running, then execute from the project root:

```powershell
# 1. Copy environment configuration
cp .env.example .env

# 2. Build images and start containers in the background
docker compose up --build -d

# 3. View status and health
docker compose ps

# 4. Stream service logs
docker compose logs -f backend
```

- **Frontend Accessible At**: `http://localhost:80` (or `http://localhost:5173`)
- **Backend Direct Host API & Health**: `http://localhost:8081/api/health` (container port 8080 mapped to host 8081)
- **Backend via Nginx Reverse Proxy**: `http://localhost/api/health`

### Stopping and Cleaning Up Containers

```powershell
# Stop services while preserving database data:
docker compose down

# Stop services and remove persistent database volume (destructive):
docker compose down -v
```

---

## 📡 REST API Reference

All endpoints return JSON and use standard HTTP response codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `409 Conflict`).

### Health & System
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health, database connectivity, and timestamp |

### Customer Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new customer (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | Authenticate customer, returns token and profile |
| `GET` | `/api/auth/me` | Retrieve authenticated customer profile (`X-Customer-Token`) |
| `POST` | `/api/auth/logout` | Invalidate customer session |

### Admin Authentication & Management
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/admin/login` | Authenticate admin, returns admin token |
| `GET` | `/api/admin/products` | View full inventory with stock levels |
| `POST` | `/api/admin/products` | Create product (`name`, `price`, `stock`, `category`) |
| `PUT` | `/api/admin/products/{id}` | Update product pricing, description, stock |
| `PATCH` | `/api/admin/products/{id}/status` | Toggle active/inactive product status |
| `GET` | `/api/admin/orders` | View all customer orders across the platform |

### Product Catalog
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Active catalog (`category`, `search`, `sort`) |
| `GET` | `/api/products/{id}` | Retrieve individual product details |
| `GET` | `/api/products/{id}/alternatives`| Find in-stock cheaper alternatives |

### Shopping Cart (`X-Cart-Id` or `X-Session-Key`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/cart` | Get current cart items, counts, subtotals, and total |
| `POST` | `/api/cart/items` | Add item to cart with stock validation |
| `PUT` | `/api/cart/items/{productId}` | Update item quantity in cart |
| `DELETE` | `/api/cart/items/{productId}` | Remove specific item from cart |
| `DELETE` | `/api/cart` | Empty all items from cart |

### Budget & AI Shopping Analyst
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/budget/check` | Validate cart total against user's spending limit |
| `POST` | `/api/analyst/analyze` | Generate rule-based analysis (essentials vs optional, savings, cheaper swaps) |
| `POST` | `/api/analyst/apply` | Apply user-approved action plan transactionally |
| `GET` | `/api/recommendations` | Get category-based complementary recommendations |

### Orders & Checkout
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/orders` | Atomic checkout: verifies stock, creates order, deducts inventory, clears cart |
| `GET` | `/api/orders` | Retrieve customer order history (`X-Customer-Token`) |
| `GET` | `/api/orders/{id}` | Retrieve specific order receipt (cross-customer protected) |

---

## 🧪 Testing & Quality Assurance

### 1. Backend Test Suite (JUnit 5 & Mockito)

```powershell
cd supermarket-cart/backend
mvn test
```

**Test Execution Results (27/27 Tests Passing)**:
- `ProductServiceTest` (5 tests): Catalog retrieval, filtering, search, stock validation.
- `CartServiceTest` (4 tests): Cart creation, item additions, quantity updates, removal.
- `CartAnalystServiceTest` (3 tests): Empty cart handling, budget threshold analysis, batch action execution.
- `OrderServiceTest` (3 tests): Atomic checkout, inventory deduction, order receipt persistence.
- `RecommendationServiceTest` (2 tests): Cheaper alternatives engine, complementary product discovery.
- `CustomerAuthServiceTest` (4 tests): Registration, duplicate email check, BCrypt password validation, session expiration.
- `CustomerOrderTest` (5 tests): Customer-specific order isolation, cross-customer access denial, order detail persistence.
- `SupermarketApplicationTests` (1 test): Spring application context boot verification.

### 2. Frontend Production Build

```powershell
cd supermarket-cart/frontend
npm run build
```

- Compiles cleanly in under 1 second.
- Produces optimized JS, CSS, and asset bundles in `dist/`.

### 3. Automated End-to-End Verification Script

Run the automated 14-scenario integration test in PowerShell against a running backend:

```powershell
cd supermarket-cart/backend
powershell -ExecutionPolicy Bypass -File .\e2e_verify.ps1
```

**Verified Scenarios**:
1. Health endpoint response and database connectivity.
2. Customer registration with unique email.
3. Profile retrieval with `X-Customer-Token`.
4. Product catalog listing.
5. Cart item addition, total calculation, and stock check.
6. Budget checking and over-budget alert generation.
7. Complementary product recommendations.
8. AI Shopping Analyst rule-based report generation.
9. Checkout submission and inventory reservation.
10. Customer-specific order history persistence.
11. Order receipt retrieval by order ID.
12. Cross-customer privacy protection (Customer B cannot read Customer A's order).
13. Admin authentication.
14. Admin access to platform-wide orders.

---

## 💾 Database Persistence & Backup Guidelines

### Development (H2 In-Memory)
- In the `dev` profile, schema is automatically initialized via `DataInitializer.java` on application startup with 20 curated supermarket items across 9 categories.
- Suitable for rapid local development and unit testing.

### Production (MySQL 8.4)
- Uses `application-prod.properties` with `spring.jpa.hibernate.ddl-auto=update` to prevent destructive table dropping.
- Pass connection credentials via environment variables (`SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`).
- **Database Backup Command**:
  ```bash
  docker compose exec -T mysql mysqldump -u freshcart_user -p"SuperSecurePassword123!" supermarketdb > backup_$(date +%F).sql
  ```
- **Database Restore Command**:
  ```bash
  docker compose exec -i mysql mysql -u freshcart_user -p"SuperSecurePassword123!" supermarketdb < backup_2026-10-14.sql
  ```

---

## 🔧 Troubleshooting

### 1. Frontend cannot reach backend (`Failed to fetch` or CORS error)
- Ensure backend is running on port `8080` (`curl http://localhost:8080/api/health`).
- Verify `CorsConfig.java` allows `http://localhost:5173` and exposes headers `X-Cart-Id`, `X-Session-Key`, and `X-Customer-Token`.
- In Docker, ensure the frontend Nginx reverse proxy routes `/api/` to `http://backend:8080/api/`.

### 2. Port conflict (`Port 8080 already in use` or `Port 5173 already in use`)
- **Windows PowerShell**:
  ```powershell
  # Find process occupying port 8080:
  netstat -ano | findstr :8080
  # Terminate process by PID:
  Stop-Process -Id <PID> -Force
  ```

### 3. Direct route refresh returns 404 in production
- Nginx is configured with `try_files $uri $uri/ /index.html;` in `frontend/nginx.conf` so browser reloads on `/orders`, `/cart`, `/checkout`, `/admin` correctly fall back to the React SPA router.

---

## 👥 Default Demo Credentials (Development Only)

> [!WARNING]
> Do NOT use default demo credentials in public or production environments. Configure secure passwords via environment variables in production.

- **Admin Portal**: Accessible at `/admin` (or `/login` with Admin tab)
  - **Username**: `admin`
  - **Password**: `admin123`
- **Customer Account**: You can register any new customer account with your own email and password via the `/register` page.
