"""Question answering: embed -> retrieve -> threshold -> LLM -> answer with sources."""
from __future__ import annotations

from app.core.errors import InvalidQuestion
from app.core.models import Answer, RetrievedChunk, Source
from app.core.settings import Settings
from app.core.vector_store import VectorStore

INSUFFICIENT = "I don't have enough information in the uploaded documents to answer that."
MAX_QUESTION_CHARS = 2000
SNIPPET_CHARS = 300

SYSTEM_PROMPT = (
    "You answer questions using ONLY the numbered context blocks provided. "
    "Cite the blocks you use inline as [n]. "
    f"If the context does not contain the answer, reply exactly: {INSUFFICIENT}"
)


def _snippet(text: str) -> str:
    flat = " ".join(text.split())
    return flat if len(flat) <= SNIPPET_CHARS else flat[: SNIPPET_CHARS - 1].rstrip() + "\u2026"


class QueryService:
    def __init__(self, settings: Settings, store: VectorStore, embedder, llm):
        self._settings = settings
        self._store = store
        self._embedder = embedder
        self._llm = llm

    @staticmethod
    def _validate(question: str) -> str:
        q = (question or "").strip()
        if not q:
            raise InvalidQuestion("Please enter a question.")
        if len(q) > MAX_QUESTION_CHARS:
            raise InvalidQuestion(f"Question is too long (max {MAX_QUESTION_CHARS} characters).")
        return q

    @staticmethod
    def _build_prompt(question: str, chunks: list[RetrievedChunk]) -> str:
        blocks = []
        for n, c in enumerate(chunks, start=1):
            where = f"{c.filename}, page {c.page}" if c.page else c.filename
            blocks.append(f"[{n}] ({where})\n{c.text}")
        return "Context:\n\n" + "\n\n".join(blocks) + f"\n\nQuestion: {question}"

    def answer(self, question: str) -> Answer:
        q = self._validate(question)
        if self._store.count() == 0:
            return Answer(answer=INSUFFICIENT, sources=[])

        embedding = self._embedder.embed([q])[0]
        retrieved = self._store.query(embedding, self._settings.top_k)
        kept = [c for c in retrieved if c.score >= self._settings.min_similarity]
        if not kept:
            return Answer(answer=INSUFFICIENT, sources=[])

        reply = self._llm.complete(SYSTEM_PROMPT, self._build_prompt(q, kept))
        sources = [
            Source(
                filename=c.filename,
                chunk_index=c.chunk_index,
                page=c.page,
                snippet=_snippet(c.text),
                score=c.score,
            )
            for c in kept
        ]
        return Answer(answer=reply or INSUFFICIENT, sources=sources)
