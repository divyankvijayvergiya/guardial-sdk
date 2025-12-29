"""
Guardial Python SDK v0.1.0 - One-Liner Integration
OWASP Top 10 Detection & LLM Prompt Firewall

Features:
- One-liner decorator: @guardial.protect
- FastAPI/Flask middleware support
- Auto-configuration from environment variables
- Free Forever plan support (100K requests/month)
"""

import os
import json
import time
import uuid
import requests
from typing import Dict, Optional, Callable, Any
from functools import wraps

class GuardialConfig:
    def __init__(self, api_key: Optional[str] = None, endpoint: Optional[str] = None,
                 customer_id: Optional[str] = None, debug: bool = False, timeout: int = 30):
        # Auto-detect from environment variables
        self.api_key = api_key or os.getenv('GUARDIAL_API_KEY', '')
        self.endpoint = endpoint or os.getenv('GUARDIAL_ENDPOINT', 'https://api.guardial.in')
        self.customer_id = customer_id or os.getenv('GUARDIAL_CUSTOMER_ID', 'default')
        self.debug = debug or os.getenv('GUARDIAL_DEBUG', 'false').lower() == 'true'
        self.timeout = timeout
        self.session_id = f"session_{int(time.time())}_{uuid.uuid4().hex[:9]}"
        
        if not self.api_key:
            raise ValueError("GUARDIAL_API_KEY environment variable is required or pass api_key parameter")

