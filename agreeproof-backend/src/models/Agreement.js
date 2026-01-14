const mongoose = require('mongoose');

const agreementSchema = new mongoose.Schema({
  agreementId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  partyA: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    }
  },
  partyB: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    }
  },
  proofHash: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED'],
    default: 'PENDING'
  },
  confirmedAt: {
    type: Date
  },
  isImmutable: {
    type: Boolean,
    default: false
  },
  shareLink: {
    type: String,
    unique: true
  },
}, {
  timestamps: true
});

// Index for better query performance
agreementSchema.index({ agreementId: 1 });
agreementSchema.index({ status: 1 });
agreementSchema.index({ proofHash: 1 });
agreementSchema.index({ 'partyA.email': 1 });
agreementSchema.index({ 'partyB.email': 1 });
agreementSchema.index({ createdAt: -1 });

// Note: Pre-save middleware temporarily removed for testing
// Will be re-added after basic functionality is confirmed

// Static method to find agreement by ID with proper error handling
agreementSchema.statics.findByAgreementId = function(agreementId) {
  return this.findOne({ agreementId });
};

module.exports = mongoose.model('Agreement', agreementSchema);