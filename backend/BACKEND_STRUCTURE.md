# Backend Module Structure Guide

This document outlines the complete backend architecture with all modules, services, controllers, and their responsibilities.

## Module Organization

```
src/
├── common/               # Shared utilities
│   ├── prisma/          # Database service
│   ├── logger/          # Winston logger
│   ├── metrics/         # Prometheus metrics
│   └── filters/         # Exception filters
├── config/              # Configuration
│   └── validation.schema.ts
├── modules/             # Feature modules
│   ├── auth/           # Authentication & authorization
│   ├── users/          # User management
│   ├── market/         # Market data & prices
│   ├── trading/        # Simulated trading engine
│   ├── contracts/      # Forward contract management
│   ├── blockchain/     # Web3 integration
│   ├── notifications/  # Real-time notifications
│   ├── ai/             # AI predictions integration
│   ├── admin/          # Admin operations
│   └── health/         # Health checks
├── app.module.ts
└── main.ts
```

## Auth Module (`modules/auth/`)

**Purpose**: Handle user registration, login, JWT tokens, and authorization

### Files:
- `auth.module.ts` - Module definition
- `auth.controller.ts` - Auth endpoints
- `auth.service.ts` - Business logic
- `strategies/jwt.strategy.ts` - JWT validation
- `strategies/local.strategy.ts` - Local auth
- `guards/jwt-auth.guard.ts` - JWT guard
- `guards/roles.guard.ts` - RBAC guard
- `decorators/public.decorator.ts` - Public route marker
- `decorators/roles.decorator.ts` - Required roles marker
- `dto/register.dto.ts` - Registration payload
- `dto/login.dto.ts` - Login payload

### Key Endpoints:
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

## Users Module (`modules/users/`)

**Purpose**: User profile management, KYC, wallet management

### Files:
- `users.module.ts`
- `users.controller.ts`
- `users.service.ts`
- `dto/update-user.dto.ts`
- `dto/update-profile.dto.ts`

### Key Endpoints:
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `GET /users/me/profile` - Get current user profile
- `PATCH /users/me/wallet` - Update wallet address
- `GET /users/:id/farms` - Get user's farms

## Market Module (`modules/market/`)

**Purpose**: Price data, historical data, commodity information

### Files:
- `market.module.ts`
- `market.controller.ts`
- `market.service.ts`
- `market.gateway.ts` - WebSocket for real-time prices
- `dto/price-query.dto.ts`

### Key Endpoints:
- `GET /market/prices` - Get current prices
- `GET /market/price-history` - Historical prices
- `GET /market/commodities` - Supported commodities
- `WS /market` - Real-time price updates

### WebSocket Events:
- `price_update` - Price tick update
- `market_summary` - Daily summary

## Trading Module (`modules/trading/`)

**Purpose**: Simulated order matching, trade execution

### Files:
- `trading.module.ts`
- `trading.controller.ts`
- `trading.service.ts`
- `order-matching.service.ts` - Order matching logic
- `dto/create-order.dto.ts`
- `dto/cancel-order.dto.ts`

### Key Endpoints:
- `POST /trading/orders` - Create order
- `GET /trading/orders` - List orders
- `GET /trading/orders/:id` - Get order details
- `DELETE /trading/orders/:id` - Cancel order
- `GET /trading/trades` - List trades
- `GET /trading/orderbook` - Get order book

### Order Matching Logic:
1. Queue orders by price-time priority
2. Match buy/sell orders
3. Execute trades
4. Update order statuses
5. Publish trade events

## Contracts Module (`modules/contracts/`)

**Purpose**: Forward contract lifecycle management

### Files:
- `contracts.module.ts`
- `contracts.controller.ts`
- `contracts.service.ts`
- `dto/create-contract.dto.ts`
- `dto/sign-contract.dto.ts`

### Key Endpoints:
- `POST /contracts` - Create contract
- `GET /contracts` - List contracts
- `GET /contracts/:id` - Get contract
- `POST /contracts/:id/sign` - Sign contract
- `POST /contracts/:id/publish-ipfs` - Publish to IPFS
- `POST /contracts/:id/settle` - Settle contract
- `DELETE /contracts/:id` - Cancel contract

### Contract Lifecycle:
1. **Draft** - Created but not signed
2. **Pending Signature** - Awaiting counterparty
3. **Signed** - Both parties signed
4. **Active** - Published on blockchain
5. **Settled** - Delivery completed
6. **Cancelled** - Terminated early

## Blockchain Module (`modules/blockchain/`)

**Purpose**: Web3 integration, smart contract interaction, IPFS

### Files:
- `blockchain.module.ts`
- `blockchain.service.ts`
- `web3.service.ts` - ethers.js wrapper
- `ipfs.service.ts` - IPFS operations
- `contract-registry.service.ts` - Smart contract calls

### Key Operations:
- Deploy contracts to blockchain
- Sign transactions
- Upload to IPFS
- Retrieve from IPFS
- Monitor blockchain events
- Gas estimation

## AI Module (`modules/ai/`)

**Purpose**: Integration with AI prediction service

### Files:
- `ai.module.ts`
- `ai.controller.ts`
- `ai.service.ts`
- `dto/forecast-query.dto.ts`

