const bcrypt = require('bcrypt');
const crypto = require('crypto');

module.exports = {
    // Hash password with bcrypt
    hashPassword: async (password) => {
        return await bcrypt.hash(password, 10); // 10 salt rounds is sufficient for most apps
    },

    // Validate password against hash
    validatePassword: async (password, hash) => {
        return await bcrypt.compare(password, hash);
    },

    // Generate random token (for sessions/password resets)
    generateToken: () => {
        return crypto.randomBytes(32).toString('hex'); // 256-bit token
    }
};