package com.guardial.sdk;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.HashMap;
import java.util.Map;

/**
 * Request model for LLM prompt analysis
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LLMGuardRequest {
    private String input;
    private Map<String, String> context;

    public LLMGuardRequest() {
        this.context = new HashMap<>();
    }

    // Getters and setters
    public String getInput() {
        return input;
    }

    public void setInput(String input) {
        this.input = input;
    }

    public Map<String, String> getContext() {
        return context;
    }

    public void setContext(Map<String, String> context) {
        this.context = context != null ? context : new HashMap<>();
    }
}



