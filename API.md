# AgreeProof API Documentation

> Complete REST API documentation for the AgreeProof Digital Agreement Management Platform

## 📋 Table of Contents

- [Overview](#-overview)
- [Base URLs](#-base-urls)
- [Authentication](#-authentication)
- [Rate Limiting](#-rate-limiting)
- [Response Format](#-response-format)
- [Error Handling](#-error-handling)
- [Endpoints](#-endpoints)
  - [Agreement Management](#agreement-management)
  - [System Endpoints](#system-endpoints)
- [Data Models](#-data-models)
- [Examples](#-examples)
- [Testing](#-testing)

## 🎯 Overview

The AgreeProof API provides a RESTful interface for creating, managing, and verifying digital agreements. All API endpoints return JSON responses and follow HTTP status code conventions.

### Key Features

- **RESTful Design**: Clean, intuitive API structure
- **JSON Responses**: Consistent response format across all endpoints
- **Error Handling**: Comprehensive error messages and status codes
- **Security**: CORS enabled, input validation, and rate limiting
- **Documentation**: Self-documenting API with built-in endpoint discovery

## 🌐 Base URLs

### Environment URLs

| Environment | Base URL | Description |
|-------------|----------|-------------|
| Development | `http://localhost:5000/api` | Local development server |
| Staging | `https://agreeproof-staging.onrender.com/api` | Staging environment |
| Production | `https://agreeproof-backend.onrender.com/api` | Production environment |

### API Versioning

Current API version: **v1.0.0**

Version is included in response headers and can be accessed via the `/api` endpoint.

## 🔐 Authentication

Currently, the AgreeProof API does not require authentication for basic operations. However, authentication will be implemented in future versions using JWT tokens.

### Future Authentication Header

```http
Authorization: Bearer <jwt_token>
```

## ⚡ Rate Limiting

To ensure fair usage and system stability, the API implements rate limiting:

| Environment | Requests per Window | Window Duration |
|-------------|-------------------|-----------------|
| Development | 1000 requests | 15 minutes |
| Production | 100 requests | 15 minutes |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642234567
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 900
}
```

## 📤 Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data specific to the endpoint
  },
  "timestamp": "2024-01-14T18:25:00.000Z"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  },
  "timestamp": "2024-01-14T18:25:00.000Z"
}
```

## 🚨 Error Handling

### HTTP Status Codes

| Status Code | Meaning | Description |
|-------------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Authentication required |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (duplicate) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Codes

| Error Code | Description |
|------------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `NOT_FOUND` | Resource not found |
| `DUPLICATE_ERROR` | Duplicate resource detected |
| `INVALID_FORMAT` | Invalid data format |
| `SERVER_ERROR` | Internal server error |

## 🔗 Endpoints

## Agreement Management

### Create Agreement

Creates a new digital agreement with cryptographic proof hash.

**Endpoint**: `POST /api/agreements/create`

**Request Body**:

```json
{
  "title": "Service Agreement",
  "content": "This is a sample service agreement between two parties...",
  "partyA": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "partyB": {
    "name": "Jane Smith",
    "email": "jane@example.com"
  }
}
```

**Request Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | Yes | Agreement title (max 200 characters) |
| `content` | string | Yes | Agreement content/terms |
| `partyA.name` | string | Yes | First party name |
| `partyA.email` | string | Yes | First party email (valid email) |
| `partyB.name` | string | Yes | Second party name |
| `partyB.email` | string | Yes | Second party email (valid email) |

**Response**:

```json
{
  "success": true,
  "message": "Agreement created successfully",
  "data": {
    "agreementId": "AGP-20240114-ABC123",
    "shareLink": "https://agreeproof.com/agreement/AGP-20240114-ABC123",
    "status": "PENDING",
    "createdAt": "2024-01-14T18:25:00.000Z"
  },
  "timestamp": "2024-01-14T18:25:00.000Z"
}
```

**Example Request**:

```bash
curl -X POST http://localhost:5000/api/agreements/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Service Agreement",
    "content": "This agreement outlines the terms of service between the two parties.",
    "partyA": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "partyB": {
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  }'
```

**Error Responses**:

- `400 Bad Request` - Invalid input data
- `409 Conflict` - Duplicate agreement ID
- `500 Internal Server Error` - Server error

---

### Get Agreement

Retrieves agreement details by agreement ID.

**Endpoint**: `GET /api/agreements/{agreementId}`

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `agreementId` | string | Yes | Unique agreement identifier |

**Response**:

```json
{
  "success": true,
  "message": "Agreement retrieved successfully",
  "data": {
    "agreementId": "AGP-20240114-ABC123",
    "title": "Service Agreement",
    "content": "This agreement outlines the terms of service...",
    "partyA": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "partyB": {
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "status": "PENDING",
    "proofHash": "a1b2c3d4e5f6...",
    "shareLink": "https://agreeproof.com/agreement/AGP-20240114-ABC123",
    "createdAt": "2024-01-14T18:25:00.000Z",
    "updatedAt": "2024-01-14T18:25:00.000Z",
    "confirmedAt": null,
    "isImmutable": false
  },
  "timestamp": "2024-01-14T18:25:00.000Z"
}
```

**Example Request**:

```bash
curl -X GET http://localhost:5000/api/agreements/AGP-20240114-ABC123
```

**Error Responses**:

- `400 Bad Request` - Invalid agreement ID
- `404 Not Found` - Agreement not found

---

### Confirm Agreement

Confirms an agreement, making it immutable and setting the status to CONFIRMED.

**Endpoint**: `POST /api/agreements/{agreementId}/confirm`

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `agreementId` | string | Yes | Unique agreement identifier |

**Request Body**: Empty

**Response**:

```json
{
  "success": true,
  "message": "Agreement confirmed successfully",
  "data": {
    "agreementId": "AGP-20240114-ABC123",
    "status": "CONFIRMED",
    "confirmedAt": "2024-01-14T18:30:00.000Z",
    "isImmutable": true,
    "shareLink": "https://agreeproof.com/agreement/AGP-20240114-ABC123"
  },
  "timestamp": "2024-01-14T18:30:00.000Z"
}
```

**Example Request**:

```bash
curl -X POST http://localhost:5000/api/agreements/AGP-20240114-ABC123/confirm
```

**Error Responses**:

- `400 Bad Request` - Agreement already confirmed or invalid ID
- `404 Not Found` - Agreement not found

---

### Get Agreement Status

Retrieves the current status of an agreement.

**Endpoint**: `GET /api/agreements/{agreementId}/status`

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `agreementId` | string | Yes | Unique agreement identifier |

**Response**:

```json
{
  "success": true,
  "message": "Status retrieved successfully",
  "data": {
    "agreementId": "AGP-20240114-ABC123",
    "status": "PENDING",
    "confirmedAt": null,
    "isImmutable": false
  },
  "timestamp": "2024-01-14T18:25:00.000Z"
}
```

**Example Request**:

```bash
curl -X GET http://localhost:5000/api/agreements/AGP-20240114-ABC123/status
```

**Error Responses**:

- `400 Bad Request` - Invalid agreement ID
- `404 Not Found` - Agreement not found

## System Endpoints

### Health Check

Checks the health status of the API service.

**Endpoint**: `GET /health`

**Response**:

```json
{
  "status": "OK",
  "message": "AgreeProof API is running",
  "timestamp": "2024-01-14T18:25:00.000Z"
}
```

**Example Request**:

```bash
curl -X GET http://localhost:5000/health
```

---

### API Documentation

Returns information about available API endpoints.

**Endpoint**: `GET /api`

**Response**:

```json
{
  "success": true,
  "message": "AgreeProof API",
  "version": "1.0.0",
  "endpoints": {
    "agreements": {
      "POST /api/agreements/create": "Create new agreement",
      "GET /api/agreements/:agreementId": "Get agreement by ID",
      "POST /api/agreements/:agreementId/confirm": "Confirm agreement",
      "GET /api/agreements/:agreementId/status": "Get agreement status"
    },
    "health": {
      "GET /health": "Health check endpoint"
    }
  },
  "timestamp": "2024-01-14T18:25:00.000Z"
}
```

**Example Request**:

```bash
curl -X GET http://localhost:5000/api
```

## 📊 Data Models

### Agreement Model

```typescript
interface Agreement {
  agreementId: string;        // Unique identifier (format: AGP-YYYYMMDD-RANDOM)
  title: string;              // Agreement title (max 200 chars)
  content: string;            // Agreement content/terms
  partyA: Party;              // First party information
  partyB: Party;              // Second party information
  status: 'PENDING' | 'CONFIRMED';  // Agreement status
  proofHash: string;          // SHA256 cryptographic hash
  shareLink: string;          // Shareable agreement link
  createdAt: string;          // Creation timestamp (ISO 8601)
  updatedAt: string;          // Last update timestamp (ISO 8601)
  confirmedAt?: string;       // Confirmation timestamp (ISO 8601)
  isImmutable: boolean;       // Whether agreement can be modified
}

interface Party {
  name: string;               // Party name
  email: string;              // Party email (lowercase)
}
```

### Create Agreement Request

```typescript
interface CreateAgreementRequest {
  title: string;
  content: string;
  partyA: Party;
  partyB: Party;
}
```

### Create Agreement Response

```typescript
interface CreateAgreementResponse {
  agreementId: string;
  shareLink: string;
  status: string;
  createdAt: string;
}
```

### Agreement Status Response

```typescript
interface AgreementStatusResponse {
  agreementId: string;
  status: string;
  confirmedAt?: string;
  isImmutable: boolean;
}
```

## 💡 Examples

### Complete Workflow Example

```bash
# 1. Create a new agreement
curl -X POST http://localhost:5000/api/agreements/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Consulting Agreement",
    "content": "This consulting agreement is entered into on January 14, 2024...",
    "partyA": {
      "name": "Acme Corp",
      "email": "legal@acme.com"
    },
    "partyB": {
      "name": "John Consultant",
      "email": "john@consulting.com"
    }
  }'

# Response: {"success": true, "data": {"agreementId": "AGP-20240114-XYZ789"}}

# 2. Get agreement details
curl -X GET http://localhost:5000/api/agreements/AGP-20240114-XYZ789

# 3. Check agreement status
curl -X GET http://localhost:5000/api/agreements/AGP-20240114-XYZ789/status

# 4. Confirm the agreement
curl -X POST http://localhost:5000/api/agreements/AGP-20240114-XYZ789/confirm

# 5. Verify confirmation
curl -X GET http://localhost:5000/api/agreements/AGP-20240114-XYZ789/status
```

### JavaScript/TypeScript Example

```typescript
// Using fetch API
const apiUrl = 'http://localhost:5000/api';

async function createAgreement(agreementData) {
  const response = await fetch(`${apiUrl}/agreements/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(agreementData),
  });
  
  const result = await response.json();
  return result;
}

// Example usage
const agreement = {
  title: "Service Agreement",
  content: "Terms of service for consulting services...",
  partyA: {
    name: "Client Company",
    email: "client@company.com"
  },
  partyB: {
    name: "Service Provider",
    email: "provider@service.com"
  }
};

createAgreement(agreement)
  .then(result => console.log('Agreement created:', result))
  .catch(error => console.error('Error:', error));
```

### Python Example

```python
import requests
import json

api_base = "http://localhost:5000/api"

def create_agreement(title, content, party_a, party_b):
    url = f"{api_base}/agreements/create"
    data = {
        "title": title,
        "content": content,
        "partyA": party_a,
        "partyB": party_b
    }
    
    response = requests.post(url, json=data)
    return response.json()

# Example usage
agreement = create_agreement(
    title="Consulting Agreement",
    content="This agreement outlines consulting services...",
    party_a={"name": "Client", "email": "client@example.com"},
    party_b={"name": "Consultant", "email": "consultant@example.com"}
)

print(agreement)
```

## 🧪 Testing

### Testing with curl

```bash
# Test health endpoint
curl -X GET http://localhost:5000/health

# Test API documentation
curl -X GET http://localhost:5000/api

# Test agreement creation
curl -X POST http://localhost:5000/api/agreements/create \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Agreement", "content": "Test content", "partyA": {"name": "Test A", "email": "a@test.com"}, "partyB": {"name": "Test B", "email": "b@test.com"}}'
```

### Testing with Postman

Import the following collection into Postman:

```json
{
  "info": {
    "name": "AgreeProof API",
    "description": "API collection for AgreeProof"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/health"
      }
    },
    {
      "name": "Create Agreement",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/agreements/create",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"title\": \"Test Agreement\",\n  \"content\": \"This is a test agreement\",\n  \"partyA\": {\n    \"name\": \"John Doe\",\n    \"email\": \"john@example.com\"\n  },\n  \"partyB\": {\n    \"name\": \"Jane Smith\",\n    \"email\": \"jane@example.com\"\n  }\n}"
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000"
    }
  ]
}
```

## 📝 Changelog

### Version 1.0.0 (2024-01-14)

- Initial API release
- Agreement creation and management endpoints
- Cryptographic proof hash generation
- Status tracking and confirmation
- Health check and documentation endpoints

## 🔗 Related Documentation

- [Main README](README.md) - Project overview and setup
- [Development Guide](DEVELOPMENT.md) - Development setup and guidelines
- [Architecture Documentation](ARCHITECTURE.md) - System architecture and design
- [User Guide](USER_GUIDE.md) - End-user documentation

## 📞 Support

For API support and questions:

- **Documentation**: https://docs.agreeproof.com
- **Issues**: https://github.com/your-username/agreeproof/issues
- **Email**: api-support@agreeproof.com

---

**© 2024 AgreeProof. All rights reserved.**