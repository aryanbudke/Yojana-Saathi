"""Connect schemes_clean.json to a local review artifact without writing to the database."""

import argparse
import json
from pathlib import Path

from app.modules.ai.notebook_import import stage_notebook_export


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="Notebook export: schemes_clean.json")
    parser.add_argument("--output", type=Path, required=True, help="New staging JSON file")
    args = parser.parse_args()
    try:
        staged = stage_notebook_export(args.input)
        output = json.dumps(staged, ensure_ascii=False, indent=2) + "\n"
        with args.output.open("x", encoding="utf-8") as file:
            file.write(output)
    except ValueError as exc:
        parser.error(str(exc))
    except OSError:
        parser.error(
            "Could not read input or create output; use an existing directory and new file"
        )
    print("Staging import complete. All records are drafts; database publication is disabled.")


if __name__ == "__main__":
    main()
