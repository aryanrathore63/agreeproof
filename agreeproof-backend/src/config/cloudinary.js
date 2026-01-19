const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'agreeproof/payment-proofs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
    public_id: (req, file) => {
      // Generate unique filename with agreement ID and timestamp
      const agreementId = req.params.agreementId || 'unknown';
      const timestamp = Date.now();
      const originalName = file.originalname.split('.')[0];
      return `${agreementId}_${timestamp}_${originalName}`;
    },
    resource_type: 'auto',
    transformation: [
      { width: 1200, height: 800, crop: 'limit', quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  }
});

// Configure multer for file uploads
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 3 // Maximum 3 files per upload
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, and PDF files are allowed.'), false);
    }
  }
});

// Upload single file
const uploadSingle = upload.single('paymentProof');

// Upload multiple files
const uploadMultiple = upload.array('paymentProofs', 3);

// Cloudinary utility functions
const cloudinaryUtils = {
  // Upload file from buffer
  uploadFromBuffer: async (buffer, options = {}) => {
    try {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'agreeproof/payment-proofs',
            resource_type: 'auto',
            ...options
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });
      
      return result;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  },

  // Delete file by public ID
  deleteFile: async (publicId) => {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw error;
    }
  },

  // Get file info
  getFileInfo: async (publicId) => {
    try {
      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      console.error('Cloudinary get info error:', error);
      throw error;
    }
  },

  // Generate optimized URL
  getOptimizedUrl: (publicId, options = {}) => {
    const defaultOptions = {
      quality: 'auto',
      fetch_format: 'auto',
      secure: true
    };
    
    return cloudinary.url(publicId, { ...defaultOptions, ...options });
  },

  // Generate thumbnail URL
  getThumbnailUrl: (publicId, width = 300, height = 200) => {
    return cloudinary.url(publicId, {
      width,
      height,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto',
      secure: true
    });
  }
};

// Middleware to handle upload errors
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.',
        code: 'FILE_TOO_LARGE'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 3 files allowed.',
        code: 'TOO_MANY_FILES'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.',
        code: 'UNEXPECTED_FILE'
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message,
      code: 'INVALID_FILE_TYPE'
    });
  }
  
  next(error);
};

// Check if Cloudinary is configured
const isConfigured = () => {
  return !!(process.env.CLOUDINARY_CLOUD_NAME && 
           process.env.CLOUDINARY_API_KEY && 
           process.env.CLOUDINARY_API_SECRET);
};

// Mock Cloudinary for development (if not configured)
const mockCloudinary = {
  uploadSingle: (req, res, next) => {
    if (!isConfigured()) {
      // Mock upload for development
      req.file = {
        filename: 'mock-payment-proof.jpg',
        path: '/mock/path/payment-proof.jpg',
        public_id: 'mock_payment_proof',
        secure_url: 'https://via.placeholder.com/400x300?text=Payment+Proof+Mock'
      };
      return next();
    }
    uploadSingle(req, res, next);
  },
  
  uploadMultiple: (req, res, next) => {
    if (!isConfigured()) {
      // Mock multiple upload for development
      req.files = [
        {
          filename: 'mock-payment-proof-1.jpg',
          path: '/mock/path/payment-proof-1.jpg',
          public_id: 'mock_payment_proof_1',
          secure_url: 'https://via.placeholder.com/400x300?text=Payment+Proof+1'
        }
      ];
      return next();
    }
    uploadMultiple(req, res, next);
  }
};

module.exports = {
  cloudinary,
  uploadSingle: isConfigured() ? uploadSingle : mockCloudinary.uploadSingle,
  uploadMultiple: isConfigured() ? uploadMultiple : mockCloudinary.uploadMultiple,
  cloudinaryUtils,
  handleUploadError,
  isConfigured
};