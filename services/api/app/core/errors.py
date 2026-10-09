"""Exception handlers implementing the public error contract."""

import logging
from collections.abc import Awaitable, Callable
from typing import Any
from uuid import uuid4

from fastapi import FastAPI, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.schemas.common import ErrorDetail, ErrorResponse

logger = logging.getLogger(__name__)

RequestHandler = Callable[[Request], Awaitable[Response]]


def _request_id(request: Request) -> str:
    request_id = getattr(request.state, "request_id", None)
    return str(request_id or uuid4())


def _error_response(
    *,
    request: Request,
    status_code: int,
    code: str,
    message: str,
    details: list[dict[str, Any]] | None = None,
) -> JSONResponse:
    payload = ErrorResponse(
        error=ErrorDetail(
            code=code,
            message=message,
            request_id=_request_id(request),
            details=details,
        )
    )
    return JSONResponse(status_code=status_code, content=payload.model_dump(exclude_none=True))


def install_error_handlers(app: FastAPI) -> None:
    """Register handlers without exposing stack traces or submitted values."""

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        safe_details = [
            {
                "type": error["type"],
                "location": [str(part) for part in error["loc"]],
                "message": error["msg"],
            }
            for error in exc.errors()
        ]
        return _error_response(
            request=request,
            status_code=422,
            code="VALIDATION_ERROR",
            message="The request could not be validated.",
            details=safe_details,
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_error_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        default_codes = {
            400: "BAD_REQUEST",
            401: "UNAUTHORIZED",
            403: "FORBIDDEN",
            404: "NOT_FOUND",
            405: "METHOD_NOT_ALLOWED",
            409: "CONFLICT",
            429: "RATE_LIMITED",
            503: "SERVICE_UNAVAILABLE",
        }
        message = (
            exc.detail if isinstance(exc.detail, str) else "The request could not be completed."
        )
        return _error_response(
            request=request,
            status_code=exc.status_code,
            code=default_codes.get(exc.status_code, "HTTP_ERROR"),
            message=message,
        )

    @app.exception_handler(Exception)
    async def unexpected_error_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception(
            "Unhandled API error",
            extra={"request_id": _request_id(request), "exception_type": type(exc).__name__},
        )
        return _error_response(
            request=request,
            status_code=500,
            code="INTERNAL_ERROR",
            message="An unexpected error occurred.",
        )


def install_request_id_middleware(app: FastAPI) -> None:
    """Attach an opaque correlation ID to requests and responses."""

    @app.middleware("http")
    async def add_request_id(request: Request, call_next: RequestHandler) -> Response:
        supplied = request.headers.get("X-Request-ID", "").strip()
        request.state.request_id = supplied[:128] if supplied else str(uuid4())
        response = await call_next(request)
        response.headers["X-Request-ID"] = request.state.request_id
        return response
