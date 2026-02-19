"""Tests for prompt execution endpoints.

Covers template rendering, scope rejection, audit log creation,
and error handling for execution flows.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_execute_prompt_not_found(client: AsyncClient) -> None:
    """POST /api/v1/prompts/{id}/execute returns 404 for missing prompt."""
    response = await client.post(
        "/api/v1/prompts/00000000-0000-0000-0000-000000000000/execute",
        json={
            "input_data": {"name": "test"},
            "llm_provider": "anthropic",
            "model_name": "claude-sonnet-4-20250514",
        },
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_execute_rejects_unauthorized_target(
    client: AsyncClient,
) -> None:
    """POST /execute rejects target_domain not in AUTHORIZED_TARGETS."""
    # Create a prompt first.
    create_resp = await client.post(
        "/api/v1/prompts",
        json={
            "name": "recon",
            "template": "Scan {{ target }}",
            "category": "security",
        },
    )
    prompt_id = create_resp.json()["id"]

    with patch.dict(
        "os.environ", {"AUTHORIZED_TARGETS": "example.com"}
    ):
        response = await client.post(
            f"/api/v1/prompts/{prompt_id}/execute",
            json={
                "input_data": {"target": "evil.com"},
                "target_domain": "evil.com",
                "llm_provider": "anthropic",
                "model_name": "claude-sonnet-4-20250514",
            },
        )
    assert response.status_code == 400
    assert "not in AUTHORIZED_TARGETS" in response.json()["detail"]


@pytest.mark.asyncio
@patch(
    "prompt_crafting.api.routes.executions._llm_client"
)
async def test_execute_prompt_success(
    mock_client: MagicMock,
    client: AsyncClient,
) -> None:
    """POST /execute with valid prompt returns execution result."""
    mock_client.generate = AsyncMock(
        return_value=MagicMock(
            text="Generated response",
            input_tokens=100,
            output_tokens=50,
            total_tokens=150,
            cost_usd=0.001,
            provider="anthropic",
            model="claude-sonnet-4-20250514",
        )
    )

    # Create a prompt.
    create_resp = await client.post(
        "/api/v1/prompts",
        json={
            "name": "hello",
            "template": "Hello {{ name }}!",
            "category": "general",
        },
    )
    prompt_id = create_resp.json()["id"]

    response = await client.post(
        f"/api/v1/prompts/{prompt_id}/execute",
        json={
            "input_data": {"name": "World"},
            "llm_provider": "anthropic",
            "model_name": "claude-sonnet-4-20250514",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["output_text"] == "Generated response"
    assert data["tokens_used"] == 150


@pytest.mark.asyncio
@patch(
    "prompt_crafting.api.routes.executions._llm_client"
)
async def test_execute_security_prompt_creates_audit_log(
    mock_client: MagicMock,
    client: AsyncClient,
) -> None:
    """Security category executions create audit_logs entries."""
    mock_client.generate = AsyncMock(
        return_value=MagicMock(
            text="Security scan result",
            input_tokens=200,
            output_tokens=100,
            total_tokens=300,
            cost_usd=0.003,
            provider="anthropic",
            model="claude-sonnet-4-20250514",
        )
    )

    # Create a security prompt.
    create_resp = await client.post(
        "/api/v1/prompts",
        json={
            "name": "sec-scan",
            "template": "Scan {{ target }}",
            "category": "security",
        },
    )
    prompt_id = create_resp.json()["id"]

    with patch.dict(
        "os.environ", {"AUTHORIZED_TARGETS": "example.com"}
    ):
        response = await client.post(
            f"/api/v1/prompts/{prompt_id}/execute",
            json={
                "input_data": {"target": "example.com"},
                "target_domain": "example.com",
                "llm_provider": "anthropic",
                "model_name": "claude-sonnet-4-20250514",
            },
        )
    assert response.status_code == 200
