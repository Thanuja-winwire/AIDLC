"""HTTP routes. Registered under the /api prefix in main.py."""
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query, Response

from . import data_access as db
from .schemas import DashboardSummary, Priority, Status, TaskIn, TaskOut

router = APIRouter()


def _not_found() -> HTTPException:
    return HTTPException(status_code=404, detail="Task not found")


@router.get("/tasks", response_model=List[TaskOut])
def list_tasks(
    status: Optional[Status] = Query(None),
    priority: Optional[Priority] = Query(None),
):
    return db.list_tasks(db.default_db_path(), status, priority)


@router.post("/tasks", response_model=TaskOut, status_code=201)
def create_task(payload: TaskIn):
    return db.create_task(db.default_db_path(), payload.to_record())


@router.get("/tasks/{task_id}", response_model=TaskOut)
def get_task(task_id: int):
    task = db.get_task(db.default_db_path(), task_id)
    if task is None:
        raise _not_found()
    return task


@router.put("/tasks/{task_id}", response_model=TaskOut)
def update_task(task_id: int, payload: TaskIn):
    task = db.update_task(db.default_db_path(), task_id, payload.to_record())
    if task is None:
        raise _not_found()
    return task


@router.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int):
    if not db.delete_task(db.default_db_path(), task_id):
        raise _not_found()
    return Response(status_code=204)


@router.get("/dashboard/summary", response_model=DashboardSummary)
def dashboard_summary():
    return db.get_summary(db.default_db_path())
