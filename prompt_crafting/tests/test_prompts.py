"""Tests for prompt CRUD operations.

Covers creation, listing, retrieval, version auto-increment on update,
category filtering, and deletion.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_prompt(client: AsyncClient) -> None:
    """POST /api/v1/prompts creates a new prompt at version 1."""
    response = await client.post(
        "/api/v1/prompts",
        json={
            "name": "greeting",
            "template": "Hello {{ name }}!",
            "category": "general",
            "parameters": {"name": {"type": "string"}},
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "greeting"
    assert data["version"] == 1
    assert data["category"] == "general"
    assert "id" in data


@pytest.mark.asyncio
async def test_list_prompts(client: AsyncClient) -> None:
    """GET /api/v1/prompts returns all prompts."""
    # Create two prompts.
    await client.post(
        "/api/v1/prompts",
        json={"name": "p1", "template": "T1"},
    )
    await client.post(
        "/api/v1/prompts",
        json={"name": "p2", "template": "T2"},
    )

    response = await client.get("/api/v1/prompts")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


@pytest.mark.asyncio
async def test_list_prompts_filter_by_category(
    client: AsyncClient,
) -> None:
    """GET /api/v1/prompts?category=security filters results."""
    await client.post(
        "/api/v1/prompts",
        json={
            "name": "sec1",
            "template": "T1",
            "category": "security",
        },
    )
    await client.post(
        "/api/v1/prompts",
        json={
            "name": "gen1",
            "template": "T2",
            "category": "general",
        },
    )

    response = await client.get(
        "/api/v1/prompts", params={"category": "security"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["category"] == "security"


@pytest.mark.asyncio
async def test_get_prompt_by_id(client: AsyncClient) -> None:
    """GET /api/v1/prompts/{id} returns a single prompt."""
    create_resp = await client.post(
        "/api/v1/prompts",
        json={"name": "test", "template": "Hello"},
    )
    prompt_id = create_resp.json()["id"]

    response = await client.get(f"/api/v1/prompts/{prompt_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "test"


@pytest.mark.asyncio
async def test_get_prompt_not_found(client: AsyncClient) -> None:
    """GET /api/v1/prompts/{id} returns 404 for non-existent ID."""
    response = await client.get(
        "/api/v1/prompts/00000000-0000-0000-0000-000000000000"
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_prompt_creates_new_version(
    client: AsyncClient,
) -> None:
    """PUT /api/v1/prompts/{id} creates version 2, not mutation."""
    create_resp = await client.post(
        "/api/v1/prompts",
        json={"name": "versioned", "template": "V1"},
    )
    prompt_id = create_resp.json()["id"]

    update_resp = await client.put(
        f"/api/v1/prompts/{prompt_id}",
        json={"template": "V2"},
    )
    assert update_resp.status_code == 200
    updated = update_resp.json()
    assert updated["version"] == 2
    assert updated["template"] == "V2"
    assert updated["name"] == "versioned"

    # Original version should still exist.
    original_resp = await client.get(f"/api/v1/prompts/{prompt_id}")
    assert original_resp.status_code == 200
    assert original_resp.json()["version"] == 1


@pytest.mark.asyncio
async def test_delete_prompt(client: AsyncClient) -> None:
    """DELETE /api/v1/prompts/{id} removes the prompt."""
    create_resp = await client.post(
        "/api/v1/prompts",
        json={"name": "deleteme", "template": "Gone"},
    )
    prompt_id = create_resp.json()["id"]

    delete_resp = await client.delete(f"/api/v1/prompts/{prompt_id}")
    assert delete_resp.status_code == 204

    get_resp = await client.get(f"/api/v1/prompts/{prompt_id}")
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_delete_prompt_not_found(client: AsyncClient) -> None:
    """DELETE /api/v1/prompts/{id} returns 404 for non-existent ID."""
    response = await client.delete(
        "/api/v1/prompts/00000000-0000-0000-0000-000000000000"
    )
    assert response.status_code == 404
