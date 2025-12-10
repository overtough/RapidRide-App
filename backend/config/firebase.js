const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin (OPTIONAL - Frontend Firebase works independently)
let firebaseInitialized = false;

try {
  // Only initialize if explicitly enabled
  if (process.env.FIREBASE_ENABLED === 'true') {
    const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      firebaseInitialized = true;
      console.log('✅ Firebase Admin SDK enabled');
    } else if (process.env.FIREBASE_PROJECT_ID && 
               process.env.FIREBASE_CLIENT_EMAIL && 
               process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
      firebaseInitialized = true;
      console.log('✅ Firebase Admin SDK enabled');
    }
  }
  // Silent mode - no warnings needed
} catch (error) {
  // Silent fail - app works without backend Firebase
  firebaseInitialized = false;
}

module.exports = {
  admin,
  firebaseInitialized
};
