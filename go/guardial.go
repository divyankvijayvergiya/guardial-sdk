/**
 * Guardial Go SDK v0.2.0 - One-Liner Integration
 * OWASP Top 10 Detection & LLM Prompt Firewall
 *
 * Features:
 * - One-liner middleware: guardial.Middleware() for Gin/Echo
 * - SecureHTTPClient wrapper for automatic security analysis
 * - PromptGuard for LLM prompt injection detection
 * - Auto-configuration from environment variables
 * - Free Forever plan support (100K requests/month)
 */

package guardial

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"strings"
	"time"
)

// Config holds the Guardial SDK configuration
type Config struct {
	APIKey     string        `json:"api_key"`
	Endpoint   string        `json:"endpoint"`
	CustomerID string        `json:"customer_id"`
	Debug      bool          `json:"debug"`
	Timeout    time.Duration `json:"timeout"`
}

// DefaultConfig returns a default configuration
func DefaultConfig() *Config {
	return &Config{
		Endpoint:   "https://api.guardial.in",
		CustomerID: "default",
		Debug:      false,
		Timeout:    30 * time.Second,
	}
}

// ConfigFromEnv creates configuration from environment variables
// Environment variables: GUARDIAL_API_KEY, GUARDIAL_ENDPOINT, GUARDIAL_CUSTOMER_ID, GUARDIAL_DEBUG
func ConfigFromEnv() *Config {
	config := DefaultConfig()
	
	if apiKey := os.Getenv("GUARDIAL_API_KEY"); apiKey != "" {
		config.APIKey = apiKey
	}
	if endpoint := os.Getenv("GUARDIAL_ENDPOINT"); endpoint != "" {
		config.Endpoint = endpoint
	}
	if customerID := os.Getenv("GUARDIAL_CUSTOMER_ID"); customerID != "" {
		config.CustomerID = customerID
	}
	if debug := os.Getenv("GUARDIAL_DEBUG"); debug == "true" {
		config.Debug = true
	}
	
	return config
}

// NewClientFromEnv creates a new client from environment variables
func NewClientFromEnv() (*Client, error) {
	config := ConfigFromEnv()
	if config.APIKey == "" {
		return nil, fmt.Errorf("GUARDIAL_API_KEY environment variable is required")
	}
	return NewClient(config), nil
}

// SecurityEventRequest represents a request to be analyzed
type SecurityEventRequest struct {
	Method      string            `json:"method"`
	Path        string            `json:"path"`
	SourceIP    string            `json:"source_ip"`
	UserAgent   string            `json:"user_agent"`
	Headers     map[string]string `json:"headers"`
	QueryParams string            `json:"query_params"`
	RequestBody string            `json:"request_body"`
	CustomerID  string            `json:"customer_id"`
	HasAuth     bool              `json:"has_auth"`
	CountryCode string            `json:"country_code"`
	SessionID   string            `json:"session_id"`
}

// SecurityEventResponse represents the response from security analysis
type SecurityEventResponse struct {
	EventID        string           `json:"event_id"`
	RiskScore      int              `json:"risk_score"`
	RiskReasons    []string         `json:"risk_reasons"`
	Action         string           `json:"action"`
	Allowed        bool             `json:"allowed"`
	OwaspDetected  []OwaspDetection `json:"owasp_detected"`
	ProcessingTime string           `json:"processing_time_ms"`
}

// OwaspDetection represents an OWASP vulnerability detection
type OwaspDetection struct {
	ID              uint   `json:"id"`
	SecurityEventID uint   `json:"security_event_id"`
	OrganizationID  uint   `json:"organization_id"`
	OwaspCategory   string `json:"owasp_category"`
	OwaspTitle      string `json:"owasp_title"`
	Severity        string `json:"severity"`
	PatternMatched  string `json:"pattern_matched"`
	Evidence        string `json:"evidence"`
	Recommendation  string `json:"recommendation"`
	FoundIn         string `json:"found_in"`
	CreatedAt       string `json:"created_at"`
}

// LLMGuardRequest represents a request to analyze an LLM prompt
type LLMGuardRequest struct {
	Input   string            `json:"input"`
	Context map[string]string `json:"context,omitempty"`
}

// LLMDetection represents an LLM prompt violation detection
type LLMDetection struct {
	RuleID         string `json:"rule_id"`
	Title          string `json:"title"`
	Severity       string `json:"severity"`
	PatternMatched string `json:"pattern_matched"`
	Evidence       string `json:"evidence"`
	Recommendation string `json:"recommendation"`
}

// LLMGuardResponse represents the response from LLM prompt analysis
type LLMGuardResponse struct {
	Allowed        bool           `json:"allowed"`
	Action         string         `json:"action"`
	Reasons        []string       `json:"reasons"`
	Detections     []LLMDetection `json:"detections"`
	ProcessingTime string         `json:"processing_time_ms"`
}

// Client represents the Guardial SDK client
type Client struct {
	config     *Config
	httpClient *http.Client
	sessionID  string
}

// NewClient creates a new Guardial client
func NewClient(config *Config) *Client {
	if config == nil {
		config = DefaultConfig()
	}

	// Generate session ID
	sessionID := fmt.Sprintf("session_%d_%s", time.Now().Unix(), generateRandomString(9))

	return &Client{
		config: config,
		httpClient: &http.Client{
			Timeout: config.Timeout,
		},
		sessionID: sessionID,
	}
}

// SecureHTTPClient wraps the standard http.Client with security analysis
func (c *Client) SecureHTTPClient() *http.Client {
	return &http.Client{
		Timeout: c.config.Timeout,
		Transport: &SecurityTransport{
			client: c,
			base:   http.DefaultTransport,
		},
	}
}

