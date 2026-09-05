"""
Seed demo data for development.

Creates realistic records within NER (North-East India) coordinates.
All records are clearly marked as DEMO data.

Usage:
    python scripts/seed_demo_data.py

Requires a running PostgreSQL/PostGIS instance and applied Alembic migrations.
"""

from __future__ import annotations

import asyncio
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Ensure project root is on path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.core.security import hash_password
from app.models.alert import Alert, AlertSeverity, AlertStatus
from app.models.field_report import FieldReport, ReportSeverity, ReportType
from app.models.landslide import Landslide
from app.models.rainfall import RainfallObservation
from app.models.risk import RiskLevel, RiskPrediction, RiskTrend
from app.models.user import User, UserRole
from app.services.geo import make_point_wkt

# ------------------------------------------------------------------ #
# NER coordinate pairs (lat, lon)
# ------------------------------------------------------------------ #
NER_POINTS = [
    (27.10, 92.00),   # Arunachal Pradesh
    (25.57, 91.88),   # Shillong, Meghalaya
    (24.82, 92.79),   # Silchar, Assam
    (25.47, 91.36),   # Tura, Meghalaya
    (26.16, 94.37),   # Dimapur, Nagaland
    (23.73, 92.72),   # Aizawl, Mizoram
    (24.21, 92.37),   # Lunglei, Mizoram
    (27.33, 88.61),   # Gangtok, Sikkim
]

NOW = datetime.now(timezone.utc)


