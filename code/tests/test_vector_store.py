from tests.conftest import fake_vector


def _add(store, doc_id, filename, chunks, pages=None):
    store.add(doc_id, filename, chunks, [fake_vector(c) for c in chunks], pages=pages)


def test_add_and_list(store):
    _add(store, "d1", "a.txt", ["alpha beta", "gamma delta"])
    docs = store.list_documents()
    assert len(docs) == 1
    assert docs[0].filename == "a.txt" and docs[0].chunk_count == 2


def test_query_returns_most_similar_first_with_score(store):
    _add(store, "d1", "a.txt", ["cats purr softly", "rockets launch into orbit"])
    hits = store.query(fake_vector("rockets orbit"), k=2)
    assert hits[0].text == "rockets launch into orbit"
    assert hits[0].score > hits[1].score
    assert 0.0 <= hits[0].score <= 1.0
    assert hits[0].chunk_index == 1


def test_query_on_empty_store_returns_nothing(store):
    assert store.query(fake_vector("anything"), k=3) == []


def test_k_larger_than_count_is_ok(store):
    _add(store, "d1", "a.txt", ["only chunk"])
    assert len(store.query(fake_vector("only"), k=10)) == 1


def test_page_metadata_round_trips(store):
    _add(store, "d1", "a.pdf", ["page text"], pages=[3])
    _add(store, "d2", "b.txt", ["plain text"])
    by_name = {h.filename: h for h in store.query(fake_vector("text"), k=5)}
    assert by_name["a.pdf"].page == 3
    assert by_name["b.txt"].page is None


def test_delete_removes_chunks(store):
    _add(store, "d1", "a.txt", ["one", "two"])
    assert store.delete("d1") is True
    assert store.list_documents() == []
    assert store.count() == 0


def test_delete_unknown_returns_false(store):
    assert store.delete("nope") is False


def test_list_documents_aggregates_multiple_docs(store):
    _add(store, "d1", "a.txt", ["one"])
    _add(store, "d2", "b.txt", ["two", "three"])
    counts = {d.filename: d.chunk_count for d in store.list_documents()}
    assert counts == {"a.txt": 1, "b.txt": 2}
