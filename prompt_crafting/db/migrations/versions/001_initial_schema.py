"""Initial schema: prompts, executions, audit_logs tables.

Revision ID: 001
Revises: None
Create Date: 2026-02-11
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB, UUID

# Revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create prompts, executions, and audit_logs tables with indexes."""
    # Prompts table.
    op.create_table(
        "prompts",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("template", sa.Text, nullable=False),
        sa.Column("version", sa.Integer, nullable=False),
        sa.Column("category", sa.String(100), nullable=True),
        sa.Column("parameters", JSONB, nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
        ),
        sa.UniqueConstraint("name", "version", name="uq_prompts_name_version"),
    )
    op.create_index("idx_prompts_category", "prompts", ["category"])

    # Executions table.
    op.create_table(
        "executions",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "prompt_id",
            UUID(as_uuid=True),
            sa.ForeignKey("prompts.id"),
            nullable=True,
        ),
        sa.Column("input_data", JSONB, nullable=False),
        sa.Column("output_text", sa.Text, nullable=True),
        sa.Column("tokens_used", sa.Integer, nullable=True),
        sa.Column(
            "cost_usd", sa.Numeric(10, 6), nullable=True
        ),
        sa.Column("execution_time_ms", sa.Integer, nullable=True),
        sa.Column("llm_provider", sa.String(50), nullable=True),
        sa.Column("model_name", sa.String(100), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
        ),
    )
    op.create_index(
        "idx_executions_prompt_id", "executions", ["prompt_id"]
    )
    op.create_index(
        "idx_executions_created_at", "executions", ["created_at"]
    )

    # Audit logs table.
    op.create_table(
        "audit_logs",
        sa.Column(
            "id",
            sa.BigInteger,
            primary_key=True,
            autoincrement=True,
        ),
        sa.Column(
            "execution_id",
            UUID(as_uuid=True),
            sa.ForeignKey("executions.id"),
            nullable=True,
        ),
        sa.Column("action", sa.String(100), nullable=True),
        sa.Column("target", sa.String(255), nullable=True),
        sa.Column("result_summary", sa.Text, nullable=True),
        sa.Column("risk_level", sa.String(20), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
        ),
    )
    op.create_index(
        "idx_audit_logs_execution_id", "audit_logs", ["execution_id"]
    )


def downgrade() -> None:
    """Drop audit_logs, executions, and prompts tables."""
    op.drop_table("audit_logs")
    op.drop_table("executions")
    op.drop_table("prompts")
