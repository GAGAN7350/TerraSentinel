"""Pydantic schema validation unit tests — no DB or HTTP required."""

from __future__ import annotations

from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from app.models.user import UserRole
from app.schemas.landslide import LandslideCreate
from app.schemas.rainfall import RainfallCreate
from app.schemas.risk import RiskPredictionCreate
from app.models.risk import RiskLevel
from app.schemas.user import UserRegister


class TestUserSchema:
    def test_valid_register(self) -> None:
        u = UserRegister(email="a@b.com", password="secret123", full_name="Alice")
        assert u.email == "a@b.com"

    def test_invalid_email_rejected(self) -> None:
        with pytest.raises(ValidationError):
            UserRegister(email="not-email", password="secret123", full_name="Bob")

    def test_short_password_rejected(self) -> None:
        with pytest.raises(ValidationError):
            UserRegister(email="a@b.com", password="short", full_name="Bob")

    def test_default_role_is_officer(self) -> None:
        u = UserRegister(email="a@b.com", password="secret123", full_name="Bob")
        assert u.role == UserRole.OFFICER


class TestLandslideSchema:
    def test_valid_landslide(self) -> None:
        ls = LandslideCreate(latitude=27.5, longitude=92.0)
        assert ls.latitude == 27.5

    def test_latitude_gt_90_rejected(self) -> None:
        with pytest.raises(ValidationError):
            LandslideCreate(latitude=95.0, longitude=92.0)

    def test_latitude_lt_minus90_rejected(self) -> None:
        with pytest.raises(ValidationError):
            LandslideCreate(latitude=-91.0, longitude=92.0)

    def test_longitude_gt_180_rejected(self) -> None:
        with pytest.raises(ValidationError):
            LandslideCreate(latitude=27.0, longitude=200.0)

    def test_longitude_lt_minus180_rejected(self) -> None:
        with pytest.raises(ValidationError):
            LandslideCreate(latitude=27.0, longitude=-181.0)

    def test_negative_coords_valid(self) -> None:
        ls = LandslideCreate(latitude=-27.5, longitude=-92.0)
        assert ls.longitude == -92.0


class TestRainfallSchema:
    def test_valid(self) -> None:
        r = RainfallCreate(
            observation_time=datetime.now(timezone.utc),
            latitude=25.5, longitude=91.5, rainfall_mm=15.0
        )
        assert r.rainfall_mm == 15.0

    def test_negative_rainfall_rejected(self) -> None:
        with pytest.raises(ValidationError):
            RainfallCreate(
                observation_time=datetime.now(timezone.utc),
                latitude=25.5, longitude=91.5, rainfall_mm=-1.0
            )

    def test_invalid_lat_rejected(self) -> None:
        with pytest.raises(ValidationError):
            RainfallCreate(
                observation_time=datetime.now(timezone.utc),
                latitude=100.0, longitude=91.5, rainfall_mm=5.0
            )


class TestRiskSchema:
    def test_valid_prediction(self) -> None:
        r = RiskPredictionCreate(
            prediction_time=datetime.now(timezone.utc),
            latitude=25.5, longitude=91.5,
            risk_score=72.0, risk_level=RiskLevel.HIGH,
        )
        assert r.risk_score == 72.0

    def test_risk_score_above_100_rejected(self) -> None:
        with pytest.raises(ValidationError):
            RiskPredictionCreate(
                prediction_time=datetime.now(timezone.utc),
                latitude=25.5, longitude=91.5,
                risk_score=101.0, risk_level=RiskLevel.HIGH,
            )

    def test_confidence_above_1_rejected(self) -> None:
        with pytest.raises(ValidationError):
            RiskPredictionCreate(
                prediction_time=datetime.now(timezone.utc),
                latitude=25.5, longitude=91.5,
                risk_score=50.0, risk_level=RiskLevel.MODERATE,
                confidence=1.5,
            )
