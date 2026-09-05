# ORM models — import all here so Alembic discovers them via metadata
from app.models.user import User
from app.models.landslide import Landslide
from app.models.rainfall import RainfallObservation
from app.models.risk import RiskPrediction
from app.models.alert import Alert
from app.models.field_report import FieldReport

__all__ = [
    "User",
    "Landslide",
    "RainfallObservation",
    "RiskPrediction",
    "Alert",
    "FieldReport",
]
