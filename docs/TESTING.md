# Testing Documentation

## Overview

The HPOPRM platform includes comprehensive test coverage across all layers of the application to ensure reliability, correctness, and maintainability.

## Test Strategy

### Test Pyramid
```
                    /\
                   /  \
                  / E2E \           (Basic smoke tests)
                 /______\
                /        \
               / Integration \      (API endpoints, DB)
              /______________\
             /                \
            /   Unit Tests     \   (Business logic, services)
           /____________________\
```

## Backend Tests

### Unit Tests

Located in `backend/src/modules/*/` alongside source files (`.spec.ts` files).

**Coverage:**
- **AuthService** (`auth/auth.service.spec.ts`)
  - User registration with duplicate email detection
  - Login with valid/invalid credentials
  - Inactive user rejection
  - Token refresh flow
  - User validation

- **MarketService** (`market/market.service.spec.ts`)
  - Price history retrieval by commodity and date range
  - Current price fetching with error handling
  - Forecast data retrieval
  - Market statistics aggregation (avg, min, max prices)

- **TradingService** (`trading/trading.service.spec.ts`)
  - Order creation (buy/sell, simulated)
  - Order validation (quantity, price)
  - Order retrieval by ID
  - User order listing with filtering
  - Order cancellation with state validation
  - Trade history

- **ContractsService** (`contracts/contracts.service.spec.ts`)
  - Forward contract creation with validation
  - Contract signing (buyer/seller)
  - Dual-signature completion detection
  - IPFS publishing with status checks
  - User contracts listing
  - Contract settlement workflow

- **UsersService** (`users/users.service.spec.ts`)
  - User lookup by ID
  - Profile updates
  - Farm management (add, list)
  - KYC verification flow
  - Farmer role enforcement
  - Pagination for user listings

**Running Unit Tests:**
```bash
cd backend
npm test                    # Run all tests
npm test -- --coverage      # With coverage report
npm test -- auth.service    # Run specific test suite
npm test -- --watch         # Watch mode
```

**Test Patterns:**
- Mock `PrismaService` with Jest for database isolation
- Mock external services (BlockchainService, JwtService)
- Test success paths and error conditions
- Validate exceptions (NotFoundException, BadRequestException, etc.)
- Check method calls with `expect(...).toHaveBeenCalledWith(...)`

### Integration/E2E Tests

Located in `backend/test/`.

**Coverage:**
- **Health Check** (`health.e2e-spec.ts`)
  - GET `/healthz` returns 200 with `{ status: 'ok' }`

**Running E2E Tests:**
```bash
cd backend
npm run test:e2e
```

**Test Setup:**
- Uses full `AppModule` bootstrap
- In-memory test database (or testcontainers for isolated postgres)
- Supertest for HTTP assertions
- Clean DB state before/after tests

**Expand E2E Coverage (Future):**
- Full auth flow (register → login → access protected route)
- Create order → match trade → verify trade record
- Contract lifecycle: create → sign (both parties) → publish IPFS → settle
- WebSocket connection and message assertions

## Frontend Tests

### Unit Tests

Located in `frontend/src/__tests__/` and colocated with components.

**Coverage:**
- **Landing Page** (`landing.smoke.test.tsx`)
  - Renders headline "Oilseed Hedging Platform"

**Running Frontend Tests:**
```bash
cd frontend
npm test              # Run Vitest tests
npm test -- --ui      # Vitest UI mode
npm test -- --coverage
```

**Test Setup:**
- Vitest with jsdom environment
- React Testing Library for component testing
- `@testing-library/jest-dom` matchers
- Setup file: `src/test/setup.ts`

**Expand Frontend Coverage (Future):**
- Test user login/logout flow
- Market page: render price chart with mock data
- Trading page: order form validation
- Contract signing modal: signature submission
- Notification center: mark as read
- i18n language switching

## Smart Contract Tests

Located in `contracts/test/`.

**Coverage:**
- `ForwardContractRegistry.test.ts` (to be expanded)
  - Contract creation with valid parameters
  - Buyer and seller signature flow
  - Settlement after delivery date
  - Cancellation logic
  - Event emissions
  - Access control (only parties can sign)

**Running Contract Tests:**
```bash
cd contracts
npx hardhat test
npx hardhat test --network hardhat
npx hardhat coverage    # Solidity coverage
```

**Test Patterns:**
- Use Hardhat's local blockchain (ephemeral state)
- Deploy contract fresh per test
- Use `ethers.getSigners()` for test accounts
- Validate events with `expect(tx).to.emit(...)`
- Check revert conditions with `expect(...).to.be.revertedWith(...)`

## Worker Tests

The worker service (`worker/src/index.ts`) includes deterministic matching logic.

