const { body, validationResult } = require('express-validator');
const EnhancedAgreement = require('../models/EnhancedAgreement');
const User = require('../models/User');
const { generateId } = require('../utils/generateId');
const crypto = require('crypto');
const { emailService } = require('../config/email');
const { cloudinaryUtils } = require('../config/cloudinary');

/**
 * Enhanced Agreement Controller for AgreeProof
 * Handles agreement creation, management, and payment tracking with authentication
 */

// Create Agreement (Authenticated)
const createAgreement = async (req, res) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }

    const {
      title,
      content,
      partyA,
      partyB,
      amount,
      dueDate,
      paymentType,
      reminderSettings
    } = req.body;

    const user = req.user;

    // Generate unique IDs
    const agreementId = generateId();
    const shareToken = generateId();

    // Create proof hash
    const proofHash = crypto.createHash('sha256')
      .update(JSON.stringify({
        title,
        content,
        partyA,
        partyB,
        amount,
        dueDate,
        timestamp: Date.now()
      }))
      .digest('hex');

    // Create agreement
    const agreement = await EnhancedAgreement.create({
      agreementId,
      title: title.trim(),
      content: content.trim(),
      partyA: {
        name: partyA.name.trim(),
        contact: partyA.contact.trim(),
        isCreator: true
      },
      partyB: {
        name: partyB.name.trim(),
        contact: partyB.contact.trim(),
        isCreator: false
      },
      amount: amount || 0,
      dueDate: dueDate ? new Date(dueDate) : null,
      paymentType: paymentType || 'OFFLINE',
      reminderSettings: {
        enabled: reminderSettings?.enabled || true,
        daysBefore: reminderSettings?.daysBefore || 3,
        frequency: reminderSettings?.frequency || 'daily'
      },
      createdBy: user._id,
      proofHash,
      shareToken
    });

    // Update user's agreement count
    await User.findByIdAndUpdate(user._id, {
      $inc: { agreementCount: 1 }
    });

    console.log(`Agreement created: ${agreementId} by ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'Agreement created successfully',
      data: {
        agreement: {
          id: agreement._id,
          agreementId: agreement.agreementId,
          title: agreement.title,
          status: agreement.status,
          amount: agreement.amount,
          dueDate: agreement.dueDate,
          createdAt: agreement.createdAt
        },
        shareLink: `${process.env.FRONTEND_URL}/a/${agreementId}`,
        publicLink: `${process.env.FRONTEND_URL}/shared/${shareToken}`
      }
    });

  } catch (error) {
    console.error('Create agreement error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating agreement',
      code: 'CREATE_AGREEMENT_ERROR'
    });
  }
};

// Get User's Agreements
const getUserAgreements = async (req, res) => {
  try {
    const user = req.user;
    const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build query
    const query = { createdBy: user._id };
    if (status) {
      query.status = status.toUpperCase();
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const agreements = await EnhancedAgreement.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-proofHash -shareToken');

    const total = await EnhancedAgreement.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Agreements retrieved successfully',
      data: {
        agreements,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get user agreements error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching agreements',
      code: 'GET_AGREEMENTS_ERROR'
    });
  }
};

// Get Agreement by ID (Authenticated)
const getAgreementById = async (req, res) => {
  try {
    const { agreementId } = req.params;
    const user = req.user;

    const agreement = await EnhancedAgreement.findOne({ 
      agreementId,
      createdBy: user._id 
    }).select('-proofHash -shareToken');

    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: 'Agreement not found',
        code: 'AGREEMENT_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Agreement retrieved successfully',
      data: { agreement }
    });

  } catch (error) {
    console.error('Get agreement error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching agreement',
      code: 'GET_AGREEMENT_ERROR'
    });
  }
};

// Get Public Agreement (Share Link)
const getPublicAgreement = async (req, res) => {
  try {
    const { shareToken } = req.params;

    const agreement = await EnhancedAgreement.findOne({ shareToken })
      .select('-proofHash -shareToken -createdBy');

    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: 'Agreement not found',
        code: 'AGREEMENT_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Public agreement retrieved successfully',
      data: { agreement }
    });

  } catch (error) {
    console.error('Get public agreement error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching public agreement',
      code: 'GET_PUBLIC_AGREEMENT_ERROR'
    });
  }
};

// Confirm Agreement
const confirmAgreement = async (req, res) => {
  try {
    const { agreementId } = req.params;

    const agreement = await EnhancedAgreement.findOne({ agreementId });
    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: 'Agreement not found',
        code: 'AGREEMENT_NOT_FOUND'
      });
    }

    if (agreement.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Agreement cannot be confirmed',
        code: 'AGREEMENT_NOT_CONFIRMABLE'
      });
    }

    // Update agreement status
    agreement.status = 'CONFIRMED';
    agreement.confirmedAt = new Date();
    await agreement.save();

    console.log(`Agreement confirmed: ${agreementId}`);

    // Send confirmation email
    try {
      await emailService.sendAgreementConfirmation(agreement);
      console.log(`✅ Confirmation email sent for agreement ${agreementId}`);
    } catch (emailError) {
      console.error(`❌ Failed to send confirmation email for ${agreementId}:`, emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Agreement confirmed successfully',
      data: {
        agreementId: agreement.agreementId,
        status: agreement.status,
        confirmedAt: agreement.confirmedAt
      }
    });

  } catch (error) {
    console.error('Confirm agreement error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while confirming agreement',
      code: 'CONFIRM_AGREEMENT_ERROR'
    });
  }
};

// Mark Agreement as Paid
const markAsPaid = async (req, res) => {
  try {
    const { agreementId } = req.params;
    const { paymentDate, paymentNotes, paymentProofUrl } = req.body;
    const user = req.user;

    const agreement = await EnhancedAgreement.findOne({ 
      agreementId,
      createdBy: user._id 
    });

    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: 'Agreement not found',
        code: 'AGREEMENT_NOT_FOUND'
      });
    }

    if (agreement.status === 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'Agreement is already marked as paid',
        code: 'ALREADY_PAID'
      });
    }

    // Mark as paid
    agreement.markAsPaid({
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      paymentNotes,
      paymentProofUrl
    });

    await agreement.save();

    console.log(`Agreement marked as paid: ${agreementId} by ${user.email}`);

    // Send payment received email
    try {
      await emailService.sendPaymentReceived(agreement);
      console.log(`✅ Payment received email sent for agreement ${agreementId}`);
    } catch (emailError) {
      console.error(`❌ Failed to send payment received email for ${agreementId}:`, emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Agreement marked as paid successfully',
      data: {
        agreementId: agreement.agreementId,
        status: agreement.status,
        payment: agreement.payment
      }
    });

  } catch (error) {
    console.error('Mark as paid error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while marking agreement as paid',
      code: 'MARK_PAID_ERROR'
    });
  }
};

// Update Agreement
const updateAgreement = async (req, res) => {
  try {
    const { agreementId } = req.params;
    const { title, content, dueDate, reminderSettings } = req.body;
    const user = req.user;

    const agreement = await EnhancedAgreement.findOne({ 
      agreementId,
      createdBy: user._id 
    });

    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: 'Agreement not found',
        code: 'AGREEMENT_NOT_FOUND'
      });
    }

    // Only allow updates if agreement is pending
    if (agreement.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update confirmed or paid agreements',
        code: 'AGREEMENT_NOT_UPDATABLE'
      });
    }

    // Update allowed fields
    if (title) agreement.title = title.trim();
    if (content) agreement.content = content.trim();
    if (dueDate) agreement.dueDate = new Date(dueDate);
    if (reminderSettings) {
      agreement.reminderSettings = { ...agreement.reminderSettings, ...reminderSettings };
    }

    // Update proof hash
    agreement.proofHash = crypto.createHash('sha256')
      .update(JSON.stringify({
        title: agreement.title,
        content: agreement.content,
        partyA: agreement.partyA,
        partyB: agreement.partyB,
        amount: agreement.amount,
        dueDate: agreement.dueDate,
        timestamp: Date.now()
      }))
      .digest('hex');

    await agreement.save();

    console.log(`Agreement updated: ${agreementId} by ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Agreement updated successfully',
      data: {
        agreement: {
          id: agreement._id,
          agreementId: agreement.agreementId,
          title: agreement.title,
          content: agreement.content,
          dueDate: agreement.dueDate,
          updatedAt: agreement.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Update agreement error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating agreement',
      code: 'UPDATE_AGREEMENT_ERROR'
    });
  }
};

