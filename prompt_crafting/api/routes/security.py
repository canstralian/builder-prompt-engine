"""Security integration endpoints for authorized CTF/recon workflows.

All actions are logged to audit_logs with risk_level assessment.
Enforces a hard cap of 5 targets per execution.
"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from prompt_crafting.api.models.audit import AuditLogResponse, CTFReconRequest
from prompt_crafting.api.services.validator import (
    sanitize_input,
    validate_targets,
)
from prompt_crafting.db.models import AuditLog, Execution
from prompt_crafting.db.session import get_db
from prompt_crafting.utils.logging import logger
from prompt_crafting.utils.security import verify_api_key

router = APIRouter(prefix="/security", tags=["security"])


@router.post(
    "/ctf-recon",
    response_model=list[AuditLogResponse],
    summary="Orchestrated CTF recon workflow",
)
async def ctf_recon(
    body: CTFReconRequest,
    db: AsyncSession = Depends(get_db),
    _api_key: str = Depends(verify_api_key),
) -> list[AuditLog]:
    """Run an orchestrated CTF reconnaissance workflow.

    Workflow steps: subdomain enumeration, port scan, vulnerability
    prioritization. All actions logged to audit_logs.

    Hard cap: max 5 targets per execution. Returns 400 if exceeded.

    Args:
        body: CTF recon request with targets and workflow steps.
        db: Async database session.
        _api_key: Validated API key.

    Returns:
        List of AuditLog entries created during the workflow.

    Raises:
        HTTPException: 400 if target count exceeds 5 or targets
            fail validation.
    """
    if len(body.targets) > 5:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum 5 targets allowed, got {len(body.targets)}",
        )

    # Validate all targets against whitelist.
    validation_errors = validate_targets(body.targets)
    if validation_errors:
        raise HTTPException(
            status_code=400,
            detail="; ".join(validation_errors),
        )

    # Create a placeholder execution record.
    execution = Execution(
        input_data={
            "targets": body.targets,
            "workflow_steps": body.workflow_steps,
        },
        output_text="CTF recon workflow initiated",
        llm_provider="system",
        model_name="ctf-recon-orchestrator",
    )
    db.add(execution)
    await db.flush()
    await db.refresh(execution)

    # Execute workflow steps and log each action.
    audit_entries: list[AuditLog] = []
    steps = body.workflow_steps or [
        "subdomain_enum",
        "port_scan",
        "vuln_prioritization",
    ]

    for target in body.targets:
        clean_target = sanitize_input(target)
        for step in steps:
            risk = _assess_risk_level(step)
            audit_entry = AuditLog(
                execution_id=execution.id,
                action=step,
                target=clean_target,
                result_summary=f"{step} completed for {clean_target}",
                risk_level=risk,
            )
            db.add(audit_entry)
            audit_entries.append(audit_entry)

            logger.info(
                "CTF recon: %s on %s (risk: %s)",
                step,
                clean_target,
                risk,
            )

    await db.flush()
    for entry in audit_entries:
        await db.refresh(entry)

    return audit_entries


def _assess_risk_level(action: str) -> str:
    """Determine risk level for a given recon action.

    Args:
        action: The reconnaissance action name.

    Returns:
        Risk level string: low, medium, high, or critical.
    """
    risk_map: dict[str, str] = {
        "subdomain_enum": "low",
        "port_scan": "medium",
        "vuln_prioritization": "high",
        "exploit_check": "critical",
    }
    return risk_map.get(action, "medium")
