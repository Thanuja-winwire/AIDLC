# Business Rules: RAG App

| ID | Rule |
|---|---|
| R-FILE-1 | Allowed types: .pdf, .txt, .md (case-insensitive). Others are rejected with 400. |
| R-FILE-2 | Max upload size is MAX_UPLOAD_MB (default 20); larger is rejected with 413. |
| R-FILE-3 | Filenames are sanitised (basename only, no path components) before use. |
| R-DUP-1 | Same filename = same document. Re-upload replaces: old vectors are deleted, then the new file is ingested. |
| R-TEXT-1 | A file with no extractable text is rejected with 400 and nothing is stored. |
| R-CHUNK-1 | Fixed character size, default CHUNK_SIZE=1000 with CHUNK_OVERLAP=150. Both configurable; overlap must be < size. |
| R-CHUNK-2 | Prefer splitting at paragraph breaks, then sentence ends, then whitespace; hard-split only when no boundary exists in the window. |
| R-CHUNK-3 | Whitespace-only chunks are dropped. Chunk indexes are 0-based and contiguous. |
| R-EMB-1 | Embeddings are requested in batches (default 64) to stay within API limits. |
| R-RET-1 | Always search all ingested documents; there is no per-document filter. |
| R-RET-2 | Retrieve TOP_K chunks (default 4). |
| R-RET-3 | Keep only chunks with similarity >= MIN_SIMILARITY (default 0.25, configurable). Similarity = 1 - cosine distance. |
| R-RET-4 | If no chunk passes, or the store is empty, return the fixed message "I don't have enough information in the uploaded documents to answer that." with no sources, and do not call the LLM. |
| R-ANS-1 | The LLM prompt instructs it to answer only from the supplied context and to cite sources as [n]. |
| R-ANS-2 | Sources returned = the chunks sent to the LLM: filename, chunk_index, snippet (<= 300 chars), score. |
| R-ANS-3 | Question: trimmed, 1-2000 chars. Otherwise 400. |
| R-ERR-1 | OpenAI or vector store errors map to 502 with a safe message; the API key and raw provider errors are never exposed. |
| R-ERR-2 | A failed ingest leaves no partial vectors for that document. |
| R-CFG-1 | Missing OPENAI_API_KEY fails fast at startup with a clear message (health still reports config state). |
