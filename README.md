# Guardial SDK

🛡️ **Multi-language SDKs for Real-time OWASP Top 10 Detection & LLM Prompt Firewall**

[![npm version](https://badge.fury.io/js/guardial-js-sdk.svg)](https://badge.fury.io/js/guardial-js-sdk)
[![Go Reference](https://pkg.go.dev/badge/github.com/divyankvijayvergiya/guardial-sdk.svg)](https://pkg.go.dev/github.com/divyankvijayvergiya/guardial-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Quick Start

### JavaScript/Node.js
```bash
npm install guardial-js-sdk
```
```javascript
import GuardialSDK from 'guardial-js-sdk';
const guardial = new GuardialSDK({
  apiKey: 'your-api-key',
  endpoint: 'https://api.guardial.in'
});
```

### Go
```bash
go get github.com/divyankvijayvergiya/guardial-sdk
```
```go
import "github.com/divyankvijayvergiya/guardial-sdk"
client := guardial.NewClient(&guardial.Config{
    APIKey: "your-api-key",
    Endpoint: "https://api.guardial.in",
})
```

## 📁 Available SDKs

| Language | Package | Installation | Documentation |
|----------|---------|--------------|---------------|
| **JavaScript** | `guardial-js-sdk` | `npm install guardial-js-sdk` | [📖 JavaScript SDK](./javascript/README.md) |
| **Go** | `github.com/divyankvijayvergiya/guardial-sdk` | `go get github.com/divyankvijayvergiya/guardial-sdk` | [📖 Go SDK](./go/README.md) |
| **Python** | Coming Soon | - | - |
| **Java** | Coming Soon | - | - |

## 🛡️ Features

### **Real-time Security Analysis**
- **OWASP Top 10 Detection**: SQL injection, XSS, path traversal, command injection, broken access control
- **Dynamic Risk Scoring**: 0-100 risk assessment based on request patterns
- **Automatic Request Blocking**: Block malicious requests before they reach your application
- **Comprehensive Logging**: Detailed security event logging and analytics

### **LLM Prompt Firewall**
- **Prompt Injection Detection**: Detect and block malicious LLM prompts
- **Jailbreak Prevention**: Protect against system prompt fishing attempts
- **Data Exfiltration Protection**: Prevent sensitive data extraction
- **Custom Policy Enforcement**: Tailored security policies for your use case

### **Performance Optimized**
- **Non-blocking Analysis**: Security analysis doesn't slow down your requests
- **Efficient Transport**: Minimal overhead on your application performance
- **Configurable Timeouts**: Control request timeouts and retry logic
- **Session Tracking**: Track user sessions across multiple requests

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Your App      │    │  Guardial SDK   │    │ Guardial API    │
│                 │    │                 │    │                 │
│  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  │ Request   │──┼────┼──│ Security  │──┼────┼──│ OWASP     │  │
│  │ Handler   │  │    │  │ Analysis  │  │    │  │ Engine    │  │
│  └───────────┘  │    │  └───────────┘  │    │  └───────────┘  │
│                 │    │                 │    │                 │
│  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  │ Response  │◄─┼────┼──│ Decision  │◄─┼────┼──│ LLM       │  │
│  │ Handler   │  │    │  │ Engine    │  │    │  │ Firewall  │  │
│  └───────────┘  │    │  └───────────┘  │    │  └───────────┘  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Integration Examples

### Express.js Middleware
```javascript
const express = require('express');
const GuardialSDK = require('guardial-js-sdk');

const app = express();
const guardial = new GuardialSDK({
  apiKey: 'your-api-key',
  endpoint: 'https://api.guardial.in'
});

app.use(async (req, res, next) => {
  const analysis = await guardial.analyzeRequest(req);
  if (!analysis.allowed) {
    return res.status(403).json({ error: 'Request blocked' });
  }
  next();
});
```

### Gin Framework (Go)
```go
package main

import (
    "github.com/gin-gonic/gin"
    "github.com/divyankvijayvergiya/guardial-sdk"
)

func main() {
    client := guardial.NewClient(&guardial.Config{
        APIKey: "your-api-key",
        Endpoint: "https://api.guardial.in",
    })
    
    r := gin.Default()
    r.Use(guardial.GinMiddleware(client))
    r.GET("/api/users", func(c *gin.Context) {
        c.JSON(200, gin.H{"message": "Users retrieved"})
    })
    r.Run(":8080")
}
```

## 📊 Supported Frameworks

### JavaScript/Node.js
- ✅ **Express.js** - Middleware integration
- ✅ **Next.js** - API routes protection
- ✅ **React** - Component-level security
- ✅ **Vue.js** - Service-based protection
- ✅ **Angular** - HTTP interceptor
- ✅ **Fastify** - Plugin support
- ✅ **Koa.js** - Middleware support

### Go
- ✅ **Gin** - Middleware integration
- ✅ **Echo** - Middleware support
- ✅ **Fiber** - Middleware support
- ✅ **Standard HTTP** - Client wrapper
- ✅ **gRPC** - Interceptor support

## 🔐 Security Features

| Feature | JavaScript | Go | Python | Java |
|---------|------------|----|---------|----- |
| OWASP Top 10 Detection | ✅ | ✅ | 🚧 | 🚧 |
| LLM Prompt Firewall | ✅ | ✅ | 🚧 | 🚧 |
| Real-time Risk Scoring | ✅ | ✅ | 🚧 | 🚧 |
| Request Blocking | ✅ | ✅ | 🚧 | 🚧 |
| Session Tracking | ✅ | ✅ | 🚧 | 🚧 |
| Custom Policies | ✅ | ✅ | 🚧 | 🚧 |

## 🚀 Getting Started

1. **Get Your API Key**: Sign up at [dashboard.guardial.in](https://dashboard.guardial.in)
2. **Choose Your Language**: Select the appropriate SDK from the table above
3. **Install the SDK**: Follow the installation instructions for your language
4. **Configure**: Set up your API key and endpoint
5. **Integrate**: Add security analysis to your application
6. **Monitor**: View security events in your dashboard

## 📚 Documentation

- **📖 [JavaScript SDK Documentation](./javascript/README.md)**
- **📖 [Go SDK Documentation](./go/README.md)**
- **🌐 [API Documentation](https://docs.guardial.in)**
- **🎯 [Integration Guides](https://docs.guardial.in/integration)**
- **🔧 [Configuration Reference](https://docs.guardial.in/config)**

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Clone the repository
git clone https://github.com/divyankvijayvergiya/guardial-sdk.git
cd guardial-sdk

# Install dependencies for each SDK
cd javascript && npm install
cd ../go && go mod tidy
```

## 📞 Support

- **📧 Email**: support@guardial.in
- **💬 Discord**: [Join our community](https://discord.gg/guardial)
- **�� Issues**: [GitHub Issues](https://github.com/divyankvijayvergiya/guardial-sdk/issues)
- **📖 Documentation**: [docs.guardial.in](https://docs.guardial.in)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Ready to secure your application?** Get started with Guardial SDKs today! 🚀

[![Get API Key](https://img.shields.io/badge/Get%20API%20Key-dashboard.guardial.in-blue)](https://dashboard.guardial.in)
[![View Documentation](https://img.shields.io/badge/View%20Docs-docs.guardial.in-green)](https://docs.guardial.in)
