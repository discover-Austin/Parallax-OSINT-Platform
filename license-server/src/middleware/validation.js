const Joi = require('joi');
const { validateKeyFormat } = require('../utils/crypto');
const { validateFingerprint } = require('../utils/fingerprint');

/**
 * Validation schemas
 */
const schemas = {
  activation: Joi.object({
    license_key: Joi.string().required().custom((value, helpers) => {
      if (!validateKeyFormat(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
    machine_fingerprint: Joi.string().required().custom((value, helpers) => {
      if (!validateFingerprint(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
    app_version: Joi.string().required(),
  }),

  validation: Joi.object({
    activation_token: Joi.string().hex().length(64).required(),
    machine_fingerprint: Joi.string().required().custom((value, helpers) => {
      if (!validateFingerprint(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
  }),

  deactivation: Joi.object({
    activation_token: Joi.string().hex().length(64).required(),
    machine_fingerprint: Joi.string().required().custom((value, helpers) => {
      if (!validateFingerprint(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
  }),

  createLicense: Joi.object({
    email: Joi.string().email().required(),
    tier: Joi.string().valid('free', 'pro', 'team', 'enterprise').required(),
    max_activations: Joi.number().integer().min(1).max(100).default(1),
    features: Joi.array().items(Joi.string()).default([]),
    expires_at: Joi.date().iso().allow(null).default(null),
    notes: Joi.string().allow(null, '').default(null),
  }),

  updateLicense: Joi.object({
    status: Joi.string().valid('active', 'suspended', 'revoked', 'expired'),
    tier: Joi.string().valid('free', 'pro', 'team', 'enterprise'),
    max_activations: Joi.number().integer().min(1).max(100),
    expires_at: Joi.date().iso().allow(null),
    notes: Joi.string().allow(null, ''),
    features: Joi.array().items(Joi.string()),
  }).min(1),

  adminLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

/**
 * Validate request body middleware
 */
function validate(schemaName) {
  return (req, res, next) => {
    const schema = schemas[schemaName];

    if (!schema) {
      return res.status(500).json({ error: 'Validation schema not found' });
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    req.body = value;
    next();
  };
}

module.exports = {
  validate,
  schemas
};
