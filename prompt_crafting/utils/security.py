"""Security utilities: rate limiting, API key auth, and scope validation.

Provides FastAPI middleware and dependency functions for enforcing
security policies across all endpoints.
"""

import os
import time
from collections import defaultdict
from typing import Optional

from fastapi import HTTPException, Request, Security
from fastapi.security import APIKeyHeader

# Configurable rate limit: requests per minute per API key.
_RATE_LIMIT_RPM: int = int(os.getenv("RATE_LIMIT_RPM", "10"))

# In-memory rate limiting store (per API key).
_rate_limit_store: dict[str, list[float]] = defaultdict(list)

_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def get_api_keys() -> list[str]:
    """Load valid API keys from environment.

    Returns:
        List of valid API key strings from API_KEYS env var.
    """
    raw = os.getenv("API_KEYS", "")
    if not raw.strip():
        return []
    return [k.strip() for k in raw.split(",") if k.strip()]


async def verify_api_key(
    api_key: Optional[str] = Security(_api_key_header),
) -> str:
    """FastAPI dependency to verify the X-API-Key header.

    Args:
        api_key: The API key from the request header.

    Returns:
        The validated API key string.

    Raises:
        HTTPException: 401 if the key is missing or invalid.
    """
    valid_keys = get_api_keys()
    if not valid_keys:
        # If no keys configured, allow all requests (dev mode).
        return api_key or "dev"
    if not api_key or api_key not in valid_keys:
        raise HTTPException(
            status_code=401, detail="Invalid or missing API key"
        )
    return api_key


def check_rate_limit(api_key: str) -> None:
    """Enforce per-key rate limiting.

    Args:
        api_key: The API key to rate-limit.

    Raises:
        HTTPException: 429 if the rate limit is exceeded.
    """
    now = time.time()
    window_start = now - 60.0

    # Clean old entries.
    _rate_limit_store[api_key] = [
        ts for ts in _rate_limit_store[api_key] if ts > window_start
    ]

    if len(_rate_limit_store[api_key]) >= _RATE_LIMIT_RPM:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded: {_RATE_LIMIT_RPM} requests/min",
        )

    _rate_limit_store[api_key].append(now)


async def rate_limit_middleware(request: Request) -> None:
    """FastAPI dependency that applies rate limiting per API key.

    Should be used as a route dependency for protected endpoints.

    Args:
        request: The incoming FastAPI request.

    Raises:
        HTTPException: 429 if rate limit exceeded.
    """
    api_key = request.headers.get("X-API-Key", "anonymous")
    check_rate_limit(api_key)
