# AgreeProof Backend API

> RESTful API backend for the AgreeProof digital agreement management platform

## 📋 Overview

The AgreeProof backend is a Node.js/Express.js application that provides a secure, scalable API for managing digital agreements. It features comprehensive security measures, robust error handling, and seamless integration with MongoDB Atlas for data persistence.

## 🚀 Features

### Core Functionality
- **Agreement Management**: Create, read, update, and delete digital agreements
- **Multi-Party Support**: Handle agreements between multiple parties with individual confirmation tracking
- **Cryptographic Security**: SHA256 proof hash generation for agreement integrity
- **Status Tracking**: Monitor agreement lifecycle (PENDING, CONFIRMED, EXPIRED)
- **Secure Sharing**: Generate unique, secure share links for agreement access

### Security Features
- **Input Validation**: Comprehensive validation and sanitization of all inputs
- **CORS Protection**: Configurable cross-origin resource sharing
- **Rate Limiting**: API rate limiting to prevent abuse
- **Security Headers**: Helmet.js for security header implementation
- **Password Security**: bcrypt hashing for secure password storage

### Performance & Reliability
- **Database Optimization**: Indexed queries and connection pooling
- **Caching Layer**: Redis integration for performance optimization
- **Error Handling**: Structured error responses with proper HTTP status codes
- **Logging**: Winston-based structured logging
- **Health Checks**: Comprehensive health monitoring endpoints

## 🛠️ Technology Stack

- **Runtime**: Node.js 18.x
- **Framework**: Express.js 4.21.2
- **Database**: MongoDB Atlas
- **Cache**: Redis
- **Authentication**: JWT (planned)
- **Testing**: Jest
- **Documentation**: OpenAPI/Swagger
- **Deployment**: Render, Docker

## 📦 Installation

### Prerequisites
- Node.js 18.x or higher
- MongoDB Atlas account
- Redis instance (optional for development)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/agreeproof.git
   cd agreeproof/agreeproof-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Copy the environment template:
   ```bash
   cp .env.production.example .env
   ```
   
   Configure your environment variables:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agreeproof?retryWrites=true&w=majority
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Frontend Configuration
   FRONTEND_URL=http://localhost:3000
   
   # Redis Configuration (optional)
   REDIS_URL=redis://localhost:6379
   
   # Security Configuration
   JWT_SECRET=your-super-secret-jwt-key
   BCRYPT_ROUNDS=12
   
   # Email Configuration (for notifications)
   EMAIL_SERVICE=sendgrid
   EMAIL_API_KEY=your-sendgrid-api-key
   
   # Logging Configuration
   LOG_LEVEL=info
   ```

4. **Database Setup**
   
   The application will automatically create the necessary collections and indexes on first run. For manual setup:
   ```bash
   # Run database setup script
   node database/indexes.js
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🏗️ Project Structure

```
agreeproof-backend/
├── src/
│   ├── config/
│   │   └── db.js              # Database configuration and connection
│   ├── controllers/
│   │   └── agreementController.js  # Agreement business logic
│   ├── middleware/
│   │   └── security.js        # Security middleware (CORS, rate limiting)
│   ├── models/
│   │   └── Agreement.js       # MongoDB data model
│   ├── routes/
│   │   └── agreementRoutes.js # API route definitions
│   ├── utils/
│   │   └── generateId.js      # Utility functions
│   ├── app.js                 # Express application configuration
│   └── server.js              # Server startup and initialization
├── tests/
│   ├── Agreement.test.js      # Agreement model tests
│   ├── generateId.test.js     # Utility function tests
│   └── setup.js               # Test environment setup
├── database/
│   └── indexes.js             # Database index creation
├── .env.production.example    # Environment variable template
├── Dockerfile                 # Docker configuration
├── render.yaml               # Render deployment configuration
├── jest.config.js            # Jest testing configuration
└── package.json              # Dependencies and scripts
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server with nodemon
npm start            # Start production server

# Testing
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier

# Database
npm run db:setup     # Setup database indexes
npm run db:seed      # Seed database with sample data

# Deployment
npm run build        # Build for production
npm run deploy       # Deploy to production
```

## 🌐 API Documentation

### Base URL
- **Development**: `http://localhost:5000`
- **Production**: `https://api.agreeproof.com`

### Endpoints

#### Health Check
```http
GET /health
```

#### Agreement Management
```http
GET    /api/agreements           # List all agreements
POST   /api/agreements           # Create new agreement
GET    /api/agreements/:id       # Get specific agreement
PUT    /api/agreements/:id       # Update agreement
DELETE /api/agreements/:id       # Delete agreement
PATCH  /api/agreements/:id/confirm # Confirm agreement
```

#### Utility Endpoints
```http
POST   /api/verify/hash          # Verify proof hash
GET    /api/metrics              # System metrics
```

### Request/Response Examples

