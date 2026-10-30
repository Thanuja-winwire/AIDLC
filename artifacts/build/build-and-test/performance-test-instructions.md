# Performance Test Instructions

## Purpose
This is a small single-user local app, so no load or stress targets are set. Only a light sanity check applies.

## Sanity targets (informational)
- Upload of a ~50 page PDF: completes in under 60 s (dominated by OpenAI embedding calls).
- Query: under 10 s end to end (dominated by the chat call).
- `GET /api/documents` and `GET /health`: under 200 ms.

## How to measure
```bash
curl -o /dev/null -s -w '%{time_total}\n' http://localhost:8000/health
curl -o /dev/null -s -w '%{time_total}\n' -F "files=@sample.pdf" http://localhost:8000/api/documents
curl -o /dev/null -s -w '%{time_total}\n' -X POST http://localhost:8000/api/query \
  -H 'Content-Type: application/json' -d '{"question":"Summarize the document"}'
```

## Not applicable
Load, stress and concurrency testing are out of scope for this project (single user, local Chroma).