class GuardialClient:
    def __init__(self, config: Optional[GuardialConfig] = None):
        self.config = config or GuardialConfig()
    
    def analyze_event(self, method: str, path: str, source_ip: str, 
                     user_agent: Optional[str] = None, headers: Optional[Dict] = None,
                     query_params: Optional[str] = None, request_body: Optional[str] = None) -> Dict:
        """Analyze a security event"""
        event = {
            "method": method,
            "path": path,
            "source_ip": source_ip,
            "user_agent": user_agent or "",
            "headers": headers or {},
            "query_params": query_params or "",
            "request_body": request_body or "",
            "customer_id": self.config.customer_id,
            "has_auth": self._has_auth_headers(headers or {}),
            "session_id": self.config.session_id
        }
        
        try:
            response = requests.post(
                f"{self.config.endpoint}/api/events",
                json=event,
                headers={"X-API-Key": self.config.api_key},
                timeout=self.config.timeout
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            if self.config.debug:
                print(f"[Guardial SDK] Analysis failed: {e}")
            return {"allowed": True, "error": str(e)}
    
    def prompt_guard(self, input_text: str, context: Optional[Dict] = None) -> Dict:
        """Analyze an LLM prompt for injection"""
        request_data = {
            "input": input_text,
            "context": context or {}
        }
        
        try:
            response = requests.post(
                f"{self.config.endpoint}/api/llm/guard",
                json=request_data,
                headers={"X-API-Key": self.config.api_key},
                timeout=self.config.timeout
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            if self.config.debug:
                print(f"[Guardial SDK] LLM Guard failed: {e}")
            return {"allowed": False, "error": str(e)}
    
    def health_check(self) -> Dict:
        """Check Guardial service health"""
        try:
            response = requests.get(
                f"{self.config.endpoint}/health",
                timeout=self.config.timeout
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def test(self) -> Dict:
        """Test SDK connection"""
        health = self.health_check()
        return {
            "success": "error" not in health,
            "endpoint": self.config.endpoint,
            "customer_id": self.config.customer_id,
            "health": health
        }
    
    def _has_auth_headers(self, headers: Dict) -> bool:
        """Check if headers contain authentication"""
        auth_headers = ['authorization', 'x-api-key', 'x-auth-token']
        return any(h.lower() in auth_headers for h in headers.keys())

# Global client instance (lazy initialization)
_client: Optional[GuardialClient] = None

def get_client(config: Optional[GuardialConfig] = None) -> GuardialClient:
    """Get or create global Guardial client"""
    global _client
    if _client is None:
        _client = GuardialClient(config)
    return _client

def protect(func: Callable) -> Callable:
    """
    One-liner decorator for protecting routes
    Usage: @guardial.protect
    """
    @wraps(func)
    async def async_wrapper(*args, **kwargs):
        # For async functions (FastAPI)
        client = get_client()
        # Extract request from args (FastAPI pattern)
        request = None
        for arg in args:
            if hasattr(arg, 'method') and hasattr(arg, 'url'):
                request = arg
                break
        
        if request:
            # Analyze request
            source_ip = request.client.host if hasattr(request, 'client') else 'unknown'
            body = await request.body() if hasattr(request, 'body') else b''
            
            analysis = client.analyze_event(
                method=request.method,
                path=request.url.path,
                source_ip=source_ip,
                user_agent=request.headers.get('user-agent'),
                headers=dict(request.headers),
                query_params=str(request.url.query),
                request_body=body.decode('utf-8', errors='ignore')
            )
            
            if not analysis.get('allowed', True):
                from fastapi import HTTPException
                raise HTTPException(status_code=403, detail="Request blocked by security policy")
        
        return await func(*args, **kwargs)
    
    def sync_wrapper(*args, **kwargs):
        # For sync functions (Flask)
        client = get_client()
        from flask import request
        
        if request:
            analysis = client.analyze_event(
                method=request.method,
                path=request.path,
                source_ip=request.remote_addr or 'unknown',
                user_agent=request.headers.get('user-agent'),
                headers=dict(request.headers),
                query_params=request.query_string.decode(),
                request_body=request.get_data(as_text=True)
            )
            
            if not analysis.get('allowed', True):
                from flask import abort
                abort(403, "Request blocked by security policy")
        
        return func(*args, **kwargs)
    
    # Detect if function is async
    import inspect
    if inspect.iscoroutinefunction(func):
        return async_wrapper
    return sync_wrapper

# FastAPI middleware
def fastapi_middleware(app, config: Optional[GuardialConfig] = None):
    """FastAPI middleware - one-liner: guardial.fastapi_middleware(app)"""
    client = get_client(config)
    
    @app.middleware("http")
    async def guardial_middleware(request, call_next):
        # Skip excluded paths
        exclude_paths = ['/health', '/docs', '/openapi.json']
        if any(request.url.path.startswith(p) for p in exclude_paths):
            return await call_next(request)
        
        # Analyze request
        source_ip = request.client.host if hasattr(request, 'client') else 'unknown'
        body = await request.body()
        
        analysis = client.analyze_event(
            method=request.method,
            path=request.url.path,
            source_ip=source_ip,
            user_agent=request.headers.get('user-agent'),
            headers=dict(request.headers),
            query_params=str(request.url.query),
            request_body=body.decode('utf-8', errors='ignore')
        )
        
        if not analysis.get('allowed', True):
            from fastapi import Response
            return Response(
                content=json.dumps({"error": "Request blocked by security policy"}),
                status_code=403,
                media_type="application/json"
            )
        
        return await call_next(request)

# Flask middleware
def flask_middleware(app, config: Optional[GuardialConfig] = None):
    """Flask middleware - one-liner: guardial.flask_middleware(app)"""
    client = get_client(config)
    
    @app.before_request
    def guardial_before_request():
        from flask import request, abort
        
        # Skip excluded paths
        exclude_paths = ['/health', '/static']
        if any(request.path.startswith(p) for p in exclude_paths):
            return
        
        # Analyze request
        analysis = client.analyze_event(
            method=request.method,
            path=request.path,
            source_ip=request.remote_addr or 'unknown',
            user_agent=request.headers.get('user-agent'),
            headers=dict(request.headers),
            query_params=request.query_string.decode(),
            request_body=request.get_data(as_text=True)
        )
        
        if not analysis.get('allowed', True):
            abort(403, "Request blocked by security policy")

__all__ = ['GuardialClient', 'GuardialConfig', 'protect', 'fastapi_middleware', 'flask_middleware', 'get_client']



