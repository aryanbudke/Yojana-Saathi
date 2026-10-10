"""OTP-gated eligibility decision routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.api.dependencies import get_db_session
from app.core.config import Settings
from app.schemas.verification import (
    EligibilityDecisionResponse,
    NotificationRetryRequest,
    NotificationStatus,
    VerificationConfirmRequest,
    VerificationStartRequest,
    VerificationStartResponse,
)
from app.services.google_apps_script import GoogleAppsScriptClient, GoogleAppsScriptError
from app.services.profiles import ProfileSessionNotFoundError
from app.services.verification import (
    RESEND_COOLDOWN_SECONDS,
    VerificationFlowError,
    confirm_verification,
    notification_retry_token,
    retry_notification,
    start_verification,
)

router = APIRouter(prefix="/api/v1/verification", tags=["verification"])


def get_verification_dependencies(request: Request) -> tuple[GoogleAppsScriptClient, str]:
    settings: Settings = request.app.state.settings
    if (
        settings.gas_web_app_url is None
        or settings.gas_shared_secret is None
        or settings.verification_state_secret is None
    ):
        raise HTTPException(
            status_code=503, detail="Email verification is not configured on this server."
        )
    return (
        GoogleAppsScriptClient(
            settings.gas_web_app_url, settings.gas_shared_secret.get_secret_value()
        ),
        settings.verification_state_secret.get_secret_value(),
    )


VerificationDependencies = Annotated[
    tuple[GoogleAppsScriptClient, str], Depends(get_verification_dependencies)
]


@router.post("/start", response_model=VerificationStartResponse)
def start(
    payload: VerificationStartRequest,
    dependencies: VerificationDependencies,
    session: Annotated[Session, Depends(get_db_session)],
) -> VerificationStartResponse:
    gas, state_secret = dependencies
    try:
        started = start_verification(
            session,
            gas,
            state_secret,
            session_id=payload.session_id,
            scheme_id=payload.scheme_id,
            name=payload.name,
            email=payload.email,
        )
    except ProfileSessionNotFoundError:
        raise HTTPException(
            status_code=404, detail="Profile session not found or expired."
        ) from None
    except VerificationFlowError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from None
    except GoogleAppsScriptError as exc:
        raise _gas_http_error(exc) from None
    return VerificationStartResponse(
        verification_token=started.token,
        expires_at=started.expires_at,
        resend_after_seconds=RESEND_COOLDOWN_SECONDS,
    )


@router.post("/confirm", response_model=EligibilityDecisionResponse)
def confirm(
    payload: VerificationConfirmRequest,
    dependencies: VerificationDependencies,
    session: Annotated[Session, Depends(get_db_session)],
) -> EligibilityDecisionResponse:
    gas, state_secret = dependencies
    try:
        decision = confirm_verification(
            session, gas, state_secret, token=payload.verification_token, otp=payload.otp
        )
    except ProfileSessionNotFoundError:
        raise HTTPException(
            status_code=404, detail="Profile session not found or expired."
        ) from None
    except VerificationFlowError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from None
    except GoogleAppsScriptError as exc:
        raise _gas_http_error(exc) from None

    notification_status = NotificationStatus.SENT
    retry_token = None
    try:
        result = gas.send_result(decision.notification_payload)
        if result.get("already_sent") is True:
            notification_status = NotificationStatus.ALREADY_SENT
    except GoogleAppsScriptError as exc:
        if not exc.retryable:
            raise _gas_http_error(exc) from None
        notification_status = NotificationStatus.FAILED_RETRYABLE
        retry_token = notification_retry_token(decision, state_secret)
    session.commit()
    return EligibilityDecisionResponse(
        status=decision.status,
        scheme_id=decision.scheme_id,
        scheme_name=decision.scheme_name,
        reason=decision.reason,
        next_steps=decision.next_steps,
        notification_status=notification_status,
        notification_retry_token=retry_token,
    )


@router.post("/notifications/retry", response_model=EligibilityDecisionResponse)
def retry(
    payload: NotificationRetryRequest,
    dependencies: VerificationDependencies,
) -> EligibilityDecisionResponse:
    gas, state_secret = dependencies
    try:
        state = retry_notification(
            gas, state_secret, token=payload.notification_retry_token
        )
        decision = state.get("decision")
        if not isinstance(decision, dict):
            raise VerificationFlowError(400, "The notification retry response is invalid.")
        return EligibilityDecisionResponse.model_validate(
            decision
            | {
                "notification_status": "already_sent"
                if state.get("already_sent") is True
                else "sent",
                "notification_retry_token": None,
            }
        )
    except VerificationFlowError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from None
    except GoogleAppsScriptError as exc:
        raise _gas_http_error(exc) from None


def _gas_http_error(exc: GoogleAppsScriptError) -> HTTPException:
    status_codes = {
        "invalid_otp": 400,
        "otp_expired": 400,
        "otp_used": 409,
        "too_many_attempts": 429,
        "resend_cooldown": 429,
        "rate_limited": 429,
        "unauthorized": 502,
        "replay_detected": 502,
    }
    return HTTPException(
        status_code=status_codes.get(exc.code, 503 if exc.retryable else 502),
        detail=str(exc),
    )
