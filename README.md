# Oilseed Hedging Platform (HPOPRM)

A production-ready full-stack platform for farmers, FPOs, and market participants to simulate hedging, execute forward e-contracts, receive AI-driven price forecasts, and store secure contracts on blockchain/IPFS.

## 🚀 Features

- **Simulated Trading Engine**: Order matching and settlement simulator
- **AI Price Forecasting**: ML-powered price predictions with confidence intervals
- **Blockchain E-Contracts**: Solidity smart contracts on Polygon testnet with IPFS storage
- **Real-time Market Data**: WebSocket-based price updates and alerts
- **Multi-language Support**: English and Hinglish (i18n)
- **Role-based Access Control**: Farmer, FPO Admin, Market Maker, Regulator, Super Admin
- **Responsive Design**: Mobile-first, accessible UI

## 📋 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS + shadcn/ui
- React Query
- Socket.IO Client
- i18next
- Recharts

### Backend
- NestJS + TypeScript
- PostgreSQL + Prisma ORM
- Redis (caching & pub/sub)
- Socket.IO
- BullMQ (job queue)
- JWT Authentication
- Swagger/OpenAPI

### Blockchain
- Solidity 0.8+
- Hardhat
- ethers.js
- IPFS (Pinata/Web3.Storage)
- Polygon Testnet

### AI/ML
- Python (FastAPI)
- Prophet / LSTM
- Pandas, NumPy

### DevOps
- Docker + Docker Compose
- GitHub Actions
- Render.com deployment
- Winston logging
- Sentry monitoring
- Prometheus metrics

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend    │────▶│  PostgreSQL │
│  (React)    │     │  (NestJS)    │     │   + Redis   │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ├──────▶ Trading Engine Worker
                           │
                           ├──────▶ AI Prediction Service
                           │
                           └──────▶ Blockchain (Polygon + IPFS)
```

## 🚦 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Docker and Docker Compose
- PostgreSQL 14+
- Redis 7+
- Git

### Local Development Setup

1. **Clone and Install**
   ```bash
   git clone <repo-url>
   cd HPOPRM
   pnpm install
   ```

2. **Environment Setup**
   ```bash
   # Run setup script
   chmod +x scripts/setup_dev.sh
   ./scripts/setup_dev.sh
   
   # Or manually:
   cp .env.example .env
   # Edit .env with your local configuration
   ```

3. **Start Services with Docker Compose**
   ```bash
   docker-compose up -d
   ```
   This starts:
   - PostgreSQL on port 5432
   - Redis on port 6379
   - Backend on port 3000
   - Frontend on port 5173
   - AI Service on port 8000
   - Worker process

4. **Database Setup**
   ```bash
   cd backend
   pnpm prisma migrate dev
   pnpm prisma db seed
   ```

5. **Start Local Blockchain (Hardhat)**
   ```bash
   cd contracts
   npx hardhat node
   # In another terminal:
   npx hardhat run scripts/deploy.ts --network localhost
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Docs: http://localhost:3000/docs
   - AI Service: http://localhost:8000/docs

### Demo Accounts (Seeded Data)

```
Farmer:
  Email: farmer@demo.com
  Password: Demo@123

FPO Admin:
  Email: fpo@demo.com
  Password: Demo@123

Market Maker:
  Email: market@demo.com
  Password: Demo@123
```

## 📦 Project Structure

```
HPOPRM/
├── frontend/           # React + TypeScript frontend
│   ├── src/
│   │   ├── pages/     # Route pages
│   │   ├── components/# Reusable components
│   │   ├── lib/       # Utilities
│   │   └── locales/   # i18n translations
│   ├── Dockerfile
│   └── package.json
├── backend/           # NestJS backend
│   ├── src/
│   │   ├── modules/   # Feature modules
│   │   ├── common/    # Shared code
│   │   └── prisma/    # Database schema
│   ├── Dockerfile
│   └── package.json
├── contracts/         # Solidity smart contracts
│   ├── contracts/
│   ├── scripts/
│   ├── test/
│   └── hardhat.config.ts
├── ai/               # AI prediction service
│   ├── app/
│   ├── models/
│   ├── Dockerfile
│   └── requirements.txt
├── worker/           # Trading engine worker
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── infra/            # Infrastructure configs
│   └── render.yaml
├── scripts/          # Automation scripts
├── docs/             # Documentation
├── .github/workflows/# CI/CD
└── docker-compose.yml
```

## 🔧 API Examples

### Register User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Farmer",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "phone": "+919876543210",
    "role": "farmer"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Get Price Forecast
```bash
curl -X GET "http://localhost:3000/market/forecast?commodity=soybean&horizon_days=30" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Simulated Order
```bash
curl -X POST http://localhost:3000/trading/order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "simulated",
    "side": "buy",
    "commodity": "soybean",
    "quantity": 100,
    "price": 5500
  }'
```

### Create Forward Contract
```bash
curl -X POST http://localhost:3000/contracts/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "sellerId": "user-id",
    "commodity": "soybean",
    "quantity": 1000,
    "priceFixed": 5500,
    "deliveryDate": "2025-12-31"
  }'
```

### Sign Contract
```bash
curl -X POST http://localhost:3000/contracts/CONTRACT_ID/sign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "signature": "0x..."
  }'
