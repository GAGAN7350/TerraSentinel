"""Health endpoint tests — no DB required."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_returns_200(client: AsyncClient) -> None:
    response = await client.get("/api/v1/health")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_health_response_has_status_ok(client: AsyncClient) -> None:
    data = (await client.get("/api/v1/health")).json()
    assert data["status"] == "ok"


@pytest.mark.asyncio
async def test_health_response_has_service_name(client: AsyncClient) -> None:
    data = (await client.get("/api/v1/health")).json()
    assert data["service"] == "TerraSentinel"


@pytest.mark.asyncio
async def test_health_response_has_version(client: AsyncClient) -> None:
    data = (await client.get("/api/v1/health")).json()
    assert "version" in data


@pytest.mark.asyncio
async def test_health_response_has_environment(client: AsyncClient) -> None:
    data = (await client.get("/api/v1/health")).json()
    assert "environment" in data
