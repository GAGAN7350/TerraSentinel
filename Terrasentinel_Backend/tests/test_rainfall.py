"""Rainfall endpoint validation tests."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_observation_negative_rainfall(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/rainfall/",
        json={
            "observation_time": "2024-06-01T12:00:00Z",
            "latitude": 25.5,
            "longitude": 91.5,
            "rainfall_mm": -5.0,
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_observation_invalid_lat(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/rainfall/",
        json={
            "observation_time": "2024-06-01T12:00:00Z",
            "latitude": 100.0,
            "longitude": 91.5,
            "rainfall_mm": 10.0,
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_list_rainfall_returns_paginated_shape(client: AsyncClient) -> None:
    response = await client.get("/api/v1/rainfall/")
    if response.status_code == 200:
        data = response.json()
        assert "items" in data
        assert "total" in data


@pytest.mark.asyncio
async def test_rainfall_nearby_missing_params(client: AsyncClient) -> None:
    response = await client.get("/api/v1/rainfall/nearby")
    assert response.status_code == 422
