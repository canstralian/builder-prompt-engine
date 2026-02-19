"""Core prompt rendering engine using Jinja2 SandboxedEnvironment.

Provides safe template rendering with validation against dangerous
patterns and default parameter injection for missing optional variables.
"""

import re
from typing import Any, Optional

from jinja2 import TemplateSyntaxError
from jinja2.sandbox import SandboxedEnvironment

# Patterns that indicate unsafe template content.
_FORBIDDEN_PATTERNS: list[re.Pattern[str]] = [
    re.compile(r"\bimport\b"),
    re.compile(r"\bexec\b"),
    re.compile(r"\beval\b"),
    re.compile(r"__\w+__"),
]

_sandbox_env = SandboxedEnvironment(
    autoescape=True,
    keep_trailing_newline=True,
)


def validate_template(template: str) -> list[str]:
    """Check a Jinja2 template for forbidden patterns and syntax errors.

    Args:
        template: Raw Jinja2 template string.

    Returns:
        A list of validation error messages. Empty list means valid.
    """
    errors: list[str] = []
    for pattern in _FORBIDDEN_PATTERNS:
        if pattern.search(template):
            errors.append(
                f"Forbidden pattern detected: '{pattern.pattern}'"
            )
    try:
        _sandbox_env.parse(template)
    except TemplateSyntaxError as exc:
        errors.append(f"Template syntax error: {exc}")
    return errors


def render_template(
    template: str,
    variables: dict[str, Any],
    defaults: Optional[dict[str, Any]] = None,
) -> str:
    """Render a Jinja2 template safely using SandboxedEnvironment.

    Missing optional variables are filled from ``defaults`` if provided.

    Args:
        template: Jinja2 template string.
        variables: Dictionary of variable values to inject.
        defaults: Optional default values for missing variables.

    Returns:
        The rendered template string.

    Raises:
        ValueError: If the template contains forbidden patterns.
        jinja2.TemplateSyntaxError: If the template has syntax errors.
    """
    errors = validate_template(template)
    if errors:
        raise ValueError(
            f"Template validation failed: {'; '.join(errors)}"
        )

    merged: dict[str, Any] = {}
    if defaults:
        merged.update(defaults)
    merged.update(variables)

    jinja_template = _sandbox_env.from_string(template)
    return jinja_template.render(**merged)
