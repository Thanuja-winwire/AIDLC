"""Domain errors. Each carries the HTTP status the API layer should return."""
from __future__ import annotations


class AppError(Exception):
    status_code = 500

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class UnsupportedFileType(AppError):
    status_code = 400


class EmptyDocument(AppError):
    status_code = 400


class InvalidQuestion(AppError):
    status_code = 400


class FileTooLarge(AppError):
    status_code = 413


class DocumentNotFound(AppError):
    status_code = 404


class UpstreamError(AppError):
    """OpenAI or vector-store failure. Messages must be safe to show to users (R-ERR-1)."""

    status_code = 502


class ConfigError(AppError):
    status_code = 500
