const nodemailer = require('nodemailer');
const logger = require('./logger');

/**
 * Create email transporter
 */
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

/**
 * Send license email to customer
 * @param {string} email - Recipient email
 * @param {string[]} licenseKeys - Array of license keys
 * @param {string} tier - License tier
 */
async function sendLicenseEmail(email, licenseKeys, tier) {
  try {
    const transporter = createTransporter();

    const tierNames = {
      pro: 'Professional',
      team: 'Team',
      enterprise: 'Enterprise'
    };

    const tierName = tierNames[tier] || 'Professional';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border-radius: 0 0 8px 8px;
    }
    .license-key {
      background: white;
      border: 2px solid #667eea;
      border-radius: 6px;
      padding: 15px;
      margin: 15px 0;
      font-family: 'Courier New', monospace;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      color: #667eea;
    }
    .button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      margin: 15px 0;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 Welcome to Parallax ${tierName}!</h1>
  </div>
  <div class="content">
    <p>Thank you for your purchase! Your Parallax Intelligence Platform license is ready.</p>

    <h2>Your License ${licenseKeys.length > 1 ? 'Keys' : 'Key'}</h2>
    ${licenseKeys.map(key => `<div class="license-key">${key}</div>`).join('')}

    <h3>Getting Started</h3>
    <ol>
      <li>Download and install Parallax from <a href="https://github.com/parallax-osint/parallax/releases">GitHub Releases</a></li>
      <li>Open the application</li>
      <li>Navigate to Settings → License</li>
      <li>Enter your license key and click "Activate"</li>
    </ol>

    <p><strong>Important:</strong> Keep your license key safe and confidential. Do not share it with others.</p>

    <h3>Your ${tierName} Benefits</h3>
    <ul>
      ${tier === 'pro' ? `
        <li>Unlimited AI generations</li>
        <li>Unlimited vault storage</li>
        <li>Full export capabilities</li>
        <li>Priority support</li>
      ` : ''}
      ${tier === 'team' ? `
        <li>All Pro features</li>
        <li>Team collaboration tools</li>
        <li>Shared vault</li>
        <li>Advanced analytics</li>
      ` : ''}
      ${tier === 'enterprise' ? `
        <li>All Team features</li>
        <li>Custom integrations</li>
        <li>Dedicated support</li>
        <li>SLA guarantees</li>
      ` : ''}
    </ul>

    <h3>Need Help?</h3>
    <p>If you have any questions or need assistance:</p>
    <ul>
      <li>Email: <a href="mailto:support@parallax.app">support@parallax.app</a></li>
      <li>Documentation: <a href="https://docs.parallax.app">docs.parallax.app</a></li>
    </ul>
  </div>
  <div class="footer">
    <p>This is an automated email from Parallax Intelligence Platform. Please do not reply to this email.</p>
    <p>© ${new Date().getFullYear()} Parallax. All rights reserved.</p>
  </div>
</body>
</html>
    `;

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'Parallax Licenses'} <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `Your Parallax ${tierName} License ${licenseKeys.length > 1 ? 'Keys' : 'Key'}`,
      html: htmlContent,
      text: `
Welcome to Parallax ${tierName}!

Your License ${licenseKeys.length > 1 ? 'Keys' : 'Key'}:
${licenseKeys.join('\n')}

Getting Started:
1. Download and install Parallax
2. Open the application
3. Navigate to Settings → License
4. Enter your license key and click "Activate"

Keep your license key safe and confidential.

Need help? Contact support@parallax.app

© ${new Date().getFullYear()} Parallax. All rights reserved.
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info(`License email sent successfully to ${email}`);
  } catch (error) {
    logger.error(`Failed to send license email to ${email}:`, error);
    throw error;
  }
}

module.exports = {
  sendLicenseEmail
};
