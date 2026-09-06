"""CLI Script — Import Validated Landslides CSV into PostgreSQL/PostGIS."""

import asyncio
import sys
from pathlib import Path
import pandas as pd

# Add Terrasentinel_Backend to sys.path
backend_path = Path(__file__).resolve().parents[2] / "Terrasentinel_Backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from app.db.session import AsyncSessionLocal
from app.services.data.ingestion import LandslideIngestionService

INPUT_CSV = Path("data/processed/gsi_ner_landslides_complete.csv")


async def main():
    if not INPUT_CSV.exists():
        print(f"Error: {INPUT_CSV} does not exist.")
        sys.exit(1)

    print(f"Reading {INPUT_CSV} for bulk PostGIS database import...")
    df = pd.read_csv(INPUT_CSV)
    print(f"Loaded {len(df)} records from CSV.")

    async with AsyncSessionLocal() as session:
        svc = LandslideIngestionService(session)
        print("Starting batch ingestion into PostgreSQL / PostGIS...")
        result = await svc.bulk_import_from_dataframe(df, batch_size=500)
        print("\n" + "=" * 50)
        print("BULK INGESTION SUMMARY")
        print("=" * 50)
        print(f"Records Inserted: {result['inserted']}")
        print(f"Records Skipped:  {result['skipped']}")
        print(f"Errors Encountered: {result['errors']}")
        print("=" * 50 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
