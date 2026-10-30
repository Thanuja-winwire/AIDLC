# Business Logic Model: RAG App

Source: specs.md, app-architecture.md, functional-design-plan.md (approved answers).

## 1. Ingest (POST /api/documents)
1. Validate extension (.pdf/.txt/.md) and size (<= MAX_UPLOAD_MB, default 20). Reject otherwise.
2. Derive `document_id` = deterministic hash (sha1) of the filename, so the same filename maps to the same id.
3. **Replace semantics**: if vectors for `document_id` exist, delete them first.
4. Extract text (PDF via page text; TXT/MD decoded UTF-8 with fallback to latin-1).
5. If extracted text is empty/whitespace, reject with "no extractable text" (e.g. scanned PDF).
6. Chunk (see business-rules.md R-CHUNK).
7. Embed chunks in batches via EmbeddingClient.
8. Store chunks with metadata (document_id, filename, chunk_index, page if known).
9. Return DocumentInfo (id, filename, chunk_count, uploaded_at, replaced flag).

Failure handling: if embedding or storage fails after the old vectors were deleted, remove any partial vectors for the id and return a 502/500 error. The document is then absent, never half-present.

## 2. List (GET /api/documents)
Aggregate stored chunk metadata by document_id into DocumentInfo list, sorted by uploaded_at descending.

## 3. Delete (DELETE /api/documents/{id})
Delete all vectors with that document_id. Return 204; 404 if none exist.

## 4. Query (POST /api/query)
1. Validate question: trimmed, non-empty, max 2000 chars.
2. If the store is empty, return the insufficient-context answer (no LLM call).
3. Embed question.
4. Retrieve top-k chunks across all documents (no filter).
5. Convert distance to similarity; keep chunks with similarity >= MIN_SIMILARITY.
6. If none are kept, return the fixed "not enough information" answer with empty sources, **without calling the LLM**.
7. Build the prompt: system instruction (answer only from context, cite as [n]) plus numbered context blocks plus the question.
8. Call LLMClient (temperature low, e.g. 0.2).
9. Return Answer(answer, sources) where sources are the kept chunks (filename, snippet, score, chunk_index).

## Flow summary
```
Upload -> validate -> (replace) -> extract -> chunk -> embed -> store -> DocumentInfo
Query  -> validate -> embed -> top-k -> threshold -> [none: fixed reply] | LLM -> Answer+sources
```

## Error mapping
| Condition | HTTP |
|---|---|
| Unsupported type / empty text / bad question | 400 |
| File too large | 413 |
| Unknown document id | 404 |
| OpenAI/vector store failure | 502 |
