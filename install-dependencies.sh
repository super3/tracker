#!/bin/bash

# Delta Vacations Scraper - System Dependencies Installer
# This script installs the required system packages for Playwright browsers

set -e

echo "🚀 Installing system dependencies for Delta Vacations Scraper..."

# Check operating system
case "$OSTYPE" in
    darwin*)
        echo "🍎 Detected macOS"
        ;;
    linux-gnu*)
        echo "🐧 Detected Linux"
        ;;
    *)
        echo "❌ Unsupported operating system: $OSTYPE"
        echo "   This script supports macOS and Linux only."
        echo "   For other systems, please refer to the Playwright documentation:"
        echo "   https://playwright.dev/docs/intro#system-requirements"
        exit 1
        ;;
esac

# Handle macOS (no additional system dependencies needed)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "✅ macOS detected - Playwright browsers will work without additional system packages"
    echo "   Note: Playwright automatically downloads all necessary dependencies on macOS"
    
# Detect package manager for Linux systems
elif command -v apt-get &> /dev/null; then
    echo "📦 Detected APT package manager (Ubuntu/Debian)"
    
    echo "   Updating package lists..."
    sudo apt-get update
    
    echo "   Installing Playwright dependencies..."
    sudo apt-get install -y \
        libgstreamer1.0-0 \
        libgstreamer-plugins-base1.0-0 \
        libgtk-4-1 \
        libgraphene-1.0-0 \
        libxslt1.1 \
        libevent-2.1-7t64 \
        libopus0 \
        libvpx9 \
        || sudo apt-get install -y \
        libgstreamer1.0-0 \
        libgstreamer-plugins-base1.0-0 \
        libgtk-4-1 \
        libgraphene-1.0-0 \
        libxslt1.1 \
        libevent-2.1-7 \
        libopus0 \
        libvpx9
        
elif command -v yum &> /dev/null; then
    echo "📦 Detected YUM package manager (RHEL/CentOS/Fedora)"
    echo "   Installing Playwright dependencies..."
    sudo yum install -y \
        gstreamer1 \
        gstreamer1-plugins-base \
        gtk4 \
        libxslt \
        libevent \
        opus \
        libvpx
        
elif command -v pacman &> /dev/null; then
    echo "📦 Detected Pacman package manager (Arch Linux)"
    echo "   Installing Playwright dependencies..."
    sudo pacman -S --needed \
        gstreamer \
        gst-plugins-base \
        gtk4 \
        libxslt \
        libevent \
        opus \
        libvpx
        
else
    echo "❌ Unsupported package manager."
    echo "   Please install the following packages manually:"
    echo "   - GStreamer and plugins"
    echo "   - GTK4"
    echo "   - libxslt"
    echo "   - libevent"
    echo "   - opus"
    echo "   - libvpx"
    echo ""
    echo "   Or refer to Playwright documentation:"
    echo "   https://playwright.dev/docs/intro#system-requirements"
    exit 1
fi

echo "✅ System dependencies installed successfully!"
echo ""
echo "🎯 Next steps:"
echo "   1. npm install"
echo "   2. npm run build"
echo "   3. npm run start:api"
echo ""
echo "🌐 Your API will be available at: http://localhost:3000"