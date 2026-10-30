import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from tests.conftest import make_pdf


@pytest.fixture
def client(settings, store, embedder, llm):
    return TestClient(create_app(settings, store=store, embedder=embedder, llm=llm))


def upload(client, name, data, ctype="text/plain"):
    return client.post("/api/documents", files=[("files", (name, data, ctype))])


def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}


def test_upload_list_delete_flow(client):
    r = upload(client, "pets.txt", b"Cats purr and sleep.")
    assert r.status_code == 201
    doc = r.json()[0]
    assert doc["filename"] == "pets.txt" and doc["chunk_count"] == 1

    assert [d["id"] for d in client.get("/api/documents").json()] == [doc["id"]]
    assert client.delete(f"/api/documents/{doc['id']}").status_code == 204
    assert client.get("/api/documents").json() == []


def test_upload_pdf_and_multiple_files(client):
    r = client.post(
        "/api/documents",
        files=[
            ("files", ("a.pdf", make_pdf("Hello pdf"), "application/pdf")),
            ("files", ("b.md", b"# Hi\n\nBody", "text/markdown")),
        ],
    )
    assert r.status_code == 201 and len(r.json()) == 2


def test_query_returns_answer_and_sources(client):
    upload(client, "pets.txt", b"Cats purr and sleep a lot during the day.")
    r = client.post("/api/query", json={"question": "Do cats sleep?"})
    assert r.status_code == 200
    body = r.json()
    assert body["answer"] and body["sources"][0]["filename"] == "pets.txt"


def test_query_on_empty_store(client):
    body = client.post("/api/query", json={"question": "hi?"}).json()
    assert "don't have enough information" in body["answer"] and body["sources"] == []


def test_error_codes(client, embedder):
    assert upload(client, "x.exe", b"1").status_code == 400
    assert upload(client, "blank.txt", b"  ").status_code == 400
    assert upload(client, "big.txt", b"a" * (1024 * 1024 + 1)).status_code == 413
    assert client.delete("/api/documents/nope").status_code == 404
    assert client.post("/api/query", json={"question": "  "}).status_code == 400
    embedder.fail = True
    r = upload(client, "ok.txt", b"hello")
    assert r.status_code == 502 and "detail" in r.json()


def test_missing_api_key_fails_fast(tmp_path):
    from app.core.errors import ConfigError
    from app.core.settings import Settings

    with pytest.raises(ConfigError):
        create_app(Settings(openai_api_key="", chroma_dir=str(tmp_path / "c")))
