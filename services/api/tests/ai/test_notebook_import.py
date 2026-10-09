"""Notebook records remain staging evidence, even if their metadata claims verification."""

import hashlib
import json
import subprocess
import sys
from pathlib import Path

import pytest
from pydantic import ValidationError

from app.modules.ai.notebook_import import stage_notebook_export
from app.schemas.seed import SeedBundle


def test_staging_preserves_text_and_cannot_be_a_published_seed(tmp_path: Path) -> None:
    record = {
        "scheme_name": "TEST ONLY scheme",
        "slug": "test-only",
        "details": "Unverified description",
        "benefits": "Unverified benefit",
        "eligibility": "Age >=18. Additional Eligibility: registration required.",
        "application": "",
        "documents": None,
        "level": "State",
        "schemeCategory": "Education & Learning",
        "tags": "test",
        "official_url": "",
        "last_verified": "",
        "verification_status": "verified",
    }
    source = tmp_path / "schemes_clean.json"
    source.write_text(json.dumps([record]))
    result = stage_notebook_export(source)
    assert result["input_sha256"] == hashlib.sha256(source.read_bytes()).hexdigest()
    assert result["publication_allowed"] is False
    assert result["records"] == [
        {
            "record": record,
            "review_status": "draft",
            "missing_fields": ["application", "documents", "official_url", "last_verified"],
        }
    ]
    with pytest.raises(ValidationError):
        SeedBundle.model_validate(result)


@pytest.mark.parametrize(
    "payload",
    [
        "not JSON",
        "{}",
        "[]",
        '[{"scheme_name": "Test", "slug": "test", "eligibility": true}]',
        '[{"scheme_name": " ", "slug": "test"}]',
        '[{"scheme_name": "Test"}]',
        '[{"scheme_name": "Test", "slug": "same"}, {"scheme_name": "Other", "slug": " SAME "}]',
    ],
)
def test_invalid_or_duplicate_export_is_rejected(tmp_path: Path, payload: str) -> None:
    source = tmp_path / "input.json"
    source.write_text(payload)
    with pytest.raises(ValueError):
        stage_notebook_export(source)


def test_missing_policy_fields_are_retained_for_review(tmp_path: Path) -> None:
    source = tmp_path / "input.json"
    record = {"scheme_name": "TEST ONLY scheme", "slug": "test-only"}
    source.write_text(json.dumps([record]))
    rows = stage_notebook_export(source)["records"]
    assert isinstance(rows, list)
    assert rows[0]["record"] == record
    assert "eligibility" in rows[0]["missing_fields"]


def test_cli_connects_export_and_never_overwrites_output(tmp_path: Path) -> None:
    script = Path(__file__).parents[2] / "scripts/import_notebook_dataset.py"
    source = tmp_path / "input.json"
    source.write_text('[{"scheme_name": "TEST ONLY", "slug": "test-only"}]')
    output = tmp_path / "staging.json"
    command = [sys.executable, str(script), str(source), "--output", str(output)]
    first = subprocess.run(command, capture_output=True, text=True, check=False)
    assert first.returncode == 0, first.stderr
    original = output.read_bytes()
    assert json.loads(original)["publication_allowed"] is False
    second = subprocess.run(command, capture_output=True, text=True, check=False)
    assert second.returncode == 2
    assert output.read_bytes() == original
    source.write_text("not JSON")
    failed_output = tmp_path / "failed.json"
    failed = subprocess.run(
        [sys.executable, str(script), str(source), "--output", str(failed_output)],
        capture_output=True,
        text=True,
        check=False,
    )
    assert failed.returncode == 2
    assert not failed_output.exists()
