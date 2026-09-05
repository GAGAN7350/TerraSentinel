"""Shared schema types and response wrappers per spec."""

from __future__ import annotations

from typing import Annotated, Generic, TypeVar

from pydantic import BaseModel, Field

# Validated coordinate types
Latitude = Annotated[float, Field(ge=-90.0, le=90.0, description="WGS-84 latitude")]
Longitude = Annotated[float, Field(ge=-180.0, le=180.0, description="WGS-84 longitude")]

T = TypeVar("T")


class GeoJSONPoint(BaseModel):
    """Minimal GeoJSON Point geometry."""
    type: str = "Point"
    coordinates: list[float]  # [longitude, latitude] per GeoJSON spec


class GeoJSONFeature(BaseModel):
    """GeoJSON Feature wrapping a single record."""
    type: str = "Feature"
    geometry: GeoJSONPoint | None
    properties: dict


class GeoJSONFeatureCollection(BaseModel):
    """GeoJSON FeatureCollection for map-friendly responses."""
    type: str = "FeatureCollection"
    features: list[GeoJSONFeature]


class PaginatedResponse(BaseModel, Generic[T]):
    """
    Standard paginated list response per spec:
    { "items": [], "page": 1, "page_size": 50, "total": 0 }
    """
    items: list[T]
    page: int
    page_size: int
    total: int
