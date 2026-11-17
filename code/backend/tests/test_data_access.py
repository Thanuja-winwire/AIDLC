from app import data_access as db


def make(db_path, **kw):
    data = {"title": "Task", "description": "", "priority": "Medium", "due_date": None, "status": "Pending"}
    data.update(kw)
    return db.create_task(db_path, data)


def test_create_and_get(db_path):
    t = make(db_path, title="Write docs", due_date="2030-01-02")
    assert t["id"] == 1
    assert db.get_task(db_path, t["id"])["due_date"] == "2030-01-02"
    assert t["created_at"] == t["updated_at"]


def test_get_missing_returns_none(db_path):
    assert db.get_task(db_path, 99) is None


def test_update_and_missing(db_path):
    t = make(db_path)
    data = {"title": "New", "description": "d", "priority": "High", "due_date": None, "status": "Completed"}
    u = db.update_task(db_path, t["id"], data)
    assert (u["title"], u["status"], u["priority"]) == ("New", "Completed", "High")
    assert u["created_at"] == t["created_at"]
    assert db.update_task(db_path, 99, data) is None


def test_delete(db_path):
    t = make(db_path)
    assert db.delete_task(db_path, t["id"]) is True
    assert db.delete_task(db_path, t["id"]) is False


def test_filters_and_sort_order(db_path):
    a = make(db_path, title="a", status="Pending", priority="High")
    b = make(db_path, title="b", status="Completed", priority="High")
    c = make(db_path, title="c", status="Pending", priority="Low")
    assert [t["id"] for t in db.list_tasks(db_path)] == [c["id"], b["id"], a["id"]]
    assert [t["id"] for t in db.list_tasks(db_path, status="Pending")] == [c["id"], a["id"]]
    assert [t["id"] for t in db.list_tasks(db_path, status="Pending", priority="High")] == [a["id"]]


def test_summary_has_all_keys(db_path):
    s = db.get_summary(db_path)
    assert s == {
        "total": 0,
        "by_status": {"Pending": 0, "In Progress": 0, "Completed": 0},
        "by_priority": {"Low": 0, "Medium": 0, "High": 0},
    }
    make(db_path, status="In Progress", priority="Low")
    make(db_path)
    s = db.get_summary(db_path)
    assert s["total"] == 2
    assert s["by_status"]["In Progress"] == 1 and s["by_priority"]["Medium"] == 1
