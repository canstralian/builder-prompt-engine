"""Endpoints for executing prompts against LLM providers.

Handles template rendering, scope validation, LLM API calls,
result persistence, and per-execution structured logging.
"""

import time

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from prompt_crafting.api.models.execution import (
    ExecutionRequest,
    ExecutionResponse,
)
from prompt_crafting.api.services.llm_client import LLMClient
from prompt_crafting.api.services.prompt_engine import render_template
from prompt_crafting.api.services.validator import is_target_authorized
from prompt_crafting.db.models import AuditLog, Execution, Prompt
from prompt_crafting.db.session import get_db
from prompt_crafting.utils.logging import (
    create_execution_log_dir,
    logger,
    write_metrics_log,
    write_rendered_prompt,
    write_request_log,
    write_response_log,
)
from prompt_crafting.utils.security import verify_api_key

router = APIRouter(prefix="/prompts", tags=["executions"])

_llm_client = LLMClient()


@router.post(
    "/{prompt_id}/execute",
    response_model=ExecutionResponse,
    summary="Execute a prompt against an LLM",
)
async def execute_prompt(
    prompt_id: str,
    body: ExecutionRequest,
    db: AsyncSession = Depends(get_db),
    _api_key: str = Depends(verify_api_key),
) -> Execution:
    """Render a Jinja2 template, call the LLM, and persist the result.

    Validates target_domain against AUTHORIZED_TARGETS if provided.
    Creates structured log files per execution.

    Args:
        prompt_id: UUID of the prompt to execute.
        body: Execution request data with input variables.
        db: Async database session.
        _api_key: Validated API key.

    Returns:
        The persisted Execution record.

    Raises:
        HTTPException: 404 if prompt not found, 400 if scope violation
            or template error.
    """
    # Fetch prompt.
    result = await db.execute(
        select(Prompt).where(Prompt.id == prompt_id)
    )
    prompt = result.scalar_one_or_none()
    if prompt is None:
        raise HTTPException(status_code=404, detail="Prompt not found")

    # Scope validation for security prompts.
    if body.target_domain:
        if not is_target_authorized(body.target_domain):
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Target domain '{body.target_domain}' is not in "
                    "AUTHORIZED_TARGETS"
                ),
            )

    # Create log directory.
    log_dir = create_execution_log_dir()
    write_request_log(
        log_dir,
        {
            "prompt_id": str(prompt_id),
            "input_data": body.input_data,
            "llm_provider": body.llm_provider,
            "model_name": body.model_name,
            "target_domain": body.target_domain,
        },
    )

    # Render template.
    try:
        defaults = prompt.parameters or {}
        rendered = render_template(
            prompt.template, body.input_data, defaults=defaults
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    write_rendered_prompt(log_dir, rendered)

    # Call LLM.
    start_ms = time.monotonic()
    try:
        llm_response = await _llm_client.generate(
            prompt=rendered,
            provider=body.llm_provider,
            model=body.model_name,
        )
    except Exception as exc:
        logger.error("LLM call failed: %s", exc)
        raise HTTPException(
            status_code=502, detail=f"LLM call failed: {exc}"
        )
    elapsed_ms = int((time.monotonic() - start_ms) * 1000)

    write_response_log(
        log_dir,
        {
            "text": llm_response.text,
            "tokens": llm_response.total_tokens,
            "cost_usd": llm_response.cost_usd,
            "provider": llm_response.provider,
            "model": llm_response.model,
        },
    )

    # Persist execution.
    execution = Execution(
        prompt_id=prompt_id,
        input_data=body.input_data,
        output_text=llm_response.text,
        tokens_used=llm_response.total_tokens,
        cost_usd=llm_response.cost_usd,
        execution_time_ms=elapsed_ms,
        llm_provider=llm_response.provider,
        model_name=llm_response.model,
    )
    db.add(execution)
    await db.flush()
    await db.refresh(execution)

    # Create audit log for security-category prompts.
    if prompt.category and prompt.category.lower() == "security":
        audit_entry = AuditLog(
            execution_id=execution.id,
            action="prompt_execution",
            target=body.target_domain or "N/A",
            result_summary=llm_response.text[:500],
            risk_level="medium",
        )
        db.add(audit_entry)

    write_metrics_log(
        log_dir,
        {
            "execution_id": str(execution.id),
            "tokens_used": llm_response.total_tokens,
            "cost_usd": float(llm_response.cost_usd),
            "execution_time_ms": elapsed_ms,
        },
    )

    logger.info(
        "Execution %s completed: %d tokens, $%.6f, %dms",
        execution.id,
        llm_response.total_tokens,
        llm_response.cost_usd,
        elapsed_ms,
    )

    return execution
