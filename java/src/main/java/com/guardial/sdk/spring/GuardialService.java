package com.guardial.sdk.spring;

import com.guardial.sdk.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Service wrapper for Guardial SDK with Spring Boot integration
 */
@Service
public class GuardialService {

    @Autowired
    private GuardialClient guardialClient;

    /**
     * Analyze a security event
     */
    public SecurityEventResponse analyzeEvent(SecurityEventRequest event) throws GuardialException {
        return guardialClient.analyzeEvent(event);
    }

    /**
     * Analyze an LLM prompt
     */
    public LLMGuardResponse analyzePrompt(String prompt) throws GuardialException {
        return guardialClient.promptGuard(prompt);
    }

    /**
     * Analyze an LLM prompt with context
     */
    public LLMGuardResponse analyzePrompt(String prompt, Map<String, String> context) throws GuardialException {
        return guardialClient.promptGuard(prompt, context);
    }

    /**
     * Check Guardial service health
     */
    public Map<String, Object> healthCheck() throws GuardialException {
        return guardialClient.healthCheck();
    }
}



