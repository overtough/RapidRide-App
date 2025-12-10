// Quick MongoDB connection test
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rapidride';

console.log('Testing MongoDB connection...');
console.log('Connection string:', MONGO_URI);

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
})
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    console.log('Connection state:', mongoose.connection.readyState); // 1 = connected
    
    // Test creating a user
    const UserSchema = new mongoose.Schema({
      phone: String,
      firebaseUid: String,
      name: String,
      role: String,
      phoneVerified: Boolean,
      emailVerified: Boolean
    });
    
    const TestUser = mongoose.model('TestUser', UserSchema);
    
    const testUser = new TestUser({
      phone: '+911234567890',
      firebaseUid: 'test_' + Date.now(),
      name: 'Test User',
      role: 'rider',
      phoneVerified: true,
      emailVerified: false
    });
    
    return testUser.save();
  })
  .then((savedUser) => {
    console.log('✅ Test user created successfully:', savedUser._id);
    console.log('User data:', savedUser);
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection/operation failed:', err.message);
    console.error('Error name:', err.name);
    console.error('Error code:', err.code);
    process.exit(1);
  });
