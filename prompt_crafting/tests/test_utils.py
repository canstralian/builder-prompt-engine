"""Tests for utility modules: logging and security.

Covers structured logging output, execution log directory creation,
rate limiting, and API key validation.
"""

import os
import time
from pathlib import Path
from unittest.mock import patch

import pytest
from fastapi import HTTPException

from prompt_crafting.utils.logging import (
    create_execution_log_dir,
    write_audit_log,
    write_metrics_log,
    write_rendered_prompt,
    write_request_log,
    write_response_log,
)
from prompt_crafting.utils.security import (
    check_rate_limit,
    get_api_keys,
    verify_api_key,
)


class TestExecutionLogging:
    """Tests for per-execution structured logging."""

    def test_create_log_dir(self, tmp_path: Path) -> None:
        """Log directory is created with timestamp format."""
        with patch(
            "prompt_crafting.utils.logging._BASE_LOG_DIR",
            str(tmp_path),
        ):
            log_dir = create_execution_log_dir()
            assert log_dir.exists()
            assert log_dir.is_dir()

    def test_write_request_log(self, tmp_path: Path) -> None:
        """Request data is written as JSON."""
        write_request_log(tmp_path, {"key": "value"})
        content = (tmp_path / "request.json").read_text()
        assert '"key": "value"' in content

    def test_write_rendered_prompt(self, tmp_path: Path) -> None:
        """Rendered prompt is written as text."""
        write_rendered_prompt(tmp_path, "Hello World")
        content = (tmp_path / "rendered_prompt.txt").read_text()
        assert content == "Hello World"

    def test_write_response_log(self, tmp_path: Path) -> None:
        """Response data is written as JSON."""
        write_response_log(tmp_path, {"text": "response"})
        content = (tmp_path / "response.json").read_text()
        assert '"text": "response"' in content

    def test_write_audit_log(self, tmp_path: Path) -> None:
        """Audit data is written to audit.log."""
        write_audit_log(tmp_path, {"action": "test"})
        content = (tmp_path / "audit.log").read_text()
        assert '"action": "test"' in content

    def test_write_metrics_log(self, tmp_path: Path) -> None:
        """Metrics data is written as JSON."""
        write_metrics_log(tmp_path, {"tokens": 100})
        content = (tmp_path / "metrics.json").read_text()
        assert '"tokens": 100' in content


class TestApiKeyValidation:
    """Tests for API key authentication."""

    @patch.dict("os.environ", {"API_KEYS": "key1,key2"})
    def test_get_api_keys(self) -> None:
        """API keys are loaded from env var."""
        keys = get_api_keys()
        assert keys == ["key1", "key2"]

    @patch.dict("os.environ", {"API_KEYS": ""})
    def test_get_api_keys_empty(self) -> None:
        """Empty env var returns empty list."""
        keys = get_api_keys()
        assert keys == []

    @pytest.mark.asyncio
    @patch.dict("os.environ", {"API_KEYS": "valid-key"})
    async def test_verify_valid_key(self) -> None:
        """Valid API key passes verification."""
        result = await verify_api_key("valid-key")
        assert result == "valid-key"

    @pytest.mark.asyncio
    @patch.dict("os.environ", {"API_KEYS": "valid-key"})
    async def test_verify_invalid_key(self) -> None:
        """Invalid API key raises 401."""
        with pytest.raises(HTTPException) as exc_info:
            await verify_api_key("wrong-key")
        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    @patch.dict("os.environ", {"API_KEYS": "valid-key"})
    async def test_verify_missing_key(self) -> None:
        """Missing API key raises 401."""
        with pytest.raises(HTTPException) as exc_info:
            await verify_api_key(None)
        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    @patch.dict("os.environ", {"API_KEYS": ""})
    async def test_verify_no_keys_configured(self) -> None:
        """No keys configured allows all (dev mode)."""
        result = await verify_api_key(None)
        assert result == "dev"


class TestRateLimiting:
    """Tests for per-key rate limiting."""

    @patch.dict("os.environ", {"RATE_LIMIT_RPM": "3"})
    def test_under_limit_passes(self) -> None:
        """Requests under the limit succeed."""
        # Reset the store.
        from prompt_crafting.utils.security import _rate_limit_store

        _rate_limit_store.clear()
        # These should not raise.
        check_rate_limit("test-key")
        check_rate_limit("test-key")

    def test_over_limit_raises(self) -> None:
        """Exceeding the limit raises 429."""
        from prompt_crafting.utils import security as sec_mod
        from prompt_crafting.utils.security import _rate_limit_store

        _rate_limit_store.clear()
        original = sec_mod._RATE_LIMIT_RPM
        sec_mod._RATE_LIMIT_RPM = 2
        try:
            check_rate_limit("limit-key-2")
            check_rate_limit("limit-key-2")
            with pytest.raises(HTTPException) as exc_info:
                check_rate_limit("limit-key-2")
            assert exc_info.value.status_code == 429
        finally:
            sec_mod._RATE_LIMIT_RPM = original
