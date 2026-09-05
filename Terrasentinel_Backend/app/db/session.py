"""
SQLAlchemy async engine and session factory.

Usage in route handlers / services:
    async with get_db() as session:
        ...

Or via FastAPI dependency injection:
    async def endpoint(db: AsyncSession = Depends(get_async_session)):
        ...
"""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings

# ------------------------------------------------------------------ #
# Engine
# ------------------------------------------------------------------ #

engine = create_async_engine(
    settings.async_database_url,
    echo=settings.DEBUG,
    pool_pre_ping=True,          # detect stale connections
    pool_size=10,
    max_overflow=20,
)

# ------------------------------------------------------------------ #
# Session factory
# ------------------------------------------------------------------ #

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


# ------------------------------------------------------------------ #
# Dependency / context manager
# ------------------------------------------------------------------ #


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields an AsyncSession per request."""
    try:
        async with AsyncSessionLocal() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                try:
                    await session.rollback()
                except Exception:
                    pass
                raise
    except (OSError, ConnectionRefusedError, Exception) as exc:
        from app.core.exceptions import DatabaseError, TerraSentinelError
        if isinstance(exc, TerraSentinelError):
            raise
        raise DatabaseError("Database connection failed. Ensure PostgreSQL/PostGIS is running.") from exc


@asynccontextmanager
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Async context manager for use outside of FastAPI dependency injection."""
    try:
        async with AsyncSessionLocal() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                try:
                    await session.rollback()
                except Exception:
                    pass
                raise
    except (OSError, ConnectionRefusedError, Exception) as exc:
        from app.core.exceptions import DatabaseError, TerraSentinelError
        if isinstance(exc, TerraSentinelError):
            raise
        raise DatabaseError("Database connection failed. Ensure PostgreSQL/PostGIS is running.") from exc

