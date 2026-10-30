import pytest

from app.core.chunker import Chunker


def test_short_text_is_single_chunk():
    assert Chunker(100, 10).split("hello world") == ["hello world"]


def test_empty_and_whitespace_text_gives_no_chunks():
    assert Chunker(100, 10).split("   \n\n  ") == []


def test_chunks_respect_size_limit():
    text = " ".join(f"word{i}" for i in range(500))
    chunks = Chunker(200, 30).split(text)
    assert len(chunks) > 1
    assert all(len(c) <= 200 for c in chunks)


def test_prefers_paragraph_boundary():
    para_a = "a" * 60
    para_b = "b" * 60
    chunks = Chunker(100, 10).split(f"{para_a}\n\n{para_b}")
    assert chunks[0] == para_a


def test_overlap_repeats_tail_of_previous_chunk():
    text = " ".join(f"w{i}" for i in range(200))
    chunks = Chunker(100, 30).split(text)
    assert len(chunks) >= 2
    tail = chunks[0][-10:]
    assert tail in chunks[1]


def test_hard_split_when_no_boundary():
    chunks = Chunker(50, 5).split("x" * 180)
    assert len(chunks) >= 4
    assert all(len(c) <= 50 for c in chunks)
    assert "".join(c[:45] if i < len(chunks) - 1 else c for i, c in enumerate(chunks))


def test_all_content_is_covered():
    words = [f"token{i}" for i in range(300)]
    chunks = Chunker(120, 20).split(" ".join(words))
    joined = " ".join(chunks)
    assert all(w in joined for w in words)


def test_invalid_overlap_rejected():
    with pytest.raises(ValueError):
        Chunker(100, 100)
    with pytest.raises(ValueError):
        Chunker(0, 0)
