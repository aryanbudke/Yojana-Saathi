"""Server-only Sarvam configuration."""

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class SpeechSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="SARVAM_", env_file=".env", extra="ignore")

    api_key: SecretStr | None = None
    stt_model: str = "saaras:v4"
    tts_model: str = "bulbul:v4-flash"
    translation_model: str = "sarvam-translate:v1"
    chat_model: str = Field(
        default="sarvam-105b-conversations",
        pattern=r"^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$",
    )
