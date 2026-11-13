# Build and Test Summary

Nothing has been built or run in the Build phase. Execution happens in Verify.

## Quick reference
| Item | Command |
|---|---|
| Install backend | `cd code/backend && pip install -r requirements.txt` |
| Install frontend | `cd code/frontend && npm install` |
| Build frontend | `npm run build` |
| Backend tests | `cd code/backend && pytest` |
| Frontend tests | `cd code/frontend && npm test -- --run` |
| Run everything | `cd code && docker compose up --build` |

## Status
- **Build**: not yet executed
- **Unit tests**: 7 backend test files and the frontend tests are written, not yet run
- **Integration tests**: documented in `integration-test-instructions.md`, to be executed in Verify
- **Performance tests**: documented, and no load script has been written
- **Known gaps**: the frontend has not been rendered or visually checked. Figma designs were skipped.

## Next steps
Proceed to VERIFY. The CI pipeline will install, compile, run tests, boot the stack and exercise the smoke flow.
