const express = require('express');
const router = express.Router();
const licenseService = require('../services/licenseService');
const { validate } = require('../middleware/validation');
const { authenticateAdmin } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * All license routes require admin authentication
 */
router.use(authenticateAdmin);

/**
 * POST /api/licenses
 * Create a new license
 */
router.post('/', validate('createLicense'), async (req, res, next) => {
  try {
    const license = await licenseService.createLicense({
      ...req.body,
      createdBy: req.user.email
    });

    res.status(201).json(license);
  } catch (error) {
    logger.error('Create license route error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/licenses/:key
 * Get license details
 */
router.get('/:key', async (req, res, next) => {
  try {
    const license = await licenseService.getLicense(req.params.key);
    res.json(license);
  } catch (error) {
    logger.error('Get license route error:', error);
    res.status(404).json({ error: error.message });
  }
});

/**
 * PUT /api/licenses/:key
 * Update a license
 */
router.put('/:key', validate('updateLicense'), async (req, res, next) => {
  try {
    const license = await licenseService.updateLicense(req.params.key, req.body);
    res.json(license);
  } catch (error) {
    logger.error('Update license route error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /api/licenses/:key
 * Revoke a license
 */
router.delete('/:key', async (req, res, next) => {
  try {
    const result = await licenseService.revokeLicense(req.params.key);
    res.json(result);
  } catch (error) {
    logger.error('Revoke license route error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/licenses
 * List licenses with filters
 */
router.get('/', async (req, res, next) => {
  try {
    const { page, limit, tier, status, email } = req.query;

    const result = await licenseService.listLicenses({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      tier,
      status,
      email
    });

    res.json(result);
  } catch (error) {
    logger.error('List licenses route error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
