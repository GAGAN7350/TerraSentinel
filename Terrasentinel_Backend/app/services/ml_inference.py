"""ML Risk Inference Service — XGBoost Landslide Risk Model & Feature Explanations."""

from __future__ import annotations

import json
import logging
import math
from pathlib import Path
from typing import Any

from app.models.risk import RiskLevel, RiskTrend

logger = logging.getLogger(__name__)

# Static susceptibility features fed to the XGBoost model.
# Phase 3: terrain_aspect is encoded as sin/cos at inference time (circular variable).
# API callers still supply raw terrain_aspect (0-360°); the encoding is internal.
DEFAULT_FEATURES = [
    "elevation_meters",
    "soil_clay_0_5cm",
    "soil_sand_0_5cm",
    "terrain_slope",
    "aspect_sin",   # sin(deg2rad(terrain_aspect)) — Phase 3 circular encoding
    "aspect_cos",   # cos(deg2rad(terrain_aspect)) — Phase 3 circular encoding
]

# Raw API input features (used for confidence scoring and feature snapshot).
# terrain_aspect is listed here because callers supply it; it is transformed before model inference.
RAW_STATIC_FEATURES = [
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
        self.model_version = "v1.4.0-xgboost-imputed"
        self.imputation_params: dict[str, Any] = {}   # Phase 4: train-set medians
        self.inference_config: dict[str, Any] = {}    # Phase 5: threshold + operational params
        self.classification_threshold: float = 0.50  # Phase 5: explicit auditable default

        if model_dir is None:
            base = Path(__file__).resolve().parents[3]
            model_dir = base / "models"
            if not model_dir.exists():
                model_dir = Path("models")

        self.model_dir = Path(model_dir)
        self._load_model()
        MLInferenceService._loaded_flag = True

    def _load_model(self) -> None:
        features_file    = self.model_dir / "model_features.json"
        model_file       = self.model_dir / "xgboost_risk_model.json"
        imputation_file  = self.model_dir / "imputation_params.json"

        if features_file.exists():
            try:
                with open(features_file, "r", encoding="utf-8") as f:
                    self.feature_names = json.load(f)
                MLInferenceService._features_cache = self.feature_names
                logger.info(f"Loaded {len(self.feature_names)} features from {features_file}")
            except Exception as e:
                logger.warning(f"Could not load feature definitions: {e}")

        # Phase 4: Load imputation parameters.
        # These medians are fitted on the training set only and must be applied
        # at inference time to fill any missing soil values before model prediction.
        if imputation_file.exists():
            try:
                with open(imputation_file, "r", encoding="utf-8") as f:
                    self.imputation_params = json.load(f)
                logger.info(
                    f"Loaded imputation params for {list(self.imputation_params.keys())} from {imputation_file}"
                )
            except Exception as e:
                logger.warning(f"Could not load imputation params: {e}. NaN values will use 0.0 fallback.")
        else:
            logger.warning(
                f"No imputation_params.json found at {imputation_file}. "
                "Missing soil values will not be imputed correctly."
            )

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

        # Phase 5: Load inference configuration (threshold + operational params).
        # The classification threshold is documented with full scientific justification.
        # Default 0.50 is preserved if the file is missing — never silently changes.
        inference_config_file = self.model_dir / "inference_config.json"
        if inference_config_file.exists():
            try:
                with open(inference_config_file, "r", encoding="utf-8") as f:
                    self.inference_config = json.load(f)
                self.classification_threshold = float(
                    self.inference_config.get("classification_threshold", 0.50)
                )
                logger.info(
                    f"Loaded inference config: threshold={self.classification_threshold:.4f} "
                    f"from {inference_config_file}"
                )
            except Exception as e:
                logger.warning(f"Could not load inference_config.json: {e}. Using threshold=0.50.")
        else:
            logger.warning(
                f"No inference_config.json found at {inference_config_file}. "
                "Using default threshold=0.50."
            )

    def get_health_status(self) -> dict[str, Any]:
        """Return lightweight ML model health status and metadata."""
        return {
            "model_status": "HEALTHY" if self.model_loaded else "HEURISTIC_FALLBACK",
            "model_loaded": self.model_loaded,
            "model_version": self.model_version if self.model_loaded else "v1.4.0-heuristic",
            "feature_count": len(self.feature_names),
            "feature_names": self.feature_names,
            "imputation_params": self.imputation_params,
            "classification_threshold": self.classification_threshold,  # Phase 5: explicit
            "high_sensitivity_threshold": self.inference_config.get("high_sensitivity_threshold"),
        }

    def predict_risk(self, features: dict[str, Any]) -> dict[str, Any]:
        """Compute risk score (0-100), risk level, confidence, trend, and feature snapshot."""
        # Use _safe_float throughout: API callers may pass None for optional fields.
        def _safe_float(val: Any, default: float = 0.0) -> float:
            """Convert value to float safely, returning default if None or NaN."""
            if val is None:
                return default
            try:
                v = float(val)
                return default if math.isnan(v) else v
            except (TypeError, ValueError):
                return default

        slope     = _safe_float(features.get("terrain_slope"))
        rain_7d   = _safe_float(features.get("rainfall_7d_mm"))
        elevation = _safe_float(features.get("elevation_meters"))
        clay      = _safe_float(features.get("soil_clay_0_5cm"))   # used for heuristic fallback
        sand      = _safe_float(features.get("soil_sand_0_5cm"))   # used for heuristic fallback
        raw_aspect = _safe_float(features.get("terrain_aspect"))

        prob: float | None = None  # Phase 5: initialized here so it's always in scope
        if self.model_loaded and self.xgb_model is not None:
            try:
                import pandas as pd

                # Phase 3: Compute circular aspect encoding from raw terrain_aspect.
                # This must match exactly what train_xgboost.py computes at training time.
                aspect_rad = math.radians(raw_aspect)
                aspect_sin = math.sin(aspect_rad)
                aspect_cos = math.cos(aspect_rad)

                # Phase 4: Apply median imputation for any missing soil values.
                # Imputation values are the training-set medians loaded from imputation_params.json.
                # This is the same transformation applied during training — making NaN handling
                # explicit and auditable rather than relying on XGBoost's opaque NaN routing.
                def _impute(col: str, raw_val: Any) -> float:
                    """Return imputed value if input is None/NaN, else return raw value."""
                    if raw_val is None or (isinstance(raw_val, float) and math.isnan(raw_val)):
                        imp = self.imputation_params.get(col, {})
                        fallback = imp.get("value", 0.0)
                        logger.debug(f"Imputing missing {col} with training median {fallback:.2f}")
                        return float(fallback)
                    return float(raw_val)

                # Build model input using the exact feature names from model_features.json
                model_input: dict[str, Any] = {}
                for col in self.feature_names:
                    if col == "aspect_sin":
                        model_input[col] = aspect_sin
                    elif col == "aspect_cos":
                        model_input[col] = aspect_cos
                    else:
                        model_input[col] = _impute(col, features.get(col))

                df = pd.DataFrame([model_input])[self.feature_names]
                prob = float(self.xgb_model.predict_proba(df)[0][1])

                # Phase 5: Apply the configured classification threshold.
                # Default 0.50, loaded from models/inference_config.json.
                # Using threshold explicitly here — not the model's internal .predict() default.
                is_landslide = prob >= self.classification_threshold

                # Blend static XGBoost spatial susceptibility with dynamic precipitation telemetry
                # prob drives the spatial component; rain_factor drives the dynamic component
                spatial_susceptibility = prob * 100.0
                rain_factor = min(rain_7d / 300.0, 1.0) * 35.0
                raw_score = round(min(spatial_susceptibility * 0.80 + rain_factor, 100.0), 2)
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

        result: dict[str, Any] = {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "confidence": confidence,
            "trend": trend,
            "model_version": self.model_version if self.model_loaded else "v1.4.0-heuristic",
            "explanation": explanation,
        }

        # Phase 5: Expose raw probability and active threshold for operator transparency.
        # Only available when the XGBoost model is loaded (not heuristic path).
        if self.model_loaded:
            result["raw_probability"] = round(prob, 4) if prob is not None else None
            result["classification_threshold"] = self.classification_threshold

        return result

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
        total = len(RAW_STATIC_FEATURES) + len(TELEMETRY_FEATURES)
        return min(round(0.60 + (provided / total) * 0.38, 2), 0.98)

    @staticmethod
    def determine_trend(features: dict[str, Any]) -> RiskTrend:
        v7  = features.get("rainfall_7d_mm")
        v15 = features.get("rainfall_15d_mm")
        rain_7d  = float(v7)  if (v7  is not None and not (isinstance(v7, float)  and math.isnan(v7)))  else 0.0
        rain_15d = float(v15) if (v15 is not None and not (isinstance(v15, float) and math.isnan(v15))) else 0.0
        if rain_7d > 100.0 or (rain_15d > 0 and (rain_7d / 7.0) > (rain_15d / 15.0)):
            return RiskTrend.INCREASING
        elif rain_7d < 10.0:
            return RiskTrend.DECREASING
        return RiskTrend.STABLE

    @staticmethod
    def generate_explanation(features: dict[str, Any], score: float) -> dict[str, Any]:
        def _sf(val: Any, default: float = 0.0) -> float:
            """None-safe float conversion."""
            if val is None:
                return default
            try:
                v = float(val)
                return default if math.isnan(v) else v
            except (TypeError, ValueError):
                return default

        slope   = _sf(features.get("terrain_slope"))
        rain_7d = _sf(features.get("rainfall_7d_mm"))
        clay    = _sf(features.get("soil_clay_0_5cm"))

        factors = []
        if slope >= 30.0:
            factors.append(f"Steep terrain slope ({slope:.1f} deg)")
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
