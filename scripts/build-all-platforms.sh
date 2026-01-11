#!/bin/bash
set -e

echo "================================================"
echo "Parallax Platform Build Script"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "Checking prerequisites..."
command -v npm >/dev/null 2>&1 || { echo -e "${RED}Error: npm is required but not installed.${NC}" >&2; exit 1; }
command -v cargo >/dev/null 2>&1 || { echo -e "${RED}Error: cargo is required but not installed.${NC}" >&2; exit 1; }
echo -e "${GREEN}✓ Prerequisites check passed${NC}"
echo ""

# Get version from package.json
VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "unknown")
echo "Building version: v$VERSION"
echo ""

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf dist/ src-tauri/target/release/bundle/ 2>/dev/null || true
echo -e "${GREEN}✓ Cleaned${NC}"
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Run linter (if configured)
if grep -q "\"lint\"" package.json; then
    echo "Running linter..."
    npm run lint || echo -e "${YELLOW}⚠ Linter warnings (continuing anyway)${NC}"
    echo ""
fi

# Build frontend
echo "Building React frontend..."
npm run build
echo -e "${GREEN}✓ Frontend built${NC}"
echo ""

# Build Tauri app for current platform
echo "Building Tauri application..."
npm run tauri build
echo -e "${GREEN}✓ Tauri build complete${NC}"
echo ""

# Find and list generated installers
echo "================================================"
echo "Build Complete!"
echo "================================================"
echo ""
echo "Generated installers:"
echo ""

if [ -d "src-tauri/target/release/bundle" ]; then
    find src-tauri/target/release/bundle -type f \( \
        -name "*.exe" -o \
        -name "*.msi" -o \
        -name "*.dmg" -o \
        -name "*.app" -o \
        -name "*.AppImage" -o \
        -name "*.deb" -o \
        -name "*.rpm" \
    \) -exec ls -lh {} \; | awk '{print "  " $9 " (" $5 ")"}'
else
    echo -e "${YELLOW}  No installers found in expected location${NC}"
fi

echo ""
echo "Next steps:"
echo "  1. Test the installer on a fresh machine"
echo "  2. Upload to GitHub Releases (if ready)"
echo "  3. Update download links on website"
echo "  4. Announce on social media"
echo ""
echo "Build script completed successfully!"
echo ""
