"""Pydantic models for prompt execution operations.

Request and response schemas for the /prompts/{id}/execute endpoint.
"""

from datetime import datetime
from decimal import Decimal
from typing import Any, Optional

from pydantic import BaseModel, Field


class ExecutionRequest(BaseModel):
    """Schema for requesting a prompt execution.

    Attributes:
        input_data: Dictionary of template variable values.
        llm_provider: LLM provider name (default: anthropic).
        model_name: Model identifier (default: claude-sonnet-4-20250514).
        target_domain: Optional target domain for security prompts.
    """

    input_data: dict[str, Any]
    llm_provider: str = Field(default="anthropic", max_length=50)
    model_name: str = Field(
        default="claude-sonnet-4-20250514", max_length=100
    )
    target_domain: Optional[str] = None


class ExecutionResponse(BaseModel):
    """Schema for execution results returned to clients.

    Attributes:
        id: Unique execution identifier.
        prompt_id: Foreign key to the prompt used.
        input_data: Template variable values used.
        output_text: LLM response text.
        tokens_used: Total token count.
        cost_usd: Calculated cost in USD.
        execution_time_ms: Latency in milliseconds.
        llm_provider: Provider name.
        model_name: Model identifier.
        created_at: Execution timestamp.
    """

    id: str
    prompt_id: Optional[str] = None
    input_data: dict[str, Any]
    output_text: Optional[str] = None
    tokens_used: Optional[int] = None
    cost_usd: Optional[Decimal] = None
    execution_time_ms: Optional[int] = None
    llm_provider: Optional[str] = None
    model_name: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
