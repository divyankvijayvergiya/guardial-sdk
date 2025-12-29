package com.guardial.sdk;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;

/**
 * Response model for LLM prompt analysis
 */
public class LLMGuardResponse {
    private boolean allowed;
    private String action;
    private List<String> reasons = new ArrayList<>();
    private List<LLMDetection> detections = new ArrayList<>();
    
    @JsonProperty("processing_time_ms")
    private String processingTime;

    // Getters and setters
    public boolean isAllowed() {
        return allowed;
    }

    public void setAllowed(boolean allowed) {
        this.allowed = allowed;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public List<String> getReasons() {
        return reasons;
    }

    public void setReasons(List<String> reasons) {
        this.reasons = reasons != null ? reasons : new ArrayList<>();
    }

    public List<LLMDetection> getDetections() {
        return detections;
    }

    public void setDetections(List<LLMDetection> detections) {
        this.detections = detections != null ? detections : new ArrayList<>();
    }

    public String getProcessingTime() {
        return processingTime;
    }

    public void setProcessingTime(String processingTime) {
        this.processingTime = processingTime;
    }
}



