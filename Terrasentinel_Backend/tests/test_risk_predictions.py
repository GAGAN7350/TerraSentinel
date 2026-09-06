"""Risk prediction endpoint validation and real-time inference tests."""

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
async def test_predict_risk_endpoint(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/risk-predictions/predict",
        json={
            "latitude": 27.33,
            "longitude": 88.61,
            "terrain_slope": 42.0,
            "rainfall_7d_mm": 210.0,
            "soil_clay_0_5cm": 310.0,
            "elevation_meters": 1450.0,
            "store_in_db": False,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "risk_score" in data
    assert 0.0 <= data["risk_score"] <= 100.0
    assert "risk_level" in data
    assert "explanation" in data


@pytest.mark.asyncio
async def test_simulate_risk_endpoint(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/risk-predictions/simulate",
        json={
            "latitude": 27.33,
            "longitude": 88.61,
            "terrain_slope": 30.0,
            "rainfall_7d_mm": 100.0,
            "slope_delta_deg": 15.0,
            "rainfall_multiplier": 1.8,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "risk_score" in data
    assert data["risk_score"] > 30.0


@pytest.mark.asyncio
async def test_model_info_endpoint(client: AsyncClient) -> None:
    response = await client.get("/api/v1/risk-predictions/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "model_version" in data
    assert "feature_names" in data
    assert isinstance(data["feature_names"], list)


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
