// Security Middleware Configuration for AgreeProof Backend
// Implements comprehensive security measures for production deployment

const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const hpp = require('hpp');
const compression = require('compression');

// Security configuration
const securityConfig = {
  // Helmet configuration for security headers
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", process.env.FRONTEND_URL || "http://localhost:3000"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        manifestSrc: ["'self'"],
        workerSrc: ["'self'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
      }
    },
    crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
    crossOriginOpenerPolicy: process.env.NODE_ENV === 'production',
    crossOriginResourcePolicy: { policy: "cross-origin" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: process.env.NODE_ENV === 'production' ? {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    } : false,
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true
  },

  // CORS configuration
  cors: {
    origin: function (origin, callback) {
      const allowedOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'https://vercel.app',
        /\.vercel\.app$/,
        process.env.STAGING_URL,
        process.env.PRODUCTION_URL
      ].filter(Boolean);

      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.some(allowedOrigin => {
        if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        return allowedOrigin === origin;
      })) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'X-API-Key'
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400 // 24 hours
  },

  // Rate limiting configuration
  rateLimit: {
    // General rate limiter
    general: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: function (req, res) {
        res.status(429).json({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
        });
      }
    },

    // Strict rate limiter for sensitive endpoints
    strict: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 requests per windowMs
      message: {
        error: 'Too many sensitive requests from this IP',
        retryAfter: '15 minutes'
      },
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    },

    // API key rate limiter
    apiKey: {
      windowMs: 60 * 1000, // 1 minute
      max: 1000, // limit each API key to 1000 requests per minute
      keyGenerator: (req) => req.headers['x-api-key'] || req.ip,
      handler: function (req, res) {
        res.status(429).json({
          error: 'API rate limit exceeded',
          message: 'Too many requests for this API key',
          retryAfter: 60
        });
      }
    }
  },

  // Input sanitization
  sanitization: {
    mongoSanitize: {
      replaceWith: '_',
      onSanitize: ({ req, key, value }) => {
        console.warn(`MongoDB injection attempt detected: ${key} = ${value}`);
      }
    },
    xss: {
      whiteList: {
        a: ['href', 'title', 'target'],
        b: [],
        br: [],
        em: [],
        strong: [],
        i: [],
        p: [],
        ul: [],
        ol: [],
        li: []
      },
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script']
    }
  },

  // HTTP Parameter Pollution protection
  hpp: {
    whitelist: [
      'sort',
      'fields',
      'page',
      'limit',
      'status',
      'partyA.email',
      'partyB.email'
    ]
  }
};

// Create rate limiters
const createRateLimiters = () => {
  const limiters = {};

  // General rate limiter
  limiters.general = rateLimit(securityConfig.rateLimit.general);

  // Strict rate limiter for sensitive endpoints
  limiters.strict = rateLimit(securityConfig.rateLimit.strict);

  // API key rate limiter
  limiters.apiKey = rateLimit(securityConfig.rateLimit.apiKey);

  return limiters;
};

// XSS protection middleware
const xssProtection = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key], securityConfig.sanitization.xss);
      }
    });
  }

  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = xss(req.query[key], securityConfig.sanitization.xss);
      }
    });
  }

  if (req.params) {
    Object.keys(req.params).forEach(key => {
      if (typeof req.params[key] === 'string') {
        req.params[key] = xss(req.params[key], securityConfig.sanitization.xss);
      }
    });
  }

  next();
};

// Request validation middleware
const requestValidator = (req, res, next) => {
  // Check request size
  const contentLength = req.get('content-length');
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
    return res.status(413).json({
      error: 'Request too large',
      message: 'Request size exceeds maximum allowed limit'
    });
  }

  // Validate content type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({
        error: 'Unsupported media type',
        message: 'Content-Type must be application/json'
      });
    }
  }

  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Additional custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Remove server information
  res.removeHeader('Server');
  
  next();
};

// IP whitelist middleware (optional)
const ipWhitelist = (req, res, next) => {
  const allowedIPs = process.env.ALLOWED_IPS ? process.env.ALLOWED_IPS.split(',') : [];
  
  if (allowedIPs.length > 0) {
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    
    if (!allowedIPs.includes(clientIP)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Your IP address is not allowed to access this resource'
      });
    }
  }
  
  next();
};

// API key validation middleware
const apiKeyValidator = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKeys = process.env.API_KEYS ? process.env.API_KEYS.split(',') : [];
  
  // Skip API key validation for health check and public endpoints
  const publicEndpoints = ['/health', '/api/docs', '/api/status'];
  if (publicEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
    return next();
  }
  
  if (validApiKeys.length > 0 && !validApiKeys.includes(apiKey)) {
    return res.status(401).json({
      error: 'Invalid API key',
      message: 'A valid API key is required to access this resource'
    });
  }
  
  next();
};

// Audit logging middleware
const auditLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request details
  console.log('AUDIT:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    apiKey: req.headers['x-api-key'] ? 'present' : 'absent'
  });
  
  // Log response details
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log('AUDIT RESPONSE:', {
      timestamp: new Date().toISOString(),
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      url: req.url
    });
  });
  
  next();
};

// Initialize security middleware
const initializeSecurity = (app) => {
  const rateLimiters = createRateLimiters();

  // Apply security middleware in order
  app.use(helmet(securityConfig.helmet));
  app.use(securityHeaders);
  app.use(compression());
  app.use(cors(securityConfig.cors));
  app.use(requestValidator);
  app.use(mongoSanitize(securityConfig.sanitization.mongoSanitize));
  app.use(xssProtection);
  app.use(hpp(securityConfig.hpp));
  app.use(auditLogger);

  // Apply rate limiters
  app.use('/api/', rateLimiters.general);
  app.use('/api/auth/', rateLimiters.strict);
  app.use('/api/agreements', rateLimiters.strict);

  // Conditional middleware based on environment
  if (process.env.NODE_ENV === 'production') {
    app.use('/api/admin/', ipWhitelist);
    app.use('/api/admin/', apiKeyValidator);
    app.use('/api/', rateLimiters.apiKey);
  }

  return rateLimiters;
};

module.exports = {
  initializeSecurity,
  securityConfig,
  rateLimiters: createRateLimiters(),
  middleware: {
    xssProtection,
    requestValidator,
    securityHeaders,
    ipWhitelist,
    apiKeyValidator,
    auditLogger
  }
};