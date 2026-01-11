const express = require('express');
const router = express.Router();
const activationService = require('../services/activationService');
const { validate } = require('../middleware/validation');
const { activationLimiter } = require('../middleware/rateLimit');
const logger = require('../utils/logger');

/**
 * POST /api/activations/activate
 * Activate a license on a machine
 */
router.post('/activate', activationLimiter, validate('activation'), async (req, res, next) => {
  try {
    const { license_key, machine_fingerprint, app_version } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');

    const result = await activationService.activate({
      licenseKey: license_key,
      machineFingerprint: machine_fingerprint,
      appVersion: app_version,
      ipAddress,
      userAgent
    });

    res.json(result);
  } catch (error) {
    logger.error('Activation route error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/activations/validate
 * Validate an existing activation
 */
router.post('/validate', validate('validation'), async (req, res, next) => {
  try {
    const { activation_token, machine_fingerprint } = req.body;

    const result = await activationService.validate({
      activationToken: activation_token,
      machineFingerprint: machine_fingerprint
    });

    if (result.valid) {
      res.json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    logger.error('Validation route error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/activations/deactivate
 * Deactivate a license
 */
router.post('/deactivate', validate('deactivation'), async (req, res, next) => {
  try {
    const { activation_token, machine_fingerprint } = req.body;

    const result = await activationService.deactivate({
      activationToken: activation_token,
      machineFingerprint: machine_fingerprint
    });

    res.json(result);
  } catch (error) {
    logger.error('Deactivation route error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/activations/:license_key/installations
 * Get all installations for a license
 */
router.get('/:license_key/installations', async (req, res, next) => {
  try {
    const { license_key } = req.params;

    const installations = await activationService.getInstallations(license_key);

    res.json({ installations });
  } catch (error) {
    logger.error('Get installations route error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
