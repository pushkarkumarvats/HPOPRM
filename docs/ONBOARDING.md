# Developer Onboarding Guide

## Welcome to the Oilseed Hedging Platform Team! 🎉

This guide will help you get up and running with the platform development environment.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Repository Setup](#repository-setup)
3. [Development Environment](#development-environment)
4. [Project Structure](#project-structure)
5. [Development Workflow](#development-workflow)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)
9. [Resources](#resources)

---

## Prerequisites

### Required Software
- **Node.js**: 18.x or higher ([Download](https://nodejs.org/))
- **npm**: 9.x or higher (comes with Node.js)
- **Docker Desktop**: For local services ([Download](https://www.docker.com/products/docker-desktop))
- **Git**: For version control ([Download](https://git-scm.com/))
- **VS Code** (recommended): With recommended extensions

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "ms-azuretools.vscode-docker",
    "github.copilot",
    "eamodio.gitlens",
    "christian-kohler.path-intellisense",
    "usernamehw.errorlens",
    "bradlc.vscode-tailwindcss"
  ]
}
```

### Accounts Needed
- **GitHub**: For code repository access
- **Render**: For deployment (optional for backend devs)
- **Infura/Alchemy**: For blockchain RPC (optional)
- **OpenAI**: For AI features (optional)

---

## Repository Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/oilseed-hedging-platform.git
cd oilseed-hedging-platform
```

### 2. Install Dependencies
```bash
# Install all dependencies (root, backend, frontend, contracts)
npm run install:all

# Or install individually
npm install              # Root dependencies
cd backend && npm install
cd ../frontend && npm install
cd ../contracts && npm install
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your local configuration
# At minimum, ensure these are set:
# - DATABASE_URL
# - REDIS_URL
# - JWT_SECRET
# - JWT_REFRESH_SECRET
```

**Windows Users**: Use `setup_dev.bat` instead of `.sh` scripts

### 4. Start Docker Services
```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Verify services are running
docker-compose ps
```

### 5. Database Setup
```bash
cd backend

# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Seed database with test data
npm run db:seed

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 6. Smart Contract Setup
```bash
cd contracts

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Start local Hardhat node (optional)
npx hardhat node
```

---

## Development Environment

### Starting the Development Servers

#### Option 1: Start All Services
```bash
npm run dev
```
This starts:
- Backend API on `http://localhost:3000`
- Frontend on `http://localhost:5173`
- WebSocket on `ws://localhost:3001`

#### Option 2: Start Services Individually
```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend

# Terminal 3: Worker (optional)
npm run dev:worker

# Terminal 4: Local blockchain (optional)
npm run dev:hardhat
```

### Accessing the Application

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | React application |
| Backend API | http://localhost:3000 | NestJS REST API |
| API Docs | http://localhost:3000/docs | Swagger UI |
| Prisma Studio | http://localhost:5555 | Database GUI |
| Hardhat Node | http://localhost:8545 | Local blockchain |

### Default Test Accounts

After seeding, you can use these accounts:

```
Farmer Account:
Email: farmer@test.com
Password: Test@1234
Role: farmer

FPO Admin Account:
Email: fpo@test.com
Password: Test@1234
Role: fpo_admin

Admin Account:
Email: admin@test.com
Password: Admin@1234
Role: super_admin
```

---

## Project Structure

```
oilseed-hedging-platform/
├── .github/                  # GitHub Actions workflows
│   └── workflows/
│       ├── ci.yml           # Continuous Integration
│       └── deploy.yml       # Deployment automation
│
├── backend/                  # NestJS Backend
│   ├── src/
│   │   ├── modules/         # Feature modules
│   │   │   ├── auth/        # Authentication & authorization
│   │   │   ├── users/       # User management
│   │   │   ├── market/      # Market data
│   │   │   ├── trading/     # Trading engine
│   │   │   ├── contracts/   # Contract management
│   │   │   ├── blockchain/  # Blockchain integration
│   │   │   ├── ai/          # AI predictions
│   │   │   └── notifications/ # Real-time notifications
│   │   ├── common/          # Shared utilities
│   │   │   ├── filters/     # Exception filters
│   │   │   ├── guards/      # Auth guards
│   │   │   ├── interceptors/ # Request/response interceptors
│   │   │   └── decorators/  # Custom decorators
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   ├── seed.ts          # Seed data
│   │   └── migrations/      # Database migrations
│   ├── test/                # Tests
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                 # React Frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── store/           # State management (Zustand)
│   │   ├── lib/             # Utilities
│   │   ├── i18n/            # Internationalization
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/              # Static assets
│   ├── Dockerfile
│   └── package.json
│
├── contracts/                # Smart Contracts
│   ├── contracts/           # Solidity contracts
│   │   └── ForwardContractRegistry.sol
│   ├── scripts/             # Deployment scripts
│   ├── test/                # Contract tests
│   ├── hardhat.config.ts
│   └── package.json
│
├── docs/                     # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── SECURITY.md
│   ├── ONBOARDING.md
│   └── DEPLOYMENT.md
│
├── scripts/                  # Utility scripts
│   ├── setup_dev.sh         # Development setup
│   └── deploy_render.sh     # Render deployment
│
├── docker-compose.yml       # Local development services
├── render.yaml              # Render deployment config
├── .env.example             # Environment variables template
└── README.md                # Project overview
```

---

## Development Workflow

### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes
Follow the coding standards:
- **TypeScript**: Use strict typing
- **Naming**: camelCase for variables, PascalCase for classes
- **Comments**: JSDoc for public methods
- **Commits**: Conventional commits format

Example commit message:
```
feat(auth): add email verification

- Add email verification endpoint
- Send verification email on registration
- Update user status after verification

Closes #123
```

### 3. Run Tests
```bash
# Run all tests
npm test

# Run specific tests
cd backend && npm run test:watch
cd frontend && npm run test:watch
cd contracts && npx hardhat test
```

### 4. Lint and Format
```bash
# Lint code
npm run lint

# Format code
npm run format

# Fix linting issues
npm run lint:fix
```

### 5. Commit and Push
```bash
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
```

### 6. Create Pull Request
- Go to GitHub repository
- Create Pull Request from your branch to `develop`
- Fill in PR template
- Request review from team members
- Address review comments
- Merge after approval

### Git Workflow
```
main (production)
  ↑
develop (staging)
  ↑
feature/*, bugfix/*, hotfix/*
```

---

## Testing

### Unit Tests

#### Backend (Jest)
```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:cov

# Run specific test file
npm test -- users.service.spec.ts

# Watch mode
npm run test:watch
```

#### Frontend (Jest + React Testing Library)
```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Integration Tests
```bash
cd backend

# Run integration tests
npm run test:e2e
```

### Smart Contract Tests
```bash
cd contracts

# Run all tests
npx hardhat test

# Run specific test
npx hardhat test test/ForwardContractRegistry.test.ts

# Run with coverage
npx hardhat coverage
```

### E2E Tests (Playwright)
```bash
cd frontend

# Install Playwright browsers
npx playwright install

# Run E2E tests
npm run test:e2e

# Run in UI mode
npm run test:e2e:ui
```

### Manual Testing
1. Start all services: `npm run dev`
2. Open frontend: http://localhost:5173
3. Login with test account
4. Test feature flows

---

## Deployment

### Deploying to Render

#### Prerequisites
1. Render account created
2. GitHub repository connected to Render
3. Render API key obtained

#### Option 1: Automatic Deployment (via render.yaml)
1. Push to `main` branch
2. GitHub Actions triggers deployment
3. Render automatically deploys services

#### Option 2: Manual Deployment
```bash
# Set your Render API key
export RENDER_API_KEY=your_api_key

# Run deployment script
bash scripts/deploy_render.sh
```

#### Option 3: Render Dashboard
Follow the step-by-step guide in `docs/DEPLOYMENT.md`

### Verifying Deployment
```bash
# Check backend health
curl https://your-backend.onrender.com/healthz

# Check API docs
open https://your-backend.onrender.com/docs

# Check frontend
open https://your-frontend.onrender.com
```

---

## Troubleshooting

### Common Issues

#### 1. "Cannot connect to database"
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres

# Check DATABASE_URL in .env
echo $DATABASE_URL
```

#### 2. "Prisma Client not generated"
```bash
cd backend
npx prisma generate
```

#### 3. "Port already in use"
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

#### 4. "Docker containers not starting"
```bash
# Check Docker Desktop is running
docker ps

# Remove old containers
docker-compose down
docker-compose up -d
```

#### 5. "npm install fails"
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

#### 6. "Smart contract compilation fails"
```bash
cd contracts

# Clear cache
npx hardhat clean

# Reinstall dependencies
rm -rf node_modules
npm install

# Recompile
npx hardhat compile
```

### Getting Help

1. **Check Documentation**: Read relevant docs in `/docs`
2. **Search Issues**: Look for similar issues on GitHub
3. **Ask Team**: Post in team chat/Slack
4. **Create Issue**: If it's a bug, create a GitHub issue

---

## Resources

### Documentation
- [Architecture](./ARCHITECTURE.md)
- [API Documentation](./API.md)
- [Security Guide](./SECURITY.md)
- [Deployment Guide](./DEPLOYMENT.md)

### Technology Docs
- [NestJS](https://docs.nestjs.com/)
- [React](https://react.dev/)
- [Prisma](https://www.prisma.io/docs)
- [Hardhat](https://hardhat.org/docs)
- [TailwindCSS](https://tailwindcss.com/docs)

### Team Resources
- **Code Style Guide**: [CONTRIBUTING.md](../CONTRIBUTING.md)
- **Slack Channel**: #oilseed-platform
- **Team Calendar**: Calendar Link
- **Design Files**: Figma Link

### Useful Commands Cheatsheet

```bash
# Development
npm run dev                   # Start all services
npm run dev:backend          # Start backend only
npm run dev:frontend         # Start frontend only

# Database
npx prisma studio            # Open database GUI
npx prisma migrate dev       # Create migration
npm run db:seed              # Seed database

# Testing
npm test                     # Run all tests
npm run test:cov            # Run with coverage
npm run lint                 # Lint code
npm run format               # Format code

# Docker
docker-compose up -d         # Start services
docker-compose down          # Stop services
docker-compose logs -f       # View logs

# Build
npm run build                # Build all projects
npm run build:backend        # Build backend
npm run build:frontend       # Build frontend

# Deployment
npm run deploy:render        # Deploy to Render
```

---

## Next Steps

1. ✅ Complete repository setup
2. ✅ Start development environment
3. ✅ Read architecture documentation
4. ✅ Run through user flows manually
5. ✅ Pick your first task from backlog
6. ✅ Attend team standup
7. ✅ Join team chat
8. ✅ Meet with your mentor

---

## Welcome Aboard! 🚀

You're now ready to contribute to the Oilseed Hedging Platform. If you have any questions, don't hesitate to ask the team!

Happy coding! 💻
