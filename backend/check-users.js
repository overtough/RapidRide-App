require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rapidride';

async function checkUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        const User = require('./models/user');

        // Find all users
        const users = await User.find({});

        console.log(`📊 Found ${users.length} user(s) in database:\n`);

        users.forEach((user, index) => {
            console.log(`User ${index + 1}:`);
            console.log(`  Name: ${user.name}`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Phone: ${user.phone}`);
            console.log(`  Role: ${user.role}`);
            console.log(`  Firebase UID: ${user.firebaseUid}`);
            console.log(`  ID: ${user._id}`);
            console.log('');
        });

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkUsers();
