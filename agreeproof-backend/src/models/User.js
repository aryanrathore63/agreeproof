const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema for AgreeProof Authentication
 * Supports user registration, login, and agreement management
 */
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  agreementCount: {
    type: Number,
    default: 0
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    reminderFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'custom'],
      default: 'weekly'
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.passwordHash;
      return ret;
    }
  }
});

// Index for email lookup
UserSchema.index({ email: 1 });

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('passwordHash')) {
    return next();
  }

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Instance method to update last login
UserSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Static method to find user by email
UserSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to create user with validation
UserSchema.statics.createUser = async function(userData) {
  const { name, email, password } = userData;
  
  // Check if user already exists
  const existingUser = await this.findByEmail(email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Create new user
  const user = new this({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: password
  });

  return user.save();
};

module.exports = mongoose.model('User', UserSchema);