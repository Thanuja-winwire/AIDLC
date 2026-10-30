"""OpenAI chat completion client. The OpenAI client is injected so tests can fake it."""
from __future__ import annotations

import openai

from app.core.errors import UpstreamError


class LLMClient:
    def __init__(self, client, model: str, temperature: float = 0.2):
        self._client = client
        self._model = model
        self._temperature = temperature

    def complete(self, system: str, user: str) -> str:
        try:
            response = self._client.chat.completions.create(
                model=self._model,
                temperature=self._temperature,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
            )
        except openai.OpenAIError as exc:
            raise UpstreamError("The language model is unavailable. Please try again.") from exc
        content = response.choices[0].message.content
        return (content or "").strip()