// Delete Agreement
const deleteAgreement = async (req, res) => {
  try {
    const { agreementId } = req.params;
    const user = req.user;

    const agreement = await EnhancedAgreement.findOne({ 
      agreementId,
      createdBy: user._id 
    });

    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: 'Agreement not found',
        code: 'AGREEMENT_NOT_FOUND'
      });
    }

    // Only allow deletion if agreement is pending
    if (agreement.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete confirmed or paid agreements',
        code: 'AGREEMENT_NOT_DELETABLE'
      });
    }

    await EnhancedAgreement.deleteOne({ _id: agreement._id });

    // Update user's agreement count
    await User.findByIdAndUpdate(user._id, {
      $inc: { agreementCount: -1 }
    });

    console.log(`Agreement deleted: ${agreementId} by ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Agreement deleted successfully'
    });

  } catch (error) {
    console.error('Delete agreement error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting agreement',
      code: 'DELETE_AGREEMENT_ERROR'
    });
  }
};

// Get Agreement Statistics
const getAgreementStats = async (req, res) => {
  try {
    const user = req.user;

    const stats = await EnhancedAgreement.aggregate([
      { $match: { createdBy: user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const totalAgreements = await EnhancedAgreement.countDocuments({ createdBy: user._id });

    const formattedStats = {
      total: totalAgreements,
      pending: 0,
      confirmed: 0,
      paid: 0,
      overdue: 0,
      cancelled: 0,
      totalValue: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id.toLowerCase()] = stat.count;
      if (stat._id === 'PAID') {
        formattedStats.totalValue = stat.totalAmount;
      }
    });

    res.status(200).json({
      success: true,
      message: 'Agreement statistics retrieved successfully',
      data: { stats: formattedStats }
    });

  } catch (error) {
    console.error('Get agreement stats error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching statistics',
      code: 'GET_STATS_ERROR'
    });
  }
};

module.exports = {
  createAgreement,
  getUserAgreements,
  getAgreementById,
  getPublicAgreement,
  confirmAgreement,
  markAsPaid,
  updateAgreement,
  deleteAgreement,
  getAgreementStats
};