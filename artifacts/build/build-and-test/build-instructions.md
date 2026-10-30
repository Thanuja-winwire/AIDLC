# Build Instructions

## Prerequisites
- **Runtime**: Python 3.11+
- **Dependencies**: listed in `code/requirements.txt` (FastAPI, uvicorn, python-multipart, pydantic, openai, chromadb, pypdf, python-dotenv, pytest, httpx)
- **Environment variables**: `OPENAI_API_KEY` (required to start the real app; not needed for tests). Others are optional, see `code/.env.example`.
- **System**: any OS, ~1 GB free disk (chromadb and dependencies), network access to pip and OpenAI for the real run.

## Build Steps

### 1. Install dependencies
```bash
cd code
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure environment
```bash
cp .env.example .env
# edit .env and set OPENAI_API_KEY
```

### 3. Compile check (gate before running anything)
Python has no build step, so the compile gate is bytecode compilation and an import check:
```bash
python -m compileall -q app tests
python -c "from app.main import create_app, app_factory; print('imports ok')"
```
Both must exit 0.

### 4. Start the app
```bash
uvicorn app.main:app_factory --factory --port 8000
```
- Expected: log line "Uvicorn running on http://127.0.0.1:8000" with no traceback.
- Without `OPENAI_API_KEY` the app fails fast at startup by design.

### 5. Whole-application wiring
There is a single unit. The UI is served by FastAPI from the same port, so no proxy, CORS or port reconciliation is needed. Confirm with `curl http://localhost:8000/health` (200) and by loading `http://localhost:8000/` (the UI).

## Build artifacts
None. Chroma data is created at `CHROMA_DIR` (default `./data/chroma`) on first upload.

## Troubleshooting

### Dependency install fails
- **Cause**: Python older than 3.11, or no compiler for a native wheel (chromadb).
- **Solution**: use Python 3.11+, upgrade pip (`pip install -U pip`), retry.

### App exits at startup complaining about the API key
- **Cause**: `OPENAI_API_KEY` is not set.
- **Solution**: set it in `code/.env` or export it, then restart.

### `ModuleNotFoundError: app`
- **Cause**: commands run from outside `code/`.
- **Solution**: `cd code` first.
