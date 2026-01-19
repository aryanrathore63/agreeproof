# AgreeProof Enhanced API Documentation v2.0

## Overview

AgreeProof v2.0 is a comprehensive agreement management system with authentication, payment tracking, automated reminders, and email notifications. This document covers all API endpoints, authentication, and enhanced features.

## Base URL

```
Production: https://agreeproof-backend.onrender.com
Development: http://localhost:5000
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Types
- **Access Token**: Short-lived (15 minutes) for API requests
- **Refresh Token**: Long-lived (7 days) for obtaining new access tokens

---

## 🔐 Authentication Endpoints

### Register New User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "64a1b2c3d4e5f6789012345",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 900
    }
  }
}
```

### User Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "64a1b2c3d4e5f6789012345",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 900
    }
  }
}
```

### Refresh Access Token
```http
POST /api/auth/refresh-token
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "64a1b2c3d4e5f6789012345",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "preferences": {
      "emailNotifications": true,
      "theme": "light"
    }
  }
}
```

### Update User Profile
```http
PUT /api/auth/profile
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "name": "John Smith",
  "preferences": {
    "emailNotifications": false,
    "theme": "dark"
  }
}
```

### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access-token>
```

---

## 📋 Enhanced Agreement Endpoints

### Create Enhanced Agreement
```http
POST /api/enhanced-agreements
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "title": "Loan Agreement",
  "content": "I will pay ₹5000 by 15th October 2024",
  "partyA": {
    "name": "John Doe",
    "contact": "john@example.com"
  },
  "partyB": {
    "name": "Jane Smith",
    "contact": "jane@example.com"
  },
  "payment": {
    "amount": 5000,
    "currency": "INR",
    "dueDate": "2024-10-15T23:59:59.000Z",
    "paymentType": "upi",
    "reminders": {
      "enabled": true,
      "frequency": "daily"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Agreement created successfully",
  "data": {
    "agreement": {
      "id": "64a1b2c3d4e5f6789012345",
      "agreementId": "AGP-ABC123XYZ",
      "title": "Loan Agreement",
      "status": "pending",
      "shareToken": "share_abc123def456",
      "shareLink": "https://agreeproof.netlify.app/shared/share_abc123def456"
    }
  }
}
```

