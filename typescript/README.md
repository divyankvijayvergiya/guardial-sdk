# Guardial SvelteKit SDK

🛡️ **TypeScript-first security SDK for SvelteKit applications**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-2.0+-orange.svg)](https://kit.svelte.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Real-time OWASP Top 10 Detection & LLM Prompt Firewall for SvelteKit applications with full TypeScript support.

## Features

- ✅ **TypeScript-first** - Full type safety and IntelliSense support
- ✅ **SSR Support** - Works seamlessly with SvelteKit server-side rendering
- ✅ **Automatic Protection** - Protect all routes via hooks
- ✅ **LLM Prompt Firewall** - Detect and block prompt injection attacks
- ✅ **OWASP Top 10 Detection** - SQL injection, XSS, path traversal, and more
- ✅ **Zod Integration** - Type-safe validation with security checks
- ✅ **Client & Server** - Works in both server and client code

## Installation

```bash
npm install @divyank96/guardial-sveltekit-sdk
# or
pnpm add @divyank96/guardial-sveltekit-sdk
# or
yarn add @divyank96/guardial-sveltekit-sdk
```

## Quick Start

### 1. Get Your API Key

Sign up at [dashboard.guardial.in](https://dashboard.guardial.in) to get your free API key (100K requests/month).

### 2. Configure Environment Variables

Create `.env` file:

```bash
GUARDIAL_API_KEY=your-api-key-here
GUARDIAL_ENDPOINT=https://api.guardial.in
```

### 3. Set Up Hooks (Automatic Protection)

Create or update `src/hooks.server.ts`:

```typescript
import { createGuardialHandle } from '@divyank96/guardial-sveltekit-sdk/hooks';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = createGuardialHandle({
  config: {
    apiKey: process.env.GUARDIAL_API_KEY!,
    endpoint: process.env.GUARDIAL_ENDPOINT || 'https://api.guardial.in',
    customerId: 'your-app-name',
    debug: process.env.NODE_ENV === 'development'
  },
  excludePaths: ['/_app', '/_build', '/favicon.ico', '/api/health'],
  failOpen: true // Allow requests if analysis fails
});
```

That's it! All your routes are now automatically protected.

### 4. Use in API Routes

```typescript
// src/routes/api/chat/+server.ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GuardialClient } from '@divyank96/guardial-sveltekit-sdk';

const guardial = new GuardialClient({
  apiKey: process.env.GUARDIAL_API_KEY!,
  customerId: 'your-app-name'
});

export const POST: RequestHandler = async ({ request }) => {
  const { message } = await request.json();

  // Analyze LLM prompt
  const analysis = await guardial.promptGuard(message, {
    user_id: request.headers.get('x-user-id') || 'anonymous'
  });

  if (!analysis.allowed) {
    throw error(403, {
      message: 'Prompt blocked',
      details: analysis.reasons
    });
  }

  // Your business logic here
  return json({ response: 'Safe to process' });
};
```

### 5. Use in Svelte Components (Client-Side)

```typescript
// src/lib/guardial.ts
import { getGuardialClient } from '@divyank96/guardial-sveltekit-sdk/client';
import { browser } from '$app/environment';

export function initGuardial() {
  if (browser) {
    return getGuardialClient({
      apiKey: import.meta.env.PUBLIC_GUARDIAL_API_KEY,
      customerId: 'your-app-name'
    });
  }
  return null;
}
```

```svelte
<!-- src/routes/chat/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { analyzePrompt } from '@divyank96/guardial-sveltekit-sdk/client';
  import { initGuardial } from '$lib/guardial';

  let message = '';
  let response = '';
  let loading = false;

  onMount(() => {
    initGuardial();
  });

  async function sendMessage() {
    loading = true;
    
    try {
      // Check prompt before sending
      const analysis = await analyzePrompt(message);
      
      if (!analysis.allowed) {
        alert(`Prompt blocked: ${analysis.reasons.join(', ')}`);
        return;
      }

      // Make API call
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const data = await res.json();
      response = data.response;
      
    } catch (error) {
      console.error('Error:', error);
      alert('Request failed');
    } finally {
      loading = false;
    }
  }
</script>

<div class="chat-container">
  <input bind:value={message} placeholder="Enter message" />
  <button on:click={sendMessage} disabled={loading}>
    {loading ? 'Sending...' : 'Send'}
  </button>
  {#if response}
    <div class="response">{response}</div>
  {/if}
</div>
```

## API Reference

### GuardialClient

Main client class for security analysis.

```typescript
import { GuardialClient } from '@divyank96/guardial-sveltekit-sdk';

const client = new GuardialClient({
  apiKey: 'your-api-key',
  endpoint: 'https://api.guardial.in',
  customerId: 'your-app-name',
  debug: false,
  timeout: 30000
});
```

#### Methods

- `analyzeRequestEvent(event: RequestEvent)` - Analyze a SvelteKit request event
- `analyzeEvent(event: SecurityEventRequest)` - Analyze a security event
- `promptGuard(input: string, context?: Record<string, string>)` - Analyze LLM prompt
- `healthCheck()` - Check Guardial service health

### Hooks Integration

```typescript
import { createGuardialHandle } from '@divyank96/guardial-sveltekit-sdk/hooks';

export const handle = createGuardialHandle({
  config: { /* ... */ },
  excludePaths: ['/_app'],
  failOpen: true,
  onError: (error, event) => { /* ... */ },
  onBlocked: (analysis, event) => { /* ... */ }
});
```

### Client Utilities

```typescript
import { 
  getGuardialClient, 
  secureFetch, 
  analyzePrompt 
} from '@divyank96/guardial-sveltekit-sdk/client';

// Get client instance
const client = getGuardialClient(config);

// Secure fetch wrapper
const response = await secureFetch('/api/data', options);

// Analyze prompt
const analysis = await analyzePrompt('user input');
```

### Zod Integration

```typescript
import { guardialSafe } from '@divyank96/guardial-sveltekit-sdk/zod';
import { z } from 'zod';

const schema = z.object({
  message: z.string()
});

const parser = guardialSafe(schema, {
  guardial: client,
  checkPrompts: true
});

const data = await parser.parse({ message: userInput });
```

## Type Definitions

Add to `src/app.d.ts`:

```typescript
declare global {
  namespace App {
    interface Locals {
      guardial?: {
        analysis: import('@divyank96/guardial-sveltekit-sdk').SecurityEventResponse;
        riskScore: number;
        eventId: string;
      };
    }
  }
}

export {};
```

## Configuration Options

### GuardialConfig

```typescript
interface GuardialConfig {
  apiKey: string;           // Required: Your API key
  endpoint?: string;         // Optional: API endpoint (default: https://api.guardial.in)
  customerId?: string;       // Optional: Customer ID (default: 'default')
  debug?: boolean;           // Optional: Enable debug logging (default: false)
  timeout?: number;          // Optional: Request timeout in ms (default: 30000)
}
```

### GuardialHooksOptions

```typescript
interface GuardialHooksOptions {
  config: GuardialConfig;
  excludePaths?: string[];   // Paths to exclude from analysis
  failOpen?: boolean;        // Allow requests if analysis fails (default: true)
  onError?: (error, event) => void;
  onBlocked?: (analysis, event) => void;
}
```

## Examples

### Example 1: Protect API Route

```typescript
// src/routes/api/users/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  // Request already analyzed by hooks.server.ts
  // Access analysis via locals.guardial
  
  if (locals.guardial?.riskScore > 70) {
    console.warn('High-risk request detected');
  }

  return json({ users: [] });
};
```

### Example 2: Manual Analysis

```typescript
// src/routes/api/upload/+server.ts
import { error } from '@sveltejs/kit';
import { GuardialClient } from '@divyank96/guardial-sveltekit-sdk';

const guardial = new GuardialClient({
  apiKey: process.env.GUARDIAL_API_KEY!
});

export const POST: RequestHandler = async ({ request }) => {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  // Analyze file content if it's text
  if (file.type.startsWith('text/')) {
    const content = await file.text();
    const analysis = await guardial.promptGuard(content);
    
    if (!analysis.allowed) {
      throw error(403, { message: 'File content blocked' });
    }
  }

  // Process file...
  return json({ success: true });
};
```

### Example 3: Form Validation with Zod

```typescript
// src/routes/contact/+page.server.ts
import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { guardialSafe } from '@divyank96/guardial-sveltekit-sdk/zod';
import { GuardialClient } from '@divyank96/guardial-sveltekit-sdk';

const guardial = new GuardialClient({
  apiKey: process.env.GUARDIAL_API_KEY!
});

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(10)
});

export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Validate with Zod and Guardial
    const parser = guardialSafe(contactSchema, {
      guardial,
      shouldCheckPrompt: (value) => {
        // Only check the message field
        return typeof value === 'object' && 'message' in value;
      }
    });

    try {
      const validated = await parser.parse(data);
      // Process form...
      return { success: true };
    } catch (error) {
      return fail(400, { error: error.message });
    }
  }
};
```

## Error Handling

```typescript
import { GuardialError } from '@divyank96/guardial-sveltekit-sdk';

try {
  const analysis = await client.analyzeEvent(event);
} catch (error) {
  if (error instanceof GuardialError) {
    console.error('Guardial error:', error.statusCode, error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Best Practices

1. **Always use environment variables** for API keys
2. **Exclude static assets** from analysis in hooks
3. **Use fail-open** in development, **fail-closed** in production for critical endpoints
4. **Monitor risk scores** in your application logs
5. **Handle errors gracefully** - don't expose internal details to users

## Support

- **Documentation**: https://docs.guardial.in
- **GitHub Issues**: https://github.com/guardial/sveltekit-sdk/issues
- **Email**: support@guardial.in

## License

MIT License - see LICENSE file for details.

---

**Ready to secure your SvelteKit application?** Get your API key at [dashboard.guardial.in](https://dashboard.guardial.in) and start protecting your APIs today!

