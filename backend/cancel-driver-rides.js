const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = 'mongodb://localhost:27017/rapidride';

async function cancelDriverRides() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Define models
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
        const Ride = mongoose.model('Ride', new mongoose.Schema({}, { strict: false }), 'rides');

        // Get driver identifier from command line argument
        const identifier = process.argv[2];

        let driver;
        if (identifier) {
            console.log(`🔍 Looking for driver: ${identifier}`);
            // Try to find by email, phone, or name
            driver = await User.findOne({
                role: 'driver',
                $or: [
                    { email: identifier },
                    { phone: identifier },
                    { name: { $regex: new RegExp(identifier, 'i') } }
                ]
            });
        } else {
            // Find any driver
            console.log('🔍 Looking for drivers...');
            const drivers = await User.find({ role: 'driver' });
            if (drivers.length > 0) {
                driver = drivers[0];
                console.log(`Found ${drivers.length} driver(s), using: ${driver.name}`);
            }
        }

        if (!driver) {
            console.log(`❌ Driver not found`);
            console.log('💡 Usage: node cancel-driver-rides.js [phone|email|name]');
            process.exit(1);
        }

        console.log(`✅ Found driver: ${driver.name} (Phone: ${driver.phone}, ID: ${driver._id})`);

        // Cancel all active rides for this driver
        const result = await Ride.updateMany(
            {
                driverId: driver._id,
                status: { $in: ['requested', 'accepted', 'arrived', 'started'] }
            },
            { $set: { status: 'cancelled' } }
        );

        console.log(`✅ Cancelled ${result.modifiedCount} active ride(s) for driver ${driver.name}`);

        // Show summary of all rides for this driver
        const allRides = await Ride.find({ driverId: driver._id });
        console.log(`\n📊 Total rides for this driver: ${allRides.length}`);

        const ridesByStatus = allRides.reduce((acc, ride) => {
            acc[ride.status] = (acc[ride.status] || 0) + 1;
            return acc;
        }, {});

        console.log('Status breakdown:', ridesByStatus);

        await mongoose.connection.close();
        console.log('\n✅ MongoDB connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

cancelDriverRides();
