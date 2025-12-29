package com.guardial.sdk;

/**
 * Configuration for Guardial SDK
 */
public class GuardialConfig {
    private String apiKey;
    private String endpoint;
    private String customerId;
    private boolean debug;
    private int timeoutSeconds;

    public GuardialConfig() {
        this.endpoint = "https://api.guardial.com";
        this.customerId = "default";
        this.debug = false;
        this.timeoutSeconds = 30;
    }

    /**
     * Create default configuration
     */
    public static GuardialConfig defaultConfig() {
        return new GuardialConfig();
    }

    /**
     * Builder pattern for configuration
     */
    public static class Builder {
        private final GuardialConfig config;

        public Builder() {
            this.config = new GuardialConfig();
        }

        public Builder apiKey(String apiKey) {
            config.apiKey = apiKey;
            return this;
        }

        public Builder endpoint(String endpoint) {
            config.endpoint = endpoint;
            return this;
        }

        public Builder customerId(String customerId) {
            config.customerId = customerId;
            return this;
        }

        public Builder debug(boolean debug) {
            config.debug = debug;
            return this;
        }

        public Builder timeoutSeconds(int timeoutSeconds) {
            config.timeoutSeconds = timeoutSeconds;
            return this;
        }

        public GuardialConfig build() {
            if (config.apiKey == null || config.apiKey.isEmpty()) {
                throw new IllegalArgumentException("API key is required");
            }
            return config;
        }
    }

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

    public boolean isDebug() {
        return debug;
    }

    public void setDebug(boolean debug) {
        this.debug = debug;
    }

    public int getTimeoutSeconds() {
        return timeoutSeconds;
    }

    public void setTimeoutSeconds(int timeoutSeconds) {
        this.timeoutSeconds = timeoutSeconds;
    }
}



