# Guardial Java SDK

🛡️ **Real-time OWASP Top 10 Detection & LLM Prompt Firewall for Java Applications**

[![Java Version](https://img.shields.io/badge/Java-17+-blue.svg)](https://www.oracle.com/java/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Installation

#### Maven

Add to your `pom.xml`:

```xml
<dependency>
    <groupId>com.guardial</groupId>
    <artifactId>guardial-sdk</artifactId>
    <version>0.1.0</version>
</dependency>
```

#### Gradle

Add to your `build.gradle`:

```gradle
dependencies {
    implementation 'com.guardial:guardial-sdk:0.1.0'
}
```

### Basic Usage

```java
import com.guardial.sdk.*;

// Initialize Guardial client
GuardialConfig config = new GuardialConfig.Builder()
    .apiKey("your-api-key-here")
    .endpoint("https://api.guardial.com")
    .customerId("your-customer-id")
    .debug(true)
    .build();

GuardialClient client = new GuardialClient(config);

// Analyze a security event
SecurityEventRequest event = new SecurityEventRequest();
event.setMethod("GET");
event.setPath("/api/users");
event.setSourceIp("192.168.1.100");
event.setUserAgent("Mozilla/5.0...");
event.setHeaders(Map.of("Authorization", "Bearer token"));

SecurityEventResponse analysis = client.analyzeEvent(event);
if (!analysis.isAllowed()) {
    System.out.println("Request blocked: " + analysis.getRiskReasons());
    return;
}

System.out.println("Risk score: " + analysis.getRiskScore());
```

## Features

### 🔍 **Automatic Security Analysis**
- **OWASP Top 10 Detection**: SQL injection, XSS, path traversal, command injection, broken access control
- **Real-time Risk Scoring**: Dynamic risk assessment based on request patterns
- **Request Blocking**: Automatically block malicious requests
- **Comprehensive Logging**: Detailed security event logging

### 🤖 **LLM Prompt Firewall**
- **Prompt Injection Detection**: Detect and block malicious LLM prompts
- **Jailbreak Prevention**: Protect against system prompt fishing
- **Data Exfiltration Protection**: Prevent sensitive data extraction
- **Policy Enforcement**: Custom security policies for your use case

### ⚡ **Performance Optimized**
- **Non-blocking Analysis**: Security analysis doesn't slow down your requests
- **Efficient Transport**: Minimal overhead on your application
- **Configurable Timeouts**: Control request timeouts
- **Session Tracking**: Track user sessions across requests

## Spring Boot Integration

### Automatic Configuration

Add to your `application.properties`:

```properties
guardial.api-key=${GUARDIAL_API_KEY}
guardial.endpoint=https://api.guardial.com
guardial.customer-id=your-customer-id
guardial.enabled=true
guardial.fail-open=true
guardial.timeout-seconds=30
guardial.exclude-paths=/actuator,/health,/error
```

The SDK will automatically:
- Register a Spring interceptor to protect all endpoints
- Create a `GuardialClient` bean
- Provide a `GuardialService` for manual analysis

### Example Controller

```java
@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private GuardialService guardialService;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers() {
        // Automatically protected by Guardial interceptor
        return ResponseEntity.ok(userService.findAll());
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        
        // Analyze prompt for injection attacks
        LLMGuardResponse analysis = guardialService.analyzePrompt(message);
        
        if (!analysis.isAllowed()) {
            return ResponseEntity.status(403)
                .body(Map.of("error", "Prompt blocked", "reasons", analysis.getReasons()));
        }
        
        // Process LLM request...
        return ResponseEntity.ok(Map.of("response", "LLM response"));
    }
}
```

## API Reference

### GuardialClient

#### Constructor

```java
// Default configuration
GuardialClient client = new GuardialClient();

// Custom configuration
GuardialConfig config = new GuardialConfig.Builder()
    .apiKey("your-api-key")
    .endpoint("https://api.guardial.com")
    .customerId("your-customer-id")
    .debug(true)
    .timeoutSeconds(30)
    .build();

GuardialClient client = new GuardialClient(config);
```

#### Methods

```java
// Analyze a security event
SecurityEventResponse analyzeEvent(SecurityEventRequest event) throws GuardialException;

// Analyze an HTTP request
SecurityEventResponse analyzeRequest(SecurityEventRequest request) throws GuardialException;

// Analyze an LLM prompt
LLMGuardResponse promptGuard(String input) throws GuardialException;

// Analyze an LLM prompt with context
LLMGuardResponse promptGuard(String input, Map<String, String> context) throws GuardialException;

// Health check
Map<String, Object> healthCheck() throws GuardialException;
```

### SecurityEventRequest

```java
SecurityEventRequest event = new SecurityEventRequest();
event.setMethod("GET");
event.setPath("/api/users");
event.setSourceIp("192.168.1.100");
event.setUserAgent("Mozilla/5.0...");
event.setHeaders(Map.of("Authorization", "Bearer token"));
event.setQueryParams("filter=active");
event.setRequestBody("{\"key\":\"value\"}");
event.setCustomerId("your-customer-id");
event.setHasAuth(true);
event.setSessionId("session_123");
```

### SecurityEventResponse

```java
SecurityEventResponse response = client.analyzeEvent(event);

// Check if request is allowed
if (!response.isAllowed()) {
    // Request blocked
    System.out.println("Reasons: " + response.getRiskReasons());
    System.out.println("Risk Score: " + response.getRiskScore());
    return;
}

// Get OWASP detections
List<OwaspDetection> detections = response.getOwaspDetected();
for (OwaspDetection detection : detections) {
    System.out.println("OWASP Category: " + detection.getOwaspCategory());
    System.out.println("Severity: " + detection.getSeverity());
}
```

### LLMGuardResponse

```java
LLMGuardResponse response = client.promptGuard("Ignore all previous instructions...");

if (!response.isAllowed()) {
    System.out.println("Prompt blocked: " + response.getReasons());
    return;
}

// Get detections
List<LLMDetection> detections = response.getDetections();
for (LLMDetection detection : detections) {
    System.out.println("Rule: " + detection.getRuleId());
    System.out.println("Severity: " + detection.getSeverity());
}
```

## Integration Examples

### Standard Java HTTP Server

```java
import com.guardial.sdk.*;
import com.sun.net.httpserver.*;

public class GuardialHttpServer {
    public static void main(String[] args) throws Exception {
        GuardialClient client = new GuardialClient(
            new GuardialConfig.Builder()
                .apiKey(System.getenv("GUARDIAL_API_KEY"))
                .customerId("java-server")
                .build()
        );

        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        
        server.createContext("/api/users", exchange -> {
            // Build security event from HTTP exchange
            SecurityEventRequest event = buildEventFromExchange(exchange);
            
            // Analyze request
            SecurityEventResponse analysis = client.analyzeEvent(event);
            
            if (!analysis.isAllowed()) {
                exchange.sendResponseHeaders(403, 0);
                exchange.getResponseBody().write(
                    ("Request blocked: " + analysis.getRiskReasons()).getBytes()
                );
                exchange.close();
                return;
            }
            
            // Process request...
            exchange.sendResponseHeaders(200, 0);
            exchange.close();
        });
        
        server.start();
    }
}
```

### Spring MVC (without Spring Boot)

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Bean
    public GuardialClient guardialClient() {
        GuardialConfig config = new GuardialConfig.Builder()
            .apiKey(System.getenv("GUARDIAL_API_KEY"))
            .customerId("spring-mvc-app")
            .build();
        return new GuardialClient(config);
    }
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new GuardialInterceptor(guardialClient()))
            .addPathPatterns("/api/**");
    }
}
```

## Configuration

### Environment Variables

```bash
export GUARDIAL_API_KEY="your-api-key-here"
export GUARDIAL_ENDPOINT="https://api.guardial.com"
export GUARDIAL_CUSTOMER_ID="your-customer-id"
export GUARDIAL_DEBUG="true"
```

### Configuration File (Spring Boot)

```properties
# application.properties
guardial.api-key=${GUARDIAL_API_KEY}
guardial.endpoint=${GUARDIAL_ENDPOINT:https://api.guardial.com}
guardial.customer-id=${GUARDIAL_CUSTOMER_ID}
guardial.enabled=true
guardial.fail-open=true
guardial.timeout-seconds=30
guardial.exclude-paths=/actuator,/health,/error
```

## Error Handling

```java
try {
    SecurityEventResponse analysis = client.analyzeEvent(event);
    // Handle analysis result
} catch (GuardialException e) {
    if (e.getMessage().contains("timeout")) {
        // Handle timeout - consider allowing request
        System.out.println("Security analysis timed out, allowing request");
    } else {
        // Handle other errors
        System.err.println("Security analysis failed: " + e.getMessage());
        e.printStackTrace();
    }
}
```

## Best Practices

### 1. **Error Handling**
- Always handle `GuardialException` gracefully
- Consider allowing requests when analysis fails (fail-open)
- Log security events for monitoring

### 2. **Performance**
- Use connection pooling for high-traffic applications
- Set appropriate timeouts
- Monitor security analysis latency

### 3. **Security**
- Keep your API key secure (use environment variables)
- Use HTTPS for all communications
- Regularly rotate API keys

### 4. **Monitoring**
- Monitor security analysis success rates
- Track blocked requests
- Set up alerts for high-risk events

## Response Types

### SecurityEventResponse

```java
class SecurityEventResponse {
    String eventId;              // Unique event identifier
    int riskScore;              // 0-100 risk score
    List<String> riskReasons;   // Why this score
    String action;              // allowed, blocked, monitored
    boolean allowed;            // Can proceed?
    List<OwaspDetection> owaspDetected; // OWASP violations
    String processingTime;      // Analysis time
}
```

### LLMGuardResponse

```java
class LLMGuardResponse {
    boolean allowed;            // Can proceed?
    String action;              // allowed, blocked, monitored
    List<String> reasons;       // Why this decision
    List<LLMDetection> detections; // Violations found
    String processingTime;      // Analysis time
}
```

## Support

- **Documentation**: https://docs.guardial.com
- **GitHub Issues**: https://github.com/guardial/java-sdk/issues
- **Email Support**: support@guardial.com

## License

MIT License - see LICENSE file for details.

---

**Ready to secure your Java application?** Get your API key at [dashboard.guardial.in](https://dashboard.guardial.in) and start protecting your APIs today!



