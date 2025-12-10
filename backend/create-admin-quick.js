// Quick Admin Account Creator
// Usage: node create-admin-quick.js

const mongoose = require('mongoose');
const User = require('./models/user');

// Admin details - CHANGE THESE!
const ADMIN_CONFIG = {
  name: 'Admin User',
  email: 'admin@rapidride.com',
  phone: '+919876543210',
  password: 'Admin@123456', // Change this to a secure password
  role: 'admin'
};

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rapidride';

async function createAdmin() {
  try {
    console.log('\n🔐 CREATING ADMIN ACCOUNT\n');
    console.log('═'.repeat(60));
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: ADMIN_CONFIG.email },
        { phone: ADMIN_CONFIG.phone }
      ]
    });

    if (existingAdmin) {
      console.log('⚠️  Admin already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Phone: ${existingAdmin.phone}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log('\nTo update password, delete this user from MongoDB first.');
      process.exit(0);
    }

    // Create admin user
    console.log('Creating admin account...');
    const admin = new User({
      name: ADMIN_CONFIG.name,
      email: ADMIN_CONFIG.email,
      phone: ADMIN_CONFIG.phone,
      role: ADMIN_CONFIG.role,
      emailVerified: true,
      phoneVerified: true,
      isActive: true,
      createdAt: new Date()
    });

    // Firebase UID (optional - set if using Firebase auth)
    admin.firebaseUid = `admin_${Date.now()}`;

    await admin.save();

    console.log('\n✅ ADMIN ACCOUNT CREATED SUCCESSFULLY!\n');
    console.log('═'.repeat(60));
    console.log('📧 Email:    ', admin.email);
    console.log('📱 Phone:    ', admin.phone);
    console.log('👤 Name:     ', admin.name);
    console.log('🔑 Password: ', ADMIN_CONFIG.password);
    console.log('👨‍💼 Role:     ', admin.role);
    console.log('═'.repeat(60));
    console.log('\n🌐 Login at:');
    console.log('   Local:  http://localhost:3000/admin/admin_login.html');
    console.log('   Network: http://[YOUR_IP]:3000/admin/admin_login.html');
    console.log('\n⚠️  IMPORTANT: Change password after first login!\n');

  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB\n');
    process.exit(0);
  }
}

// Run
createAdmin();
