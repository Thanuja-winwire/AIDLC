"""SQLite data access layer for tasks (plain sqlite3)."""
import os
import sqlite3
from contextlib import closing
from datetime import datetime, timezone
from typing import Optional

STATUSES = ("Pending", "In Progress", "Completed")
PRIORITIES = ("Low", "Medium", "High")

SCHEMA = """
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    priority TEXT NOT NULL DEFAULT 'Medium'
        CHECK (priority IN ('Low', 'Medium', 'High')),
    due_date TEXT,
    status TEXT NOT NULL DEFAULT 'Pending'
        CHECK (status IN ('Pending', 'In Progress', 'Completed')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
)
"""

EDITABLE = ("title", "description", "priority", "due_date", "status")


def default_db_path() -> str:
    return os.environ.get("TASK_DB_PATH", "tasks.db")


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _connect(db_path: str) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute(SCHEMA)
    return conn


def init_db(db_path: Optional[str] = None) -> None:
    with closing(_connect(db_path or default_db_path())) as conn:
        conn.commit()


def _row(row: Optional[sqlite3.Row]) -> Optional[dict]:
    return dict(row) if row is not None else None


def create_task(db_path: str, data: dict) -> dict:
    now = _now()
    with closing(_connect(db_path)) as conn:
        cur = conn.execute(
            "INSERT INTO tasks (title, description, priority, due_date, status,"
            " created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                data["title"],
                data.get("description", ""),
                data.get("priority", "Medium"),
                data.get("due_date"),
                data.get("status", "Pending"),
                now,
                now,
            ),
        )
        conn.commit()
        return _row(conn.execute("SELECT * FROM tasks WHERE id = ?", (cur.lastrowid,)).fetchone())


def get_task(db_path: str, task_id: int) -> Optional[dict]:
    with closing(_connect(db_path)) as conn:
        return _row(conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone())


def list_tasks(db_path: str, status: Optional[str] = None, priority: Optional[str] = None) -> list:
    clauses, params = [], []
    if status:
        clauses.append("status = ?")
        params.append(status)
    if priority:
        clauses.append("priority = ?")
        params.append(priority)
    where = f" WHERE {' AND '.join(clauses)}" if clauses else ""
    with closing(_connect(db_path)) as conn:
        rows = conn.execute(
            f"SELECT * FROM tasks{where} ORDER BY created_at DESC, id DESC", params
        ).fetchall()
        return [dict(r) for r in rows]


def update_task(db_path: str, task_id: int, data: dict) -> Optional[dict]:
    with closing(_connect(db_path)) as conn:
        if conn.execute("SELECT 1 FROM tasks WHERE id = ?", (task_id,)).fetchone() is None:
            return None
        values = [data[f] for f in EDITABLE]
        conn.execute(
            "UPDATE tasks SET title = ?, description = ?, priority = ?, due_date = ?,"
            " status = ?, updated_at = ? WHERE id = ?",
            (*values, _now(), task_id),
        )
        conn.commit()
        return _row(conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone())


def delete_task(db_path: str, task_id: int) -> bool:
    with closing(_connect(db_path)) as conn:
        cur = conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        conn.commit()
        return cur.rowcount > 0


def get_summary(db_path: str) -> dict:
    by_status = {s: 0 for s in STATUSES}
    by_priority = {p: 0 for p in PRIORITIES}
    with closing(_connect(db_path)) as conn:
        for r in conn.execute("SELECT status, COUNT(*) AS n FROM tasks GROUP BY status"):
            by_status[r["status"]] = r["n"]
        for r in conn.execute("SELECT priority, COUNT(*) AS n FROM tasks GROUP BY priority"):
            by_priority[r["priority"]] = r["n"]
    return {"total": sum(by_status.values()), "by_status": by_status, "by_priority": by_priority}
