from pathlib import Path
import pandas as pd

INPUT_CSV = Path("data/processed/gsi_ner_balanced.csv")
OUTPUT_CSV = Path("data/processed/gsi_ner_imputed.csv")

print(f"Reading balanced dataset from {INPUT_CSV}...")
df = pd.read_csv(INPUT_CSV)
print(f"Loaded {len(df)} records. Shape: {df.shape}")

print("\nMissing values before imputation:")
missing_before = df.isnull().sum()
print(missing_before[missing_before > 0])

# Impute missing values in continuous columns using median
print("\nImputing missing values in continuous columns using df.median(numeric_only=True)...")
medians = df.median(numeric_only=True)
df = df.fillna(medians)

print("\nMissing values after continuous imputation:")
missing_after = df.isnull().sum()
print(missing_after[missing_after > 0])

OUTPUT_CSV.parent.mkdir(parents=True, exist_ok=True)
df.to_csv(OUTPUT_CSV, index=False)
print(f"\nSaved imputed dataset to {OUTPUT_CSV}")
