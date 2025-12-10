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

    return await User.findOne({
        $or: [
            { firebaseUid: firebaseUser.uid },
            { email: firebaseUser.email }
        ]
    });
}

module.exports = {
    findUserByFirebaseAuth
};
