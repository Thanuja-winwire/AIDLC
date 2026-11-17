def body(**kw):
    data = {"title": "Task", "description": "desc", "priority": "Medium", "due_date": "2030-05-01", "status": "Pending"}
    data.update(kw)
    return data


def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}


def test_create_defaults_and_trim(client):
    r = client.post("/api/tasks", json={"title": "  Hello  "})
    assert r.status_code == 201
    t = r.json()
    assert t["title"] == "Hello" and t["status"] == "Pending" and t["priority"] == "Medium"
    assert t["due_date"] is None and t["description"] == ""


def test_create_validation_errors(client):
    assert client.post("/api/tasks", json={"title": "   "}).status_code == 422
    assert client.post("/api/tasks", json={"title": "x" * 201}).status_code == 422
    assert client.post("/api/tasks", json=body(status="Nope")).status_code == 422
    assert client.post("/api/tasks", json=body(priority="Urgent")).status_code == 422
    assert client.post("/api/tasks", json=body(due_date="not-a-date")).status_code == 422


def test_get_update_delete_flow(client):
    tid = client.post("/api/tasks", json=body()).json()["id"]
    assert client.get(f"/api/tasks/{tid}").status_code == 200
    r = client.put(f"/api/tasks/{tid}", json=body(title="Edited", status="In Progress"))
    assert r.status_code == 200 and r.json()["title"] == "Edited" and r.json()["status"] == "In Progress"
    assert client.delete(f"/api/tasks/{tid}").status_code == 204
    assert client.get(f"/api/tasks/{tid}").status_code == 404


def test_missing_task_404(client):
    assert client.get("/api/tasks/999").status_code == 404
    assert client.put("/api/tasks/999", json=body()).status_code == 404
    assert client.delete("/api/tasks/999").status_code == 404


def test_filters(client):
    client.post("/api/tasks", json=body(title="a", status="Pending", priority="High"))
    client.post("/api/tasks", json=body(title="b", status="Completed", priority="High"))
    client.post("/api/tasks", json=body(title="c", status="Pending", priority="Low"))
    assert len(client.get("/api/tasks").json()) == 3
    assert [t["title"] for t in client.get("/api/tasks?status=Pending").json()] == ["c", "a"]
    assert [t["title"] for t in client.get("/api/tasks?status=Pending&priority=High").json()] == ["a"]
    assert client.get("/api/tasks?status=Bogus").status_code == 422


def test_dashboard_reflects_changes_and_ignores_filters(client):
    t = client.post("/api/tasks", json=body(priority="High")).json()
    client.post("/api/tasks", json=body(status="Completed", priority="Low"))
    s = client.get("/api/dashboard/summary").json()
    assert s["total"] == 2 and s["by_status"]["Pending"] == 1 and s["by_priority"]["High"] == 1
    client.put(f"/api/tasks/{t['id']}", json=body(status="Completed", priority="High"))
    assert client.get("/api/dashboard/summary").json()["by_status"]["Completed"] == 2
    client.delete(f"/api/tasks/{t['id']}")
    assert client.get("/api/dashboard/summary").json()["total"] == 1
