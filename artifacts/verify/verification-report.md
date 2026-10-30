# Verification Report — Calculator (Version 1)

**CI run:** GitHub Actions run 41033554289 on `aidlc/calculator` — completed, **succeeded**
https://github.com/Thanuja-winwire/AIDLC/actions/runs/41033554289

## Suites

| Suite | Status | Result |
|---|---|---|
| Unit (`code/tests/engine.test.js`, `node --test`) | Run | **10 passed, 0 failed, 0 skipped** |
| Integration (manual browser scenarios) | **Not run** | Needs a real browser; cannot run in CI |
| Performance (Lighthouse / payload check) | **Not run** | Needs a browser; cannot run in CI |
| Visual / responsive check (320px–1280px) | **Not run** | No rendering or screenshot capability used |

## Coverage (c8, `code/script.js`, computed from coverage-final.json)

| Metric | Value |
|---|---|
| Statements | 155 / 236 ≈ **65.7%** |
| Branches | 67 / 77 ≈ **87.0%** |
| Functions | 17 / 22 ≈ **77.3%** |

## Gaps (stated honestly)
- **The DOM layer is untested.** `render`, `run`, `keyToAction`, `flash` and `init` (lines ~160–234 of `script.js`) have 0% coverage. This covers button clicks, keyboard mapping, aria-live updates and the rendered UI. The overall percentage is low for this reason.
- The calculation engine and formatter are exercised well. The uncovered engine paths are a few branches in `inputDecimal` (lines 79–84, the decimal handling after a result or error) and the `formatNumber` exponential branch (line 236).
- Not verified: how the page looks and behaves in a browser, mobile layout, touch targets, and keyboard input in the actual page. These stay unconfirmed until the manual integration scenarios are run.
- No new tests were written in this phase.

## Failures
None in the suites that ran.

## Source edits
None. No files under `code/` were changed.

## Conclusion
The pure calculation logic passes all 10 unit tests. UI behaviour, responsiveness and performance are **unverified**, not passing.
