#!/bin/bash

# Guardial SvelteKit SDK Publishing Script
# This script publishes the TypeScript/SvelteKit SDK to npm
# Usage: ./publish-sveltekit.sh [OTP_CODE]

set -e

echo "🚀 Publishing Guardial SvelteKit SDK to npm"
echo ""

# Navigate to SDK directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SDK_DIR="$SCRIPT_DIR/typescript"

if [ ! -d "$SDK_DIR" ]; then
    echo "❌ TypeScript SDK directory not found: $SDK_DIR"
    exit 1
fi

cd "$SDK_DIR"

# Check if logged in to npm
if ! npm whoami &> /dev/null; then
    echo "❌ Not logged in to npm"
    echo "📝 Please run: npm login"
    exit 1
fi

echo "✅ Logged in as: $(npm whoami)"
echo ""

# Check for OTP if provided
OTP_ARG=""
if [ -n "$1" ]; then
    OTP_ARG="--otp=$1"
    echo "🔐 Using OTP provided as argument"
    echo ""
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
PACKAGE_NAME=$(node -p "require('./package.json').name")

echo "📦 Package: $PACKAGE_NAME"
echo "📌 Current version: $CURRENT_VERSION"
echo ""

# Check if version already exists
PACKAGE_EXISTS=true
if ! npm view "${PACKAGE_NAME}" version &>/dev/null 2>&1; then
    PACKAGE_EXISTS=false
    echo "📦 Package doesn't exist yet - first publish!"
    echo ""
else
    if npm view "${PACKAGE_NAME}@${CURRENT_VERSION}" version &>/dev/null 2>&1; then
        echo "⚠️  Version ${CURRENT_VERSION} already exists, bumping patch version..."
        npm version patch --no-git-tag-version
        NEW_VERSION=$(node -p "require('./package.json').version")
        echo "📌 Bumped version to ${NEW_VERSION}"
        echo ""
    fi
fi

# Build the SDK
echo "🔨 Building SDK..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"
echo ""

# Publish to npm
echo "📤 Publishing to npm..."
if npm publish --access public $OTP_ARG; then
    PUBLISHED_VERSION=$(node -p "require('./package.json').version")
    echo ""
    echo "✅ Successfully published ${PACKAGE_NAME}@${PUBLISHED_VERSION}"
    echo ""
    echo "📚 Clients can now install:"
    echo "   npm install ${PACKAGE_NAME}@${PUBLISHED_VERSION}"
    echo ""
    echo "🔍 Verify package:"
    echo "   npm view ${PACKAGE_NAME}"
    echo ""
else
    echo ""
    echo "❌ Failed to publish SDK"
    if [ -z "$OTP_ARG" ]; then
        echo ""
        echo "💡 OTP may be required. Run:"
        echo "   ./publish-sveltekit.sh YOUR_OTP_CODE"
    fi
    exit 1
fi


