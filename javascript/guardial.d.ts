/**
 * Guardial JavaScript SDK TypeScript Definitions
 */

export interface GuardialConfig {
  apiKey: string;
  endpoint?: string;
  customerId?: string;
  debug?: boolean;
}

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

export interface SecurityEventResponse {
  eventId: string;
  riskScore: number;
  riskReasons: string[];
  action: string;
  allowed: boolean;
  owaspDetected: OwaspDetection[];
  processingTime: string;
}

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

export interface LLMGuardRequest {
  input: string;
  context?: Record<string, string>;
}

export interface LLMDetection {
  ruleId: string;
  title: string;
  severity: string;
  patternMatched: string;
  evidence: string;
  recommendation: string;
}

export interface LLMGuardResponse {
  allowed: boolean;
  action: string;
  reasons: string[];
  detections: LLMDetection[];
  processingTime: string;
}

export declare class GuardialSDK {
  constructor(config?: GuardialConfig);
  
  /**
   * Analyze an LLM prompt for injection and policy violations
   */
  promptGuard(input: string, context?: Record<string, string>): Promise<LLMGuardResponse>;
  
  /**
   * Wrap fetch requests for automatic security analysis
   */
  secureFetch(url: string, options?: RequestInit): Promise<Response>;
  
  /**
   * Get client IP (simplified)
   */
  getClientIP(): Promise<string>;
  
  /**
   * Check if request has auth headers
   */
  hasAuthHeaders(headers: Record<string, string>): boolean;
  
  /**
   * Generate session ID
   */
  generateSessionId(): string;
  
  /**
   * Log messages (if debug enabled)
   */
  log(...args: any[]): void;
}

export default GuardialSDK;
