# Building Parallax from Source

## Prerequisites

### All Platforms
- Node.js 18+ ([nodejs.org](https://nodejs.org))
- Rust 1.75+ ([rustup.rs](https://rustup.rs))
- Git

### Platform-Specific

**Linux** (Ubuntu/Debian):
```bash
sudo apt update && sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

**macOS**:
```bash
xcode-select --install
```

**Windows**:
- Visual Studio C++ Build Tools
- WebView2 (pre-installed on Windows 10/11)

## Quick Start

```bash
# Clone
git clone https://github.com/yourusername/Parallax-OSINT-Platform.git
cd Parallax-OSINT-Platform

# Install dependencies
npm install

# Run in development
npm run tauri:dev
```

## Build for Production

```bash
# Build current platform
npm run tauri:build

# Output: src-tauri/target/release/bundle/
```

### Automated Build

```bash
./scripts/build-all-platforms.sh
```

Installers location:
- **Windows**: `src-tauri/target/release/bundle/msi/`
- **macOS**: `src-tauri/target/release/bundle/dmg/`
- **Linux**: `src-tauri/target/release/bundle/appimage/`

## Release Process

1. Update version in `package.json`, `Cargo.toml`, and `tauri.conf.json`
2. Create changelog entry
3. Commit and tag:
```bash
git add .
git commit -m "Release v1.0.0"
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin main --tags
```
4. GitHub Actions will automatically build and create release

## Troubleshooting

### "Rust not found"
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### "Missing dependencies" (Linux)
```bash
sudo apt install -f
```

### Build fails
```bash
rm -rf node_modules package-lock.json
npm install
```

## Code Signing

### Windows
Requires Authenticode certificate ($100-400/year from Sectigo/DigiCert)

### macOS
Requires Apple Developer Account ($99/year)

### Linux
No signing required

## Environment Variables

Optional `.env` file:
```env
VITE_SENTRY_DSN=
VITE_LICENSE_SERVER_URL=https://license.parallax.app
```

## Project Structure

```
parallax-platform/
├── src/              # React frontend
├── src-tauri/        # Rust backend
├── scripts/          # Build scripts
├── docs/             # Documentation
└── .github/          # CI/CD
```

---

For support: [GitHub Issues](https://github.com/yourusername/Parallax-OSINT-Platform/issues)
