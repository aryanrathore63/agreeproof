const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware for AgreeProof
 * Validates JWT tokens and attaches user to request object
 */

// JWT token extraction from request
const extractToken = (req) => {
  let token = null;

  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // Check cookies as fallback
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  return token;
};

// Main authentication middleware
const authenticate = async (req, res, next) => {
  try {
    // Extract token from request
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    const decoded = jwt.verify(token, jwtSecret);

    // Find user in database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Attach user to request object
    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
        code: 'INVALID_TOKEN'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.',
        code: 'TOKEN_EXPIRED'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
      code: 'AUTH_ERROR'
    });
  }
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (token) {
      const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
      const decoded = jwt.verify(token, jwtSecret);
      const user = await User.findById(decoded.userId);

      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id;
      }
    }

    next();
  } catch (error) {
    // Silently continue for optional auth
    console.warn('Optional authentication failed:', error.message);
    next();
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        code: 'AUTH_REQUIRED'
      });
    }

    // For now, all authenticated users have same role
    // This can be extended for admin/moderator roles
    next();
  };
};

// Rate limiting for auth endpoints
const authRateLimit = (req, res, next) => {
  // Simple in-memory rate limiting
  // In production, use Redis or similar
  const clientIp = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 5; // 5 requests per window

  if (!req.authAttempts) {
    req.authAttempts = {};
  }

  if (!req.authAttempts[clientIp]) {
    req.authAttempts[clientIp] = [];
  }

  // Clean old attempts
  req.authAttempts[clientIp] = req.authAttempts[clientIp].filter(
    timestamp => now - timestamp < windowMs
  );

  // Check rate limit
  if (req.authAttempts[clientIp].length >= maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(windowMs / 1000)
    });
  }

  // Add current attempt
  req.authAttempts[clientIp].push(now);

  next();
};

// Generate JWT token
const generateToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    { userId },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );
};

// Refresh token generation
const generateRefreshToken = (userId) => {
  const jwtSecret = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
  const jwtExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

  return jwt.sign(
    { userId, type: 'refresh' },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  const jwtSecret = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
  return jwt.verify(token, jwtSecret);
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  authRateLimit,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  extractToken
};