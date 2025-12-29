package com.guardial.sdk.spring;

import com.guardial.sdk.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * Spring Boot interceptor for Guardial security analysis
 */
@Component
public class GuardialInterceptor implements HandlerInterceptor {
    private static final Logger logger = LoggerFactory.getLogger(GuardialInterceptor.class);

    @Autowired
    private GuardialClient guardialClient;

    @Autowired(required = false)
    private GuardialProperties guardialProperties;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Skip if disabled
        if (guardialProperties != null && !guardialProperties.isEnabled()) {
            return true;
        }

        // Skip excluded paths
        if (guardialProperties != null && isExcludedPath(request.getRequestURI(), guardialProperties.getExcludePaths())) {
            return true;
        }

        try {
            SecurityEventRequest event = buildSecurityEvent(request);
            SecurityEventResponse analysis = guardialClient.analyzeRequest(event);

            if (!analysis.isAllowed()) {
                logger.warn("Request blocked by Guardial: {} {} - Score: {}, Reasons: {}",
                        request.getMethod(), request.getRequestURI(),
                        analysis.getRiskScore(), analysis.getRiskReasons());

                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write(String.format(
                        "{\"error\":\"Request blocked by security policy\",\"reasons\":%s,\"risk_score\":%d}",
                        analysis.getRiskReasons().toString(), analysis.getRiskScore()
                ));
                return false;
            }

            // Log high-risk requests
            if (analysis.getRiskScore() > 50) {
                logger.info("High-risk request detected: {} {} - Score: {}, Reasons: {}",
                        request.getMethod(), request.getRequestURI(),
                        analysis.getRiskScore(), analysis.getRiskReasons());
            }

            // Store analysis in request attribute for later use
            request.setAttribute("guardial_analysis", analysis);

            return true;

        } catch (GuardialException e) {
            logger.error("Guardial analysis failed: {}", e.getMessage(), e);
            // Fail-open: allow request if analysis fails
            if (guardialProperties == null || guardialProperties.isFailOpen()) {
                return true;
            }
            // Fail-closed: block request if configured
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Security analysis failed\"}");
            return false;
        }
    }

    private SecurityEventRequest buildSecurityEvent(HttpServletRequest request) {
        SecurityEventRequest event = new SecurityEventRequest();
        event.setMethod(request.getMethod());
        event.setPath(request.getRequestURI());
        event.setSourceIp(getClientIp(request));
        event.setUserAgent(request.getHeader("User-Agent"));
        event.setHeaders(extractHeaders(request));
        event.setQueryParams(request.getQueryString() != null ? request.getQueryString() : "");
        event.setRequestBody(extractRequestBody(request));
        event.setHasAuth(hasAuthHeaders(request));
        event.setSessionId(getSessionId(request));

        if (guardialProperties != null && guardialProperties.getCustomerId() != null) {
            event.setCustomerId(guardialProperties.getCustomerId());
        }

        return event;
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty()) {
            ip = request.getHeader("X-Client-IP");
        }
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        return ip != null ? ip.split(",")[0].trim() : "unknown";
    }

    private Map<String, String> extractHeaders(HttpServletRequest request) {
        Map<String, String> headers = new HashMap<>();
        Collections.list(request.getHeaderNames()).forEach(name ->
                headers.put(name, request.getHeader(name))
        );
        return headers;
    }

    private String extractRequestBody(HttpServletRequest request) {
        // Note: Reading request body consumes it. For production, use ContentCachingRequestWrapper
        // This is a simplified version - in production, you'd want to cache the body
        return "";
    }

    private boolean hasAuthHeaders(HttpServletRequest request) {
        return request.getHeader("Authorization") != null ||
               request.getHeader("X-API-Key") != null ||
               request.getHeader("X-Auth-Token") != null;
    }

    private String getSessionId(HttpServletRequest request) {
        String sessionId = request.getHeader("X-Session-ID");
        if (sessionId == null && request.getSession(false) != null) {
            sessionId = request.getSession(false).getId();
        }
        return sessionId != null ? sessionId : "session_" + System.currentTimeMillis();
    }

    private boolean isExcludedPath(String path, String[] excludePaths) {
        if (excludePaths == null) {
            return false;
        }
        for (String excludePath : excludePaths) {
            if (path.startsWith(excludePath)) {
                return true;
            }
        }
        return false;
    }
}



