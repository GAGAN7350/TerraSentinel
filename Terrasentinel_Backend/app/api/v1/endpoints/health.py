"""Health check endpoint — does NOT require database access per spec."""

from fastapi import APIRouter

from app.core.config import settings

router = APIRouter()


@router.get("/health", summary="Health check")
async def health_check() -> dict:
    """
    Returns service status.
    Does not require database connectivity — used by load balancers
    and basic uptime monitors.
    """
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }
