/**
 * Guardial JavaScript SDK v0.3.0 - One-Liner Integration
 * OWASP Top 10 Detection & LLM Prompt Firewall
 * 
 * Features:
 * - One-liner Express/Node middleware: guardial.middleware()
 * - secureFetch() wrapper for automatic security analysis
 * - promptGuard() for LLM prompt injection detection
 * - Auto-configuration from environment variables
 * - Free Forever plan support (100K requests/month)
 */

// Auto-detect configuration from environment variables
function getConfigFromEnv(config = {}) {
    const isNode = typeof process !== 'undefined' && process.env;
    return {
        apiKey: config.apiKey || (isNode ? process.env.GUARDIAL_API_KEY : '') || '',
        endpoint: config.endpoint || (isNode ? process.env.GUARDIAL_ENDPOINT : '') || 'https://api.guardial.com',
        customerId: config.customerId || (isNode ? process.env.GUARDIAL_CUSTOMER_ID : '') || 'default',
        debug: config.debug !== undefined ? config.debug : (isNode ? process.env.GUARDIAL_DEBUG === 'true' : false),
        ...config
    };
}

class GuardialSDK {
    constructor(config = {}) {
        const envConfig = getConfigFromEnv(config);
        
        if (!envConfig.apiKey) {
            throw new Error('Guardial API key is required. Set GUARDIAL_API_KEY environment variable or pass apiKey in config.');
        }

        this.config = {
            apiKey: envConfig.apiKey,
            endpoint: envConfig.endpoint,
            customerId: envConfig.customerId,
            debug: envConfig.debug,
            ...config
        };

        this.sessionId = this.generateSessionId();
        this.log('Guardial SDK initialized - Session:', this.sessionId);
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
            // Collect request data (camelCase for internal use)
            const sourceIP = await this.getClientIP();
            const requestData = {
                method: options.method || 'GET',
                path: new URL(url).pathname,
                sourceIP: sourceIP || '127.0.0.1', // Ensure it's never empty
                userAgent: navigator.userAgent,
                headers: options.headers || {},
                queryParams: new URL(url).search,
                requestBody: options.body || '',
                customerId: this.config.customerId,
                hasAuth: this.hasAuthHeaders(options.headers),
                sessionId: this.sessionId
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

            // Send to Guardial for analysis
            const analysisResponse = await fetch(`${this.config.endpoint}/api/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.config.apiKey
                },
                body: JSON.stringify(apiPayload)
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

    /**
     * Test the SDK connection and configuration
     */
    async test() {
        try {
            const response = await fetch(`${this.config.endpoint}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
            
            if (!response.ok) {
                throw new Error(`Health check failed: ${response.status}`);
            }

            const health = await response.json();
            this.log('✅ Guardial SDK test successful:', health);
            
            return {
                success: true,
                endpoint: this.config.endpoint,
                customerId: this.config.customerId,
                health: health
            };
        } catch (error) {
            this.log('❌ Guardial SDK test failed:', error);
            return {
                success: false,
                error: error.message,
                endpoint: this.config.endpoint
            };
        }
    }
}

/**
 * One-liner Express/Node.js middleware
 * Usage: app.use(guardial.middleware())
 */
function createMiddleware(config = {}) {
    const envConfig = getConfigFromEnv(config);
    const sdk = new GuardialSDK(envConfig);
    
    return async (req, res, next) => {
        // Skip analysis for excluded paths
        const excludePaths = config.excludePaths || ['/health', '/favicon.ico', '/_next', '/static'];
        if (excludePaths.some(path => req.path.startsWith(path))) {
            return next();
        }

        try {
            // Extract request data
            let body = '';
            if (req.body) {
                body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
            }

            const sourceIP = req.ip || req.connection.remoteAddress || '127.0.0.1';
            const requestData = {
                method: req.method,
                path: req.path,
                sourceIP: sourceIP,
                userAgent: req.get('user-agent') || '',
                headers: req.headers || {},
                queryParams: req.url.split('?')[1] || '',
                requestBody: body,
                customerId: sdk.config.customerId,
                hasAuth: sdk.hasAuthHeaders(req.headers),
                sessionId: sdk.sessionId
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

            // Analyze request
            const analysisResponse = await fetch(`${sdk.config.endpoint}/api/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': sdk.config.apiKey
                },
                body: JSON.stringify(apiPayload)
            });

            if (analysisResponse.ok) {
                const analysis = await analysisResponse.json();
                
                if (!analysis.allowed) {
                    sdk.log('🚫 Request blocked:', req.method, req.path, analysis.riskReasons);
                    
                    if (config.failOpen !== false) {
                        // Fail-open: log but allow
                        req.guardial = { analysis, blocked: true };
                        return next();
                    } else {
                        // Fail-closed: block request
                        return res.status(403).json({
                            error: 'Request blocked by security policy',
                            details: {
                                riskScore: analysis.riskScore,
                                reasons: analysis.riskReasons,
                                eventId: analysis.eventId
                            }
                        });
                    }
                }

                // Store analysis in request object
                req.guardial = { analysis, riskScore: analysis.riskScore, eventId: analysis.eventId };
            }
        } catch (error) {
            sdk.log('⚠️ Guardial analysis failed:', error);
            if (config.failOpen !== false) {
                // Fail-open: continue on error
                return next();
            } else {
                return res.status(500).json({ error: 'Security analysis failed' });
            }
        }

        next();
    };
}

/**
 * Wrap global fetch for automatic protection
 * Usage: global.fetch = guardial.wrap(fetch)
 */
function wrapFetch(fetchFn, config = {}) {
    const sdk = new GuardialSDK(getConfigFromEnv(config));
    return sdk.secureFetch.bind(sdk);
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GuardialSDK;
    module.exports.middleware = createMiddleware;
    module.exports.wrap = wrapFetch;
    module.exports.getConfigFromEnv = getConfigFromEnv;
} else if (typeof define === 'function' && define.amd) {
    define([], function() { 
        GuardialSDK.middleware = createMiddleware;
        GuardialSDK.wrap = wrapFetch;
        return GuardialSDK; 
    });
} else if (typeof window !== 'undefined') {
    window.GuardialSDK = GuardialSDK;
    window.GuardialSDK.middleware = createMiddleware;
    window.GuardialSDK.wrap = wrapFetch;
}
