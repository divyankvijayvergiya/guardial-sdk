package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	guardial "github.com/guardial/go-sdk"
)

func main() {
	// Initialize Guardial client
	config := &guardial.Config{
		APIKey:     os.Getenv("GUARDIAL_API_KEY"),  // "your-api-key-here"
		Endpoint:   os.Getenv("GUARDIAL_ENDPOINT"), // "https://api.guardial.com"
		CustomerID: "your-customer-id",             // Your customer ID
		Debug:      true,                           // Enable debug logging
	}

	client := guardial.NewClient(config)

	// Create Gin router
	r := gin.Default()

	// Security middleware
	r.Use(func(c *gin.Context) {
		// Analyze the request for security threats
		analysis, err := client.AnalyzeRequest(c.Request)
		if err != nil {
			log.Printf("Security analysis failed: %v", err)
			// Continue with request if analysis fails
		} else if !analysis.Allowed {
			log.Printf("Request blocked: %s", analysis.RiskReasons)
			c.JSON(http.StatusForbidden, gin.H{
				"error":   "Request blocked by security analysis",
				"reasons": analysis.RiskReasons,
				"score":   analysis.RiskScore,
			})
			c.Abort()
			return
		}

		// Log security analysis results
		if analysis.RiskScore > 50 {
			log.Printf("High risk request detected: Score=%d, Reasons=%v",
				analysis.RiskScore, analysis.RiskReasons)
		}

		c.Next()
	})

	// API routes
	r.GET("/api/users", func(c *gin.Context) {
		// Simulate user data retrieval
		users := []map[string]interface{}{
			{"id": 1, "name": "John Doe", "email": "john@example.com"},
			{"id": 2, "name": "Jane Smith", "email": "jane@example.com"},
		}
		c.JSON(http.StatusOK, gin.H{"users": users})
	})

	r.POST("/api/users", func(c *gin.Context) {
		var user struct {
			Name  string `json:"name" binding:"required"`
			Email string `json:"email" binding:"required,email"`
		}

		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Simulate user creation
		c.JSON(http.StatusCreated, gin.H{
			"message": "User created successfully",
			"user":    user,
		})
	})

	r.GET("/api/health", func(c *gin.Context) {
		// Check Guardial service health
		health, err := client.HealthCheck(context.Background())
		if err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"status": "unhealthy",
				"error":  err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"status":   "healthy",
			"guardial": health,
			"service":  "your-api-service",
		})
	})

	// LLM endpoint example
	r.POST("/api/chat", func(c *gin.Context) {
		var request struct {
			Message string `json:"message" binding:"required"`
		}

		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Analyze the prompt for injection attacks
		result, err := client.PromptGuard(request.Message, map[string]string{
			"user_id": c.GetHeader("X-User-ID"),
			"model":   "gpt-4",
		})
		if err != nil {
			log.Printf("LLM guard failed: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Security analysis failed"})
			return
		}

		if !result.Allowed {
			log.Printf("LLM prompt blocked: %s", result.Reasons)
			c.JSON(http.StatusForbidden, gin.H{
				"error":   "Prompt blocked by security analysis",
				"reasons": result.Reasons,
			})
			return
		}

		// Simulate LLM response
		c.JSON(http.StatusOK, gin.H{
			"response": "This is a simulated LLM response",
			"analysis": result,
		})
	})

	// Start server
	log.Println("Starting your-api-service on :8080")
	log.Println("Guardial security protection enabled")
	log.Fatal(r.Run(":8080"))
}
