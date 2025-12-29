/**
 * Client-side utilities for Guardial SDK
 * 
 * Use these in Svelte components and client-side code
 */

import { browser } from '$app/environment';
import { GuardialClient, GuardialError, type GuardialConfig } from './index';

let client: GuardialClient | null = null;

/**
 * Get or create a Guardial client instance (client-side only)
 */
export function getGuardialClient(config?: GuardialConfig): GuardialClient | null {
  if (!browser) {
    console.warn('[Guardial SDK] Client utilities only work in browser environment');
    return null;
  }

  if (!client && config) {
    client = new GuardialClient(config);
  }

  return client;
}

/**
 * Secure fetch wrapper for client-side requests
 * Analyzes requests before making them
 */
export async function secureFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const client = getGuardialClient();
  
  if (!client) {
    // Fallback to regular fetch if client not initialized
    console.warn('[Guardial SDK] Client not initialized, using regular fetch');
    return fetch(url, options);
  }

  try {
    // Build security event from request
    const fullUrl = url.startsWith('http') ? url : new URL(url, window.location.origin).href;
    const urlObj = new URL(fullUrl);

    const securityEvent = {
      method: options?.method || 'GET',
      path: urlObj.pathname,
      sourceIP: 'client', // Will be determined server-side
      userAgent: navigator.userAgent,
      headers: options?.headers ? (() => {
        const headersObj: Record<string, string> = {};
        const headers = new Headers(options.headers);
        headers.forEach((value, key) => {
          headersObj[key] = value;
        });
        return headersObj;
      })() : {},
      queryParams: urlObj.search,
      requestBody: options?.body?.toString() || '',
      customerId: client.getConfig().customerId,
      hasAuth: hasAuthHeaders(options?.headers),
      sessionId: client.getSessionId()
    };

    // Analyze request
    const analysis = await client.analyzeEvent(securityEvent);

    if (!analysis.allowed) {
      throw new GuardialError(
        `Request blocked: ${analysis.riskReasons.join(', ')}`,
        403,
        analysis
      );
    }

    // Make the actual request
    return fetch(url, options);
  } catch (error) {
    if (error instanceof GuardialError) {
      throw error;
    }
    // Re-throw other errors
    throw error;
  }
}

/**
 * Check if headers contain authentication
 */
function hasAuthHeaders(headers?: HeadersInit): boolean {
  if (!headers) return false;

  const authHeaders = ['authorization', 'x-api-key', 'x-auth-token'];
  
  if (headers instanceof Headers) {
    return authHeaders.some(header => headers.has(header));
  }

  if (Array.isArray(headers)) {
    return headers.some(([key]) => 
      authHeaders.includes(key.toLowerCase())
    );
  }

  // Record<string, string>
  return Object.keys(headers).some(key => 
    authHeaders.includes(key.toLowerCase())
  );
}

/**
 * Analyze an LLM prompt on the client side
 */
export async function analyzePrompt(
  input: string,
  context?: Record<string, string>
): Promise<import('./index').LLMGuardResponse> {
  const client = getGuardialClient();
  
  if (!client) {
    throw new Error('Guardial client not initialized. Call getGuardialClient(config) first.');
  }

  return client.promptGuard(input, context);
}

/**
 * Create a reactive store for Guardial client (Svelte)
 */
export function createGuardialStore(config: GuardialConfig) {
  if (!browser) {
    return {
      subscribe: (fn: (value: GuardialClient | null) => void) => {
        fn(null);
        return () => {};
      }
    };
  }

  const client = new GuardialClient(config);
  
  return {
    subscribe: (fn: (value: GuardialClient) => void) => {
      fn(client);
      return () => {};
    }
  };
}

