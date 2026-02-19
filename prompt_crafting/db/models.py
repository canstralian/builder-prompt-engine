"""SQLAlchemy ORM models mirroring the target PostgreSQL schema.

Tables:
    - prompts: Versioned prompt templates with Jinja2 content.
    - executions: LLM execution results linked to prompts.
    - audit_logs: Security audit trail linked to executions.

Note:
    ORM uses dialect-agnostic types (JSON, String for UUIDs) so tests
    can run on SQLite. The Alembic migration creates the actual
    PostgreSQL-specific types (JSONB, UUID) in production.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    BigInteger,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    JSON,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""

    pass


def _new_uuid() -> str:
    """Generate a new UUID4 string.

    Returns:
        A UUID4 as a string.
    """
    return str(uuid.uuid4())


class Prompt(Base):
    """Versioned prompt template.

    Attributes:
        id: Unique identifier (UUID stored as string).
        name: Human-readable prompt name.
        template: Jinja2 template content.
        version: Auto-incremented version number.
        category: Optional category for filtering.
        parameters: JSON schema describing template variables.
        created_at: Timestamp of creation.
        updated_at: Timestamp of last modification.
    """

    __tablename__ = "prompts"

    id = Column(String(36), primary_key=True, default=_new_uuid)
    name = Column(String(255), nullable=False)
    template = Column(Text, nullable=False)
    version = Column(Integer, nullable=False)
    category = Column(String(100), nullable=True)
    parameters = Column(JSON, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    executions = relationship("Execution", back_populates="prompt")

    __table_args__ = (
        UniqueConstraint(
            "name", "version", name="uq_prompts_name_version"
        ),
        Index("idx_prompts_category", "category"),
    )


class Execution(Base):
    """Record of a single prompt execution against an LLM.

    Attributes:
        id: Unique identifier (UUID stored as string).
        prompt_id: Foreign key to the prompt used.
        input_data: JSON of template variable values.
        output_text: Raw LLM response text.
        tokens_used: Total token count for the call.
        cost_usd: Calculated cost in USD.
        execution_time_ms: Wall-clock latency in milliseconds.
        llm_provider: Provider name (e.g. "anthropic", "openai").
        model_name: Specific model identifier.
        created_at: Timestamp of execution.
    """

    __tablename__ = "executions"

    id = Column(String(36), primary_key=True, default=_new_uuid)
    prompt_id = Column(
        String(36), ForeignKey("prompts.id"), nullable=True
    )
    input_data = Column(JSON, nullable=False)
    output_text = Column(Text, nullable=True)
    tokens_used = Column(Integer, nullable=True)
    cost_usd = Column(Numeric(10, 6), nullable=True)
    execution_time_ms = Column(Integer, nullable=True)
    llm_provider = Column(String(50), nullable=True)
    model_name = Column(String(100), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    prompt = relationship("Prompt", back_populates="executions")
    audit_logs = relationship(
        "AuditLog", back_populates="execution"
    )

    __table_args__ = (
        Index("idx_executions_prompt_id", "prompt_id"),
        Index("idx_executions_created_at", "created_at"),
    )


class AuditLog(Base):
    """Security audit log entry tied to an execution.

    Attributes:
        id: Auto-incrementing primary key.
        execution_id: Foreign key to the related execution.
        action: Description of the action performed.
        target: Target resource or domain.
        result_summary: Brief summary of the outcome.
        risk_level: Assessed risk (low, medium, high, critical).
        created_at: Timestamp of the log entry.
    """

    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    execution_id = Column(
        String(36), ForeignKey("executions.id"), nullable=True
    )
    action = Column(String(100), nullable=True)
    target = Column(String(255), nullable=True)
    result_summary = Column(Text, nullable=True)
    risk_level = Column(String(20), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    execution = relationship(
        "Execution", back_populates="audit_logs"
    )

    __table_args__ = (
        Index("idx_audit_logs_execution_id", "execution_id"),
    )