#### Create Agreement
```http
POST /api/agreements
Content-Type: application/json

{
  "title": "Service Agreement",
  "content": "Terms and conditions for service provision...",
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

#### Response
```json
{
  "success": true,
  "data": {
    "agreement": {
      "agreementId": "AGP-20240114-ABC123",
      "title": "Service Agreement",
      "status": "PENDING",
      "shareLink": "https://app.agreeproof.com/agreement/AGP-20240114-ABC123",
      "proofHash": "a1b2c3d4e5f6...",
      "createdAt": "2024-01-14T10:30:00.000Z"
    }
  }
}
```

### Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-14T10:30:00.000Z",
    "requestId": "req_123456789"
  }
}
```

## 🗄️ Database Schema

### Agreement Model

```javascript
{
  _id: ObjectId,
  agreementId: String,        // AGP-YYYYMMDD-RANDOM (unique)
  title: String,              // Agreement title
  content: String,            // Agreement content/terms
  partyA: {
    name: String,             // Party A name
    email: String,            // Party A email
    confirmed: Boolean,       // Confirmation status
    confirmedAt: Date         // Confirmation timestamp
  },
  partyB: {
    name: String,             // Party B name
    email: String,            // Party B email
    confirmed: Boolean,       // Confirmation status
    confirmedAt: Date         // Confirmation timestamp
  },
  status: String,             // PENDING | CONFIRMED | EXPIRED
  proofHash: String,          // SHA256 cryptographic hash
  shareLink: String,          // Unique sharing link
  createdAt: Date,            // Creation timestamp
  updatedAt: Date,            // Last update timestamp
  expiresAt: Date,            // Expiration date (optional)
  metadata: {                 // Additional metadata
    ipAddress: String,
    userAgent: String,
    location: String
  }
}
```

### Database Indexes

```javascript
// Performance indexes
db.agreements.createIndex({ "agreementId": 1 }, { unique: true })
db.agreements.createIndex({ "partyA.email": 1 })
db.agreements.createIndex({ "partyB.email": 1 })
db.agreements.createIndex({ "status": 1 })
db.agreements.createIndex({ "createdAt": -1 })
db.agreements.createIndex({ "proofHash": 1 })
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Test individual functions and models
- **Integration Tests**: Test API endpoints and database operations
- **Security Tests**: Test security middleware and validation

### Coverage Goals

- **Statements**: >90%
- **Branches**: >85%
- **Functions**: >90%
- **Lines**: >90%

## 🔒 Security

### Implemented Security Measures

1. **Input Validation**: Joi schema validation for all inputs
2. **SQL Injection Prevention**: Parameterized queries with MongoDB
3. **XSS Protection**: Input sanitization and output encoding
4. **CORS Configuration**: Configurable cross-origin policies
5. **Rate Limiting**: Express-rate-limit middleware
6. **Security Headers**: Helmet.js implementation
7. **Password Security**: bcrypt hashing with salt rounds

### Security Best Practices

- Environment variable protection
- Error message sanitization
- Request logging and monitoring
- Regular security audits
- Dependency vulnerability scanning

## 🚀 Deployment

### Production Deployment

#### Render (Recommended)
1. Connect your GitHub repository to Render
2. Configure environment variables
3. Deploy automatically on push to main branch

#### Docker
```bash
# Build Docker image
docker build -t agreeproof-backend .

# Run container
docker run -p 5000:5000 agreeproof-backend
```

#### Manual Deployment
```bash
# Install production dependencies
npm ci --production

# Build application
npm run build

# Start production server
npm start
```

### Environment Configuration

- **Development**: Local MongoDB and Redis
- **Staging**: Cloud-hosted services with test data
- **Production**: MongoDB Atlas, Redis Cloud, monitoring

## 📊 Monitoring & Logging

### Logging Strategy

- **Structured Logging**: JSON format with Winston
- **Log Levels**: Error, Warn, Info, Debug
- **Request Logging**: HTTP requests with correlation IDs
- **Error Tracking**: Detailed error logs with stack traces

### Monitoring

- **Health Checks**: `/health` endpoint
- **Metrics**: Performance and business metrics
- **Alerts**: Error rate and response time monitoring
- **Uptime**: Service availability monitoring

## 🔧 Development

### Code Style

- **ESLint**: JavaScript/Node.js linting
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **Conventional Commits**: Standardized commit messages

### Development Workflow

1. Create feature branch from `main`
2. Implement changes with tests
3. Run tests and linting
4. Submit pull request
5. Code review and merge

### Debugging

```bash
# Debug with Node.js inspector
node --inspect src/server.js

# Debug with VS Code
# Use launch configuration in .vscode/launch.json
```

## 📚 Documentation

- **API Documentation**: [../API.md](../API.md)
- **Development Guide**: [../DEVELOPMENT.md](../DEVELOPMENT.md)
- **Architecture**: [../ARCHITECTURE.md](../ARCHITECTURE.md)
- **User Guide**: [../USER_GUIDE.md](../USER_GUIDE.md)

## 🤝 Contributing

Please read [../CONTRIBUTING.md](../CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [../LICENSE](../LICENSE) file for details.

## 📞 Support

- **Documentation**: [../README.md](../README.md)
- **Issues**: [GitHub Issues](https://github.com/your-org/agreeproof/issues)
- **Email**: support@agreeproof.com
- **Discord**: [Community Server](https://discord.gg/agreeproof)

---

**AgreeProof Backend** - Secure, scalable API for digital agreement management.