### Get User Agreements (Paginated)
```http
GET /api/enhanced-agreements?page=1&limit=10&status=pending
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)
- `status` (optional): Filter by status (pending, paid, overdue, cancelled)
- `search` (optional): Search in title and content

**Response:**
```json
{
  "success": true,
  "data": {
    "agreements": [
      {
        "id": "64a1b2c3d4e5f6789012345",
        "agreementId": "AGP-ABC123XYZ",
        "title": "Loan Agreement",
        "status": "pending",
        "partyA": { "name": "John Doe", "contact": "john@example.com" },
        "partyB": { "name": "Jane Smith", "contact": "jane@example.com" },
        "payment": {
          "amount": 5000,
          "currency": "INR",
          "dueDate": "2024-10-15T23:59:59.000Z",
          "paymentStatus": "pending"
        },
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Get Agreement Statistics
```http
GET /api/enhanced-agreements/stats
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 25,
    "pending": 10,
    "paid": 12,
    "overdue": 2,
    "cancelled": 1,
    "totalValue": 125000,
    "paidValue": 60000,
    "pendingValue": 50000,
    "overdueValue": 15000
  }
}
```

### Get Agreement by ID
```http
GET /api/enhanced-agreements/:agreementId
Authorization: Bearer <access-token>
```

### Update Agreement
```http
PUT /api/enhanced-agreements/:agreementId
Authorization: Bearer <access-token>
```

**Request Body:** (same as create, but only include fields to update)

### Delete Agreement
```http
DELETE /api/enhanced-agreements/:agreementId
Authorization: Bearer <access-token>
```

### Confirm Agreement
```http
POST /api/enhanced-agreements/:agreementId/confirm
```

**Request Body:**
```json
{
  "partyBEmail": "jane@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Agreement confirmed successfully",
  "data": {
    "agreementId": "AGP-ABC123XYZ",
    "status": "confirmed",
    "confirmedAt": "2024-01-15T11:00:00.000Z",
    "proofHash": "sha256:abc123def456..."
  }
}
```

### Mark Agreement as Paid
```http
POST /api/enhanced-agreements/:agreementId/mark-paid
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "paymentDate": "2024-10-14T15:30:00.000Z",
  "paymentNotes": "Paid via UPI transaction ID: TXN123456",
  "paymentProofUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1/payment_proofs/abc123.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Agreement marked as paid successfully",
  "data": {
    "agreementId": "AGP-ABC123XYZ",
    "status": "paid",
    "payment": {
      "paymentStatus": "paid",
      "paymentDate": "2024-10-14T15:30:00.000Z",
      "paymentNotes": "Paid via UPI transaction ID: TXN123456",
      "paymentProofUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1/payment_proofs/abc123.jpg"
    }
  }
}
```

### Get Public Agreement (Shared Link)
```http
GET /api/enhanced-agreements/shared/:shareToken
```

**Response:** (Read-only agreement data without sensitive information)

---

## 📧 Cron Job Management (Admin Only)

### Get Cron Job Status
```http
GET /api/cron/status
Authorization: Bearer <admin-access-token>
```

### Start All Cron Jobs
```http
POST /api/cron/start
Authorization: Bearer <admin-access-token>
```

### Stop All Cron Jobs
```http
POST /api/cron/stop
Authorization: Bearer <admin-access-token>
```

### Trigger Daily Reminders Manually
```http
POST /api/cron/trigger/reminders
Authorization: Bearer <admin-access-token>
```

### Trigger Overdue Check Manually
```http
POST /api/cron/trigger/overdue
Authorization: Bearer <admin-access-token>
```

### Get Email Service Health
```http
GET /api/cron/email/health
Authorization: Bearer <admin-access-token>
```

### Send Test Email
```http
POST /api/cron/email/test
Authorization: Bearer <admin-access-token>
```

**Request Body:**
```json
{
  "to": "test@example.com",
  "type": "reminder"
}
```

---

## 📁 File Upload (Payment Proof)

### Upload Payment Proof
```http
POST /api/enhanced-agreements/:agreementId/upload-proof
Authorization: Bearer <access-token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: Image file (JPEG, PNG, WebP, max 5MB)

**Response:**
```json
{
  "success": true,
  "message": "Payment proof uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v1/payment_proofs/abc123.jpg",
    "publicId": "payment_proofs/abc123",
    "size": 1024000
  }
}
```

---

## 🔄 Legacy Endpoints (Backward Compatibility)

### Create Agreement (Legacy)
```http
POST /api/agreements/create
```

### Get Agreement (Legacy)
```http
GET /api/agreements/:agreementId
```

### Confirm Agreement (Legacy)
```http
POST /api/agreements/:agreementId/confirm
```

---

## 📊 Email Templates

### Agreement Confirmation Email
- Sent when Party B confirms an agreement
- Includes agreement details and proof hash
- Contains shareable link

### Payment Reminder Email
- Sent automatically based on reminder settings
- Includes payment amount, due date, and payment methods
- Sent daily/weekly as configured

### Overdue Notification Email
- Sent when payment is overdue
- Urgent styling with overdue amount
- Includes immediate action steps

### Payment Received Email
- Sent when agreement is marked as paid
- Confirmation to both parties
- Includes payment proof if available

---

## 🔧 Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (Validation errors)
- `401` - Unauthorized (Invalid/missing token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found
- `409` - Conflict (Duplicate resource)
- `429` - Too Many Requests (Rate limited)
- `500` - Internal Server Error

---

## 🚀 Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per minute per IP
- **File Upload**: 10 requests per hour per user

---

## 🔒 Security Features

- JWT token authentication with refresh tokens
- Password hashing with bcrypt
- Request validation and sanitization
- CORS protection
- Rate limiting
- Request timeout (30 seconds)
- Input validation for all endpoints

---

## 📱 Mobile App Support

All endpoints are fully compatible with mobile applications. Include the following headers for mobile requests:

```http
User-Agent: AgreeProof-Mobile/1.0.0
X-Platform: ios|android
```

---

## 🌍 Deployment Information

### Production Environment
- **Backend**: Render (https://agreeproof-backend.onrender.com)
- **Frontend**: Netlify (https://agreeproof.netlify.app)
- **Database**: MongoDB Atlas
- **File Storage**: Cloudinary
- **Email Service**: Gmail SMTP / Brevo API

### Environment Variables
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://agreeproof.netlify.app
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## 📞 Support

For API support and issues:
- **Email**: support@agreeproof.com
- **Documentation**: https://docs.agreeproof.com
- **Status Page**: https://status.agreeproof.com

---

## 🔄 API Versioning

- **v1.0**: Basic agreement system (legacy endpoints)
- **v2.0**: Enhanced system with authentication, payments, reminders
- **Current Version**: 2.0.0

Legacy endpoints remain functional for backward compatibility but will be deprecated in future versions.

---

*Last Updated: January 2024*