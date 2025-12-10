require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndex() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    
    // Drop the old email index
    try {
      await collection.dropIndex('email_1');
      console.log('✅ Dropped old email index');
    } catch (e) {
      console.log('⚠️ Email index does not exist or already dropped');
    }
    
    // Create new sparse index
    await collection.createIndex({ email: 1 }, { unique: true, sparse: true });
    console.log('✅ Created new sparse email index');
    
    await mongoose.disconnect();
    console.log('✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixIndex();
