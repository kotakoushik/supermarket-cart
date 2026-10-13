# 🚀 DEPLOYMENT GUIDE — FRESHCART AI SUPERMARKET

This document outlines the step-by-step instructions to deploy the Supermarket Cart Management System to production environments.

---

## 1. Architecture Overview

- **Frontend**: Single Page Application built with React + Vite. Deployed to static hosting providers such as **Vercel**, **Netlify**, or **Cloudflare Pages**.
- **Backend**: Containerized Spring Boot 3.3.4 (Java 21) executable JAR. Deployed to container/cloud runtimes such as **Render**, **Railway**, **AWS App Runner**, or **Google Cloud Run**.
- **Database**: Managed **MySQL 8.0+** instance (e.g. AWS RDS, PlanetScale, Aiven, or Railway MySQL).

---

## 2. Backend Deployment (e.g. Render / Docker / Railway)

### Option A: Direct Maven/JAR Deployment on Render
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your Git repository.
3. Configure the service:
   - **Root Directory**: `backend`
   - **Environment**: `Java` (or `Docker`)
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -Dspring.profiles.active=prod -jar target/supermarket-cart-backend-1.0.0.jar`
   - **Health Check Path**: `/api/health`

### Option B: Dockerfile Deployment
Create `backend/Dockerfile`:
```dockerfile
# Build Stage
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/supermarket-cart-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
```

### Backend Environment Variables
Set the following environment variables in your deployment dashboard:

| Variable | Description | Example |
|---|---|---|
| `PORT` | HTTP port provided by cloud host | `8080` |
| `SPRING_PROFILES_ACTIVE` | Activates MySQL profile | `prod` |
| `DB_URL` | Production JDBC MySQL connection URL | `jdbc:mysql://mysql.host:3306/supermarket_db?useSSL=true` |
| `DB_USERNAME` | MySQL user | `supermarket_admin` |
| `DB_PASSWORD` | MySQL password | `[REDACTED_SECRET]` |
| `CORS_ALLOWED_ORIGINS` | Deployed frontend domain(s) | `https://freshcart-app.vercel.app` |

---

## 3. Frontend Deployment (e.g. Vercel / Netlify)

### Option A: Vercel
1. Install Vercel CLI or import the repository in [Vercel Dashboard](https://vercel.com):
   ```bash
   npm i -g vercel
   cd frontend
   vercel
   ```
2. Configuration settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Environment Variables:
   - `VITE_API_BASE_URL`: `https://your-backend-service.onrender.com/api`

### Client-Side Routing Fallback (`vercel.json`)
For client-side routing on Vercel, ensure `frontend/vercel.json` exists:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Option B: Netlify
Create `frontend/_redirects`:
```
/*    /index.html   200
```
Run `netlify deploy --prod` from `frontend` specifying `dist` as the publish directory.

---

## 4. Database Setup (MySQL)

Create the database schema prior to first start:
```sql
CREATE DATABASE supermarket_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
When `SPRING_PROFILES_ACTIVE=prod` is enabled, Spring Data JPA automatically validates and creates the tables (`products`, `cart_items`, `orders`, `order_items`) and `DataInitializer` seeds the initial 26 products idempotently if the table is empty.

---

## 5. Post-Deployment Verification Checklist

1. **Backend Health Check**:
   ```bash
   curl -I https://your-backend-domain.com/api/health
   # Expected response: HTTP 200 OK with {"status": "UP"}
   ```

2. **Catalog API Verification**:
   ```bash
   curl https://your-backend-domain.com/api/products
   # Expected: JSON array of products loaded from MySQL
   ```

3. **Frontend Connection**:
   - Open deployed frontend URL in an incognito window.
   - Verify products display with prices and in-stock badges.
   - Click **AI Save** to test rule-based alternative suggestions.
   - Add items to cart and verify cart badge and total.
   - Place an order and verify order confirmation receipt is generated.

---

## 6. Current Deployment Status & Remaining Actions

- [x] **Backend verified**: Compiled, tested (15/15 JUnit tests passing), and running on port 8080.
- [x] **Frontend verified**: Production build (`npm run build`) completed cleanly with 0 errors; Vite dev server active on port 5173.
- [x] **End-to-End API verified**: Health, product catalog, cart item persistence, budget warnings, order checkout, inventory deduction, and error handling all passed.
- [x] **Production configuration prepared**: `application-prod.properties`, `.env.example`, and deployment guides configured.
- [ ] **External Cloud Account Authentication**: Live deployment to cloud services (Render, Vercel, AWS RDS) requires your specific cloud credentials, account access token, and managed MySQL host URL. Once you provide or authenticate your preferred cloud account, the project is 100% ready to deploy with the commands above.
