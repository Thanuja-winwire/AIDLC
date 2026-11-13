"""Export SonarQube analysis results to a single JSON file an AI agent can read.

Waits for the analysis started by the scanner to finish processing, then collects
every open issue for the project (grouped by file), the description of every rule
that was hit, a few project measures, and SonarCloud's quality gate result for the
analysis. Uses only the Python standard library.

Usage:
    python sonar-export.py --report-task <file-or-dir> [<dir> ...] --out sonar-issues.json

--report-task takes the scanner's report-task.txt, or directories to search for it
(the newest one found wins): the generic scanners write it to .scannerwork/ next to
the code, SonarScanner for .NET under the agent's build directory.

AI-DLC commits this file into every SonarQube-enabled project as
artifacts/verify/sonar/sonar-export.py; do not edit the committed copy.

Environment:
    SONAR_TOKEN     token used for the scan (required)
    SONAR_HOST_URL  e.g. https://sonarcloud.io (default)
    SONAR_ORG       organization key (SonarQube Cloud only)

Exit code is 0 whenever the export succeeds, whatever the findings are: the
verdict is written into the JSON for the reader to act on. Exit code 1 means the
export itself failed (auth, network, analysis failed to process); the JSON is then
still written, with "status": "ERROR" and the reason, so the report can say why.
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

PAGE_SIZE = 500          # max page size for api/issues/search
MAX_RESULTS = 10_000     # api/issues/search cannot page past this
MUST_FIX_IMPACT = {"BLOCKER", "HIGH"}
MUST_FIX_LEGACY = {"BLOCKER", "CRITICAL"}
RULE_DESC_LIMIT = 4000   # characters of rule description kept per rule


def api_get(host, path, params, token):
    url = f"{host.rstrip('/')}/{path.lstrip('/')}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < 4:     # SonarQube Cloud rate limit
                time.sleep(10 * (attempt + 1))
                continue
            body = e.read().decode("utf-8", "replace")[:500]
            raise RuntimeError(f"GET {path} failed: HTTP {e.code}: {body}") from None
    raise RuntimeError(f"GET {path} failed: rate limited")


def read_report_task(path):
    props = {}
    with open(path, encoding="utf-8") as f:
        for line in f:
            if "=" in line:
                k, v = line.strip().split("=", 1)
                props[k] = v
    return props


def find_report_task(paths):
    """Return the newest report-task.txt among the given files/directories."""
    found = []
    for p in paths:
        if os.path.isfile(p):
            found.append(p)
        elif os.path.isdir(p):
            for root, dirs, names in os.walk(p):
                dirs[:] = [d for d in dirs if d not in ("node_modules", ".git")]
                if "report-task.txt" in names:
                    found.append(os.path.join(root, "report-task.txt"))
    if not found:
        raise RuntimeError(f"report-task.txt not found in {paths}: the scan step did not upload an analysis")
    return max(found, key=os.path.getmtime)


def wait_for_analysis(host, task_id, token, timeout):
    start = time.time()
    while True:
        task = api_get(host, "api/ce/task", {"id": task_id}, token)["task"]
        status = task.get("status")
        if status in ("SUCCESS", "FAILED", "CANCELED"):
            return status, round(time.time() - start, 1), task
        if time.time() - start > timeout:
            return "TIMEOUT", round(time.time() - start, 1), task
        time.sleep(5)


def fetch_issues(host, org, project_key, token):
    issues, page = [], 1
    while True:
        params = {"componentKeys": project_key, "resolved": "false",
                  "ps": PAGE_SIZE, "p": page}
        if org:
            params["organization"] = org
        data = api_get(host, "api/issues/search", params, token)
        issues.extend(data.get("issues", []))
        total = data.get("paging", {}).get("total", data.get("total", 0))
        if len(issues) >= total or page * PAGE_SIZE >= MAX_RESULTS:
            return issues, total
        page += 1


def html_to_text(html):
    text = re.sub(r"<(br|/p|/li|/h\d)\s*/?>", "\n", html or "", flags=re.I)
    text = re.sub(r"<[^>]+>", "", text)
    text = (text.replace("&lt;", "<").replace("&gt;", ">")
                .replace("&quot;", '"').replace("&#39;", "'").replace("&amp;", "&"))
    return re.sub(r"\n{3,}", "\n\n", text).strip()


def fetch_rule(host, org, key, token):
    params = {"key": key}
    if org:
        params["organization"] = org
    rule = api_get(host, "api/rules/show", params, token).get("rule", {})
    sections = rule.get("descriptionSections") or []
    if sections:
        desc = "\n\n".join(f"[{s.get('key', '')}]\n{html_to_text(s.get('content', ''))}"
                           for s in sections)
    else:
        desc = html_to_text(rule.get("htmlDesc") or rule.get("mdDesc") or "")
    return {"name": rule.get("name"), "language": rule.get("lang"),
            "description": desc[:RULE_DESC_LIMIT]}


def fetch_measures(host, project_key, token):
    try:
        data = api_get(host, "api/measures/component",
                       {"component": project_key,
                        "metricKeys": "ncloc,coverage,duplicated_lines_density"}, token)
        return {m["metric"]: m.get("value") for m in data.get("component", {}).get("measures", [])}
    except RuntimeError as e:
        return {"error": str(e)}


def fetch_quality_gate(host, analysis_id, project_key, token):
    """SonarCloud's own quality gate for this analysis: {"status": OK|ERROR|NONE, "conditions": [...]}.
    Report-only like everything else here: any failure gives "status": "UNKNOWN" and the reason."""
    try:
        params = {"analysisId": analysis_id} if analysis_id else {"projectKey": project_key}
        status = api_get(host, "api/qualitygates/project_status", params, token).get("projectStatus") or {}
        return {
            "status": status.get("status") or "NONE",
            "conditions": [{"metric": c.get("metricKey"), "comparator": c.get("comparator"),
                            "threshold": c.get("errorThreshold"), "actual": c.get("actualValue"),
                            "status": c.get("status")}
                           for c in status.get("conditions") or []],
        }
    except (RuntimeError, OSError, ValueError) as e:
        return {"status": "UNKNOWN", "error": str(e), "conditions": []}


def is_must_fix(issue):
    impacts = {i.get("severity") for i in issue.get("impacts", [])}
    return bool(impacts & MUST_FIX_IMPACT) or issue.get("severity") in MUST_FIX_LEGACY


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--report-task", required=True, nargs="+",
                    help="report-task.txt, or directories to search for it")
    ap.add_argument("--out", required=True, help="output JSON path")
    ap.add_argument("--timeout", type=int, default=600, help="seconds to wait for processing")
    args = ap.parse_args()
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    try:
        export(args)
    except (RuntimeError, OSError, KeyError, ValueError) as e:
        with open(args.out, "w", encoding="utf-8") as f:
            json.dump({"status": "ERROR", "error": str(e)}, f, indent=2)
        print(f"SonarQube export failed: {e}")
        sys.exit(1)


def export(args):
    token = os.environ.get("SONAR_TOKEN")
    if not token:
        raise RuntimeError("SONAR_TOKEN is not set: the SonarQube settings are missing from this pipeline")
    org = os.environ.get("SONAR_ORG", "")

    report_task = find_report_task(args.report_task)
    print(f"Using {report_task}")
    task = read_report_task(report_task)
    host = task.get("serverUrl") or os.environ.get("SONAR_HOST_URL", "https://sonarcloud.io")
    project_key = task["projectKey"]

    status, waited, ce = wait_for_analysis(host, task["ceTaskId"], token, args.timeout)
    print(f"Analysis processing: {status} after {waited}s")
    if status != "SUCCESS":
        raise RuntimeError(f"Analysis did not complete: {status} {ce.get('errorMessage', '')}")

    issues, total = fetch_issues(host, org, project_key, token)
    rules = {key: fetch_rule(host, org, key, token)
             for key in sorted({i["rule"] for i in issues})}

    prefix = f"{project_key}:"
    files, by_severity, must_fix = {}, {}, 0
    for i in issues:
        path = i.get("component", "")
        path = path[len(prefix):] if path.startswith(prefix) else path
        impacts = [{"quality": x.get("softwareQuality"), "severity": x.get("severity")}
                   for x in i.get("impacts", [])]
        sev = max((x["severity"] for x in impacts), default=i.get("severity"),
                  key=lambda s: ["INFO", "LOW", "MEDIUM", "HIGH", "BLOCKER"].index(s)
                  if s in ("INFO", "LOW", "MEDIUM", "HIGH", "BLOCKER") else -1)
        by_severity[sev] = by_severity.get(sev, 0) + 1
        fix = is_must_fix(i)
        must_fix += fix
        files.setdefault(path, []).append({
            "line": i.get("line"),
            "rule": i.get("rule"),
            "severity": sev,
            "impacts": impacts,
            "must_fix": fix,
            "message": i.get("message"),
            "effort": i.get("effort"),
        })

    result = {
        "status": "OK",
        "project_key": project_key,
        "organization": org or None,
        "dashboard_url": task.get("dashboardUrl"),
        "analysis": {"ce_task_id": task["ceTaskId"], "status": status,
                     "processing_seconds": waited,
                     "analysis_id": ce.get("analysisId"), "executed_at": ce.get("executedAt")},
        "summary": {
            "total_issues": total,
            "exported_issues": len(issues),
            "by_severity": by_severity,
            "must_fix": must_fix,
            "verdict": "FAIL" if must_fix else "PASS",
            "rule": "FAIL when any issue has BLOCKER/HIGH impact (or legacy BLOCKER/CRITICAL severity)",
        },
        "measures": fetch_measures(host, project_key, token),
        # Separate from summary.verdict (AI-DLC's own rule): the gate SonarCloud itself
        # applies, e.g. coverage on new code. Either can fail while the other passes.
        "quality_gate": fetch_quality_gate(host, ce.get("analysisId"), project_key, token),
        "files": [{"path": p, "issues": sorted(v, key=lambda x: x["line"] or 0)}
                  for p, v in sorted(files.items())],
        "rules": rules,
    }
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    s = result["summary"]
    print(f"Issues: {s['total_issues']} ({s['by_severity']}), must fix: {s['must_fix']}, "
          f"verdict: {s['verdict']}")
    print(f"Measures: {result['measures']}")
    gate = result["quality_gate"]
    print(f"Quality gate: {gate['status']}" + (f" ({gate['error']})" if gate.get("error") else ""))
    print(f"Wrote {args.out}")


if __name__ == "__main__":
    main()
