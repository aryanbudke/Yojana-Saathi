"""Embed schemes_clean.json and replace the curator-only staging search table.

Records stay unverified drafts. This never touches schemes, versions, matching or guidance.
"""

import argparse
from pathlib import Path

from sqlalchemy.orm import Session

from app.db.session import create_database_engine
from app.modules.ai.notebook_import import stage_notebook_export
from app.modules.ai.settings import AISettings
from app.modules.ai.staging_search import (
    EmbeddingUnavailable,
    document_text,
    embed,
    replace_snapshot,
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
    print(f"Validated {len(records)} records; embedding with Gemini...")
    try:
        vectors = embed(
            AISettings(),
            [document_text(item["record"]) for item in records],
            "RETRIEVAL_DOCUMENT",
            retries=6,
        )
    except EmbeddingUnavailable as exc:
        parser.error(str(exc))
    engine = create_database_engine()
    try:
        with Session(engine) as session:
            count = replace_snapshot(session, staged, vectors)
            session.commit()
    finally:
        engine.dispose()
    print(f"Indexed {count} unverified draft records for curator search.")


if __name__ == "__main__":
    main()
