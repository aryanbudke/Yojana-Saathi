"""Supabase-facing database security migration tests."""

from pathlib import Path


def test_all_application_tables_enable_row_level_security() -> None:
    migration = (
        Path(__file__).parents[1] / "migrations" / "versions" / "20261009_0004_enable_rls.py"
    ).read_text()

    expected_tables = (
        "schemes",
        "scheme_versions",
        "sources",
        "eligibility_rules",
        "required_documents",
        "application_steps",
        "profile_sessions",
        "profile_facts",
        "match_runs",
        "match_results",
        "saved_schemes",
        "admin_audit_log",
    )
    for table_name in expected_tables:
        assert f'"{table_name}"' in migration

    assert "ENABLE ROW LEVEL SECURITY" in migration
    assert 'down_revision: str | None = "20261009_0003"' in migration
