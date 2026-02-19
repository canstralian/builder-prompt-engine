"""Tests for the unified LLM client.

Covers cost calculation, provider validation, and response parsing.
All API calls are mocked — no real LLM requests.
"""

import pytest

from prompt_crafting.api.services.llm_client import (
    LLMClient,
    calculate_cost,
)


class TestCalculateCost:
    """Tests for per-provider token cost calculation."""

    def test_anthropic_sonnet_cost(self) -> None:
        """Anthropic claude-sonnet-4-20250514 cost is calculated correctly."""
        cost = calculate_cost(
            "anthropic", "claude-sonnet-4-20250514", 1000, 500
        )
        # 1000/1000 * 0.003 + 500/1000 * 0.015 = 0.003 + 0.0075 = 0.0105
        assert abs(cost - 0.0105) < 1e-6

    def test_openai_gpt4_cost(self) -> None:
        """OpenAI gpt-4 cost is calculated correctly."""
        cost = calculate_cost("openai", "gpt-4", 1000, 1000)
        # 1000/1000 * 0.03 + 1000/1000 * 0.06 = 0.03 + 0.06 = 0.09
        assert abs(cost - 0.09) < 1e-6

    def test_unknown_model_returns_zero(self) -> None:
        """Unknown model returns zero cost."""
        cost = calculate_cost("anthropic", "unknown-model", 1000, 500)
        assert cost == 0.0

    def test_unknown_provider_returns_zero(self) -> None:
        """Unknown provider returns zero cost."""
        cost = calculate_cost("unknown", "gpt-4", 1000, 500)
        assert cost == 0.0

    def test_zero_tokens_returns_zero(self) -> None:
        """Zero tokens returns zero cost."""
        cost = calculate_cost(
            "anthropic", "claude-sonnet-4-20250514", 0, 0
        )
        assert cost == 0.0


class TestLLMClient:
    """Tests for the LLM client class."""

    @pytest.mark.asyncio
    async def test_unsupported_provider_raises(self) -> None:
        """Unsupported provider raises ValueError."""
        client = LLMClient()
        with pytest.raises(ValueError, match="Unsupported"):
            await client.generate(
                prompt="test", provider="unsupported"
            )
        await client.close()

    @pytest.mark.asyncio
    async def test_client_close(self) -> None:
        """Client can be closed without error."""
        client = LLMClient(timeout=5.0)
        await client.close()
