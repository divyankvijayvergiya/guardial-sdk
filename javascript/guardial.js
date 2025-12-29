/**
 * Guardial JavaScript SDK v0.1.0 - Phase 1
 * OWASP Top 10 Detection & LLM Prompt Firewall
 * 
 * Phase 1 Features:
 * - secureFetch() wrapper for automatic security analysis
 * - promptGuard() for LLM prompt injection detection
 * - Simple async processing
 * - Free Forever plan support (100K requests/month)
 */

class GuardialSDK {
    constructor(config = {}) {
        this.config = {
            apiKey: config.apiKey || '',
            endpoint: config.endpoint || 'https://api.guardial.com',
            customerId: config.customerId || 'default',
            debug: config.debug || false,
            ...config
        };

        this.sessionId = this.generateSessionId();
        this.log('Guardial SDK initialized for Phase 1');
    }

    /**
     * Analyze an LLM prompt for injection and policy violations
     */
    async promptGuard(input, context = {}) {
        try {
            const response = await fetch(`${this.config.endpoint}/api/llm/guard`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.config.apiKey
                },
                body: JSON.stringify({ input, context })
            });

            if (!response.ok) {
                throw new Error(`LLM Guard API error: ${response.status}`);
            }

            const result = await response.json();
            this.log('LLM Guard analysis:', result);
            return result;

        } catch (error) {
            this.log('LLM Guard failed:', error);
            return {
                allowed: true, // Default to allowed on error
                action: "error",
                reasons: ["LLM Guard service unavailable or error"],
                detections: [],
                processingTime: "N/A"
            };
        }
    }

    /**
     * Wrap fetch requests for automatic security analysis
     */
    async secureFetch(url, options = {}) {
        const startTime = Date.now();
        
        try {
            // Collect request data
            const requestData = {
                method: options.method || 'GET',
                path: new URL(url).pathname,
                sourceIP: await this.getClientIP(),
                userAgent: navigator.userAgent,
                headers: options.headers || {},
                queryParams: new URL(url).search,
                requestBody: options.body || '',
                customerId: this.config.customerId,
                hasAuth: this.hasAuthHeaders(options.headers),
                sessionId: this.sessionId
            };

            // Send to Guardial for analysis
            const analysisResponse = await fetch(`${this.config.endpoint}/api/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.config.apiKey
                },
                body: JSON.stringify(requestData)
            });

            if (analysisResponse.ok) {
                const analysis = await analysisResponse.json();
                this.log('Security analysis:', analysis);
                
                // Check if request should be blocked
                if (!analysis.allowed) {
                    throw new Error(`Request blocked by Guardial: ${analysis.reasons?.join(', ')}`);
                }
            }

            // Make the actual request
            const response = await fetch(url, options);
            
            // Log response time
            const responseTime = Date.now() - startTime;
            this.log(`Request completed in ${responseTime}ms`);

            return response;

        } catch (error) {
            this.log('Request failed:', error);
            throw error;
        }
    }

    /**
     * Get client IP (simplified)
     */
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }

    /**
     * Check if request has auth headers
     */
    hasAuthHeaders(headers) {
        if (!headers) return false;
        
        const authHeaders = ['authorization', 'x-api-key', 'x-auth-token'];
        return authHeaders.some(header => 
            Object.keys(headers).some(key => 
                key.toLowerCase() === header
            )
        );
    }

    /**
     * Generate session ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Log messages (if debug enabled)
     */
    log(...args) {
        if (this.config.debug) {
            console.log('[Guardial SDK]', ...args);
        }
    }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GuardialSDK;
} else if (typeof define === 'function' && define.amd) {
    define([], function() { return GuardialSDK; });
} else if (typeof window !== 'undefined') {
    window.GuardialSDK = GuardialSDK;
}
