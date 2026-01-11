const rateLimit = require('express-rate-limit');
const config = require('../config/environment');

/**
 * General rate limiter
 */
const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for activations
 */
const activationLimiter = rateLimit({
  windowMs: config.rateLimit.activationWindowMs,
  max: config.rateLimit.activationMax,
  message: 'Too many activation attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by IP and license key combined
    return `${req.ip}-${req.body.license_key || 'unknown'}`;
  }
});

module.exports = {
  generalLimiter,
  activationLimiter
};
