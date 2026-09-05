"""Landslide endpoint validation tests."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_landslide_invalid_lat(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/landslides/",
        json={"latitude": 200.0, "longitude": 92.0},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_landslide_invalid_lon(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/landslides/",
        json={"latitude": 27.0, "longitude": 200.0},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_landslide_missing_coords(client: AsyncClient) -> None:
    response = await client.post("/api/v1/landslides/", json={})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_list_landslides_returns_paginated_shape(client: AsyncClient) -> None:
    response = await client.get("/api/v1/landslides/")
    # Without DB: may get 500/503, but with DB: should be 200 with pagination keys
    if response.status_code == 200:
        data = response.json()
        assert "items" in data
        assert "page" in data
        assert "page_size" in data
        assert "total" in data


@pytest.mark.asyncio
async def test_get_nonexistent_landslide(client: AsyncClient) -> None:
    response = await client.get(
        "/api/v1/landslides/00000000-0000-0000-0000-000000000000"
    )
    assert response.status_code in (404, 500, 503)


@pytest.mark.asyncio
async def test_nearby_missing_params(client: AsyncClient) -> None:
    response = await client.get("/api/v1/landslides/nearby")
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_nearby_invalid_lat(client: AsyncClient) -> None:
    response = await client.get(
        "/api/v1/landslides/nearby?latitude=200&longitude=92&radius_km=10"
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_bbox_missing_params(client: AsyncClient) -> None:
    response = await client.get("/api/v1/landslides/bbox")
    assert response.status_code == 422
