"""Tests for security integration endpoints.

Covers CTF recon workflow, target cap enforcement, whitelist
validation, and audit log creation.
"""

from unittest.mock import patch

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_ctf_recon_exceeds_target_cap(
    client: AsyncClient,
) -> None:
    """POST /security/ctf-recon rejects more than 5 targets."""
    response = await client.post(
        "/api/v1/security/ctf-recon",
        json={
            "targets": [f"t{i}.com" for i in range(6)],
        },
    )
    # Pydantic validates max_length=5 before the route handler.
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_ctf_recon_unauthorized_targets(
    client: AsyncClient,
) -> None:
    """POST /security/ctf-recon rejects unauthorized targets."""
    with patch.dict(
        "os.environ", {"AUTHORIZED_TARGETS": "example.com"}
    ):
        response = await client.post(
            "/api/v1/security/ctf-recon",
            json={
                "targets": ["evil.com"],
            },
        )
    assert response.status_code == 400
    assert "not in AUTHORIZED_TARGETS" in response.json()["detail"]


@pytest.mark.asyncio
async def test_ctf_recon_success(client: AsyncClient) -> None:
    """POST /security/ctf-recon succeeds with valid targets."""
    with patch.dict(
        "os.environ",
        {"AUTHORIZED_TARGETS": "example.com,test.local"},
    ):
        response = await client.post(
            "/api/v1/security/ctf-recon",
            json={
                "targets": ["example.com"],
                "workflow_steps": [
                    "subdomain_enum",
                    "port_scan",
                ],
            },
        )
    assert response.status_code == 200
    data = response.json()
    # 1 target * 2 steps = 2 audit entries.
    assert len(data) == 2
    assert data[0]["action"] == "subdomain_enum"
    assert data[0]["target"] == "example.com"
    assert data[0]["risk_level"] == "low"
    assert data[1]["action"] == "port_scan"
    assert data[1]["risk_level"] == "medium"


@pytest.mark.asyncio
async def test_ctf_recon_multiple_targets(
    client: AsyncClient,
) -> None:
    """POST /security/ctf-recon handles multiple targets."""
    with patch.dict(
        "os.environ",
        {"AUTHORIZED_TARGETS": "a.com,b.com"},
    ):
        response = await client.post(
            "/api/v1/security/ctf-recon",
            json={
                "targets": ["a.com", "b.com"],
                "workflow_steps": ["subdomain_enum"],
            },
        )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
