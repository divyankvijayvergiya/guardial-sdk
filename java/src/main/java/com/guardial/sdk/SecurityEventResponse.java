package com.guardial.sdk;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;

/**
 * Response model for security event analysis
 */
public class SecurityEventResponse {
    @JsonProperty("event_id")
    private String eventId;
    
    @JsonProperty("risk_score")
    private int riskScore;
    
    @JsonProperty("risk_reasons")
    private List<String> riskReasons = new ArrayList<>();
    
    private String action;
    
    private boolean allowed;
    
    @JsonProperty("owasp_detected")
    private List<OwaspDetection> owaspDetected = new ArrayList<>();
    
    @JsonProperty("processing_time_ms")
    private String processingTime;

    // Getters and setters
    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public int getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(int riskScore) {
        this.riskScore = riskScore;
    }

    public List<String> getRiskReasons() {
        return riskReasons;
    }

    public void setRiskReasons(List<String> riskReasons) {
        this.riskReasons = riskReasons;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public boolean isAllowed() {
        return allowed;
    }

    public void setAllowed(boolean allowed) {
        this.allowed = allowed;
    }

    public List<OwaspDetection> getOwaspDetected() {
        return owaspDetected;
    }

    public void setOwaspDetected(List<OwaspDetection> owaspDetected) {
        this.owaspDetected = owaspDetected;
    }

    public String getProcessingTime() {
        return processingTime;
    }

    public void setProcessingTime(String processingTime) {
        this.processingTime = processingTime;
    }
}



