"""ModelInput Interface — Clean Boundary Contract for Phase 4 Risk Inference Engine."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from pydantic import BaseModel, Field

from app.services.data.grid import SpatialGrid

# Default feature names contract matching models/model_features.json
DEFAULT_MODEL_FEATURES = [
    "elevation_meters",
    "soil_clay_0_5cm",
    "soil_sand_0_5cm",
    "terrain_slope",
    "terrain_aspect",
]


class ModelInput(BaseModel):
    """Clean model input payload consumed by Phase 4 Risk Inference Engine."""

    cell_id: str
    timestamp: datetime
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    feature_values: dict[str, float]
    ordered_feature_vector: list[float]
    metadata: dict[str, Any] = Field(default_factory=dict)


class FeatureAssemblyService:
    """Assembles raw or extracted environmental records into clean ModelInput instances."""

    def __init__(self, model_features_path: Path | str | None = None) -> None:
        self.grid = SpatialGrid()
        self.feature_names = self._load_feature_contract(model_features_path)

    def _load_feature_contract(self, config_path: Path | str | None) -> list[str]:
        if config_path is None:
            base = Path(__file__).resolve().parents[3]
            config_path = base / "models" / "model_features.json"

        p = Path(config_path)
        if p.exists():
            try:
                with open(p, "r", encoding="utf-8") as f:
                    features = json.load(f)
                if isinstance(features, list) and len(features) > 0:
                    return features
            except Exception:
                pass
        return DEFAULT_MODEL_FEATURES.copy()

    def build_model_input(
        self,
        latitude: float,
        longitude: float,
        features: dict[str, float],
        timestamp: datetime | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> ModelInput:
        """Construct deterministic ModelInput vector matching the model feature contract."""
        cell_id = self.grid.get_cell_id(latitude, longitude)
        ts = timestamp or datetime.now(timezone.utc)
        meta = metadata or {}

        # Fill ordered feature vector matching contract exactly
        ordered_vector = []
        feature_vals = {}

        for col in self.feature_names:
            val = float(features.get(col, 0.0))
            feature_vals[col] = val
            ordered_vector.append(val)

        # Include additional telemetry features if present
        for k, v in features.items():
            if k not in feature_vals:
                feature_vals[k] = float(v)

        return ModelInput(
            cell_id=cell_id,
            timestamp=ts,
            latitude=latitude,
            longitude=longitude,
            feature_values=feature_vals,
            ordered_feature_vector=ordered_vector,
            metadata=meta,
        )
