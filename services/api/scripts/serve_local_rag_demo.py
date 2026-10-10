"""Run the existing reviewer-authenticated API with eight actual draft records locally.

The disposable schema contains no published schemes and is dropped on normal shutdown.
Run from services/api with its authorized private .env; this does not build the full index.
"""

import os
from pathlib import Path
from uuid import uuid4

import certifi
import uvicorn
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.db.base import Base
from app.db.session import create_database_engine
from app.main import create_app
from app.modules.ai.notebook_import import stage_notebook_export
from app.modules.ai.settings import AISettings
from app.modules.ai.staging_search import (
    EmbeddingUnavailable,
    document_text,
    embed,
    pool_document_vectors,
    prepare_document_chunks,
    replace_snapshot,
)

DEMO_SLUGS = (
    "ky-smsp",
    "facapabgist",
    "financial-assistance-scheme",
    "cm-sky",
    "apy",
    "pmjdy",
    "nhdpccwms",
    "pmsfbcs",
)


def main() -> int:
    engine = None
    schema = None
    os.environ.setdefault("SSL_CERT_FILE", certifi.where())
    try:
        settings, ai = Settings(), AISettings()
        if (
            settings.app_env != "development"
            or not settings.admin_review_token
            or not settings.admin_reviewer_id
        ):
            raise ValueError("Development reviewer configuration required")
        staged = stage_notebook_export(Path("../../data/schemes/schemes_clean.json"))
        items = staged["records"]
        assert isinstance(items, list)
        records = {item["record"]["slug"]: item for item in items}
        selected = [records[slug] for slug in DEMO_SLUGS]
        print("Preparing 8 actual unverified sample records; full index untouched.", flush=True)
        chunks = prepare_document_chunks(ai, [document_text(item["record"]) for item in selected])
        vectors = pool_document_vectors(
            chunks,
            embed(
                ai, [part for group in chunks for part, _ in group], "RETRIEVAL_DOCUMENT", retries=2
            ),
        )
        engine = create_database_engine(settings)
        proposed = "rag_local_demo_" + uuid4().hex
        with engine.begin() as connection:
            connection.execute(text(f'CREATE SCHEMA "{proposed}"'))
        schema = proposed
        isolated = engine.execution_options(schema_translate_map={None: schema})
        Base.metadata.create_all(isolated)
        with Session(isolated) as session, session.begin():
            replace_snapshot(
                session, {"records": selected, "input_sha256": staged["input_sha256"]}, vectors
            )
        app = create_app(settings, database_engine=isolated)
        assert not app.dependency_overrides
        print(
            "Reviewer RAG demo ready: http://localhost:8000 (8 unpublished draft records).",
            flush=True,
        )
        uvicorn.run(app, host="127.0.0.1", port=8000, log_level="warning", access_log=False)
        return 0
    except (ValueError, KeyError, OSError, EmbeddingUnavailable, SQLAlchemyError) as exc:
        print(
            f"Local demo unavailable ({type(exc).__name__}); check private config/provider quota.",
            flush=True,
        )
        return 1
    finally:
        if engine is not None:
            if schema is not None:
                try:
                    with engine.begin() as connection:
                        connection.execute(text(f'DROP SCHEMA "{schema}" CASCADE'))
                except SQLAlchemyError:
                    print(
                        "Could not remove the temporary demo schema.",
                        flush=True,
                    )
            engine.dispose()


if __name__ == "__main__":
    raise SystemExit(main())
