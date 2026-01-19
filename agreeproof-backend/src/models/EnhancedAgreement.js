const mongoose = require('mongoose');

/**
 * Enhanced Agreement Schema for AgreeProof
 * Supports payment tracking, reminders, and comprehensive agreement management
 */
const EnhancedAgreementSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },

  // Basic agreement details
  title: {
    type: String,
    required: [true, 'Agreement title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP']
  },

  // Party information
  otherPartyName: {
    type: String,
    required: [true, 'Other party name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  otherPartyEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },

  // Date tracking
  agreementDate: {
    type: Date,
    required: [true, 'Agreement date is required'],
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },

  // Status management
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'cancelled'],
    default: 'pending'
  },

  // Payment details
  payment: {
    paymentType: {
      type: String,
      enum: ['UPI', 'CASH', 'CHEQUE', 'BANK_TRANSFER', 'OFFLINE'],
      required: [true, 'Payment type is required']
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    paymentDate: {
      type: Date,
      default: null
    },
    paymentProofUrl: {
      type: String,
      default: null
    },
    // Additional fields for specific payment types
    chequeNumber: {
      type: String,
      trim: true,
      maxlength: [20, 'Cheque number cannot exceed 20 characters']
    },
    bankName: {
      type: String,
      trim: true,
      maxlength: [100, 'Bank name cannot exceed 100 characters']
    },
    upiTransactionId: {
      type: String,
      trim: true,
      maxlength: [50, 'UPI transaction ID cannot exceed 50 characters']
    }
  },

  // Reminder settings
  reminderSettings: {
    enabled: {
      type: Boolean,
      default: true
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'custom'],
      default: 'weekly'
    },
    customDays: {
      type: [Number], // Days before due date
      default: [7, 3, 1, 0] // 1 week, 3 days, 1 day, due day
    },
    lastReminderSent: {
      type: Date,
      default: null
    }
  },

  // Sharing and access
  shareToken: {
    type: String,
    unique: true,
    sparse: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },

  // Proof and verification
  proofHash: {
    type: String,
    required: true
  },
  confirmedAt: {
    type: Date,
    default: null
  },
  isImmutable: {
    type: Boolean,
    default: false
  },

  // Metadata
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Remove sensitive fields if needed
      return ret;
    }
  }
});

// Indexes for better performance
EnhancedAgreementSchema.index({ userId: 1, status: 1 });
EnhancedAgreementSchema.index({ dueDate: 1 });
EnhancedAgreementSchema.index({ shareToken: 1 });
EnhancedAgreementSchema.index({ 'payment.paymentStatus': 1 });
EnhancedAgreementSchema.index({ createdAt: -1 });

// Pre-save middleware to generate share token and proof hash
EnhancedAgreementSchema.pre('save', async function(next) {
  // Generate share token if not present
  if (!this.shareToken && this.isNew) {
    this.shareToken = this.generateShareToken();
  }

  // Generate proof hash if not present
  if (!this.proofHash) {
    this.proofHash = this.generateProofHash();
  }

  // Update status based on due date
  if (this.dueDate && this.status === 'pending' && new Date() > this.dueDate) {
    this.status = 'overdue';
  }

  next();
});

// Instance method to generate share token
EnhancedAgreementSchema.methods.generateShareToken = function() {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
};

// Instance method to generate proof hash
EnhancedAgreementSchema.methods.generateProofHash = function() {
  const crypto = require('crypto');
  const data = `${this.title}${this.description}${this.amount}${this.otherPartyName}${this.dueDate}${Date.now()}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Instance method to mark as paid
EnhancedAgreementSchema.methods.markAsPaid = function(paymentData) {
  this.status = 'paid';
  this.payment.paymentStatus = 'paid';
  this.payment.paymentDate = paymentData.paymentDate || new Date();
  if (paymentData.paymentProofUrl) {
    this.payment.paymentProofUrl = paymentData.paymentProofUrl;
  }
  if (paymentData.chequeNumber) {
    this.payment.chequeNumber = paymentData.chequeNumber;
  }
  if (paymentData.bankName) {
    this.payment.bankName = paymentData.bankName;
  }
  if (paymentData.upiTransactionId) {
    this.payment.upiTransactionId = paymentData.upiTransactionId;
  }
  this.confirmedAt = new Date();
  this.isImmutable = true;
  return this.save();
};

// Instance method to check if overdue
EnhancedAgreementSchema.methods.isOverdue = function() {
  return this.status === 'pending' && new Date() > this.dueDate;
};

// Static method to find user agreements
EnhancedAgreementSchema.statics.findByUser = function(userId, options = {}) {
  const query = { userId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.paymentStatus) {
    query['payment.paymentStatus'] = options.paymentStatus;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

// Static method to find overdue agreements
EnhancedAgreementSchema.statics.findOverdue = function() {
  return this.find({
    status: 'pending',
    dueDate: { $lt: new Date() }
  });
};

// Static method to find agreements needing reminders
EnhancedAgreementSchema.statics.findNeedingReminders = function() {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  return this.find({
    status: 'pending',
    'reminderSettings.enabled': true,
    dueDate: { $gte: now, $lte: tomorrow },
    $or: [
      { 'reminderSettings.lastReminderSent': null },
      { 'reminderSettings.lastReminderSent': { $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }
    ]
  });
};

module.exports = mongoose.model('EnhancedAgreement', EnhancedAgreementSchema);