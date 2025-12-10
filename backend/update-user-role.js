// Script to update user role in MongoDB
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rapidride';

async function updateUserRole() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get phone number or email from command line
    const identifier = process.argv[2]; // phone or email
    const newRole = process.argv[3]; // driver, rider, or admin

    if (!identifier || !newRole) {
      console.log('\n📋 Usage: node update-user-role.js <phone_or_email> <role>');
      console.log('   Example: node update-user-role.js +919347705998 driver');
      console.log('   Roles: driver, rider, admin\n');
      process.exit(1);
    }

    if (!['driver', 'rider', 'admin'].includes(newRole)) {
      console.error('❌ Invalid role. Must be: driver, rider, or admin');
      process.exit(1);
    }

    // Find user by phone or email
    const user = await User.findOne({
      $or: [
        { phone: identifier },
        { email: identifier }
      ]
    });

    if (!user) {
      console.error(`❌ User not found with identifier: ${identifier}`);
      process.exit(1);
    }

    console.log('\n📋 Current User:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Phone: ${user.phone}`);
    console.log(`   Current Role: ${user.role}`);
    console.log(`   Firebase UID: ${user.firebaseUid}`);

    // Update role
    user.role = newRole;
    
    // Add vehicle info if becoming a driver
    if (newRole === 'driver' && !user.vehicle) {
      user.vehicle = {
        type: 'Bike',
        number: 'UPDATE-LATER',
        color: 'Black'
      };
      console.log('\n📝 Added default vehicle info (please update later)');
    }

    await user.save();

    console.log('\n✅ User role updated successfully!');
    console.log(`   Name: ${user.name}`);
    console.log(`   New Role: ${user.role}`);
    if (user.vehicle) {
      console.log(`   Vehicle: ${user.vehicle.type}`);
    }
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateUserRole();
