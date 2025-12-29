# Guardial SDK - One-Liner Integration Guide

All Guardial SDKs now support **one-liner integration** with automatic configuration from environment variables.

## Environment Variables

Set these environment variables (SDKs auto-detect them):

```bash
export GUARDIAL_API_KEY=your_api_key_here
export GUARDIAL_CUSTOMER_ID=your_customer_id
export GUARDIAL_ENDPOINT=https://api.guardial.com  # Optional, defaults to this
export GUARDIAL_DEBUG=true  # Optional, for debugging
```

## JavaScript/Node.js/Express

### Installation
```bash
npm install guardial-js-sdk
```

### One-Liner Integration
```javascript
const guardial = require('guardial-js-sdk');

// Express - One line!
app.use(guardial.middleware());

// Or wrap fetch globally
global.fetch = guardial.wrap(fetch);
```

### Testing
```javascript
const client = new guardial.GuardialSDK();
const result = await client.test();
console.log(result);
```

## TypeScript/SvelteKit

### Installation
```bash
npm install @divyank96/guardial-sveltekit-sdk
```

### One-Liner Integration
```typescript
// hooks.server.ts
import { protect } from '@divyank96/guardial-sveltekit-sdk/hooks';
import { sequence } from '@sveltejs/kit/hooks';

// One line!
export const handle = protect(sequence(...otherHandles));
```

### Testing
```typescript
import { GuardialClient } from '@divyank96/guardial-sveltekit-sdk';
const client = new GuardialClient({}); // Auto-detects from env
const result = await client.test();
```

## Go (Gin/Echo/Chi)

### Installation
```bash
go get github.com/divyankvijayvergiya/guardial-backend/sdk/go
```

### One-Liner Integration
```go
import "github.com/divyankvijayvergiya/guardial-backend/sdk/go"

// Gin - One line!
router.Use(guardial.Middleware(nil))

// Or with custom options
options := &guardial.MiddlewareOptions{
    ExcludePaths: []string{"/health"},
    FailOpen: true,
}
router.Use(guardial.GinMiddleware(client, options))
```

### Testing
```go
client, _ := guardial.NewClientFromEnv()
result, _ := client.Test(context.Background())
fmt.Println(result)
```

## Python (FastAPI/Flask)

### Installation
```bash
pip install guardial-sdk
```

### One-Liner Integration
```python
import guardial

# FastAPI - One line!
guardial.fastapi_middleware(app)

# Flask - One line!
guardial.flask_middleware(app)

# Or use decorator
@guardial.protect
async def my_endpoint(request):
    return {"message": "protected"}
```

### Testing
```python
client = guardial.get_client()
result = client.test()
print(result)
```

## React

### Installation
```bash
npm install @divyank96/guardial-react-sdk
```

### Environment Variables (React)
```bash
REACT_APP_GUARDIAL_API_KEY=your_api_key
REACT_APP_GUARDIAL_CUSTOMER_ID=your_customer_id
```

### One-Liner Integration
```tsx
import { GuardialProvider } from '@divyank96/guardial-react-sdk';

function App() {
  return (
    <GuardialProvider>
      <YourApp />
    </GuardialProvider>
  );
}
```

### Usage in Components
```tsx
import { useSecureFetch, usePromptGuard } from '@divyank96/guardial-react-sdk';

function MyComponent() {
  const secureFetch = useSecureFetch();
  const promptGuard = usePromptGuard();
  
  // Use secureFetch instead of fetch
  const data = await secureFetch('/api/data');
}
```

## Features

✅ **One-liner integration** - Single line of code  
✅ **Auto-configuration** - Reads from environment variables  
✅ **Zero-config mode** - Works out of the box  
✅ **Testing support** - Built-in test methods  
✅ **Fail-open design** - Doesn't break your app  
✅ **Type-safe** - Full TypeScript support  

## Testing Your Integration

All SDKs include a `test()` method:

```javascript
// JavaScript
const client = new GuardialSDK();
await client.test();

// TypeScript
const client = new GuardialClient({});
await client.test();

// Go
client, _ := guardial.NewClientFromEnv()
client.Test(context.Background())

// Python
client = guardial.get_client()
client.test()
```

## Support

- Documentation: https://github.com/divyankvijayvergiya/guardial-backend
- Issues: https://github.com/divyankvijayvergiya/guardial-backend/issues

