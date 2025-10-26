# Deployment Guide

## Deploying Oilseed Hedging Platform to Render

This guide provides step-by-step instructions for deploying the platform to Render.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Deployment Options](#deployment-options)
3. [Option A: Deploy via render.yaml (Recommended)](#option-a-deploy-via-renderyaml-recommended)
4. [Option B: Manual Render Dashboard Setup](#option-b-manual-render-dashboard-setup)
5. [Post-Deployment Configuration](#post-deployment-configuration)
6. [Environment Variables](#environment-variables)
7. [Database Migrations](#database-migrations)
8. [Monitoring and Logs](#monitoring-and-logs)
9. [Troubleshooting](#troubleshooting)
10. [Cost Estimation](#cost-estimation)

---

## Prerequisites

### Required Accounts
- **GitHub**: Repository hosted on GitHub
- **Render**: Account at [render.com](https://render.com)
- **Alchemy** (optional): For Polygon RPC endpoint
- **Pinata/Web3.Storage** (optional): For IPFS
- **OpenAI** (optional): For AI features

### Tools Needed
- Git CLI
- Render CLI (optional): `npm install -g render`
- Node.js 18+ (for local testing)

---

## Deployment Options

### Option A: render.yaml Blueprint (Fastest)
- ✅ Automated setup
- ✅ All services configured
- ✅ Best for teams

### Option B: Manual Dashboard Setup (More Control)
- ✅ Step-by-step configuration
- ✅ Better understanding
- ✅ Fine-tuned control

---

## Option A: Deploy via render.yaml (Recommended)

### Step 1: Prepare Repository

1. **Ensure render.yaml is in root**
   ```bash
   ls render.yaml  # Should exist
   ```

2. **Commit and push to main branch**
   ```bash
   git add .
   git commit -m "chore: prepare for render deployment"
   git push origin main
   ```

### Step 2: Connect to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"Blueprint"**
3. Select your GitHub repository
4. Render will detect `render.yaml` automatically
5. Click **"Apply"**

### Step 3: Configure Environment Variables

Render will create all services but needs these environment variables:

#### Backend Service (hedging-backend)
```bash
# Generate secure secrets
JWT_SECRET=<generate-strong-secret>
JWT_REFRESH_SECRET=<generate-strong-secret>

# Optional: Blockchain
BLOCKCHAIN_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR-KEY
BLOCKCHAIN_PRIVATE_KEY=<your-deployer-private-key>

# Optional: AI
OPENAI_API_KEY=sk-...
USE_STUB_AI=true  # Set to false when ready

# Optional: Monitoring
SENTRY_DSN=https://...@sentry.io/...
ENABLE_SENTRY=false  # Set to true when ready
```

#### Frontend Service (hedging-frontend)
```bash
VITE_API_URL=<backend-url-from-render>
VITE_WS_URL=<backend-url-from-render>
```

### Step 4: Create Redis Instance

Render.yaml references Redis, but you must create it manually:

1. Go to **Dashboard** → **"New"** → **"Redis"**
2. Name: `hedging-redis`
3. Plan: **Starter** ($10/month)
4. Region: Same as other services
5. Click **"Create Redis"**
6. No additional configuration needed (automatically linked)

### Step 5: Deploy

1. After applying blueprint, Render will:
   - Create PostgreSQL database
   - Create backend web service
   - Create frontend static site
   - Create worker background service
   - Create cron job for data ingestion

2. Wait for all services to deploy (5-10 minutes)

3. Check deployment status in dashboard

---

## Option B: Manual Render Dashboard Setup

### Step 1: Create PostgreSQL Database

1. Go to **Dashboard** → **"New"** → **"PostgreSQL"**
2. Configure:
   ```
   Name: hedging-postgres
   Database: hedging_platform
   User: (auto-generated)
   Region: Oregon (US West) or closest to you
   PostgreSQL Version: 15
   Plan: Starter ($7/month)
   ```
3. Click **"Create Database"**
4. Wait for provisioning (~2 minutes)
5. **Save the Internal Database URL** (starts with `postgresql://`)

### Step 2: Create Redis Instance

1. Go to **Dashboard** → **"New"** → **"Redis"**
2. Configure:
   ```
   Name: hedging-redis
   Plan: Starter ($10/month)
   Region: Same as PostgreSQL
   Maxmemory Policy: allkeys-lru
   ```
3. Click **"Create Redis"**
4. **Save the Internal Connection String**

### Step 3: Create Backend Web Service

1. Go to **Dashboard** → **"New"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   ```
   Name: hedging-backend
   Runtime: Docker
   Branch: main
   Region: Same as database
   Instance Type: Starter ($7/month)
   
   Build Configuration:
   Dockerfile Path: ./backend/Dockerfile
   Docker Context: ./backend
   
   Health Check:
   Health Check Path: /healthz
   ```

4. **Environment Variables**:
   Click "Advanced" → "Add Environment Variable"
   
   ```bash
   NODE_ENV=production
   PORT=3000
   
   # Database (from Step 1)
   DATABASE_URL=<postgres-internal-url>
   
   # Redis (from Step 2)
   REDIS_URL=<redis-internal-url>
   
   # JWT (generate secure secrets)
   JWT_SECRET=<generate-with-openssl-rand-hex-32>
   JWT_REFRESH_SECRET=<generate-with-openssl-rand-hex-32>
   JWT_EXPIRATION=15m
   JWT_REFRESH_EXPIRATION=7d
   
   # Application
   LOG_LEVEL=info
   ENABLE_CORS=true
   CORS_ORIGIN=<frontend-url>  # Will update later
   
   # Features (start disabled, enable gradually)
   ENABLE_BLOCKCHAIN=false
   ENABLE_AI_PREDICTIONS=false
   ENABLE_PAYMENTS=false
   USE_STUB_AI=true
   
   # Optional: Add when ready
   # BLOCKCHAIN_RPC_URL=
   # OPENAI_API_KEY=
   # SENTRY_DSN=
   ```

5. Click **"Create Web Service"**
6. **Copy the Service URL** (e.g., `https://hedging-backend.onrender.com`)

### Step 4: Create Frontend Static Site

1. Go to **Dashboard** → **"New"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure:
   ```
   Name: hedging-frontend
   Branch: main
   
   Build Configuration:
   Build Command: cd frontend && npm install && npm run build
   Publish Directory: frontend/dist
   
   Auto-Deploy: Yes
   ```

4. **Environment Variables**:
   ```bash
   VITE_API_URL=<backend-url-from-step-3>
   VITE_WS_URL=<backend-url-from-step-3>
   VITE_ENABLE_BLOCKCHAIN=true
   VITE_NETWORK=mumbai
   ```

5. Click **"Create Static Site"**
6. **Copy the Site URL** (e.g., `https://hedging-platform.onrender.com`)

7. **Update Backend CORS_ORIGIN**:
   - Go back to backend service
   - Edit environment variable `CORS_ORIGIN` with frontend URL
   - Trigger manual deploy

### Step 5: Create Worker Background Service

1. Go to **Dashboard** → **"New"** → **"Background Worker"**
2. Connect your GitHub repository
3. Configure:
   ```
   Name: hedging-worker
   Runtime: Docker
   Branch: main
   Region: Same as database
   Instance Type: Starter ($7/month)
   
   Docker Configuration:
   Dockerfile Path: ./backend/Dockerfile
   Docker Context: ./backend
   Docker Command: npm run start:worker
   ```

4. **Environment Variables**: (Copy from backend service)
   ```bash
   NODE_ENV=production
   DATABASE_URL=<postgres-internal-url>
   REDIS_URL=<redis-internal-url>
   WORKER_CONCURRENCY=5
   LOG_LEVEL=info
   ```

5. Click **"Create Background Worker"**

### Step 6: Create Cron Job (Optional)

1. Go to **Dashboard** → **"New"** → **"Cron Job"**
2. Connect your GitHub repository
3. Configure:
   ```
   Name: hedging-data-ingestion
   Runtime: Docker
   Branch: main
   Schedule: 0 */6 * * *  (every 6 hours)
   
   Docker Configuration:
   Dockerfile Path: ./backend/Dockerfile
   Docker Context: ./backend
   Docker Command: npm run cron:ingest-prices
   ```

4. **Environment Variables**:
   ```bash
   NODE_ENV=production
   DATABASE_URL=<postgres-internal-url>
   LOG_LEVEL=info
   MARKET_DATA_SOURCE=csv
   ```

5. Click **"Create Cron Job"**

---

## Post-Deployment Configuration

### Run Database Migrations

#### Method 1: Render Shell (Web UI)
1. Go to backend service in Render dashboard
2. Click **"Shell"** tab
3. Run:
   ```bash
   npm run migrate:deploy
   ```

#### Method 2: Render API
```bash
curl -X POST \
  "https://api.render.com/v1/services/${SERVICE_ID}/shell" \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -d '{"command": "npm run migrate:deploy"}'
```

### Seed Database (Optional)
```bash
# Via Render Shell
npm run db:seed
```

### Verify Deployment

1. **Check Health Endpoints**:
   ```bash
   # Backend health
   curl https://your-backend.onrender.com/healthz
   
   # Should return: {"status":"ok"}
   ```

2. **Check API Documentation**:
   Open `https://your-backend.onrender.com/docs` in browser

3. **Test Frontend**:
   Open `https://your-frontend.onrender.com`

4. **Test Registration**:
   ```bash
   curl -X POST https://your-backend.onrender.com/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "password": "Test@1234",
       "role": "farmer"
     }'
   ```

---

## Environment Variables

### Critical Variables (Must Set)

```bash
# Security
JWT_SECRET=<min-32-chars>
JWT_REFRESH_SECRET=<min-32-chars>

# Database
DATABASE_URL=<postgres-url-from-render>

# Redis
REDIS_URL=<redis-url-from-render>

# CORS
CORS_ORIGIN=<frontend-url>
```

### Optional Variables

```bash
# Blockchain
BLOCKCHAIN_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/KEY
BLOCKCHAIN_PRIVATE_KEY=<deployer-private-key>
USE_LOCAL_BLOCKCHAIN=false

# AI
OPENAI_API_KEY=sk-...
USE_STUB_AI=false

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
ENABLE_SENTRY=true

# Payments
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
ENABLE_PAYMENTS=false
```

### Generating Secrets

```bash
# Generate JWT secrets
openssl rand -hex 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Database Migrations

### Initial Migration
```bash
# Via Render Shell
npm run migrate:deploy
```

### Creating New Migrations
```bash
# Local development
npx prisma migrate dev --name your_migration_name

# Commit and push
git add .
git commit -m "feat: add migration for X"
git push origin main

# Render auto-deploys, then run:
npm run migrate:deploy
```

---

## Monitoring and Logs

### View Logs

#### Via Dashboard
1. Go to service in Render dashboard
2. Click **"Logs"** tab
3. Filter by log level, time range

#### Via Render CLI
```bash
render logs <service-name>
```

### Set Up Monitoring

1. **Sentry** (Error Tracking):
   - Create Sentry project
   - Add `SENTRY_DSN` to environment variables
   - Set `ENABLE_SENTRY=true`

2. **Prometheus** (Metrics):
   - Metrics available at `/metrics` endpoint
   - Set up Prometheus scraper or use Render's built-in metrics

3. **Uptime Monitoring**:
   - Use Render's built-in uptime checks
   - Or configure UptimeRobot, Pingdom

---

## Troubleshooting

### Service Won't Start

1. **Check Logs**:
   ```
   Dashboard → Service → Logs
   ```

2. **Common Issues**:
   - Missing environment variables
   - Database connection failed
   - Docker build errors

3. **Verify Environment**:
   ```bash
   # Via Render Shell
   echo $DATABASE_URL
   echo $JWT_SECRET
   ```

### Database Connection Issues

1. **Verify Database URL**:
   - Must use internal database URL
   - Format: `postgresql://user:pass@host/db`

2. **Check Database Status**:
   - Go to database in dashboard
   - Ensure status is "Available"

3. **Test Connection**:
   ```bash
   # Via backend shell
   npx prisma db push --skip-generate
   ```

### Redis Connection Issues

1. **Verify Redis URL**:
   - Must use internal connection string
   - Format: `redis://host:port`

2. **Test Connection**:
   ```bash
   # Via backend shell
   redis-cli -u $REDIS_URL ping
   ```

### Frontend Not Loading

1. **Check Build Logs**:
   - Go to frontend service → Deploys → Latest Deploy

2. **Verify Environment Variables**:
   - `VITE_API_URL` must point to backend
   - Must start with `https://`

3. **Check CORS**:
   - Backend `CORS_ORIGIN` must include frontend URL

### Worker Not Processing Jobs

1. **Check Worker Logs**:
   ```
   Dashboard → hedging-worker → Logs
   ```

2. **Verify Redis Connection**:
   - Worker needs same `REDIS_URL` as backend

3. **Test Job Creation**:
   ```bash
   # Via backend shell
   npm run test:worker
   ```

---

## Cost Estimation

### Minimum Configuration (Starter Plans)

| Service | Plan | Cost/Month |
|---------|------|------------|
| Backend Web Service | Starter | $7 |
| Frontend Static Site | Free | $0 |
| Worker | Starter | $7 |
| PostgreSQL | Starter | $7 |
| Redis | Starter | $10 |
| Cron Job | Free | $0 |
| **Total** | | **~$31/month** |

### Recommended Production Configuration

| Service | Plan | Cost/Month |
|---------|------|------------|
| Backend Web Service | Standard (2 instances) | $50 |
| Frontend Static Site | Free | $0 |
| Worker | Standard | $25 |
| PostgreSQL | Standard | $20 |
| Redis | Standard | $25 |
| Cron Job | Free | $0 |
| **Total** | | **~$120/month** |

### Cost Optimization Tips

1. **Start Small**: Begin with Starter plans
2. **Monitor Usage**: Use Render's usage dashboard
3. **Optimize Queries**: Reduce database costs
4. **Cache Aggressively**: Reduce backend load
5. **Static Assets**: Use CDN for images/videos
6. **Auto-Scaling**: Enable for traffic spikes only

---

## Scaling Guidelines

### When to Scale Up

- Backend response time > 500ms (p95)
- Worker queue size consistently > 100
- Database CPU > 70%
- Redis memory > 80%

### Horizontal Scaling

```yaml
# In render.yaml, update:
- type: web
  name: hedging-backend
  scaling:
    minInstances: 2
    maxInstances: 10
    targetCPUPercent: 70
```

### Vertical Scaling

Upgrade service plan in Render dashboard:
- Starter → Standard → Pro

---

## Security Checklist

Before going live:

- [ ] All JWT secrets are strong and unique
- [ ] Database password is strong
- [ ] CORS is configured correctly
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced (automatic on Render)
- [ ] Sensitive data is encrypted
- [ ] Audit logging is enabled
- [ ] Backups are configured
- [ ] Monitoring is set up
- [ ] Incident response plan is ready

---

## Next Steps

After successful deployment:

1. **Configure Custom Domain** (optional):
   - Go to service settings
   - Add custom domain
   - Update DNS records

2. **Set Up CI/CD**:
   - GitHub Actions already configured
   - Add `RENDER_API_KEY` to GitHub Secrets

3. **Enable Features Gradually**:
   - Start with core features enabled
   - Enable blockchain, AI, payments as needed

4. **Monitor Performance**:
   - Set up alerts for errors, slow responses
   - Review logs daily

5. **Plan for Maintenance**:
   - Schedule weekly deployments
   - Review and rotate secrets quarterly

---

## Support

### Render Support
- Documentation: https://render.com/docs
- Community: https://community.render.com
- Email: support@render.com

### Platform Support
- Documentation: [docs/](../docs)
- GitHub Issues: Create an issue
- Email: support@hedging-platform.com

---

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Render API Reference](https://api-docs.render.com)
- [Architecture Guide](./ARCHITECTURE.md)
- [Security Guide](./SECURITY.md)
- [Onboarding Guide](./ONBOARDING.md)

---

**Happy Deploying! 🚀**
