# Yojana Saathi

Yojana Saathi is an independent, source-backed assistant for discovering Indian
government schemes and understanding application requirements. It provides
preliminary guidance only; eligibility and approval are determined by the
relevant government authority.

This repository is being implemented from the project specification in the
provided documentation archive. Backend work lives under `services/api`.

## Backend quick start

```bash
cd services/api
python3.12 -m venv .venv
.venv/bin/pip install -e '.[dev]'
.venv/bin/uvicorn app.main:app --reload
```

The health endpoint is available at `http://127.0.0.1:8000/health`.

## Sarvam voice

Set `SARVAM_API_KEY` in `services/api/.env` to enable speech-to-text,
English/Hindi/Kannada profile extraction, and translated text-to-speech. The key
stays on the API server. Browser recordings are sent to Sarvam for transcription
and are not stored by Yojana Saathi. Add the same secret to Render for the
deployed API.
