# Guardial JavaScript SDK - 2 Minute Setup

🛡️ **Real-time OWASP Top 10 Detection & LLM Prompt Firewall for JavaScript/Node.js**

## 1. Install

```bash
npm install guardial-js-sdk
```

## 2. Set Environment Variables

```bash
export GUARDIAL_API_KEY="your-api-key"
export GUARDIAL_CUSTOMER_ID="your-customer-id"
```

## 3. Add One Line to Your Code

### Express.js

```javascript
const guardial = require('guardial-js-sdk');
const express = require('express');

const app = express();

app.use(guardial.middleware()); // ← Add this line

app.get('/api/users', (req, res) => {
  res.json({ users: ['user1', 'user2'] });
});

app.listen(3000);
```

### Next.js API Route

```javascript
// pages/api/users.js
import guardial from 'guardial-js-sdk';

export default guardial.middleware()(async (req, res) => {
  res.json({ users: ['user1', 'user2'] });
});
```

### Browser (Wrap Fetch)

```javascript
import GuardialSDK from 'guardial-js-sdk';

// Wrap global fetch
global.fetch = guardial.wrap(fetch);

// Now all fetch calls are protected
fetch('/api/data');
```

## 4. Protect LLM Prompts (Optional)

```javascript
const guardial = new GuardialSDK();

const result = await guardial.promptGuard(userInput);
if (!result.allowed) {
  throw new Error('Prompt blocked');
}
```

## Done! 🎉

Your API is now protected against OWASP Top 10 attacks.

**Get API Key**: [dashboard.guardial.in](https://dashboard.guardial.in)

---

## API Reference

### `guardial.middleware(options?)`

Express middleware for automatic request protection.

```javascript
app.use(guardial.middleware({
  excludePaths: ['/health', '/static'],
  failOpen: true
}));
```

### `guardial.wrap(fetch, options?)`

Wrap fetch function for automatic protection.

```javascript
global.fetch = guardial.wrap(fetch);
```

### `new GuardialSDK(config?)`

Create a new Guardial client instance.

```javascript
const guardial = new GuardialSDK({
  apiKey: 'your-api-key',
  endpoint: 'https://api.guardial.in',
  customerId: 'your-customer-id'
});
```

## Features

✅ **One-liner integration** - Single line of code  
✅ **Auto-configuration** - Reads from environment variables  
✅ **Express middleware** - Automatic route protection  
✅ **Fetch wrapper** - Protect all HTTP requests  
✅ **LLM Prompt Guard** - Detect prompt injection  

## Support

- **Documentation**: [docs.guardial.in](https://docs.guardial.in)
- **Email**: support@guardial.in
- **GitHub**: [github.com/divyankvijayvergiya/guardial-sdk](https://github.com/divyankvijayvergiya/guardial-sdk)

## License

MIT
