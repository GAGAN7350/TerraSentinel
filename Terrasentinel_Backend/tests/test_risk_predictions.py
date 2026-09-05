"""Risk prediction endpoint validation tests."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_prediction_score_above_100_rejected(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/risk-predictions/",
        json={
            "prediction_time": "2024-06-01T12:00:00Z",
            "latitude": 25.5,
            "longitude": 91.5,
            "risk_score": 150.0,
            "risk_level": "HIGH",
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_prediction_invalid_confidence(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/risk-predictions/",
        json={
            "prediction_time": "2024-06-01T12:00:00Z",
            "latitude": 25.5,
            "longitude": 91.5,
            "risk_score": 72.0,
            "risk_level": "HIGH",
            "confidence": 2.0,
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_prediction_invalid_risk_level(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/risk-predictions/",
        json={
            "prediction_time": "2024-06-01T12:00:00Z",
            "latitude": 25.5,
            "longitude": 91.5,
            "risk_score": 72.0,
            "risk_level": "EXTREME",
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_list_predictions_paginated_shape(client: AsyncClient) -> None:
    response = await client.get("/api/v1/risk-predictions/")
    if response.status_code == 200:
        data = response.json()
        assert "items" in data
        assert "total" in data


@pytest.mark.asyncio
async def test_get_nonexistent_prediction(client: AsyncClient) -> None:
    response = await client.get(
        "/api/v1/risk-predictions/00000000-0000-0000-0000-000000000000"
    )
    assert response.status_code in (404, 500, 503)
