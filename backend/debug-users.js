const mongoose = require('mongoose');

require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rapidride';

async function checkUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
        const Ride = mongoose.model('Ride', new mongoose.Schema({}, { strict: false }), 'rides');

        // Find active rides
        const rides = await Ride.find({
            status: { $in: ['requested', 'accepted', 'arrived', 'started'] }
        }).sort({ createdAt: -1 }).limit(20).lean();

        console.log('🚗 Active Rides:\n');
        for (const ride of rides) {
            const rider = await User.findById(ride.riderId).lean();
            const driver = ride.driverId ? await User.findById(ride.driverId).lean() : null;

            console.log(`Ride ID: ${ride._id}`);
            console.log(`  Status: ${ride.status}`);
            console.log(`  Rider: ${rider ? rider.name : 'Unknown'} (ID: ${ride.riderId})`);
            console.log(`  Driver: ${driver ? driver.name : 'None'} (ID: ${ride.driverId})`);
            console.log(`  Created: ${ride.createdAt}`);
            console.log('');
        }

        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkUsers();
