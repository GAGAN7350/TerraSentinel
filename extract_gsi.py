import camelot
import pandas as pd
import subprocess
from pathlib import Path


# ============================================================
# CONFIG
# ============================================================

PDF = Path("data/raw/landslides/landslide_report(bhusanket).pdf")

RAW_OUTPUT = Path("data/raw/landslides/gsi_landslides_raw.csv")
NER_OUTPUT = Path("data/processed/gsi_ner_landslides.csv")

NER_STATES = {
    "Arunachal Pradesh",
    "Assam",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Sikkim",
    "Tripura",
}


# ============================================================
# CHECK INPUT
# ============================================================

if not PDF.exists():
    raise FileNotFoundError(f"PDF not found: {PDF}")

NER_OUTPUT.parent.mkdir(parents=True, exist_ok=True)


# ============================================================
# EXTRACT ALL TABLES FROM COMPLETE PDF
# ============================================================

print("Reading GSI PDF...")
print("This may take some time for a large PDF.")

tables = camelot.read_pdf(
    str(PDF),
    pages="all",
    flavor="lattice"
)

print("Tables found:", tables.n)


# ============================================================
# COMBINE TABLES
# ============================================================

all_tables = []

for i, table in enumerate(tables, start=1):

    df = table.df

    if df.empty:
        continue

    print(f"Processing table {i}/{tables.n}")

    all_tables.append(df)


if not all_tables:
    raise RuntimeError("No tables were extracted from the PDF.")


result = pd.concat(
    all_tables,
    ignore_index=True
)


# ============================================================
# STANDARDIZE COLUMN NAMES
# ============================================================

# The PDF extraction can sometimes split/merge headers.
# We expect these columns from the GSI inventory.

expected_columns = [
    "sl_no",
    "slide_no",
    "state",
    "district",
    "slide_name",
    "nh_sh_location",
    "latitude",
    "longitude",
    "material_involved",
    "movement_type",
    "history",
]


if len(result.columns) >= len(expected_columns):

    result = result.iloc[:, :len(expected_columns)]

    result.columns = expected_columns

else:
    raise RuntimeError(
        f"Unexpected number of columns extracted: "
        f"{len(result.columns)}"
    )


# ============================================================
# REMOVE REPEATED HEADER ROWS
# ============================================================

result = result[
    result["state"].astype(str).str.strip().str.lower() != "state"
].copy()


# ============================================================
# CLEAN TEXT COLUMNS
# ============================================================

text_columns = [
    "slide_no",
    "state",
    "district",
    "slide_name",
    "nh_sh_location",
    "material_involved",
    "movement_type",
    "history",
]

for column in text_columns:

    result[column] = (
        result[column]
        .astype(str)
        .str.strip()
        .replace({
            "": pd.NA,
            "NA": pd.NA,
            "N/A": pd.NA,
            "nan": pd.NA,
            "None": pd.NA,
        })
    )


# ============================================================
# NORMALIZE STATE NAMES
# ============================================================

result["state"] = (
    result["state"]
    .astype("string")
    .str.strip()
)


# ============================================================
# FILTER ONLY NORTH EASTERN REGION
# ============================================================

before_filter = len(result)

result = result[
    result["state"].isin(NER_STATES)
].copy()

after_filter = len(result)

print()
print("Total extracted rows:", before_filter)
print("NER rows:", after_filter)
print("Non-NER rows removed:", before_filter - after_filter)


# ============================================================
# CONVERT COORDINATES TO NUMERIC
# ============================================================

result["latitude"] = pd.to_numeric(
    result["latitude"],
    errors="coerce"
)

result["longitude"] = pd.to_numeric(
    result["longitude"],
    errors="coerce"
)


# ============================================================
# COORDINATE QUALITY CHECK
# ============================================================

result["coordinate_valid"] = (
    result["latitude"].between(-90, 90)
    &
    result["longitude"].between(-180, 180)
    &
    result["latitude"].notna()
    &
    result["longitude"].notna()
)


# ============================================================
# PARSE HISTORY DATE
# ============================================================

result["history_date"] = pd.to_datetime(
    result["history"],
    errors="coerce",
    dayfirst=True
)


# ============================================================
# DATE QUALITY FLAG
# ============================================================

result["date_available"] = (
    result["history_date"].notna()
)


# ============================================================
# CREATE UNIQUE SLIDE ID
# ============================================================

result.insert(
    0,
    "slide_id",
    range(1, len(result) + 1)
)


# ============================================================
# SOURCE
# ============================================================

result["source"] = "GSI Bhusanket"


# ============================================================
# REMOVE EXACT DUPLICATES
# ============================================================

before_duplicates = len(result)

result = result.drop_duplicates(
    subset=[
        "state",
        "district",
        "slide_name",
        "latitude",
        "longitude",
        "history_date",
    ],
    keep="first"
).copy()

print(
    "Duplicate records removed:",
    before_duplicates - len(result)
)


# ============================================================
# REORDER FINAL COLUMNS
# ============================================================

final_columns = [
    "slide_id",
    "state",
    "district",
    "slide_name",
    "slide_no",
    "nh_sh_location",
    "latitude",
    "longitude",
    "coordinate_valid",
    "material_involved",
    "movement_type",
    "history",
    "history_date",
    "date_available",
    "source",
]

result = result[final_columns]


# ============================================================
# SAVE NER DATASET
# ============================================================

result.to_csv(
    NER_OUTPUT,
    index=False
)


# ============================================================
# SAVE RAW EXTRACTION SEPARATELY
# ============================================================

# Re-run isn't required here.
# The raw extraction is reconstructed from the already extracted
# table before NER filtering.

raw_result = pd.concat(
    all_tables,
    ignore_index=True
)

raw_result.to_csv(
    RAW_OUTPUT,
    index=False
)


# ============================================================
# DATASET SUMMARY
# ============================================================

print()
print("=" * 60)
print("GSI EXTRACTION COMPLETE")
print("=" * 60)

print("Raw rows:", len(raw_result))
print("NER rows:", len(result))

print()
print("Records by state:")

print(
    result["state"]
    .value_counts()
    .sort_index()
)

print()
print(
    "Valid coordinates:",
    result["coordinate_valid"].sum()
)

print(
    "Records with dates:",
    result["date_available"].sum()
)

print()
print("Raw output:")
print(RAW_OUTPUT)

print()
print("NER output:")
print(NER_OUTPUT)


# ============================================================
# GIT
# ============================================================

files_to_push = [
    "extract_gsi.py",
    str(NER_OUTPUT),
    str(RAW_OUTPUT),
]

subprocess.run(
    ["git", "add", "--", *files_to_push],
    check=True
)

has_changes = (
    subprocess.run(
        ["git", "diff", "--cached", "--quiet"],
        check=False
    ).returncode != 0
)

if has_changes:

    subprocess.run(
        [
            "git",
            "commit",
            "-m",
            "Extract and filter GSI NER landslide inventory",
        ],
        check=True
    )

    subprocess.run(
        ["git", "push", "origin", "HEAD"],
        check=True
    )

    print()
    print("Pushed changes to GitHub.")

else:

    print()
    print("No changes to push.")