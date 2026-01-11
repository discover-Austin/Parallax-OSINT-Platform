const db = require('../config/database');
const crypto = require('../utils/crypto');
const logger = require('../utils/logger');

class ActivationService {
  /**
   * Activate a license
   * @param {object} params - Activation parameters
   * @returns {Promise<object>} Activation result
   */
  async activate({ licenseKey, machineFingerprint, appVersion, ipAddress, userAgent }) {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // Get license
      const licenseQuery = 'SELECT * FROM licenses WHERE license_key = $1';
      const licenseResult = await client.query(licenseQuery, [licenseKey]);

      if (licenseResult.rows.length === 0) {
        await this.logValidation(null, null, 'activate', 'failure', 'License not found', ipAddress, client);
        throw new Error('Invalid license key');
      }

      const license = licenseResult.rows[0];

      // Check license status
      if (license.status !== 'active') {
        await this.logValidation(license.id, null, 'activate', 'failure', `License status is ${license.status}`, ipAddress, client);
        throw new Error(`License is ${license.status}`);
      }

      // Check expiration
      if (license.expires_at && new Date(license.expires_at) < new Date()) {
        await client.query('UPDATE licenses SET status = $1 WHERE id = $2', ['expired', license.id]);
        await this.logValidation(license.id, null, 'activate', 'failure', 'License expired', ipAddress, client);
        throw new Error('License has expired');
      }

      // Check if machine already activated
      const existingQuery = `
        SELECT * FROM activations
        WHERE license_id = $1 AND machine_fingerprint = $2 AND status = 'active'
      `;
      const existingResult = await client.query(existingQuery, [license.id, machineFingerprint]);

      if (existingResult.rows.length > 0) {
        // Update last validated time
        const activation = existingResult.rows[0];
        await client.query(
          'UPDATE activations SET last_validated_at = NOW() WHERE id = $1',
          [activation.id]
        );
        await this.logValidation(license.id, activation.id, 'activate', 'success', 'Already activated', ipAddress, client);
        await client.query('COMMIT');

        logger.info(`Machine already activated: ${licenseKey} on ${machineFingerprint.slice(0, 8)}...`);

        return {
          success: true,
          message: 'License already activated on this machine',
          activation_token: activation.activation_token,
          tier: license.tier,
          features: license.features,
          expires_at: license.expires_at
        };
      }

      // Check activation limit
      if (license.current_activations >= license.max_activations) {
        await this.logValidation(license.id, null, 'activate', 'failure', 'Activation limit reached', ipAddress, client);
        throw new Error(`Activation limit reached (${license.max_activations} maximum)`);
      }

      // Generate activation token
      const activationToken = crypto.generateActivationToken();

      // Create activation record
      const insertQuery = `
        INSERT INTO activations (
          license_id, activation_token, machine_fingerprint, machine_info,
          app_version, ip_address, user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const machineInfo = {
        fingerprint: machineFingerprint,
        app_version: appVersion,
        activated_from_ip: ipAddress
      };

      const insertResult = await client.query(insertQuery, [
        license.id,
        activationToken,
        machineFingerprint,
        JSON.stringify(machineInfo),
        appVersion,
        ipAddress,
        userAgent
      ]);

      const activation = insertResult.rows[0];

      // Increment activation count
      await client.query(
        'UPDATE licenses SET current_activations = current_activations + 1 WHERE id = $1',
        [license.id]
      );

      // Log successful activation
      await this.logValidation(license.id, activation.id, 'activate', 'success', null, ipAddress, client);

      await client.query('COMMIT');

      logger.info(`License activated: ${licenseKey} on ${machineFingerprint.slice(0, 8)}...`);

      return {
        success: true,
        message: 'License activated successfully',
        activation_token: activationToken,
        tier: license.tier,
        features: license.features,
        expires_at: license.expires_at
      };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Activation failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Validate an activation
   * @param {object} params - Validation parameters
   * @returns {Promise<object>} Validation result
   */
  async validate({ activationToken, machineFingerprint }) {
    try {
      const query = `
        SELECT a.*, l.*
        FROM activations a
        JOIN licenses l ON a.license_id = l.id
        WHERE a.activation_token = $1
      `;

      const result = await db.query(query, [activationToken]);

      if (result.rows.length === 0) {
        return { valid: false, error: 'Activation not found' };
      }

      const row = result.rows[0];

      // Check fingerprint match
      if (row.machine_fingerprint !== machineFingerprint) {
        logger.warn(`Fingerprint mismatch for activation ${activationToken.slice(0, 8)}...`);
        return { valid: false, error: 'Machine fingerprint mismatch' };
      }

      // Check activation status
      if (row.status !== 'active') {
        return { valid: false, error: 'Activation is not active' };
      }

      // Check license status
      if (row.license_status !== 'active') {
        return { valid: false, error: 'License is not active' };
      }

      // Check expiration
      if (row.expires_at && new Date(row.expires_at) < new Date()) {
        return { valid: false, error: 'License has expired' };
      }

      // Update last validated time
      await db.query(
        'UPDATE activations SET last_validated_at = NOW() WHERE activation_token = $1',
        [activationToken]
      );

      // Log validation
      await this.logValidation(row.license_id, row.id, 'validate', 'success', null, null);

      return {
        valid: true,
        tier: row.tier,
        features: row.features,
        expires_at: row.expires_at
      };
    } catch (error) {
      logger.error('Validation failed:', error);
      return { valid: false, error: 'Validation error' };
    }
  }

  /**
   * Deactivate a license
   * @param {object} params - Deactivation parameters
   * @returns {Promise<object>} Deactivation result
   */
  async deactivate({ activationToken, machineFingerprint }) {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // Find activation
      const query = `
        SELECT a.*, l.id as license_id
        FROM activations a
        JOIN licenses l ON a.license_id = l.id
        WHERE a.activation_token = $1 AND a.machine_fingerprint = $2 AND a.status = 'active'
      `;

      const result = await client.query(query, [activationToken, machineFingerprint]);

      if (result.rows.length === 0) {
        throw new Error('Activation not found or already deactivated');
      }

      const activation = result.rows[0];

      // Deactivate
      await client.query(
        `UPDATE activations
         SET status = 'deactivated', deactivated_at = NOW()
         WHERE id = $1`,
        [activation.id]
      );

      // Decrement activation count
      await client.query(
        'UPDATE licenses SET current_activations = GREATEST(current_activations - 1, 0) WHERE id = $1',
        [activation.license_id]
      );

      // Log deactivation
      await this.logValidation(activation.license_id, activation.id, 'deactivate', 'success', null, null, client);

      await client.query('COMMIT');

      logger.info(`License deactivated: ${activationToken.slice(0, 8)}...`);

      return {
        success: true,
        message: 'License deactivated successfully'
      };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Deactivation failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all installations for a license
   * @param {string} licenseKey - License key
   * @returns {Promise<array>} List of installations
   */
  async getInstallations(licenseKey) {
    try {
      const query = `
        SELECT a.id, a.machine_fingerprint, a.machine_info, a.app_version,
               a.status, a.activated_at, a.last_validated_at, a.deactivated_at
        FROM activations a
        JOIN licenses l ON a.license_id = l.id
        WHERE l.license_key = $1
        ORDER BY a.activated_at DESC
      `;

      const result = await db.query(query, [licenseKey]);
      return result.rows;
    } catch (error) {
      logger.error('Failed to get installations:', error);
      throw error;
    }
  }

  /**
   * Log validation attempt
   * @private
   */
  async logValidation(licenseId, activationId, validationType, result, errorMessage, ipAddress, client = null) {
    const query = `
      INSERT INTO validation_logs (license_id, activation_id, validation_type, result, error_message, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    const values = [licenseId, activationId, validationType, result, errorMessage, ipAddress];

    if (client) {
      await client.query(query, values);
    } else {
      await db.query(query, values);
    }
  }
}

module.exports = new ActivationService();
