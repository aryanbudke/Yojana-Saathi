"""Local-only CLI for seed validation, loading, review, and publication."""

import argparse
import json
from collections.abc import Sequence
from pathlib import Path
from uuid import UUID

from sqlalchemy.orm import Session

from app.db.seed import load_seed_file, seed_database
from app.db.session import create_database_engine
from app.services.curation import publish_scheme_version, review_scheme_version


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="python -m app.cli.curation",
        description="Validate and curate source-backed Yojana Saathi scheme records.",
    )
    commands = parser.add_subparsers(dest="command", required=True)

    validate = commands.add_parser("validate", help="Validate a seed JSON file only.")
    validate.add_argument("path", type=Path)

    seed = commands.add_parser("seed", help="Load a validated seed bundle.")
    seed.add_argument("path", type=Path)

    review = commands.add_parser("review", help="Verify a complete draft version.")
    review.add_argument("version_id", type=UUID)
    review.add_argument("--actor", required=True)

    publish = commands.add_parser("publish", help="Publish a verified version.")
    publish.add_argument("version_id", type=UUID)
    publish.add_argument("--actor", required=True)
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    if args.command == "validate":
        bundle = load_seed_file(args.path)
        print(json.dumps({"valid": True, "schemes": len(bundle.schemes)}))
        return 0

    engine = create_database_engine()
    try:
        with Session(engine) as session, session.begin():
            result: dict[str, str | int]
            if args.command == "seed":
                bundle = load_seed_file(args.path)
                result = {"inserted": seed_database(session, bundle)}
            elif args.command == "review":
                report = review_scheme_version(session, args.version_id, reviewer=args.actor)
                result = {"reviewed": str(args.version_id), **report.__dict__}
            else:
                report = publish_scheme_version(session, args.version_id, actor=args.actor)
                result = {"published": str(args.version_id), **report.__dict__}
    finally:
        engine.dispose()
    print(json.dumps(result, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
