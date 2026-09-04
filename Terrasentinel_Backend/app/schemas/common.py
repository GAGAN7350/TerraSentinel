"""
Shared schema utilities and types used across the application.
"""

from typing import Annotated

from pydantic import BaseModel, Field


# ------------------------------------------------------------------ #
# Validated coordinate types
# ------------------------------------------------------------------ #

Latitude = Annotated[float, Field(ge=-90.0, le=90.0, description="WGS-84 latitude")]
Longitude = Annotated[float, Field(ge=-180.0, le=180.0, description="WGS-84 longitude")]


# ------------------------------------------------------------------ #
# GeoJSON Point helper
# ------------------------------------------------------------------ #

class GeoJSONPoint(BaseModel):
    """Minimal GeoJSON Point geometry for API responses."""

    type: str = "Point"
    coordinates: list[float]  # [longitude, latitude]


# ------------------------------------------------------------------ #
# Pagination
# ------------------------------------------------------------------ #

class PaginationParams(BaseModel):
    """Common pagination query parameters."""

    skip: int = Field(default=0, ge=0, description="Number of records to skip")
    limit: int = Field(default=50, ge=1, le=500, description="Maximum records to return")


class PaginatedResponse(BaseModel):
    """Generic wrapper for paginated list responses."""

    total: int
    skip: int
    limit: int
    items: list  # overridden in concrete response types
