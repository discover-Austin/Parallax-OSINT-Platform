const nacl = require('tweetnacl');
const util = require('tweetnacl-util');
const crypto = require('crypto');

/**
 * Generate a new Ed25519 keypair
 * @returns {{publicKey: string, secretKey: string}}
 */
function generateKeyPair() {
  const keypair = nacl.sign.keyPair();
  return {
    publicKey: util.encodeBase64(keypair.publicKey),
    secretKey: util.encodeBase64(keypair.secretKey)
  };
}

/**
 * Sign license data
 * @param {object} licenseData - Data to sign
 * @param {string} secretKeyBase64 - Base64 encoded secret key
 * @returns {string} Base64 encoded signature
 */
function signLicense(licenseData, secretKeyBase64) {
  const secretKey = util.decodeBase64(secretKeyBase64);
  const message = util.decodeUTF8(JSON.stringify(licenseData));
  const signature = nacl.sign.detached(message, secretKey);
  return util.encodeBase64(signature);
}

/**
 * Verify license signature
 * @param {object} licenseData - Data to verify
 * @param {string} signatureBase64 - Base64 encoded signature
 * @param {string} publicKeyBase64 - Base64 encoded public key
 * @returns {boolean}
 */
function verifyLicense(licenseData, signatureBase64, publicKeyBase64) {
  try {
    const publicKey = util.decodeBase64(publicKeyBase64);
    const signature = util.decodeBase64(signatureBase64);
    const message = util.decodeUTF8(JSON.stringify(licenseData));
    return nacl.sign.detached.verify(message, signature, publicKey);
  } catch (error) {
    return false;
  }
}

/**
 * Generate a license key
 * @param {string} tier - License tier (pro, team, enterprise)
 * @param {string} secretKeyBase64 - Base64 encoded secret key for signing
 * @returns {string} Formatted license key (PRLX-XXXX-XXXX-XXXX-XXXX)
 */
function generateLicenseKey(tier, secretKeyBase64) {
  // Map tier to code
  const tierCodes = {
    pro: 'P',
    team: 'T',
    enterprise: 'E',
    free: 'F'
  };

  const tierCode = tierCodes[tier] || 'F';

  // Generate timestamp component (4 chars from unix timestamp)
  const timestamp = Date.now().toString(36).slice(-4).toUpperCase();

  // Generate random component (12 chars hex)
  const randomBytes = crypto.randomBytes(6);
  const randomComponent = randomBytes.toString('hex').toUpperCase();

  // Create data to sign
  const data = `${tierCode}${timestamp}${randomComponent}`;

  // Generate signature (take first 8 chars)
  const hash = crypto.createHash('sha256').update(data + secretKeyBase64).digest('hex');
  const signature = hash.slice(0, 8).toUpperCase();

  // Format as PRLX-TIER-TIME-RAND-SIGN (split into 4-char segments)
  const fullKey = `${tierCode}${timestamp}${randomComponent}${signature}`;
  const formatted = fullKey.match(/.{1,4}/g).join('-');

  return `PRLX-${formatted}`;
}

/**
 * Validate license key format
 * @param {string} key - License key to validate
 * @returns {boolean}
 */
function validateKeyFormat(key) {
  // Format: PRLX-XXXX-XXXX-XXXX-XXXX
  const pattern = /^PRLX-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return pattern.test(key);
}

/**
 * Generate activation token
 * @returns {string} 64-character hex token
 */
function generateActivationToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  generateKeyPair,
  signLicense,
  verifyLicense,
  generateLicenseKey,
  validateKeyFormat,
  generateActivationToken
};
