from pathlib import Path
import pandas as pd

INPUT_CSV = Path("data/processed/gsi_ner_imputed.csv")
OUTPUT_CSV = Path("data/processed/ml_ready_dataset.csv")

print(f"Reading imputed dataset from {INPUT_CSV}...")
df = pd.read_csv(INPUT_CSV)
print(f"Loaded {len(df)} records. Shape: {df.shape}")

# 1. Drop text columns
cols_to_drop = [
    'slide_name', 'history', 'nh_sh_location', 'source',
    'state', 'district', 'slide_no', 'history_date'
]
existing_cols_to_drop = [c for c in cols_to_drop if c in df.columns]
print(f"\nDropping text columns: {existing_cols_to_drop}")
df = df.drop(columns=existing_cols_to_drop)

# Convert boolean / boolean-like columns to integer
for col in ['coordinate_valid', 'date_available']:
    if col in df.columns:
        df[col] = df[col].astype(int)

# 2. Clean and convert categorical columns using pd.get_dummies
cat_cols = ['material_involved', 'movement_type']
for col in cat_cols:
    if col in df.columns:
        # Normalize missing values and clean any newlines or excess whitespace
        df[col] = df[col].astype(str).replace({'nan': None, 'None': None, '<NA>': None})
        df[col] = df[col].str.replace(r'[\r\n]+', ' ', regex=True).str.strip()

print(f"Encoding categorical columns {cat_cols} with pd.get_dummies...")
df = pd.get_dummies(df, columns=cat_cols, dtype=int)

print(f"\nFinal dataset shape: {df.shape}")
print(f"Data types present: {set(df.dtypes)}")
print(f"Total missing values: {df.isnull().sum().sum()}")
print(f"Class distribution of 'Slide':\n{df['Slide'].value_counts()}")

OUTPUT_CSV.parent.mkdir(parents=True, exist_ok=True)
df.to_csv(OUTPUT_CSV, index=False)
print(f"\nSaved ML-ready dataset to {OUTPUT_CSV}")
