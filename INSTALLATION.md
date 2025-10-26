# Installation Guide - HPOPRM Platform

Complete step-by-step guide to set up the Oilseed Hedging Platform locally.

## Prerequisites

### Required Software
- **Node.js**: v18+ ([Download](https://nodejs.org/))
- **pnpm**: v8+ (`npm install -g pnpm`)
- **Docker**: Latest version ([Download](https://www.docker.com/products/docker-desktop/))
- **Git**: Latest version

### Optional (for full features)
- **Python**: v3.9+ (for AI service)
- **PostgreSQL**: v14+ (if not using Docker)
- **Redis**: v7+ (if not using Docker)

## Installation Steps

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd HPOPRM
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
pnpm install

# This installs dependencies for:
# - Root workspace
# - backend/
# - frontend/
# - contracts/
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# REQUIRED: Update these values
# - JWT_SECRET (generate with: openssl rand -base64 32)
# - DATABASE_URL
# - REDIS_URL
# - BLOCKCHAIN_RPC_URL
```

**Minimum .env configuration**:
```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hpoprm
REDIS_URL=redis://localhost:6379

JWT_SECRET=your-generated-secret-here-min-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

BLOCKCHAIN_RPC_URL=http://localhost:8545
BLOCKCHAIN_NETWORK=hardhat
BLOCKCHAIN_CHAIN_ID=1337

AI_SERVICE_URL=http://localhost:8001
AI_SERVICE_ENABLED=true

CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 4. Start Infrastructure Services

```bash
# Start PostgreSQL and Redis with Docker
docker-compose up -d postgres redis

# Verify services are running
docker-compose ps
```

### 5. Database Setup

```bash
cd backend

# Generate Prisma Client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# Seed database with demo data
pnpm prisma db seed

cd ..
```

**Demo Accounts Created**:
- Farmer: `farmer@demo.com` / `Demo@123`
- FPO Admin: `fpo@demo.com` / `Demo@123`
- Market Maker: `market@demo.com` / `Demo@123`
- Regulator: `regulator@demo.com` / `Demo@123`
- Admin: `admin@demo.com` / `Demo@123`

### 6. Build Backend

```bash
cd backend
pnpm run build
cd ..
```

### 7. Start Development Servers

**Option A: All services with Docker Compose**
```bash
docker-compose up
```

**Option B: Individual services (recommended for development)**

Terminal 1 - Backend:
```bash
cd backend
pnpm run start:dev
```

Terminal 2 - Frontend:
```bash
cd frontend
pnpm run dev
```

Terminal 3 - Blockchain (optional):
```bash
cd contracts
npx hardhat node
```

Terminal 4 - Smart Contract Deployment (optional):
```bash
cd contracts
npx hardhat run scripts/deploy.ts --network localhost
```

### 8. Access Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/docs
- **Metrics**: http://localhost:3000/metrics
- **Health Check**: http://localhost:3000/healthz

## Verification

### Test Backend
```bash
curl http://localhost:3000/healthz
# Should return: {"status":"ok","timestamp":"..."}
```

### Test Database Connection
```bash
cd backend
pnpm prisma studio
# Opens Prisma Studio at http://localhost:5555
```

### Test Frontend
```bash
# Open http://localhost:5173
# You should see the landing page
# Click "Login" and use demo credentials
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or change PORT in .env
```

### Database Connection Failed
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check DATABASE_URL in .env
# Verify credentials match docker-compose.yml
```

### Prisma Client Not Generated
```bash
cd backend
pnpm prisma generate
```

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Docker Issues
```bash
# Stop all containers
docker-compose down

# Remove volumes (WARNING: deletes all data)
docker-compose down -v

# Rebuild containers
docker-compose build --no-cache
docker-compose up
```

## Development Workflow

### Making Database Changes
```bash
cd backend

# 1. Edit prisma/schema.prisma
# 2. Create migration
pnpm prisma migrate dev --name your_migration_name

# 3. Regenerate client
pnpm prisma generate
```

### Running Tests
```bash
# Backend tests
cd backend
pnpm test

# Contract tests
cd contracts
pnpm test

# Frontend tests (when implemented)
cd frontend
pnpm test
```

### Code Quality
```bash
# Lint all code
pnpm run lint

# Format all code
pnpm run format
```

## Next Steps

1. **Explore API**: Visit http://localhost:3000/docs for Swagger UI
2. **Login**: Use demo credentials to test the platform
3. **Create Contract**: Try creating a forward contract
4. **Place Order**: Test the simulated trading engine
5. **View Forecasts**: Check AI price predictions

## Production Deployment

See [README.md](./README.md) for Render deployment instructions.

## Getting Help

- Check [OUTPUT_SUMMARY.md](./OUTPUT_SUMMARY.md) for project overview
- Review [BACKEND_STRUCTURE.md](./backend/BACKEND_STRUCTURE.md) for API details
- Open an issue on GitHub
- Contact: support@hpoprm.com

## Common Issues

### Frontend shows blank page
- Check browser console for errors
- Verify VITE_API_URL in frontend/.env
- Ensure backend is running

### Authentication fails
- Verify JWT_SECRET is set
- Check token expiration settings
- Clear browser localStorage

### Real-time features not working
- Verify Redis is running
- Check WebSocket connection in browser DevTools
- Ensure CORS is configured correctly

## Development Tips

- Use `pnpm prisma studio` to inspect database
- Check `logs/` directory for application logs
- Monitor Docker logs: `docker-compose logs -f`
- Use Postman collection (when available) for API testing

---

**Installation complete!** 🎉

You now have a fully functional local development environment.