async def seed(session: AsyncSession) -> None:
    print("🌱  Seeding demo data for TerraSentinel...")

    # ---------------------------------------------------------------- #
    # Users
    # ---------------------------------------------------------------- #
    admin = User(
        email="admin@terrasentinel.demo",
        password_hash=hash_password("Admin@1234"),
        full_name="TerraSentinel Admin [DEMO]",
        role=UserRole.ADMIN,
        is_active=True,
    )
    officer = User(
        email="officer@terrasentinel.demo",
        password_hash=hash_password("Officer@1234"),
        full_name="Field Officer Assam [DEMO]",
        role=UserRole.OFFICER,
        is_active=True,
    )
    session.add_all([admin, officer])
    await session.flush()
    print(f"  ✓ Users: {admin.email}, {officer.email}")

    # ---------------------------------------------------------------- #
    # Landslides
    # ---------------------------------------------------------------- #
    landslide_records = [
        Landslide(
            source="GSI_BHUSANKET",
            external_id="GSI-NER-001",
            state="Arunachal Pradesh",
            district="West Siang",
            slide_name="DEMO Slide A",
            latitude=27.10, longitude=92.00,
            geom=make_point_wkt(92.00, 27.10),
            occurrence_date=None,
            movement_type="Debris flow",
            material_involved="Soil and rock",
        ),
        Landslide(
            source="GSI_BHUSANKET",
            external_id="GSI-NER-002",
            state="Meghalaya",
            district="East Khasi Hills",
            slide_name="DEMO Slide B",
            latitude=25.57, longitude=91.88,
            geom=make_point_wkt(91.88, 25.57),
            occurrence_date=None,
            movement_type="Rockfall",
            material_involved="Rock",
        ),
        Landslide(
            source="NRSC",
            external_id="NRSC-NER-003",
            state="Assam",
            district="Cachar",
            slide_name="DEMO Slide C",
            latitude=24.82, longitude=92.79,
            geom=make_point_wkt(92.79, 24.82),
            occurrence_date=None,
            movement_type="Translational slide",
            material_involved="Soil",
        ),
        Landslide(
            source="NRSC",
            external_id="NRSC-NER-004",
            state="Nagaland",
            district="Dimapur",
            slide_name="DEMO Slide D",
            latitude=26.16, longitude=94.37,
            geom=make_point_wkt(94.37, 26.16),
            occurrence_date=None,
            movement_type="Debris slide",
            material_involved="Soil and vegetation",
        ),
        Landslide(
            source="GSI_BHUSANKET",
            external_id="GSI-NER-005",
            state="Sikkim",
            district="East Sikkim",
            slide_name="DEMO Slide E",
            latitude=27.33, longitude=88.61,
            geom=make_point_wkt(88.61, 27.33),
            occurrence_date=None,
            movement_type="Rockslide",
            material_involved="Rock",
        ),
    ]
    session.add_all(landslide_records)
    await session.flush()
    print(f"  ✓ Landslides: {len(landslide_records)} records")

    # ---------------------------------------------------------------- #
    # Rainfall observations
    # ---------------------------------------------------------------- #
    rainfall_records = []
    for i, (lat, lon) in enumerate(NER_POINTS[:5]):
        rainfall_records.append(
            RainfallObservation(
                source="IMD_GAUGE",
                observation_time=NOW - timedelta(hours=i * 6),
                latitude=lat, longitude=lon,
                geom=make_point_wkt(lon, lat),
                rainfall_mm=round(10 + i * 15.5, 1),
                duration_minutes=60,
                cell_id=f"IMD-DEMO-{i+1:03d}",
            )
        )
    session.add_all(rainfall_records)
    await session.flush()
    print(f"  ✓ Rainfall observations: {len(rainfall_records)} records")

    # ---------------------------------------------------------------- #
    # Risk predictions
    # ---------------------------------------------------------------- #
    risk_levels = [RiskLevel.LOW, RiskLevel.MODERATE, RiskLevel.HIGH, RiskLevel.CRITICAL]
    risk_records = []
    for i, (lat, lon) in enumerate(NER_POINTS[:4]):
        lvl = risk_levels[i]
        score = [15.0, 40.0, 72.0, 91.0][i]
        risk_records.append(
            RiskPrediction(
                prediction_time=NOW,
                valid_until=NOW + timedelta(hours=24),
                latitude=lat, longitude=lon,
                geom=make_point_wkt(lon, lat),
                risk_score=score,
                risk_level=lvl,
                confidence=0.82,
                trend=RiskTrend.INCREASING,
                model_version="demo-v0.1",
                explanation={
                    "factors": [
                        {"name": "24h_rainfall_mm", "value": 120, "contribution": "high"},
                        {"name": "slope_degrees", "value": 35, "contribution": "high"},
                    ]
                },
            )
        )
    session.add_all(risk_records)
    await session.flush()
    print(f"  ✓ Risk predictions: {len(risk_records)} records")

    # ---------------------------------------------------------------- #
    # Alerts
    # ---------------------------------------------------------------- #
    alert_records = [
        Alert(
            severity=AlertSeverity.HIGH,
            title="[DEMO] High landslide risk — Arunachal Pradesh",
            message="Heavy rainfall combined with steep terrain increases risk in West Siang district.",
            state="Arunachal Pradesh",
            district="West Siang",
            latitude=27.10, longitude=92.00,
            geom=make_point_wkt(92.00, 27.10),
            risk_prediction_id=risk_records[2].id,
            status=AlertStatus.ACTIVE,
            issued_at=NOW,
            expires_at=NOW + timedelta(hours=48),
        ),
        Alert(
            severity=AlertSeverity.CRITICAL,
            title="[DEMO] Critical risk — Meghalaya",
            message="Critical landslide risk detected. Residents in vulnerable zones advised to evacuate.",
            state="Meghalaya",
            district="East Khasi Hills",
            latitude=25.57, longitude=91.88,
            geom=make_point_wkt(91.88, 25.57),
            risk_prediction_id=risk_records[3].id,
            status=AlertStatus.ACTIVE,
            issued_at=NOW,
            expires_at=NOW + timedelta(hours=24),
        ),
        Alert(
            severity=AlertSeverity.WARNING,
            title="[DEMO] Moderate risk watch — Assam",
            message="Moderate risk conditions. Monitor rainfall closely.",
            state="Assam",
            district="Cachar",
            status=AlertStatus.DRAFT,
        ),
    ]
    session.add_all(alert_records)
    await session.flush()
    print(f"  ✓ Alerts: {len(alert_records)} records")

    # ---------------------------------------------------------------- #
    # Field reports
    # ---------------------------------------------------------------- #
    report_records = [
        FieldReport(
            submitted_by=officer.id,
            latitude=25.57, longitude=91.88,
            geom=make_point_wkt(91.88, 25.57),
            state="Meghalaya",
            district="East Khasi Hills",
            report_type=ReportType.SLOPE_MOVEMENT,
            severity=ReportSeverity.HIGH,
            description="[DEMO] Observed active slope movement on NH-6 near Shillong. Cracks visible on road surface.",
            observed_at=NOW - timedelta(hours=3),
        ),
        FieldReport(
            submitted_by=officer.id,
            latitude=24.82, longitude=92.79,
            geom=make_point_wkt(92.79, 24.82),
            state="Assam",
            district="Cachar",
            report_type=ReportType.CRACK,
            severity=ReportSeverity.MODERATE,
            description="[DEMO] Multiple tension cracks observed on hillslope. Width ~10cm, length ~50m.",
            observed_at=NOW - timedelta(hours=6),
        ),
        FieldReport(
            submitted_by=officer.id,
            latitude=27.10, longitude=92.00,
            geom=make_point_wkt(92.00, 27.10),
            state="Arunachal Pradesh",
            district="West Siang",
            report_type=ReportType.ROAD_BLOCKAGE,
            severity=ReportSeverity.HIGH,
            description="[DEMO] Road blocked by debris flow. Approximately 200m of NH-13 affected.",
            observed_at=NOW - timedelta(hours=1),
        ),
    ]
    session.add_all(report_records)
    await session.flush()
    print(f"  ✓ Field reports: {len(report_records)} records")

    await session.commit()
    print("\n✅  Demo data seeded successfully.")
    print("   Admin login:   admin@terrasentinel.demo / Admin@1234")
    print("   Officer login: officer@terrasentinel.demo / Officer@1234")
    print("   NOTE: All records are DEMO data — not real observations.")


async def main() -> None:
    engine = create_async_engine(settings.async_database_url, echo=False)
    factory = async_sessionmaker(engine, expire_on_commit=False)
    async with factory() as session:
        await seed(session)
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
