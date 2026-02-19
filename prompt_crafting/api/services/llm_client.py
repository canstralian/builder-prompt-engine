"""Unified async LLM API client supporting Claude and GPT providers.

Uses httpx.AsyncClient with connection pooling, retry logic, and
per-provider token counting and cost calculation.
"""

import os
from dataclasses import dataclass
from typing import Any, Optional

import httpx

# Cost per 1K tokens by provider/model (input, output).
_COST_TABLE: dict[str, dict[str, tuple[float, float]]] = {
    "anthropic": {
        "claude-sonnet-4-20250514": (0.003, 0.015),
        "claude-opus-4-20250514": (0.015, 0.075),
        "claude-haiku-35-20241022": (0.00025, 0.00125),
    },
    "openai": {
        "gpt-4": (0.03, 0.06),
        "gpt-4-turbo": (0.01, 0.03),
        "gpt-4o": (0.005, 0.015),
    },
}

_DEFAULT_TIMEOUT: float = float(os.getenv("LLM_TIMEOUT", "30"))
_MAX_RETRIES: int = 3


@dataclass
class LLMResponse:
    """Structured response from an LLM API call.

    Attributes:
        text: Generated response text.
        input_tokens: Number of input/prompt tokens.
        output_tokens: Number of output/completion tokens.
        total_tokens: Sum of input and output tokens.
        cost_usd: Estimated cost in USD.
        provider: LLM provider name.
        model: Model identifier used.
    """

    text: str
    input_tokens: int
    output_tokens: int
    total_tokens: int
    cost_usd: float
    provider: str
    model: str


def calculate_cost(
    provider: str,
    model: str,
    input_tokens: int,
    output_tokens: int,
) -> float:
    """Calculate the cost in USD for a given token usage.

    Args:
        provider: LLM provider name.
        model: Model identifier.
        input_tokens: Number of input tokens.
        output_tokens: Number of output tokens.

    Returns:
        Estimated cost in USD.
    """
    provider_costs = _COST_TABLE.get(provider, {})
    cost_pair = provider_costs.get(model)
    if cost_pair is None:
        return 0.0
    input_rate, output_rate = cost_pair
    return (input_tokens / 1000 * input_rate) + (
        output_tokens / 1000 * output_rate
    )


class LLMClient:
    """Unified async client for LLM API calls.

    Supports Anthropic Claude (primary) and OpenAI GPT (secondary)
    with retry logic and connection pooling.

    Args:
        timeout: Request timeout in seconds.
    """

    def __init__(self, timeout: Optional[float] = None) -> None:
        self._timeout = timeout or _DEFAULT_TIMEOUT
        self._client = httpx.AsyncClient(
            timeout=httpx.Timeout(self._timeout),
            limits=httpx.Limits(
                max_connections=20, max_keepalive_connections=5
            ),
        )

    async def close(self) -> None:
        """Close the underlying HTTP client."""
        await self._client.aclose()

    async def generate(
        self,
        prompt: str,
        provider: str = "anthropic",
        model: str = "claude-sonnet-4-20250514",
        max_tokens: int = 4096,
        temperature: float = 0.7,
    ) -> LLMResponse:
        """Send a prompt to an LLM and return the structured response.

        Retries up to 3 times with exponential backoff on transient errors.

        Args:
            prompt: The rendered prompt text to send.
            provider: LLM provider ("anthropic" or "openai").
            model: Specific model identifier.
            max_tokens: Maximum tokens in the response.
            temperature: Sampling temperature.

        Returns:
            LLMResponse with text, token counts, and cost.

        Raises:
            httpx.HTTPStatusError: On non-retryable HTTP errors.
            ValueError: If the provider is unsupported.
        """
        if provider == "anthropic":
            return await self._call_anthropic(
                prompt, model, max_tokens, temperature
            )
        elif provider == "openai":
            return await self._call_openai(
                prompt, model, max_tokens, temperature
            )
        else:
            raise ValueError(f"Unsupported LLM provider: {provider}")

    async def _call_anthropic(
        self,
        prompt: str,
        model: str,
        max_tokens: int,
        temperature: float,
    ) -> LLMResponse:
        """Call the Anthropic Messages API.

        Args:
            prompt: The prompt text.
            model: Anthropic model identifier.
            max_tokens: Maximum response tokens.
            temperature: Sampling temperature.

        Returns:
            LLMResponse from the Anthropic API.
        """
        api_key = os.getenv("ANTHROPIC_API_KEY", "")
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }
        payload: dict[str, Any] = {
            "model": model,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": [{"role": "user", "content": prompt}],
        }
        data = await self._request_with_retry(url, headers, payload)
        text = data.get("content", [{}])[0].get("text", "")
        usage = data.get("usage", {})
        input_tokens = usage.get("input_tokens", 0)
        output_tokens = usage.get("output_tokens", 0)
        cost = calculate_cost(
            "anthropic", model, input_tokens, output_tokens
        )
        return LLMResponse(
            text=text,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=input_tokens + output_tokens,
            cost_usd=cost,
            provider="anthropic",
            model=model,
        )

    async def _call_openai(
        self,
        prompt: str,
        model: str,
        max_tokens: int,
        temperature: float,
    ) -> LLMResponse:
        """Call the OpenAI Chat Completions API.

        Args:
            prompt: The prompt text.
            model: OpenAI model identifier.
            max_tokens: Maximum response tokens.
            temperature: Sampling temperature.

        Returns:
            LLMResponse from the OpenAI API.
        """
        api_key = os.getenv("OPENAI_API_KEY", "")
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        payload: dict[str, Any] = {
            "model": model,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": [{"role": "user", "content": prompt}],
        }
        data = await self._request_with_retry(url, headers, payload)
        choices = data.get("choices", [{}])
        text = choices[0].get("message", {}).get("content", "")
        usage = data.get("usage", {})
        input_tokens = usage.get("prompt_tokens", 0)
        output_tokens = usage.get("completion_tokens", 0)
        cost = calculate_cost(
            "openai", model, input_tokens, output_tokens
        )
        return LLMResponse(
            text=text,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=input_tokens + output_tokens,
            cost_usd=cost,
            provider="openai",
            model=model,
        )

    async def _request_with_retry(
        self,
        url: str,
        headers: dict[str, str],
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        """Send a POST request with exponential backoff retries.

        Args:
            url: API endpoint URL.
            headers: HTTP headers.
            payload: JSON request body.

        Returns:
            Parsed JSON response dictionary.

        Raises:
            httpx.HTTPStatusError: After exhausting all retries.
        """
        import asyncio

        last_exc: Optional[Exception] = None
        for attempt in range(_MAX_RETRIES):
            try:
                response = await self._client.post(
                    url, headers=headers, json=payload
                )
                response.raise_for_status()
                return response.json()
            except (httpx.HTTPStatusError, httpx.TransportError) as exc:
                last_exc = exc
                if attempt < _MAX_RETRIES - 1:
                    wait = 2 ** (attempt + 1)
                    await asyncio.sleep(wait)
        raise last_exc  # type: ignore[misc]
