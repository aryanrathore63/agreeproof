const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../middleware/auth');

/**
 * Authentication Controller for AgreeProof
 * Handles user registration, login, and token management
 */

// User Registration
const register = async (req, res) => {
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

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
        code: 'USER_EXISTS'
      });
    }

    // Create new user
    const user = await User.createUser({
      name: name.trim(),
      email: email.trim(),
      password
    });

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    console.log(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        },
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration',
      code: 'REGISTRATION_ERROR'
    });
  }
};

// User Login
const login = async (req, res) => {
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

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    console.log(`User logged in: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          lastLogin: user.lastLogin,
          agreementCount: user.agreementCount
        },
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during login',
      code: 'LOGIN_ERROR'
    });
  }
};

// Refresh Token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
        code: 'NO_REFRESH_TOKEN'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
        code: 'USER_NOT_FOUND'
      });
    }

    // Generate new tokens
    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during token refresh',
      code: 'TOKEN_REFRESH_ERROR'
    });
  }
};

// Get Current User Profile
const getProfile = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          lastLogin: user.lastLogin,
          agreementCount: user.agreementCount,
          preferences: user.preferences,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching profile',
      code: 'PROFILE_ERROR'
    });
  }
};

// Update User Profile
const updateProfile = async (req, res) => {
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

    const user = req.user;
    const { name, preferences } = req.body;

    // Update allowed fields
    if (name) {
      user.name = name.trim();
    }

    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    console.log(`Profile updated: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          preferences: user.preferences,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating profile',
      code: 'UPDATE_PROFILE_ERROR'
    });
  }
};

// Change Password
const changePassword = async (req, res) => {
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

    const user = req.user;
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Update password
    user.passwordHash = newPassword;
    await user.save();

    console.log(`Password changed: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while changing password',
      code: 'CHANGE_PASSWORD_ERROR'
    });
  }
};

// Logout (client-side token removal)
const logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is primarily client-side
    // Here we just log the activity and return success
    console.log(`User logged out: ${req.user?.email}`);

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout',
      code: 'LOGOUT_ERROR'
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  logout
};