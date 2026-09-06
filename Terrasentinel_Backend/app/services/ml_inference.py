"""ML Risk Inference Service — XGBoost Landslide Risk Model & Feature Explanations."""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

from app.models.risk import RiskLevel, RiskTrend

logger = logging.getLogger(__name__)

DEFAULT_FEATURES = [
    "elevation_meters",
    "soil_clay_0_5cm",
    "soil_sand_0_5cm",
    "terrain_slope",
    "terrain_aspect",
]

TELEMETRY_FEATURES = [
    "rainfall_7d_mm",
    "rainfall_15d_mm",
    "rainfall_30d_mm",
    "soil_moisture_root_7d_avg",
    "soil_moisture_prof_7d_avg",
    "sentinel2_ndvi",
]


class MLInferenceService:
    """Inference engine for Landslide Risk Prediction (Singleton Pattern)."""

    _instance: MLInferenceService | None = None
    _model_cache: Any = None
    _features_cache: list[str] | None = None
    _loaded_flag: bool = False

    def __new__(cls, model_dir: Path | str | None = None) -> MLInferenceService:
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self, model_dir: Path | str | None = None) -> None:
        if MLInferenceService._loaded_flag:
            return

        self.model_loaded = False
        self.xgb_model: Any = None
        self.feature_names: list[str] = DEFAULT_FEATURES.copy()
        self.model_version = "v1.2.0-xgboost"

        if model_dir is None:
            base = Path(__file__).resolve().parents[3]
            model_dir = base / "models"
            if not model_dir.exists():
                model_dir = Path("models")

        self.model_dir = Path(model_dir)
        self._load_model()
        MLInferenceService._loaded_flag = True

    def _load_model(self) -> None:
        features_file = self.model_dir / "model_features.json"
        model_file = self.model_dir / "xgboost_risk_model.json"

        if features_file.exists():
            try:
                with open(features_file, "r", encoding="utf-8") as f:
                    self.feature_names = json.load(f)
                MLInferenceService._features_cache = self.feature_names
                logger.info(f"Loaded {len(self.feature_names)} features from {features_file}")
            except Exception as e:
                logger.warning(f"Could not load feature definitions: {e}")

        if model_file.exists():
            try:
                from xgboost import XGBClassifier

                model = XGBClassifier()
                model.load_model(str(model_file))
                self.xgb_model = model
                MLInferenceService._model_cache = model
                self.model_loaded = True
                logger.info(f"Successfully loaded XGBoost risk model from {model_file}")
            except Exception as e:
                logger.warning(f"Could not load XGBoost model from {model_file}: {e}")
        else:
            logger.info(f"No model file found at {model_file}, fallback heuristic will be used.")

    def get_health_status(self) -> dict[str, Any]:
        """Return lightweight ML model health status and metadata."""
        return {
            "model_status": "HEALTHY" if self.model_loaded else "HEURISTIC_FALLBACK",
            "model_loaded": self.model_loaded,
            "model_version": self.model_version if self.model_loaded else "v1.2.0-heuristic",
            "feature_count": len(self.feature_names),
            "feature_names": self.feature_names,
        }

    def predict_risk(self, features: dict[str, Any]) -> dict[str, Any]:
        """Compute risk score (0-100), risk level, confidence, trend, and feature snapshot."""
        slope = float(features.get("terrain_slope", 0.0))
        rain_7d = float(features.get("rainfall_7d_mm", 0.0))
        elevation = float(features.get("elevation_meters", 0.0))
        clay = float(features.get("soil_clay_0_5cm", 0.0))
        sand = float(features.get("soil_sand_0_5cm", 0.0))

        if self.model_loaded and self.xgb_model is not None:
            try:
                import pandas as pd

                input_dict = {col: features.get(col, 0.0) for col in self.feature_names}
                df = pd.DataFrame([input_dict])[self.feature_names]
                prob = float(self.xgb_model.predict_proba(df)[0][1])
                raw_score = round(prob * 100.0, 2)
            except Exception as e:
                logger.error(f"Error during XGBoost prediction, falling back to heuristic: {e}")
                raw_score = self._heuristic_score(slope, rain_7d, elevation, clay, sand)
        else:
            raw_score = self._heuristic_score(slope, rain_7d, elevation, clay, sand)

        risk_score = max(0.0, min(100.0, raw_score))
        risk_level = self.determine_risk_level(risk_score)
        confidence = self.determine_confidence(features)
        trend = self.determine_trend(features)

        # Generate structured explanation with complete feature input snapshot
        explanation = self.generate_explanation(features, risk_score)

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "confidence": confidence,
            "trend": trend,
            "model_version": self.model_version if self.model_loaded else "v1.2.0-heuristic",
            "explanation": explanation,
        }

    def _heuristic_score(
        self, slope: float, rain_7d: float, elevation: float, clay: float, sand: float
    ) -> float:
        slope_factor = min(slope / 60.0, 1.0) * 45.0
        rain_factor = min(rain_7d / 300.0, 1.0) * 35.0
        soil_factor = min((clay + (500 - sand)) / 1000.0, 1.0) * 10.0
        elev_factor = min(elevation / 3000.0, 1.0) * 10.0
        return round(slope_factor + rain_factor + soil_factor + elev_factor, 2)

    @staticmethod
    def determine_risk_level(score: float) -> RiskLevel:
        if score >= 75.0:
            return RiskLevel.CRITICAL
        elif score >= 50.0:
            return RiskLevel.HIGH
        elif score >= 25.0:
            return RiskLevel.MODERATE
        return RiskLevel.LOW

    @staticmethod
    def determine_confidence(features: dict[str, Any]) -> float:
        provided = sum(1 for v in features.values() if v is not None)
        total = len(DEFAULT_FEATURES) + len(TELEMETRY_FEATURES)
        return min(round(0.60 + (provided / total) * 0.38, 2), 0.98)

    @staticmethod
    def determine_trend(features: dict[str, Any]) -> RiskTrend:
        rain_7d = float(features.get("rainfall_7d_mm", 0.0))
        rain_15d = float(features.get("rainfall_15d_mm", 0.0))
        if rain_7d > 100.0 or (rain_15d > 0 and (rain_7d / 7.0) > (rain_15d / 15.0)):
            return RiskTrend.INCREASING
        elif rain_7d < 10.0:
            return RiskTrend.DECREASING
        return RiskTrend.STABLE

    @staticmethod
    def generate_explanation(features: dict[str, Any], score: float) -> dict[str, Any]:
        slope = float(features.get("terrain_slope", 0.0))
        rain_7d = float(features.get("rainfall_7d_mm", 0.0))
        clay = float(features.get("soil_clay_0_5cm", 0.0))

        factors = []
        if slope >= 30.0:
            factors.append(f"Steep terrain slope ({slope:.1f}°)")
        if rain_7d >= 100.0:
            factors.append(f"Heavy 7-day cumulative rainfall ({rain_7d:.1f} mm)")
        if clay >= 300.0:
            factors.append(f"High clay soil composition ({clay:.1f} g/kg)")
        if not factors:
            factors.append("Low slope gradient and minimal recent precipitation")

        # Preserve full feature input snapshot for auditability
        feature_snapshot = {
            k: float(v) if isinstance(v, (int, float)) else str(v)
            for k, v in features.items()
            if v is not None
        }

        return {
            "primary_drivers": factors,
            "slope_contribution": round(min(slope / 60.0, 1.0) * 45.0, 1),
            "precipitation_contribution": round(min(rain_7d / 300.0, 1.0) * 35.0, 1),
            "soil_contribution": round(min(clay / 500.0, 1.0) * 20.0, 1),
            "feature_snapshot": feature_snapshot,
        }
