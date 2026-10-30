"""Domain and API models."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from pydantic import BaseModel, Field


class DocumentInfo(BaseModel):
    id: str
    filename: str
    chunk_count: int
    uploaded_at: str  # ISO 8601, UTC
    replaced: bool = False


class Source(BaseModel):
    filename: str
    chunk_index: int
    page: Optional[int] = None
    snippet: str
    score: float


class Answer(BaseModel):
    answer: str
    sources: list[Source] = Field(default_factory=list)


class QueryRequest(BaseModel):
    question: str


@dataclass(frozen=True)
class RetrievedChunk:
    document_id: str
    filename: str
    chunk_index: int
    page: Optional[int]
    text: str
    score: float  # similarity: 1 - cosine distance
