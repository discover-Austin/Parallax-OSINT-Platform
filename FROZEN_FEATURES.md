# FROZEN FEATURES - DO NOT MODIFY

This document locks the feature set of Parallax Intelligence Platform v1.0.

## Feature Freeze Date: January 11, 2026

**NO NEW FEATURES WILL BE ADDED BEYOND THIS POINT**

This is a production-ready release. Future work should focus ONLY on:
- Bug fixes
- Security patches
- Performance optimizations
- Documentation updates

## Core Features (LOCKED):

1. ✅ **Dork Builder** - Visual operator-based query construction
2. ✅ **AI Generator** - Google Gemini integration for intelligent dork generation
3. ✅ **Template Library** - 137+ pre-built reconnaissance templates
4. ✅ **Secure Vault** - Local encrypted storage with SQLite
5. ✅ **License Management** - 3-tier system (Free/Pro/Team) with online activation
6. ✅ **Export/Import** - JSON, CSV, and PDF export capabilities
7. ✅ **Nexus Graph** - Infrastructure visualization (stub)
8. ✅ **Terminal** - CLI interface (stub)
9. ✅ **Image Intel** - EXIF, OCR, reverse search (stub)
10. ✅ **Voice Commands** - Speech recognition interface (stub)
11. ✅ **Settings & Configuration** - API keys, license, preferences
12. ✅ **First-Run Wizard** - Guided onboarding with legal compliance
13. ✅ **Legal Compliance** - ToS acceptance, legal warnings, AUP enforcement
14. ✅ **Security Framework** - Input validation, rate limiting, error handling
15. ✅ **Complete License Server** - Node.js/Express backend with PostgreSQL

## Explicitly REJECTED Features:

The following will NEVER be added to v1.x:

- ❌ Cloud sync / cloud storage
- ❌ Multi-user collaboration
- ❌ Browser extension
- ❌ Mobile applications (iOS/Android)
- ❌ Third-party integrations (beyond Gemini)
- ❌ Custom themes / theme marketplace
- ❌ Plugin system / extensibility
- ❌ Social features / sharing
- ❌ Real-time collaboration
- ❌ Blockchain / cryptocurrency features
- ❌ Video tutorials / in-app training
- ❌ Built-in VPN / proxy
- ❌ Automated reconnaissance / scanning
- ❌ Exploit database integration
- ❌ Credential management

## Version Policy:

- **v1.0.x**: Bug fixes and security patches only
- **v1.1.x**: NOT ALLOWED - feature freeze in effect
- **v2.0.0**: Only if critical architectural changes absolutely required
- No v1.x feature releases under any circumstances

## Development Guidelines:

### Allowed Changes:
- Fix crashes and errors
- Patch security vulnerabilities
- Optimize performance
- Update dependencies for security
- Improve error messages
- Fix UI/UX bugs
- Update documentation

### Prohibited Changes:
- New pages or views
- New API endpoints
- New database tables
- New features or capabilities
- UI redesigns
- Architecture changes
- New integrations

## Security Exceptions:

Critical security fixes may bypass the feature freeze if:
1. They address a CVE or actively exploited vulnerability
2. They are reviewed by the security team
3. They make minimal changes to existing functionality
4. They do not add new features

## Breaking the Freeze:

This document can only be modified with:
- Written approval from project maintainers
- Security review if changes affect security posture
- Documentation of the reason for breaking the freeze
- Version bump to v2.0.0 if features are added

## Commitment:

We commit to NOT adding new features to v1.x. Users can rely on stability.

**Signed:** Parallax Development Team
**Date:** January 11, 2026
**Status:** LOCKED 🔒
