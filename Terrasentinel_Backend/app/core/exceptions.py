"""
Custom application exceptions and FastAPI exception handlers.

Error response format (per spec):
    {
        "error": {
            "code": "RESOURCE_NOT_FOUND",
            "message": "Landslide not found",
            "details": null
        }
    }
"""

from __future__ import annotations

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


# ------------------------------------------------------------------ #
# Helper
# ------------------------------------------------------------------ #

def _error_response(status_code: int, code: str, message: str, details=None) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"error": {"code": code, "message": message, "details": details}},
    )


# ------------------------------------------------------------------ #
# Base exception hierarchy
# ------------------------------------------------------------------ #

class TerraSentinelError(Exception):
    """Base class for all application-level errors."""
    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    code: str = "INTERNAL_ERROR"
    message: str = "An unexpected error occurred."

    def __init__(self, message: str | None = None, details=None) -> None:
        self.message = message or self.__class__.message
        self.details = details
        super().__init__(self.message)


class NotFoundError(TerraSentinelError):
    status_code = status.HTTP_404_NOT_FOUND
    code = "RESOURCE_NOT_FOUND"
    message = "Resource not found."


class ValidationError(TerraSentinelError):
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    code = "VALIDATION_ERROR"
    message = "Validation error."


class ConflictError(TerraSentinelError):
    status_code = status.HTTP_409_CONFLICT
    code = "CONFLICT"
    message = "Resource already exists."


class DatabaseError(TerraSentinelError):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    code = "DATABASE_ERROR"
    message = "Database operation failed."


class AuthenticationError(TerraSentinelError):
    status_code = status.HTTP_401_UNAUTHORIZED
    code = "AUTHENTICATION_FAILED"
    message = "Authentication failed."


class AuthorizationError(TerraSentinelError):
    status_code = status.HTTP_403_FORBIDDEN
    code = "FORBIDDEN"
    message = "You do not have permission to perform this action."


# ------------------------------------------------------------------ #
# Handler registration
# ------------------------------------------------------------------ #

def register_exception_handlers(app: FastAPI) -> None:
    """Attach centralised exception handlers to the FastAPI application."""

    @app.exception_handler(TerraSentinelError)
    async def terrasentinel_error_handler(
        request: Request, exc: TerraSentinelError
    ) -> JSONResponse:
        return _error_response(exc.status_code, exc.code, exc.message, exc.details)

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        return _error_response(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "VALIDATION_ERROR",
            "Request validation failed.",
            exc.errors(),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        # In production: log exc here (structlog / sentry)
        return _error_response(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "INTERNAL_ERROR",
            "Internal server error.",
        )
