"""FastAPI application factory and ASGI entry point."""

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import Engine

from app.api.health import router as health_router
from app.api.v1.admin import router as admin_router
from app.api.v1.guidance import router as guidance_router
from app.api.v1.profiles import router as profiles_router
from app.api.v1.schemes import router as schemes_router
from app.core.config import Settings, get_settings
from app.core.errors import install_error_handlers, install_request_id_middleware
from app.db.session import create_database_engine, create_session_factory


def create_app(
    settings: Settings | None = None, *, database_engine: Engine | None = None
) -> FastAPI:
    """Create an application instance with validated runtime boundaries."""

    runtime_settings = settings or get_settings()
    engine = database_engine or create_database_engine(runtime_settings)

    @asynccontextmanager
    async def lifespan(_: FastAPI) -> AsyncIterator[None]:
        yield
        engine.dispose()

    logging.basicConfig(
        level=runtime_settings.log_level,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )

    application = FastAPI(
        title=runtime_settings.app_name,
        version=runtime_settings.app_version,
        docs_url="/docs" if runtime_settings.app_env != "production" else None,
        redoc_url=None,
        lifespan=lifespan,
    )
    application.state.settings = runtime_settings
    application.state.session_factory = create_session_factory(engine)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=runtime_settings.allowed_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
        allow_headers=["Accept", "Content-Type", "X-Admin-Token", "X-Request-ID"],
        expose_headers=["X-Request-ID"],
        max_age=600,
    )
    install_request_id_middleware(application)
    install_error_handlers(application)
    application.include_router(health_router)
    application.include_router(admin_router)
    application.include_router(schemes_router)
    application.include_router(guidance_router)
    application.include_router(profiles_router)
    return application


app = create_app()
