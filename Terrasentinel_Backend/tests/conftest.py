"""
Shared pytest fixtures.
The AsyncClient uses in-process ASGI transport — no network required.
DB-dependent tests will fail gracefully (500/503) without a live DB.
"""

from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
async def client() -> AsyncClient:
    """Async HTTP client wired to the FastAPI ASGI app."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac
