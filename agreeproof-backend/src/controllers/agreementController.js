const Agreement = require('../models/Agreement');
const { generateAgreementId, generateProofHash, validateEmail } = require('../utils/generateId');
const { mockOperations, isUsingMock } = require('../config/db');

/**
 * Create Agreement API (POST /api/agreements/create)
 * Accept title, content, partyA, and partyB in request body
 * Generate unique agreement ID using the generateId utility
 * Create SHA256 proof hash for verification
 * Save agreement with PENDING status
 * Return agreementId and shareLink
 */
const createAgreement = async (req, res) => {
  try {
    console.log('Creating new agreement with data:', { ...req.body, partyA: { ...req.body.partyA, email: req.body.partyA?.email }, partyB: { ...req.body.partyB, email: req.body.partyB?.email } });

    const { title, content, partyA, partyB } = req.body;

    // Input validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title is required and must be a non-empty string'
      });
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Content is required and must be a non-empty string'
      });
    }

    if (!partyA || !partyA.name || !partyA.email) {
      return res.status(400).json({
        success: false,
        message: 'Party A name and email are required'
      });
    }

    if (!partyB || !partyB.name || !partyB.email) {
      return res.status(400).json({
        success: false,
        message: 'Party B name and email are required'
      });
    }

    // Validate email formats (trim before validation)
    if (!validateEmail(partyA.email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Party A email is not valid'
      });
    }

    if (!validateEmail(partyB.email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Party B email is not valid'
      });
    }

    // Check if partyA and partyB are the same (trim and lowercase before comparison)
    if (partyA.email.trim().toLowerCase() === partyB.email.trim().toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'Party A and Party B cannot be the same'
      });
    }

    // Generate unique agreement ID
    const agreementId = generateAgreementId();
    const timestamp = new Date().toISOString();

    // Generate SHA256 proof hash for verification
    const proofHash = generateProofHash(
      agreementId,
      title.trim(),
      content.trim(),
      partyA.email.toLowerCase(),
      partyB.email.toLowerCase(),
      timestamp
    );

    // Create new agreement
    let agreement;
    
    if (isUsingMock()) {
      // Use mock database
      agreement = await mockOperations.createAgreement({
        agreementId,
        title: title.trim(),
        content: content.trim(),
        partyA: {
          name: partyA.name.trim(),
          email: partyA.email.toLowerCase().trim()
        },
        partyB: {
          name: partyB.name.trim(),
          email: partyB.email.toLowerCase().trim()
        },
        proofHash,
        status: 'PENDING',
        shareLink: `https://agreeproof.com/agreement/${agreementId}`
      });
    } else {
      // Use real MongoDB
      agreement = new Agreement({
        agreementId,
        title: title.trim(),
        content: content.trim(),
        partyA: {
          name: partyA.name.trim(),
          email: partyA.email.toLowerCase().trim()
        },
        partyB: {
          name: partyB.name.trim(),
          email: partyB.email.toLowerCase().trim()
        },
        proofHash,
        status: 'PENDING',
        shareLink: `https://agreeproof.com/agreement/${agreementId}`
      });
      await agreement.save();
    }

    console.log(`Agreement created successfully: ${agreementId}`);

    // Return agreementId and shareLink
    res.status(201).json({
      success: true,
      message: 'Agreement created successfully',
      data: {
        agreementId: agreement.agreementId,
        shareLink: agreement.shareLink,
        status: agreement.status,
        createdAt: agreement.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating agreement:', error);
    
    // Handle duplicate key error (agreementId already exists)
    if (error.code === 11000) {
      return res.status(500).json({
        success: false,
        message: 'Duplicate agreement ID generated. Please try again.'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while creating agreement'
    });
  }
};

/**
 * Get Agreement API (GET /api/agreements/:agreementId)
 * Fetch agreement by agreementId
 * Return all agreement details except sensitive fields
 * Handle 404 for non-existent agreements
 */
const getAgreement = async (req, res) => {
  try {
    const { agreementId } = req.params;

    console.log(`Fetching agreement: ${agreementId}`);

    // Validate agreementId parameter
    if (!agreementId || typeof agreementId !== 'string' || agreementId.trim().length === 0 || agreementId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Valid agreement ID is required'
      });
    }

    // Find agreement by agreementId
    let agreement;
    
    if (isUsingMock()) {
      // Use mock database
      agreement = await mockOperations.findAgreement(agreementId);
    } else {
      // Use real MongoDB
      agreement = await Agreement.findByAgreementId(agreementId);
    }

    if (!agreement) {
      console.log(`Agreement not found: ${agreementId}`);
      return res.status(404).json({
        success: false,
        message: 'Agreement not found'
      });
    }

    console.log(`Agreement found: ${agreementId}, status: ${agreement.status}`);

    // Return agreement details (excluding sensitive internal fields)
    const agreementData = {
      agreementId: agreement.agreementId,
      title: agreement.title,
      content: agreement.content,
      partyA: {
        name: agreement.partyA.name,
        email: agreement.partyA.email
      },
      partyB: {
        name: agreement.partyB.name,
        email: agreement.partyB.email
      },
      status: agreement.status,
      proofHash: agreement.proofHash,
      shareLink: agreement.shareLink,
      createdAt: agreement.createdAt,
      updatedAt: agreement.updatedAt,
      confirmedAt: agreement.confirmedAt,
      isImmutable: agreement.isImmutable
    };

    res.status(200).json({
      success: true,
      message: 'Agreement retrieved successfully',
      data: agreementData
    });

  } catch (error) {
    console.error('Error fetching agreement:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching agreement'
    });
  }
};

