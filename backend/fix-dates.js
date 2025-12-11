const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rapidride';

async function fixDates() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const collection = mongoose.connection.db.collection('users');
        const users = await collection.find({}).toArray();

        let count = 0;
        for (const user of users) {
            let needsFix = false;
            let validDate = null;

            // Check if createdAt is the weird { $date: ... } object
            if (user.createdAt && typeof user.createdAt === 'object' && !(user.createdAt instanceof Date)) {
                if (user.createdAt.$date) {
                    validDate = new Date(user.createdAt.$date);
                    needsFix = true;
                } else {
                    console.log(`⚠️ User ${user.email || user._id} has unknown object format for createdAt:`, user.createdAt);
                }
            }

            // Also check if it's missing entirely
            if (!user.createdAt) {
                validDate = new Date();
                needsFix = true;
            }

            if (needsFix && validDate) {
                console.log(`🔧 Fixing User ${user.name || 'Unknown'} (${user._id}): ${JSON.stringify(user.createdAt)} -> ${validDate.toISOString()}`);
                await collection.updateOne(
                    { _id: user._id },
                    { $set: { createdAt: validDate, updatedAt: new Date() } }
                );
                count++;
            }
        }

        console.log(`\n🎉 Finished! Fixed ${count} users.`);
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixDates();
