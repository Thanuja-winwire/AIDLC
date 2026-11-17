# SonarQube Summary (report-only)

- Project: thanuja-ai-dlc_aidlc-subscription-management-8f29aee3 (branch master)
- Analysis: SUCCESS, executed 2026-11-16T11:14:03Z
- Dashboard: https://sonarcloud.io/dashboard?id=thanuja-ai-dlc_aidlc-subscription-management-8f29aee3&branch=master

## Verdict: PASS
Rule: FAIL only when an issue has BLOCKER/HIGH impact. Total issues 9, must-fix 0, all MEDIUM.

## Measures
| Metric | Value |
|---|---|
| Lines of code | 3128 |
| Duplicated lines | 0.0% |
| Overall coverage | 45.8% |

## Quality gate: ERROR
Only one condition fails: new_coverage is 0.0% against a threshold of 80%. This is caused by the untested frontend pages and dialogs. Reliability, security, maintainability, duplication and hotspot-review conditions are all OK.

## Issues (9, MEDIUM)
| File | Line | Rule | Message |
|---|---|---|---|
| backend/app/main.py | 15 | python:S9152 | Cleanup after yield may be skipped on early exit |
| frontend/src/components/CancelDialog.tsx | 22 | typescript:S6853 | Form label must have accessible text |
| frontend/src/components/ui.tsx | 101 | typescript:S6848 | Non-native interactive element needs role and keyboard support |
| frontend/src/hooks/queries.ts | 26 | typescript:S9383 | Unhandled promise |
| frontend/src/lib/validation.ts | 3 | typescript:S8786 | Regex with super-linear backtracking |
| frontend/src/pages/admin/AdminPlansPage.tsx | 23, 24, 88, 88 | typescript:S9383 | Unhandled promises (4) |

## Notes
No code was changed for these findings; this phase only reports them. Suggested follow-up in a later version: add `void`/`.catch` to the promises, wrap the lifespan `yield` in try/finally, fix the label and clickable element, simplify the regex, and add frontend page tests to lift new-code coverage.
