# Security Documentation

## Oilseed Hedging Platform - Security Guide

### Table of Contents
1. [Overview](#overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Data Security](#data-security)
4. [API Security](#api-security)
5. [Blockchain Security](#blockchain-security)
6. [Infrastructure Security](#infrastructure-security)
7. [Threat Model](#threat-model)
8. [Security Best Practices](#security-best-practices)
9. [Incident Response](#incident-response)
10. [Compliance](#compliance)

---

## Overview

The Oilseed Hedging Platform implements multiple layers of security controls to protect user data, financial transactions, and smart contracts. This document outlines the security architecture, threat mitigations, and best practices.

### Security Principles
1. **Defense in Depth**: Multiple layers of security controls
2. **Least Privilege**: Users and services have minimum required permissions
3. **Secure by Default**: Security features enabled by default
4. **Zero Trust**: Verify all requests, trust nothing
5. **Privacy by Design**: User privacy considered at every stage

---

## Authentication & Authorization

### Authentication Methods

#### 1. JWT-Based Authentication
```typescript
// Token Structure
{
  "alg": "RS256",  // RSA signature with SHA-256
  "typ": "JWT"
}
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "farmer",
  "iat": 1640000000,
  "exp": 1640000900  // 15 minutes
}
```

**Security Features**:
- RS256 algorithm (asymmetric) for token signing
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7 days) with rotation
- Refresh tokens stored in database with ability to revoke
- Token blacklist for immediate revocation

#### 2. OAuth Integration (Auth0)
- Social login support (Google, Facebook)
- Email magic links for passwordless authentication
- Multi-factor authentication (MFA) support
- Configurable via `ENABLE_OAUTH=true`

### Password Security

**Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Hashing**:
```typescript
// Using Argon2id (memory-hard, resistant to GPU cracking)
import * as argon2 from 'argon2';

const hash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,  // 64 MB
  timeCost: 3,
  parallelism: 1
});
```

**Why Argon2id?**
- Winner of Password Hashing Competition (2015)
- Resistant to GPU cracking attacks
- Resistant to side-channel attacks
- Memory-hard function

### Role-Based Access Control (RBAC)

```typescript
enum UserRole {
  farmer = 'farmer',
  fpo_admin = 'fpo_admin',
  market_maker = 'market_maker',
  regulator = 'regulator',
  super_admin = 'super_admin'
}

// Permission matrix
const permissions = {
  farmer: ['read:own_data', 'create:order', 'create:contract'],
  fpo_admin: ['read:fpo_data', 'manage:fpo_members', 'create:bulk_contracts'],
  market_maker: ['read:all_orders', 'create:liquidity'],
  regulator: ['read:all_data', 'audit:contracts'],
  super_admin: ['*'] // All permissions
};
```

**Guards Implementation**:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'regulator')
@Get('/admin/statistics')
async getStatistics() {
  // Only super_admin and regulator can access
}
```

### Session Management
- Sessions stored in Redis with expiration
- IP address and user agent tracking
- Concurrent session limits (configurable)
- Session termination on password change
- Logout invalidates refresh token

---

## Data Security

### Encryption at Rest

#### Database-Level Encryption
```typescript
// Sensitive columns encrypted with AES-256-GCM
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;

  constructor() {
    this.key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  }

  encrypt(text: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(encryptedText: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

**Encrypted Fields**:
- Wallet private keys (if stored - not recommended)
- Payment provider credentials
- API keys for external services
- Sensitive contract terms

#### File Encryption
- Uploaded documents encrypted before storage
- Encryption keys managed via KMS (Key Management Service)
- Separate keys per tenant (if multi-tenant)

### Encryption in Transit

**TLS Configuration**:
```nginx
# Minimum TLS 1.2, prefer TLS 1.3
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
ssl_prefer_server_ciphers on;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;

# HSTS Header
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

### Data Masking
- PII data masked in logs
- Sensitive fields redacted in API responses
- Admin views have partial masking (e.g., phone: +91******3210)

---

## API Security

### Input Validation

```typescript
import { IsString, IsEmail, IsStrongPassword, Length } from 'class-validator';

class RegisterDto {
  @IsString()
  @Length(2, 100)
  name: string;

  @IsEmail()
  email: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  })
  password: string;
}
```

**Validation Rules**:
- All inputs validated against schema
- Type checking enforced
- SQL injection prevention via Prisma (parameterized queries)
- NoSQL injection prevention
- XXE (XML External Entity) prevention
- Path traversal prevention

### Rate Limiting

```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 900,      // 15 minutes
      limit: 100,    // 100 requests
    }),
  ],
})
export class AppModule {}
```

**Rate Limits**:
- **Global**: 100 requests per 15 minutes per IP
- **Authentication**: 5 failed attempts per 15 minutes per IP
- **API**: 1000 requests per hour per authenticated user
- **WebSocket**: 10 connections per user

### CORS Configuration

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: 3600
});
```

### Security Headers

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true
}));
```

### CSRF Protection

```typescript
import * as csurf from 'csurf';

// CSRF protection for state-changing operations
app.use(csurf({
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  }
}));
```

### API Authentication

```http
GET /api/v1/resource
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
X-Request-ID: uuid-for-request-tracking
```

---

## Blockchain Security

### Smart Contract Security

**Security Measures**:
1. **Access Control**: Only authorized addresses can execute critical functions
2. **Reentrancy Protection**: Using OpenZeppelin's ReentrancyGuard
3. **Integer Overflow Protection**: Solidity 0.8+ has built-in checks
4. **Gas Optimization**: Efficient code to prevent DOS attacks
5. **Upgradability**: Proxy pattern for bug fixes (optional)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract ForwardContractRegistry is ReentrancyGuard, AccessControl {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    
    modifier onlyOperator() {
        require(hasRole(OPERATOR_ROLE, msg.sender), "Not operator");
        _;
    }
    
    function createContract(...) external nonReentrant onlyOperator {
        // Contract creation logic
    }
}
```

### Private Key Management

**Best Practices**:
- **Never commit private keys to version control**
- Store in environment variables or secrets manager
- Use hardware wallets for production
- Implement key rotation policy
- Use multi-signature wallets for high-value operations

```typescript
// Backend manages gas payments via relayer pattern
class BlockchainService {
  private signer: ethers.Wallet;

  constructor() {
    // Private key from secure environment variable
    this.signer = new ethers.Wallet(
      process.env.BLOCKCHAIN_PRIVATE_KEY,
      provider
    );
  }

  async createContract(data: ContractData): Promise<Transaction> {
    // Backend signs and submits transaction
    // Users don't need gas
  }
}
```

### Transaction Security
- All transactions logged for audit trail
- Transaction limits per user per day
- Anomaly detection for suspicious activity
- Gas price monitoring to prevent griefing attacks

---

## Infrastructure Security

### Network Security
- Private subnets for database and Redis
- Public subnet only for load balancer
- Security groups restrict inbound traffic
- VPN access for administrative tasks

### Container Security
```dockerfile
# Multi-stage build to minimize attack surface
FROM node:18-alpine AS builder
# ... build steps

FROM node:18-alpine
RUN apk add --no-cache dumb-init
USER node
# ... runtime configuration
```

**Best Practices**:
- Run containers as non-root user
- Minimal base images (Alpine)
- Regular image scanning for vulnerabilities
- Immutable infrastructure

### Database Security
- Connection encryption (SSL/TLS)
- Strong passwords (generated)
- Connection pooling with limits
- Regular backups with encryption
- Point-in-time recovery enabled
- Restricted network access

```typescript
// Prisma connection with SSL
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // DATABASE_URL includes ?sslmode=require
}
```

### Secrets Management
- Never commit secrets to git
- Use Render environment variables
- Rotate secrets regularly
- Use different secrets per environment
- Audit secret access logs

---

## Threat Model

### Identified Threats

#### 1. Account Takeover
**Mitigation**:
- Strong password requirements
- MFA support
- Account lockout after failed attempts
- Email notifications on suspicious activity
- Session timeout

#### 2. SQL Injection
**Mitigation**:
- Prisma ORM with parameterized queries
- Input validation and sanitization
- No raw SQL queries (or carefully reviewed)

#### 3. Cross-Site Scripting (XSS)
**Mitigation**:
- Content Security Policy headers
- React automatic escaping
- Input sanitization
- Output encoding

#### 4. Cross-Site Request Forgery (CSRF)
**Mitigation**:
- CSRF tokens for state-changing operations
- SameSite cookie attribute
- Origin header validation

#### 5. Denial of Service (DoS)
**Mitigation**:
- Rate limiting per IP and per user
- Request size limits
- Connection limits
- Cloud-based DDoS protection (Cloudflare/AWS Shield)

#### 6. Man-in-the-Middle (MitM)
**Mitigation**:
- TLS 1.3 enforced
- HSTS headers
- Certificate pinning (mobile apps)

