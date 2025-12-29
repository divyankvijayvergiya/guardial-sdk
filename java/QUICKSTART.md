# Guardial Java SDK - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Add Dependency

#### Maven (`pom.xml`)
```xml
<dependency>
    <groupId>com.guardial</groupId>
    <artifactId>guardial-sdk</artifactId>
    <version>0.1.0</version>
</dependency>
```

#### Gradle (`build.gradle`)
```gradle
dependencies {
    implementation 'com.guardial:guardial-sdk:0.1.0'
}
```

### Step 2: Configure (Spring Boot)

Add to `application.properties`:
```properties
guardial.api-key=${GUARDIAL_API_KEY}
guardial.endpoint=https://api.guardial.com
guardial.customer-id=your-customer-id
guardial.enabled=true
```

### Step 3: Use in Your Code

#### Option A: Automatic Protection (Spring Boot)

The SDK automatically protects all endpoints via interceptor:

```java
@RestController
@RequestMapping("/api")
public class UserController {
    
    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers() {
        // Automatically protected by Guardial!
        return ResponseEntity.ok(userService.findAll());
    }
}
```

#### Option B: Manual Analysis

```java
@Autowired
private GuardialService guardialService;

@PostMapping("/chat")
public ResponseEntity<?> chat(@RequestBody Map<String, String> request) {
    // Analyze LLM prompt
    LLMGuardResponse analysis = guardialService.analyzePrompt(request.get("message"));
    
    if (!analysis.isAllowed()) {
        return ResponseEntity.status(403)
            .body(Map.of("error", "Prompt blocked", "reasons", analysis.getReasons()));
    }
    
    // Process request...
    return ResponseEntity.ok(Map.of("response", "Success"));
}
```

#### Option C: Standalone Java Application

```java
GuardialConfig config = new GuardialConfig.Builder()
    .apiKey(System.getenv("GUARDIAL_API_KEY"))
    .endpoint("https://api.guardial.com")
    .customerId("my-app")
    .build();

GuardialClient client = new GuardialClient(config);

// Analyze request
SecurityEventRequest event = new SecurityEventRequest();
event.setMethod("GET");
event.setPath("/api/users");
event.setSourceIp("192.168.1.100");
// ... set other fields

SecurityEventResponse analysis = client.analyzeEvent(event);
if (!analysis.isAllowed()) {
    // Block request
    return;
}
```

## 📋 Environment Variables

```bash
export GUARDIAL_API_KEY="your-api-key-here"
export GUARDIAL_ENDPOINT="https://api.guardial.com"
export GUARDIAL_CUSTOMER_ID="your-customer-id"
```

## 🧪 Testing

1. **Get your API key** from [dashboard.guardial.in](https://dashboard.guardial.in)
2. **Set environment variables**
3. **Run the example**:
   ```bash
   cd examples/spring-boot-example
   mvn spring-boot:run
   ```
4. **Test endpoints**:
   ```bash
   curl http://localhost:8080/api/users
   curl -X POST http://localhost:8080/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message":"Hello"}'
   ```

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check out [examples/BasicExample.java](examples/BasicExample.java) for more examples
- See [examples/spring-boot-example](examples/spring-boot-example) for complete Spring Boot integration

## 🆘 Need Help?

- **Documentation**: See [README.md](README.md)
- **Issues**: https://github.com/guardial/java-sdk/issues
- **Email**: support@guardial.com



