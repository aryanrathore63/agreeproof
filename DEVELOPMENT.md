# AgreeProof Development Guide

> Comprehensive guide for setting up and developing the AgreeProof platform

## 📋 Table of Contents

- [Overview](#-overview)
- [Prerequisites](#-prerequisites)
- [Environment Setup](#-environment-setup)
- [Local Development](#-local-development)
- [Testing](#-testing)
- [Code Style Guidelines](#-code-style-guidelines)
- [Debugging](#-debugging)
- [Common Issues](#-common-issues)
- [Development Workflow](#-development-workflow)
- [Performance Optimization](#-performance-optimization)
- [Security Best Practices](#-security-best-practices)

## 🎯 Overview

This guide provides comprehensive instructions for setting up a development environment for the AgreeProof platform. It covers everything from initial setup to advanced development practices.

### Development Stack

- **Frontend**: React 19.2.3 + TypeScript 4.9.5 + Tailwind CSS 3.4.0
- **Backend**: Node.js 18+ + Express 5.2.1 + MongoDB 9.1.3
- **Testing**: Jest for both frontend and backend
- **Tools**: Git, VS Code, Postman, MongoDB Compass

## 🛠️ Prerequisites

### Required Software

#### Core Requirements

1. **Node.js** (v18.0.0 or higher)
   ```bash
   # Check current version
   node --version
   
   # Install using nvm (recommended)
   nvm install 18
   nvm use 18
   ```

2. **npm** (v8.0.0 or higher)
   ```bash
   # Check current version
   npm --version
   
   # Upgrade if needed
   npm install -g npm@latest
   ```

3. **Git** (v2.30.0 or higher)
   ```bash
   # Check current version
   git --version
   
   # Configure git
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

#### Database Tools

4. **MongoDB** (Local installation optional)
   ```bash
   # Install MongoDB Community Server
   # Or use MongoDB Atlas (recommended for development)
   ```

5. **MongoDB Compass** (GUI for MongoDB)
   - Download from [MongoDB website](https://www.mongodb.com/try/download/compass)

#### Development Tools

6. **Visual Studio Code** (Recommended)
   - Install from [VS Code website](https://code.visualstudio.com/)
   - Recommended extensions listed below

7. **Postman** (API testing)
   - Download from [Postman website](https://www.postman.com/downloads/)

### VS Code Extensions

Install these extensions for optimal development experience:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-json",
    "mongodb.mongodb-vscode",
    "ms-vscode.vscode-thunder-client",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-git-graph"
  ]
}
```

## 🌍 Environment Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-username/agreeproof.git

# Navigate to the project directory
cd agreeproof

# Create and switch to development branch
git checkout -b develop
```

### 2. Install Dependencies

#### Frontend Dependencies

```bash
# Navigate to frontend directory
cd agreeproof-frontend

# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

#### Backend Dependencies

```bash
# Navigate to backend directory
cd ../agreeproof-backend

# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

### 3. Environment Configuration

#### Frontend Environment

Create `agreeproof-frontend/.env.local`:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=local
REACT_APP_BUILD_TIME=local

# Feature Flags
REACT_APP_DEBUG=true
REACT_APP_ENABLE_ANALYTICS=false

# Optional: External services
# REACT_APP_SENTRY_DSN=your_sentry_dsn
# REACT_APP_GOOGLE_ANALYTICS_ID=your_ga_id
```

#### Backend Environment

Create `agreeproof-backend/.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/agreeproof_local
# OR use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agreeproof_dev?retryWrites=true&w=majority

# Security Configuration
JWT_SECRET=your_development_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Logging Configuration
LOG_LEVEL=debug

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Optional: External services
# SENDGRID_API_KEY=your_sendgrid_key
# AWS_ACCESS_KEY_ID=your_aws_key
# AWS_SECRET_ACCESS_KEY=your_aws_secret
```

### 4. Database Setup

#### Option A: Local MongoDB

```bash
# Start MongoDB service
# macOS (using Homebrew)
brew services start mongodb-community

# Windows (using services)
net start MongoDB

# Linux (using systemd)
sudo systemctl start mongod
```

#### Option B: MongoDB Atlas (Recommended)

1. **Create a free MongoDB Atlas account**
   - Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account

2. **Create a new cluster**
   - Choose M0 free tier
   - Select a cloud provider and region
   - Wait for cluster creation

3. **Configure network access**
   - Add your current IP address
   - Add `0.0.0.0/0` for development (remove in production)

4. **Create database user**
   - Username: `agreeproof_dev`
   - Password: Generate a strong password
   - Permissions: Read and write to any database

5. **Get connection string**
   ```
   mongodb+srv://agreeproof_dev:<password>@cluster.mongodb.net/agreeproof_dev?retryWrites=true&w=majority
   ```

6. **Update environment variable**
   ```env
   MONGODB_URI=mongodb+srv://agreeproof_dev:<password>@cluster.mongodb.net/agreeproof_dev?retryWrites=true&w=majority
   ```

### 5. Database Indexes

```bash
# Navigate to database directory
cd database

# Install MongoDB Node.js driver (if not installed)
npm install mongodb

# Run index setup script
node indexes.js
```

## 🚀 Local Development

### Starting Development Servers

#### Method 1: Separate Terminals (Recommended)

```bash
# Terminal 1: Start Backend
cd agreeproof-backend
npm run dev

# Terminal 2: Start Frontend
cd agreeproof-frontend
npm start

# Terminal 3: Run Tests (optional)
cd agreeproof-backend
npm run test:watch
```

#### Method 2: Concurrent Script

Create a root-level `package.json` for concurrent development:

```json
{
  "name": "agreeproof-dev",
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd agreeproof-backend && npm run dev",
    "dev:frontend": "cd agreeproof-frontend && npm start",
    "test": "npm run test:backend && npm run test:frontend",
    "test:backend": "cd agreeproof-backend && npm test",
    "test:frontend": "cd agreeproof-frontend && npm test"
  },
  "devDependencies": {
    "concurrently": "^7.6.0"
  }
}
```

Install and run:

```bash
npm install
npm run dev
```

### Access Points

Once servers are running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

### Development Workflow

1. **Make changes to code**
2. **Frontend auto-reloads** (Hot Module Replacement)
3. **Backend restarts automatically** (nodemon)
4. **Test changes** in browser or API client
5. **Run tests** to verify functionality
6. **Commit changes** with descriptive messages

## 🧪 Testing

### Test Structure

```
agreeproof-frontend/
├── src/
│   ├── components/
│   │   ├── CreateAgreementForm.test.tsx
│   │   └── AgreementView.test.tsx
│   └── App.test.tsx

agreeproof-backend/
├── tests/
│   ├── Agreement.test.js
│   ├── generateId.test.js
│   └── setup.js
```

### Running Tests

#### Frontend Tests

```bash
# Run all tests
cd agreeproof-frontend
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

#### Backend Tests

```bash
# Run all tests
cd agreeproof-backend
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### Writing Tests

#### Frontend Test Example

```typescript
// CreateAgreementForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import CreateAgreementForm from './CreateAgreementForm';

test('renders agreement form with all fields', () => {
  render(<CreateAgreementForm />);
  
  expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/party a name/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/party a email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/party b name/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/party b email/i)).toBeInTheDocument();
});

test('submits form with valid data', () => {
  const mockSubmit = jest.fn();
  render(<CreateAgreementForm onSubmit={mockSubmit} />);
  
  fireEvent.change(screen.getByLabelText(/title/i), {
    target: { value: 'Test Agreement' }
  });
  
  fireEvent.click(screen.getByRole('button', { name: /create agreement/i }));
  
  expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({
    title: 'Test Agreement'
  }));
});
```

#### Backend Test Example

```javascript
// Agreement.test.js
const request = require('supertest');
const app = require('../src/app');

describe('Agreement API', () => {
  test('POST /api/agreements/create should create agreement', async () => {
    const agreementData = {
      title: 'Test Agreement',
      content: 'Test content',
      partyA: {
        name: 'John Doe',
        email: 'john@example.com'
      },
      partyB: {
        name: 'Jane Smith',
        email: 'jane@example.com'
      }
    };

    const response = await request(app)
      .post('/api/agreements/create')
      .send(agreementData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.agreementId).toMatch(/^AGP-\d{8}-[A-Z0-9]+$/);
  });
});
```

### Test Coverage

Aim for:
- **Frontend**: >80% line coverage
- **Backend**: >90% line coverage
- **Critical paths**: 100% coverage

## 📝 Code Style Guidelines

### JavaScript/TypeScript Standards

#### ESLint Configuration

Frontend (`.eslintrc.json`):
```json
{
  "extends": [
    "react-app",
    "react-app/jest",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

Backend (`.eslintrc.json`):
```json
{
  "extends": ["eslint:recommended"],
  "rules": {
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error",
    "no-console": "warn"
  }
}
```

#### Code Formatting

Use Prettier for consistent formatting:

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### Naming Conventions

#### Files and Directories

```
components/           # PascalCase for components
  CreateAgreementForm.tsx
  AgreementView.tsx

services/            # camelCase for services
  apiService.ts
  authService.ts

utils/               # camelCase for utilities
  generateId.ts
  validation.ts

hooks/               # camelCase for hooks
  useAgreement.ts
  useAuth.ts
```

#### Variables and Functions

```typescript
// Variables: camelCase
const agreementData = {};
const isConfirmed = true;

// Functions: camelCase, descriptive names
function createAgreement() {}
function validateEmailFormat() {}

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'http://localhost:5000/api';
const MAX_TITLE_LENGTH = 200;

// Classes: PascalCase
class AgreementService {}
class ValidationError {}

// Interfaces: PascalCase with 'I' prefix (optional)
interface IAgreement {}
interface ApiResponse<T> {}
```

### Git Commit Messages

Follow Conventional Commits specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Maintenance tasks

Examples:
```
feat(agreement): add agreement confirmation endpoint
fix(api): handle duplicate agreement ID error
docs(readme): update installation instructions
test(backend): add integration tests for agreement API
```

## 🐛 Debugging

### Frontend Debugging

#### React Developer Tools

1. Install React Developer Tools browser extension
2. Use Components tab to inspect component state
3. Use Profiler tab to analyze performance

#### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug React App",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}/agreeproof-frontend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["start"],
      "port": 3000,
      "webRoot": "${workspaceFolder}/agreeproof-frontend/src"
    }
  ]
}
```

#### Console Debugging

```typescript
// Use console.log for debugging
console.log('Agreement data:', agreementData);

// Use console.table for objects
console.table(agreementData);

// Use debugger statement
debugger; // Pauses execution in browser dev tools
```

### Backend Debugging

#### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/agreeproof-backend/src/server.js",
      "cwd": "${workspaceFolder}/agreeproof-backend",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "restart": true,
      "runtimeExecutable": "nodemon"
    }
  ]
}
```

#### Logging

```javascript
// Use different log levels
console.log('Info message');
console.warn('Warning message');
console.error('Error message');

// Use debug module for conditional logging
const debug = require('debug')('agreeproof:agreement');
debug('Creating agreement with data:', data);
```

#### Database Debugging

```javascript
// Enable MongoDB debugging
process.env.DEBUG = 'mongodb';

// Use MongoDB Compass to inspect data
// Connect to: mongodb://localhost:27017/agreeproof_local
```

## 🔧 Common Issues

### Frontend Issues

#### Issue: "Module not found" error

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

#### Issue: CORS error in development

**Solution**:
Check backend CORS configuration:
```javascript
// agreeproof-backend/src/app.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

#### Issue: Hot reload not working

**Solution**:
```bash
# Check if port 3000 is available
lsof -ti:3000

# Kill process using port 3000
kill -9 $(lsof -ti:3000)

# Restart development server
npm start
```

### Backend Issues

#### Issue: MongoDB connection failed

**Solution**:
```bash
# Check MongoDB service status
# macOS
brew services list | grep mongodb

# Windows
sc query MongoDB

# Linux
sudo systemctl status mongod

# Test connection manually
mongosh "mongodb://localhost:27017/agreeproof_local"
```

#### Issue: Port 5000 already in use

**Solution**:
```bash
# Find process using port 5000
lsof -ti:5000

# Kill process
kill -9 $(lsof -ti:5000)

# Or change port in .env
PORT=5001
```

#### Issue: Environment variables not loading

**Solution**:
```bash
# Verify .env file exists
ls -la .env

# Check dotenv configuration
require('dotenv').config({ path: './.env' });

# Test environment variable
console.log('MONGODB_URI:', process.env.MONGODB_URI);
```

### Database Issues

#### Issue: Slow queries

**Solution**:
```javascript
// Add indexes to improve performance
db.agreements.createIndex({ agreementId: 1 });
db.agreements.createIndex({ status: 1 });
db.agreements.createIndex({ 'partyA.email': 1 });

// Analyze query performance
db.agreements.find({ email: 'test@example.com' }).explain('executionStats');
```

#### Issue: Connection limits exceeded

**Solution**:
```javascript
// Configure connection pooling
const mongoOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
};
```

## 🔄 Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/agreement-signatures

# Make changes
# ... (development work)

# Run tests
npm test

# Commit changes
git add .
git commit -m "feat(agreement): add digital signature support"

# Push to remote
git push origin feature/agreement-signatures
```

### 2. Code Review Process

```bash
# Create pull request
# Request review from team members
# Address feedback
# Merge to develop branch
```

### 3. Release Process

```bash
# Merge develop to main
git checkout main
git merge develop

# Tag release
git tag -a v1.1.0 -m "Release version 1.1.0"

# Push tags
git push origin main --tags
```

## ⚡ Performance Optimization

### Frontend Optimization

#### Bundle Size Analysis

```bash
# Analyze bundle size
cd agreeproof-frontend
npm run build
npm run build:analyze

# Optimize imports
import { createAgreement } from './services/api' // Instead of *
```

#### Code Splitting

```typescript
// Lazy load components
const AgreementView = React.lazy(() => import('./components/AgreementView'));

// Use with Suspense
<Suspense fallback={<div>Loading...</div>}>
  <AgreementView />
</Suspense>
```

### Backend Optimization

#### Database Optimization

```javascript
// Use lean queries for better performance
const agreements = await Agreement.find({ status: 'PENDING' }).lean();

// Implement pagination
const page = 1;
const limit = 10;
const agreements = await Agreement.find()
  .skip((page - 1) * limit)
  .limit(limit);
```

#### Caching Strategy

```javascript
// Implement simple in-memory cache
const cache = new Map();

function getCachedAgreement(id) {
  if (cache.has(id)) {
    return cache.get(id);
  }
  
  const agreement = Agreement.findByAgreementId(id);
  cache.set(id, agreement);
  return agreement;
}
```

## 🔒 Security Best Practices

### Input Validation

```javascript
// Backend validation
const { body, validationResult } = require('express-validator');

app.post('/api/agreements/create', [
  body('title').isLength({ min: 1, max: 200 }).trim().escape(),
  body('content').isLength({ min: 1 }).trim().escape(),
  body('partyA.email').isEmail().normalizeEmail(),
  body('partyB.email').isEmail().normalizeEmail()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // ... proceed with valid data
});
```

### Environment Security

```bash
# Never commit .env files
echo ".env" >> .gitignore

# Use environment-specific configs
cp .env.example .env.local

# Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
requiredEnvVars.forEach(var => {
  if (!process.env[var]) {
    throw new Error(`Missing required environment variable: ${var}`);
  }
});
```

### Error Handling

```javascript
// Don't expose sensitive information in errors
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } else {
    res.status(500).json({
      success: false,
      message: err.message,
      stack: err.stack
    });
  }
});
```

## 📚 Additional Resources

### Documentation

- [React Documentation](https://reactjs.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Tools and Utilities

- [Postman Collections](https://www.postman.com/downloads/)
- [MongoDB Compass](https://www.mongodb.com/try/download/compass)
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/)
- [VS Code Extensions](https://marketplace.visualstudio.com/)

### Community

- [Stack Overflow](https://stackoverflow.com/questions/tagged/agreeproof)
- [GitHub Discussions](https://github.com/your-username/agreeproof/discussions)
- [Discord Community](https://discord.gg/agreeproof)

---

## 📞 Support

For development support:

- **Documentation**: Check this guide and [API.md](API.md)
- **Issues**: [GitHub Issues](https://github.com/your-username/agreeproof/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/agreeproof/discussions)
- **Email**: dev-support@agreeproof.com

Happy coding! 🚀

---

**© 2024 AgreeProof. All rights reserved.**