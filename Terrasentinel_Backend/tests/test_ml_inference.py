"""Unit tests for MLInferenceService and XGBoost risk model integration."""

from app.models.risk import RiskLevel, RiskTrend
from app.services.ml_inference import MLInferenceService


def test_ml_inference_service_init():
    engine = MLInferenceService()
    assert isinstance(engine.feature_names, list)
    assert len(engine.feature_names) > 0


def test_predict_risk_safe_scenario():
    engine = MLInferenceService()
    safe_input = {
        "terrain_slope": 2.0,
        "rainfall_7d_mm": 0.0,
        "elevation_meters": 100.0,
        "soil_clay_0_5cm": 100.0,
        "soil_sand_0_5cm": 600.0,
    }
    result = engine.predict_risk(safe_input)
    assert 0.0 <= result["risk_score"] <= 35.0
    assert result["risk_level"] in [RiskLevel.LOW, RiskLevel.MODERATE]
    assert "explanation" in result
    assert isinstance(result["explanation"]["primary_drivers"], list)


def test_predict_risk_dangerous_scenario():
    engine = MLInferenceService()
    dangerous_input = {
        "terrain_slope": 55.0,
        "rainfall_7d_mm": 350.0,
        "elevation_meters": 2200.0,
        "soil_clay_0_5cm": 450.0,
        "soil_sand_0_5cm": 150.0,
        "rainfall_15d_mm": 500.0,
    }
    result = engine.predict_risk(dangerous_input)
    assert result["risk_score"] >= 50.0
    assert result["risk_level"] in [RiskLevel.HIGH, RiskLevel.CRITICAL]
    assert result["trend"] == RiskTrend.INCREASING
    assert len(result["explanation"]["primary_drivers"]) >= 2


def test_determine_risk_level():
    assert MLInferenceService.determine_risk_level(85.0) == RiskLevel.CRITICAL
    assert MLInferenceService.determine_risk_level(65.0) == RiskLevel.HIGH
    assert MLInferenceService.determine_risk_level(35.0) == RiskLevel.MODERATE
    assert MLInferenceService.determine_risk_level(10.0) == RiskLevel.LOW
