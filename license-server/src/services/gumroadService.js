const db = require('../config/database');
const licenseService = require('./licenseService');
const email = require('../utils/email');
const logger = require('../utils/logger');

class GumroadService {
  /**
   * Process a Gumroad sale
   * @param {object} saleData - Sale data from Gumroad webhook
   * @returns {Promise<object>} Processing result
   */
  async processSale(saleData) {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      const {
        sale_id,
        product_id,
        email: customerEmail,
        price,
        currency,
        quantity = 1,
        sale_timestamp
      } = saleData;

      // Check if already processed
      const checkQuery = 'SELECT * FROM gumroad_sales WHERE sale_id = $1';
      const checkResult = await client.query(checkQuery, [sale_id]);

      if (checkResult.rows.length > 0) {
        logger.info(`Sale ${sale_id} already processed`);
        await client.query('COMMIT');
        return { success: true, message: 'Sale already processed' };
      }

      // Insert raw sale data
      const insertSaleQuery = `
        INSERT INTO gumroad_sales (
          sale_id, product_id, email, price, currency, quantity, sale_timestamp, raw_data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `;

      const saleResult = await client.query(insertSaleQuery, [
        sale_id,
        product_id,
        customerEmail,
        parseFloat(price) / 100, // Gumroad sends price in cents
        currency || 'USD',
        quantity,
        sale_timestamp,
        JSON.stringify(saleData)
      ]);

      const saleRecordId = saleResult.rows[0].id;

      // Determine tier from product ID or price
      const tier = this.getTierFromProduct(product_id, parseFloat(price) / 100);

      // Get features for tier
      const features = this.getFeaturesForTier(tier);

      // Determine max activations based on tier
      const maxActivations = this.getMaxActivations(tier);

      // Generate licenses (one per quantity)
      const licenseKeys = [];

      for (let i = 0; i < quantity; i++) {
        const license = await licenseService.createLicense({
          email: customerEmail,
          tier,
          maxActivations,
          features,
          expiresAt: null, // Lifetime license by default
          createdBy: 'gumroad',
          notes: `Gumroad sale ${sale_id}`
        });

        licenseKeys.push(license.license_key);
      }

      // Update gumroad_sales with generated license keys
      await client.query(
        'UPDATE gumroad_sales SET license_key = $1, processed = TRUE WHERE id = $2',
        [licenseKeys.join(', '), saleRecordId]
      );

      await client.query('COMMIT');

      // Send email with license keys
      try {
        await email.sendLicenseEmail(customerEmail, licenseKeys, tier);
      } catch (emailError) {
        logger.error(`Failed to send license email for sale ${sale_id}:`, emailError);
        // Don't fail the whole operation if email fails
      }

      logger.info(`Processed Gumroad sale ${sale_id}: ${quantity} ${tier} license(s) for ${customerEmail}`);

      return {
        success: true,
        message: `Generated ${quantity} license(s)`,
        licenseKeys
      };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to process Gumroad sale:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Determine tier from product ID or price
   * @param {string} productId - Gumroad product ID
   * @param {number} price - Sale price
   * @returns {string} Tier
   */
  getTierFromProduct(productId, price) {
    // Map product IDs to tiers (configure these based on your Gumroad products)
    const productTiers = {
      'pro': 'pro',
      'team': 'team',
      'enterprise': 'enterprise'
    };

    // Check product ID first
    const productIdLower = productId.toLowerCase();
    for (const [key, tier] of Object.entries(productTiers)) {
      if (productIdLower.includes(key)) {
        return tier;
      }
    }

    // Fall back to price ranges
    if (price >= 500) {
      return 'enterprise';
    } else if (price >= 200) {
      return 'team';
    } else if (price >= 50) {
      return 'pro';
    }

    return 'pro'; // Default
  }

  /**
   * Get features for tier
   * @param {string} tier - License tier
   * @returns {string[]} Features array
   */
  getFeaturesForTier(tier) {
    const features = {
      free: ['builder', 'library', 'local_vault'],
      pro: ['builder', 'library', 'local_vault', 'ai_unlimited', 'vault_unlimited', 'export_full', 'priority_support'],
      team: ['builder', 'library', 'local_vault', 'ai_unlimited', 'vault_unlimited', 'export_full', 'priority_support', 'team_features', 'shared_vault'],
      enterprise: ['all']
    };

    return features[tier] || features.pro;
  }

  /**
   * Get max activations for tier
   * @param {string} tier - License tier
   * @returns {number} Max activations
   */
  getMaxActivations(tier) {
    const limits = {
      free: 1,
      pro: 2,
      team: 5,
      enterprise: 10
    };

    return limits[tier] || 1;
  }

  /**
   * Verify Gumroad webhook signature
   * @param {string} signature - Signature from webhook
   * @param {object} payload - Webhook payload
   * @returns {boolean} Valid signature
   */
  verifyWebhookSignature(signature, payload) {
    const crypto = require('crypto');
    const config = require('../config/environment');

    if (!config.gumroad.webhookSecret) {
      logger.warn('Gumroad webhook secret not configured');
      return true; // Allow in development
    }

    const hmac = crypto.createHmac('sha256', config.gumroad.webhookSecret);
    hmac.update(JSON.stringify(payload));
    const calculatedSignature = hmac.digest('hex');

    return signature === calculatedSignature;
  }
}

module.exports = new GumroadService();
