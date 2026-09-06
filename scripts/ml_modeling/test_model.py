import json
import pandas as pd
from xgboost import XGBClassifier

# Load the saved feature names so we know exactly what the model expects
with open("models/model_features.json", "r") as f:
    feature_names = json.load(f)

# Load the trained XGBoost model
model = XGBClassifier()
model.load_model("models/xgboost_risk_model.json")

print("Model loaded successfully!\n")

# Let's create a "Dangerous" scenario (e.g. steep slope, heavy rain)
dangerous_input = {
    'rainfall_7d_mm': 300.0,    # Very heavy recent rain
    'rainfall_15d_mm': 450.0,
    'rainfall_30d_mm': 600.0,
    'elevation_meters': 1500.0,
    'soil_clay_0_5cm': 350.0,
    'soil_sand_0_5cm': 300.0,
    'soil_moisture_root_7d_avg': 0.8, # Highly saturated soil
    'soil_moisture_prof_7d_avg': 0.8,
    'sentinel2_ndvi': 0.4,
    'terrain_slope': 45.0,      # Extremely steep slope
    'terrain_aspect': 180.0
}

# Let's create a "Safe" scenario (e.g. flat ground, no rain)
safe_input = {
    'rainfall_7d_mm': 0.0,      # No rain
    'rainfall_15d_mm': 10.0,
    'rainfall_30d_mm': 20.0,
    'elevation_meters': 100.0,
    'soil_clay_0_5cm': 200.0,
    'soil_sand_0_5cm': 400.0,
    'soil_moisture_root_7d_avg': 0.2, # Dry soil
    'soil_moisture_prof_7d_avg': 0.2,
    'sentinel2_ndvi': 0.6,
    'terrain_slope': 2.0,       # Very flat ground
    'terrain_aspect': 90.0
}

def predict_risk(scenario_name, input_data):
    # Convert the dictionary to a pandas DataFrame with 1 row
    df = pd.DataFrame([input_data])
    
    # Ensure the columns match the exact order the model was trained on
    # If there are missing columns, fill them with 0 (e.g., if one-hot encoded columns are missing)
    for col in feature_names:
        if col not in df.columns:
            df[col] = 0
            
    df = df[feature_names]
    
    # predict_proba returns probabilities for [Class 0 (Safe), Class 1 (Landslide)]
    # We want the probability of Class 1
    probability = model.predict_proba(df)[0][1]
    
    # Convert to a 0-100 Risk Score
    risk_score = round(probability * 100, 2)
    
    print(f"--- {scenario_name} Scenario ---")
    print(f"Slope: {input_data['terrain_slope']} degrees | 7-Day Rain: {input_data['rainfall_7d_mm']}mm")
    print(f"ML RISK SCORE: {risk_score} / 100\n")

predict_risk("Dangerous", dangerous_input)
predict_risk("Safe", safe_input)
