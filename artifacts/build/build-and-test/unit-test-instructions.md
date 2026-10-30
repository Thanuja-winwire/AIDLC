# Unit Test Execution

## Run Unit Tests

### 1. Execute All Unit Tests
```bash
cd code
npm test
```
This runs `node --test tests/`, which executes `tests/engine.test.js`.

### 2. Review Test Results
- **Expected**: all tests pass, 0 failures.
- **Covered areas**:
  - arithmetic and left-to-right chaining
  - rounding (0.1 + 0.2 gives 0.3)
  - percent
  - division by zero and error recovery
  - clear and delete
  - the 15-digit input limit
- **Test Coverage**: engine and formatter logic. The target is 90% or more of the engine lines.
- **Report Location**: console output. Optionally run `node --test --experimental-test-coverage tests/`.

### 3. Fix Failing Tests
1. Read the failing assertion in the console output.
2. Check the corresponding rule (BR-1 to BR-14) in the functional design.
3. Fix `script.js`, then rerun `npm test`.
