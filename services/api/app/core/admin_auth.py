"""Constant-time role checks for the minimal administrative API."""

from secrets import compare_digest
from typing import Annotated

from fastapi import Header, HTTPException, Request
from pydantic import SecretStr


def require_reviewer(
    request: Request,
    supplied_token: Annotated[str | None, Header(alias="X-Admin-Token")] = None,
) -> str:
    """Return the configured reviewer identity after token verification."""

    return _require_role(
        configured_token=request.app.state.settings.admin_review_token,
        actor_id=request.app.state.settings.admin_reviewer_id,
        supplied_token=supplied_token,
    )


def require_publisher(
    request: Request,
    supplied_token: Annotated[str | None, Header(alias="X-Admin-Token")] = None,
) -> str:
    """Return the configured publisher identity after token verification."""

    return _require_role(
        configured_token=request.app.state.settings.admin_publish_token,
        actor_id=request.app.state.settings.admin_publisher_id,
        supplied_token=supplied_token,
    )


def _require_role(
    *,
    configured_token: SecretStr | None,
    actor_id: str | None,
    supplied_token: str | None,
) -> str:
    if configured_token is None or actor_id is None:
        raise HTTPException(status_code=503, detail="Administrative role is not configured.")
    expected = configured_token.get_secret_value()
    if supplied_token is None or not compare_digest(supplied_token, expected):
        raise HTTPException(status_code=403, detail="Administrative role is required.")
    return actor_id
