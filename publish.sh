#!/bin/bash

# Guardial SDK Publishing Script
# This script publishes TypeScript, JavaScript, and React SDKs to npm
# Note: Requires @divyank96 scope to exist on npm

set -e

echo "🚀 Publishing Guardial SDKs to npm"
echo ""

# Check if logged in
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
fi

# Note: Using @divyank96 scope (existing scope)
echo "📦 Publishing to @divyank96 scope"
echo ""

# Publish TypeScript SDK
echo "📦 Publishing TypeScript/SvelteKit SDK..."
cd typescript

# Check if version already exists and bump if needed
CURRENT_VERSION=$(node -p "require('./package.json').version")
PACKAGE_NAME=$(node -p "require('./package.json').name")

# Check if package exists first (404 is OK for new packages)
PACKAGE_EXISTS=true
if ! npm view "${PACKAGE_NAME}" version &>/dev/null 2>&1; then
    PACKAGE_EXISTS=false
    echo "📦 Package ${PACKAGE_NAME} doesn't exist yet - first publish!"
fi

# Only check version if package exists
if [ "$PACKAGE_EXISTS" = true ]; then
    if npm view "${PACKAGE_NAME}@${CURRENT_VERSION}" version &>/dev/null 2>&1; then
        echo "⚠️  Version ${CURRENT_VERSION} already exists, bumping patch version..."
        npm version patch --no-git-tag-version
        NEW_VERSION=$(node -p "require('./package.json').version")
        echo "📌 Bumped version to ${NEW_VERSION}"
    fi
fi

npm run build

# Try to publish
if npm publish --access public $OTP_ARG; then
    PUBLISHED_VERSION=$(node -p "require('./package.json').version")
    echo "✅ Published ${PACKAGE_NAME}@${PUBLISHED_VERSION}"
else
    echo "❌ Failed to publish TypeScript SDK"
    if [ -z "$OTP_ARG" ]; then
        echo "💡 OTP may be required. Run: ./publish.sh YOUR_OTP_CODE"
    fi
    exit 1
fi
echo ""

# Publish JavaScript SDK
echo "📦 Publishing JavaScript SDK..."
cd ../javascript

# Check if version already exists and bump if needed
CURRENT_VERSION=$(node -p "require('./package.json').version")
PACKAGE_NAME=$(node -p "require('./package.json').name")

# Check if package exists first (404 is OK for new packages)
PACKAGE_EXISTS=true
if ! npm view "${PACKAGE_NAME}" version &>/dev/null 2>&1; then
    PACKAGE_EXISTS=false
    echo "📦 Package ${PACKAGE_NAME} doesn't exist yet - first publish!"
fi

# Only check version if package exists
if [ "$PACKAGE_EXISTS" = true ]; then
    if npm view "${PACKAGE_NAME}@${CURRENT_VERSION}" version &>/dev/null 2>&1; then
        echo "⚠️  Version ${CURRENT_VERSION} already exists, bumping patch version..."
        npm version patch --no-git-tag-version
        NEW_VERSION=$(node -p "require('./package.json').version")
        echo "📌 Bumped version to ${NEW_VERSION}"
    fi
fi

# Try to publish
if npm publish --access public $OTP_ARG; then
    PUBLISHED_VERSION=$(node -p "require('./package.json').version")
    echo "✅ Published ${PACKAGE_NAME}@${PUBLISHED_VERSION}"
else
    echo "❌ Failed to publish JavaScript SDK"
    if [ -z "$OTP_ARG" ]; then
        echo "💡 OTP may be required. Run: ./publish.sh YOUR_OTP_CODE"
    fi
    exit 1
fi
echo ""

# Publish React SDK
echo "📦 Publishing React SDK..."
cd ../react

# Check if version already exists and bump if needed
CURRENT_VERSION=$(node -p "require('./package.json').version")
PACKAGE_NAME=$(node -p "require('./package.json').name")

# Check if package exists first (404 is OK for new packages)
PACKAGE_EXISTS=true
if ! npm view "${PACKAGE_NAME}" version &>/dev/null 2>&1; then
    PACKAGE_EXISTS=false
    echo "📦 Package ${PACKAGE_NAME} doesn't exist yet - first publish!"
fi

# Only check version if package exists
if [ "$PACKAGE_EXISTS" = true ]; then
    if npm view "${PACKAGE_NAME}@${CURRENT_VERSION}" version &>/dev/null 2>&1; then
        echo "⚠️  Version ${CURRENT_VERSION} already exists, bumping patch version..."
        npm version patch --no-git-tag-version
        NEW_VERSION=$(node -p "require('./package.json').version")
        echo "📌 Bumped version to ${NEW_VERSION}"
    fi
fi

# Install dependencies first (TypeScript is in devDependencies)
echo "📥 Installing React SDK dependencies..."
npm install --no-save

# Build the React SDK
echo "🔨 Building React SDK..."
npm run build

# Try to publish
if npm publish --access public $OTP_ARG; then
    PUBLISHED_VERSION=$(node -p "require('./package.json').version")
    echo "✅ Published ${PACKAGE_NAME}@${PUBLISHED_VERSION}"
else
    echo "❌ Failed to publish React SDK"
    if [ -z "$OTP_ARG" ]; then
        echo "💡 OTP may be required. Run: ./publish.sh YOUR_OTP_CODE"
    fi
    exit 1
fi
echo ""

echo "🎉 All SDKs published successfully!"
echo ""
echo "📚 Clients can now install:"
echo "   npm install @divyank96/guardial-sveltekit-sdk"
echo "   npm install guardial-js-sdk"
echo "   npm install @divyank96/guardial-react-sdk"
echo ""
echo "🔍 Verify packages:"
echo "   npm view @divyank96/guardial-sveltekit-sdk"
echo "   npm view guardial-js-sdk"
echo "   npm view @divyank96/guardial-react-sdk"
echo ""
echo "📝 Usage:"
echo "   ./publish.sh              # Try without OTP"
echo "   ./publish.sh YOUR_OTP     # Use OTP if required"
