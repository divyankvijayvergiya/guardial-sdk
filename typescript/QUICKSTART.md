# Quick Start Guide - Guardial SvelteKit SDK

Get up and running in 5 minutes! 🚀

## Step 1: Install

```bash
npm install @guardial/sveltekit-sdk
```

## Step 2: Environment Variables

Add to your `.env`:

```bash
GUARDIAL_API_KEY=your-api-key-here
GUARDIAL_ENDPOINT=https://api.guardial.in
```

## Step 3: Set Up Hooks (Automatic Protection)

Create `src/hooks.server.ts`:

```typescript
import { createGuardialHandle } from '@guardial/sveltekit-sdk/hooks';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = createGuardialHandle({
  config: {
    apiKey: process.env.GUARDIAL_API_KEY!,
    customerId: 'your-app-name',
    debug: process.env.NODE_ENV === 'development'
  },
  excludePaths: ['/_app', '/_build', '/favicon.ico']
});
```

**Done!** All your routes are now automatically protected. ✅

## Step 4: Use in API Routes (Optional)

```typescript
// src/routes/api/chat/+server.ts
import { json, error } from '@sveltejs/kit';
import { GuardialClient } from '@guardial/sveltekit-sdk';

const guardial = new GuardialClient({
  apiKey: process.env.GUARDIAL_API_KEY!
});

export const POST = async ({ request }) => {
  const { message } = await request.json();
  
  // Analyze LLM prompt
  const analysis = await guardial.promptGuard(message);
  
  if (!analysis.allowed) {
    throw error(403, 'Prompt blocked');
  }
  
  return json({ response: 'Safe to process' });
};
```

## Step 5: Type Definitions (Optional)

Add to `src/app.d.ts`:

```typescript
declare global {
  namespace App {
    interface Locals {
      guardial?: {
        analysis: import('@guardial/sveltekit-sdk').SecurityEventResponse;
        riskScore: number;
        eventId: string;
      };
    }
  }
}
```

## That's It!

Your SvelteKit app is now protected. Check the [full documentation](README.md) or [integration guide](INTEGRATION_GUIDE.md) for more details.

## Need Help?

- 📖 [Full Documentation](README.md)
- 🔧 [Integration Guide](INTEGRATION_GUIDE.md)
- 💬 [Support](mailto:support@guardial.in)


