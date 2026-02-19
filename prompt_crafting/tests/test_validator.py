"""Tests for input validation, sanitization, and scope enforcement.

Covers shell metacharacter stripping, URL validation, target
whitelist enforcement, and template safety checks.
"""

from unittest.mock import patch

import pytest

from prompt_crafting.api.services.prompt_engine import (
    render_template,
    validate_template,
)
from prompt_crafting.api.services.validator import (
    is_target_authorized,
    sanitize_input,
    validate_targets,
    validate_url,
)


class TestSanitizeInput:
    """Tests for shell metacharacter stripping."""

    def test_strips_semicolons(self) -> None:
        """Semicolons are removed from input."""
        assert sanitize_input("ls; rm -rf /") == "ls rm -rf /"

    def test_strips_pipes(self) -> None:
        """Pipe characters are removed."""
        assert sanitize_input("cat file | grep secret") == (
            "cat file  grep secret"
        )

    def test_strips_backticks(self) -> None:
        """Backtick characters are removed."""
        assert sanitize_input("`whoami`") == "whoami"

    def test_strips_dollar_parens(self) -> None:
        """Dollar signs and parentheses are removed."""
        assert sanitize_input("$(id)") == "id"

    def test_preserves_safe_input(self) -> None:
        """Alphanumeric and safe chars are preserved."""
        safe = "hello-world_123.example.com"
        assert sanitize_input(safe) == safe


class TestValidateUrl:
    """Tests for URL validation."""

    def test_valid_https_url(self) -> None:
        """Valid HTTPS URL returns True."""
        assert validate_url("https://example.com") is True

    def test_valid_http_url(self) -> None:
        """Valid HTTP URL returns True."""
        assert validate_url("http://example.com/path") is True

    def test_invalid_scheme(self) -> None:
        """FTP scheme returns False."""
        assert validate_url("ftp://example.com") is False

    def test_empty_string(self) -> None:
        """Empty string returns False."""
        assert validate_url("") is False

    def test_no_scheme(self) -> None:
        """URL without scheme returns False."""
        assert validate_url("example.com") is False


class TestTargetAuthorization:
    """Tests for AUTHORIZED_TARGETS whitelist enforcement."""

    @patch.dict(
        "os.environ", {"AUTHORIZED_TARGETS": "example.com,test.local"}
    )
    def test_authorized_target(self) -> None:
        """Whitelisted domain returns True."""
        assert is_target_authorized("example.com") is True

    @patch.dict(
        "os.environ", {"AUTHORIZED_TARGETS": "example.com"}
    )
    def test_unauthorized_target(self) -> None:
        """Non-whitelisted domain returns False."""
        assert is_target_authorized("evil.com") is False

    @patch.dict("os.environ", {"AUTHORIZED_TARGETS": ""})
    def test_empty_whitelist(self) -> None:
        """Empty whitelist rejects all targets."""
        assert is_target_authorized("example.com") is False

    @patch.dict(
        "os.environ", {"AUTHORIZED_TARGETS": "example.com,test.local"}
    )
    def test_case_insensitive(self) -> None:
        """Target matching is case-insensitive."""
        assert is_target_authorized("EXAMPLE.COM") is True


class TestValidateTargets:
    """Tests for bulk target validation."""

    @patch.dict(
        "os.environ", {"AUTHORIZED_TARGETS": "example.com"}
    )
    def test_exceeds_max_targets(self) -> None:
        """More than 5 targets returns an error."""
        targets = [f"t{i}.com" for i in range(6)]
        errors = validate_targets(targets)
        assert any("Maximum 5" in e for e in errors)

    @patch.dict(
        "os.environ", {"AUTHORIZED_TARGETS": "example.com"}
    )
    def test_unauthorized_in_batch(self) -> None:
        """Unauthorized target in batch is flagged."""
        errors = validate_targets(["example.com", "evil.com"])
        assert any("evil.com" in e for e in errors)

    @patch.dict(
        "os.environ", {"AUTHORIZED_TARGETS": "a.com,b.com"}
    )
    def test_all_authorized(self) -> None:
        """All authorized targets return no errors."""
        errors = validate_targets(["a.com", "b.com"])
        assert errors == []


class TestTemplateValidation:
    """Tests for Jinja2 template safety checks."""

    def test_valid_template(self) -> None:
        """Clean template passes validation."""
        errors = validate_template("Hello {{ name }}!")
        assert errors == []

    def test_import_blocked(self) -> None:
        """Template with 'import' is rejected."""
        errors = validate_template("{% import os %}")
        assert any("import" in e for e in errors)

    def test_exec_blocked(self) -> None:
        """Template with 'exec' is rejected."""
        errors = validate_template("{{ exec('rm -rf /') }}")
        assert any("exec" in e for e in errors)

    def test_eval_blocked(self) -> None:
        """Template with 'eval' is rejected."""
        errors = validate_template("{{ eval(code) }}")
        assert any("eval" in e for e in errors)

    def test_dunder_blocked(self) -> None:
        """Template with dunder patterns is rejected."""
        errors = validate_template("{{ ''.__class__ }}")
        assert any("__" in e for e in errors)

    def test_syntax_error(self) -> None:
        """Template with syntax error is caught."""
        errors = validate_template("{% if %}")
        assert any("syntax" in e.lower() for e in errors)


class TestTemplateRendering:
    """Tests for safe template rendering."""

    def test_basic_rendering(self) -> None:
        """Variables are injected correctly."""
        result = render_template(
            "Hello {{ name }}!", {"name": "World"}
        )
        assert result == "Hello World!"

    def test_default_injection(self) -> None:
        """Missing variables fall back to defaults."""
        result = render_template(
            "Hello {{ name }}!",
            {},
            defaults={"name": "Default"},
        )
        assert result == "Hello Default!"

    def test_variables_override_defaults(self) -> None:
        """Explicit variables take priority over defaults."""
        result = render_template(
            "Hello {{ name }}!",
            {"name": "Override"},
            defaults={"name": "Default"},
        )
        assert result == "Hello Override!"

    def test_forbidden_template_raises(self) -> None:
        """Template with forbidden patterns raises ValueError."""
        with pytest.raises(ValueError, match="validation failed"):
            render_template("{{ eval('bad') }}", {})
