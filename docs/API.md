# API Documentation

## Oilseed Hedging Platform REST API

**Base URL**: `https://api.hedging-platform.com/api/v1`  
**Version**: 1.0.0  
**Authentication**: Bearer JWT Token

---

## Table of Contents
1. [Authentication](#authentication)
2. [Users](#users)
3. [Market Data](#market-data)
4. [Trading](#trading)
5. [Contracts](#contracts)
6. [Notifications](#notifications)
7. [Admin](#admin)
8. [WebSocket Events](#websocket-events)
9. [Error Handling](#error-handling)

---

## Authentication

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "phone": "+919876543210",
  "password": "SecurePass@123",
  "role": "farmer"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "Rajesh Kumar",
      "email": "rajesh@example.com",
      "role": "farmer",
      "status": "pending_verification"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "rajesh@example.com",
  "password": "SecurePass@123"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "Rajesh Kumar",
      "email": "rajesh@example.com",
      "role": "farmer"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}

Response: 200 OK
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Users

### Get Current User
```http
GET /me
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Rajesh Kumar",
    "email": "rajesh@example.com",
    "phone": "+919876543210",
    "role": "farmer",
    "status": "active",
    "walletAddress": "0x1234...",
    "emailVerified": true,
    "kycVerified": false,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Update Profile
```http
PATCH /users/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Rajesh Kumar Singh",
  "phone": "+919876543210"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Rajesh Kumar Singh",
    "email": "rajesh@example.com",
    "phone": "+919876543210"
  }
}
```

### Link Wallet
```http
POST /users/link-wallet
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "walletAddress": "0x1234567890abcdef",
  "signature": "0xsignature..."
}

Response: 200 OK
{
  "success": true,
  "message": "Wallet linked successfully"
}
```

---

## Market Data

### Get Price History
```http
GET /market/price-history?commodity=soybean&from=2024-01-01&to=2024-01-31
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "commodity": "soybean",
    "unit": "quintal",
    "prices": [
      {
        "timestamp": "2024-01-01T00:00:00Z",
        "price": 4500.00,
        "openPrice": 4480.00,
        "highPrice": 4520.00,
        "lowPrice": 4460.00,
        "volume": 1500,
        "source": "ncdex"
      },
      // ... more prices
    ],
    "meta": {
      "count": 30,
      "average": 4550.00,
      "min": 4450.00,
      "max": 4650.00
    }
  }
}
```

### Get Current Price
```http
GET /market/price/current?commodity=soybean
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "commodity": "soybean",
    "price": 4580.00,
    "timestamp": "2024-01-31T12:00:00Z",
    "change": "+2.5%",
    "changeValue": +115.00
  }
}
```

### Get Price Forecast
```http
GET /market/forecast?commodity=soybean&horizon_days=30
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "commodity": "soybean",
    "generatedAt": "2024-01-31T12:00:00Z",
    "horizonDays": 30,
    "modelVersion": "v1.0.0",
    "modelType": "prophet",
    "forecast": [
      {
        "date": "2024-02-01",
        "predicted": 4590.00,
        "lower": 4540.00,
        "upper": 4640.00,
        "confidence": 0.95
      },
      // ... more forecasts
    ],
    "explanation": "Prices are expected to rise due to seasonal demand and limited supply."
  }
}
```

### Get Market Summary
```http
GET /market/summary
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "commodities": [
      {
        "name": "soybean",
        "currentPrice": 4580.00,
        "change": "+2.5%",
        "volume": 15000,
        "high": 4620.00,
        "low": 4540.00
      },
      {
        "name": "mustard",
        "currentPrice": 5200.00,
        "change": "-1.2%",
        "volume": 12000,
        "high": 5250.00,
        "low": 5180.00
      }
    ]
  }
}
```

---

## Trading

### Create Order
```http
POST /trading/order
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "type": "simulated",
  "side": "buy",
  "commodity": "soybean",
  "price": 4580.00,
  "quantity": 100,
  "expiresAt": "2024-02-01T00:00:00Z"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "type": "simulated",
    "side": "buy",
    "commodity": "soybean",
    "price": 4580.00,
    "quantity": 100,
    "filledQuantity": 0,
    "status": "pending",
    "createdAt": "2024-01-31T12:00:00Z"
  }
}
```

### Get Order
```http
GET /trading/order/:id
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "userId": "user-uuid",
    "type": "simulated",
    "side": "buy",
    "commodity": "soybean",
    "price": 4580.00,
    "quantity": 100,
    "filledQuantity": 50,
    "status": "partially_filled",
    "createdAt": "2024-01-31T12:00:00Z",
    "trades": [
      {
        "id": "trade-uuid",
        "price": 4580.00,
        "quantity": 50,
        "timestamp": "2024-01-31T12:05:00Z"
      }
    ]
  }
}
```

### Cancel Order
```http
DELETE /trading/order/:id
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "message": "Order cancelled successfully"
}
```

### Get User Orders
```http
GET /trading/orders?status=pending&page=1&limit=20
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order-uuid",
        "type": "simulated",
        "side": "buy",
        "commodity": "soybean",
        "price": 4580.00,
        "quantity": 100,
        "filledQuantity": 0,
        "status": "pending",
        "createdAt": "2024-01-31T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### Get Trade History
