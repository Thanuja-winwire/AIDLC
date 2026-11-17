from tests.conftest import make_student


def _seed(client):
    client.post("/api/students", json=make_student(name="Asha Rao", email="asha@x.com", course="Computer Science"))
    client.post("/api/students", json=make_student(name="Ben Cho", email="ben@x.com", course="computer science "))
    client.post("/api/students", json=make_student(name="Cara 100%", email="cara@x.com", course="Biology"))


def test_search_fields_case_insensitive(client):
    _seed(client)
    assert [s["name"] for s in client.get("/api/students", params={"q": "ASHA"}).json()] == ["Asha Rao"]
    assert len(client.get("/api/students", params={"q": "biolo"}).json()) == 1
    assert len(client.get("/api/students", params={"q": "@x.com"}).json()) == 3
    assert len(client.get("/api/students", params={"q": "98765"}).json()) == 3


def test_search_blank_means_all_and_wildcards_literal(client):
    _seed(client)
    assert len(client.get("/api/students", params={"q": "   "}).json()) == 3
    assert len(client.get("/api/students", params={"q": "%"}).json()) == 1
    assert len(client.get("/api/students", params={"q": "_"}).json()) == 0


def test_dashboard_empty(client):
    assert client.get("/api/dashboard").json() == {"total_students": 0, "courses": []}


def test_dashboard_groups_courses(client):
    _seed(client)
    body = client.get("/api/dashboard").json()
    assert body["total_students"] == 3
    assert body["courses"] == [
        {"course": "Computer Science", "count": 2},
        {"course": "Biology", "count": 1},
    ]
