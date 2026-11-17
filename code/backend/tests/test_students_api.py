from tests.conftest import make_student


def test_create_and_get(client):
    r = client.post("/api/students", json=make_student(name="  Asha Rao  "))
    assert r.status_code == 201
    body = r.json()
    assert body["name"] == "Asha Rao"
    assert body["id"] > 0
    got = client.get(f"/api/students/{body['id']}")
    assert got.status_code == 200
    assert got.json()["email"] == "asha@example.com"


def test_validation_errors(client):
    r = client.post("/api/students", json={})
    assert r.status_code == 422
    errs = r.json()["errors"]
    assert errs["name"] == "Name is required"
    assert errs["email"] == "Email is required"
    assert errs["phone"] == "Phone is required"
    assert errs["course"] == "Course is required"
    assert errs["enrollment_date"] == "Enrollment date is required"


def test_invalid_formats(client):
    r = client.post(
        "/api/students",
        json=make_student(email="nope", phone="12ab", enrollment_date="2024-13-45"),
    )
    assert r.status_code == 422
    errs = r.json()["errors"]
    assert errs["email"] == "Enter a valid email address"
    assert errs["phone"] == "Enter a valid phone number (7-15 digits)"
    assert errs["enrollment_date"] == "Enter a valid date"


def test_future_date_allowed(client):
    assert client.post("/api/students", json=make_student(enrollment_date="2999-01-01")).status_code == 201


def test_duplicate_email_case_insensitive(client):
    client.post("/api/students", json=make_student())
    r = client.post("/api/students", json=make_student(email="ASHA@Example.com"))
    assert r.status_code == 409
    assert r.json() == {"field": "email", "message": "A student with this email already exists"}


def test_update_own_email_ok_and_duplicate_rejected(client):
    a = client.post("/api/students", json=make_student()).json()
    b = client.post("/api/students", json=make_student(email="b@example.com")).json()
    ok = client.put(f"/api/students/{a['id']}", json=make_student(name="New Name"))
    assert ok.status_code == 200
    assert ok.json()["name"] == "New Name"
    assert ok.json()["created_at"] == a["created_at"]
    dup = client.put(f"/api/students/{b['id']}", json=make_student(email="asha@example.com"))
    assert dup.status_code == 409


def test_update_unknown_404(client):
    assert client.put("/api/students/999", json=make_student()).status_code == 404


def test_delete(client):
    s = client.post("/api/students", json=make_student()).json()
    assert client.delete(f"/api/students/{s['id']}").status_code == 204
    assert client.get(f"/api/students/{s['id']}").status_code == 404
    assert client.delete(f"/api/students/{s['id']}").status_code == 404


def test_list_newest_first(client):
    client.post("/api/students", json=make_student(email="1@example.com", name="First"))
    client.post("/api/students", json=make_student(email="2@example.com", name="Second"))
    names = [s["name"] for s in client.get("/api/students").json()]
    assert names == ["Second", "First"]
