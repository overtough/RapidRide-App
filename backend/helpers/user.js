const User = require('../models/user');

/**
 * Find user by Firebase authentication data
 * Checks firebaseUid first, then falls back to email
 * @param {Object} firebaseUser - Decoded Firebase token with uid and email
 * @returns {Promise<Object|null>} User document or null
 */
async function findUserByFirebaseAuth(firebaseUser) {
    if (!firebaseUser || !firebaseUser.uid) {
        return null;
    }

    // 1. Try finding by Firebase UID (Gold Standard)
    let user = await User.findOne({ firebaseUid: firebaseUser.uid });
    if (user) return user;

    // 2. If not found, check Email (Legacy/Migration)
    if (firebaseUser.email) {
        user = await User.findOne({ email: firebaseUser.email });

        if (user && user.firebaseUid && user.firebaseUid !== firebaseUser.uid) {
            console.warn(`[Identity] Prevented match: Email ${firebaseUser.email} matches user ${user._id}, but UID differs`);
            return null;
        }
        if (user) return user;
    }

    // 3. Last Resort: Check Phone Number (for Phone Auth users)
    if (firebaseUser.phone_number) {
        user = await User.findOne({ phone: firebaseUser.phone_number });

        if (user && user.firebaseUid && user.firebaseUid !== firebaseUser.uid) {
            console.warn(`[Identity] Prevented match: Phone ${firebaseUser.phone_number} matches user ${user._id}, but UID differs`);
            return null;
        }
        if (user) return user;
    }

    return null;
}

module.exports = {
    findUserByFirebaseAuth
};
