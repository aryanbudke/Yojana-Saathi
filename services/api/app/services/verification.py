"""OTP-gated, server-owned eligibility decisions and notification delivery."""

import base64
import hashlib
import hmac
import json
import secrets
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy.orm import Session

from app.db.enums import Verdict
from app.modules.explanations.service import explain
from app.modules.matching.evaluator import Evaluation, evaluate_candidate
from app.modules.matching.service import ENGINE_VERSION, confirmed_profile, profile_hash, relevance
from app.repositories.matching import CandidateScheme, MatchingRepository, MatchResultWrite
from app.schemas.verification import EligibilityStatus
from app.services.google_apps_script import GoogleAppsScriptClient
from app.services.profiles import require_active_session

OTP_TTL_SECONDS = 300
RESEND_COOLDOWN_SECONDS = 60


class VerificationFlowError(RuntimeError):
    def __init__(self, status_code: int, message: str) -> None:
        super().__init__(message)
        self.status_code = status_code


@dataclass(frozen=True)
class StartedVerification:
    token: str
    expires_at: datetime


@dataclass(frozen=True)
class Decision:
    status: EligibilityStatus
    scheme_id: UUID
    scheme_name: str
    reason: str
    next_steps: list[str]
    notification_payload: dict[str, Any]


def start_verification(
    session: Session,
    gas: GoogleAppsScriptClient,
    state_secret: str,
    *,
    session_id: UUID,
    scheme_id: UUID,
    name: str,
    email: str,
    now: datetime | None = None,
) -> StartedVerification:
    current_time = now or datetime.now(UTC)
    require_active_session(session, session_id, now=current_time)
    facts, _ = confirmed_profile(session, session_id)
    candidate = _candidate(session, scheme_id)
    challenge_id = uuid4().hex
    verification_request_id = uuid4().hex
    expires_at = current_time + timedelta(seconds=OTP_TTL_SECONDS)
    otp = f"{secrets.randbelow(1_000_000):06d}"
    gas.send_otp(
        {
            "challenge_id": challenge_id,
            "email": email,
            "name": name,
            "otp": otp,
            "expires_at_ms": int(expires_at.timestamp() * 1000),
        }
    )
    state = {
        "kind": "verification",
        "challenge_id": challenge_id,
        "verification_request_id": verification_request_id,
        "session_id": str(session_id),
        "scheme_id": str(scheme_id),
        "scheme_version_id": str(candidate.scheme_version_id),
        "profile_hash": profile_hash(facts),
        "name": name,
        "email": email,
        "exp": int(expires_at.timestamp()),
    }
    return StartedVerification(_sign_state(state, state_secret), expires_at)


def confirm_verification(
    session: Session,
    gas: GoogleAppsScriptClient,
    state_secret: str,
    *,
    token: str,
    otp: str,
    now: datetime | None = None,
) -> Decision:
    state = _read_state(token, state_secret, expected_kind="verification", now=now)
    session_id = UUID(state["session_id"])
    scheme_id = UUID(state["scheme_id"])
    require_active_session(session, session_id, now=now)
    facts, _ = confirmed_profile(session, session_id)
    if not hmac.compare_digest(profile_hash(facts), state["profile_hash"]):
        raise VerificationFlowError(
            409, "Your profile changed. Send a new code to verify the updated details."
        )
    candidate = _candidate(session, scheme_id)
    if str(candidate.scheme_version_id) != state["scheme_version_id"]:
        raise VerificationFlowError(
            409, "The scheme rules changed. Send a new code before checking again."
        )
    gas.verify_otp(
        {
            "challenge_id": state["challenge_id"],
            "verification_request_id": state["verification_request_id"],
            "otp": otp,
        }
    )
    evaluation = explain(candidate, evaluate_candidate(candidate, facts))
    repository = MatchingRepository(session)
    repository.record_run(
        session_id=session_id,
        engine_version=f"{ENGINE_VERSION}+email-verified",
        profile_hash=state["profile_hash"],
        results=(
            MatchResultWrite(
                candidate.scheme_version_id,
                evaluation.verdict,
                relevance(candidate, facts),
                evaluation.outcomes,
                evaluation.missing_fields,
            ),
        ),
    )
    return _decision(candidate, evaluation, state)


def notification_retry_token(decision: Decision, state_secret: str) -> str:
    payload = {
        "kind": "notification",
        "payload": decision.notification_payload,
        "exp": int((datetime.now(UTC) + timedelta(hours=24)).timestamp()),
    }
    return _sign_state(payload, state_secret)


