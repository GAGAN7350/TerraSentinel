"""Health check endpoint."""

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session

router = APIRouter()


@router.get("/health", summary="Health check")
async def health_check(
    session: AsyncSession = Depends(get_async_session),
) -> dict:
    """
    Returns the service status and basic database connectivity check.
    Used by Docker health checks, load balancers, and monitoring.
    """
    db_ok = False
    try:
        await session.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        pass

    return {
        "status": "ok" if db_ok else "degraded",
        "database": "connected" if db_ok else "unreachable",
        "service": "TerraSentinel API",
        "version": "0.1.0",
    }
