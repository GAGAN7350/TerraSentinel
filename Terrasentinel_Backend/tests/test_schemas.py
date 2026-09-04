"""
Pydantic schema validation tests.
Pure unit tests — no database or HTTP required.
"""

import pytest
from pydantic import ValidationError

from app.schemas.user import UserCreate
from app.schemas.landslide import LandslideCreate
from app.schemas.rainfall import RainfallCreate
from app.models.user import UserRole
from datetime import datetime, timezone


class TestUserSchema:
    def test_valid_user_create(self) -> None:
        user = UserCreate(name="Alice", email="alice@example.com", role=UserRole.ANALYST)
        assert user.name == "Alice"
        assert user.email == "alice@example.com"

    def test_invalid_email_rejected(self) -> None:
        with pytest.raises(ValidationError):
            UserCreate(name="Bob", email="not-an-email")

    def test_empty_name_rejected(self) -> None:
        with pytest.raises(ValidationError):
            UserCreate(name="", email="bob@example.com")

    def test_default_role_is_viewer(self) -> None:
        user = UserCreate(name="Charlie", email="charlie@example.com")
        assert user.role == UserRole.VIEWER


class TestLandslideSchema:
    def test_valid_landslide(self) -> None:
        ls = LandslideCreate(latitude=27.5, longitude=92.0)
        assert ls.latitude == 27.5
        assert ls.longitude == 92.0

    def test_latitude_out_of_range(self) -> None:
        with pytest.raises(ValidationError):
            LandslideCreate(latitude=95.0, longitude=92.0)

    def test_longitude_out_of_range(self) -> None:
        with pytest.raises(ValidationError):
            LandslideCreate(latitude=27.0, longitude=200.0)

    def test_negative_coordinates_valid(self) -> None:
        ls = LandslideCreate(latitude=-27.5, longitude=-92.0)
        assert ls.latitude == -27.5


class TestRainfallSchema:
    def test_valid_rainfall(self) -> None:
        obs = RainfallCreate(
            timestamp=datetime.now(timezone.utc),
            latitude=26.0,
            longitude=91.5,
            rainfall_mm=12.5,
        )
        assert obs.rainfall_mm == 12.5

    def test_negative_rainfall_rejected(self) -> None:
        with pytest.raises(ValidationError):
            RainfallCreate(
                timestamp=datetime.now(timezone.utc),
                latitude=26.0,
                longitude=91.5,
                rainfall_mm=-1.0,
            )
