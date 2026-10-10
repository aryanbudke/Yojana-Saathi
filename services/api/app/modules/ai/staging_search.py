"""Curator-only semantic search over unverified notebook records (pgvector + Gemini embeddings).

Results are discovery leads for curation. They never feed matching, questions or guidance.
"""

import json
import math
import time
from collections.abc import Mapping, Sequence
from functools import lru_cache
from http.client import HTTPException
from typing import Literal, cast
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from pydantic import BaseModel, ConfigDict, Field, ValidationError
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.db.models import STAGING_EMBEDDING_DIMENSIONS, StagingScheme
from app.modules.ai.prompts import STAGING_ANSWER_PROMPT
from app.modules.ai.settings import AISettings

_BATCH_SIZE = 100
_RATE_LIMIT_WAIT_SECONDS = 30
_CONTEXT_CHARS_PER_RECORD = 32000
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


class AnswerUnavailable(RuntimeError):
    pass


class _AnswerDraft(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid")
    answer: str = Field(min_length=1, max_length=6000)
    cited_slugs: list[str] = Field(max_length=50)


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
                limit = expected * STAGING_EMBEDDING_DIMENSIONS * 32 + 4096
                raw = response.read(limit + 1)
            if len(raw) > limit:
                raise ValueError("Oversized embedding response")
            embeddings = json.loads(raw)["embeddings"]
            vectors = [item["values"] for item in embeddings]
            _validate_vectors(vectors, expected)
            return [[float(value) for value in vector] for vector in vectors]
        except HTTPError as error:
            if error.code == 429 and attempt < retries:
                time.sleep(_RATE_LIMIT_WAIT_SECONDS)
                continue
            raise EmbeddingUnavailable(f"Gemini embedding request failed ({error.code})") from None
        except (
            OSError,
            HTTPException,
            ValueError,
            TypeError,
            KeyError,
            AttributeError,
            RecursionError,
            OverflowError,
        ):
            raise EmbeddingUnavailable("Gemini embedding request failed") from None
    raise EmbeddingUnavailable("Gemini embedding rate limit persisted")


def _validate_vectors(vectors: Sequence[Sequence[float]], expected: int) -> None:
    if len(vectors) != expected or any(
        len(vector) != STAGING_EMBEDDING_DIMENSIONS
        or any(
            isinstance(value, bool)
            or not isinstance(value, (int, float))
            or not math.isfinite(value)
            or abs(value) > 3.4028234663852886e38  # pgvector stores float32 components.
            for value in vector
        )
        or not any(vector)
        for vector in vectors
    ):
        raise ValueError("Invalid embedding values or shape")


def replace_snapshot(
    session: Session, staged_export: dict[str, object], vectors: Sequence[Sequence[float]]
) -> int:
    """Swap the whole staging table for one validated export; the caller commits."""

    staged = staged_export["records"]
    if not isinstance(staged, list) or not staged:
        raise ValueError("A nonempty validated staging export is required")
    _validate_vectors(vectors, len(staged))
    rows = [
        StagingScheme(
            slug=(item["record"]["slug"] or "").strip(),
            name=(item["record"]["scheme_name"] or "").strip(),
            record=item["record"],
            missing_fields=item["missing_fields"],
            input_sha256=staged_export["input_sha256"],
            embedding=list(vector),
        )
        for item, vector in zip(staged, vectors, strict=True)
    ]
    session.execute(delete(StagingScheme))
    session.add_all(rows)
    return len(rows)


def search(
    session: Session, query_vector: Sequence[float], limit: int
) -> list[tuple[StagingScheme, float]]:
    distance = StagingScheme.embedding.cosine_distance(list(query_vector)).label("distance")
    rows = session.execute(
        select(StagingScheme, distance).order_by(distance, StagingScheme.slug).limit(limit)
    )
    return [(row[0], 1.0 - cast(float, row[1])) for row in rows]


def answer(
    settings: AISettings, question: str, hits: Sequence[StagingScheme]
) -> tuple[str, list[str]]:
    """Curator draft answer; reject unknown citations and replace uncited claims with abstention."""

    key = settings.api_key
    if key is None or not key.get_secret_value().strip() or settings.model is None:
        raise AnswerUnavailable("GEMINI_API_KEY and GEMINI_MODEL are required")
    context = []
    for hit in hits:
        text = "\n".join(f"{field}: {value}" for field, value in hit.record.items() if value)
        if len(text) > _CONTEXT_CHARS_PER_RECORD:
            raise AnswerUnavailable("Record exceeds answer context limit; review full source text")
        context.append({"slug": hit.slug, "text": text})
    payload = {
        "systemInstruction": {"parts": [{"text": STAGING_ANSWER_PROMPT}]},
        "contents": [
            {
                "role": "user",
                "parts": [{"text": json.dumps({"question": question, "records": context})}],
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 2048,
            "responseFormat": {
                "text": {"mimeType": "application/json", "schema": _AnswerDraft.model_json_schema()}
            },
        },
    }
    request = Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{settings.model}:generateContent",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json", "x-goog-api-key": key.get_secret_value()},
        method="POST",
    )
    try:
        with urlopen(request, timeout=30) as response:
            raw = response.read(64001)
        if len(raw) > 64000:
            raise ValueError("Oversized answer response")
        candidates = json.loads(raw)["candidates"]
        if len(candidates) != 1 or candidates[0]["finishReason"] != "STOP":
            raise ValueError("Incomplete generation")
        output = "".join(
            part["text"] for part in candidates[0]["content"]["parts"] if not part.get("thought")
        )
        draft = _AnswerDraft.model_validate_json(output)
        if not draft.answer.strip() or set(draft.cited_slugs) - {hit.slug for hit in hits}:
            raise ValueError("Empty answer or unsupported citations")
    except (
        OSError,
        HTTPException,
        ValueError,
        TypeError,
        KeyError,
        IndexError,
        AttributeError,
        RecursionError,
    ):
        raise AnswerUnavailable("Gemini answer request failed") from None
    if not draft.cited_slugs:
        return (
            "The retrieved draft records do not provide enough evidence to answer this question.",
            [],
        )
    return draft.answer.strip(), list(dict.fromkeys(draft.cited_slugs))


@lru_cache
def get_ai_settings() -> AISettings:
    try:
        return AISettings()
    except ValidationError:
        return AISettings(_env_file=None, api_key=None, model=None, embedding_model=None)
