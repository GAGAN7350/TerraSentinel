"""Phase 4 Test Suite — ML Risk Engine, Feature Snapshot, Health Check & Alert Policy."""

import pytest
from httpx import AsyncClient

from app.models.risk import RiskLevel
from app.services.ml_inference import MLInferenceService


def test_ml_inference_singleton_caching():
    engine1 = MLInferenceService()
    engine2 = MLInferenceService()
    assert engine1 is engine2
    assert engine1.model_loaded is True or hasattr(engine1, "model_version")


def test_ml_inference_health_status():
    engine = MLInferenceService()
    status_info = engine.get_health_status()
    assert "model_status" in status_info
    assert "model_version" in status_info
    assert "feature_count" in status_info
    assert isinstance(status_info["feature_names"], list)


def test_predict_risk_feature_snapshot():
    engine = MLInferenceService()
    input_data = {
        "terrain_slope": 35.0,
        "rainfall_7d_mm": 180.0,
        "elevation_meters": 1200.0,
        "soil_clay_0_5cm": 320.0,
        "soil_sand_0_5cm": 220.0,
    }
    res = engine.predict_risk(input_data)
    assert 0.0 <= res["risk_score"] <= 100.0
    assert "explanation" in res
    assert "feature_snapshot" in res["explanation"]
    snapshot = res["explanation"]["feature_snapshot"]
    assert snapshot["terrain_slope"] == 35.0
    assert snapshot["rainfall_7d_mm"] == 180.0


@pytest.mark.asyncio
async def test_risk_predictions_health_endpoint(client: AsyncClient) -> None:
    response = await client.get("/api/v1/risk-predictions/health")
    assert response.status_code == 200
    data = response.json()
    assert "model_status" in data
    assert "model_version" in data
    assert "feature_count" in data


@pytest.mark.asyncio
async def test_simulate_scenario_flag(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/risk-predictions/simulate",
        json={
            "latitude": 27.33,
            "longitude": 88.61,
            "terrain_slope": 25.0,
            "rainfall_7d_mm": 100.0,
            "slope_delta_deg": 20.0,
            "rainfall_multiplier": 2.0,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "explanation" in data
    assert data["explanation"].get("simulation") is True
    assert "simulation_inputs" in data["explanation"]


@pytest.mark.asyncio
async def test_critical_prediction_auto_alert(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/risk-predictions/predict",
        json={
            "latitude": 27.33,
            "longitude": 88.61,
            "terrain_slope": 65.0,
            "rainfall_7d_mm": 400.0,
            "elevation_meters": 2500.0,
            "soil_clay_0_5cm": 450.0,
            "soil_sand_0_5cm": 100.0,
            "store_in_db": True,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] in ["HIGH", "CRITICAL"]
    assert data["saved_record_id"] is not None
