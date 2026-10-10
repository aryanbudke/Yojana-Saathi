"""Public, bounded speech endpoints backed by the server-side Sarvam key."""

from typing import Annotated

from fastapi import APIRouter, Body, Depends, Header, HTTPException, Query, Response

from app.modules.speech.sarvam import (
    InvalidAudio,
    SarvamSpeech,
    SpeechLimited,
    SpeechUnavailable,
    get_speech_service,
)
from app.modules.speech.schemas import SpeechLanguage, SynthesisRequest, TranscriptionResponse

router = APIRouter(prefix="/api/v1/speech", tags=["speech"])


def service_error(error: Exception) -> HTTPException:
    if isinstance(error, SpeechLimited):
        return HTTPException(status_code=429, detail="Voice request limit reached. Please wait.")
    return HTTPException(status_code=503, detail="Voice service is temporarily unavailable.")


@router.post("/transcribe", response_model=TranscriptionResponse)
def transcribe(
    audio: Annotated[bytes, Body(max_length=8 * 1024 * 1024)],
    language_code: Annotated[SpeechLanguage, Query()],
    content_type: Annotated[str, Header(alias="Content-Type")],
    service: Annotated[SarvamSpeech, Depends(get_speech_service)],
) -> TranscriptionResponse:
    try:
        return service.transcribe(audio, content_type, language_code)
    except InvalidAudio:
        raise HTTPException(
            status_code=422,
            detail="Use a non-empty WAV, MP3, AAC, FLAC, OGG, OPUS, M4A, or WebM recording.",
        ) from None
    except (SpeechLimited, SpeechUnavailable) as error:
        raise service_error(error) from None


@router.post("/synthesize", response_class=Response)
def synthesize(
    payload: SynthesisRequest,
    service: Annotated[SarvamSpeech, Depends(get_speech_service)],
) -> Response:
    try:
        audio = service.synthesize(
            payload.text, payload.source_language_code, payload.target_language_code
        )
    except (SpeechLimited, SpeechUnavailable) as error:
        raise service_error(error) from None
    return Response(
        content=audio,
        media_type="audio/wav",
        headers={"Cache-Control": "no-store", "Content-Disposition": "inline"},
    )
