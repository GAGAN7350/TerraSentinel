"""
Geospatial utility helpers.
Converts between coordinate pairs, WKT, and GeoJSON representations.
GeoAlchemy2 stores geometry as WKB; these helpers make it API-friendly.
"""

from geoalchemy2.shape import to_shape
from shapely.geometry import Point, mapping

from app.schemas.common import GeoJSONPoint


def make_point_wkt(longitude: float, latitude: float) -> str:
    """Return a WKT POINT string for insertion via GeoAlchemy2."""
    return f"SRID=4326;POINT({longitude} {latitude})"


def geometry_to_geojson(geometry: object | None) -> GeoJSONPoint | None:
    """
    Convert a GeoAlchemy2 geometry column value to a GeoJSONPoint schema.
    Returns None if geometry is None or conversion fails.
    """
    if geometry is None:
        return None
    try:
        shape = to_shape(geometry)
        if isinstance(shape, Point):
            return GeoJSONPoint(
                type="Point",
                coordinates=[shape.x, shape.y],  # [lon, lat]
            )
        geo = mapping(shape)
        return GeoJSONPoint(type=geo["type"], coordinates=list(geo["coordinates"]))
    except Exception:
        return None
