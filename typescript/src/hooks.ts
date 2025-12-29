/**
 * SvelteKit Hooks Integration for Guardial SDK
 * 
 * One-liner integration: export const handle = guardial.protect(handle)
 * Auto-configures from environment variables: GUARDIAL_API_KEY, GUARDIAL_CUSTOMER_ID
 */

import { error } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';
import { GuardialClient, GuardialError } from './index';
import type { GuardialConfig } from './index';

/**
 * Get configuration from environment variables
 */
function getConfigFromEnv(config?: Partial<GuardialConfig>): GuardialConfig {
  const isNode = typeof process !== 'undefined' && process.env;
  return {
    apiKey: config?.apiKey || (isNode ? process.env.GUARDIAL_API_KEY : '') || '',
    endpoint: config?.endpoint || (isNode ? process.env.GUARDIAL_ENDPOINT : '') || 'https://api.guardial.in',
    customerId: config?.customerId || (isNode ? process.env.GUARDIAL_CUSTOMER_ID : '') || 'default',
    debug: config?.debug !== undefined ? config.debug : (isNode ? process.env.GUARDIAL_DEBUG === 'true' : false),
    timeout: config?.timeout || 30000
  };
}

/**
 * Options for Guardial hooks integration
 */
export interface GuardialHooksOptions {
  /** Guardial configuration */
  config: GuardialConfig;
  /** Paths to exclude from analysis (e.g., ['/_app', '/api/health']) */
  excludePaths?: string[];
  /** Whether to fail-open (allow requests if analysis fails) or fail-closed (block) */
  failOpen?: boolean;
  /** Custom error handler */
  onError?: (error: GuardialError, event: Parameters<Handle>[0]['event']) => void;
  /** Custom block handler */
  onBlocked?: (analysis: Awaited<ReturnType<GuardialClient['analyzeRequestEvent']>>, event: Parameters<Handle>[0]['event']) => void;
}

/**
 * One-liner protect function - auto-configures from environment variables
 * Usage: export const handle = guardial.protect(handle)
 */
export function protect(
  _handle?: Handle,
  config?: Partial<GuardialConfig> | GuardialHooksOptions
): Handle {
  // Support both old API (options object) and new API (config object)
  let options: GuardialHooksOptions;
  
  if (config && 'config' in config) {
    // Old API: GuardialHooksOptions
    options = config as GuardialHooksOptions;
  } else {
    // New API: Auto-configure from env vars
    const envConfig = getConfigFromEnv(config as Partial<GuardialConfig>);
    if (!envConfig.apiKey) {
      throw new Error('Guardial API key is required. Set GUARDIAL_API_KEY environment variable or pass apiKey in config.');
    }
    options = {
      config: envConfig,
      excludePaths: (config as any)?.excludePaths,
      failOpen: (config as any)?.failOpen,
      onError: (config as any)?.onError,
      onBlocked: (config as any)?.onBlocked
    };
  }

  return createGuardialHandle(options);
}

/**
 * Create a SvelteKit handle function that protects routes with Guardial
 */
export function createGuardialHandle(options: GuardialHooksOptions): Handle {
  const {
    config,
    excludePaths = ['/_app', '/_build', '/favicon.ico', '/api/health'],
    failOpen = true,
    onError,
    onBlocked
  } = options;

  const guardial = new GuardialClient(config);

  return async ({ event, resolve }) => {
    // Skip analysis for excluded paths
    const shouldExclude = excludePaths.some(path => 
      event.url.pathname.startsWith(path)
    );

    if (shouldExclude) {
      return resolve(event);
    }

    try {
      // Analyze request
      const analysis = await guardial.analyzeRequestEvent(event);

      if (!analysis.allowed) {
        // Call custom block handler if provided
        if (onBlocked) {
          onBlocked(analysis, event);
        } else {
          // Default logging
          console.warn(
            `🚫 Guardial blocked request: ${event.request.method} ${event.url.pathname}`,
            {
              riskScore: analysis.riskScore,
              reasons: analysis.riskReasons,
              eventId: analysis.eventId
            }
          );
        }

        // Throw SvelteKit error
        throw error(403, 'Request blocked by security policy');
      }

      // Store analysis in event locals for use in routes
      event.locals.guardial = {
        analysis,
        riskScore: analysis.riskScore,
        eventId: analysis.eventId
      };

      // Log high-risk requests
      if (analysis.riskScore > 50 && config.debug) {
        console.info(
          `⚠️ High-risk request detected: ${event.request.method} ${event.url.pathname}`,
          {
            riskScore: analysis.riskScore,
            reasons: analysis.riskReasons
          }
        );
      }

    } catch (err) {
      // Handle Guardial errors
      if (err instanceof GuardialError) {
        if (onError) {
          onError(err, event);
        } else {
          console.error('Guardial analysis failed:', err);
        }

        // Fail-open: allow request if analysis fails (default)
        // Fail-closed: block request if configured
        if (!failOpen) {
          throw error(500, 'Security analysis failed');
        }
        // Continue with request (fail-open)
      } else if (err && typeof err === 'object' && 'status' in err) {
        // Re-throw SvelteKit errors (like the 403 from above)
        throw err;
      } else {
        // Unknown error - fail-open by default
        console.error('Unknown error in Guardial hooks:', err);
      }
    }

    return resolve(event);
  };
}

/**
 * Type augmentation for SvelteKit event locals
 * Add this to your app.d.ts or a types file
 */
declare global {
  namespace App {
    interface Locals {
      guardial?: {
        analysis: import('./index').SecurityEventResponse;
        riskScore: number;
        eventId: string;
      };
    }
  }
}

export {};

