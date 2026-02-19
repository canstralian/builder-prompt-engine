"""CRUD endpoints for prompt templates.

Supports creating, reading, updating (with version auto-increment),
deleting, and filtering prompts by category.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from prompt_crafting.api.models.prompt import (
    PromptCreate,
    PromptResponse,
    PromptUpdate,
)
from prompt_crafting.db.models import Prompt
from prompt_crafting.db.session import get_db
from prompt_crafting.utils.security import verify_api_key

router = APIRouter(prefix="/prompts", tags=["prompts"])


@router.post(
    "",
    response_model=PromptResponse,
    status_code=201,
    summary="Create a new prompt template",
)
async def create_prompt(
    body: PromptCreate,
    db: AsyncSession = Depends(get_db),
    _api_key: str = Depends(verify_api_key),
) -> Prompt:
    """Create a new prompt template at version 1.

    Args:
        body: Prompt creation data.
        db: Async database session.
        _api_key: Validated API key.

    Returns:
        The newly created Prompt record.
    """
    prompt = Prompt(
        name=body.name,
        template=body.template,
        version=1,
        category=body.category,
        parameters=body.parameters,
    )
    db.add(prompt)
    await db.flush()
    await db.refresh(prompt)
    return prompt


@router.get(
    "",
    response_model=list[PromptResponse],
    summary="List all prompts, optionally filtered by category",
)
async def list_prompts(
    category: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    _api_key: str = Depends(verify_api_key),
) -> list[Prompt]:
    """Retrieve all prompts with optional category filtering.

    Args:
        category: Optional category to filter by.
        db: Async database session.
        _api_key: Validated API key.

    Returns:
        List of matching Prompt records.
    """
    stmt = select(Prompt).order_by(Prompt.created_at.desc())
    if category:
        stmt = stmt.where(Prompt.category == category)
    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.get(
    "/{prompt_id}",
    response_model=PromptResponse,
    summary="Get a single prompt by ID",
)
async def get_prompt(
    prompt_id: str,
    db: AsyncSession = Depends(get_db),
    _api_key: str = Depends(verify_api_key),
) -> Prompt:
    """Retrieve a prompt by its UUID.

    Args:
        prompt_id: The prompt's unique identifier.
        db: Async database session.
        _api_key: Validated API key.

    Returns:
        The matching Prompt record.

    Raises:
        HTTPException: 404 if prompt not found.
    """
    result = await db.execute(
        select(Prompt).where(Prompt.id == prompt_id)
    )
    prompt = result.scalar_one_or_none()
    if prompt is None:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return prompt


@router.put(
    "/{prompt_id}",
    response_model=PromptResponse,
    summary="Update a prompt (creates a new version)",
)
async def update_prompt(
    prompt_id: str,
    body: PromptUpdate,
    db: AsyncSession = Depends(get_db),
    _api_key: str = Depends(verify_api_key),
) -> Prompt:
    """Update a prompt by creating a new version (immutable versioning).

    Fetches the current max version for the prompt name and creates
    a new record with version + 1.

    Args:
        prompt_id: The prompt's unique identifier.
        body: Fields to update.
        db: Async database session.
        _api_key: Validated API key.

    Returns:
        The newly created Prompt version.

    Raises:
        HTTPException: 404 if the original prompt not found.
    """
    result = await db.execute(
        select(Prompt).where(Prompt.id == prompt_id)
    )
    existing = result.scalar_one_or_none()
    if existing is None:
        raise HTTPException(status_code=404, detail="Prompt not found")

    # Find the max version for this prompt name.
    max_version_result = await db.execute(
        select(func.max(Prompt.version)).where(
            Prompt.name == existing.name
        )
    )
    max_version = max_version_result.scalar() or 0

    new_prompt = Prompt(
        name=existing.name,
        template=body.template or existing.template,
        version=max_version + 1,
        category=(
            body.category
            if body.category is not None
            else existing.category
        ),
        parameters=(
            body.parameters
            if body.parameters is not None
            else existing.parameters
        ),
    )
    db.add(new_prompt)
    await db.flush()
    await db.refresh(new_prompt)
    return new_prompt


@router.delete(
    "/{prompt_id}",
    status_code=204,
    summary="Delete a prompt",
)
async def delete_prompt(
    prompt_id: str,
    db: AsyncSession = Depends(get_db),
    _api_key: str = Depends(verify_api_key),
) -> None:
    """Delete a prompt by its UUID.

    Args:
        prompt_id: The prompt's unique identifier.
        db: Async database session.
        _api_key: Validated API key.

    Raises:
        HTTPException: 404 if prompt not found.
    """
    result = await db.execute(
        select(Prompt).where(Prompt.id == prompt_id)
    )
    prompt = result.scalar_one_or_none()
    if prompt is None:
        raise HTTPException(status_code=404, detail="Prompt not found")
    await db.delete(prompt)