// SecurityTransport implements http.RoundTripper for security analysis
type SecurityTransport struct {
	client *Client
	base   http.RoundTripper
}

// RoundTrip implements http.RoundTripper
func (t *SecurityTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	// Analyze the request before making it
	analysis, err := t.client.AnalyzeRequest(req)
	if err != nil {
		t.client.log("Security analysis failed:", err)
		// Continue with request even if analysis fails
	} else if !analysis.Allowed {
		// Block the request if security analysis says so
		return nil, fmt.Errorf("request blocked by Guardial: %s", strings.Join(analysis.RiskReasons, ", "))
	}

	// Make the actual request
	resp, err := t.base.RoundTrip(req)
	if err != nil {
		return resp, err
	}

	// Log response time
	t.client.log(fmt.Sprintf("Request to %s completed with status %d", req.URL.String(), resp.StatusCode))

	return resp, nil
}

// AnalyzeRequest analyzes an HTTP request for security threats
func (c *Client) AnalyzeRequest(req *http.Request) (*SecurityEventResponse, error) {
	// Extract request data
	requestData := SecurityEventRequest{
		Method:      req.Method,
		Path:        req.URL.Path,
		SourceIP:    c.getClientIP(req),
		UserAgent:   req.UserAgent(),
		Headers:     c.extractHeaders(req.Header),
		QueryParams: req.URL.RawQuery,
		RequestBody: c.extractRequestBody(req),
		CustomerID:  c.config.CustomerID,
		HasAuth:     c.hasAuthHeaders(req.Header),
		SessionID:   c.sessionID,
	}

	return c.AnalyzeEvent(&requestData)
}

// AnalyzeEvent analyzes a security event
func (c *Client) AnalyzeEvent(event *SecurityEventRequest) (*SecurityEventResponse, error) {
	// Set customer ID if not provided
	if event.CustomerID == "" {
		event.CustomerID = c.config.CustomerID
	}

	// Marshal request
	jsonData, err := json.Marshal(event)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	// Create HTTP request
	req, err := http.NewRequest("POST", c.config.Endpoint+"/api/events", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", c.config.APIKey)

	// Make request
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	// Read response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	// Check status code
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API error: %d - %s", resp.StatusCode, string(body))
	}

	// Parse response
	var analysis SecurityEventResponse
	if err := json.Unmarshal(body, &analysis); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	c.log("Security analysis completed:", analysis)
	return &analysis, nil
}

// PromptGuard analyzes an LLM prompt for injection and policy violations
func (c *Client) PromptGuard(input string, context map[string]string) (*LLMGuardResponse, error) {
	request := LLMGuardRequest{
		Input:   input,
		Context: context,
	}

	// Marshal request
	jsonData, err := json.Marshal(request)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	// Create HTTP request
	req, err := http.NewRequest("POST", c.config.Endpoint+"/api/llm/guard", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", c.config.APIKey)

	// Make request
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	// Read response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	// Check status code
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API error: %d - %s", resp.StatusCode, string(body))
	}

	// Parse response
	var result LLMGuardResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	c.log("LLM Guard analysis:", result)
	return &result, nil
}

// HealthCheck checks the health of the Guardial service
func (c *Client) HealthCheck(ctx context.Context) (map[string]interface{}, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", c.config.Endpoint+"/health", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	return result, nil
}

// Test tests the SDK connection and configuration
func (c *Client) Test(ctx context.Context) (map[string]interface{}, error) {
	health, err := c.HealthCheck(ctx)
	if err != nil {
		return map[string]interface{}{
			"success":   false,
			"endpoint":  c.config.Endpoint,
			"customerId": c.config.CustomerID,
			"error":     err.Error(),
		}, nil
	}

	return map[string]interface{}{
		"success":    true,
		"endpoint":   c.config.Endpoint,
		"customerId": c.config.CustomerID,
		"health":     health,
	}, nil
}

// Helper methods

func (c *Client) getClientIP(req *http.Request) string {
	// Try to get real IP from headers
	if ip := req.Header.Get("X-Forwarded-For"); ip != "" {
		return strings.Split(ip, ",")[0]
	}
	if ip := req.Header.Get("X-Real-IP"); ip != "" {
		return ip
	}
	if ip := req.Header.Get("X-Client-IP"); ip != "" {
		return ip
	}

	// Fallback to remote address
	if req.RemoteAddr != "" {
		host, _, err := net.SplitHostPort(req.RemoteAddr)
		if err == nil {
			return host
		}
		return req.RemoteAddr
	}

	return "unknown"
}

func (c *Client) extractHeaders(headers http.Header) map[string]string {
	result := make(map[string]string)
	for key, values := range headers {
		if len(values) > 0 {
			result[key] = values[0]
		}
	}
	return result
}

func (c *Client) extractRequestBody(req *http.Request) string {
	if req.Body == nil {
		return ""
	}

	// Read body
	body, err := io.ReadAll(req.Body)
	if err != nil {
		return ""
	}

	// Restore body for the actual request
	req.Body = io.NopCloser(bytes.NewBuffer(body))

	return string(body)
}

func (c *Client) hasAuthHeaders(headers http.Header) bool {
	authHeaders := []string{"authorization", "x-api-key", "x-auth-token"}
	for _, header := range authHeaders {
		if headers.Get(header) != "" {
			return true
		}
	}
	return false
}

func (c *Client) log(args ...interface{}) {
	if c.config.Debug {
		fmt.Println("[Guardial SDK]", fmt.Sprint(args...))
	}
}

func generateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
	}
	return string(b)
}