/**
 * Confirm Agreement API (POST /api/agreements/:agreementId/confirm)
 * Find agreement by ID
 * Update status to CONFIRMED
 * Set confirmedAt timestamp
 * Make agreement immutable (prevent further changes)
 * Return confirmation message with timestamp
 */
const confirmAgreement = async (req, res) => {
  try {
    const { agreementId } = req.params;

    console.log(`Confirming agreement: ${agreementId}`);

    // Validate agreementId parameter
    if (!agreementId || typeof agreementId !== 'string' || agreementId.trim().length === 0 || agreementId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Valid agreement ID is required'
      });
    }

    // Find agreement by agreementId
    let agreement;
    
    if (isUsingMock()) {
      // Use mock database
      agreement = await mockOperations.findAgreement(agreementId);
    } else {
      // Use real MongoDB
      agreement = await Agreement.findByAgreementId(agreementId);
    }

    if (!agreement) {
      console.log(`Agreement not found for confirmation: ${agreementId}`);
      return res.status(404).json({
        success: false,
        message: 'Agreement not found'
      });
    }

    // Check if agreement is already confirmed
    if (agreement.status === 'CONFIRMED') {
      return res.status(400).json({
        success: false,
        message: 'Agreement is already confirmed',
        data: {
          confirmedAt: agreement.confirmedAt,
          status: agreement.status
        }
      });
    }

    // Check if agreement is immutable (shouldn't happen if status is PENDING, but defensive check)
    if (agreement.isImmutable) {
      return res.status(400).json({
        success: false,
        message: 'Agreement cannot be modified'
      });
    }

    // Update agreement status to CONFIRMED
    const confirmedAt = new Date();
    const updateData = {
      status: 'CONFIRMED',
      confirmedAt: confirmedAt,
      isImmutable: true
    };
    
    if (isUsingMock()) {
      // Use mock database
      agreement = await mockOperations.updateAgreement(agreementId, updateData);
    } else {
      // Use real MongoDB
      agreement.status = 'CONFIRMED';
      agreement.confirmedAt = confirmedAt;
      agreement.isImmutable = true;
      await agreement.save();
    }

    console.log(`Agreement confirmed successfully: ${agreementId} at ${confirmedAt.toISOString()}`);

    // Return confirmation message with timestamp
    res.status(200).json({
      success: true,
      message: 'Agreement confirmed successfully',
      data: {
        agreementId: agreement.agreementId,
        status: agreement.status,
        confirmedAt: agreement.confirmedAt,
        isImmutable: agreement.isImmutable,
        shareLink: agreement.shareLink
      }
    });

  } catch (error) {
    console.error('Error confirming agreement:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Handle immutability error
    if (error.message === 'Cannot modify immutable agreement') {
      return res.status(400).json({
        success: false,
        message: 'Agreement cannot be modified after confirmation'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while confirming agreement'
    });
  }
};

/**
 * Get Agreement Status (GET /api/agreements/:agreementId/status)
 * Helper endpoint to check agreement status
 */
const getAgreementStatus = async (req, res) => {
  try {
    const { agreementId } = req.params;

    if (!agreementId || typeof agreementId !== 'string' || agreementId.trim().length === 0 || agreementId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Valid agreement ID is required'
      });
    }

    let agreement;
    
    if (isUsingMock()) {
      // Use mock database
      agreement = await mockOperations.findAgreement(agreementId);
    } else {
      // Use real MongoDB
      agreement = await Agreement.findByAgreementId(agreementId);
    }

    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: 'Agreement not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Status retrieved successfully',
      data: {
        agreementId: agreement.agreementId,
        status: agreement.status,
        confirmedAt: agreement.confirmedAt,
        isImmutable: agreement.isImmutable
      }
    });

  } catch (error) {
    console.error('Error fetching agreement status:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching agreement status'
    });
  }
};

module.exports = {
  createAgreement,
  getAgreement,
  confirmAgreement,
  getAgreementStatus
};