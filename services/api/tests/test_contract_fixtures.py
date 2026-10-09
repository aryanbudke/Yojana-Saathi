"""Validate frontend fixtures against the public DTO contract."""

from pathlib import Path

import pytest
from pydantic import BaseModel, ValidationError

from app.schemas.common import ErrorResponse
from app.schemas.guidance import GuidanceResponse
from app.schemas.matching import MatchesResponse
from app.schemas.profile import ProfileExtractRequest, ProfileExtractResponse, ProfileFacts
from app.schemas.question import NextQuestionResponse
from app.schemas.scheme import SchemeDetailResponse, SchemeListResponse

FIXTURES = Path(__file__).parents[3] / "packages" / "contracts" / "fixtures"


@pytest.mark.parametrize(
    ("filename", "schema"),
    [
        ("profile-extract.response.json", ProfileExtractResponse),
        ("matches.response.json", MatchesResponse),
        ("question-next.response.json", NextQuestionResponse),
        ("schemes-list.response.json", SchemeListResponse),
        ("scheme-detail.response.json", SchemeDetailResponse),
        ("guidance.response.json", GuidanceResponse),
        ("error.response.json", ErrorResponse),
    ],
)
def test_public_fixture_matches_schema(filename: str, schema: type[BaseModel]) -> None:
    payload = (FIXTURES / filename).read_text()

    schema.model_validate_json(payload)


def test_contract_models_forbid_unknown_fields() -> None:
    with pytest.raises(ValidationError, match="extra_forbidden"):
        ProfileFacts(age=24, guessed_field=True)  # type: ignore[call-arg]


def test_profile_text_is_trimmed_and_bounded() -> None:
    request = ProfileExtractRequest(text="  I am a farmer in Maharashtra.  ")

    assert request.text == "I am a farmer in Maharashtra."
    with pytest.raises(ValidationError):
        ProfileExtractRequest(text=" " * 10)


def test_question_contract_rejects_partial_question_metadata() -> None:
    with pytest.raises(ValidationError):
        NextQuestionResponse(question="What is your age?")


def test_http_sources_must_use_https() -> None:
    payload = (
        (FIXTURES / "guidance.response.json")
        .read_text()
        .replace(
            "https://scheme.example.invalid/source",
            "http://scheme.example.invalid/source",
        )
    )

    with pytest.raises(ValidationError):
        GuidanceResponse.model_validate_json(payload)
