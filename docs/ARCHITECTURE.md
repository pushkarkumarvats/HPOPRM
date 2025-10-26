# Architecture Documentation

## Oilseed Hedging Platform - System Architecture

### Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Data Flow](#data-flow)
5. [Security Architecture](#security-architecture)
6. [Deployment Architecture](#deployment-architecture)
7. [Scalability Considerations](#scalability-considerations)

---

## Overview

The Oilseed Hedging Platform is a full-stack application designed to provide farmers and FPOs (Farmer Producer Organizations) with tools for price risk management through forward contracts, AI-driven price forecasting, and blockchain-secured e-contracts.

### Key Features
- **Simulated Trading Engine**: Order matching and settlement simulation
- **AI Price Forecasting**: Machine learning-based price predictions
- **Blockchain E-Contracts**: Immutable contract storage on Polygon
- **Real-time Market Data**: Live price feeds and alerts
- **Multi-language Support**: English and Hinglish UI
- **Role-based Access Control**: Farmer, FPO Admin, Market Maker, Regulator, Super Admin

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│   ┌──────────────┐         ┌──────────────┐                     │
│   │   Web App    │         │  Mobile Web  │                     │
│   │ React + Vite │         │  (Responsive)│                     │
│   └──────┬───────┘         └──────┬───────┘                     │
│          │                        │                              │
│          └────────────┬───────────┘                              │
│                       │                                          │
└───────────────────────┼──────────────────────────────────────────┘
                        │
                        │ HTTPS / WSS
                        │
┌───────────────────────┼──────────────────────────────────────────┐
│                  API GATEWAY LAYER                               │
├───────────────────────┼──────────────────────────────────────────┤
│                       │                                          │
│   ┌───────────────────▼─────────────────┐                       │
│   │      NestJS Backend API             │                       │
│   │  ┌──────────┐  ┌────────────────┐   │                       │
│   │  │   REST   │  │   WebSocket    │   │                       │
│   │  │   API    │  │   (Socket.IO)  │   │                       │
│   │  └──────────┘  └────────────────┘   │                       │
│   │                                      │                       │
│   │  Modules:                            │                       │
│   │  - Auth & Users                      │                       │
│   │  - Market Data                       │                       │
│   │  - Trading Engine                    │                       │
│   │  - Contracts                         │                       │
│   │  - Blockchain Integration            │                       │
│   │  - AI Predictions                    │                       │
│   │  - Notifications                     │                       │
│   │  - Admin                             │                       │
│   └──────────────────────────────────────┘                       │
│                       │                                          │
└───────────────────────┼──────────────────────────────────────────┘
                        │
            ┌───────────┼───────────┐
            │           │           │
┌───────────▼────┐  ┌──▼────────┐  ├──────────────┐
│                │  │           │  │              │
│  WORKER LAYER  │  │  CACHE    │  │  DATABASE    │
│                │  │  LAYER    │  │    LAYER     │
├────────────────┤  ├───────────┤  ├──────────────┤
│                │  │           │  │              │
│ ┌────────────┐ │  │  Redis    │  │ PostgreSQL   │
│ │  BullMQ    │ │  │           │  │              │
│ │  Workers   │ │  │ - Cache   │  │ - Users      │
│ │            │ │  │ - Pub/Sub │  │ - Contracts  │
│ │ Jobs:      │ │  │ - Session │  │ - Orders     │
│ │ - Matching │ │  │ - Queue   │  │ - Trades     │
│ │ - Settlement│ │  └───────────┘  │ - Prices     │
│ │ - Forecast │ │                  │ - Farms      │
│ │ - Alerts   │ │                  │ - FPOs       │
│ └────────────┘ │                  │              │
└────────────────┘                  │ TimescaleDB  │
                                    │ (Time-series)│
                                    └──────────────┘
            │
            │
┌───────────▼─────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES LAYER                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Blockchain  │  │     IPFS     │  │  AI Service  │          │
│  │   (Polygon)  │  │   (Pinata/   │  │  (OpenAI/    │          │
│  │              │  │  Web3.Storage)│  │   Custom)    │          │
│  │ - Contract   │  │              │  │              │          │
│  │   Registry   │  │ - Document   │  │ - Forecasting│          │
│  │ - Escrow     │  │   Storage    │  │ - Sentiment  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Payment    │  │  Market Data │  │  Monitoring  │          │
│  │  Providers   │  │   Sources    │  │   (Sentry)   │          │
│  │ (Razorpay/   │  │   (NCDEX)    │  │              │          │
│  │   Stripe)    │  │              │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: TailwindCSS 3
- **State Management**: Zustand
- **HTTP Client**: Axios
- **WebSocket**: Socket.IO Client
- **Charts**: Recharts
- **i18n**: i18next (English + Hinglish)
- **Form Handling**: React Hook Form + Zod
- **Testing**: Jest + React Testing Library + Playwright

### Backend
- **Framework**: NestJS 10 (Node.js + TypeScript)
- **ORM**: Prisma 5
- **Database**: PostgreSQL 15 with TimescaleDB
- **Cache/Queue**: Redis 7 + BullMQ
- **WebSocket**: Socket.IO
- **Authentication**: JWT + Auth0
- **Validation**: class-validator
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest

### Blockchain
- **Smart Contracts**: Solidity 0.8+
- **Development Framework**: Hardhat
- **Network**: Polygon Mumbai (testnet)
- **Library**: ethers.js v6
- **Storage**: IPFS (Pinata/Web3.Storage)

### AI/ML
- **Language**: Python 3.11
- **Framework**: FastAPI / Express
- **Models**: Prophet / LSTM (TensorFlow)
- **LLM Integration**: OpenAI API

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Hosting**: Render
- **Monitoring**: Sentry + Prometheus
- **Logging**: Winston (JSON structured logs)

---

## Data Flow

### 1. User Authentication Flow
```
User → Frontend → Backend API
                   ↓
              JWT Generation
                   ↓
            Response with Token
                   ↓
      Frontend stores in memory/secure storage
```

### 2. Market Data Flow
```
External Source (NCDEX/CSV) → Cron Job → Database
                                           ↓
                                      Redis Cache
                                           ↓
                                    WebSocket → Frontend
```

### 3. Trading Flow
```
User places order → Backend API → Validation
                                      ↓
                                 Store in DB
                                      ↓
                              Add to Match Queue
                                      ↓
                              Worker processes
                                      ↓
                              Match Algorithm
                                      ↓
                            Create Trade Record
                                      ↓
                          Notify via WebSocket
```

### 4. Contract Creation Flow
```
User creates contract → Backend API → Validation
                                         ↓
                                   Store in DB
                                         ↓
                                Generate PDF/JSON
                                         ↓
                                Upload to IPFS
                                         ↓
                          Submit to Blockchain
                                         ↓
                           Store TX hash in DB
                                         ↓
                          Notify participants
```

### 5. AI Prediction Flow
```
Scheduled Job → Fetch historical prices
                        ↓
                  AI Service API
                        ↓
                Generate forecast
                        ↓
                  Store in DB
                        ↓
              Available via API
```

---

## Security Architecture

### Authentication & Authorization
- **JWT-based**: RS256 algorithm with short-lived access tokens
- **Refresh Tokens**: Long-lived, stored in DB with rotation
- **Role-Based Access Control (RBAC)**: 
  - Farmer
  - FPO Admin
  - Market Maker
  - Regulator
  - Super Admin

### Data Security
- **Encryption at Rest**: Sensitive columns encrypted with AES-256-GCM
- **Encryption in Transit**: TLS 1.3 enforced
- **Password Hashing**: Argon2id (memory-hard function)
- **API Rate Limiting**: Per-IP and per-account limits
- **Input Validation**: All inputs validated and sanitized
- **SQL Injection Prevention**: Parameterized queries via Prisma
- **XSS Prevention**: Content Security Policy (CSP) headers
- **CSRF Protection**: Token-based protection for state-changing operations

### Security Headers (via Helmet)
```typescript
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000; includeSubDomains
- Content-Security-Policy: default-src 'self'
```

### Blockchain Security
- **Private Key Management**: Never stored in code, environment variables only
- **Gas Optimization**: Efficient contract design
- **Audit Trail**: All contract interactions logged
- **Multi-signature**: Optional for high-value contracts

---

## Deployment Architecture

### Render Services Configuration

```yaml
Services:
  1. hedging-backend (Web Service)
     - Type: Docker
     - Auto-scaling: Enabled
     - Health Check: /healthz
     - Min Instances: 1
     - Max Instances: 5
     
  2. hedging-frontend (Static Site)
     - Type: Static
     - CDN: Enabled
     - Auto-deploy: On git push
     
  3. hedging-worker (Background Worker)
     - Type: Background
     - Concurrency: 5
     - Auto-scaling: Enabled
     
  4. hedging-data-ingestion (Cron Job)
     - Schedule: Every 6 hours
     - Timeout: 30 minutes
     
  5. hedging-postgres (Managed Database)
     - Type: PostgreSQL 15
     - Backup: Daily
     - Point-in-time Recovery: Enabled
     
  6. hedging-redis (Managed Redis)
     - Type: Redis 7
     - Persistence: Enabled
```

### Environment Variables Strategy
- **Development**: `.env` file (not committed)
- **Production**: Render dashboard secrets
- **CI/CD**: GitHub Secrets

### Horizontal Scaling
- **Backend API**: Multiple instances behind load balancer
- **Workers**: Scale based on queue size
- **Database**: Connection pooling (PgBouncer)
- **Redis**: Pub/Sub for cross-instance messaging

---

## Scalability Considerations

### Database Optimization
1. **Indexing Strategy**:
   - B-tree indexes on foreign keys
   - Hash indexes for equality searches
   - GiST indexes for geospatial queries (farm locations)
   - TimescaleDB hypertables for price data

2. **Query Optimization**:
   - Eager loading with Prisma includes
   - Pagination for large datasets
   - Read replicas for analytics queries

3. **Caching Strategy**:
   - L1 Cache: Application memory (short-lived)
   - L2 Cache: Redis (longer-lived)
   - Cache invalidation: Event-driven

### Performance Targets
- **API Response Time**: < 200ms (p95)
- **WebSocket Latency**: < 50ms
- **Database Query Time**: < 100ms (p95)
- **Page Load Time**: < 2s (FCP)
- **Concurrent Users**: 10,000+

### Monitoring & Observability
- **Application Metrics**: Prometheus + Grafana
- **Error Tracking**: Sentry
- **Log Aggregation**: Winston → CloudWatch/Loki
- **APM**: Distributed tracing (optional)
- **Health Checks**: Liveness and readiness probes

### Disaster Recovery
- **Database Backups**: Daily automated backups with 30-day retention
- **Point-in-time Recovery**: Up to 7 days
- **Redis Persistence**: AOF enabled
- **Blockchain**: Immutable, no backup needed
- **IPFS**: Pinned on multiple nodes

---

## Module Interactions

```
┌─────────────────────────────────────────────────────────────────┐
│                         Backend Modules                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  AuthModule ──────► UserModule                                   │
│      │                  │                                        │
│      │                  │                                        │
│      ▼                  ▼                                        │
│  MarketModule ──────► TradingModule ──────► ContractModule       │
│      │                  │                       │                │
│      │                  │                       │                │
│      ▼                  ▼                       ▼                │
│  AIModule         NotificationModule      BlockchainModule       │
│      │                  │                       │                │
│      │                  │                       │                │
│      └──────────────────┴───────────────────────┘                │
│                         │                                        │
│                         ▼                                        │
│                   PrismaModule                                   │
│                         │                                        │
│                         ▼                                        │
│                   PostgreSQL                                     │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Module Responsibilities

**AuthModule**: Authentication, authorization, JWT management  
**UserModule**: User CRUD, profile management, wallet linking  
**MarketModule**: Price feeds, market data, analytics  
**TradingModule**: Order management, matching engine, trade execution  
**ContractModule**: Contract lifecycle, e-contract generation  
**BlockchainModule**: Smart contract interaction, transaction management  
**AIModule**: Price forecasting, market sentiment, recommendations  
**NotificationModule**: Real-time alerts, email/SMS, push notifications  
**AdminModule**: Platform administration, analytics, reports  
**PrismaModule**: Database connection, ORM abstraction  

---

## API Design Principles

1. **RESTful Design**: Resource-oriented URLs
2. **Versioning**: `/api/v1/` prefix
3. **Pagination**: Cursor-based for large datasets
4. **Filtering**: Query parameters for filtering and sorting
5. **HATEOAS**: Hypermedia links in responses
6. **Error Handling**: Consistent error format with error codes
7. **Rate Limiting**: 100 requests per 15 minutes per user
8. **Idempotency**: POST endpoints support idempotency keys

---

## Conclusion

This architecture is designed for:
- **Scalability**: Horizontal scaling of all components
- **Reliability**: High availability with redundancy
- **Security**: Multiple layers of security controls
- **Performance**: Optimized for low latency and high throughput
- **Maintainability**: Modular design with clear separation of concerns
- **Extensibility**: Easy to add new features and integrations

For implementation details, see:
- [API Documentation](./API.md)
- [Security Guide](./SECURITY.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Developer Onboarding](./ONBOARDING.md)
