"""Shared fixtures. OpenAI is replaced with deterministic fakes; Chroma is real (tmp dir)."""
from __future__ import annotations

import hashlib
import math
import re

import pytest

from app.core.chunker import Chunker
from app.core.settings import Settings
from app.core.vector_store import VectorStore

DIM = 128


def fake_vector(text: str) -> list[float]:
    """Bag-of-words hashing vector: texts sharing words are similar."""
    vec = [0.0] * DIM
    for token in re.findall(r"[a-z0-9]+", text.lower()):
        idx = int(hashlib.md5(token.encode()).hexdigest(), 16) % DIM
        vec[idx] += 1.0
    norm = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / norm for v in vec]


class FakeEmbedder:
    def __init__(self):
        self.calls = 0
        self.fail = False

    def embed(self, texts: list[str]) -> list[list[float]]:
        from app.core.errors import UpstreamError

        self.calls += 1
        if self.fail:
            raise UpstreamError("The embedding service is unavailable. Please try again.")
        return [fake_vector(t) for t in texts]


class FakeLLM:
    def __init__(self):
        self.calls: list[tuple[str, str]] = []
        self.reply = "The answer is in the documents [1]."

    def complete(self, system: str, user: str) -> str:
        self.calls.append((system, user))
        return self.reply


def make_pdf(text: str) -> bytes:
    """Build a minimal single-page PDF containing `text` (no external dependencies)."""
    safe = text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
    stream = f"BT /F1 12 Tf 72 720 Td ({safe}) Tj ET"
    objects = [
        "<< /Type /Catalog /Pages 2 0 R >>",
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
        "/Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
        f"<< /Length {len(stream)} >>\nstream\n{stream}\nendstream",
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ]
    out = "%PDF-1.4\n"
    offsets = []
    for i, body in enumerate(objects, start=1):
        offsets.append(len(out))
        out += f"{i} 0 obj\n{body}\nendobj\n"
    xref = len(out)
    out += f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n"
    for off in offsets:
        out += f"{off:010d} 00000 n \n"
    out += f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n"
    return out.encode("latin-1")


@pytest.fixture
def settings(tmp_path) -> Settings:
    return Settings(
        openai_api_key="test-key",
        chroma_dir=str(tmp_path / "chroma"),
        chunk_size=200,
        chunk_overlap=30,
        top_k=3,
        min_similarity=0.2,
        max_upload_mb=1,
    )


@pytest.fixture
def store(settings) -> VectorStore:
    return VectorStore(settings.chroma_dir)


@pytest.fixture
def chunker(settings) -> Chunker:
    return Chunker(settings.chunk_size, settings.chunk_overlap)


@pytest.fixture
def embedder() -> FakeEmbedder:
    return FakeEmbedder()


@pytest.fixture
def llm() -> FakeLLM:
    return FakeLLM()
