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
        "soil_clay_0_5cm": 300.0,
        "soil_sand_0_5cm": 340.0,
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


def test_shap_explainability():
    engine = MLInferenceService()
    assert engine.explainer is not None
    sample = {
        "terrain_slope": 35.0,
        "rainfall_7d_mm": 120.0,
        "elevation_meters": 1500.0,
        "soil_clay_0_5cm": 350.0,
        "soil_sand_0_5cm": 200.0,
        "terrain_aspect": 90.0,
    }
    result = engine.predict_risk(sample)
    exp = result["explanation"]
    assert "shap_values" in exp
    assert "shap_base_value" in exp
    assert exp["explainability_method"] == "TreeSHAP (exact log-odds attribution)"
    assert isinstance(exp["shap_values"], dict)
    assert len(exp["shap_values"]) == len(engine.feature_names)
    assert "terrain_slope" in exp["shap_values"]


def test_ood_domain_guardrails():
    engine = MLInferenceService()
    assert engine.domain_bounds_active is True

    # In-domain query (NER coordinates + normal elevation)
    in_domain = {
        "latitude": 25.5,
        "longitude": 91.8,
        "elevation_meters": 1200.0,
        "terrain_slope": 30.0,
        "rainfall_7d_mm": 150.0,
    }
    res_in = engine.predict_risk(in_domain)
    assert res_in["out_of_distribution"] is False
    assert len(res_in["ood_reasons"]) == 0

    # Out-of-domain query (Out of NER coordinates + extreme elevation)
    ood_query = {
        "latitude": 12.97,  # Bangalore (outside NER lat 21.5-29.5)
        "longitude": 77.59,
        "elevation_meters": 8500.0,  # Unphysical (outside max 4166.0m)
        "terrain_slope": 30.0,
        "rainfall_7d_mm": 150.0,
    }
    res_ood = engine.predict_risk(ood_query)
    assert res_ood["out_of_distribution"] is True
    assert len(res_ood["ood_reasons"]) >= 2
    assert res_ood["confidence"] < res_in["confidence"]


