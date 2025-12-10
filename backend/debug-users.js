const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = 'mongodb://localhost:27017/rapidride';

async function checkUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');

        // Find all users
        const users = await User.find({}).lean();

        console.log('📋 All Users in Database:\n');
        users.forEach((user, index) => {
            console.log(`User ${index + 1}:`);
            console.log(`  Name: ${user.name}`);
            console.log(`  Phone: ${user.phone}`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Role: ${user.role}`);
            console.log(`  Firebase UID: ${user.firebaseUid}`);
            console.log(`  MongoDB _id: ${user._id}`);
            console.log('');
        });

        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkUsers();
