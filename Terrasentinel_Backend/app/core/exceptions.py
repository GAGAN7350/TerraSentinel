"""
Custom application exceptions and FastAPI exception handlers.
All domain-specific errors should derive from TerraSentinelError.
"""

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse


# ------------------------------------------------------------------ #
# Base exception hierarchy
# ------------------------------------------------------------------ #


class TerraSentinelError(Exception):
    """Base class for all application-level errors."""

    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    detail: str = "An unexpected error occurred."

    def __init__(self, detail: str | None = None) -> None:
        self.detail = detail or self.__class__.detail
        super().__init__(self.detail)


class NotFoundError(TerraSentinelError):
    status_code = status.HTTP_404_NOT_FOUND
    detail = "Resource not found."


class ValidationError(TerraSentinelError):
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    detail = "Validation error."


class ConflictError(TerraSentinelError):
    status_code = status.HTTP_409_CONFLICT
    detail = "Resource already exists."


class DatabaseError(TerraSentinelError):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    detail = "Database operation failed."


# ------------------------------------------------------------------ #
# Handler registration
# ------------------------------------------------------------------ #


def register_exception_handlers(app: FastAPI) -> None:
    """Attach centralised exception handlers to the FastAPI application."""

    @app.exception_handler(TerraSentinelError)
    async def terrasentinel_error_handler(
        request: Request, exc: TerraSentinelError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail, "type": type(exc).__name__},
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        # In production you would log exc here (structlog / sentry)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error.", "type": "InternalServerError"},
        )