#### 7. Insider Threats
**Mitigation**:
- Principle of least privilege
- Audit logging of all actions
- Regular access reviews
- Separation of duties

#### 8. Smart Contract Vulnerabilities
**Mitigation**:
- Professional security audits
- OpenZeppelin battle-tested contracts
- Extensive testing
- Bug bounty program
- Gradual rollout

---

## Security Best Practices

### Development
1. **Code Reviews**: All code reviewed by at least 2 developers
2. **Static Analysis**: SonarQube, ESLint security plugins
3. **Dependency Scanning**: Snyk, npm audit
4. **Secret Scanning**: GitHub secret scanning, git-secrets
5. **Pre-commit Hooks**: Lint, format, security checks

### Deployment
1. **CI/CD Security**: Signed commits, protected branches
2. **Environment Separation**: Dev, staging, production isolated
3. **Immutable Infrastructure**: Infrastructure as Code
4. **Zero Downtime Deployments**: Blue-green or rolling updates
5. **Rollback Plan**: Automated rollback on errors

### Operations
1. **Monitoring**: Real-time security alerts
2. **Log Analysis**: Centralized logging with SIEM
3. **Vulnerability Management**: Regular patching
4. **Penetration Testing**: Annual third-party pentests
5. **Incident Response Plan**: Documented procedures

---

## Incident Response

### Incident Response Plan

#### 1. Detection
- Automated alerts via Sentry
- Log monitoring via CloudWatch/Loki
- User reports

#### 2. Triage
- Assess severity (Critical, High, Medium, Low)
- Identify affected systems and users
- Assign incident response team

#### 3. Containment
- Isolate affected systems
- Block malicious IPs
- Revoke compromised credentials
- Take database snapshots

#### 4. Eradication
- Remove malware/backdoors
- Patch vulnerabilities
- Update firewall rules

#### 5. Recovery
- Restore from clean backups
- Verify system integrity
- Monitor for reinfection

#### 6. Post-Incident
- Root cause analysis
- Update security controls
- Notify affected users (if required)
- Document lessons learned

### Security Contacts
- **Security Team**: security@hedging-platform.com
- **Bug Bounty**: bugbounty@hedging-platform.com
- **Emergency Hotline**: +91-XXXX-XXXXXX

---

## Compliance

### Data Protection Regulations
- **GDPR** (if serving EU users): Right to erasure, data portability
- **Indian Data Protection Bill**: Compliance with local laws
- **PCI DSS** (if handling payments): Secure payment processing

### Audit Trail
All security-relevant events logged:
- User authentication attempts
- Authorization failures
- Contract lifecycle events
- Administrative actions
- Data access and modifications

```typescript
await auditLog.create({
  userId: user.id,
  action: 'CONTRACT_SIGN',
  resource: 'contract',
  resourceId: contract.id,
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  metadata: { contractHash: contract.hash }
});
```

### Security Audits
- **Quarterly**: Internal security reviews
- **Annually**: Third-party security audits
- **Smart Contracts**: Audit before mainnet deployment

---

## Security Checklist

### Before Production Launch
- [ ] All secrets rotated and stored securely
- [ ] TLS certificates installed and tested
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Database backups automated
- [ ] Monitoring and alerting configured
- [ ] Incident response plan documented
- [ ] Security team trained
- [ ] Penetration testing completed
- [ ] Bug bounty program announced
- [ ] Legal compliance reviewed
- [ ] Privacy policy published
- [ ] Terms of service published

### Regular Security Tasks
- [ ] Weekly: Review security logs
- [ ] Weekly: Update dependencies
- [ ] Monthly: Access control review
- [ ] Quarterly: Penetration testing
- [ ] Annually: Full security audit
- [ ] Annually: Disaster recovery drill

---

## Reporting Security Issues

If you discover a security vulnerability, please email:
**security@hedging-platform.com**

Please **DO NOT** create public GitHub issues for security vulnerabilities.

We appreciate responsible disclosure and will:
1. Acknowledge receipt within 24 hours
2. Provide estimated time for fix
3. Credit you in security advisories (if desired)
4. Consider bug bounty rewards

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CIS Controls](https://www.cisecurity.org/controls)
- [Solidity Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)

---

For implementation details, see:
- [Architecture Documentation](./ARCHITECTURE.md)
- [API Documentation](./API.md)
- [Developer Onboarding](./ONBOARDING.md)
