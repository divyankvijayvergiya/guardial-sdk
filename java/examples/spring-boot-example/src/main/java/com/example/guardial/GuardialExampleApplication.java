package com.example.guardial;

import com.guardial.sdk.GuardialException;
import com.guardial.sdk.spring.GuardialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@SpringBootApplication
@RestController
@RequestMapping("/api")
public class GuardialExampleApplication {

    @Autowired
    private GuardialService guardialService;

    public static void main(String[] args) {
        SpringApplication.run(GuardialExampleApplication.class, args);
    }

    /**
     * Example: Get users endpoint (automatically protected by Guardial interceptor)
     */
    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getUsers() {
        List<Map<String, Object>> users = List.of(
                Map.of("id", 1, "name", "John Doe", "email", "john@example.com"),
                Map.of("id", 2, "name", "Jane Smith", "email", "jane@example.com")
        );

        return ResponseEntity.ok(Map.of("users", users));
    }

    /**
     * Example: Create user endpoint (automatically protected by Guardial interceptor)
     */
    @PostMapping("/users")
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody Map<String, String> user) {
        // Request is automatically analyzed by Guardial interceptor
        return ResponseEntity.ok(Map.of(
                "message", "User created successfully",
                "user", user
        ));
    }

    /**
     * Example: LLM chat endpoint with prompt protection
     */
    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        if (message == null || message.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Message is required"));
        }

        try {
            // Analyze prompt for injection attacks
            Map<String, String> context = new HashMap<>();
            context.put("user_id", request.getOrDefault("user_id", "anonymous"));
            context.put("model", "gpt-4");

            var analysis = guardialService.analyzePrompt(message, context);

            if (!analysis.isAllowed()) {
                return ResponseEntity.status(403)
                        .body(Map.of(
                                "error", "Prompt blocked by security policy",
                                "reasons", analysis.getReasons()
                        ));
            }

            // Simulate LLM response
            return ResponseEntity.ok(Map.of(
                    "response", "This is a simulated LLM response to: " + message,
                    "analysis", analysis
            ));

        } catch (GuardialException e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Security analysis failed: " + e.getMessage()));
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        try {
            Map<String, Object> guardialHealth = guardialService.healthCheck();
            return ResponseEntity.ok(Map.of(
                    "status", "healthy",
                    "guardial", guardialHealth,
                    "service", "guardial-example"
            ));
        } catch (GuardialException e) {
            return ResponseEntity.status(503)
                    .body(Map.of(
                            "status", "unhealthy",
                            "error", e.getMessage()
                    ));
        }
    }
}



