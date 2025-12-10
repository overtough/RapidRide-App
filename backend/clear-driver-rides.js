const mongoose = require('mongoose');
const Ride = require('./models/ride');

mongoose.connect('mongodb://localhost:27017/rapidride')
    .then(async () => {
        console.log('✅ Connected to MongoDB');

        // Cancel all rides for the specific driver
        const driverId = '69369911f30f68dc84ec9671';

        const result = await Ride.updateMany(
            {
                driverId: driverId,
                status: { $in: ['requested', 'accepted', 'arrived', 'started'] }
            },
            {
                $set: { status: 'cancelled' }
            }
        );

        console.log(`✅ Cancelled ${result.modifiedCount} rides for driver ${driverId}`);
        console.log('You can now test with a fresh ride booking!');

        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
