"""Spatial Grid System — Deterministic Spatial Unit for Feature Aggregation."""

from __future__ import annotations

import math

DEFAULT_GRID_RESOLUTION = 0.05  # ~5 km resolution


class SpatialGrid:
    """Configurable, deterministic spatial grid mapping coordinates to cell IDs."""

    def __init__(self, resolution_deg: float = DEFAULT_GRID_RESOLUTION) -> None:
        if resolution_deg <= 0:
            raise ValueError("Grid resolution must be greater than 0.")
        self.resolution = resolution_deg

    def get_cell_id(self, latitude: float, longitude: float) -> str:
        """Map latitude and longitude to a deterministic cell ID string."""
        cell_lat = round(math.floor(latitude / self.resolution) * self.resolution, 4)
        cell_lon = round(math.floor(longitude / self.resolution) * self.resolution, 4)
        return f"CELL_{cell_lat:.4f}_{cell_lon:.4f}"

    def get_cell_bounds(self, latitude: float, longitude: float) -> dict[str, float]:
        """Return the bounding box for the spatial cell containing given coordinates."""
        min_lat = round(math.floor(latitude / self.resolution) * self.resolution, 4)
        max_lat = round(min_lat + self.resolution, 4)
        min_lon = round(math.floor(longitude / self.resolution) * self.resolution, 4)
        max_lon = round(min_lon + self.resolution, 4)
        return {
            "min_lat": min_lat,
            "max_lat": max_lat,
            "min_lon": min_lon,
            "max_lon": max_lon,
            "center_lat": round((min_lat + max_lat) / 2.0, 4),
            "center_lon": round((min_lon + max_lon) / 2.0, 4),
        }
