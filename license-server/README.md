# Parallax License Server

License activation and validation server for the Parallax Intelligence Platform.

## Features

- Ed25519-based license key generation and verification
- Machine-based activation system with fingerprinting
- Offline grace period (7 days)
- PostgreSQL database for license storage
- RESTful API for activation/validation/deactivation
- Admin panel for license management
- Gumroad webhook integration for automated license delivery
- Email notifications for new licenses
- Comprehensive audit logging
- Rate limiting and security features
- Docker deployment ready

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- (Optional) Docker and Docker Compose

## Installation

### Using Docker (Recommended)

1. Clone the repository
2. Generate license keys:
   ```bash
   npm install
   node scripts/generateKeys.js
   ```

3. Create `.env` file from `.env.example` and add generated keys

4. Start services:
   ```bash
   docker-compose up -d
   ```

5. Create admin user:
   ```bash
   docker-compose exec license-server node scripts/createAdmin.js admin@parallax.app yourpassword superadmin
   ```

### Manual Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up PostgreSQL database:
   ```bash
   createdb parallax_licenses
   psql parallax_licenses < database/schema.sql
   ```

3. Generate keys and configure `.env`

4. Create admin user:
   ```bash
   node scripts/createAdmin.js admin@parallax.app yourpassword
   ```

5. Start server:
   ```bash
   npm start
   ```

## Configuration

All configuration is done through environment variables. See `.env.example` for all available options.

### Required Variables

- `DATABASE_URL` - PostgreSQL connection string
- `LICENSE_PUBLIC_KEY` - Ed25519 public key (base64)
- `LICENSE_SECRET_KEY` - Ed25519 secret key (base64)
- `JWT_SECRET` - Secret for JWT tokens

### Optional Variables

- `PORT` - Server port (default: 3000)
- `ALLOWED_ORIGINS` - CORS allowed origins
- `GUMROAD_WEBHOOK_SECRET` - Gumroad webhook signature verification
- `SMTP_*` - Email configuration

## API Documentation

### Public Endpoints

#### POST /api/activations/activate

Activate a license on a machine.

**Request:**
```json
{
  "license_key": "PRLX-XXXX-XXXX-XXXX-XXXX",
  "machine_fingerprint": "sha256-hash",
  "app_version": "1.0.0"
}
```

**Response:**
```json
{
  "success": true,
  "message": "License activated successfully",
  "activation_token": "64-char-hex-token",
  "tier": "pro",
  "features": ["builder", "library", ...],
  "expires_at": null
}
```

#### POST /api/activations/validate

Validate an existing activation.

**Request:**
```json
{
  "activation_token": "64-char-hex-token",
  "machine_fingerprint": "sha256-hash"
}
```

**Response:**
```json
{
  "valid": true,
  "tier": "pro",
  "features": [...],
  "expires_at": null
}
```

#### POST /api/activations/deactivate

Deactivate a license.

**Request:**
```json
{
  "activation_token": "64-char-hex-token",
  "machine_fingerprint": "sha256-hash"
}
```

**Response:**
```json
{
  "success": true,
  "message": "License deactivated successfully"
}
```

### Admin Endpoints (Require Authentication)

#### POST /api/admin/login

Login to get JWT token.

**Request:**
```json
{
  "email": "admin@parallax.app",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "admin@parallax.app",
    "role": "admin"
  }
}
```

#### POST /api/licenses

Create a new license (requires admin token).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request:**
```json
{
  "email": "customer@example.com",
  "tier": "pro",
  "max_activations": 2,
  "features": [],
  "expires_at": null,
  "notes": "Optional notes"
}
```

#### GET /api/licenses

List all licenses with optional filters.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)
- `tier` - Filter by tier
- `status` - Filter by status
- `email` - Search by email

#### GET /api/licenses/:key

Get license details.

#### PUT /api/licenses/:key

Update a license.

#### DELETE /api/licenses/:key

Revoke a license (also deactivates all activations).

### Webhooks

#### POST /webhooks/gumroad

Receives Gumroad sale notifications and automatically generates licenses.

## Development

### Running Tests

```bash
npm test
```

### Development Mode

```bash
npm run dev
```

### Database Migrations

Migrations are automatically applied when using Docker. For manual setup:

```bash
psql parallax_licenses < database/schema.sql
```

## Security

- All endpoints use HTTPS in production
- Rate limiting on all API endpoints
- Stricter rate limiting on activation endpoints
- JWT authentication for admin endpoints
- Ed25519 signature verification for licenses
- Machine fingerprinting for activation binding
- Audit logging for all operations
- CORS protection
- Helmet security headers
- SQL injection protection via parameterized queries

## Monitoring

### Health Check

```bash
curl http://localhost:3000/health
```

### Logs

Logs are written to:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only

In Docker, logs are available via:
```bash
docker-compose logs -f license-server
```

## Troubleshooting

### Database Connection Errors

Ensure PostgreSQL is running and `DATABASE_URL` is correct.

### License Key Generation Fails

Ensure `tweetnacl` is installed:
```bash
npm install tweetnacl tweetnacl-util
```

### Email Sending Fails

Check SMTP configuration in `.env`. Test with a service like SendGrid or Mailgun.

### CORS Errors

Add your application's origin to `ALLOWED_ORIGINS` in `.env`.

## Production Deployment

1. Use Docker Compose for easy deployment
2. Set up SSL certificates (Let's Encrypt recommended)
3. Configure nginx as reverse proxy (included in docker-compose)
4. Set strong passwords and secrets
5. Enable firewall rules
6. Set up log rotation
7. Configure automated backups for PostgreSQL
8. Monitor with your preferred solution (Datadog, New Relic, etc.)

## License

Proprietary - All rights reserved by Parallax.

## Support

For issues or questions, contact: support@parallax.app
