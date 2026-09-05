"""Geospatial utility and GeoJSON tests."""

from __future__ import annotations

import pytest

from app.schemas.common import GeoJSONFeatureCollection, GeoJSONPoint
from app.services.geo import geometry_to_geojson, make_point_wkt


def test_make_point_wkt_format() -> None:
    wkt = make_point_wkt(92.68, 24.47)
    assert wkt == "SRID=4326;POINT(92.68 24.47)"


def test_make_point_wkt_longitude_first() -> None:
    """GeoJSON convention: coordinates are [longitude, latitude]."""
    wkt = make_point_wkt(longitude=92.0, latitude=25.0)
    assert "POINT(92.0 25.0)" in wkt


def test_geometry_to_geojson_returns_none_for_none() -> None:
    assert geometry_to_geojson(None) is None


def test_geojson_point_coordinate_order() -> None:
    """GeoJSON coordinates must be [longitude, latitude]."""
    point = GeoJSONPoint(type="Point", coordinates=[92.68, 24.47])
    lon, lat = point.coordinates
    assert lon == 92.68  # longitude first
    assert lat == 24.47  # latitude second


def test_geojson_feature_collection_structure() -> None:
    fc = GeoJSONFeatureCollection(features=[])
    assert fc.type == "FeatureCollection"
    assert fc.features == []


def test_make_point_wkt_negative_coords() -> None:
    wkt = make_point_wkt(-92.0, -25.0)
    assert "POINT(-92.0 -25.0)" in wkt
