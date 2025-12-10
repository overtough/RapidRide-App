const mongoose = require('mongoose');
const Ride = require('./models/ride');
const User = require('./models/user');

const rideId = process.argv[2];

if (!rideId) {
    console.log('Usage: node check-ride.js <rideId>');
    process.exit(1);
}

mongoose.connect('mongodb://localhost:27017/rapidride')
    .then(async () => {
        console.log('✅ Connected to MongoDB');

        const ride = await Ride.findById(rideId).populate('riderId driverId');

        if (!ride) {
            console.log('❌ Ride not found');
            process.exit(1);
        }

        console.log('\n📋 Ride Details:');
        console.log('Ride ID:', ride._id);
        console.log('Status:', ride.status);
        console.log('\n👤 Rider:');
        console.log('  ID:', ride.riderId?._id);
        console.log('  Name:', ride.riderId?.name);
        console.log('  Phone:', ride.riderId?.phone);
        console.log('\n🚗 Driver:');
        console.log('  ID:', ride.driverId?._id);
        console.log('  Name:', ride.driverId?.name);
        console.log('  Phone:', ride.driverId?.phone);

        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
