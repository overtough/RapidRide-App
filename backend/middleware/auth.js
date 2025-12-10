const { admin, firebaseInitialized } = require('../config/firebase');

// Firebase Authentication Middleware - FIREBASE TOKENS ONLY
const firebaseAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: 'No token provided' });

        const idToken = authHeader.split(' ')[1];

        // Verify using Firebase Admin SDK
        if (!firebaseInitialized) {
            return res.status(500).json({ message: 'Firebase Admin SDK not initialized' });
        }

        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            req.user = decodedToken; // Set as req.user for consistency
            req.firebaseUser = decodedToken; // Keep both for compatibility
            return next();
        } catch (firebaseError) {
            console.log('❌ Firebase token verification failed:', firebaseError.message);
            return res.status(401).json({ message: 'Invalid Firebase token', error: firebaseError.message });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ message: 'Authentication failed' });
    }
};

module.exports = {
    firebaseAuthMiddleware
};
