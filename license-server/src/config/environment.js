require('dotenv').config();

const requiredEnvVars = [
  'DATABASE_URL',
  'LICENSE_PUBLIC_KEY',
  'LICENSE_SECRET_KEY',
  'JWT_SECRET'
];

// Check for required environment variables
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`Error: ${varName} environment variable is required`);
    process.exit(1);
  }
});

module.exports = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',

  database: {
    url: process.env.DATABASE_URL,
    poolMin: parseInt(process.env.DB_POOL_MIN || '2'),
    poolMax: parseInt(process.env.DB_POOL_MAX || '10')
  },

  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:1420').split(',')
  },

  license: {
    publicKey: process.env.LICENSE_PUBLIC_KEY,
    secretKey: process.env.LICENSE_SECRET_KEY
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  gumroad: {
    webhookSecret: process.env.GUMROAD_WEBHOOK_SECRET || ''
  },

  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM,
    fromName: process.env.EMAIL_FROM_NAME || 'Parallax Licenses'
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    activationMax: parseInt(process.env.ACTIVATION_RATE_LIMIT_MAX || '10'),
    activationWindowMs: parseInt(process.env.ACTIVATION_RATE_LIMIT_WINDOW_MS || '3600000')
  }
};
