"""Pydantic models for audit log operations.

Request and response schemas for audit-related endpoints.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class AuditLogResponse(BaseModel):
    """Schema for audit log entries returned to clients.

    Attributes:
        id: Auto-incremented audit log ID.
        execution_id: Related execution UUID.
        action: Description of the audited action.
        target: Target resource or domain.
        result_summary: Brief outcome summary.
        risk_level: Risk assessment (low, medium, high, critical).
        created_at: Timestamp of the log entry.
    """

    id: int
    execution_id: Optional[str] = None
    action: Optional[str] = None
    target: Optional[str] = None
    result_summary: Optional[str] = None
    risk_level: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class CTFReconRequest(BaseModel):
    """Schema for CTF reconnaissance workflow requests.

    Attributes:
        targets: List of target domains (max 5).
        workflow_steps: Optional list of recon steps to execute.
    """

    targets: list[str] = Field(..., max_length=5)
    workflow_steps: Optional[list[str]] = Field(
        default=["subdomain_enum", "port_scan", "vuln_prioritization"]
    )
