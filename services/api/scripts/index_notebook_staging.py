"""Embed schemes_clean.json and replace the curator-only staging search table.

Records stay unverified drafts. This never touches schemes, versions, matching or guidance.
"""

import argparse
from pathlib import Path

from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db.session import create_database_engine
from app.modules.ai.notebook_import import stage_notebook_export
from app.modules.ai.settings import AISettings
from app.modules.ai.staging_search import (
    EmbeddingUnavailable,
    document_text,
    embed,
    replace_snapshot,
    validate_document_lengths,
)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="Notebook export: schemes_clean.json")
    args = parser.parse_args()
    try:
        staged = stage_notebook_export(args.input)
    except (ValueError, OSError) as exc:
        parser.error(str(exc))
    records = staged["records"]
    assert isinstance(records, list)
    print(f"Validated {len(records)} records; checking Gemini input limits...")
    try:
        settings = AISettings()
        texts = [document_text(item["record"]) for item in records]
        validate_document_lengths(settings, texts)
        vectors = embed(
            settings,
            texts,
            "RETRIEVAL_DOCUMENT",
            retries=6,
        )
    except ValidationError:
        parser.error("Invalid Gemini configuration; check server environment settings")
    except EmbeddingUnavailable as exc:
        parser.error(str(exc))
    engine = None
    try:
        engine = create_database_engine()
        with Session(engine) as session, session.begin():
            count = replace_snapshot(session, staged, vectors)
    except (SQLAlchemyError, ValueError):
        parser.error(
            "Indexing failed; no staging changes committed. Check database configuration, "
            "migrations and embedding values."
        )
    finally:
        if engine is not None:
            engine.dispose()
    print(f"Indexed {count} unverified draft records for curator search.")


if __name__ == "__main__":
    main()
