"""Integrity checks for the primary-source research audit."""

import json
from pathlib import Path
from urllib.parse import urlparse

AUDIT_PATH = Path(__file__).parents[3] / "data" / "curation" / "source-audit-v1.json"


def test_source_audit_covers_selection_without_claiming_publication() -> None:
    audit = json.loads(AUDIT_PATH.read_text(encoding="utf-8"))
    selection_path = AUDIT_PATH.with_name("selected-schemes-v1.json")
    selection = json.loads(selection_path.read_text(encoding="utf-8"))

    selected_slugs = {scheme["draft_slug"] for scheme in selection["schemes"]}
    audited_slugs = {scheme["draft_slug"] for scheme in audit["schemes"]}

    assert audited_slugs == selected_slugs
    assert audit["publication_status"] == "research_only_not_independently_reviewed"
    assert all(scheme["sources"] for scheme in audit["schemes"])
    assert all(scheme["eligibility_facts"] for scheme in audit["schemes"])
    assert all(scheme["benefit_facts"] for scheme in audit["schemes"])
    assert all(scheme["policy_date_note"] for scheme in audit["schemes"])


def test_source_audit_uses_only_primary_government_hosts() -> None:
    audit = json.loads(AUDIT_PATH.read_text(encoding="utf-8"))
    allowed_hosts = {
        "beneficiary.nha.gov.in",
        "hem.nha.gov.in",
        "mohua.gov.in",
        "pfrda.org.in",
        "pmjdy.gov.in",
        "pmkisan.gov.in",
        "pmvishwakarma.gov.in",
        "scholarships.gov.in",
        "soilhealth.dac.gov.in",
        "www.mohua.gov.in",
        "www.pib.gov.in",
        "www.pmuy.gov.in",
        "www.spniwcd.wcd.gov.in",
    }

    for scheme in audit["schemes"]:
        for source in scheme["sources"]:
            parsed = urlparse(source["url"])
            assert parsed.scheme == "https"
            assert parsed.hostname in allowed_hosts
            assert source["checked_at"] == audit["audited_at"]
            assert source["locator"]
