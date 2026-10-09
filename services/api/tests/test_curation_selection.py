"""First-batch curation selection integrity tests."""

import json
from pathlib import Path
from urllib.parse import urlparse


def test_first_curation_batch_has_ten_unique_official_candidates() -> None:
    selection_path = Path(__file__).parents[3] / "data" / "curation" / "selected-schemes-v1.json"
    selection = json.loads(selection_path.read_text(encoding="utf-8"))
    schemes = selection["schemes"]

    assert selection["selection_version"] == "1.0"
    assert len(schemes) == 10
    assert len({scheme["draft_slug"] for scheme in schemes}) == 10
    assert all(scheme["verification_status"] == "research_pending" for scheme in schemes)

    allowed_hosts = {
        "pmkisan.gov.in",
        "www.pmuy.gov.in",
        "www.mohua.gov.in",
        "pfrda.org.in",
        "pmjdy.gov.in",
        "www.wcd.gov.in",
        "pmjay.gov.in",
        "pmvishwakarma.gov.in",
        "scholarships.gov.in",
        "soilhealth.dac.gov.in",
    }
    for scheme in schemes:
        parsed = urlparse(scheme["primary_source_candidate"])
        assert parsed.scheme == "https"
        assert parsed.hostname in allowed_hosts
