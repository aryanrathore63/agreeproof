# MongoDB Atlas Setup Guide for AgreeProof

This guide walks you through setting up MongoDB Atlas for the AgreeProof application in production.

## Prerequisites

- MongoDB Atlas account (free tier available)
- AgreeProof application code
- Basic understanding of MongoDB concepts

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Start Free" or "Sign Up"
3. Choose your authentication method:
   - Google Account
   - GitHub Account
   - Email and Password
4. Complete the registration process
5. Verify your email address

## Step 2: Create a New Cluster

1. After logging in, click "Build a Database"
2. Choose the **M0 Sandbox** (Free Tier) option:
   - 512 MB storage
   - Shared RAM
   - One cluster per region
3. Select **Cloud Provider & Region**:
   - Provider: AWS, GCP, or Azure
   - Region: Choose the closest region to your users
   - **Important**: Choose the same region as your Render deployment for optimal performance
4. Cluster Settings:
   - Cluster Name: `agreeproof-cluster`
   - Leave other settings as default
5. Click "Create Cluster"

## Step 3: Configure Database Access

### Create Database User

1. Go to **Database Access** under **Security**
2. Click "Add New Database User"
3. Fill in user details:
   - **Username**: `agreeproof-user`
   - **Password**: Generate a strong password (save it securely)
   - **Authentication Method**: SCRAM-SHA-256
4. Set **Database User Privileges**:
   - Read and write to any database
   - Or specify: `agreeproof` database with read/write permissions
5. Click "Add User"

### Configure Network Access

1. Go to **Network Access** under **Security**
2. Click "Add IP Address"
3. Choose **Allow Access from Anywhere** (0.0.0.0/0)
   - **Note**: This is required for cloud deployments like Render
   - For production, consider specific IP ranges for enhanced security
4. Click "Confirm"

## Step 4: Get Connection String

1. Go to **Database** under **Deployment**
2. Click "Connect" for your cluster
3. Choose **Drivers** as connection method
4. Select **Node.js** as driver
5. Copy the connection string
6. Replace `<password>` with your actual database user password
7. Replace `<dbname>` with `agreeproof`

**Example Connection String:**
```
mongodb+srv://agreeproof-user:YOUR_PASSWORD@agreeproof-cluster.xxxxx.mongodb.net/agreeproof?retryWrites=true&w=majority&appName=agreeproof
```

## Step 5: Configure Environment Variables

### For Backend (Render)

1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Add the following environment variables:

```bash
MONGODB_URI=mongodb+srv://agreeproof-user:YOUR_PASSWORD@agreeproof-cluster.xxxxx.mongodb.net/agreeproof?retryWrites=true&w=majority&appName=agreeproof
DB_CONNECTION_TIMEOUT=30000
DB_MAX_POOL_SIZE=10
DB_MIN_POOL_SIZE=2
DB_RETRY_ATTEMPTS=3
DB_RETRY_DELAY=1000
```

### For Local Development

1. Copy `agreeproof-backend/.env.production.example` to `.env.local`
2. Update the `MONGODB_URI` with your actual connection string

## Step 6: Create Database and Collections

### Option 1: Automatic Creation

The AgreeProof application will automatically create:
- Database: `agreeproof`
- Collection: `agreements`

### Option 2: Manual Creation (Optional)

1. Go to **Collections** in Atlas
2. Click "Add My Own Data"
3. Database Name: `agreeproof`
4. Collection Name: `agreements`
5. Click "Create"

## Step 7: Set Up Indexes for Performance

Create the following indexes for optimal performance:

### Agreement Collection Indexes

```javascript
// Connect to your cluster using MongoDB Shell or Compass
// Run these commands in the agreeproof database

// 1. Index for agreementId (unique)
db.agreements.createIndex(
  { "agreementId": 1 },
  { 
    unique: true,
    name: "idx_agreementId_unique"
  }
);

// 2. Index for email lookups
db.agreements.createIndex(
  { "partyA.email": 1, "partyB.email": 1 },
  { 
    name: "idx_party_emails"
  }
);

// 3. Index for status queries
db.agreements.createIndex(
  { "status": 1 },
  { 
    name: "idx_status"
  }
);

// 4. Index for date-based queries
db.agreements.createIndex(
  { "createdAt": -1 },
  { 
    name: "idx_createdAt_desc"
  }
);

// 5. Compound index for party A lookups
db.agreements.createIndex(
  { "partyA.email": 1, "createdAt": -1 },
  { 
    name: "idx_partyA_createdAt"
  }
);

// 6. Compound index for party B lookups
db.agreements.createIndex(
  { "partyB.email": 1, "createdAt": -1 },
  { 
    name: "idx_partyB_createdAt"
  }
);

// 7. Index for proof hash lookups
db.agreements.createIndex(
  { "proofHash": 1 },
  { 
    unique: true,
    name: "idx_proofHash_unique"
  }
);

// 8. Index for signature hash lookups
db.agreements.createIndex(
  { "signatureHash": 1 },
  { 
    name: "idx_signatureHash"
  }
);

// 9. TTL index for temporary data (if needed)
// This will automatically delete documents after 365 days
db.agreements.createIndex(
  { "createdAt": 1 },
  { 
    expireAfterSeconds: 31536000,
    name: "idx_ttl_createdAt"
  }
);
```

