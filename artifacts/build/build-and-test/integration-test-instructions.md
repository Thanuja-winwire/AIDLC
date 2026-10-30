# Integration Test Instructions

## Purpose
Exercise the real running app end to end: UI to API to services to Chroma and OpenAI. Health checks alone are not enough, so each major flow is called for real.

## Setup
```bash
cd code
export OPENAI_API_KEY=sk-...        # real key
uvicorn app.main:app_factory --factory --port 8000 &
sleep 3
```
Use a throwaway `CHROMA_DIR` (e.g. `export CHROMA_DIR=/tmp/rag-chroma`) so the run is clean.

## Scenarios

### 1. Boot and wiring
```bash
curl -i http://localhost:8000/health        # 200
curl -i http://localhost:8000/              # 200, HTML UI
curl -i http://localhost:8000/static/app.js # 200 (or the path the UI links)
```

### 2. Write: upload a document (primary flow)
```bash
printf 'The capital of France is Paris. Paris is on the Seine.\n' > /tmp/facts.txt
curl -i -F "files=@/tmp/facts.txt" http://localhost:8000/api/documents
```
Expected: 200/201, JSON with `id`, `filename: facts.txt`, `chunk_count >= 1`, `replaced: false`.

### 3. Read: list documents
```bash
curl -s http://localhost:8000/api/documents
```
Expected: array containing `facts.txt`.

### 4. Query with relevant context
```bash
curl -s -X POST http://localhost:8000/api/query   -H 'Content-Type: application/json'   -d '{"question":"What is the capital of France?"}'
```
Expected: `answer` mentions Paris, `sources[]` has `filename: facts.txt` with `chunk_index`, `snippet`, `score`.

### 5. Query with no relevant context
Ask an unrelated question ("How do I bake sourdough?"). Expected: the fixed "not enough information" answer and empty `sources`.

### 6. Replace on re-upload
Re-run the upload from scenario 2 with edited content. Expected: `replaced: true`, and the list still shows one `facts.txt`.

### 7. Validation errors
```bash
printf 'x' > /tmp/bad.exe
curl -i -F "files=@/tmp/bad.exe" http://localhost:8000/api/documents   # 4xx with {"detail": ...}
curl -i -X POST http://localhost:8000/api/query -H 'Content-Type: application/json' -d '{"question":""}'   # 4xx
```

### 8. Write: delete
```bash
curl -i -X DELETE http://localhost:8000/api/documents/<id>   # 2xx
curl -s http://localhost:8000/api/documents                  # no longer listed
```

### 9. PDF upload
Upload a small real PDF. Expected: chunks created, and a query citing it returns a `page` in the source.

### 10. Frontend path contract
The UI calls exactly: `GET/POST /api/documents`, `DELETE /api/documents/{id}`, `POST /api/query`, `GET /health`. Confirm each returns non-404 against the running server (scenarios 1 to 8 cover them).

## Cleanup
```bash
kill %1
rm -rf /tmp/rag-chroma /tmp/facts.txt /tmp/bad.exe
```