def retry_notification(
    gas: GoogleAppsScriptClient, state_secret: str, *, token: str
) -> dict[str, Any]:
    state = _read_state(token, state_secret, expected_kind="notification")
    payload = state.get("payload")
    if not isinstance(payload, dict):
        raise VerificationFlowError(400, "The notification retry token is invalid.")
    result = gas.send_result(payload)
    return {
        "already_sent": result.get("already_sent") is True,
        "decision": {
            "status": payload["status"],
            "scheme_id": payload["scheme_id"],
            "scheme_name": payload["scheme_name"],
            "reason": payload["reason"],
            "next_steps": payload["next_steps"],
        },
    }


def _candidate(session: Session, scheme_id: UUID) -> CandidateScheme:
    candidate = next(
        (
            item
            for item in MatchingRepository(session).list_candidates()
            if item.scheme_id == scheme_id
        ),
        None,
    )
    if candidate is None:
        raise VerificationFlowError(
            404, "This scheme is not available from the verified public catalogue."
        )
    return candidate


def _decision(candidate: Any, evaluation: Evaluation, state: dict[str, Any]) -> Decision:
    status = {
        Verdict.ALL_CHECKED_CONDITIONS_MET: EligibilityStatus.ELIGIBLE,
        Verdict.NOT_ELIGIBLE: EligibilityStatus.NOT_ELIGIBLE,
        Verdict.NEEDS_INFORMATION: EligibilityStatus.NEEDS_REVIEW,
        Verdict.MANUAL_REVIEW: EligibilityStatus.NEEDS_REVIEW,
    }[evaluation.verdict]
    relevant = {
        EligibilityStatus.ELIGIBLE: [
            "All reviewed conditions checked by Yojana Saathi were met."
        ],
        EligibilityStatus.NOT_ELIGIBLE: [
            item.reason for item in evaluation.outcomes if item.result == "fail"
        ],
        EligibilityStatus.NEEDS_REVIEW: [
            item.reason
            for item in evaluation.outcomes
            if item.result in {"unknown", "manual_review"}
        ],
    }[status]
    reason = " ".join(relevant) or "The available reviewed rules require further verification."
    if status == EligibilityStatus.ELIGIBLE:
        reason += " The responsible government authority makes the final eligibility decision."
    next_steps = [
        "Review the current conditions and application instructions on the official source.",
        candidate.sources[0].official_url,
    ]
    decision_id = hashlib.sha256(
        (
            state["challenge_id"]
            + "."
            + state["scheme_version_id"]
            + "."
            + state["profile_hash"]
        ).encode()
    ).hexdigest()
    notification_payload = {
        "challenge_id": state["challenge_id"],
        "decision_id": decision_id,
        "email": state["email"],
        "name": state["name"],
        "scheme_name": candidate.scheme_name,
        "scheme_id": str(candidate.scheme_id),
        "status": status.value,
        "reason": reason,
        "next_steps": next_steps,
    }
    return Decision(
        status=status,
        scheme_id=candidate.scheme_id,
        scheme_name=candidate.scheme_name,
        reason=reason,
        next_steps=next_steps,
        notification_payload=notification_payload,
    )


def _sign_state(payload: dict[str, Any], secret: str) -> str:
    raw = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
    encoded = base64.urlsafe_b64encode(raw).rstrip(b"=").decode()
    signature = hmac.new(secret.encode(), encoded.encode(), hashlib.sha256).digest()
    return encoded + "." + base64.urlsafe_b64encode(signature).rstrip(b"=").decode()


def _read_state(
    token: str,
    secret: str,
    *,
    expected_kind: str,
    now: datetime | None = None,
) -> dict[str, Any]:
    try:
        encoded, supplied_signature = token.split(".", 1)
        expected = hmac.new(secret.encode(), encoded.encode(), hashlib.sha256).digest()
        supplied = base64.urlsafe_b64decode(
            supplied_signature + "=" * (-len(supplied_signature) % 4)
        )
        if not hmac.compare_digest(expected, supplied):
            raise ValueError
        raw = base64.urlsafe_b64decode(encoded + "=" * (-len(encoded) % 4))
        payload = json.loads(raw)
        if not isinstance(payload, dict) or payload.get("kind") != expected_kind:
            raise ValueError
        expires_at = int(payload["exp"])
    except (ValueError, KeyError, TypeError, json.JSONDecodeError) as exc:
        raise VerificationFlowError(400, "The verification token is invalid.") from exc
    current_time = now or datetime.now(UTC)
    if expires_at < int(current_time.timestamp()):
        raise VerificationFlowError(400, "The verification request expired. Send a new code.")
    return payload
