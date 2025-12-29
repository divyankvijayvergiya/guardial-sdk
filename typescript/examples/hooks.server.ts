/**
 * Example hooks.server.ts for SvelteKit
 * 
 * Copy this to your src/hooks.server.ts and customize as needed
 */

import { createGuardialHandle } from '@guardial/sveltekit-sdk/hooks';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';

// Guardial protection handle
const guardialHandle = createGuardialHandle({
  config: {
    apiKey: process.env.GUARDIAL_API_KEY!,
    endpoint: process.env.GUARDIAL_ENDPOINT || 'https://api.guardial.com',
    customerId: 'your-app-name', // Change this!
    debug: process.env.NODE_ENV === 'development'
  },
  excludePaths: [
    '/_app',
    '/_build',
    '/favicon.ico',
    '/api/health'
  ],
  failOpen: true,
  onError: (error, event) => {
    console.error('Guardial analysis failed:', {
      path: event.url.pathname,
      method: event.request.method,
      error: error.message
    });
  },
  onBlocked: (analysis, event) => {
    console.warn('Request blocked:', {
      path: event.url.pathname,
      method: event.request.method,
      riskScore: analysis.riskScore,
      reasons: analysis.riskReasons
    });
  }
});

// Combine with other handles
export const handle: Handle = sequence(
  guardialHandle
  // Add other handles here, e.g.:
  // authenticationHandle,
  // loggingHandle
);



