"""Synthetic chunk coverage and scheme-vector pooling; no provider calls."""

import json
import math
from io import BytesIO
from typing import Any
from urllib.request import Request

import pytest

from app.modules.ai import staging_search
from tests.ai.test_staging_search import configured, unit_vector


@pytest.mark.parametrize("text", ["", "plain synthetic text", "हिंदी 🌾\n" * 40, "X" * 80])
def test_chunks_preserve_every_character_and_check_every_leaf(
    monkeypatch: pytest.MonkeyPatch, text: str
) -> None:
    counted: dict[str, int] = {}

    def transport(request: Request, *, timeout: int) -> BytesIO:
        if request.data is None:
            response: dict[str, Any] = {"inputTokenLimit": 10}
        else:
            assert isinstance(request.data, bytes)
            value = json.loads(request.data)["contents"][0]["parts"][0]["text"]
            counted[value] = max(1, len(value))
            response = {"totalTokens": counted[value]}
        return BytesIO(json.dumps(response).encode())

    monkeypatch.setattr(staging_search, "urlopen", transport)
    texts = ["S", text, "SHORT"]
    groups = staging_search.prepare_document_chunks(configured(), texts)
    assert len(groups) == len(texts)
    for original, group in zip(texts, groups, strict=True):
        assert "".join(chunk for chunk, _ in group) == original
        assert all(count == counted[chunk] and 0 < count <= 10 for chunk, count in group)


def test_newline_split_preserves_full_lines(monkeypatch: pytest.MonkeyPatch) -> None:
    def transport(request: Request, *, timeout: int) -> BytesIO:
        response = {"inputTokenLimit": 12}
        if request.data is not None:
            assert isinstance(request.data, bytes)
            value = json.loads(request.data)["contents"][0]["parts"][0]["text"]
            response = {"totalTokens": len(value)}
        return BytesIO(json.dumps(response).encode())

    monkeypatch.setattr(staging_search, "urlopen", transport)
    [chunks] = staging_search.prepare_document_chunks(configured(), ["FIRST LINE\nLAST LINE"])
    assert chunks == [("FIRST LINE\n", 11), ("LAST LINE", 9)]


def test_pool_normalizes_each_chunk_before_token_weighting() -> None:
    chunks = [[("synthetic-a", 1), ("synthetic-b", 3)], [("synthetic-c", 2)]]
    vectors = [[value * 100 for value in unit_vector(0)], unit_vector(1), unit_vector(2)]
    pooled = staging_search.pool_document_vectors(chunks, vectors)
    assert len(pooled) == 2
    assert pooled[0][0] == pytest.approx(1 / math.sqrt(10))
    assert pooled[0][1] == pytest.approx(3 / math.sqrt(10))
    assert pooled[1] == unit_vector(2)
    assert all(math.hypot(*vector) == pytest.approx(1) for vector in pooled)


@pytest.mark.parametrize("vectors", [[], [[0.0] * 768], [[float("nan")] * 768], [[1.0]]])
def test_pool_rejects_invalid_chunk_vectors(vectors: list[list[float]]) -> None:
    with pytest.raises(staging_search.EmbeddingUnavailable):
        staging_search.pool_document_vectors([[("SYNTHETIC", 1)]], vectors)


def test_pool_rejects_cancellation_instead_of_inserting_zero_vector() -> None:
    with pytest.raises(staging_search.EmbeddingUnavailable):
        staging_search.pool_document_vectors(
            [[("SYNTHETIC a", 1), ("SYNTHETIC b", 1)]],
            [unit_vector(0), [-value for value in unit_vector(0)]],
        )


@pytest.mark.parametrize("weight", [True, 0, -1, "1"])
def test_pool_rejects_invalid_weights(weight: Any) -> None:
    with pytest.raises(staging_search.EmbeddingUnavailable):
        staging_search.pool_document_vectors([[("SYNTHETIC", weight)]], [unit_vector(0)])


def test_pool_rejects_empty_document_group() -> None:
    with pytest.raises(staging_search.EmbeddingUnavailable):
        staging_search.pool_document_vectors([[]], [])


def test_late_chunk_count_failure_prevents_partial_plan(monkeypatch: pytest.MonkeyPatch) -> None:
    pending = iter(
        [{"inputTokenLimit": 5}, {"totalTokens": 9}, {"totalTokens": 4}, {"totalTokens": "5"}]
    )
    monkeypatch.setattr(
        staging_search, "urlopen", lambda *a, **k: BytesIO(json.dumps(next(pending)).encode())
    )
    with pytest.raises(staging_search.EmbeddingUnavailable):
        staging_search.prepare_document_chunks(configured(), ["SYNTHETIC"])
