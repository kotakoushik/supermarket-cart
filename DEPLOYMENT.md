# 🚀 FreshCart Supermarket — Production Deployment Guide

This guide provides end-to-end instructions for deploying the FreshCart Supermarket application to production environments.

---

## 1. Architecture Overview & Recommendations

FreshCart is a full-stack e-commerce system comprising:
- **Frontend**: React 18 + Vite SPA served via Nginx reverse proxy with gzip compression and client-side SPA routing (`dist/index.html`).
- **Backend**: Spring Boot 3.3.4 (Java 21) REST API packaged as an executable JAR or multi-stage Docker container running as an unprivileged user (`freshcart`).
- **Database**: MySQL 8.4 with persistent storage, HikariCP connection pooling, and UTF8MB4 collation.

### Recommended Hosting Options

| Option | Ideal For | Database | Backend | Frontend | Monthly Cost |
|---|---|---|---|---|---|
| **Option A: PaaS (Recommended)** | Fastest zero-ops setup | **Render / Railway / Aiven** Managed MySQL (automated daily backups) | **Render / Railway** Web Service (Auto-deploy on Git push) | **Render / Vercel / Cloudflare Pages** | ~$7 - $15 |
| **Option B: Single VPS (Docker)** | Cost-effective complete control | **MySQL 8.4** Container with persistent Docker volume | **Spring Boot** Container (bound to loopback `127.0.0.1:8081`) | **Nginx** Reverse Proxy Container on Port 80/443 + Certbot SSL | ~$5 - $10 (Hetzner / DigitalOcean) |
| **Option C: Enterprise Cloud** | High availability & scalability | **AWS RDS MySQL** Multi-AZ with automated point-in-time snapshots | **AWS ECS Fargate** Container task | **AWS S3 + CloudFront** CDN | Pay-as-you-go |

---

## 2. Environment Variables Checklist (Placeholders Only)

