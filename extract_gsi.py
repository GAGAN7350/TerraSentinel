import camelot
import pandas as pd
import subprocess
from pathlib import Path

PDF = "data/raw/landslides/landslide_report(bhusanket).pdf"
OUTPUT = "data/raw/landslides/gsi_test.csv"

tables = camelot.read_pdf(
    PDF,
    pages="1-3",
    flavor="lattice"
)

print("Tables found:", tables.n)

all_tables = []

for table in tables:
    df = table.df
    print(df.head())
    all_tables.append(df)

result = pd.concat(all_tables, ignore_index=True)

result.to_csv(
    OUTPUT,
    index=False
)

print("Saved:", len(result), "rows")

files_to_push = ["extract_gsi.py", OUTPUT]
subprocess.run(["git", "add", "--", *files_to_push], check=True)

has_changes = subprocess.run(
    ["git", "diff", "--cached", "--quiet"],
    check=False
).returncode != 0

if has_changes:
    subprocess.run(
        ["git", "commit", "-m", "Extract GSI landslide inventory"],
        check=True
    )
    subprocess.run(["git", "push", "origin", "HEAD"], check=True)
    print("Pushed changes to GitHub.")
else:
    print("No changes to push.")
