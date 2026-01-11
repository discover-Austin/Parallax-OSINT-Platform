const crypto = require('crypto');

/**
 * Validate machine fingerprint format
 * @param {string} fingerprint - Machine fingerprint to validate
 * @returns {boolean}
 */
function validateFingerprint(fingerprint) {
  // Should be a 64-character hex string (SHA256)
  return /^[a-f0-9]{64}$/.test(fingerprint);
}

/**
 * Generate a hash of fingerprint + additional data
 * @param {string} fingerprint - Base fingerprint
 * @param {string} additionalData - Additional data to include
 * @returns {string} SHA256 hash
 */
function hashFingerprint(fingerprint, additionalData = '') {
  return crypto
    .createHash('sha256')
    .update(fingerprint + additionalData)
    .digest('hex');
}

module.exports = {
  validateFingerprint,
  hashFingerprint
};
