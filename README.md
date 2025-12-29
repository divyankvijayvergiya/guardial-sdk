# Guardial SDK

🛡️ **Multi-language SDKs for Real-time OWASP Top 10 Detection & LLM Prompt Firewall**

## 🚀 Quick Start

### JavaScript/Node.js

```bash
npm install guardial-js-sdk
```

```javascript
const guardial = require('guardial-js-sdk');
const express = require('express');

const app = express();
app.use(guardial.middleware()); // One line to protect all routes!

app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});
```

### Go

```bash
go get github.com/divyankvijayvergiya/guardial-sdk/go
```

```go
package main

import (
    "github.com/gin-gonic/gin"
    guardial "github.com/divyankvijayvergiya/guardial-sdk/go"
)

func main() {
    client, _ := guardial.NewClientFromEnv()
    r := gin.Default()
    r.Use(guardial.GinMiddleware(client, nil)) // One line to protect all routes!
    r.GET("/api/users", func(c *gin.Context) {
        c.JSON(200, gin.H{"users": []string{}})
    })
    r.Run(":8080")
}
```

## 📁 Available SDKs

| Language | Package | Installation | Documentation |
|----------|---------|-------------|---------------|
| **JavaScript** | `guardial-js-sdk` | `npm install guardial-js-sdk` | [📖 JavaScript SDK](./javascript/README.md) |
| **Go** | `github.com/divyankvijayvergiya/guardial-sdk/go` | `go get github.com/divyankvijayvergiya/guardial-sdk/go` | [📖 Go SDK](./go/README.md) |
| **Python** | Coming Soon | - | - |
| **Java** | Coming Soon | - | - |

## 🛡️ Features

- ✅ **OWASP Top 10 Detection** - SQL injection, XSS, path traversal, command injection
- ✅ **LLM Prompt Firewall** - Detect and block prompt injection attacks
- ✅ **Real-time Risk Scoring** - Dynamic 0-100 risk assessment
- ✅ **Automatic Request Blocking** - Block malicious requests automatically
- ✅ **One-Liner Integration** - Single line of code to protect your API
- ✅ **Auto-Configuration** - Reads from environment variables

## 🚀 Getting Started

1. **Get Your API Key**: Sign up at [dashboard.guardial.in](https://dashboard.guardial.in)
2. **Choose Your Language**: Select the appropriate SDK from the table above
3. **Install the SDK**: Follow the installation instructions
4. **Set Environment Variables**:
   ```bash
   export GUARDIAL_API_KEY="your-api-key"
   export GUARDIAL_CUSTOMER_ID="your-customer-id"
   ```
5. **Integrate**: Add one line of code to protect your API
6. **Monitor**: View security events in your dashboard

## 📚 Documentation

- [📖 JavaScript SDK Documentation](./javascript/README.md)
- [📖 Go SDK Documentation](./go/README.md)
- [🌐 API Documentation](https://docs.guardial.in)
- [🎯 Integration Guides](https://docs.guardial.in/integration)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📞 Support

- **📧 Email**: support@guardial.in
- **💬 GitHub Issues**: [Create an issue](https://github.com/divyankvijayvergiya/guardial-sdk/issues)
- **📖 Documentation**: [docs.guardial.in](https://docs.guardial.in)

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

**Ready to secure your application?** Get started with Guardial SDKs today! 🚀

[Get API Key](https://dashboard.guardial.in) | [View Documentation](https://docs.guardial.in)

