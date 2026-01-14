require('dotenv').config();
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to database (but don't exit if it fails for testing)
connectDB().catch(err => {
  console.warn('Database connection failed, but server will continue running:', err.message);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('Available endpoints:');
  console.log('  GET  /health - Health check');
  console.log('  GET  /api - API documentation');
  console.log('  POST /api/agreements/create - Create agreement');
  console.log('  GET  /api/agreements/:id - Get agreement');
  console.log('  POST /api/agreements/:id/confirm - Confirm agreement');
  console.log('  GET  /api/agreements/:id/status - Get agreement status');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Error: ', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('Error: ', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(async () => {
    await disconnectDB();
    console.log('Process terminated');
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully');
  server.close(async () => {
    await disconnectDB();
    console.log('Process terminated');
  });
});

module.exports = server;