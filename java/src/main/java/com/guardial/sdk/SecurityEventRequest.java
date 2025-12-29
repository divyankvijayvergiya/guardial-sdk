package com.guardial.sdk;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

/**
 * Request model for security event analysis
 */
public class SecurityEventRequest {
    private String method;
    private String path;
    
    @JsonProperty("source_ip")
    private String sourceIp;
    
    @JsonProperty("user_agent")
    private String userAgent;
    
    private Map<String, String> headers;
    
    @JsonProperty("query_params")
    private String queryParams;
    
    @JsonProperty("request_body")
    private String requestBody;
    
    @JsonProperty("customer_id")
    private String customerId;
    
    @JsonProperty("has_auth")
    private boolean hasAuth;
    
    @JsonProperty("country_code")
    private String countryCode;
    
    @JsonProperty("session_id")
    private String sessionId;

    // Getters and setters
    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getSourceIp() {
        return sourceIp;
    }

    public void setSourceIp(String sourceIp) {
        this.sourceIp = sourceIp;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public Map<String, String> getHeaders() {
        return headers;
    }

    public void setHeaders(Map<String, String> headers) {
        this.headers = headers;
    }

    public String getQueryParams() {
        return queryParams;
    }

    public void setQueryParams(String queryParams) {
        this.queryParams = queryParams;
    }

    public String getRequestBody() {
        return requestBody;
    }

    public void setRequestBody(String requestBody) {
        this.requestBody = requestBody;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public boolean isHasAuth() {
        return hasAuth;
    }

    public void setHasAuth(boolean hasAuth) {
        this.hasAuth = hasAuth;
    }

    public String getCountryCode() {
        return countryCode;
    }

    public void setCountryCode(String countryCode) {
        this.countryCode = countryCode;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
}



