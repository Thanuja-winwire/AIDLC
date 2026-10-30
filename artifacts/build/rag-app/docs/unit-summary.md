# Unit Summary: RAG App

Single FastAPI unit. Layers: `api` -> `services` -> `core`, plus a static UI served from the same app.

## Files
- **core**: settings, errors, models, loaders (PDF/TXT/MD), chunker, embeddings, llm, vector_store (Chroma)
- **services**: IngestionService (replace-on-reupload, embed before delete), QueryService (threshold gate, no LLM call without context)
- **api**: documents_router (`/api/documents`), query_router (`/api/query`), health_router (`/health`), deps
- **static**: index.html, styles.css, app.js (custom design system, all states designed, textContent only)
- **tests**: chunker, loaders, vector store, ingestion, query, API (fakes for embedder and LLM)

## Contract check (by reading code)
- UI calls `/api/documents` (GET, POST multipart `files`, DELETE `/{id}`), `/api/query` and `/health`. Each is registered at that exact path.
- UI reads `answer`, `sources[].filename/chunk_index/page/snippet/score` and `DocumentInfo.id/filename/chunk_count/replaced`, all present in `models.py`.
- Error bodies use `{"detail": message}`, which the UI reads.

## Not yet done
Nothing has been run. Install, compile check, boot, and the real upload and query flows are covered in Build and Test and executed in Verify.

## Figma
No Figma designs were used. No fidelity warnings. No render-and-screenshot self-check was possible in this session, so the visual baseline is unverified by eye.
