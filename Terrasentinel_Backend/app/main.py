"""
TerraSentinel FastAPI application entry point.
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_v1_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.db.session import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle — startup / shutdown."""
    yield
    await engine.dispose()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=(
            "AI-powered Landslide Early Warning and Risk Intelligence System "
            "for North-East India. Phase 1 & 2 backend foundation."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(app)
    app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)

    return app


app = create_app()
