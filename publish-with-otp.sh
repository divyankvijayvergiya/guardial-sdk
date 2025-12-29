#!/bin/bash

# Guardial SDK Publishing Script with OTP support
# Usage: ./publish-with-otp.sh [OTP_CODE]

set -e

OTP_CODE=$1

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

# Build OTP flag
OTP_FLAG=""
if [ -n "$OTP_CODE" ]; then
    OTP_FLAG="--otp=$OTP_CODE"
    echo "🔐 Using provided OTP code"
else
    echo "⚠️  No OTP provided - npm will prompt if needed"
fi
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

if npm publish --access public $OTP_FLAG; then
    PUBLISHED_VERSION=$(node -p "require('./package.json').version")
    echo "✅ Published ${PACKAGE_NAME}@${PUBLISHED_VERSION}"
else
    echo "❌ Failed to publish TypeScript SDK"
    if [ -z "$OTP_CODE" ]; then
        echo "💡 Try again with OTP: ./publish-with-otp.sh YOUR_OTP_CODE"
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

if npm publish --access public $OTP_FLAG; then
    PUBLISHED_VERSION=$(node -p "require('./package.json').version")
    echo "✅ Published ${PACKAGE_NAME}@${PUBLISHED_VERSION}"
else
    echo "❌ Failed to publish JavaScript SDK"
    if [ -z "$OTP_CODE" ]; then
        echo "💡 Try again with OTP: ./publish-with-otp.sh YOUR_OTP_CODE"
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

if npm publish --access public $OTP_FLAG; then
    PUBLISHED_VERSION=$(node -p "require('./package.json').version")
    echo "✅ Published ${PACKAGE_NAME}@${PUBLISHED_VERSION}"
else
    echo "❌ Failed to publish React SDK"
    if [ -z "$OTP_CODE" ]; then
        echo "💡 Try again with OTP: ./publish-with-otp.sh YOUR_OTP_CODE"
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

