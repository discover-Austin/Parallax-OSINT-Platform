const db = require('../config/database');
const crypto = require('../utils/crypto');
const logger = require('../utils/logger');
const config = require('../config/environment');

class LicenseService {
  /**
   * Create a new license
   * @param {object} params - License parameters
   * @returns {Promise<object>} Created license
   */
  async createLicense({ email, tier, maxActivations = 1, features = [], expiresAt = null, createdBy = null, notes = null }) {
    try {
      // Generate license key
      const licenseKey = crypto.generateLicenseKey(tier, config.license.secretKey);

      // Get default features for tier if not provided
      if (features.length === 0) {
        features = this.getFeaturesForTier(tier);
      }

      const query = `
        INSERT INTO licenses (
          license_key, email, tier, max_activations, features, expires_at, created_by, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const values = [
        licenseKey,
        email,
        tier,
        maxActivations,
        JSON.stringify(features),
        expiresAt,
        createdBy,
        notes
      ];

      const result = await db.query(query, values);
      logger.info(`License created: ${licenseKey} for ${email}`);

      return result.rows[0];
    } catch (error) {
      logger.error('Failed to create license:', error);
      throw error;
    }
  }

  /**
   * Get license by key
   * @param {string} licenseKey - License key
   * @returns {Promise<object>} License object
   */
  async getLicense(licenseKey) {
    const query = 'SELECT * FROM licenses WHERE license_key = $1';
    const result = await db.query(query, [licenseKey]);

    if (result.rows.length === 0) {
      throw new Error('License not found');
    }

    return result.rows[0];
  }

  /**
   * Update license
   * @param {string} licenseKey - License key
   * @param {object} updates - Fields to update
   * @returns {Promise<object>} Updated license
   */
  async updateLicense(licenseKey, updates) {
    const allowedFields = ['status', 'tier', 'max_activations', 'expires_at', 'notes', 'features'];
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(key === 'features' ? JSON.stringify(updates[key]) : updates[key]);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(licenseKey);

    const query = `
      UPDATE licenses
      SET ${updateFields.join(', ')}
      WHERE license_key = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('License not found');
    }

    logger.info(`License updated: ${licenseKey}`);
    return result.rows[0];
  }

  /**
   * Revoke a license
   * @param {string} licenseKey - License key
   * @returns {Promise<object>} Result
   */
  async revokeLicense(licenseKey) {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // Update license status
      await client.query(
        'UPDATE licenses SET status = $1 WHERE license_key = $2',
        ['revoked', licenseKey]
      );

      // Deactivate all active activations
      await client.query(
        `UPDATE activations
         SET status = 'deactivated', deactivated_at = NOW()
         WHERE license_id = (SELECT id FROM licenses WHERE license_key = $1)
         AND status = 'active'`,
        [licenseKey]
      );

      await client.query('COMMIT');
      logger.info(`License revoked: ${licenseKey}`);

      return { success: true, message: 'License revoked successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Failed to revoke license ${licenseKey}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * List licenses with filters
   * @param {object} params - Query parameters
   * @returns {Promise<object>} Paginated licenses
   */
  async listLicenses({ page = 1, limit = 50, tier = null, status = null, email = null }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (tier) {
      conditions.push(`tier = $${paramCount}`);
      values.push(tier);
      paramCount++;
    }

    if (status) {
      conditions.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    if (email) {
      conditions.push(`email ILIKE $${paramCount}`);
      values.push(`%${email}%`);
      paramCount++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM licenses ${whereClause}`;
    const countResult = await db.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Get licenses
    values.push(limit, offset);
    const query = `
      SELECT * FROM licenses
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const result = await db.query(query, values);

    return {
      licenses: result.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get default features for a tier
   * @param {string} tier - License tier
   * @returns {string[]} Feature array
   */
  getFeaturesForTier(tier) {
    const features = {
      free: ['builder', 'library', 'local_vault'],
      pro: ['builder', 'library', 'local_vault', 'ai_unlimited', 'vault_unlimited', 'export_full', 'priority_support'],
      team: ['builder', 'library', 'local_vault', 'ai_unlimited', 'vault_unlimited', 'export_full', 'priority_support', 'team_features', 'shared_vault'],
      enterprise: ['all']
    };

    return features[tier] || features.free;
  }
}

module.exports = new LicenseService();
