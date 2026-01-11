# Changelog

All notable changes to Parallax Intelligence Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-11 - PRODUCTION RELEASE 🎉

### 🎯 Major Features

#### Core Platform
- **Dork Builder**: Visual query construction with 20+ operators
- **AI Generator**: Google Gemini-powered intelligent dork generation
- **Template Library**: 137+ pre-built OSINT reconnaissance templates
- **Secure Vault**: AES-256 encrypted local storage with SQLite
- **Export System**: JSON, CSV, and PDF export with metadata
- **Import System**: JSON import with validation and deduplication

#### License Management
- **3-Tier System**: Free, Pro, and Team tiers with feature gating
- **License Server**: Complete Node.js/Express backend with PostgreSQL
- **Ed25519 Signing**: Cryptographic license key verification
- **Online Activation**: Network activation with 7-day offline grace period
- **Machine Fingerprinting**: SHA256-based device identification
- **Gumroad Integration**: Automated license delivery via webhooks

#### User Interface
- **First-Run Wizard**: Guided onboarding with legal compliance
- **Settings Panel**: API key management, license activation, preferences
- **Dashboard**: Usage statistics and quick actions
- **Dark Mode**: Full dark theme support
- **Responsive Design**: Works on all screen sizes

### 🔒 Security & Compliance

#### Security Features
- **Input Validation**: XSS and injection prevention on all inputs
- **Rate Limiting**: Frontend and backend rate limiting
  - AI: 10 requests/minute
  - Export: 50 requests/hour
  - Activation: 5 requests/hour
- **Error Handling**: Comprehensive error handling framework
- **Logging**: Structured logging with Sentry integration
- **Encryption**: AES-256-GCM for sensitive data storage

#### Legal Compliance
- **Terms of Service**: Mandatory acceptance in first-run wizard
- **Acceptable Use Policy**: Clear guidelines for legal usage
- **Legal Warnings**: Modal warnings for high-risk dork templates
- **Session Warnings**: "Don't show again" option per session
- **Responsible Disclosure**: Security vulnerability reporting process

### 🛠️ Technical Implementation

#### Frontend
- **React 18**: Modern React with hooks and suspense
- **TypeScript**: Full type safety with strict mode enabled
- **Tailwind CSS**: Utility-first styling
- **Tauri 2.0**: Native desktop application framework
- **Vite**: Fast build tooling

#### Backend (Rust)
- **Tauri Commands**: 40+ Tauri commands for system integration
- **SQLite Vault**: Encrypted local database
- **License Client**: Complete activation/validation system
- **Export Engine**: CSV and PDF generation

#### License Server (Node.js)
- **Express.js**: RESTful API server
- **PostgreSQL**: Relational database for licenses
- **JWT Auth**: Admin panel authentication
- **Docker**: Complete deployment configuration
- **Nginx**: Reverse proxy with rate limiting

### 📊 Usage Limits

#### Free Tier
- 10 AI generations per day (resets daily at midnight UTC)
- 50 saved dorks maximum
- 1 device activation
- Local vault only

#### Pro Tier
- Unlimited AI generations
- Unlimited saved dorks
- 2 device activations
- Priority support
- Full export features

#### Team Tier
- Unlimited AI generations
- Unlimited saved dorks
- 5 device activations
- Team features
- Shared vault (future)
- Priority support

### 🐛 Known Limitations

- **Nexus Graph**: Feature stub (placeholder UI)
- **Terminal**: Feature stub (placeholder UI)
- **Image Intel**: Feature stub (placeholder UI)
- **Voice Commands**: Feature stub (placeholder UI)
- **Cloud Sync**: Not available (local-only storage)
- **Multi-user**: Single-user application only

### 🔐 Security Considerations

- API keys stored in system keychain (Windows Credential Manager, macOS Keychain, Linux Secret Service)
- License keys validated both online and offline
- All user inputs sanitized to prevent XSS/injection
- Rate limiting prevents abuse
- Legal warnings for high-risk operations

### 📖 Documentation

- Complete README with installation instructions
- Developer documentation in `docs/developer/`
- Customer documentation in `docs/customer/`
- Legal documents in `docs/legal/`
- API reference for license server
- Build instructions for all platforms

### 🎉 Achievements

- ✅ 100% feature complete for v1.0 scope
- ✅ Production-ready license infrastructure
- ✅ Comprehensive security framework
- ✅ Full legal compliance
- ✅ Cross-platform builds (Windows, macOS, Linux)
- ✅ Zero TODO comments
- ✅ Zero FIXME comments
- ✅ Feature freeze in effect

---

## Feature Freeze Notice

**As of January 11, 2026, no new features will be added to the v1.x branch.**

See [FROZEN_FEATURES.md](./FROZEN_FEATURES.md) for details.

Future releases will focus exclusively on:
- Bug fixes
- Security patches
- Performance improvements
- Documentation updates

---

## Version History

- **v1.0.0** (2026-01-11): Production release with feature freeze
- **v0.9.0** (2026-01-10): Beta release with license server
- **v0.8.0** (2026-01-08): Alpha release with AI generator
- **v0.1.0** (2026-01-01): Initial development version

---

**🔒 PRODUCTION READY - FEATURE SET LOCKED**
