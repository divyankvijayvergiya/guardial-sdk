/**
 * Guardial TypeScript SDK v0.1.0 - Phase 1
 * OWASP Top 10 Detection & LLM Prompt Firewall for SvelteKit
 * 
 * Phase 1 Features:
 * - Security analysis for HTTP requests
 * - PromptGuard for LLM prompt injection detection
 * - SvelteKit SSR support
 * - TypeScript-first with full type safety
 * - Free Forever plan support (100K requests/month)
 */

import type { RequestEvent } from '@sveltejs/kit';

/**
 * Configuration for Guardial SDK
 */
export interface GuardialConfig {
  apiKey: string;
  endpoint?: string;
  customerId?: string;
  debug?: boolean;
  timeout?: number;
}

/**
 * Request model for security event analysis
 */
export interface SecurityEventRequest {
  method: string;
  path: string;
  sourceIP: string;
  userAgent?: string;
  headers?: Record<string, string>;
  queryParams?: string;
  requestBody?: string;
  customerId?: string;
  hasAuth?: boolean;
  countryCode?: string;
  sessionId?: string;
}

/**
 * Response model for security event analysis
 */
export interface SecurityEventResponse {
  eventId: string;
  riskScore: number;
  riskReasons: string[];
  action: 'allowed' | 'blocked' | 'monitored';
  allowed: boolean;
  owaspDetected: OwaspDetection[];
  processingTime: string;
}

/**
 * OWASP vulnerability detection model
 */
export interface OwaspDetection {
  id: number;
  securityEventId: number;
  organizationId: number;
  owaspCategory: string;
  owaspTitle: string;
  severity: string;
  patternMatched: string;
  evidence: string;
  recommendation: string;
  foundIn: string;
  createdAt: string;
}

/**
 * Request model for LLM prompt analysis
 */
export interface LLMGuardRequest {
  input: string;
  context?: Record<string, string>;
}

/**
 * LLM prompt violation detection model
 */
export interface LLMDetection {
  ruleId: string;
  title: string;
  severity: string;
  patternMatched: string;
  evidence: string;
  recommendation: string;
}

/**
 * Response model for LLM prompt analysis
 */
export interface LLMGuardResponse {
  allowed: boolean;
  action: string;
  reasons: string[];
  detections: LLMDetection[];
  processingTime: string;
}

/**
 * Custom error class for Guardial SDK
 */
export class GuardialError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'GuardialError';
  }
}

/**
 * Guardial SDK Client
 */
export class GuardialClient {
  private config: Required<GuardialConfig>;
  private sessionId: string;

  constructor(config: GuardialConfig) {
    // Auto-detect from environment variables if not provided
    const isNode = typeof process !== 'undefined' && process.env;
    const apiKey = config.apiKey || (isNode ? process.env.GUARDIAL_API_KEY : '') || '';
    const endpoint = config.endpoint || (isNode ? process.env.GUARDIAL_ENDPOINT : '') || 'https://api.guardial.in';
    const customerId = config.customerId || (isNode ? process.env.GUARDIAL_CUSTOMER_ID : '') || 'default';
    const debug = config.debug !== undefined ? config.debug : (isNode ? process.env.GUARDIAL_DEBUG === 'true' : false);
    
    if (!apiKey) {
      throw new Error('Guardial API key is required. Set GUARDIAL_API_KEY environment variable or pass apiKey in config.');
    }

    this.config = {
      endpoint,
      customerId,
      debug,
      timeout: config.timeout || 30000,
      apiKey
    };

    this.sessionId = this.generateSessionId();

    if (this.config.debug) {
      console.log('[Guardial SDK] Initialized - Session:', this.sessionId);
    }
  }

  /**
   * Analyze a SvelteKit RequestEvent for security threats
   * Works in hooks.server.ts and API routes
   */
  async analyzeRequestEvent(event: RequestEvent): Promise<SecurityEventResponse> {
    const request = event.request;
    const url = new URL(request.url);

    const securityEvent: SecurityEventRequest = {
      method: request.method,
      path: url.pathname,
      sourceIP: this.getClientIP(event),
      userAgent: request.headers.get('user-agent') || undefined,
      headers: this.extractHeaders(request.headers),
      queryParams: url.search,
      requestBody: await this.getRequestBody(request),
      customerId: this.config.customerId,
      hasAuth: this.hasAuthHeaders(request.headers),
      sessionId: this.sessionId
    };

    return this.analyzeEvent(securityEvent);
  }

  /**
   * Transform camelCase to snake_case for API compatibility
   */
  private transformToSnakeCase(event: SecurityEventRequest): Record<string, unknown> {
    return {
      method: event.method,
      path: event.path,
      source_ip: event.sourceIP, // Transform to snake_case
      user_agent: event.userAgent,
      headers: event.headers,
      query_params: event.queryParams,
      request_body: event.requestBody,
      customer_id: event.customerId || this.config.customerId,
      has_auth: event.hasAuth,
      country_code: event.countryCode,
      session_id: event.sessionId || this.sessionId
    };
  }

