"""Pytest fixtures for async database sessions and test client.

Provides an isolated test database session and a FastAPI test client
configured with dependency overrides.
"""

from collections.abc import AsyncGenerator
from unittest.mock import AsyncMock, MagicMock

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import StaticPool

from prompt_crafting.db.models import Base
from prompt_crafting.db.session import get_db
from prompt_crafting.main import app

# In-memory SQLite with StaticPool so all connections share one DB.
test_engine = create_async_engine(
    "sqlite+aiosqlite://",
    echo=False,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

test_session_factory = async_sessionmaker(
    test_engine, class_=AsyncSession, expire_on_commit=False
)


@pytest_asyncio.fixture(autouse=True)
async def setup_database() -> AsyncGenerator[None, None]:
    """Create and drop all tables for each test."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide a transactional test database session.

    Yields:
        AsyncSession: An isolated database session for testing.
    """
    async with test_session_factory() as session:
        yield session


@pytest_asyncio.fixture
async def client(
    db_session: AsyncSession,
) -> AsyncGenerator[AsyncClient, None]:
    """Provide an async HTTP test client with DB dependency override.

    Args:
        db_session: The test database session fixture.

    Yields:
        AsyncClient: An httpx client pointing at the test app.
    """

    async def _override_get_db() -> AsyncGenerator[AsyncSession, None]:
        try:
            yield db_session
            await db_session.commit()
        except Exception:
            await db_session.rollback()
            raise

    app.dependency_overrides[get_db] = _override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport, base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
def mock_llm_client() -> MagicMock:
    """Provide a mocked LLM client that returns canned responses.

    Returns:
        MagicMock: A mock LLM client with a generate method.
    """
    mock = MagicMock()
    mock.generate = AsyncMock(
        return_value=MagicMock(
            text="Mock LLM response",
            input_tokens=100,
            output_tokens=50,
            total_tokens=150,
            cost_usd=0.001,
            provider="anthropic",
            model="claude-sonnet-4-20250514",
        )
    )
    return mock
