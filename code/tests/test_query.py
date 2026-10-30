import pytest

from app.core.errors import InvalidQuestion
from app.services.ingestion import IngestionService
from app.services.query import INSUFFICIENT, QueryService


@pytest.fixture
def ingestion(settings, store, embedder, chunker):
    return IngestionService(settings, store, embedder, chunker)


@pytest.fixture
def query(settings, store, embedder, llm):
    return QueryService(settings, store, embedder, llm)


def test_empty_store_returns_fixed_reply_without_llm(query, llm):
    result = query.answer("anything?")
    assert result.answer == INSUFFICIENT and result.sources == []
    assert llm.calls == []


def test_answer_with_sources(ingestion, query, llm):
    ingestion.ingest("pets.txt", b"Cats are small domestic animals that purr and sleep a lot.")
    result = query.answer("Do cats purr and sleep?")
    assert result.answer == llm.reply
    assert result.sources and result.sources[0].filename == "pets.txt"
    system, user = llm.calls[0]
    assert "ONLY" in system and "[1]" in user and "Do cats purr and sleep?" in user


def test_irrelevant_question_skips_llm(ingestion, query, llm):
    ingestion.ingest("pets.txt", b"Cats are small domestic animals.")
    result = query.answer("zzzz qqqq xxxx")
    assert result.answer == INSUFFICIENT and result.sources == []
    assert llm.calls == []


def test_searches_all_documents(ingestion, query):
    ingestion.ingest("cats.txt", b"Cats purr loudly and love naps.")
    ingestion.ingest("rockets.txt", b"Rockets burn fuel to reach orbit around the planet.")
    names = {s.filename for s in query.answer("How do rockets reach orbit?").sources}
    assert "rockets.txt" in names


def test_snippet_is_truncated(ingestion, query, settings):
    ingestion.ingest("long.txt", (b"word " * 40 + b"\n\n") * 3)
    result = query.answer("word")
    assert all(len(s.snippet) <= 300 for s in result.sources)


@pytest.mark.parametrize("q", ["", "   ", "x" * 2001])
def test_invalid_question(query, q):
    with pytest.raises(InvalidQuestion):
        query.answer(q)