Create a production `.env` file (or enter these into your cloud provider's Environment Variables dashboard).

> [!WARNING]
> **NEVER commit real passwords, credentials, or keys to Git.** The `.gitignore` file is configured to exclude all `.env` files except `.env.example`.

```ini
# ==============================================================================
# FreshCart Supermarket — Production Environment Configuration
# ==============================================================================

# --- DATABASE CONFIGURATION (MySQL Production) ---
DB_NAME=supermarket_db
DB_USER=freshcart_user
DB_PASSWORD=YOUR_STRONG_DATABASE_PASSWORD_32_CHARS
MYSQL_ROOT_PASSWORD=YOUR_STRONG_ROOT_PASSWORD_32_CHARS

# --- SPRING BOOT BACKEND CONFIGURATION ---
SPRING_PROFILES_ACTIVE=prod
PORT=8080

# When using local Docker Compose on same host:
# DB_URL=jdbc:mysql://mysql:3306/supermarket_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC

# When using Aiven Managed MySQL on Render (TLS Required with sslMode=REQUIRED):
DB_URL=jdbc:mysql://mysql-38f2956d-freshcart-project.i.aivencloud.com:20119/defaultdb?sslMode=REQUIRED
DB_USERNAME=avnadmin
DB_PASSWORD=YOUR_AIVEN_PASSWORD_HERE

# Admin Portal Master Key (Used to authorize /api/admin/** operations)
FRESHCART_ADMIN_KEY=YOUR_SECURE_ADMIN_KEY_UUID_OR_SECRET

# Allowed CORS Origins (Comma-separated list of your live domains)
CORS_ALLOWED_ORIGINS=https://freshcart.yourdomain.com,https://yourdomain.com

# --- FRONTEND CONFIGURATION (Vite) ---
# When deployed behind Nginx reverse proxy (same-origin):
VITE_API_BASE_URL=/api

# If deploying frontend and backend on separate origins (e.g., Vercel + Render):
# VITE_API_BASE_URL=https://api.freshcart.yourdomain.com/api
```

---

## 3. Deployment Walkthroughs

### Option A: Render Docker Web Service with Aiven MySQL (Recommended)

#### Step 1: Your Aiven MySQL Service Details
- **Host**: `mysql-38f2956d-freshcart-project.i.aivencloud.com`
- **Port**: `20119`
- **Database**: `defaultdb`
- **SSL / TLS**: Required (`sslMode=REQUIRED`)
- **JDBC Connection URL**:
  `jdbc:mysql://mysql-38f2956d-freshcart-project.i.aivencloud.com:20119/defaultdb?sslMode=REQUIRED`

#### Step 2: Deploy Spring Boot Backend on Render
1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** > **Web Service**.
3. Connect your repository: `https://github.com/kotakoushik/supermarket-cart`.
4. Configure the service:
   - **Name**: `freshcart-backend`
   - **Runtime**: `Docker`
   - **Root Directory**: Leave blank (repository root) or set to `backend` (both root `Dockerfile` and `backend/Dockerfile` are supported!)
   - **Dockerfile Path**: `Dockerfile` (or `backend/Dockerfile`)
   - **Instance Type**: Starter or Standard (at least 512MB RAM recommended for Java 21)
   - **Health Check Path**: `/api/health`
5. In **Environment Variables**, add:
   - `SPRING_PROFILES_ACTIVE`: `prod`
   - `DB_URL`: `jdbc:mysql://mysql-38f2956d-freshcart-project.i.aivencloud.com:20119/defaultdb?sslMode=REQUIRED`
   - `DB_USERNAME`: `avnadmin` (or your Aiven user)
   - `DB_PASSWORD`: `[YOUR_AIVEN_PASSWORD]`
   - `FRESHCART_ADMIN_KEY`: `[GENERATE_A_STRONG_RANDOM_UUID_KEY]`
   - `CORS_ALLOWED_ORIGINS`: `https://your-frontend.onrender.com,http://localhost:5173`
   *(Note: Render automatically injects `PORT=10000`; the app dynamically binds to it via `server.port=${PORT:8080}`).*
6. Click **Create Web Service**. Verify build logs until `Started SupermarketApplication` appears.


#### Step 3: Deploy React Frontend
1. Click **New +** > **Static Site**.
2. Settings:
   - **Name**: `freshcart-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
3. In **Environment Variables**:
   - `VITE_API_BASE_URL`: `https://freshcart-backend.onrender.com/api`
4. In **Redirects / Rewrites**:
   - Add rewrite: Source `/*` -> Destination `/index.html` (Status `200`).

---

### Option B: Linux VPS with Docker Compose & Nginx SSL (Hetzner / DigitalOcean / AWS EC2)

This option uses the verified `compose.yaml` file in this repository.

#### Step 1: Server Provisioning & Initial Setup (Ubuntu 22.04 / 24.04)
Run on your server:
```bash
# Update and install Docker + Compose
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y ca-certificates curl gnupg ufw
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Firewall configuration: Allow only SSH, HTTP, and HTTPS
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

#### Step 2: Clone Repository & Configure Environment
```bash
git clone <YOUR_GIT_REPO_URL> /opt/freshcart
cd /opt/freshcart

# Create production .env file from template
cp .env.example .env
nano .env
# Fill in real secure passwords for DB_PASSWORD, MYSQL_ROOT_PASSWORD, and FRESHCART_ADMIN_KEY
```

#### Step 3: Build & Launch with Docker Compose
```bash
# Build and run all services in detached mode
sudo docker compose up -d --build

# Check container health and status
sudo docker compose ps
sudo docker compose logs -f
```

#### Step 4: Configure Free SSL with Certbot (Let's Encrypt)
On your host machine, install Certbot to obtain free SSL certificates for your domain:
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 4. Windows CMD / PowerShell Commands

When preparing builds or managing local and remote deployment containers from Windows:

### 1. Build and Test Locally
```cmd
:: From repository root
cd frontend
npm test
npm run build
cd ..\backend
mvn clean test
cd ..
```

### 2. Run Local Docker Stack (Production Mode)
```cmd
:: Start Docker Compose in detached mode
docker compose up -d

:: Verify container health and port bindings
docker compose ps

:: Inspect logs
docker compose logs -f backend
docker compose logs -f frontend

:: Run full-stack 22-step integration suite
node verify_full_stack_docker.js

:: Stop stack safely without deleting database
docker compose down
```

### 3. Push Git Repository to Remote Host
```cmd
:: Stage and commit configuration updates
git add compose.yaml .env.example .gitignore backend/src/main/resources/application-prod.properties DEPLOYMENT.md
git commit -m "chore(deploy): harden production Docker Compose, properties, and deployment guide"

:: Add remote and push (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/freshcart-supermarket.git
git branch -M main
git push -u origin main
```

---

## 5. Persistent Storage & Database Backup Procedures

### Automated Database Backups (Cron Job)
On Linux/VPS production systems, schedule an automated daily backup via cron:

```bash
# Create backup directory
mkdir -p /opt/freshcart/backups

# Add cron job to backup database daily at 02:00 AM UTC
sudo crontab -e
```
Add the following line:
```cron
0 2 * * * docker exec freshcart-mysql mysqldump -u root -p$(grep MYSQL_ROOT_PASSWORD /opt/freshcart/.env | cut -d '=' -f2) supermarket_db | gzip > /opt/freshcart/backups/supermarket_db_$(date +\%Y\%m\%d_\%H\%M\%S).sql.gz
```

### Manual Backup (Windows / CMD)
```cmd
docker exec freshcart-mysql mysqldump -u root -p supermarket_db > supermarket_db_backup.sql
```

### Restore Database from Backup
```bash
# Linux
gunzip < /opt/freshcart/backups/supermarket_db_YYYYMMDD.sql.gz | docker exec -i freshcart-mysql mysql -u root -p supermarket_db

# Windows
docker exec -i freshcart-mysql mysql -u root -p supermarket_db < supermarket_db_backup.sql
```

---

## 6. Production Security & Health Check Audit Checklist

- [x] **Consolidated Compose Configuration**: Single canonical `compose.yaml`; removed duplicate `docker-compose.yml`.
- [x] **No Public Database Exposure**: `mysql` container has no published host ports; accessible only over internal bridge network `freshcart-net`.
- [x] **Loopback-bound Backend**: Backend container port mapped to `127.0.0.1:8081:8080`, preventing direct internet exposure on host port 8081.
- [x] **Same-Origin Reverse Proxy**: Nginx proxies `/api` requests to `http://backend:8080` internally, avoiding CORS issues.
- [x] **Persistent Volume**: MySQL data stored on named Docker volume `mysql_data` (`/var/lib/mysql`).
- [x] **No Hardcoded Secrets**: Default passwords removed from `application-prod.properties` and `compose.yaml`.
- [x] **Secrets Excluded from Git**: `.env` and `*.env` explicitly ignored by `.gitignore`.
- [x] **Database Migrations Safe**: `spring.jpa.hibernate.ddl-auto=update` safely preserves existing tables and records.
- [x] **Non-Root Runtime**: Backend Docker container runs under dedicated unprivileged `freshcart` user.
- [x] **Health Checks Enabled**: Nginx, Spring Boot (`/api/health`), and MySQL have Docker container health checks configured.
- [x] **Full-Stack Integration Passed**: All 22 automated end-to-end checks verified against the running Docker stack.
