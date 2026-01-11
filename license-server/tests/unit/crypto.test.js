const crypto = require('../../src/utils/crypto');

describe('Crypto Utils', () => {
  describe('generateKeyPair', () => {
    it('should generate a valid keypair', () => {
      const keypair = crypto.generateKeyPair();

      expect(keypair).toHaveProperty('publicKey');
      expect(keypair).toHaveProperty('secretKey');
      expect(typeof keypair.publicKey).toBe('string');
      expect(typeof keypair.secretKey).toBe('string');
    });

    it('should generate unique keypairs', () => {
      const keypair1 = crypto.generateKeyPair();
      const keypair2 = crypto.generateKeyPair();

      expect(keypair1.publicKey).not.toBe(keypair2.publicKey);
      expect(keypair1.secretKey).not.toBe(keypair2.secretKey);
    });
  });

  describe('signLicense and verifyLicense', () => {
    it('should sign and verify data correctly', () => {
      const keypair = crypto.generateKeyPair();
      const data = { tier: 'pro', email: 'test@example.com' };

      const signature = crypto.signLicense(data, keypair.secretKey);
      const isValid = crypto.verifyLicense(data, signature, keypair.publicKey);

      expect(isValid).toBe(true);
    });

    it('should fail verification with wrong data', () => {
      const keypair = crypto.generateKeyPair();
      const data = { tier: 'pro', email: 'test@example.com' };
      const wrongData = { tier: 'free', email: 'test@example.com' };

      const signature = crypto.signLicense(data, keypair.secretKey);
      const isValid = crypto.verifyLicense(wrongData, signature, keypair.publicKey);

      expect(isValid).toBe(false);
    });

    it('should fail verification with wrong key', () => {
      const keypair1 = crypto.generateKeyPair();
      const keypair2 = crypto.generateKeyPair();
      const data = { tier: 'pro', email: 'test@example.com' };

      const signature = crypto.signLicense(data, keypair1.secretKey);
      const isValid = crypto.verifyLicense(data, signature, keypair2.publicKey);

      expect(isValid).toBe(false);
    });
  });

  describe('generateLicenseKey', () => {
    it('should generate a valid license key format', () => {
      const keypair = crypto.generateKeyPair();
      const key = crypto.generateLicenseKey('pro', keypair.secretKey);

      expect(crypto.validateKeyFormat(key)).toBe(true);
      expect(key).toMatch(/^PRLX-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    });

    it('should generate unique keys', () => {
      const keypair = crypto.generateKeyPair();
      const key1 = crypto.generateLicenseKey('pro', keypair.secretKey);
      const key2 = crypto.generateLicenseKey('pro', keypair.secretKey);

      expect(key1).not.toBe(key2);
    });

    it('should include tier code', () => {
      const keypair = crypto.generateKeyPair();

      const proKey = crypto.generateLicenseKey('pro', keypair.secretKey);
      const teamKey = crypto.generateLicenseKey('team', keypair.secretKey);
      const enterpriseKey = crypto.generateLicenseKey('enterprise', keypair.secretKey);

      expect(proKey).toMatch(/^PRLX-P/);
      expect(teamKey).toMatch(/^PRLX-T/);
      expect(enterpriseKey).toMatch(/^PRLX-E/);
    });
  });

  describe('validateKeyFormat', () => {
    it('should validate correct format', () => {
      expect(crypto.validateKeyFormat('PRLX-ABCD-1234-EFGH-5678')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(crypto.validateKeyFormat('INVALID')).toBe(false);
      expect(crypto.validateKeyFormat('PRLX-ABC-1234-EFGH-5678')).toBe(false);
      expect(crypto.validateKeyFormat('XXXX-ABCD-1234-EFGH-5678')).toBe(false);
      expect(crypto.validateKeyFormat('prlx-abcd-1234-efgh-5678')).toBe(false);
    });
  });

  describe('generateActivationToken', () => {
    it('should generate a 64-character hex token', () => {
      const token = crypto.generateActivationToken();

      expect(token).toHaveLength(64);
      expect(token).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should generate unique tokens', () => {
      const token1 = crypto.generateActivationToken();
      const token2 = crypto.generateActivationToken();

      expect(token1).not.toBe(token2);
    });
  });
});
