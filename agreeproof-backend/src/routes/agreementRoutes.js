const express = require('express');
const router = express.Router();

// Import controller methods
const {
  createAgreement,
  getAgreement,
  confirmAgreement,
  getAgreementStatus
} = require('../controllers/agreementController');

/**
 * Agreement Routes for AgreeProof API
 * 
 * Endpoints:
 * POST /api/agreements/create - Create new agreement
 * GET /api/agreements/:agreementId - Get agreement by ID
 * POST /api/agreements/:agreementId/confirm - Confirm agreement
 * GET /api/agreements/:agreementId/status - Get agreement status
 */

// Route-specific middleware for logging
router.use((req, res, next) => {
  console.log(`Agreement Route: ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

/**
 * POST /api/agreements/create
 * Create Agreement API
 * Accept title, content, partyA, and partyB in request body
 * Generate unique agreement ID using the generateId utility
 * Create SHA256 proof hash for verification
 * Save agreement with PENDING status
 * Return agreementId and shareLink
 */
router.post('/create', createAgreement);

/**
 * GET /api/agreements/:agreementId
 * Get Agreement API
 * Fetch agreement by agreementId
 * Return all agreement details except sensitive fields
 * Handle 404 for non-existent agreements
 */
router.get('/:agreementId', getAgreement);

/**
 * POST /api/agreements/:agreementId/confirm
 * Confirm Agreement API
 * Find agreement by ID
 * Update status to CONFIRMED
 * Set confirmedAt timestamp
 * Make agreement immutable (prevent further changes)
 * Return confirmation message with timestamp
 */
router.post('/:agreementId/confirm', confirmAgreement);

/**
 * GET /api/agreements/:agreementId/status
 * Get Agreement Status API
 * Helper endpoint to check agreement status
 */
router.get('/:agreementId/status', getAgreementStatus);

// Route-specific error handler
router.use((error, req, res, next) => {
  console.error('Agreement Route Error:', error);
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: error.message
    });
  }
  
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Resource already exists',
      error: error.message
    });
  }
  
  // Default error response
  res.status(500).json({
    success: false,
    message: 'Internal server error in agreement routes',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

module.exports = router;