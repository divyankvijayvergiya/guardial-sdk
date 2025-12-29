package com.guardial.sdk;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * LLM prompt violation detection model
 */
public class LLMDetection {
    @JsonProperty("rule_id")
    private String ruleId;
    
    private String title;
    
    private String severity;
    
    @JsonProperty("pattern_matched")
    private String patternMatched;
    
    private String evidence;
    
    private String recommendation;

    // Getters and setters
    public String getRuleId() {
        return ruleId;
    }

    public void setRuleId(String ruleId) {
        this.ruleId = ruleId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getPatternMatched() {
        return patternMatched;
    }

    public void setPatternMatched(String patternMatched) {
        this.patternMatched = patternMatched;
    }

    public String getEvidence() {
        return evidence;
    }

    public void setEvidence(String evidence) {
        this.evidence = evidence;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }
}



