const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/database');
const config = require('../config/environment');
const logger = require('../utils/logger');

/**
 * Authenticate admin user with JWT
 */
function authenticateAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, config.jwt.secret);

    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Authentication failed:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Admin login
 */
async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Query admin user
    const query = 'SELECT * FROM admin_users WHERE email = $1';
    const result = await db.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, admin.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await db.query(
      'UPDATE admin_users SET last_login_at = NOW() WHERE id = $1',
      [admin.id]
    );

    // Generate JWT
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    logger.info(`Admin login: ${email}`);

    res.json({
      token,
      user: {
        id: admin.id,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}

/**
 * Create admin user (use this to bootstrap first admin)
 */
async function createAdmin(email, password, role = 'admin') {
  const passwordHash = await bcrypt.hash(password, 10);

  const query = `
    INSERT INTO admin_users (email, password_hash, role)
    VALUES ($1, $2, $3)
    RETURNING id, email, role
  `;

  const result = await db.query(query, [email, passwordHash, role]);
  return result.rows[0];
}

module.exports = {
  authenticateAdmin,
  adminLogin,
  createAdmin
};