```http
GET /trading/trades?commodity=soybean&from=2024-01-01&to=2024-01-31
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "trades": [
      {
        "id": "trade-uuid",
        "buyOrderId": "order-uuid-1",
        "sellOrderId": "order-uuid-2",
        "commodity": "soybean",
        "price": 4580.00,
        "quantity": 50,
        "timestamp": "2024-01-31T12:05:00Z"
      }
    ],
    "summary": {
      "totalTrades": 25,
      "totalVolume": 1250,
      "avgPrice": 4565.00
    }
  }
}
```

---

## Contracts

### Create Contract
```http
POST /contracts/create
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "buyerId": "buyer-uuid",
  "sellerId": "seller-uuid",
  "commodity": "soybean",
  "quantity": 500,
  "priceFixed": 4600.00,
  "deliveryDate": "2024-06-01",
  "deliveryLocation": "Mumbai",
  "terms": {
    "qualitySpecs": "Grade A, moisture < 10%",
    "paymentTerms": "50% advance, 50% on delivery",
    "penalties": "1% per day for delayed delivery"
  }
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "contract-uuid",
    "contractHash": "0xabcdef...",
    "status": "draft",
    "commodity": "soybean",
    "quantity": 500,
    "priceFixed": 4600.00,
    "totalValue": 2300000.00,
    "deliveryDate": "2024-06-01",
    "createdAt": "2024-01-31T12:00:00Z"
  }
}
```

### Sign Contract
```http
POST /contracts/:id/sign
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "signature": "0x1234...",
  "walletAddress": "0xabc..."
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "contract-uuid",
    "status": "signed",
    "signedAt": "2024-01-31T12:10:00Z",
    "buyerSignature": "0x1234...",
    "sellerSignature": "0x5678..."
  }
}
```

### Publish to IPFS
```http
POST /contracts/:id/publish-ipfs
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "ipfsCid": "Qm...",
    "ipfsUrl": "https://gateway.pinata.cloud/ipfs/Qm...",
    "blockchainTx": "0xtxhash...",
    "blockchainStatus": "confirmed"
  }
}
```

### Get Contract
```http
GET /contracts/:id
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "contract-uuid",
    "contractHash": "0xabcdef...",
    "buyer": {
      "id": "buyer-uuid",
      "name": "Rajesh Kumar",
      "email": "rajesh@example.com"
    },
    "seller": {
      "id": "seller-uuid",
      "name": "FPO Maharashtra",
      "email": "fpo@example.com"
    },
    "commodity": "soybean",
    "quantity": 500,
    "priceFixed": 4600.00,
    "totalValue": 2300000.00,
    "deliveryDate": "2024-06-01",
    "status": "signed",
    "ipfsCid": "Qm...",
    "blockchainTx": "0xtxhash...",
    "createdAt": "2024-01-31T12:00:00Z",
    "signedAt": "2024-01-31T12:10:00Z"
  }
}
```

