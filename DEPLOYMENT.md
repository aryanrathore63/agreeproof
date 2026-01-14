# AgreeProof Deployment Guide

This comprehensive guide covers the complete deployment process for the AgreeProof application, including frontend (Vercel), backend (Render), and database (MongoDB Atlas) setup.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [CI/CD Configuration](#cicd-configuration)
8. [Security Configuration](#security-configuration)
9. [Monitoring and Logging](#monitoring-and-logging)
10. [Free Tier Optimization](#free-tier-optimization)
11. [Troubleshooting](#troubleshooting)
12. [Maintenance](#maintenance)

## 🎯 Overview

AgreeProof is a full-stack agreement management application with the following architecture:

- **Frontend**: React.js application deployed on Vercel
- **Backend**: Node.js/Express API deployed on Render
- **Database**: MongoDB Atlas cloud database
- **CI/CD**: GitHub Actions for automated deployment
- **Monitoring**: Built-in health checks and logging

### Deployment Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │    Render       │    │  MongoDB Atlas  │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Database)    │
│                 │    │                 │    │                 │
│ - React App     │    │ - Express API   │    │ - Document DB   │
│ - Static Files  │    │ - Business Logic│    │ - Indexes       │
│ - CDN           │    │ - Security      │    │ - Backups       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  GitHub Actions │
                    │   (CI/CD)       │
                    │                 │
                    │ - Tests         │
                    │ - Build         │
                    │ - Deploy        │
                    │ - Security      │
                    └─────────────────┘
```

## 🛠️ Prerequisites

### Required Accounts

1. **GitHub Account** - For code repository and CI/CD
2. **Vercel Account** - For frontend deployment
3. **Render Account** - For backend deployment
4. **MongoDB Atlas Account** - For database hosting
5. **Docker Hub Account** - For container images (optional)

### Required Tools

```bash
# Node.js and npm
node --version  # Should be v18 or higher
npm --version   # Should be v8 or higher

# Git
git --version

# Docker (for local testing)
docker --version
docker-compose --version

# MongoDB CLI tools (optional)
mongosh --version
```

### Environment Variables

Create a secure place to store your environment variables:

```bash
# Recommended: Use a password manager
# Never commit secrets to version control
```

## 🌍 Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/agreeproof.git
cd agreeproof
```

### 2. Install Dependencies

```bash
# Frontend dependencies
cd agreeproof-frontend
npm install

# Backend dependencies
cd ../agreeproof-backend
npm install

# Return to root
cd ..
```

### 3. Local Environment Configuration

#### Frontend (.env.local)

```bash
# agreeproof-frontend/.env.local
REACT_APP_API_BASE_URL=http://localhost:3001
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=local
REACT_APP_BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
REACT_APP_DEBUG=true
```

#### Backend (.env)

```bash
# agreeproof-backend/.env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/agreeproof_local
JWT_SECRET=your_development_secret_key_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

## 🗄️ Database Setup

### 1. MongoDB Atlas Configuration

Follow the detailed setup guide in [`database/MONGODB_ATLAS_SETUP.md`](database/MONGODB_ATLAS_SETUP.md).

### Quick Setup Steps:

1. **Create Cluster**
   - Log in to MongoDB Atlas
   - Create a new cluster (M0 free tier)
   - Choose a cloud provider and region

2. **Configure Network Access**
   - Add your IP address
   - Add Vercel and Render IP ranges

3. **Create Database User**
   - Username: `agreeproof_user`
   - Strong password (save securely)
   - Read and write permissions

4. **Get Connection String**
   ```
   mongodb+srv://agreeproof_user:<password>@cluster.mongodb.net/agreeproof?retryWrites=true&w=majority
   ```

### 2. Create Database Indexes

```bash
# Install MongoDB Node.js driver
npm install mongodb

# Run the index setup script
cd database
node indexes.js
```

### 3. Verify Database Setup

```bash
# Connect to your database
mongosh "your_connection_string"

# Check indexes
use agreeproof
db.agreements.getIndexes()

# Verify connection
db.runCommand({ping: 1})
```

## 🚀 Backend Deployment (Render)

### 1. Prepare Backend for Deployment

#### Update package.json Scripts

Ensure your [`agreeproof-backend/package.json`](agreeproof-backend/package.json) has the production scripts:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "build": "echo 'No build step required for Node.js'",
    "test": "jest",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "lint": "eslint src/",
    "docker:build": "docker build -t agreeproof-backend .",
    "docker:run": "docker run -p 3001:3001 agreeproof-backend"
  }
}
```

#### Create render.yaml

The [`agreeproof-backend/render.yaml`](agreeproof-backend/render.yaml) file is already configured for deployment.

### 2. Deploy to Render

#### Option A: GitHub Integration (Recommended)

1. **Connect GitHub to Render**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select the `agreeproof` repository
   - Choose the `agreeproof-backend` directory

2. **Configure Service**
   ```yaml
   Name: agreeproof-backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

3. **Add Environment Variables**
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_production_jwt_secret
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   ```

#### Option B: Manual Deployment

1. **Install Render CLI**
   ```bash
   npm install -g render-cli
   ```

2. **Deploy**
   ```bash
   cd agreeproof-backend
   render deploy
   ```

### 3. Verify Backend Deployment

```bash
# Health check
curl https://your-app.onrender.com/health

# API test
curl https://your-app.onrender.com/api/agreements
```

## 🎨 Frontend Deployment (Vercel)

### 1. Prepare Frontend for Deployment

#### Update package.json Scripts

Ensure your [`agreeproof-frontend/package.json`](agreeproof-frontend/package.json) has production scripts:

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "build:production": "NODE_ENV=production npm run build",
    "test": "react-scripts test",
    "test:ci": "react-scripts test --ci --coverage --watchAll=false",
    "eject": "react-scripts eject",
    "deploy:vercel": "vercel --prod",
    "type-check": "tsc --noEmit"
  }
}
```

#### Create vercel.json

The [`agreeproof-frontend/vercel.json`](agreeproof-frontend/vercel.json) file is already configured.

### 2. Deploy to Vercel

#### Option A: Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd agreeproof-frontend
   vercel --prod
   ```

3. **Configure Environment Variables**
   ```bash
   vercel env add REACT_APP_API_BASE_URL production
   # Enter: https://your-backend.onrender.com
   
   vercel env add REACT_APP_ENVIRONMENT production
   # Enter: production
   ```

#### Option B: Vercel Dashboard

1. **Import Project**
   - Go to Vercel Dashboard
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select the `agreeproof-frontend` directory

2. **Configure Build Settings**
   ```
   Build Command: npm run build:production
   Output Directory: build
   Install Command: npm install
   ```

3. **Add Environment Variables**
   ```
   REACT_APP_API_BASE_URL=https://your-backend.onrender.com
   REACT_APP_ENVIRONMENT=production
   ```

### 3. Verify Frontend Deployment

```bash
# Check deployment
curl https://your-app.vercel.app

# Check API connectivity
curl https://your-app.vercel.app/api/agreements
```

## 🔄 CI/CD Configuration

### 1. GitHub Actions Setup

The workflows are already configured in:

- [`.github/workflows/frontend-deploy.yml`](.github/workflows/frontend-deploy.yml)
- [`.github/workflows/backend-deploy.yml`](.github/workflows/backend-deploy.yml)

### 2. Required GitHub Secrets

Add these secrets to your GitHub repository:

#### Frontend Secrets
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
REACT_APP_API_BASE_URL=https://your-backend.onrender.com
REACT_APP_ENVIRONMENT=production
```

#### Backend Secrets
```
RENDER_API_KEY=your_render_api_key
RENDER_PRODUCTION_SERVICE_ID=your_render_service_id
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_production_jwt_secret
DOCKER_USERNAME=your_docker_username
DOCKER_PASSWORD=your_docker_password
```

#### Security & Monitoring
```
SNYK_TOKEN=your_snyk_token
SLACK_WEBHOOK_URL=your_slack_webhook_url
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

### 3. Test CI/CD Pipeline

```bash
# Create a test branch
git checkout -b test-deployment

# Make a small change
echo "test" > test.txt

# Commit and push
git add test.txt
git commit -m "Test deployment"
git push origin test-deployment

# Monitor the Actions tab in GitHub
```

## 🔒 Security Configuration

### 1. Backend Security

The security middleware is implemented in [`agreeproof-backend/src/middleware/security.js`](agreeproof-backend/src/middleware/security.js).

#### Key Security Features:

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling
- **Input Sanitization**: XSS and MongoDB injection protection
- **Compression**: Response compression
- **Audit Logging**: Request/response logging

#### Environment Variables for Security:

```bash
# Security settings
NODE_ENV=production
JWT_SECRET=your_strong_jwt_secret_key
CORS_ORIGIN=https://your-vercel-app.vercel.app

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# IP whitelist (optional)
ALLOWED_IPS=ip1,ip2,ip3

# API keys (optional)
API_KEYS=key1,key2,key3
```

### 2. Frontend Security

#### Security Headers (configured in vercel.json):

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 3. Database Security

#### MongoDB Atlas Security:

- **Network Access**: Whitelist specific IPs
- **Database Users**: Strong passwords, minimal permissions
- **Encryption**: TLS/SSL enabled
- **Auditing**: Enable database audit logs

## 📊 Monitoring and Logging

### 1. Application Monitoring

#### Health Endpoints

```bash
# Backend health
GET /health

# Detailed health check
GET /health/detailed

# API status
GET /api/status
```

#### Health Check Response

```json
{
  "status": "healthy",
  "timestamp": "2024-01-14T18:25:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "environment": "production",
  "database": {
    "status": "connected",
    "responseTime": 15
  },
  "memory": {
    "used": "45MB",
    "total": "512MB"
  }
}
```

### 2. Logging Configuration

#### Backend Logging

```javascript
// Configure logging based on environment
const logLevel = process.env.LOG_LEVEL || 'info';

// Log formats
- Development: Detailed, colorful output
- Production: JSON format, structured logs
```

#### Log Levels

```bash
LOG_LEVEL=error    # Only errors
LOG_LEVEL=warn     # Warnings and errors
LOG_LEVEL=info     # Info, warnings, errors
LOG_LEVEL=debug    # All logs (development only)
```

### 3. Error Tracking

#### Recommended Services

1. **Sentry** - Error tracking and performance monitoring
2. **LogRocket** - Session replay and error tracking
3. **Vercel Analytics** - Frontend performance
4. **Render Metrics** - Backend performance

#### Sentry Integration (Optional)

```bash
# Install Sentry
npm install @sentry/node @sentry/tracing

# Configure in backend
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
});
```

## 💰 Free Tier Optimization

### 1. Vercel Optimization

#### Bundle Size Optimization

```json
// package.json
{
  "scripts": {
    "analyze": "npm run build && npx bundlesize"
  },
  "bundlesize": [
    {
      "path": "build/static/js/*.js",
      "maxSize": "500kb"
    },
    {
      "path": "build/static/css/*.css",
      "maxSize": "50kb"
    }
  ]
}
```

#### Caching Strategy

```json
// vercel.json
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 2. Render Optimization

#### Instance Configuration

```yaml
# render.yaml
services:
  - type: web
    name: agreeproof-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /health
    autoDeploy: true
```

#### Performance Optimization

```javascript
// Enable compression
app.use(compression());

// Set connection pooling
const mongoOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Optimize memory usage
process.env.NODE_OPTIONS = '--max-old-space-size=512';
```

### 3. MongoDB Atlas Optimization

#### Free Tier Limits

- **Storage**: 512MB
- **Connections**: 500 simultaneous connections
- **Read/Write**: 100 MB/day data transfer

#### Optimization Strategies

```javascript
// Connection pooling
const mongoOptions = {
  maxPoolSize: 5,        // Reduced for free tier
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000
};

// Index optimization
// Only essential indexes for free tier
const essentialIndexes = [
  { agreementId: 1 },    // Unique
  { "partyA.email": 1 }, // User lookups
  { "partyB.email": 1 }, // User lookups
  { status: 1 },         // Status queries
  { createdAt: -1 }      // Recent items
];
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Frontend Deployment Issues

**Problem**: Build fails on Vercel
```
Error: Module not found: Can't resolve 'module'
```

**Solution**:
```bash
# Check package.json dependencies
cd agreeproof-frontend
npm install

# Verify import paths
grep -r "import.*from" src/

# Check environment variables
vercel env ls
```

**Problem**: API calls failing
```
CORS error: No 'Access-Control-Allow-Origin' header
```

**Solution**:
```bash
# Check backend CORS configuration
# Verify REACT_APP_API_BASE_URL
curl -I https://your-backend.onrender.com/health
```

#### 2. Backend Deployment Issues

**Problem**: Application crashes on startup
```
Error: MongooseServerSelectionError
```

**Solution**:
```bash
# Check MongoDB connection string
# Verify network access in MongoDB Atlas
# Test connection locally
mongosh "your_connection_string"
```

**Problem**: Health check failing
```
Service unhealthy after deployment
```

**Solution**:
```bash
# Check logs in Render dashboard
# Verify health endpoint
curl https://your-app.onrender.com/health

# Check environment variables
printenv | grep MONGODB
```

#### 3. Database Issues

**Problem**: Slow queries
```
Query taking > 1000ms
```

**Solution**:
```bash
# Check query execution plan
db.agreements.find({email: "test@example.com"}).explain("executionStats")

# Add missing indexes
db.agreements.createIndex({email: 1})

# Monitor performance
mongosh --eval "db.runCommand({dbStats: 1})"
```

**Problem**: Connection limits exceeded
```
Too many connections
```

**Solution**:
```bash
# Reduce connection pool size
const mongoOptions = {
  maxPoolSize: 3  // Reduced for free tier
};

# Enable connection draining
process.on('SIGTERM', async () => {
  await mongoose.connection.close();
});
```

#### 4. CI/CD Issues

**Problem**: GitHub Actions failing
```
npm install failed
```

**Solution**:
```bash
# Check Node.js version
node --version  # Should be v18+

# Clear npm cache
npm cache clean --force

# Check package-lock.json
git diff package-lock.json
```

**Problem**: Deployment permissions
```
Permission denied: deploy
```

**Solution**:
```bash
# Check GitHub secrets
gh secret list

# Verify API keys
vercel whoami
render whoami
```

### Debugging Commands

```bash
# Frontend debugging
npm run build
npm run test
npm run lint

# Backend debugging
npm start
npm test
npm run test:integration

# Database debugging
mongosh "connection_string"
db.runCommand({ping: 1})
db.agreements.getIndexes()

# Network debugging
curl -I https://your-app.onrender.com/health
nslookup your-app.onrender.com
```

## 🔄 Maintenance

### Regular Maintenance Tasks

#### Daily

- Check application health endpoints
- Monitor error rates
- Review log files for anomalies

#### Weekly

- Check database performance
- Review security logs
- Update dependencies
- Monitor resource usage

#### Monthly

- Database backup verification
- Security audit
- Performance optimization
- Dependency updates

### Automated Maintenance

#### Database Backups

```bash
# Automated backup script
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="agreeproof_backup_${TIMESTAMP}.gz"

mongodump --uri="$MONGODB_URI" --gzip --archive="$BACKUP_FILE"
aws s3 cp "$BACKUP_FILE" "s3://backup-bucket/backups/"
```

#### Health Monitoring

```bash
# Health check script
#!/bin/bash
FRONTEND_URL="https://your-app.vercel.app"
BACKEND_URL="https://your-backend.onrender.com/health"

# Check frontend
if curl -f "$FRONTEND_URL" > /dev/null 2>&1; then
    echo "✅ Frontend healthy"
else
    echo "❌ Frontend unhealthy"
    # Send alert
fi

# Check backend
if curl -f "$BACKEND_URL" > /dev/null 2>&1; then
    echo "✅ Backend healthy"
else
    echo "❌ Backend unhealthy"
    # Send alert
fi
```

### Dependency Updates

#### Automated Updates

```yaml
# .github/workflows/dependencies.yml
name: Update Dependencies
on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Update dependencies
        run: |
          cd agreeproof-frontend && npm update
          cd ../agreeproof-backend && npm update
      - name: Create PR
        uses: peter-evans/create-pull-request@v5
```

### Performance Monitoring

#### Key Metrics to Monitor

1. **Frontend**
   - Page load time
   - Bundle size
   - Error rate
   - User engagement

2. **Backend**
   - Response time
   - Error rate
   - Memory usage
   - Database query time

3. **Database**
   - Query performance
   - Connection count
   - Storage usage
   - Index efficiency

#### Alerting Setup

```javascript
// Example alerting configuration
const alerts = {
  responseTime: {
    threshold: 1000,  // 1 second
    action: 'notify'
  },
  errorRate: {
    threshold: 0.05,  // 5%
    action: 'escalate'
  },
  memoryUsage: {
    threshold: 0.8,   // 80%
    action: 'restart'
  }
};
```

## 📚 Additional Resources

### Documentation

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.mongodb.com/atlas)
- [GitHub Actions Documentation](https://docs.github.com/actions)

### Best Practices

- [12-Factor App](https://12factor.net/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React Best Practices](https://reactjs.org/docs/thinking-in-react.html)
- [MongoDB Best Practices](https://docs.mongodb.com/manual/administration/)

### Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)
- [MongoDB Security](https://docs.mongodb.com/manual/security/)

## 🆘 Support

If you encounter issues during deployment:

1. **Check the logs** - Both Vercel and Render provide detailed logs
2. **Review this guide** - Most common issues are covered here
3. **Check GitHub Issues** - Look for similar problems
4. **Contact support** - Vercel, Render, and MongoDB Atlas all offer support

### Emergency Contacts

- **Vercel Support**: support@vercel.com
- **Render Support**: support@render.com
- **MongoDB Atlas Support**: atlas-support@mongodb.com

---

## 🎉 Deployment Complete!

Congratulations! You've successfully deployed the AgreeProof application. Here's what you should have:

✅ **Frontend**: Deployed on Vercel with custom domain and SSL  
✅ **Backend**: Deployed on Render with health checks and monitoring  
✅ **Database**: MongoDB Atlas with indexes and security configured  
✅ **CI/CD**: GitHub Actions for automated testing and deployment  
✅ **Security**: Comprehensive security measures implemented  
✅ **Monitoring**: Health checks and logging configured  

### Next Steps

1. **Monitor your applications** - Check health endpoints regularly
2. **Review security** - Conduct regular security audits
3. **Optimize performance** - Monitor and optimize based on usage
4. **Scale as needed** - Upgrade plans as your user base grows

### Quick Access URLs

- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-backend.onrender.com
- **Health Check**: https://your-backend.onrender.com/health
- **API Documentation**: https://your-backend.onrender.com/api/docs

Thank you for using AgreeProof! 🚀