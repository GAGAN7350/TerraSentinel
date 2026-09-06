"""PostGIS Bulk Data Ingestion Service — Efficient Batch Insertion of Landslide Events."""

from __future__ import annotations

import logging
from typing import Any

import pandas as pd
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.landslide import Landslide
from app.services.geo import make_point_wkt

logger = logging.getLogger(__name__)


class LandslideIngestionService:
    """Bulk ingestion service for validating and batch-inserting GSI landslides into PostGIS."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def bulk_import_from_dataframe(self, df: pd.DataFrame, batch_size: int = 500) -> dict[str, int]:
        """Bulk insert DataFrame of landslide records into PostGIS using batch commits."""
        if df.empty:
            return {"inserted": 0, "skipped": 0, "errors": 0}

        inserted = 0
        skipped = 0
        errors = 0

        objects_to_insert = []
        for _, row in df.iterrows():
            try:
                lat = float(row["latitude"])
                lon = float(row["longitude"])
                wkt_geom = make_point_wkt(lon, lat)

                occ_date = None
                date_val = row.get("history_date") or row.get("parsed_date")
                if pd.notna(date_val):
                    try:
                        occ_date = pd.to_datetime(date_val).to_pydatetime()
                    except Exception:
                        pass

                landslide = Landslide(
                    state=str(row.get("state", "Unknown")),
                    district=str(row.get("district", "Unknown")),
                    subdivision=str(row.get("subdivision")) if pd.notna(row.get("subdivision")) else None,
                    village=str(row.get("village")) if pd.notna(row.get("village")) else None,
                    slide_name=str(row.get("slide_name")) if pd.notna(row.get("slide_name")) else None,
                    slide_no=str(row.get("slide_no")) if pd.notna(row.get("slide_no")) else None,
                    nh_sh_location=str(row.get("nh_sh_location")) if pd.notna(row.get("nh_sh_location")) else None,
                    latitude=lat,
                    longitude=lon,
                    geom=wkt_geom,
                    material_involved=str(row.get("material_involved")) if pd.notna(row.get("material_involved")) else None,
                    movement_type=str(row.get("movement_type")) if pd.notna(row.get("movement_type")) else None,
                    occurrence_date=occ_date,
                    source=str(row.get("source", "GSI Bhusanket")),
                )
                objects_to_insert.append(landslide)

                if len(objects_to_insert) >= batch_size:
                    self.session.add_all(objects_to_insert)
                    await self.session.commit()
                    inserted += len(objects_to_insert)
                    objects_to_insert.clear()

            except Exception as e:
                logger.error(f"Error processing row during bulk ingestion: {e}")
                errors += 1

        if objects_to_insert:
            self.session.add_all(objects_to_insert)
            await self.session.commit()
            inserted += len(objects_to_insert)

        return {"inserted": inserted, "skipped": skipped, "errors": errors}
