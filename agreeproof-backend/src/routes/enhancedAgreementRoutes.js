const express = require('express');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const enhancedAgreementController = require('../controllers/enhancedAgreementController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Rate limiting
const agreementLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: {
    success: false,
    message: 'Too many agreement requests, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation rules
const createAgreementValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('content')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Content must be between 10 and 2000 characters'),
  
  body('partyA.name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Party A name must be between 2 and 50 characters'),
  
  body('partyA.contact')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Party A contact must be between 5 and 100 characters'),
  
  body('partyB.name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Party B name must be between 2 and 50 characters'),
  
  body('partyB.contact')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Party B contact must be between 5 and 100 characters'),
  
  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    }),
  
  body('paymentType')
    .optional()
    .isIn(['UPI', 'CASH', 'CHEQUE', 'BANK_TRANSFER', 'OFFLINE'])
    .withMessage('Invalid payment type'),
  
  body('reminderSettings.enabled')
    .optional()
    .isBoolean()
    .withMessage('Reminder enabled must be a boolean'),
  
  body('reminderSettings.daysBefore')
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage('Reminder days before must be between 1 and 30'),
  
  body('reminderSettings.frequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly'])
    .withMessage('Invalid reminder frequency')
];

const updateAgreementValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('content')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Content must be between 10 and 2000 characters'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    }),
  
  body('reminderSettings.enabled')
    .optional()
    .isBoolean()
    .withMessage('Reminder enabled must be a boolean'),
  
  body('reminderSettings.daysBefore')
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage('Reminder days before must be between 1 and 30'),
  
  body('reminderSettings.frequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly'])
    .withMessage('Invalid reminder frequency')
];

const markAsPaidValidation = [
  body('paymentDate')
    .optional()
    .isISO8601()
    .withMessage('Payment date must be a valid date'),
  
  body('paymentNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Payment notes must be less than 500 characters'),
  
  body('paymentProofUrl')
    .optional()
    .isURL()
    .withMessage('Payment proof URL must be a valid URL')
];

// Protected routes (authentication required)

/**
 * @route   POST /api/agreements
 * @desc    Create a new agreement
 * @access  Private
 */
router.post('/', agreementLimiter, authenticate, createAgreementValidation, enhancedAgreementController.createAgreement);

/**
 * @route   GET /api/agreements
 * @desc    Get user's agreements with pagination and filtering
 * @access  Private
 */
router.get('/', generalLimiter, authenticate, enhancedAgreementController.getUserAgreements);

/**
 * @route   GET /api/agreements/stats
 * @desc    Get user's agreement statistics
 * @access  Private
 */
router.get('/stats', generalLimiter, authenticate, enhancedAgreementController.getAgreementStats);

/**
 * @route   GET /api/agreements/:agreementId
 * @desc    Get agreement by ID (owner only)
 * @access  Private
 */
router.get('/:agreementId', generalLimiter, authenticate, enhancedAgreementController.getAgreementById);

/**
 * @route   PUT /api/agreements/:agreementId
 * @desc    Update agreement (owner only, pending agreements only)
 * @access  Private
 */
router.put('/:agreementId', agreementLimiter, authenticate, updateAgreementValidation, enhancedAgreementController.updateAgreement);

/**
 * @route   DELETE /api/agreements/:agreementId
 * @desc    Delete agreement (owner only, pending agreements only)
 * @access  Private
 */
router.delete('/:agreementId', agreementLimiter, authenticate, enhancedAgreementController.deleteAgreement);

/**
 * @route   POST /api/agreements/:agreementId/confirm
 * @desc    Confirm agreement (public endpoint)
 * @access  Public
 */
router.post('/:agreementId/confirm', agreementLimiter, enhancedAgreementController.confirmAgreement);

/**
 * @route   POST /api/agreements/:agreementId/mark-paid
 * @desc    Mark agreement as paid (owner only)
 * @access  Private
 */
router.post('/:agreementId/mark-paid', agreementLimiter, authenticate, markAsPaidValidation, enhancedAgreementController.markAsPaid);

/**
 * @route   GET /api/agreements/shared/:shareToken
 * @desc    Get public agreement by share token
 * @access  Public
 */
router.get('/shared/:shareToken', generalLimiter, enhancedAgreementController.getPublicAgreement);

// Health check endpoint
/**
 * @route   GET /api/agreements/health
 * @desc    Agreement service health check
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Agreement service is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;