"""OpenAI embeddings client. The OpenAI client is injected so tests can fake it."""
from __future__ import annotations

import openai

from app.core.errors import UpstreamError


class EmbeddingClient:
    def __init__(self, client, model: str, batch_size: int = 64):
        self._client = client
        self._model = model
        self._batch_size = batch_size

    def embed(self, texts: list[str]) -> list[list[float]]:
        vectors: list[list[float]] = []
        for i in range(0, len(texts), self._batch_size):
            batch = texts[i : i + self._batch_size]
            try:
                response = self._client.embeddings.create(model=self._model, input=batch)
            except openai.OpenAIError as exc:
                raise UpstreamError("The embedding service is unavailable. Please try again.") from exc
            vectors.extend(item.embedding for item in response.data)
        return vectors
