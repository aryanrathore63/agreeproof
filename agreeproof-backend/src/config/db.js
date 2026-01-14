const mongoose = require('mongoose');

// Mock database for testing - stores data in memory
const mockDB = {
  agreements: [],
  connected: false
};

const connectDB = async () => {
  try {
    // For development, use mock database
    if (process.env.NODE_ENV === 'development') {
      mockDB.connected = true;
      console.log('Mock database connected (in-memory storage)');
      return;
    }
    
    // Try to connect to real MongoDB in production
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    // Use mock database as fallback
    mockDB.connected = true;
    console.log('Fallback to mock database (in-memory storage)');
  }
};

// Function to disconnect from database
const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    mockDB.connected = false;
    mockDB.agreements = [];
    console.log('Database disconnected');
  } catch (error) {
    console.error('Error disconnecting from database:', error.message);
  }
};

// Mock database operations for development
const mockOperations = {
  // Create agreement
  createAgreement: async (agreementData) => {
    if (!mockDB.connected) throw new Error('Database not connected');
    
    const agreement = {
      _id: Math.random().toString(36).substr(2, 9),
      ...agreementData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockDB.agreements.push(agreement);
    return agreement;
  },
  
  // Find agreement by ID
  findAgreement: async (agreementId) => {
    if (!mockDB.connected) throw new Error('Database not connected');
    return mockDB.agreements.find(a => a.agreementId === agreementId);
  },
  
  // Update agreement
  updateAgreement: async (agreementId, updateData) => {
    if (!mockDB.connected) throw new Error('Database not connected');
    
    const index = mockDB.agreements.findIndex(a => a.agreementId === agreementId);
    if (index === -1) return null;
    
    mockDB.agreements[index] = {
      ...mockDB.agreements[index],
      ...updateData,
      updatedAt: new Date()
    };
    
    return mockDB.agreements[index];
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  mockDB,
  mockOperations,
  isUsingMock: () => process.env.NODE_ENV === 'development'
};