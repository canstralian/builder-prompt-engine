"""Pydantic models for prompt template CRUD operations.

All request and response schemas for the /prompts endpoints.
"""

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class PromptCreate(BaseModel):
    """Schema for creating a new prompt template.

    Attributes:
        name: Human-readable prompt name.
        template: Jinja2 template string.
        category: Optional category for filtering.
        parameters: Optional JSONB schema for template variables.
    """

    name: str = Field(..., max_length=255)
    template: str
    category: Optional[str] = Field(None, max_length=100)
    parameters: Optional[dict[str, Any]] = None


class PromptUpdate(BaseModel):
    """Schema for updating a prompt (creates a new version).

    Attributes:
        template: Updated Jinja2 template string.
        category: Optional updated category.
        parameters: Optional updated parameter schema.
    """

    template: Optional[str] = None
    category: Optional[str] = Field(None, max_length=100)
    parameters: Optional[dict[str, Any]] = None


class PromptResponse(BaseModel):
    """Schema for prompt responses returned to clients.

    Attributes:
        id: Unique prompt identifier.
        name: Prompt name.
        template: Jinja2 template content.
        version: Version number.
        category: Category string.
        parameters: Parameter schema.
        created_at: Creation timestamp.
        updated_at: Last modification timestamp.
    """

    id: str
    name: str
    template: str
    version: int
    category: Optional[str] = None
    parameters: Optional[dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
