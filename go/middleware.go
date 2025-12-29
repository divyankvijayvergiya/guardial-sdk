/**
 * Guardial Go SDK Middleware
 * One-liner middleware for Gin, Echo, Chi, and standard net/http
 */

package guardial

import (
	"bytes"
	"io"
	"net/http"
	"strings"
)

// MiddlewareOptions configures the middleware behavior
type MiddlewareOptions struct {
	ExcludePaths []string
	FailOpen     bool // If true, allow requests on analysis failure
}

// DefaultMiddlewareOptions returns default middleware options
func DefaultMiddlewareOptions() *MiddlewareOptions {
	return &MiddlewareOptions{
		ExcludePaths: []string{"/health", "/favicon.ico"},
		FailOpen:     true,
	}
}

// GinMiddleware returns a Gin middleware handler
// Usage: router.Use(guardial.GinMiddleware(client))
func GinMiddleware(client *Client, options *MiddlewareOptions) func(http.ResponseWriter, *http.Request, func()) {
	if options == nil {
		options = DefaultMiddlewareOptions()
	}

	return func(w http.ResponseWriter, r *http.Request, next func()) {
		// Check if path should be excluded
		for _, excludePath := range options.ExcludePaths {
			if strings.HasPrefix(r.URL.Path, excludePath) {
				next()
				return
			}
		}

		// Capture request body
		var bodyBytes []byte
		if r.Body != nil {
			bodyBytes, _ = io.ReadAll(r.Body)
			r.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
		}

		// Prepare security event
		event := &SecurityEventRequest{
			Method:      r.Method,
			Path:        r.URL.Path,
			SourceIP:    client.getClientIP(r),
			UserAgent:   r.UserAgent(),
			Headers:     client.extractHeaders(r.Header),
			QueryParams: r.URL.RawQuery,
			RequestBody: string(bodyBytes),
			CustomerID:  client.config.CustomerID,
			HasAuth:     client.hasAuthHeaders(r.Header),
			SessionID:   client.sessionID,
		}

		// Analyze request
		analysis, err := client.AnalyzeEvent(event)
		if err != nil {
			client.log("Guardial analysis failed:", err)
			if options.FailOpen {
				next()
				return
			}
			http.Error(w, "Security analysis failed", http.StatusInternalServerError)
			return
		}

		if !analysis.Allowed {
			client.log("🚫 Request blocked:", r.Method, r.URL.Path, analysis.RiskReasons)
			if options.FailOpen {
				// Store in request context for logging
				r.Header.Set("X-Guardial-Blocked", "true")
				r.Header.Set("X-Guardial-Risk-Score", string(rune(analysis.RiskScore)))
				next()
				return
			}
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusForbidden)
			w.Write([]byte(`{"error":"Request blocked by security policy"}`))
			return
		}

		// Store analysis in request header for downstream handlers
		r.Header.Set("X-Guardial-Risk-Score", string(rune(analysis.RiskScore)))
		r.Header.Set("X-Guardial-Event-ID", analysis.EventID)

		next()
	}
}

// StandardMiddleware returns a standard net/http middleware
// Usage: http.Handle("/", guardial.StandardMiddleware(client)(yourHandler))
func StandardMiddleware(client *Client, options *MiddlewareOptions) func(http.Handler) http.Handler {
	if options == nil {
		options = DefaultMiddlewareOptions()
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Check if path should be excluded
			for _, excludePath := range options.ExcludePaths {
				if strings.HasPrefix(r.URL.Path, excludePath) {
					next.ServeHTTP(w, r)
					return
				}
			}

			// Capture request body
			var bodyBytes []byte
			if r.Body != nil {
				bodyBytes, _ = io.ReadAll(r.Body)
				r.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
			}

			// Prepare security event
			event := &SecurityEventRequest{
				Method:      r.Method,
				Path:        r.URL.Path,
				SourceIP:    client.getClientIP(r),
				UserAgent:   r.UserAgent(),
				Headers:     client.extractHeaders(r.Header),
				QueryParams: r.URL.RawQuery,
				RequestBody: string(bodyBytes),
				CustomerID:  client.config.CustomerID,
				HasAuth:     client.hasAuthHeaders(r.Header),
				SessionID:   client.sessionID,
			}

			// Analyze request
			analysis, err := client.AnalyzeEvent(event)
			if err != nil {
				client.log("Guardial analysis failed:", err)
				if options.FailOpen {
					next.ServeHTTP(w, r)
					return
				}
				http.Error(w, "Security analysis failed", http.StatusInternalServerError)
				return
			}

			if !analysis.Allowed {
				client.log("🚫 Request blocked:", r.Method, r.URL.Path, analysis.RiskReasons)
				if options.FailOpen {
					r.Header.Set("X-Guardial-Blocked", "true")
					r.Header.Set("X-Guardial-Risk-Score", string(rune(analysis.RiskScore)))
					next.ServeHTTP(w, r)
					return
				}
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusForbidden)
				w.Write([]byte(`{"error":"Request blocked by security policy"}`))
				return
			}

			// Store analysis in request header
			r.Header.Set("X-Guardial-Risk-Score", string(rune(analysis.RiskScore)))
			r.Header.Set("X-Guardial-Event-ID", analysis.EventID)

			next.ServeHTTP(w, r)
		})
	}
}

// Middleware creates middleware from environment variables
// Usage: router.Use(guardial.Middleware())
func Middleware(options *MiddlewareOptions) (func(http.ResponseWriter, *http.Request, func()), error) {
	client, err := NewClientFromEnv()
	if err != nil {
		return nil, err
	}
	return GinMiddleware(client, options), nil
}



