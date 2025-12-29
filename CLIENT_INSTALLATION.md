# Client Installation Guide - Guardial SDKs

## 📦 Published Packages

### TypeScript/SvelteKit SDK
**Package:** `@guardial/sveltekit-sdk`  
**Version:** 0.1.0  
**Install:** `npm install @guardial/sveltekit-sdk`

### JavaScript SDK  
**Package:** `guardial-js-sdk`  
**Version:** 0.2.1  
**Install:** `npm install guardial-js-sdk`

## 🚀 Quick Installation

### For SvelteKit/TypeScript Projects

```bash
npm install @guardial/sveltekit-sdk
```

### For JavaScript/Node.js Projects

```bash
npm install guardial-js-sdk
```

## 📋 Setup Instructions

### Step 1: Install SDK

```bash
# SvelteKit
npm install @guardial/sveltekit-sdk

# Or JavaScript
npm install guardial-js-sdk
```

### Step 2: Get Your API Key

1. Sign up at [dashboard.guardial.in](https://dashboard.guardial.in)
2. Get your API key from the dashboard
3. Your API key will look like: `grd_yourname_xxxxxxxxxxxxx`

### Step 3: Configure Environment Variables

Create `.env` file:

```bash
GUARDIAL_API_KEY=your-api-key-here
GUARDIAL_ENDPOINT=https://api.guardial.com
```

### Step 4: Integrate SDK

#### SvelteKit Example

```typescript
// src/hooks.server.ts
import { createGuardialHandle } from '@guardial/sveltekit-sdk/hooks';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = createGuardialHandle({
  config: {
    apiKey: process.env.GUARDIAL_API_KEY!,
    customerId: 'your-app-name'
  }
});
```

#### JavaScript Example

```javascript
import GuardialSDK from 'guardial-js-sdk';

const guardial = new GuardialSDK({
  apiKey: process.env.GUARDIAL_API_KEY,
  customerId: 'your-app-name'
});
```

## 🔒 Security Note

**Never commit API keys to version control!**

- ✅ Use environment variables
- ✅ Add `.env` to `.gitignore`
- ✅ Use secrets management in production
- ❌ Never hardcode API keys
- ❌ Never commit `.env` files

## 📚 Documentation

- **TypeScript SDK:** See `sdk/typescript/README.md`
- **JavaScript SDK:** See `sdk/javascript/README.md`
- **Integration Guide:** See `sdk/typescript/INTEGRATION_GUIDE.md`

## 🆘 Support

- **Dashboard:** https://dashboard.guardial.in
- **Email:** support@guardial.com
- **Documentation:** https://docs.guardial.com



