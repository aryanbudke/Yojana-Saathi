"""Numeric answers must never be coerced from boolean choices."""

from uuid import UUID

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.db.models import ProfileFact
from tests.matching.test_api import context as context


@pytest.mark.parametrize("field", ["age", "family_income_inr", "land_area_acres"])
@pytest.mark.parametrize("value", [True, False])
def test_boolean_answer_cannot_replace_confirmed_zero(
    context: tuple[TestClient, Session, str],
    field: str,
    value: bool,
) -> None:
    client, db, sid = context
    confirmed = client.post(
        "/api/v1/profiles/answers", json={"session_id": sid, "field": field, "value": 0}
    )
    assert confirmed.status_code == 200
    rejected = client.post(
        "/api/v1/profiles/answers", json={"session_id": sid, "field": field, "value": value}
    )
    assert rejected.status_code == 422
    assert rejected.json()["error"]["code"] == "VALIDATION_ERROR"
    db.expire_all()
    fact = db.get(ProfileFact, (UUID(sid), field))
    assert fact is not None and fact.value_json == 0
