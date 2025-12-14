const { admin, firebaseInitialized } = require('../config/firebase');
const jwt = require('jsonwebtoken'); // For custom email/password auth
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here'; // Must match auth.js route

// Hybrid Auth Middleware - Supports both Firebase Tokens and Custom JWTs
const firebaseAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: 'No token provided' });

        const token = authHeader.split(' ')[1];

        // 1. Try resolving as Custom JWT (Email/Password Login)
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded; // { id, email, role }
            // console.log('✅ Custom JWT Verified:', decoded.email);
            return next();
        } catch (jwtError) {
            // Not a valid custom JWT - try Firebase next
            // console.log('ℹ️ Not a custom JWT, checking Firebase...', jwtError.message);
        }

        // 2. Try resolving as Firebase Token (Phone/Social Login)
        if (!firebaseInitialized) {
            console.error('❌ Firebase Admin SDK not initialized');
            return res.status(500).json({ message: 'Firebase Admin SDK not initialized' });
        }

        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            req.user = decodedToken; // Set as req.user for consistency
            req.firebaseUser = decodedToken; // Keep both for compatibility
            // console.log('✅ Firebase Token Verified:', decodedToken.uid);
            return next();
        } catch (firebaseError) {
            console.log('❌ Auth verification failed:', firebaseError.message);
            return res.status(401).json({ message: 'Invalid token', error: firebaseError.message });
        }

    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ message: 'Authentication failed' });
    }
};

module.exports = {
    firebaseAuthMiddleware
};
