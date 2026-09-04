"""
Pytest fixtures shared across the test suite.

The test client uses an in-process ASGI transport (httpx) so no
network is required. The database tests use a real PostgreSQL instance
(started via Docker Compose) — they are skipped if the DB is unavailable.
"""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
async def client() -> AsyncClient:
    """Async HTTP test client wired to the FastAPI app."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac
