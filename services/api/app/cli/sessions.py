"""Operational maintenance commands for ephemeral profile sessions."""

import argparse
import json
from collections.abc import Sequence

from sqlalchemy.orm import Session

from app.db.session import create_database_engine
from app.services.profiles import purge_expired_sessions


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="python -m app.cli.sessions",
        description="Maintain short-lived anonymous profile sessions.",
    )
    parser.add_argument(
        "command",
        choices=["purge-expired"],
        help="Delete expired sessions and dependent transient records.",
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    engine = create_database_engine()
    try:
        with Session(engine) as session, session.begin():
            deleted = purge_expired_sessions(session)
    finally:
        engine.dispose()
    print(json.dumps({"deleted_sessions": deleted, "operation": args.command}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
