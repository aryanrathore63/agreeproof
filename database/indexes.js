// MongoDB Atlas Indexes Configuration for AgreeProof
// Run this script in MongoDB Shell or Compass to create optimal indexes

// Connect to your database first:
// use agreeproof

// Agreement Collection Indexes
const agreementIndexes = [
  {
    name: "idx_agreementId_unique",
    key: { "agreementId": 1 },
    unique: true,
    background: true,
    description: "Unique index for agreementId lookups"
  },
  {
    name: "idx_party_emails",
    key: { "partyA.email": 1, "partyB.email": 1 },
    background: true,
    description: "Compound index for party email lookups"
  },
  {
    name: "idx_status",
    key: { "status": 1 },
    background: true,
    description: "Index for status-based queries"
  },
  {
    name: "idx_createdAt_desc",
    key: { "createdAt": -1 },
    background: true,
    description: "Index for date-based queries (newest first)"
  },
  {
    name: "idx_partyA_createdAt",
    key: { "partyA.email": 1, "createdAt": -1 },
    background: true,
    description: "Compound index for Party A agreements by date"
  },
  {
    name: "idx_partyB_createdAt",
    key: { "partyB.email": 1, "createdAt": -1 },
    background: true,
    description: "Compound index for Party B agreements by date"
  },
  {
    name: "idx_proofHash_unique",
    key: { "proofHash": 1 },
    unique: true,
    background: true,
    description: "Unique index for proof hash lookups"
  },
  {
    name: "idx_signatureHash",
    key: { "signatureHash": 1 },
    background: true,
    description: "Index for signature hash lookups"
  },
  {
    name: "idx_partyA_name",
    key: { "partyA.name": 1 },
    background: true,
    description: "Index for Party A name searches"
  },
  {
    name: "idx_partyB_name",
    key: { "partyB.name": 1 },
    background: true,
    description: "Index for Party B name searches"
  },
  {
    name: "idx_title_text",
    key: { "title": "text" },
    background: true,
    description: "Text index for title searches"
  },
  {
    name: "idx_content_text",
    key: { "content": "text" },
    background: true,
    description: "Text index for content searches"
  },
  {
    name: "idx_updatedAt_desc",
    key: { "updatedAt": -1 },
    background: true,
    description: "Index for recently updated agreements"
  },
  {
    name: "idx_confirmedAt",
    key: { "confirmedAt": -1 },
    background: true,
    sparse: true,
    description: "Index for confirmed agreements (sparse)"
  },
  {
    name: "idx_partyA_status_createdAt",
    key: { "partyA.email": 1, "status": 1, "createdAt": -1 },
    background: true,
    description: "Compound index for Party A status and date queries"
  },
  {
    name: "idx_partyB_status_createdAt",
    key: { "partyB.email": 1, "status": 1, "createdAt": -1 },
    background: true,
    description: "Compound index for Party B status and date queries"
  },
  {
    name: "idx_ttl_createdAt",
    key: { "createdAt": 1 },
    expireAfterSeconds: 31536000, // 365 days
    background: true,
    description: "TTL index for automatic cleanup of old records"
  }
];

