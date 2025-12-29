# Guardial Go SDK - 2 Minute Setup

🛡️ **Real-time OWASP Top 10 Detection & LLM Prompt Firewall for Go**

## 1. Install

```bash
go get github.com/divyankvijayvergiya/guardial-sdk/go
```

## 2. Set Environment Variables

```bash
export GUARDIAL_API_KEY="your-api-key"
export GUARDIAL_CUSTOMER_ID="your-customer-id"
```

## 3. Add One Line to Your Code

### Gin Framework

```go
package main

import (
    "github.com/gin-gonic/gin"
    guardial "github.com/divyankvijayvergiya/guardial-sdk/go"
)

func main() {
    client, _ := guardial.NewClientFromEnv()
    r := gin.Default()
    
    r.Use(guardial.GinMiddleware(client, nil)) // ← Add this line
    
    r.GET("/api/users", func(c *gin.Context) {
        c.JSON(200, gin.H{"users": []string{"user1"}})
    })
    
    r.Run(":8080")
}
```

### Echo Framework

```go
package main

import (
    "net/http"
    "github.com/labstack/echo/v4"
    guardial "github.com/divyankvijayvergiya/guardial-sdk/go"
)

func main() {
    client, _ := guardial.NewClientFromEnv()
    e := echo.New()
    
    e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
        return func(c echo.Context) error {
            analysis, err := client.AnalyzeRequest(c.Request())
            if err == nil && !analysis.Allowed {
                return c.JSON(http.StatusForbidden, gin.H{"error": "Blocked"})
            }
            return next(c)
        }
    })
    
    e.GET("/api/users", func(c echo.Context) error {
        return c.JSON(200, map[string]interface{}{"users": []string{"user1"}})
    })
    
    e.Start(":8080")
}
```

### Standard HTTP

```go
package main

import (
    "net/http"
    guardial "github.com/divyankvijayvergiya/guardial-sdk/go"
)

func main() {
    client, _ := guardial.NewClientFromEnv()
    
    handler := guardial.StandardMiddleware(client, nil)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("OK"))
    }))
    
    http.Handle("/api/users", handler)
    http.ListenAndServe(":8080", nil)
}
```

## 4. Protect LLM Prompts (Optional)

```go
result, err := client.PromptGuard(userInput, nil)
if err == nil && !result.Allowed {
    return errors.New("Prompt blocked")
}
```

## Done! 🎉

Your API is now protected against OWASP Top 10 attacks.

**Get API Key**: [dashboard.guardial.in](https://dashboard.guardial.in)

---

## API Reference

### Client Methods

- `NewClientFromEnv()` - Create client from environment variables
- `GinMiddleware(client, options)` - Gin middleware
- `StandardMiddleware(client, options)` - Standard HTTP middleware
- `AnalyzeRequest(req)` - Analyze HTTP request
- `PromptGuard(input, context)` - Analyze LLM prompt

### Response Types

```go
type SecurityEventResponse struct {
    RiskScore   int      `json:"risk_score"`   // 0-100
    Allowed     bool     `json:"allowed"`      // Can proceed?
    RiskReasons []string `json:"risk_reasons"` // Why this score
}
```

## Support

- **Documentation**: [docs.guardial.in](https://docs.guardial.in)
- **Email**: support@guardial.in
- **GitHub**: [github.com/divyankvijayvergiya/guardial-sdk](https://github.com/divyankvijayvergiya/guardial-sdk)

## License

MIT
