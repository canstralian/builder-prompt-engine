"""Input sanitization, scope validation, and safety checks.

Enforces the AUTHORIZED_TARGETS whitelist, strips shell metacharacters,
and validates URLs before they reach business logic.
"""

import os
import re
from urllib.parse import urlparse

# Shell metacharacters that must be stripped from user input.
_SHELL_META_CHARS = re.compile(r"[;&|`$(){}!<>\\\n\r]")


def get_authorized_targets() -> list[str]:
    """Load the authorized target whitelist from environment.

    Returns:
        List of allowed domain strings from AUTHORIZED_TARGETS env var.
    """
    raw = os.getenv("AUTHORIZED_TARGETS", "")
    if not raw.strip():
        return []
    return [t.strip().lower() for t in raw.split(",") if t.strip()]


def is_target_authorized(domain: str) -> bool:
    """Check whether a domain is in the authorized targets whitelist.

    Args:
        domain: Domain string to validate.

    Returns:
        True if the domain is authorized, False otherwise.
    """
    authorized = get_authorized_targets()
    if not authorized:
        return False
    return domain.strip().lower() in authorized


def sanitize_input(value: str) -> str:
    """Strip shell metacharacters from a string.

    Args:
        value: Raw user input string.

    Returns:
        Sanitized string with metacharacters removed.
    """
    return _SHELL_META_CHARS.sub("", value)


def validate_url(url: str) -> bool:
    """Validate that a string is a well-formed HTTP(S) URL.

    Args:
        url: URL string to validate.

    Returns:
        True if the URL is valid HTTP/HTTPS with a hostname.
    """
    try:
        parsed = urlparse(url)
        return parsed.scheme in ("http", "https") and bool(parsed.netloc)
    except Exception:
        return False


def validate_targets(targets: list[str]) -> list[str]:
    """Validate a list of target domains against the whitelist.

    Args:
        targets: List of domain strings to validate.

    Returns:
        List of validation error messages. Empty list means all valid.
    """
    errors: list[str] = []
    if len(targets) > 5:
        errors.append(
            f"Maximum 5 targets allowed, got {len(targets)}"
        )
    authorized = get_authorized_targets()
    for target in targets:
        clean = target.strip().lower()
        if authorized and clean not in authorized:
            errors.append(
                f"Target '{clean}' is not in AUTHORIZED_TARGETS"
            )
    return errors
