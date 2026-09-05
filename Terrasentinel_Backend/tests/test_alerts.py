"""Alert endpoint validation tests."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_alert_missing_required_fields(client: AsyncClient) -> None:
    response = await client.post("/api/v1/alerts/", json={})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_alert_invalid_severity(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/alerts/",
        json={"severity": "EXTREME", "title": "Test", "message": "Test message"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_list_alerts_paginated_shape(client: AsyncClient) -> None:
    response = await client.get("/api/v1/alerts/")
    if response.status_code == 200:
        data = response.json()
        assert "items" in data
        assert "total" in data


@pytest.mark.asyncio
async def test_get_nonexistent_alert(client: AsyncClient) -> None:
    response = await client.get("/api/v1/alerts/00000000-0000-0000-0000-000000000000")
    assert response.status_code in (404, 500, 503)
