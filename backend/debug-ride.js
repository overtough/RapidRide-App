const mongoose = require('mongoose');
require('dotenv').config();
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rapidride';

const RIDE_ID = '693a8efcbb0f127305a66514';

async function checkRide() {
    try {
        console.log('Connecting...');
        await mongoose.connect(MONGODB_URI);

        const ride = await mongoose.connection.db.collection('rides').findOne({
            _id: new mongoose.Types.ObjectId(RIDE_ID)
        });

        if (!ride) {
            console.log('Ride NOT FOUND');
        } else {
            console.log('\n--- RIDE DUMP ---');
            console.log(`ID: ${ride._id}`);
            console.log(`Status: ${ride.status}`);
            console.log(`Rider ID: ${ride.riderId}`);

            // Fetch Rider Details
            const rider = await mongoose.connection.db.collection('users').findOne({ _id: ride.riderId });
            console.log(`\n--- RIDER DETAILS ---`);
            if (rider) {
                console.log(`Name: ${rider.name}`);
                console.log(`Phone: ${rider.phone}`);
                console.log(`Email: ${rider.email}`);
                console.log(`UID: ${rider.firebaseUid}`);
            } else {
                console.log('Rider User NOT FOUND in DB');
            }

            // Fetch Driver Details
            const driver = await mongoose.connection.db.collection('users').findOne({ _id: ride.driverId });
            console.log(`\n--- DRIVER DETAILS ---`);
            if (driver) {
                console.log(`Name: ${driver.name}`);
                console.log(`Phone: ${driver.phone}`);
            } else {
                console.log('Driver User NOT FOUND in DB');
            }
        }
        process.exit(0);
    } catch (e) { console.error(e); process.exit(1); }
}
checkRide();