// Function to create indexes
async function createIndexes(db) {
  console.log("🚀 Creating indexes for AgreeProof database...");
  
  try {
    // Drop existing indexes (except _id)
    const existingIndexes = await db.collection('agreements').listIndexes().toArray();
    for (const index of existingIndexes) {
      if (index.name !== '_id_') {
        await db.collection('agreements').dropIndex(index.name);
        console.log(`🗑️  Dropped index: ${index.name}`);
      }
    }
    
    // Create new indexes
    for (const indexConfig of agreementIndexes) {
      await db.collection('agreements').createIndex(indexConfig.key, {
        name: indexConfig.name,
        unique: indexConfig.unique || false,
        background: indexConfig.background,
        sparse: indexConfig.sparse || false,
        expireAfterSeconds: indexConfig.expireAfterSeconds
      });
      console.log(`✅ Created index: ${indexConfig.name}`);
    }
    
    console.log("🎉 All indexes created successfully!");
    
    // Verify indexes
    const finalIndexes = await db.collection('agreements').listIndexes().toArray();
    console.log("\n📋 Final index list:");
    finalIndexes.forEach(index => {
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
  } catch (error) {
    console.error("❌ Error creating indexes:", error);
    throw error;
  }
}

// Function to analyze query performance
async function analyzeQueries(db) {
  console.log("\n🔍 Analyzing common query patterns...");
  
  const commonQueries = [
    {
      name: "Find by agreementId",
      filter: { "agreementId": "AGP-20240114-ABC123" },
      description: "Primary lookup by agreement ID"
    },
    {
      name: "Find by Party A email",
      filter: { "partyA.email": "user@example.com" },
      description: "User's agreements as Party A"
    },
    {
      name: "Find by Party B email",
      filter: { "partyB.email": "user@example.com" },
      description: "User's agreements as Party B"
    },
    {
      name: "Find by status",
      filter: { "status": "pending" },
      description: "Agreements by status"
    },
    {
      name: "Find recent agreements",
      filter: { "createdAt": { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      description: "Recent agreements (last 7 days)"
    },
    {
      name: "Find by Party A and status",
      filter: { "partyA.email": "user@example.com", "status": "confirmed" },
      description: "User's confirmed agreements as Party A"
    },
    {
      name: "Find by Party B and status",
      filter: { "partyB.email": "user@example.com", "status": "confirmed" },
      description: "User's confirmed agreements as Party B"
    },
    {
      name: "Search by title",
      filter: { $text: { $search: "contract" } },
      description: "Text search in title"
    }
  ];
  
  for (const query of commonQueries) {
    try {
      const explain = await db.collection('agreements').find(query.filter).explain("executionStats");
      const stats = explain.executionStats;
      
      console.log(`\n📊 Query: ${query.name}`);
      console.log(`   Description: ${query.description}`);
      console.log(`   Execution Time: ${stats.executionTimeMillis}ms`);
      console.log(`   Documents Examined: ${stats.totalDocsExamined}`);
      console.log(`   Documents Returned: ${stats.nReturned}`);
      console.log(`   Index Used: ${stats.winningPlan?.inputStage?.indexName || 'COLLSCAN'}`);
      
      if (stats.winningPlan?.inputStage?.stage === 'COLLSCAN') {
        console.log(`   ⚠️  WARNING: Collection scan detected - consider adding an index`);
      }
      
    } catch (error) {
      console.log(`❌ Error analyzing query ${query.name}:`, error.message);
    }
  }
}

// Function to get database statistics
async function getDatabaseStats(db) {
  console.log("\n📈 Database Statistics:");
  
  try {
    const stats = await db.stats();
    console.log(`   Collections: ${stats.collections}`);
    console.log(`   Documents: ${stats.objects}`);
    console.log(`   Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Index Size: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    
    // Agreement collection stats
    const agreementStats = await db.collection('agreements').stats();
    console.log(`\n📋 Agreements Collection:`);
    console.log(`   Documents: ${agreementStats.count}`);
    console.log(`   Avg Document Size: ${agreementStats.avgObjSize} bytes`);
    console.log(`   Indexes: ${agreementStats.nindexes}`);
    
  } catch (error) {
    console.error("❌ Error getting stats:", error);
  }
}

// Function to validate indexes
async function validateIndexes(db) {
  console.log("\n🔍 Validating indexes...");
  
  try {
    const indexes = await db.collection('agreements').listIndexes().toArray();
    const expectedIndexNames = agreementIndexes.map(idx => idx.name);
    
    console.log(`Expected indexes: ${expectedIndexNames.length}`);
    console.log(`Actual indexes: ${indexes.length}`);
    
    const missingIndexes = expectedIndexNames.filter(name => 
      !indexes.some(idx => idx.name === name)
    );
    
    if (missingIndexes.length > 0) {
      console.log("❌ Missing indexes:");
      missingIndexes.forEach(name => console.log(`   - ${name}`));
    } else {
      console.log("✅ All expected indexes are present");
    }
    
    // Check for duplicate indexes
    const duplicateIndexes = indexes.filter((index, i, arr) => 
      arr.findIndex(idx => idx.name === index.name) !== i
    );
    
    if (duplicateIndexes.length > 0) {
      console.log("⚠️  Duplicate indexes found:");
      duplicateIndexes.forEach(idx => console.log(`   - ${idx.name}`));
    }
    
  } catch (error) {
    console.error("❌ Error validating indexes:", error);
  }
}

// Main execution function
async function setupDatabase() {
  const { MongoClient } = require('mongodb');
  
  // Connection string - replace with your actual connection string
  const uri = process.env.MONGODB_URI || "mongodb+srv://username:password@cluster.mongodb.net/agreeproof";
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("🔗 Connected to MongoDB Atlas");
    
    const db = client.db();
    
    // Run all setup functions
    await createIndexes(db);
    await validateIndexes(db);
    await getDatabaseStats(db);
    await analyzeQueries(db);
    
    console.log("\n🎉 Database setup completed successfully!");
    
  } catch (error) {
    console.error("❌ Database setup failed:", error);
  } finally {
    await client.close();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Export functions for use in other scripts
module.exports = {
  createIndexes,
  analyzeQueries,
  getDatabaseStats,
  validateIndexes,
  agreementIndexes,
  setupDatabase
};

// Run if called directly
if (require.main === module) {
  setupDatabase();
}

// Usage instructions:
/*
1. Install MongoDB Node.js Driver: npm install mongodb
2. Set environment variable: export MONGODB_URI="your_connection_string"
3. Run the script: node indexes.js

Or run directly in MongoDB Shell:
1. Connect to your cluster: mongo "your_connection_string"
2. Load this script: load("indexes.js")
3. Run setup: setupDatabase()

For individual operations:
- createIndexes(db) - Create all indexes
- validateIndexes(db) - Validate existing indexes
- getDatabaseStats(db) - Get database statistics
- analyzeQueries(db) - Analyze query performance
*/