```

## 🚢 Deployment

### Frontend Deployment to Vercel

The fastest way to deploy the frontend:

1. **Automatic Deployment** (Recommended)
   ```bash
   # Push to GitHub
   git push origin main
   
   # Import project in Vercel Dashboard
   # Vercel will auto-detect the configuration
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add: `VITE_API_URL` = Your backend URL (e.g., `https://your-app.onrender.com`)
   - Redeploy after setting environment variables

3. **Manual Deployment with CLI**
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

**Configuration**: Pre-configured in `vercel.json`  
**Guide**: See [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md) for environment variable setup  
**Detailed Guide**: See [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md)

**⚠️ Important**: The frontend requires the backend API to be deployed and accessible. Set `VITE_API_URL` environment variable in Vercel to your backend URL.

### Backend Deployment to Render

### Option 1: Using render.yaml (Recommended)

1. Push code to GitHub
2. Connect your repository to Render
3. Render will auto-detect `render.yaml` and create all services
4. Set environment variables in Render dashboard:
   - `DATABASE_URL` (auto-provided by managed PostgreSQL)
   - `REDIS_URL` (auto-provided by managed Redis)
   - `JWT_SECRET`
   - `BLOCKCHAIN_PRIVATE_KEY`
   - `IPFS_API_KEY` (optional)
   - `OPENAI_API_KEY` (optional)

### Option 2: Manual Setup

1. **Create PostgreSQL Database**
   - Go to Render Dashboard → New → PostgreSQL
   - Name: `hedging-db`
   - Plan: Starter ($7/month minimum)
   - Note the Internal Database URL

2. **Create Redis Instance**
   - New → Redis
   - Name: `hedging-redis`
   - Plan: Starter ($10/month)
   - Note the Internal Redis URL

3. **Create Backend Web Service**
   - New → Web Service
   - Connect repository
   - Name: `hedging-backend`
   - Environment: Node
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `cd backend && npm run start:prod`
   - Plan: Starter ($7/month)
   - Add environment variables
   - Health Check Path: `/healthz`

4. **Create Worker Background Service**
   - New → Background Worker
   - Name: `hedging-worker`
   - Build Command: `cd worker && npm install && npm run build`
   - Start Command: `cd worker && npm run start:prod`
   - Plan: Starter

5. **Create Frontend Static Site**
   - New → Static Site
   - Name: `hedging-frontend`
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`
   - Add environment variables (API URL, etc.)

6. **Create AI Service**
   - New → Web Service
   - Name: `hedging-ai`
   - Environment: Python
   - Build Command: `cd ai && pip install -r requirements.txt`
   - Start Command: `cd ai && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

7. **Setup Cron Job** (for price data ingestion)
   - New → Cron Job
   - Name: `price-ingestion`
   - Command: `node backend/dist/jobs/ingest-prices.js`
   - Schedule: `0 * * * *` (hourly)

### Minimum Render Plans
- PostgreSQL: Starter ($7/month, 1GB RAM)
- Redis: Starter ($10/month)
- Backend Web Service: Starter ($7/month)
- Worker: Starter ($7/month)
- Frontend: Free (Static Site)
- AI Service: Starter ($7/month)
- **Total: ~$45/month**

### Using Deploy Script
```bash
# Install Render CLI
npm install -g render-cli

# Set API key
export RENDER_API_KEY=your_api_key

# Deploy
chmod +x scripts/deploy_render.sh
./scripts/deploy_render.sh
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Frontend tests
cd frontend
pnpm test

# Backend tests
cd backend
pnpm test
pnpm test:e2e

# Smart contract tests
cd contracts
npx hardhat test

# AI service tests
cd ai
pytest
```

## 📊 Monitoring & Observability

- **Logs**: Structured JSON logs via Winston
- **Metrics**: Prometheus endpoint at `/metrics`
- **Error Tracking**: Sentry integration (set `SENTRY_DSN`)
- **Health Checks**: `/healthz` endpoint on all services
- **Grafana**: Import dashboard from `infra/grafana-dashboard.json`

## 🔒 Security

- **Authentication**: JWT with RS256 signing
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: class-validator on all endpoints
- **Rate Limiting**: 100 requests/minute per IP
- **HTTPS Only**: Enforced via helmet middleware
- **CORS**: Configured for specific origins
- **SQL Injection**: Prevented via Prisma parameterized queries
- **XSS Protection**: CSP headers
- **Secrets Management**: Environment variables only
- **Encryption at Rest**: Sensitive DB columns encrypted
- **Audit Logs**: All contract operations logged

## 🌐 Internationalization

The platform supports:
- English (en)
- Hinglish (hi-EN) - Hindi written in Latin script

Add translations in `frontend/src/locales/`.

## 📚 Documentation

- [Architecture Overview](./docs/architecture.md)
- [API Documentation](./docs/API.md)
- [Security & Compliance](./docs/security.md)
- [Developer Onboarding](./docs/onboarding.md)
- [Smart Contracts](./contracts/README.md)
- [AI Models](./ai/README.md)

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](./LICENSE)

## 🆘 Support

- GitHub Issues: Report bugs and feature requests
- Documentation: Check `/docs` folder
- API Docs: http://localhost:3000/docs (when running locally)

## 🎯 Roadmap

- [ ] Mobile apps (React Native)
- [ ] Real money flow integration (Razorpay/Stripe)
- [ ] Advanced ML models (ensemble methods)
- [ ] Multi-chain support (Ethereum mainnet)
- [ ] Weather data integration
- [ ] Crop yield predictions
- [ ] Insurance product integration

---

**Built with ❤️ for Indian farmers and FPOs**
