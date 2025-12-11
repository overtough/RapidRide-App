const mongoose = require('mongoose');
require('dotenv').config();
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rapidride';

async function checkEmails() {
    try {
        console.log('Connecting...');
        await mongoose.connect(MONGODB_URI);
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log('\n--- EMAIL DUMP ---');
        users.forEach(u => {
            console.log(`Name: ${u.name} | Phone: ${u.phone} | Email: ${u.email} | UID: ${u.firebaseUid}`);
        });
        process.exit(0);
    } catch(e) { console.error(e); process.exit(1); }
}
checkEmails();
