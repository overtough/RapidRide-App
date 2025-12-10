const mongoose = require('mongoose');
const Ride = require('./models/ride');

mongoose.connect('mongodb://localhost:27017/rapidride')
    .then(async () => {
        console.log('✅ Connected to MongoDB');

        // Cancel ALL active rides
        const result = await Ride.updateMany(
            {
                status: { $in: ['requested', 'accepted', 'arrived', 'started'] }
            },
            {
                $set: { status: 'cancelled' }
            }
        );

        console.log(`✅ Cancelled ${result.modifiedCount} total active rides`);
        console.log('All drivers are now free!');

        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
