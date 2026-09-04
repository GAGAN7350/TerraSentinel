"""
Health endpoint tests.
These run without a real database — the health check handles DB failure gracefully.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_returns_200(client: AsyncClient) -> None:
    """Health endpoint must always return HTTP 200."""
    response = await client.get("/api/v1/health")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_health_response_shape(client: AsyncClient) -> None:
    """Health response must contain expected keys."""
    response = await client.get("/api/v1/health")
    data = response.json()
    assert "status" in data
    assert "database" in data
    assert "service" in data
    assert "version" in data


@pytest.mark.asyncio
async def test_health_service_name(client: AsyncClient) -> None:
    """Service name must match the application name."""
    response = await client.get("/api/v1/health")
    data = response.json()
    assert data["service"] == "TerraSentinel API"
