"""FastAPI application factory and ASGI entry point."""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.core.config import Settings, get_settings
from app.core.errors import install_error_handlers, install_request_id_middleware


def create_app(settings: Settings | None = None) -> FastAPI:
    """Create an application instance with validated runtime boundaries."""

    runtime_settings = settings or get_settings()
    logging.basicConfig(
        level=runtime_settings.log_level,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )

    application = FastAPI(
        title=runtime_settings.app_name,
        version=runtime_settings.app_version,
        docs_url="/docs" if runtime_settings.app_env != "production" else None,
        redoc_url=None,
    )
    application.state.settings = runtime_settings
    application.add_middleware(
        CORSMiddleware,
        allow_origins=runtime_settings.allowed_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
        allow_headers=["Accept", "Content-Type", "X-Request-ID"],
        expose_headers=["X-Request-ID"],
        max_age=600,
    )
    install_request_id_middleware(application)
    install_error_handlers(application)
    application.include_router(health_router)
    return application


app = create_app()
