"""Reproduce synthetic evaluation; do not publish unreviewed agreement as accuracy."""

import argparse
import json
from pathlib import Path

from app.modules.matching.benchmark import FIXTURE, measure


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--fixture", type=Path, default=FIXTURE)
    parser.add_argument(
        "--review", type=Path, help="Independent review manifest for the exact fixture"
    )
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    result = measure(args.fixture, review_path=args.review)
    output = json.dumps(result, indent=2, sort_keys=True) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(output, encoding="utf-8")
    else:
        print(output, end="")
    if result["failures"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
