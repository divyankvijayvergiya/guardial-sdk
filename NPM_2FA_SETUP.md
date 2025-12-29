# npm 2FA Setup Guide

## Problem
npm requires Two-Factor Authentication (2FA) or a granular access token to publish scoped packages like `@guardial/sveltekit-sdk`.

## Solution Options

### Option 1: Enable 2FA on npm Account (Recommended)

1. **Go to npm account settings:**
   - Visit: https://www.npmjs.com/settings/[your-username]/profile
   - Or: https://www.npmjs.com/settings/[your-username]/two-factor-auth

2. **Enable 2FA:**
   - Click "Enable 2FA"
   - Scan QR code with authenticator app (Google Authenticator, Authy, etc.)
   - Enter the 6-digit code to verify

3. **Login again with 2FA:**
   ```bash
   npm login
   ```
   - Enter username, password
   - Enter 2FA code when prompted

4. **Publish:**
   ```bash
   cd sdk
   ./publish.sh
   ```

### Option 2: Use Granular Access Token (Alternative)

1. **Create Access Token:**
   - Go to: https://www.npmjs.com/settings/[your-username]/tokens
   - Click "Generate New Token"
   - Select "Granular Access Token"
   - Choose "Publish" permissions
   - Enable "Bypass 2FA" option (if available)
   - Copy the token

2. **Use Token for Publishing:**
   ```bash
   # Set token as environment variable
   export NPM_TOKEN=your-token-here
   
   # Or use .npmrc
   echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc
   ```

3. **Publish:**
   ```bash
   cd sdk
   ./publish.sh
   ```

### Option 3: Use npm Access Token Directly

```bash
# Login with token
npm login --auth-type=legacy

# Or set in .npmrc
echo "//registry.npmjs.org/:_authToken=YOUR_TOKEN" > ~/.npmrc
```

## Quick Fix: Enable 2FA (Fastest)

1. Visit: https://www.npmjs.com/settings/[your-username]/two-factor-auth
2. Enable 2FA with authenticator app
3. Run: `npm login` (will prompt for 2FA code)
4. Run: `cd sdk && ./publish.sh`

## Verify Setup

```bash
# Check if 2FA is enabled
npm profile get

# Check login status
npm whoami
```



