/**
 * Guardial React SDK v0.1.0 - One-Liner Integration
 * OWASP Top 10 Detection & LLM Prompt Firewall for React
 * 
 * Features:
 * - One-liner Provider: <GuardialProvider>
 * - Auto-configuration from environment variables
 * - Secure fetch wrapper
 * - Prompt guard hooks
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface GuardialConfig {
  apiKey?: string;
  endpoint?: string;
  customerId?: string;
  debug?: boolean;
}

interface GuardialContextValue {
  config: Required<GuardialConfig>;
  test: () => Promise<{ success: boolean; error?: string }>;
  secureFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  promptGuard: (input: string, context?: Record<string, string>) => Promise<any>;
}

const GuardialContext = createContext<GuardialContextValue | null>(null);

// Get config from environment variables
// React apps use build-time env vars (REACT_APP_*) that are replaced during bundling
function getConfigFromEnv(config?: GuardialConfig): Required<GuardialConfig> {
  // Type-safe access to environment variables
  // In React apps, env vars are replaced at build time, so we use a type assertion
  const getEnvVar = (key: string): string => {
    // Check if we're in a Node.js environment (SSR)
    if (typeof process !== 'undefined' && process.env) {
      return (process.env as Record<string, string | undefined>)[key] || '';
    }
    // In browser, React env vars are replaced at build time
    // We use a type-safe access pattern
    return '';
  };
  
  return {
    apiKey: config?.apiKey || getEnvVar('REACT_APP_GUARDIAL_API_KEY') || '',
    endpoint: config?.endpoint || getEnvVar('REACT_APP_GUARDIAL_ENDPOINT') || 'https://api.guardial.com',
    customerId: config?.customerId || getEnvVar('REACT_APP_GUARDIAL_CUSTOMER_ID') || 'default',
    debug: config?.debug !== undefined ? config.debug : (getEnvVar('REACT_APP_GUARDIAL_DEBUG') === 'true')
  };
}

// Secure fetch wrapper - matches fetch API signature
async function secureFetchWrapper(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  config: Required<GuardialConfig>
): Promise<Response> {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  try {
    // Convert input to URL string
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const options = init || {};
    
    // Analyze request
    const urlObj = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'https://example.com');
    const requestData = {
      method: options.method || 'GET',
      path: urlObj.pathname,
      sourceIP: '127.0.0.1', // Client-side, will be determined server-side
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      headers: options.headers || {},
      queryParams: urlObj.search,
      requestBody: options.body?.toString() || '',
      customerId: config.customerId,
      hasAuth: hasAuthHeaders(options.headers),
      sessionId
    };

    // Transform to snake_case for API compatibility
    const apiPayload = {
      method: requestData.method,
      path: requestData.path,
      source_ip: requestData.sourceIP || '127.0.0.1',
      user_agent: requestData.userAgent,
      headers: requestData.headers,
      query_params: requestData.queryParams,
      request_body: requestData.requestBody,
      customer_id: requestData.customerId,
      has_auth: requestData.hasAuth,
      session_id: requestData.sessionId
    };

    const analysisResponse = await fetch(`${config.endpoint}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey
      },
      body: JSON.stringify(apiPayload)
    });

    if (analysisResponse.ok) {
      const analysis = await analysisResponse.json();
      if (!analysis.allowed) {
        throw new Error(`Request blocked: ${analysis.riskReasons?.join(', ')}`);
      }
    }

    return fetch(input, init);
  } catch (error) {
    if (config.debug) {
      console.error('[Guardial SDK] Request blocked:', error);
    }
    throw error;
  }
}

function hasAuthHeaders(headers?: HeadersInit): boolean {
  if (!headers) return false;
  const authHeaders = ['authorization', 'x-api-key', 'x-auth-token'];
  
  if (headers instanceof Headers) {
    return authHeaders.some(h => headers.has(h));
  }
  
  if (Array.isArray(headers)) {
    return headers.some(([key]) => authHeaders.includes(key.toLowerCase()));
  }
  
  return Object.keys(headers).some(key => authHeaders.includes(key.toLowerCase()));
}

interface GuardialProviderProps {
  children: ReactNode;
  config?: GuardialConfig;
}

/**
 * One-liner Provider wrapper
 * Usage: <GuardialProvider>{app}</GuardialProvider>
 */
export function GuardialProvider({ children, config }: GuardialProviderProps) {
  const [sdkConfig] = useState(() => {
    const envConfig = getConfigFromEnv(config);
    if (!envConfig.apiKey) {
      console.warn('[Guardial SDK] API key not found. Set REACT_APP_GUARDIAL_API_KEY environment variable.');
    }
    return envConfig;
  });

  const test = async () => {
    try {
      const response = await fetch(`${sdkConfig.endpoint}/health`);
      if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const secureFetch = (input: RequestInfo | URL, init?: RequestInit) => {
    return secureFetchWrapper(input, init, sdkConfig);
  };

  const promptGuard = async (input: string, context?: Record<string, string>) => {
    try {
      const response = await fetch(`${sdkConfig.endpoint}/api/llm/guard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': sdkConfig.apiKey
        },
        body: JSON.stringify({ input, context: context || {} })
      });
      
      if (!response.ok) {
        throw new Error(`LLM Guard failed: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      if (sdkConfig.debug) {
        console.error('[Guardial SDK] Prompt guard failed:', error);
      }
      return { allowed: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const value: GuardialContextValue = {
    config: sdkConfig,
    test,
    secureFetch,
    promptGuard
  };

  return (
    <GuardialContext.Provider value={value}>
      {children}
    </GuardialContext.Provider>
  );
}

/**
 * Hook to use Guardial SDK
 */
export function useGuardial(): GuardialContextValue {
  const context = useContext(GuardialContext);
  if (!context) {
    throw new Error('useGuardial must be used within GuardialProvider');
  }
  return context;
}

/**
 * Hook for secure fetch
 */
export function useSecureFetch() {
  const { secureFetch } = useGuardial();
  return secureFetch;
}

/**
 * Hook for prompt guard
 */
export function usePromptGuard() {
  const { promptGuard } = useGuardial();
  return promptGuard;
}

export default GuardialProvider;

