# Publishing Guardial SDKs to npm

## Prerequisites

1. **npm account** - Create one at https://www.npmjs.com/signup if you don't have one
2. **npm login** - You need to be logged in to publish

## Step 1: Login to npm

```bash
npm login
```

Enter your:
- Username
- Password  
- Email
- OTP (if 2FA is enabled)

## Step 2: Verify Login

```bash
npm whoami
```

Should display your npm username.

## Step 3: Publish TypeScript/SvelteKit SDK

```bash
cd sdk/typescript
npm run build
npm publish --access public
```

## Step 4: Publish JavaScript SDK

```bash
cd sdk/javascript
npm publish --access public
```

## Verification

After publishing, verify packages are live:

```bash
# Check TypeScript SDK
npm view @guardial/sveltekit-sdk

# Check JavaScript SDK
npm view guardial-js-sdk
```

## What Gets Published

### TypeScript SDK (`@guardial/sveltekit-sdk`)
- ✅ `dist/` - Compiled JavaScript and TypeScript definitions
- ✅ `README.md` - Documentation
- ✅ `LICENSE` - MIT License
- ✅ `package.json` - Package metadata
- ❌ No API keys (all use environment variables)
- ❌ No source files (only compiled dist/)
- ❌ No examples or sensitive files

### JavaScript SDK (`guardial-js-sdk`)
- ✅ `guardial.js` - Main SDK file
- ✅ `guardial.d.ts` - TypeScript definitions
- ✅ `README.md` - Documentation
- ✅ `LICENSE` - MIT License
- ✅ `package.json` - Package metadata
- ❌ No API keys (all use config parameters)
- ❌ No examples or sensitive files

## Client Usage After Publishing

### TypeScript/SvelteKit
```bash
npm install @guardial/sveltekit-sdk
```

### JavaScript
```bash
npm install guardial-js-sdk
```

## Troubleshooting

### Error: "Access token expired"
**Solution:** Run `npm login` again

### Error: "You do not have permission"
**Solution:** 
- Make sure you're logged in: `npm whoami`
- Check if the package name is available
- For scoped packages (@guardial/), you may need to create an organization

### Error: "Package name already exists"
**Solution:** 
- Check if package exists: `npm view @guardial/sveltekit-sdk`
- If it exists, bump version in package.json
- If you own it, you can publish updates

## Security Checklist

Before publishing, verify:
- ✅ No API keys in code
- ✅ No hardcoded credentials
- ✅ No .env files included
- ✅ Only necessary files in `files` array
- ✅ .npmignore excludes sensitive files



