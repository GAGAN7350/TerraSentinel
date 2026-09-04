"""Master v1 API router — mounts all domain routers."""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    alerts,
    field_reports,
    health,
    landslides,
    rainfall,
    risk,
    users,
)

api_v1_router = APIRouter()

api_v1_router.include_router(health.router, tags=["Health"])
api_v1_router.include_router(users.router, prefix="/users", tags=["Users"])
api_v1_router.include_router(landslides.router, prefix="/landslides", tags=["Landslides"])
api_v1_router.include_router(rainfall.router, prefix="/rainfall", tags=["Rainfall"])
api_v1_router.include_router(risk.router, prefix="/risk", tags=["Risk"])
api_v1_router.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
api_v1_router.include_router(
    field_reports.router, prefix="/field-reports", tags=["Field Reports"]
)
