# Parallax Intelligence Platform

**Tagline**: "Intelligence from every angle"

Production-ready, enterprise-grade OSINT platform combining AI-powered reconnaissance, infrastructure mapping, and image analysis for security researchers and threat intelligence teams.

## Features

- 🔍 **Dork Builder**: Advanced search query constructor with visual operators
- 🤖 **AI Generator**: Chat-based dork generation using Google Gemini (10/day free, unlimited Pro)
- 📚 **Library**: 137+ pre-built templates across 15 categories (Cloud, Databases, Login Panels, etc.)
- 💾 **Secure Vault**: Local encrypted storage for your custom dorks
- 📊 **Export & Import**: JSON export/import for backup and sharing
- 🎯 **Smart Search**: Filter by category, severity, and tags
- 🔄 **Dual View Modes**: Grid and list views for browsing templates
- 🚀 **One-Click Testing**: Direct Google search integration

## Installation

### Windows
Download `Parallax-Setup-x64.msi` from [Releases](https://github.com/yourusername/Parallax-OSINT-Platform/releases)

### macOS
Download `Parallax-Universal.dmg` from [Releases](https://github.com/yourusername/Parallax-OSINT-Platform/releases)

### Linux
```bash
# AppImage (portable)
chmod +x Parallax-x86_64.AppImage
./Parallax-x86_64.AppImage

# Debian/Ubuntu
sudo dpkg -i parallax_amd64.deb

# Fedora/RHEL
sudo rpm -i parallax.x86_64.rpm
```

## Quick Start

1. Launch Parallax
2. **Free Tier**: 10 AI generations/day, 50 dork limit, all templates
3. **Pro Tier**: $79 one-time for unlimited everything
4. Configure Google Gemini API key (get free key at https://aistudio.google.com/app/apikey)
5. Start building OSINT queries with AI or templates

## Pricing

| Tier | Price | AI Generations | Dork Storage | Templates | Export |
|------|-------|----------------|--------------|-----------|--------|
| Free | $0 | 10/day | 50 dorks | All 137 | Limited |
| **Pro** | **$79** (one-time) | **Unlimited** | **Unlimited** | **All 137** | **Full** |
| Team | $299 (5 licenses) | Unlimited | Unlimited | All 137 | Full |

Purchase at [Gumroad](https://gumroad.com/l/parallax-pro)

## Documentation

- [User Guide](docs/customer/USER_GUIDE.md)
- [Installation Guide](docs/customer/INSTALLATION.md)
- [Troubleshooting](docs/customer/TROUBLESHOOTING.md)
- [Building from Source](docs/developer/BUILDING.md)

## Security

- API keys stored in OS-native credential manager (Windows Credential Manager, macOS Keychain, Linux Secret Service)
- All network traffic over HTTPS with certificate pinning
- Sandboxed WebView with strict CSP
- Auto-updates with cryptographic signature verification

See [SECURITY.md](docs/legal/SECURITY_DISCLOSURE.md) for vulnerability reporting.

## License

See [EULA](docs/legal/EULA.md) for end-user license agreement.

## Support

- Documentation: https://docs.parallax.app
- Issues: https://github.com/yourusername/Parallax-OSINT-Platform/issues
- Email: support@parallax.app

---

Built with [Tauri](https://tauri.app) + [React](https://react.dev) + [Rust](https://rust-lang.org)
