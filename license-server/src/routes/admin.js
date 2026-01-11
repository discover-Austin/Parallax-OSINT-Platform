const express = require('express');
const router = express.Router();
const { adminLogin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

/**
 * POST /api/admin/login
 * Admin login endpoint
 */
router.post('/login', validate('adminLogin'), adminLogin);

module.exports = router;