## Step 8: Configure Backup and Monitoring

### Free Tier Backup

- MongoDB Atlas free tier includes:
  - Automated backups (last 36 hours)
  - Point-in-time recovery
  - Snapshot backups

### Monitoring Setup

1. Go to **Metrics** in Atlas
2. Monitor:
   - Connection count
   - Query performance
   - Storage usage
   - Network I/O
3. Set up alerts (if available in your plan)

## Step 9: Security Best Practices

### Database Security

1. **Strong Passwords**: Use complex passwords for database users
2. **Least Privilege**: Grant only necessary permissions
3. **Network Access**: Limit IP access when possible
4. **Encryption**: Enable encryption at rest and in transit
5. **Audit Logs**: Monitor database access logs

### Application Security

1. **Environment Variables**: Never commit connection strings to version control
2. **Connection Pooling**: Use connection pooling for performance
3. **Error Handling**: Don't expose database errors to clients
4. **Input Validation**: Validate all inputs before database operations

## Step 10: Performance Optimization

### Connection Pooling

```javascript
// In your database configuration
const mongooseOptions = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  bufferMaxEntries: 0, // Disable mongoose buffering
  bufferCommands: false, // Disable mongoose buffering
};
```

### Query Optimization

1. Use indexes for frequently queried fields
2. Avoid full collection scans
3. Use projection to limit returned fields
4. Implement pagination for large result sets
5. Use aggregation pipelines for complex queries

## Step 11: Scaling Considerations

### When to Upgrade from Free Tier

- Storage approaching 512 MB limit
- High connection count (> 80% of limit)
- Performance degradation
- Need for additional features (custom domains, advanced security)

### Upgrade Options

1. **M2/M5/M10**: Shared clusters with more resources
2. **M20+**: Dedicated clusters
3. **Serverless**: Pay-per-operation model

## Step 12: Troubleshooting

### Common Issues

1. **Connection Timeout**:
   - Check network access settings
   - Verify connection string format
   - Ensure cluster is running

2. **Authentication Failed**:
   - Verify username and password
   - Check database user permissions
   - Ensure correct authentication method

3. **Performance Issues**:
   - Check query execution plans
   - Verify indexes are being used
   - Monitor connection pool usage

### Debug Commands

```javascript
// Check connection status
db.runCommand({ connectionStatus: 1 })

// List all indexes
db.agreements.getIndexes()

// Check query performance
db.agreements.find({ "partyA.email": "test@example.com" }).explain("executionStats")

// Monitor current operations
db.currentOp()
```

## Step 13: Maintenance

### Regular Tasks

1. **Monitor Storage Usage**: Check if approaching limits
2. **Review Performance**: Analyze slow queries
3. **Update Indexes**: Add new indexes as needed
4. **Backup Verification**: Ensure backups are working
5. **Security Audit**: Review user permissions and access

### Cleanup Tasks

```javascript
// Remove old test data (older than 30 days)
db.agreements.deleteMany({
  "createdAt": { 
    $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
  },
  "status": "test"
});

// Compact collection (run during maintenance window)
db.runCommand({ compact: "agreements" })
```

## Step 14: Integration Testing

### Test Connection

```javascript
// Test script to verify database connection
const mongoose = require('mongoose');

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connection successful');
    
    // Test basic operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📁 Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Disconnected successfully');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();
```

## Step 15: Production Deployment Checklist

- [ ] MongoDB Atlas cluster created and running
- [ ] Database user created with strong password
- [ ] Network access configured
- [ ] Connection string obtained and tested
- [ ] Environment variables configured
- [ ] Indexes created for performance
- [ ] Backup and monitoring configured
- [ ] Security best practices implemented
- [ ] Performance optimization applied
- [ ] Integration tests passing
- [ ] Documentation updated

## Support and Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Node.js Driver](https://mongodb.github.io/node-mongodb-native/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB University](https://university.mongodb.com/)
- [MongoDB Community Forums](https://community.mongodb.com/)

## Emergency Contacts

- MongoDB Atlas Support: Available through Atlas dashboard
- AgreeProof Team: support@agreeproof.com
- Emergency Response: emergency@agreeproof.com

---

**Last Updated**: January 14, 2026
**Version**: 1.0.0
**Maintainer**: AgreeProof Team