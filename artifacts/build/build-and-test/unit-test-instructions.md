# Unit Test Execution

## Run unit tests

### 1. Execute all tests
```bash
cd code
pytest
```
Tests use a fake embedder, a fake LLM and a generated PDF, so no API key or network is needed. `pytest.ini` configures the test path.

### 2. With coverage (used by Verify)
```bash
pip install pytest-cov
pytest --cov=app --cov-report=term-missing --cov-report=xml --junitxml=test-results.xml
```

### 3. Review results
- **Expected**: all tests pass, 0 failures.
- **Test files**: `tests/test_chunker.py`, `test_loaders.py`, `test_vector_store.py`, `test_ingestion.py`, `test_query.py`, `test_api.py`.
- **Coverage**: target 80% or more on `app/`.
- **Reports**: `test-results.xml`, `coverage.xml` in `code/`.

### 4. If tests fail
1. Read the failing assertion in the pytest output.
2. Fix the code (or the test if the test is wrong).
3. Rerun until green.

Note: a green test run does not prove the real app works. The tests fake the OpenAI boundary, so also run the integration scenarios.