**Manual Testing:**
```bash
cd worker
WORKER_PRODUCER=true npm run dev
# Watch logs for matching results
```

**Future Unit Tests:**
- `matchOrders()` function with various order book scenarios
- `forecastPrices()` output validation
- BullMQ job processing (mocked Redis)

## AI Service Tests

The AI predictor service (`ai/predictor_service/src/server.ts`) provides forecasts.

**Manual Testing:**
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"commodity":"soybean","history":[5500,5520,5540,5560,5580,5600,5620,5640,5660,5680],"horizonDays":7}'
```

**Future Unit Tests:**
- Validate forecast response shape (timestamp, price, conf_low, conf_high)
- Test input validation (Zod schema errors)
- Stub OpenAI calls for `/explain` endpoint

## Test Coverage Goals

| Module | Current Coverage | Target |
|--------|------------------|--------|
| Backend Services | ~70% | 85%+ |
| Backend E2E | 1 endpoint | 10+ critical flows |
| Frontend Components | 1 smoke test | 60%+ |
| Smart Contracts | Placeholder | 90%+ (critical paths) |
| Worker | Manual | 70%+ |
| AI Service | Manual | 60%+ |

## CI/CD Test Execution

**GitHub Actions CI Pipeline** (`.github/workflows/ci.yml`):
1. **Backend Tests**: Runs Jest with Postgres and Redis services
2. **Frontend Tests**: Runs Vitest in CI mode
3. **Contract Tests**: Hardhat test + coverage report
4. **Build Validation**: Ensures all services compile

**Passing Criteria:**
- All unit tests pass
- E2E tests pass
- Code coverage thresholds met (configured in jest.config.js)
- No linting errors

## Running All Tests Locally

From monorepo root:
```bash
# Install dependencies
npm install           # or pnpm install

# Run all tests
npm run test          # Runs backend, frontend, contracts tests

# Run individual test suites
npm run test:backend
npm run test:frontend
npm run test:contracts

# With coverage
npm run test:backend -- --coverage
```

## Test Data

**Seed Data** (`backend/prisma/seed.ts`):
- Demo accounts for all roles (farmer, fpo_admin, market_maker, regulator, admin)
- 2 FPOs with farms
- 180 days of historical price data for soybean and mustard
- Sample orders, contracts, notifications
- All passwords: `Demo@123`

**Test Accounts:**
- Farmer: `farmer@demo.com` / `Demo@123`
- FPO Admin: `fpo@demo.com` / `Demo@123`
- Market Maker: `market@demo.com` / `Demo@123`
- Regulator: `regulator@demo.com` / `Demo@123`
- Admin: `admin@demo.com` / `Demo@123`

## Best Practices

1. **Isolation**: Each test should be independent (no shared state)
2. **Mocking**: Mock external services, use in-memory DB or testcontainers
3. **Assertions**: Use descriptive matchers (`toHaveProperty`, `toThrow`, `toEqual`)
4. **Setup/Teardown**: Clean state with `beforeEach`/`afterEach`
5. **Coverage**: Aim for >80% on critical business logic
6. **Speed**: Keep unit tests fast (<50ms each); e2e can be slower
7. **Documentation**: Add test descriptions that read like specifications

## Debugging Tests

**Jest/Vitest Debug:**
```bash
# Backend (Jest)
node --inspect-brk node_modules/.bin/jest --runInBand
# Connect Chrome DevTools to the debugger

# Frontend (Vitest)
npm test -- --inspect-brk
```

**Test Output:**
- Use `--verbose` for detailed test output
- Check coverage reports in `coverage/` directory (HTML report: `coverage/lcov-report/index.html`)

## Next Steps for Test Expansion

1. **Backend**:
   - Add e2e tests for auth flow (register → login → refresh)
   - Test trading flow (create orders → matching → trade confirmation)
   - Contract lifecycle e2e (create → dual sign → publish IPFS → settle)
   - WebSocket event tests

2. **Frontend**:
   - Test all page components with RTL
   - Form validation tests (login, register, order creation)
   - State management tests (Zustand stores)
   - i18n translation tests

3. **Contracts**:
   - Full ForwardContractRegistry test suite
   - Gas optimization tests
   - Security tests (reentrancy, access control)

4. **Worker**:
   - Unit tests for matching algorithm with edge cases
   - Job queue processing tests

5. **AI Service**:
   - Forecast endpoint validation
   - OpenAI adapter mocking
   - Error handling tests

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Hardhat Testing](https://hardhat.org/tutorial/testing-contracts)
- [Supertest](https://github.com/visionmedia/supertest)

---

**Last Updated**: January 2024  
**Test Framework Versions**: Jest 29.7, Vitest 1.0, Hardhat 2.19