### Key Endpoints:
- `GET /ai/forecast` - Get price forecast
- `POST /ai/retrain` - Trigger model retraining
- `GET /ai/explain` - Get forecast explanation
- `GET /ai/accuracy` - Model accuracy metrics

## Notifications Module (`modules/notifications/`)

**Purpose**: Real-time user notifications via WebSocket

### Files:
- `notifications.module.ts`
- `notifications.controller.ts`
- `notifications.service.ts`
- `notifications.gateway.ts` - WebSocket

### Key Endpoints:
- `GET /notifications` - List notifications
- `PATCH /notifications/:id/read` - Mark as read
- `DELETE /notifications/:id` - Delete notification
- `WS /notifications` - Real-time notifications

### Notification Types:
- Price alerts
- Contract events
- Trade executions
- KYC updates
- System announcements

## Admin Module (`modules/admin/`)

**Purpose**: Administrative operations, statistics, user management

### Files:
- `admin.module.ts`
- `admin.controller.ts`
- `admin.service.ts`
- `guards/admin.guard.ts`

### Key Endpoints:
- `GET /admin/statistics` - Platform statistics
- `GET /admin/users` - List all users
- `PATCH /admin/users/:id/status` - Update user status
- `GET /admin/audit-logs` - Audit logs
- `POST /admin/system-config` - Update config

## Health Module (`modules/health/`)

**Purpose**: Service health checks for monitoring

### Files:
- `health.module.ts`
- `health.controller.ts`

### Key Endpoints:
- `GET /healthz` - Health check
- `GET /readyz` - Readiness check
- `GET /livez` - Liveness check

### Health Checks:
- Database connectivity
- Redis connectivity
- External services (AI, blockchain)
- Disk space
- Memory usage

## Common Services

### Prisma Service
- Database connection management
- Transaction handling
- Query optimization

### Logger Service
- Structured JSON logging
- Log rotation
- Log levels: error, warn, info, debug

### Metrics Service
- Prometheus metrics export
- Custom application metrics
- Request duration tracking
- Error rate monitoring

## Security Implementations

### Authentication
- Argon2 password hashing
- JWT with RS256 signing
- Refresh token rotation
- Session management

### Authorization
- Role-based access control (RBAC)
- Resource-level permissions
- Admin-only endpoints

### Input Validation
- class-validator DTOs
- Whitelist mode
- Type transformation

### Rate Limiting
- Per-IP rate limits
- Per-user rate limits
- Configurable thresholds

### CORS
- Configurable origins
- Credentials support

### Headers
- Helmet security headers
- HSTS
- CSP
- X-Frame-Options

## Error Handling

### Global Exception Filter
- Consistent error format
- Logging integration
- Status code mapping
- Stack traces in development

### Custom Exceptions
- BadRequestException
- NotFoundException
- UnauthorizedException
- ForbiddenException
- ConflictException

## Testing Strategy

### Unit Tests
- Service layer business logic
- Utility functions
- Data transformations

### Integration Tests
- API endpoint testing
- Database operations
- External service mocking

### E2E Tests
- Complete user flows
- Authentication flows
- Contract lifecycle
- Trading scenarios

## Database Best Practices

### Prisma Optimizations
- Connection pooling
- Query batching
- Relation loading strategies
- Index utilization

### Migrations
- Version controlled
- Automated in CI/CD
- Rollback support

### Seeding
- Development data
- Test fixtures
- Demo accounts

## Caching Strategy

### Redis Caching
- Price data (1-minute TTL)
- User profiles (5-minute TTL)
- Market summaries (30-second TTL)
- API responses (varies)

### Cache Invalidation
- Time-based expiration
- Event-based invalidation
- Manual purge endpoints

## Background Jobs (BullMQ)

### Job Types
- Order matching (continuous)
- Price data ingestion (hourly)
- Contract settlement (scheduled)
- Model retraining (weekly)
- Email notifications (queue)
- Report generation (on-demand)

### Job Configuration
- Retry policies
- Backoff strategies
- Priority levels
- Concurrency limits

## WebSocket Implementation

### Socket.IO Namespaces
- `/market` - Price updates
- `/user` - Personal notifications
- `/admin` - Admin-only events

### Event Emission
- Server → Client broadcasts
- Client → Server acknowledgments
- Room-based messaging

### Authentication
- JWT token in handshake
- Socket middleware
- Reconnection handling

## Deployment Considerations

### Environment Variables
- All secrets in .env
- Validation on startup
- Defaults for development

### Process Management
- Graceful shutdown
- Signal handling
- Health check integration

### Logging
- Structured JSON logs
- Log aggregation ready
- Error tracking (Sentry)

### Monitoring
- Prometheus metrics
- Custom dashboards
- Alert rules

## Performance Optimization

### Database
- Query optimization
- Index strategy
- Connection pooling
- Read replicas (future)

### Caching
- Multi-layer caching
- Cache warming
- Intelligent invalidation

### API
- Response compression
- Pagination
- Lazy loading
- Field selection

## API Documentation

### Swagger/OpenAPI
- Auto-generated from decorators
- Interactive UI at `/docs`
- Request/response examples
- Authentication flows

### Postman Collection
- All endpoints
- Environment variables
- Example requests
- Test scripts
