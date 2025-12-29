#!/bin/bash

# Alternative publishing script using npm access token
# Use this if you prefer token-based authentication

set -e

echo "🚀 Publishing Guardial SDKs to npm (Token-based)"
echo ""

# Check for token
if [ -z "$NPM_TOKEN" ]; then
    echo "❌ NPM_TOKEN environment variable not set"
    echo ""
    echo "📝 To use this method:"
    echo "   1. Create token at: https://www.npmjs.com/settings/[username]/tokens"
    echo "   2. Select 'Granular Access Token' with 'Publish' permissions"
    echo "   3. Run: export NPM_TOKEN=your-token-here"
    echo "   4. Run this script again"
    echo ""
    echo "💡 Or enable 2FA and use: ./publish.sh"
    exit 1
fi

# Configure npmrc with token
echo "🔑 Configuring npm with access token..."
echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc
echo "✅ Token configured"
echo ""

# Publish TypeScript SDK
echo "📦 Publishing TypeScript/SvelteKit SDK..."
cd typescript
npm run build
npm publish --access public
echo "✅ Published @guardial/sveltekit-sdk@0.1.0"
echo ""

# Publish JavaScript SDK
echo "📦 Publishing JavaScript SDK..."
cd ../javascript
npm publish --access public
echo "✅ Published guardial-js-sdk@0.2.1"
echo ""

echo "🎉 All SDKs published successfully!"
echo ""
echo "📚 Clients can now install:"
echo "   npm install @guardial/sveltekit-sdk"
echo "   npm install guardial-js-sdk"
echo ""
echo "🔍 Verify packages:"
echo "   npm view @guardial/sveltekit-sdk"
echo "   npm view guardial-js-sdk"



