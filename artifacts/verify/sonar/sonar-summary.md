# SonarQube Summary — Student Management

**Project key**: `thanuja-ai-dlc_aidlc-student-management-131bd142` · **Organization**: `thanuja-ai-dlc`
**Analysis time**: 2026-11-17T12:54:14+0000 · **Analysis status**: SUCCESS
**Dashboard**: https://sonarcloud.io/dashboard?id=thanuja-ai-dlc_aidlc-student-management-131bd142&branch=master

**Pipeline run**: 44087274094 (re-run of Verify, fully succeeded) · **Branch scanned**: master

The scan ran on the code after two fixes made earlier in Verify:
- `code/backend/app/repository.py`: added `from __future__ import annotations`. The method named `list` shadowed the `list[...]` annotations and broke the import.
- `code/backend/app/schemas.py`: `StudentOut` now normalises `created_at` and `updated_at` to UTC, because SQLite drops the timezone.

## AI-DLC verdict: ✅ PASS
Rule: FAIL when any issue has BLOCKER/HIGH impact (or legacy BLOCKER/CRITICAL severity). Must-fix issues: 0.

## SonarCloud quality gate: ✅ Passed
| Condition | Comparator | Threshold | Actual | Status |
|---|---|---|---|---|
| new_reliability_rating | GT | 1 | 1 | OK |
| new_security_rating | GT | 1 | 1 | OK |
| new_maintainability_rating | GT | 1 | 1 | OK |
| new_coverage | LT | 80 | 100.0 | OK |
| new_duplicated_lines_density | GT | 3 | 0.0 | OK |
| new_security_hotspots_reviewed | LT | 100 | 100.0 | OK |

All gate conditions passed. The AI-DLC verdict and the quality gate agree.

## Overall metrics
| Metric | Value |
|---|---|
| Lines of code | 1130 |
| Coverage (SonarQube) | 27.6% |
| Duplication | 0.0% |
| Total issues | 2 |
| BLOCKER / HIGH | 0 |
| MEDIUM | 2 |
| LOW / INFO | 0 |

SonarQube's 27.6% coverage is an overall figure that includes the frontend. Only the frontend validation logic has tests, so the components, hooks and API client count as uncovered. The backend's own figure is in the coverage summary.

## Must-fix issues (BLOCKER/HIGH)
None.

## Other issues
| File | Line | Severity | Quality | Rule | Message | Effort |
|---|---:|---|---|---|---|---|
| `backend/app/schemas.py` | 7 | MEDIUM | RELIABILITY | `python:S8786` | Simplify this regular expression to reduce its runtime, as it has super-linear performance due to backtracking. | 20min |
| `frontend/src/validation.ts` | 3 | MEDIUM | RELIABILITY | `typescript:S8786` | Simplify this regular expression to reduce its runtime, as it has super-linear performance due to backtracking. | 20min |

## Issue details

### `python:S8786` and `typescript:S8786` — Regular expressions should not cause non-linear backtracking
- **Quality / severity**: RELIABILITY · MEDIUM · **Where**: `backend/app/schemas.py` line 7 and `frontend/src/validation.ts` line 3
- **Why it matters**: Regex engines backtrack. Some patterns take polynomial time as the input grows, which can slow the app or allow a ReDoS attack on large or untrusted input.
- **Context**: Both lines define the same email pattern, `^[^\s@]+@[^\s@]+\.[^\s@]+$`. The `[^\s@]+` groups before and after the `.` can both match dots, so the engine can try many ways to split the domain. The length is capped at 254 characters before the check runs, which limits the real impact. The pattern is still flagged.
- **Recommended fix (post-release, not applied)**: Exclude the dot from the domain groups, for example `^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$`, or use bounded quantifiers such as `{1,64}`. Make the same change in both files so the client and server rules stay identical, and re-run the tests.

## Remediation summary
| Priority | File | Rule | Effort |
|---|---|---|---|
| 1 | `backend/app/schemas.py` | `python:S8786` | 20min |
| 2 | `frontend/src/validation.ts` | `typescript:S8786` | 20min |

**Total estimated effort**: 40min
