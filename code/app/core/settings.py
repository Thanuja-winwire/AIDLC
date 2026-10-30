"""Application configuration, loaded from environment variables (and an optional .env file)."""
from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv

from app.core.errors import ConfigError


@dataclass(frozen=True)
class Settings:
    openai_api_key: str = ""
    embedding_model: str = "text-embedding-3-small"
    chat_model: str = "gpt-4o-mini"
    temperature: float = 0.2
    chroma_dir: str = "./data/chroma"
    chunk_size: int = 1000
    chunk_overlap: int = 150
    top_k: int = 4
    min_similarity: float = 0.25
    max_upload_mb: int = 20
    embed_batch_size: int = 64

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_mb * 1024 * 1024

    def validate(self) -> None:
        """Raise ConfigError for unusable values (R-CHUNK-1, R-CFG-1 is checked separately)."""
        if self.chunk_size <= 0:
            raise ConfigError("CHUNK_SIZE must be greater than 0.")
        if not 0 <= self.chunk_overlap < self.chunk_size:
            raise ConfigError("CHUNK_OVERLAP must be >= 0 and smaller than CHUNK_SIZE.")
        if self.top_k <= 0:
            raise ConfigError("TOP_K must be greater than 0.")
        if self.embed_batch_size <= 0:
            raise ConfigError("EMBED_BATCH_SIZE must be greater than 0.")

    def require_api_key(self) -> None:
        if not self.openai_api_key:
            raise ConfigError(
                "OPENAI_API_KEY is not set. Copy .env.example to .env and add your key."
            )

    @classmethod
    def load(cls) -> "Settings":
        load_dotenv()
        d = cls()
        try:
            settings = cls(
                openai_api_key=os.getenv("OPENAI_API_KEY", "").strip(),
                embedding_model=os.getenv("OPENAI_EMBEDDING_MODEL", d.embedding_model),
                chat_model=os.getenv("OPENAI_CHAT_MODEL", d.chat_model),
                temperature=float(os.getenv("LLM_TEMPERATURE", d.temperature)),
                chroma_dir=os.getenv("CHROMA_DIR", d.chroma_dir),
                chunk_size=int(os.getenv("CHUNK_SIZE", d.chunk_size)),
                chunk_overlap=int(os.getenv("CHUNK_OVERLAP", d.chunk_overlap)),
                top_k=int(os.getenv("TOP_K", d.top_k)),
                min_similarity=float(os.getenv("MIN_SIMILARITY", d.min_similarity)),
                max_upload_mb=int(os.getenv("MAX_UPLOAD_MB", d.max_upload_mb)),
                embed_batch_size=int(os.getenv("EMBED_BATCH_SIZE", d.embed_batch_size)),
            )
        except ValueError as exc:
            raise ConfigError(f"Invalid numeric setting in environment: {exc}") from exc
        settings.validate()
        return settings
