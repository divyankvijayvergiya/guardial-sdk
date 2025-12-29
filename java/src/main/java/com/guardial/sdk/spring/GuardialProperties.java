package com.guardial.sdk.spring;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration properties for Guardial Spring Boot integration
 */
@ConfigurationProperties(prefix = "guardial")
public class GuardialProperties {
    private String apiKey;
    private String endpoint = "https://api.guardial.in";
    private String customerId;
    private boolean enabled = true;
    private boolean failOpen = true; // Allow requests if analysis fails
    private int timeoutSeconds = 30;
    private String[] excludePaths = {"/actuator", "/health", "/error"};

    // Getters and setters
    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isFailOpen() {
        return failOpen;
    }

    public void setFailOpen(boolean failOpen) {
        this.failOpen = failOpen;
    }

    public int getTimeoutSeconds() {
        return timeoutSeconds;
    }

    public void setTimeoutSeconds(int timeoutSeconds) {
        this.timeoutSeconds = timeoutSeconds;
    }

    public String[] getExcludePaths() {
        return excludePaths;
    }

    public void setExcludePaths(String[] excludePaths) {
        this.excludePaths = excludePaths;
    }
}



