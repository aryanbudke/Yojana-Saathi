"""Curator-only semantic search over unverified notebook records (pgvector + Gemini embeddings).

Results are discovery leads for curation. They never feed matching, questions or guidance.
"""

import json
import time
from collections.abc import Mapping, Sequence
from functools import lru_cache
from http.client import HTTPException
from typing import Literal, cast
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from pydantic import ValidationError
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.db.models import STAGING_EMBEDDING_DIMENSIONS, StagingScheme
from app.modules.ai.settings import AISettings

_BATCH_SIZE = 100
_RATE_LIMIT_WAIT_SECONDS = 30
_DOCUMENT_FIELDS = (
    "scheme_name",
    "level",
    "schemeCategory",
    "details",
    "benefits",
    "eligibility",
    "tags",
)

TaskType = Literal["RETRIEVAL_DOCUMENT", "RETRIEVAL_QUERY"]


class EmbeddingUnavailable(RuntimeError):
    pass


def document_text(record: dict[str, str | None]) -> str:
    """Text embedded per record; application steps and documents add noise to retrieval."""

    return "\n".join(f"{field}: {record.get(field) or ''}" for field in _DOCUMENT_FIELDS)


def embed(
    settings: AISettings, texts: Sequence[str], task: TaskType, *, retries: int = 0
) -> list[list[float]]:
    key = settings.api_key
    model = settings.embedding_model
    if key is None or not key.get_secret_value().strip() or model is None:
        raise EmbeddingUnavailable("GEMINI_API_KEY and GEMINI_EMBEDDING_MODEL are required")
    vectors: list[list[float]] = []
    for start in range(0, len(texts), _BATCH_SIZE):
        batch = texts[start : start + _BATCH_SIZE]
        payload = {
            "requests": [
                {
                    "model": f"models/{model}",
                    "content": {"parts": [{"text": text}]},
                    "taskType": task,
                    "outputDimensionality": STAGING_EMBEDDING_DIMENSIONS,
                }
                for text in batch
            ]
        }
        vectors.extend(_post_batch(key.get_secret_value(), model, payload, len(batch), retries))
    return vectors


def _post_batch(
    key: str, model: str, payload: Mapping[str, object], expected: int, retries: int
) -> list[list[float]]:
    request = Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:batchEmbedContents",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json", "x-goog-api-key": key},
        method="POST",
    )
    for attempt in range(retries + 1):
        try:
            with urlopen(request, timeout=30) as response:
                embeddings = json.loads(response.read())["embeddings"]
            vectors = [[float(value) for value in item["values"]] for item in embeddings]
            if len(vectors) != expected or any(
                len(vector) != STAGING_EMBEDDING_DIMENSIONS for vector in vectors
            ):
                raise ValueError("Unexpected embedding shape")
            return vectors
        except HTTPError as error:
            if error.code == 429 and attempt < retries:
                time.sleep(_RATE_LIMIT_WAIT_SECONDS)
                continue
            raise EmbeddingUnavailable(f"Gemini embedding request failed ({error.code})") from None
        except (OSError, HTTPException, ValueError, TypeError, KeyError):
            raise EmbeddingUnavailable("Gemini embedding request failed") from None
    raise EmbeddingUnavailable("Gemini embedding rate limit persisted")


def replace_snapshot(
    session: Session, staged_export: dict[str, object], vectors: Sequence[Sequence[float]]
) -> int:
    """Swap the whole staging table for one validated export; the caller commits."""

    staged = staged_export["records"]
    assert isinstance(staged, list) and len(staged) == len(vectors)
    session.execute(delete(StagingScheme))
    session.add_all(
        StagingScheme(
            slug=(item["record"]["slug"] or "").strip(),
            name=(item["record"]["scheme_name"] or "").strip(),
            record=item["record"],
            missing_fields=item["missing_fields"],
            input_sha256=staged_export["input_sha256"],
            embedding=list(vector),
        )
        for item, vector in zip(staged, vectors, strict=True)
    )
    return len(staged)


def search(
    session: Session, query_vector: Sequence[float], limit: int
) -> list[tuple[StagingScheme, float]]:
    distance = StagingScheme.embedding.cosine_distance(list(query_vector)).label("distance")
    rows = session.execute(select(StagingScheme, distance).order_by(distance).limit(limit))
    return [(row[0], 1.0 - cast(float, row[1])) for row in rows]


@lru_cache
def get_ai_settings() -> AISettings:
    try:
        return AISettings()
    except ValidationError:
        return AISettings(_env_file=None, api_key=None, model=None, embedding_model=None)
