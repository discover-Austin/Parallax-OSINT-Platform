const express = require('express');
const router = express.Router();
const gumroadService = require('../services/gumroadService');
const logger = require('../utils/logger');

/**
 * POST /webhooks/gumroad
 * Gumroad webhook endpoint
 */
router.post('/gumroad', async (req, res) => {
  try {
    const signature = req.get('X-Gumroad-Signature') || req.get('x-gumroad-signature');
    const payload = req.body;

    // Verify signature (optional in development)
    if (process.env.NODE_ENV === 'production' && signature) {
      const isValid = gumroadService.verifyWebhookSignature(signature, payload);
      if (!isValid) {
        logger.warn('Invalid Gumroad webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    // Process the sale
    const result = await gumroadService.processSale(payload);

    res.json(result);
  } catch (error) {
    logger.error('Gumroad webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

module.exports = router;
