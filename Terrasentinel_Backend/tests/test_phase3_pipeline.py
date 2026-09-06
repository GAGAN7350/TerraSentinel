"""Phase 3 Test Suite — Validation, Spatial Grid, Temporal Alignment, Feature Contract & Ingestion."""

import math
from datetime import datetime
import pandas as pd
import pytest

from app.services.data.grid import SpatialGrid
from app.services.data.validator import DataValidator, NER_STATES
from app.services.data.model_input import FeatureAssemblyService, ModelInput
import importlib.util
import sys
from pathlib import Path

root_dir = Path(__file__).resolve().parents[2]
neg_script_path = root_dir / "scripts" / "feature_engineering" / "01_negative_sampling.py"

spec = importlib.util.spec_from_file_location("neg_sampling_mod", neg_script_path)
neg_mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(neg_mod)

haversine_distance_km = neg_mod.haversine_distance_km
is_buffer_safe = neg_mod.is_buffer_safe


# ============================================================
# 1. COORDINATE VALIDATION TESTS
# ============================================================

def test_validate_coordinate_valid():
    res = DataValidator.validate_coordinate(27.33, 88.61, "Sikkim")
    assert res["valid"] is True
    assert res["latitude"] == 27.33
    assert res["longitude"] == 88.61


def test_validate_coordinate_missing_lat():
    res = DataValidator.validate_coordinate(None, 88.61)
    assert res["valid"] is False
    assert res["reason"] == "MISSING_COORDINATES"


def test_validate_coordinate_missing_lon():
    res = DataValidator.validate_coordinate(27.33, None)
    assert res["valid"] is False
    assert res["reason"] == "MISSING_COORDINATES"


def test_validate_coordinate_out_of_range_lat():
    res = DataValidator.validate_coordinate(105.0, 88.61)
    assert res["valid"] is False
    assert res["reason"] == "LATITUDE_OUT_OF_RANGE"


def test_validate_coordinate_out_of_range_lon():
    res = DataValidator.validate_coordinate(27.33, 200.0)
    assert res["valid"] is False
    assert res["reason"] == "LONGITUDE_OUT_OF_RANGE"


def test_validate_coordinate_outside_ner_bounds():
    res = DataValidator.validate_coordinate(12.0, 77.0, "Sikkim")
    assert res["valid"] is False
    assert res["reason"] in ["LATITUDE_OUTSIDE_NER_BOUNDS", "LONGITUDE_OUTSIDE_NER_BOUNDS"]


# ============================================================
# 2. DATE VALIDATION TESTS
# ============================================================

def test_validate_date_valid():
    dt = DataValidator.validate_date("15/06/2023")
    assert dt is not None
    assert isinstance(dt, datetime)
    assert dt.year == 2023


def test_validate_date_malformed():
    dt = DataValidator.validate_date("not-a-date")
    assert dt is None


def test_validate_date_missing():
    dt = DataValidator.validate_date(None)
    assert dt is None


# ============================================================
# 3. NER STATE FILTERING TESTS
# ============================================================

def test_filter_ner_records():
    data = {
        "state": ["Sikkim", "Assam", "Maharashtra", "Kerala", "Meghalaya"],
        "latitude": [27.3, 26.2, 19.0, 10.0, 25.5],
        "longitude": [88.6, 91.7, 72.8, 76.2, 91.8],
    }
    df = pd.DataFrame(data)
    filtered = DataValidator.filter_ner_records(df)
    assert len(filtered) == 3
    assert set(filtered["state"].unique()).issubset(NER_STATES)


# ============================================================
# 4. SPATIAL GRID MAPPING TESTS
# ============================================================

def test_spatial_grid_determinism():
    grid = SpatialGrid(resolution_deg=0.05)
    cell1 = grid.get_cell_id(27.3312, 88.6123)
    cell2 = grid.get_cell_id(27.3312, 88.6123)
    assert cell1 == cell2
    assert cell1.startswith("CELL_")


def test_spatial_grid_nearby_coordinates():
    grid = SpatialGrid(resolution_deg=0.05)
    cell1 = grid.get_cell_id(27.331, 88.611)
    cell2 = grid.get_cell_id(27.334, 88.614)
    assert cell1 == cell2


def test_spatial_grid_bounds():
    grid = SpatialGrid(resolution_deg=0.05)
    bounds = grid.get_cell_bounds(27.33, 88.61)
    assert bounds["min_lat"] <= 27.33 <= bounds["max_lat"]
    assert bounds["min_lon"] <= 88.61 <= bounds["max_lon"]


# ============================================================
# 5. NEGATIVE SAMPLING & SPATIAL BUFFER TESTS
# ============================================================

def test_haversine_distance():
    # Distance between Gangtok (27.33, 88.61) and Guwahati (26.14, 91.73) ~330km
    dist = haversine_distance_km(27.33, 88.61, 26.14, 91.73)
    assert 300.0 <= dist <= 360.0


def test_is_buffer_safe():
    pos_coords = pd.DataFrame([[27.33, 88.61]], columns=["latitude", "longitude"]).to_numpy()
    # Coordinates 100m away should fail buffer check
    assert is_buffer_safe(27.3305, 88.6105, pos_coords, min_buffer_km=2.0) is False
    # Coordinates ~50km away should pass buffer check
    assert is_buffer_safe(27.80, 89.20, pos_coords, min_buffer_km=2.0) is True


# ============================================================
# 6. FEATURE CONTRACT & MODEL INPUT TESTS
# ============================================================

def test_feature_assembly_contract_match():
    assembly = FeatureAssemblyService()
    input_features = {
        "elevation_meters": 1500.0,
        "soil_clay_0_5cm": 350.0,
        "soil_sand_0_5cm": 250.0,
        "terrain_slope": 35.0,
        "terrain_aspect": 180.0,
        "rainfall_7d_mm": 120.0,
    }
    model_input = assembly.build_model_input(
        latitude=27.33,
        longitude=88.61,
        features=input_features,
    )
    assert isinstance(model_input, ModelInput)
    assert len(model_input.ordered_feature_vector) == len(assembly.feature_names)
    assert model_input.ordered_feature_vector[0] == 1500.0  # elevation_meters
    assert model_input.cell_id.startswith("CELL_")
