# Guardial Python SDK

One-liner security integration for Python applications.

## Installation

```bash
pip install guardial-sdk
```

## Quick Start

### Environment Variables

```bash
export GUARDIAL_API_KEY=your_api_key
export GUARDIAL_CUSTOMER_ID=your_customer_id
```

### FastAPI - One-Liner

```python
from fastapi import FastAPI
import guardial

app = FastAPI()

# One-liner integration
guardial.fastapi_middleware(app)
```

### Flask - One-Liner

```python
from flask import Flask
import guardial

app = Flask(__name__)

# One-liner integration
guardial.flask_middleware(app)
```

### Decorator - One-Liner

```python
import guardial

@guardial.protect
async def my_endpoint(request):
    return {"message": "protected"}
```

## Testing

```python
import guardial

client = guardial.get_client()
result = client.test()
print(result)
```



