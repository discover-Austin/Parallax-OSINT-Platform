# Parallax Intelligence Platform

**Tagline**: "Intelligence from every angle"

Production-ready, enterprise-grade OSINT platform combining AI-powered reconnaissance, infrastructure mapping, and image analysis for security researchers and threat intelligence teams.

## Features

- 🔍 **Dork Builder**: Advanced search query constructor with template library
- 🤖 **AI-Powered Generation**: Natural language to search query using Google Gemini
- 🎙️ **Voice Commands**: Hands-free operation with Gemini Live API
- 🕸️ **Nexus Graph**: Infrastructure relationship visualization
- 🖼️ **Image Intelligence**: IMINT analysis and metadata extraction
- 💾 **Secure Vault**: Encrypted local storage for sensitive queries
- 📊 **Export & Reporting**: PDF, CSV, JSON export capabilities

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
2. Enter your license key (or start free tier)
3. Configure Google Gemini API key (get one at https://aistudio.google.com/app/apikey)
4. Start building OSINT queries

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