  /**
   * Analyze a security event
   */
  async analyzeEvent(event: SecurityEventRequest): Promise<SecurityEventResponse> {
    // Set defaults
    if (!event.customerId) {
      event.customerId = this.config.customerId;
    }
    if (!event.sessionId) {
      event.sessionId = this.sessionId;
    }

    // Ensure sourceIP is always set
    if (!event.sourceIP || event.sourceIP.trim() === '' || event.sourceIP === 'unknown') {
      event.sourceIP = '127.0.0.1'; // Fallback to localhost
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      // Transform to snake_case for backend API
      const apiPayload = this.transformToSnakeCase(event);

      const response = await fetch(`${this.config.endpoint}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey
        },
        body: JSON.stringify(apiPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new GuardialError(
          `API error: ${response.status} - ${errorText}`,
          response.status
        );
      }

      const result: SecurityEventResponse = await response.json();

      if (this.config.debug) {
        console.log('[Guardial SDK] Security analysis completed:', result);
      }

      return result;
    } catch (error) {
      if (error instanceof GuardialError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new GuardialError('Request timeout', 408);
      }

      throw new GuardialError(
        `Failed to analyze request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        error
      );
    }
  }

  /**
   * Analyze an LLM prompt for injection and policy violations
   */
  async promptGuard(
    input: string,
    context?: Record<string, string>
  ): Promise<LLMGuardResponse> {
    const request: LLMGuardRequest = {
      input,
      context: context || {}
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      // LLM guard API uses camelCase, so no transformation needed
      const response = await fetch(`${this.config.endpoint}/api/llm/guard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey
        },
        body: JSON.stringify(request),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new GuardialError(
          `LLM Guard API error: ${response.status} - ${errorText}`,
          response.status
        );
      }

      const result: LLMGuardResponse = await response.json();

      if (this.config.debug) {
        console.log('[Guardial SDK] LLM Guard analysis:', result);
      }

      return result;
    } catch (error) {
      if (error instanceof GuardialError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        // Default to blocking on timeout for safety
        return {
          allowed: false,
          action: 'error',
          reasons: ['LLM Guard service timeout'],
          detections: [],
          processingTime: 'N/A'
        };
      }

      // Default to blocking on error for safety
      return {
        allowed: false,
        action: 'error',
        reasons: ['LLM Guard service unavailable or error'],
        detections: [],
        processingTime: 'N/A'
      };
    }
  }

  /**
   * Check the health of the Guardial service
   */
  async healthCheck(): Promise<Record<string, unknown>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(`${this.config.endpoint}/health`, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new GuardialError(`Health check failed: ${response.status}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof GuardialError) {
        throw error;
      }

      throw new GuardialError(
        `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }
  }

  /**
   * Get the current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get the configuration
   */
  getConfig(): Readonly<Required<GuardialConfig>> {
    return { ...this.config };
  }

  /**
   * Test the SDK connection and configuration
   */
  async test(): Promise<{
    success: boolean;
    endpoint: string;
    customerId: string;
    health?: Record<string, unknown>;
    error?: string;
  }> {
    try {
      const health = await this.healthCheck();
      if (this.config.debug) {
        console.log('[Guardial SDK] ✅ Test successful:', health);
      }
      return {
        success: true,
        endpoint: this.config.endpoint,
        customerId: this.config.customerId,
        health
      };
    } catch (error) {
      if (this.config.debug) {
        console.error('[Guardial SDK] ❌ Test failed:', error);
      }
      return {
        success: false,
        endpoint: this.config.endpoint,
        customerId: this.config.customerId,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Private helper methods

  private getClientIP(event: RequestEvent): string {
    try {
      // Try SvelteKit's getClientAddress() first
      const ip = event.getClientAddress();
      if (ip && ip.trim() !== '' && ip !== 'unknown') {
        return ip;
      }
    } catch (error) {
      // getClientAddress() might not be available in all contexts
      if (this.config.debug) {
        console.warn('[Guardial SDK] getClientAddress() failed:', error);
      }
    }

    // Try to get from headers (common in production with reverse proxies)
    const forwardedFor = event.request.headers.get('x-forwarded-for');
    if (forwardedFor) {
      // X-Forwarded-For can contain multiple IPs, take the first one
      const firstIP = forwardedFor.split(',')[0].trim();
      if (firstIP && firstIP !== '') {
        return firstIP;
      }
    }

    const realIP = event.request.headers.get('x-real-ip');
    if (realIP && realIP.trim() !== '') {
      return realIP;
    }

    const clientIP = event.request.headers.get('cf-connecting-ip'); // Cloudflare
    if (clientIP && clientIP.trim() !== '') {
      return clientIP;
    }

    const trueClientIP = event.request.headers.get('true-client-ip'); // Cloudflare Enterprise
    if (trueClientIP && trueClientIP.trim() !== '') {
      return trueClientIP;
    }

    // Fallback: use localhost for development
    // The backend requires a valid IP format, so we use 127.0.0.1 instead of 'unknown'
    if (this.config.debug) {
      console.warn('[Guardial SDK] Could not determine client IP, using fallback: 127.0.0.1');
    }
    return '127.0.0.1';
  }

  private async getRequestBody(request: Request): Promise<string> {
    try {
      // Clone request to avoid consuming the body
      const clone = request.clone();
      const text = await clone.text();
      return text;
    } catch {
      return '';
    }
  }

  private extractHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  private hasAuthHeaders(headers: Headers): boolean {
    const authHeaders = ['authorization', 'x-api-key', 'x-auth-token'];
    return authHeaders.some(header => headers.has(header));
  }

  private generateSessionId(): string {
    // Use crypto.randomUUID() if available (Node.js 19+), otherwise fallback
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `session_${Date.now()}_${crypto.randomUUID().substring(0, 9)}`;
    }
    // Fallback for older environments
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}

// Default export
export default GuardialClient;

