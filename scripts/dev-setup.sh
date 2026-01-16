#!/bin/bash

set -e

echo "========================================="
echo "Parallax Development Environment Setup"
echo "========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Detect OS
OS="$(uname -s)"
case "${OS}" in
    Linux*)     MACHINE=Linux;;
    Darwin*)    MACHINE=Mac;;
    MINGW*|MSYS*|CYGWIN*)  MACHINE=Windows;;
    *)          MACHINE="UNKNOWN:${OS}"
esac

echo -e "${BLUE}Detected OS: ${MACHINE}${NC}"
echo ""

# Install Rust
if ! command -v cargo &> /dev/null; then
    echo "Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
    echo -e "${GREEN}✓${NC} Rust installed"
else
    echo -e "${GREEN}✓${NC} Rust already installed: $(cargo --version)"
fi
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠${NC}  Node.js not found"
    echo "Please install Node.js 18+ from: https://nodejs.org"
    echo "After installing, run this script again"
    exit 1
else
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
fi
echo ""

# Install platform-specific dependencies
echo "Installing platform-specific dependencies..."
case "${MACHINE}" in
    Linux)
        echo "Detecting Linux distribution..."
        if [ -f /etc/debian_version ]; then
            echo "Debian/Ubuntu detected"
            sudo apt-get update
            sudo apt-get install -y \
                libwebkit2gtk-4.1-dev \
                build-essential \
                curl \
                wget \
                file \
                libssl-dev \
                libayatana-appindicator3-dev \
                librsvg2-dev \
                patchelf
            echo -e "${GREEN}✓${NC} Linux dependencies installed"
        elif [ -f /etc/redhat-release ]; then
            echo "RedHat/Fedora detected"
            sudo dnf install -y \
                webkit2gtk4.1-devel \
                openssl-devel \
                curl \
                wget \
                file \
                libappindicator-gtk3-devel \
                librsvg2-devel
            echo -e "${GREEN}✓${NC} Linux dependencies installed"
        else
            echo -e "${YELLOW}⚠${NC}  Unknown Linux distribution"
            echo "Please install dependencies manually:"
            echo "  - webkit2gtk"
            echo "  - build-essential"
            echo "  - libssl-dev"
            echo "  - libappindicator3-dev"
        fi
        ;;
    Mac)
        echo "Checking Xcode Command Line Tools..."
        if ! xcode-select -p &> /dev/null; then
            echo "Installing Xcode Command Line Tools..."
            xcode-select --install
            echo "Please complete the installation in the dialog, then run this script again"
            exit 0
        else
            echo -e "${GREEN}✓${NC} Xcode Command Line Tools installed"
        fi
        ;;
    Windows)
        echo -e "${YELLOW}⚠${NC}  Windows detected"
        echo "Please ensure you have installed:"
        echo "  - Visual Studio Build Tools 2019 or later"
        echo "  - C++ Build Tools component"
        echo ""
        echo "Download from: https://visualstudio.microsoft.com/downloads/"
        echo ""
        read -p "Press Enter when ready to continue..."
        ;;
    *)
        echo -e "${YELLOW}⚠${NC}  Unknown OS: ${MACHINE}"
        ;;
esac
echo ""

# Install npm dependencies
echo "Installing npm dependencies..."
npm install
echo -e "${GREEN}✓${NC} npm dependencies installed"
echo ""

# Install Rust dependencies
echo "Fetching Rust dependencies..."
cd src-tauri
cargo fetch
cd ..
echo -e "${GREEN}✓${NC} Rust dependencies fetched"
echo ""

# Set up git hooks (optional)
if [ -d ".git" ]; then
    echo "Setting up git hooks..."
    cat > .git/hooks/pre-commit << 'HOOK'
#!/bin/bash
echo "Running pre-commit checks..."
npm run lint || exit 1
npm run type-check || exit 1
echo "Pre-commit checks passed!"
HOOK
    chmod +x .git/hooks/pre-commit
    echo -e "${GREEN}✓${NC} Git hooks configured"
else
    echo -e "${YELLOW}⚠${NC}  Not a git repository, skipping git hooks"
fi
echo ""

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✓${NC} .env file created from template"
        echo -e "${YELLOW}⚠${NC}  Please edit .env and add your API keys"
    else
        echo -e "${YELLOW}⚠${NC}  No .env.example found"
    fi
else
    echo -e "${GREEN}✓${NC} .env file already exists"
fi
echo ""

# Install Playwright for E2E tests
read -p "Install Playwright for E2E tests? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Installing Playwright..."
    npx playwright install chromium
    echo -e "${GREEN}✓${NC} Playwright installed"
fi
echo ""

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Development environment setup complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Edit .env file with your API keys"
echo "  2. Run 'npm run tauri:dev' to start development server"
echo "  3. Read docs/developer/BUILDING.md for more information"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
