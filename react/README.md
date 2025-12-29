# Guardial React SDK

One-liner security integration for React applications.

## Installation

```bash
npm install @divyank96/guardial-react-sdk
```

## Quick Start

### Environment Variables

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

  const handleClick = async () => {
    // Secure fetch
    const response = await secureFetch('/api/data');
    
    // Prompt guard
    const result = await promptGuard('user input');
  };

  return <button onClick={handleClick}>Click</button>;
}
```

