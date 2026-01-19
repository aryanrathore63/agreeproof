// AgreeProof Backend API - v2.0 - Fixed share links
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://agreeproof.netlify.app',
    'https://agreeproof.vercel.app',
    'https://agreeproof-backend.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enhanced request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const userAgent = req.get('User-Agent') || 'Unknown';
  const ip = req.ip || req.connection.remoteAddress || 'Unknown';
  
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${ip} - User-Agent: ${userAgent}`);
  
  // Log request body for POST/PUT requests (excluding sensitive data)
  if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
    const sanitizedBody = { ...req.body };
    // Remove or mask sensitive fields if any
    if (sanitizedBody.password) sanitizedBody.password = '[MASKED]';
    if (sanitizedBody.token) sanitizedBody.token = '[MASKED]';
    console.log(`Request Body:`, JSON.stringify(sanitizedBody, null, 2));
  }
  
  next();
});

// Request timeout middleware
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    console.error(`Request timeout for ${req.method} ${req.path}`);
    res.status(408).json({
      success: false,
      message: 'Request timeout'
    });
  });
  next();
});

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'AgreeProof API is running',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to check mock database status
app.get('/debug', (req, res) => {
  const { isUsingMock, mockDB } = require('./config/db');
  res.json({
    nodeEnv: process.env.NODE_ENV,
    isRender: process.env.RENDER === 'true',
    isUsingMock: isUsingMock(),
    mockDBConnected: mockDB.connected,
    mockAgreementsCount: mockDB.agreements.length
  });
});

// API routes
// Legacy routes (for backward compatibility)
app.use('/api/agreements', require('./routes/agreementRoutes'));

// New enhanced routes with authentication
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/enhanced-agreements', require('./routes/enhancedAgreementRoutes'));
app.use('/api/cron', require('./routes/cronRoutes'));

// API documentation endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AgreeProof API',
    version: '2.0.0',
    endpoints: {
      // Legacy endpoints (backward compatibility)
      agreements: {
        'POST /api/agreements/create': 'Create new agreement (legacy)',
        'GET /api/agreements/:agreementId': 'Get agreement by ID (legacy)',
        'POST /api/agreements/:agreementId/confirm': 'Confirm agreement (legacy)',
        'GET /api/agreements/:agreementId/status': 'Get agreement status (legacy)'
      },
      // Authentication endpoints
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'User login',
        'POST /api/auth/refresh-token': 'Refresh access token',
        'GET /api/auth/profile': 'Get user profile',
        'PUT /api/auth/profile': 'Update user profile',
        'POST /api/auth/change-password': 'Change password',
        'POST /api/auth/logout': 'User logout',
        'GET /api/auth/health': 'Auth service health check'
      },
      // Enhanced agreement endpoints
      enhancedAgreements: {
        'POST /api/enhanced-agreements': 'Create enhanced agreement',
        'GET /api/enhanced-agreements': 'Get user agreements (paginated)',
        'GET /api/enhanced-agreements/stats': 'Get agreement statistics',
        'GET /api/enhanced-agreements/:agreementId': 'Get agreement by ID',
        'PUT /api/enhanced-agreements/:agreementId': 'Update agreement',
        'DELETE /api/enhanced-agreements/:agreementId': 'Delete agreement',
        'POST /api/enhanced-agreements/:agreementId/confirm': 'Confirm agreement',
        'POST /api/enhanced-agreements/:agreementId/mark-paid': 'Mark as paid',
        'GET /api/enhanced-agreements/shared/:shareToken': 'Get public agreement',
        'GET /api/enhanced-agreements/health': 'Agreement service health check'
      },
      // Cron job management endpoints
      cron: {
        'GET /api/cron/status': 'Get cron job status',
        'POST /api/cron/start': 'Start all cron jobs',
        'POST /api/cron/stop': 'Stop all cron jobs',
        'POST /api/cron/trigger/reminders': 'Trigger daily reminders manually',
        'POST /api/cron/trigger/overdue': 'Trigger overdue check manually',
        'GET /api/cron/email/health': 'Get email service health',
        'POST /api/cron/email/test': 'Send test email'
      },
      health: {
        'GET /health': 'Main health check endpoint',
        'GET /debug': 'Debug endpoint (development)'
      }
    },
    features: [
      'JWT Authentication',
      'Enhanced Agreement Management',
      'Payment Tracking',
      'Public Sharing Links',
      'Reminder System',
      'Status Management',
      'User Profiles'
    ],
    timestamp: new Date().toISOString()
  });
});

// Enhanced 404 handler
app.use((req, res) => {
  const timestamp = new Date().toISOString();
  console.warn(`[404] Route not found: ${req.method} ${req.originalUrl} - ${timestamp}`);
  
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: {
      agreements: {
        'POST /api/agreements/create': 'Create new agreement',
        'GET /api/agreements/:agreementId': 'Get agreement by ID',
        'POST /api/agreements/:agreementId/confirm': 'Confirm agreement',
        'GET /api/agreements/:agreementId/status': 'Get agreement status'
      },
      health: {
        'GET /health': 'Health check endpoint'
      },
      docs: {
        'GET /api': 'API documentation'
      }
    },
    timestamp
  });
});

// Enhanced global error handler
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  
  // Log detailed error information
  console.error(`[${timestamp}] Global Error Handler:`, {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent') || 'Unknown'
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(err.errors).map(error => ({
        field: error.path,
        message: error.message
      })),
      timestamp
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      timestamp
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `Duplicate value for field: ${field}`,
      timestamp
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      timestamp
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      timestamp
    });
  }

  // Handle syntax errors (invalid JSON)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body',
      timestamp
    });
  }

  // Default error response
  const statusCode = err.status || err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    timestamp,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  });
});

// Auto-start cron jobs when app starts (except in test environment)
if (process.env.NODE_ENV !== 'test') {
  setTimeout(() => {
    console.log('🚀 Auto-starting cron jobs...');
    try {
      const cronController = require('./controllers/cronController');
      cronController.startAllTasks();
      console.log('✅ Cron jobs auto-started successfully');
    } catch (error) {
      console.error('❌ Failed to auto-start cron jobs:', error);
    }
  }, 5000); // Wait 5 seconds after server start
}

module.exports = app;