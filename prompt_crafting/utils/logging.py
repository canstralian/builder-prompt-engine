"""Structured logging with per-execution directory output.

Creates a directory per execution run with structured JSON files
for request, response, audit, and metrics data. Also provides
structured JSON logging to stdout for container environments.
"""

import json
import logging
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

_BASE_LOG_DIR = os.getenv("LOG_DIR", "logs/executions")


def _get_json_logger() -> logging.Logger:
    """Create or retrieve the structured JSON logger for stdout.

    Returns:
        A configured logging.Logger instance with JSON formatting.
    """
    logger = logging.getLogger("prompt_crafting")
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(
            logging.Formatter(
                '{"timestamp": "%(asctime)s", "level": "%(levelname)s", '
                '"module": "%(module)s", "message": "%(message)s"}'
            )
        )
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger


logger = _get_json_logger()


def create_execution_log_dir() -> Path:
    """Create a timestamped directory for a single execution run.

    Returns:
        Path to the newly created directory.
    """
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d_%H%M%S")
    log_dir = Path(_BASE_LOG_DIR) / timestamp
    log_dir.mkdir(parents=True, exist_ok=True)
    return log_dir


def write_request_log(log_dir: Path, data: dict[str, Any]) -> None:
    """Write the execution request data to request.json.

    Args:
        log_dir: Path to the execution log directory.
        data: Request data dictionary.
    """
    (log_dir / "request.json").write_text(
        json.dumps(data, indent=2, default=str), encoding="utf-8"
    )


def write_rendered_prompt(log_dir: Path, prompt: str) -> None:
    """Write the rendered prompt text to rendered_prompt.txt.

    Args:
        log_dir: Path to the execution log directory.
        prompt: Rendered prompt string.
    """
    (log_dir / "rendered_prompt.txt").write_text(
        prompt, encoding="utf-8"
    )


def write_response_log(log_dir: Path, data: dict[str, Any]) -> None:
    """Write the LLM response data to response.json.

    Args:
        log_dir: Path to the execution log directory.
        data: Response data dictionary.
    """
    (log_dir / "response.json").write_text(
        json.dumps(data, indent=2, default=str), encoding="utf-8"
    )


def write_audit_log(log_dir: Path, data: dict[str, Any]) -> None:
    """Write an audit log entry to audit.log.

    Args:
        log_dir: Path to the execution log directory.
        data: Audit data dictionary.
    """
    (log_dir / "audit.log").write_text(
        json.dumps(data, indent=2, default=str), encoding="utf-8"
    )


def write_metrics_log(log_dir: Path, data: dict[str, Any]) -> None:
    """Write execution metrics to metrics.json.

    Args:
        log_dir: Path to the execution log directory.
        data: Metrics data dictionary.
    """
    (log_dir / "metrics.json").write_text(
        json.dumps(data, indent=2, default=str), encoding="utf-8"
    )
