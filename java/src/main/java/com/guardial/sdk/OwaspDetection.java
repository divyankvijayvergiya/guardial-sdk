package com.guardial.sdk;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * OWASP vulnerability detection model
 */
public class OwaspDetection {
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("security_event_id")
    private Long securityEventId;
    
    @JsonProperty("organization_id")
    private Long organizationId;
    
    @JsonProperty("owasp_category")
    private String owaspCategory;
    
    @JsonProperty("owasp_title")
    private String owaspTitle;
    
    private String severity;
    
    @JsonProperty("pattern_matched")
    private String patternMatched;
    
    private String evidence;
    
    private String recommendation;
    
    @JsonProperty("found_in")
    private String foundIn;
    
    @JsonProperty("created_at")
    private String createdAt;

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSecurityEventId() {
        return securityEventId;
    }

    public void setSecurityEventId(Long securityEventId) {
        this.securityEventId = securityEventId;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public String getOwaspCategory() {
        return owaspCategory;
    }

    public void setOwaspCategory(String owaspCategory) {
        this.owaspCategory = owaspCategory;
    }

    public String getOwaspTitle() {
        return owaspTitle;
    }

    public void setOwaspTitle(String owaspTitle) {
        this.owaspTitle = owaspTitle;
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

    public String getFoundIn() {
        return foundIn;
    }

    public void setFoundIn(String foundIn) {
        this.foundIn = foundIn;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}