### Get User Contracts
```http
GET /contracts?status=active&page=1&limit=20
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "contracts": [
      // ... array of contracts
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

---

## Notifications

### Get Notifications
```http
GET /notifications?unread=true&page=1&limit=20
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif-uuid",
        "type": "contract_signed",
        "title": "Contract Signed",
        "message": "Your contract for 500 quintals of soybean has been signed",
        "isRead": false,
        "createdAt": "2024-01-31T12:10:00Z"
      }
    ],
    "unreadCount": 5,
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25
    }
  }
}
```

### Mark as Read
```http
PATCH /notifications/:id/read
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "message": "Notification marked as read"
}
```

### Mark All as Read
```http
POST /notifications/read-all
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## Admin

### Get Platform Statistics
```http
GET /admin/statistics
Authorization: Bearer <access_token>
X-User-Role: super_admin

Response: 200 OK
{
  "success": true,
  "data": {
    "users": {
      "total": 1250,
      "farmers": 1000,
      "fpos": 50,
      "marketMakers": 10,
      "active": 1100
    },
    "contracts": {
      "total": 450,
      "active": 150,
      "settled": 280,
      "totalValue": 125000000
    },
    "trading": {
      "totalOrders": 3500,
      "totalTrades": 2800,
      "totalVolume": 125000
    }
  }
}
```

---

## WebSocket Events

### Connection
```javascript
import io from 'socket.io-client';

const socket = io('wss://api.hedging-platform.com', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.on('connect', () => {
  console.log('Connected to WebSocket');
});
```

### Subscribe to Market Updates
```javascript
// Subscribe to price updates
socket.emit('subscribe:market', { commodity: 'soybean' });

socket.on('market:price-update', (data) => {
  console.log('Price update:', data);
  // { commodity: 'soybean', price: 4580, timestamp: '...' }
});
```

### Subscribe to User Notifications
```javascript
socket.on('user:notification', (notification) => {
  console.log('New notification:', notification);
  // { type: 'contract_signed', title: '...', message: '...' }
});
```

### Order Updates
```javascript
socket.on('order:update', (order) => {
  console.log('Order update:', order);
  // { id: '...', status: 'filled', filledQuantity: 100 }
});
```

### Trade Execution
```javascript
socket.on('trade:executed', (trade) => {
  console.log('Trade executed:', trade);
  // { id: '...', price: 4580, quantity: 50 }
});
```

---

## Error Handling

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* additional error details */ }
  }
}
```

### HTTP Status Codes
- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict
- `422 Unprocessable Entity`: Validation failed
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Common Error Codes
- `AUTH_INVALID_CREDENTIALS`: Invalid email or password
- `AUTH_TOKEN_EXPIRED`: Access token has expired
- `AUTH_INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `VALIDATION_ERROR`: Request validation failed
- `RESOURCE_NOT_FOUND`: Requested resource not found
- `CONTRACT_ALREADY_SIGNED`: Contract is already signed
- `ORDER_INSUFFICIENT_BALANCE`: Insufficient balance for order
- `RATE_LIMIT_EXCEEDED`: Too many requests

---

## Rate Limiting

- **Default**: 100 requests per 15 minutes per user
- **Headers**:
  - `X-RateLimit-Limit`: Total requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Timestamp when limit resets

---

## Postman Collection

A complete Postman collection is available at:
```
docs/postman/Hedging-Platform-API.postman_collection.json
```

---

## Swagger/OpenAPI

Interactive API documentation is available at:
```
https://api.hedging-platform.com/docs
```

For local development:
```
http://localhost:3000/docs
```

---

## Sample cURL Commands

### Register
```bash
curl -X POST https://api.hedging-platform.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rajesh Kumar",
    "email": "rajesh@example.com",
    "password": "SecurePass@123",
    "role": "farmer"
  }'
```

### Login and Get Market Data
```bash
# Login
TOKEN=$(curl -X POST https://api.hedging-platform.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rajesh@example.com","password":"SecurePass@123"}' \
  | jq -r '.data.accessToken')

# Get market data
curl -X GET "https://api.hedging-platform.com/api/v1/market/price-history?commodity=soybean" \
  -H "Authorization: Bearer $TOKEN"
```

### Create Order
```bash
curl -X POST https://api.hedging-platform.com/api/v1/trading/order \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "simulated",
    "side": "buy",
    "commodity": "soybean",
    "price": 4580.00,
    "quantity": 100
  }'
```

---

For more information, see:
- [Architecture Documentation](./ARCHITECTURE.md)
- [Developer Onboarding](./ONBOARDING.md)
- [Security Guide](./SECURITY.md)
