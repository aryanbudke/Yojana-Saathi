"""Import a candidate archive as private, unverified scheme drafts."""

import argparse
import json
from collections.abc import Sequence
from pathlib import Path

from sqlalchemy.orm import Session

from app.db.draft_import import DEFAULT_MEMBER, import_draft_candidates, load_sarkarseva_drafts
from app.db.session import create_database_engine


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="python -m app.cli.import_drafts",
        description="Import SarkarSeva candidates as unpublished drafts only.",
    )
    parser.add_argument("archive", type=Path)
    parser.add_argument("--member", default=DEFAULT_MEMBER)
    parser.add_argument("--expected-count", type=int, default=3397)
    parser.add_argument(
        "--write",
        action="store_true",
        help="Write drafts to DATABASE_URL; without this flag the command only validates.",
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    candidates = load_sarkarseva_drafts(
        args.archive,
        member=args.member,
        expected_count=args.expected_count,
    )
    if not args.write:
        print(json.dumps({"parsed": len(candidates), "write": False}, sort_keys=True))
        return 0

    engine = create_database_engine()
    try:
        with Session(engine) as session, session.begin():
            result = import_draft_candidates(session, candidates)
    finally:
        engine.dispose()
    print(json.dumps({**result.__dict__, "write": True}, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
