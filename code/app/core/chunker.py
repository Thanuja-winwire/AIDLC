"""Fixed-size character chunker with overlap that prefers natural boundaries (R-CHUNK-*)."""
from __future__ import annotations

_SENTENCE_ENDS = (". ", "! ", "? ", ".\n", "!\n", "?\n")


class Chunker:
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 150):
        if chunk_size <= 0:
            raise ValueError("chunk_size must be > 0")
        if not 0 <= chunk_overlap < chunk_size:
            raise ValueError("chunk_overlap must be >= 0 and < chunk_size")
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def _cut_point(self, text: str, start: int, end: int) -> int:
        """Best split position in (start, end]: paragraph, then sentence, then whitespace."""
        floor = start + self.chunk_size // 2
        window = text[start:end]
        min_rel = floor - start

        idx = window.rfind("\n\n")
        if idx >= min_rel:
            return start + idx + 2

        best = -1
        for token in _SENTENCE_ENDS:
            best = max(best, window.rfind(token))
        if best >= min_rel:
            return start + best + 2

        for ws in ("\n", " ", "\t"):
            idx = window.rfind(ws)
            if idx >= min_rel:
                return start + idx + 1
        return end  # hard split

    def split(self, text: str) -> list[str]:
        text = text.replace("\r\n", "\n").strip()
        chunks: list[str] = []
        start, length = 0, len(text)
        while start < length:
            end = min(start + self.chunk_size, length)
            if end < length:
                end = self._cut_point(text, start, end)
            piece = text[start:end].strip()
            if piece:
                chunks.append(piece)
            if end >= length:
                break
            next_start = end - self.chunk_overlap
            start = next_start if next_start > start else end
        return chunks
