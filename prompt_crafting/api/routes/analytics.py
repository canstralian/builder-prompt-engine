"""Analytics endpoints for cost, performance, and usage metrics.

Provides aggregated views of execution data for dashboards
and reporting.
"""

from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from prompt_crafting.db.models import Execution, Prompt
from prompt_crafting.db.session import get_db
from prompt_crafting.utils.security import verify_api_key

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get(
    "/cost",
    summary="Cost analysis per category, model, and time range",
)
async def get_cost_analytics(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: AsyncSession = Depends(get_db),
    _api_key: str = Depends(verify_api_key),
) -> dict[str, Any]:
    """Aggregate cost data by category and model.

    Args:
        start_date: Optional start of time range filter.
        end_date: Optional end of time range filter.
        db: Async database session.
        _api_key: Validated API key.

    Returns:
        Dictionary with cost breakdowns by category and model.
    """
    base_query = select(
        Prompt.category,
        Execution.model_name,
        func.sum(Execution.cost_usd).label("total_cost"),
        func.count(Execution.id).label("execution_count"),
    ).join(Prompt, Execution.prompt_id == Prompt.id)

    if start_date:
        base_query = base_query.where(
            Execution.created_at >= start_date
        )
    if end_date:
        base_query = base_query.where(Execution.created_at <= end_date)

    base_query = base_query.group_by(
        Prompt.category, Execution.model_name
    )
    result = await db.execute(base_query)
    rows = result.all()

    by_category: dict[str, float] = {}
    by_model: dict[str, float] = {}
    total_cost = Decimal("0")

    for row in rows:
        cat = row.category or "uncategorized"
        model = row.model_name or "unknown"
        cost = float(row.total_cost or 0)

        by_category[cat] = by_category.get(cat, 0.0) + cost
        by_model[model] = by_model.get(model, 0.0) + cost
        total_cost += Decimal(str(cost))

    return {
        "total_cost_usd": float(total_cost),
        "by_category": by_category,
        "by_model": by_model,
        "execution_count": sum(r.execution_count for r in rows),
    }


@router.get(
    "/performance",
    summary="Latency percentiles (p50/p95/p99) by prompt",
)
async def get_performance_analytics(
    db: AsyncSession = Depends(get_db),
    _api_key: str = Depends(verify_api_key),
) -> dict[str, Any]:
    """Calculate latency percentiles grouped by prompt name.

    Args:
        db: Async database session.
        _api_key: Validated API key.

    Returns:
        Dictionary with per-prompt latency percentiles.
    """
    stmt = (
        select(
            Prompt.name,
            func.percentile_cont(0.5)
            .within_group(Execution.execution_time_ms)
            .label("p50"),
            func.percentile_cont(0.95)
            .within_group(Execution.execution_time_ms)
            .label("p95"),
            func.percentile_cont(0.99)
            .within_group(Execution.execution_time_ms)
            .label("p99"),
            func.count(Execution.id).label("sample_count"),
        )
        .join(Prompt, Execution.prompt_id == Prompt.id)
        .group_by(Prompt.name)
    )
    result = await db.execute(stmt)
    rows = result.all()

    return {
        "by_prompt": [
            {
                "prompt_name": row.name,
                "p50_ms": float(row.p50) if row.p50 else 0,
                "p95_ms": float(row.p95) if row.p95 else 0,
                "p99_ms": float(row.p99) if row.p99 else 0,
                "sample_count": row.sample_count,
            }
            for row in rows
        ]
    }


@router.get(
    "/usage",
    summary="Token consumption trends over time",
)
async def get_usage_analytics(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: AsyncSession = Depends(get_db),
    _api_key: str = Depends(verify_api_key),
) -> dict[str, Any]:
    """Aggregate token usage data grouped by date.

    Args:
        start_date: Optional start of time range filter.
        end_date: Optional end of time range filter.
        db: Async database session.
        _api_key: Validated API key.

    Returns:
        Dictionary with daily token consumption data.
    """
    stmt = select(
        func.date_trunc("day", Execution.created_at).label("day"),
        func.sum(Execution.tokens_used).label("total_tokens"),
        func.sum(Execution.cost_usd).label("total_cost"),
        func.count(Execution.id).label("execution_count"),
    )

    if start_date:
        stmt = stmt.where(Execution.created_at >= start_date)
    if end_date:
        stmt = stmt.where(Execution.created_at <= end_date)

    stmt = stmt.group_by(
        func.date_trunc("day", Execution.created_at)
    ).order_by(func.date_trunc("day", Execution.created_at))

    result = await db.execute(stmt)
    rows = result.all()

    return {
        "daily_usage": [
            {
                "date": row.day.isoformat() if row.day else None,
                "total_tokens": int(row.total_tokens or 0),
                "total_cost_usd": float(row.total_cost or 0),
                "execution_count": row.execution_count,
            }
            for row in rows
        ]
    }
