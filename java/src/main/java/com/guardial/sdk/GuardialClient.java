/**
 * Guardial Java SDK v0.1.0 - Phase 1
 * OWASP Top 10 Detection & LLM Prompt Firewall
 * 
 * Phase 1 Features:
 * - Security analysis for HTTP requests
 * - PromptGuard for LLM prompt injection detection
 * - Simple async processing support
 * - Free Forever plan support (100K requests/month)
 */

package com.guardial.sdk;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class GuardialClient {
    private static final Logger logger = LoggerFactory.getLogger(GuardialClient.class);
    
    private final GuardialConfig config;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String sessionId;

    /**
     * Create a new Guardial client with default configuration
     */
    public GuardialClient() {
        this(GuardialConfig.defaultConfig());
    }

    /**
     * Create a new Guardial client with custom configuration
     */
    public GuardialClient(GuardialConfig config) {
        this.config = config;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(config.getTimeoutSeconds()))
                .build();
        this.objectMapper = new ObjectMapper();
        this.objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        this.sessionId = generateSessionId();
        
        if (config.isDebug()) {
            logger.info("Guardial SDK initialized for Phase 1 - Session: {}", sessionId);
        }
    }

    /**
     * Analyze an HTTP request for security threats
     */
    public SecurityEventResponse analyzeRequest(SecurityEventRequest request) throws GuardialException {
        // Set customer ID if not provided
        if (request.getCustomerId() == null || request.getCustomerId().isEmpty()) {
            request.setCustomerId(config.getCustomerId());
        }
        
        // Set session ID if not provided
        if (request.getSessionId() == null || request.getSessionId().isEmpty()) {
            request.setSessionId(sessionId);
        }

        try {
            String jsonPayload = objectMapper.writeValueAsString(request);
            
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(config.getEndpoint() + "/api/events"))
                    .header("Content-Type", "application/json")
                    .header("X-API-Key", config.getApiKey())
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .timeout(Duration.ofSeconds(config.getTimeoutSeconds()))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new GuardialException("API error: " + response.statusCode() + " - " + response.body());
            }

            SecurityEventResponse result = objectMapper.readValue(response.body(), SecurityEventResponse.class);
            
            if (config.isDebug()) {
                logger.debug("Security analysis completed: {}", result);
            }
            
            return result;

        } catch (IOException | InterruptedException e) {
            logger.error("Failed to analyze request", e);
            throw new GuardialException("Failed to analyze request: " + e.getMessage(), e);
        }
    }

    /**
     * Analyze a security event
     */
    public SecurityEventResponse analyzeEvent(SecurityEventRequest event) throws GuardialException {
        return analyzeRequest(event);
    }

    /**
     * Analyze an LLM prompt for injection and policy violations
     */
    public LLMGuardResponse promptGuard(String input) throws GuardialException {
        return promptGuard(input, null);
    }

    /**
     * Analyze an LLM prompt with context
     */
    public LLMGuardResponse promptGuard(String input, Map<String, String> context) throws GuardialException {
        LLMGuardRequest request = new LLMGuardRequest();
        request.setInput(input);
        request.setContext(context != null ? context : new HashMap<>());

        try {
            String jsonPayload = objectMapper.writeValueAsString(request);
            
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(config.getEndpoint() + "/api/llm/guard"))
                    .header("Content-Type", "application/json")
                    .header("X-API-Key", config.getApiKey())
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .timeout(Duration.ofSeconds(config.getTimeoutSeconds()))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new GuardialException("API error: " + response.statusCode() + " - " + response.body());
            }

            LLMGuardResponse result = objectMapper.readValue(response.body(), LLMGuardResponse.class);
            
            if (config.isDebug()) {
                logger.debug("LLM Guard analysis: {}", result);
            }
            
            return result;

        } catch (IOException | InterruptedException e) {
            logger.error("Failed to analyze LLM prompt", e);
            // Default to blocking on error for safety
            LLMGuardResponse errorResponse = new LLMGuardResponse();
            errorResponse.setAllowed(false);
            errorResponse.setAction("error");
            errorResponse.getReasons().add("LLM Guard service unavailable or error");
            return errorResponse;
        }
    }

    /**
     * Check the health of the Guardial service
     */
    public Map<String, Object> healthCheck() throws GuardialException {
        try {
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(config.getEndpoint() + "/health"))
                    .GET()
                    .timeout(Duration.ofSeconds(config.getTimeoutSeconds()))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new GuardialException("Health check failed: " + response.statusCode());
            }

            return objectMapper.readValue(response.body(), new TypeReference<Map<String, Object>>() {});

        } catch (IOException | InterruptedException e) {
            logger.error("Health check failed", e);
            throw new GuardialException("Health check failed: " + e.getMessage(), e);
        }
    }

    /**
     * Generate a session ID
     */
    private String generateSessionId() {
        return "session_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 9);
    }

    /**
     * Get the current session ID
     */
    public String getSessionId() {
        return sessionId;
    }

    /**
     * Get the configuration
     */
    public GuardialConfig getConfig() {
        return config;
    }
}



