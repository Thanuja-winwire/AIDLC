# Component Methods

Detailed business rules are defined in Functional Design.

## Core
- `Settings.load() -> Settings`
- `loaders.extract_text(filename: str, data: bytes) -> str`: raises `UnsupportedFileType`, `EmptyDocument`
- `Chunker.split(text: str) -> list[str]`: uses chunk size and overlap from settings
- `EmbeddingClient.embed(texts: list[str]) -> list[list[float]]`
- `LLMClient.complete(system: str, user: str) -> str`
- `VectorStore.add(doc_id: str, filename: str, chunks: list[str], embeddings: list[list[float]]) -> None`
- `VectorStore.query(embedding: list[float], k: int) -> list[Chunk]`: Chunk = (doc_id, filename, text, score)
- `VectorStore.list_documents() -> list[DocumentInfo]`
- `VectorStore.delete(doc_id: str) -> bool`

## Services
- `IngestionService.ingest(filename: str, data: bytes) -> DocumentInfo`
- `IngestionService.list_documents() -> list[DocumentInfo]`
- `IngestionService.delete_document(doc_id: str) -> bool`
- `QueryService.answer(question: str) -> Answer`: Answer = (answer: str, sources: list[Source]); Source = (filename, snippet, score)

## API
- `POST /api/documents` (multipart files) -> 201 list[DocumentInfo]; 400/413/415 on validation errors
- `GET /api/documents` -> list[DocumentInfo]
- `DELETE /api/documents/{id}` -> 204 / 404
- `POST /api/query` `{question}` -> `{answer, sources[]}`
- `GET /health` -> `{status: "ok"}`
