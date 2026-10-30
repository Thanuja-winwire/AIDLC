# Services

## IngestionService
- Responsibility: turn an uploaded file into stored, searchable chunks; manage the document list.
- Orchestration (synchronous, inside the upload request): `loaders.extract_text` -> `Chunker.split` -> `EmbeddingClient.embed` -> `VectorStore.add`.
- Returns a `DocumentInfo` (id, filename, chunk count, uploaded_at) once complete.
- Errors are raised as domain exceptions and mapped to HTTP errors by the API layer.

## QueryService
- Responsibility: answer a question grounded in ingested documents.
- Orchestration: `EmbeddingClient.embed([question])` -> `VectorStore.query(k)` -> build a prompt with the chunks as context -> `LLMClient.complete` -> `Answer` with sources.
- If nothing is retrieved, or the context is insufficient, the answer states that rather than guessing.

## Wiring
Services are constructed once at app startup with `Settings` and the core clients, then injected into routers via FastAPI dependencies. This lets tests swap in mocked OpenAI clients.
