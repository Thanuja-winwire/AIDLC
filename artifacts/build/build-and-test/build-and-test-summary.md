# Build and Test Summary

Nothing was executed in the Build phase. These are the instructions Verify will run.

## Build
- **Tool**: Python 3.11+, pip, `code/requirements.txt`
- **Compile gate**: `python -m compileall -q app tests` and `python -c "from app.main import create_app, app_factory"`
- **Start**: `uvicorn app.main:app_factory --factory --port 8000` (needs `OPENAI_API_KEY`)
- **Status**: not yet run

## Tests
| Type | Command | Status |
|---|---|---|
| Unit | `cd code && pytest` | not yet run |
| Integration (real app) | see integration-test-instructions.md | not yet run |
| Performance | sanity timings only | not yet run |
| Contract, security, e2e | covered by integration scenarios (UI paths vs routes) | not yet run |

## Notes
- Unit tests fake OpenAI, so they cannot catch real-API or Chroma-runtime issues. The integration scenarios cover those.
- The UI and API share one port, so there is no cross-unit wiring to reconcile.
- The UI was not visually checked in this session.

## Next
Proceed to VERIFY to run the pipeline.
