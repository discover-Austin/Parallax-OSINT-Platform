#!/bin/bash

set -e

echo "================================"
echo "Parallax Multi-Platform Build"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

if ! command -v cargo &> /dev/null; then
    echo -e "${RED}Error: Rust/Cargo is not installed${NC}"
    exit 1
fi

NODE_VERSION=$(node --version)
CARGO_VERSION=$(cargo --version)

echo -e "${GREEN}✓${NC} Node.js: $NODE_VERSION"
echo -e "${GREEN}✓${NC} Cargo: $CARGO_VERSION"
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install
echo -e "${GREEN}✓${NC} Dependencies installed"
echo ""

# Generate license keys (dev mode)
if [ -z "$PARALLAX_LICENSE_PUBLIC_KEY" ]; then
    echo -e "${YELLOW}⚠${NC} No license key found, generating development keys..."
    cd license-server
    if [ -f "scripts/generateKeys.js" ]; then
        node scripts/generateKeys.js > ../keys.txt 2>&1
        export PARALLAX_LICENSE_PUBLIC_KEY=$(grep -A1 "PUBLIC KEY" ../keys.txt | tail -1)
        echo -e "${GREEN}✓${NC} Development license keys generated"
        cd ..
    else
        echo -e "${YELLOW}⚠${NC} License key generator not found, skipping"
        cd ..
    fi
else
    echo -e "${GREEN}✓${NC} Using provided license key"
fi
echo ""

# Build
echo "Building application..."
npm run tauri:build

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓${NC} Build successful!"
    echo ""
    
    # Generate checksums
    echo "Generating checksums..."
    cd src-tauri/target/release/bundle
    
    if [ -d "msi" ]; then
        sha256sum msi/*.msi > msi/SHA256SUMS 2>/dev/null || true
        echo -e "${GREEN}✓${NC} Windows MSI checksums"
    fi
    
    if [ -d "nsis" ]; then
        sha256sum nsis/*.exe > nsis/SHA256SUMS 2>/dev/null || true
        echo -e "${GREEN}✓${NC} Windows NSIS checksums"
    fi
    
    if [ -d "dmg" ]; then
        shasum -a 256 dmg/*.dmg > dmg/SHA256SUMS 2>/dev/null || true
        echo -e "${GREEN}✓${NC} macOS DMG checksums"
    fi
    
    if [ -d "appimage" ]; then
        sha256sum appimage/*.AppImage > appimage/SHA256SUMS 2>/dev/null || true
        echo -e "${GREEN}✓${NC} Linux AppImage checksums"
    fi
    
    if [ -d "deb" ]; then
        sha256sum deb/*.deb > deb/SHA256SUMS 2>/dev/null || true
        echo -e "${GREEN}✓${NC} Linux DEB checksums"
    fi
    
    if [ -d "rpm" ]; then
        sha256sum rpm/*.rpm > rpm/SHA256SUMS 2>/dev/null || true
        echo -e "${GREEN}✓${NC} Linux RPM checksums"
    fi
    
    cd ../../../../
    
    echo ""
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}Build Complete!${NC}"
    echo -e "${GREEN}================================${NC}"
    echo ""
    echo "Installers available in: src-tauri/target/release/bundle/"
    echo ""
else
    echo ""
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi
