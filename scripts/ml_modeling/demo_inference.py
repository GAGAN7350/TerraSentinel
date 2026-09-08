import sys
from pathlib import Path
import json

# Add the backend directory to Python path so we can import the Inference Service
backend_dir = Path("Terrasentinel_Backend").absolute()
sys.path.append(str(backend_dir))

from app.services.ml_inference import MLInferenceService

def main():
    print("Booting up ML Inference Engine (Singleton Cache)...")
    engine = MLInferenceService()
    
    health = engine.get_health_status()
    print("\nEngine Health Status:")
    print(f"  - Model Version: {health['model_version']}")
    print(f"  - SHAP Explainer Active: {health['shap_explainer_active']}")
    print(f"  - Probability Calibrator Active: {health['probability_calibrator_active']}")
    print(f"  - OOD Guardrails Active: {health['domain_bounds_active']}")
    print(f"  - Threshold: {health['classification_threshold']}")

    print("\n=======================================================")
    print("SCENARIO 1: DANGEROUS MONSOON SLOPE (Sikkim)")
    print("=======================================================")
    dangerous_input = {
        'latitude': 27.5,
        'longitude': 88.5,
        'rainfall_7d_mm': 300.0,
        'elevation_meters': 1500.0,
        'soil_clay_0_5cm': 350.0,
        'soil_sand_0_5cm': 300.0,
        'terrain_slope': 45.0,
        'terrain_aspect': 180.0
    }
    
    result = engine.predict_risk(dangerous_input)
    print(f"Risk Level: {result['risk_level']} (Score: {result['risk_score']}/100)")
    print(f"Confidence: {result['confidence'] * 100}%")
    print(f"Calibrated Probability: {result['calibrated_probability']}")
    print(f"OOD Warning: {result['out_of_distribution']}")
    print(f"SHAP Primary Drivers:")
    for driver in result['explanation']['primary_drivers']:
        print(f"   -> {driver}")

    print("\n=======================================================")
    print("SCENARIO 2: SAFE FLATLAND (Guwahati Plains)")
    print("=======================================================")
    safe_input = {
        'latitude': 26.1,
        'longitude': 91.7,
        'rainfall_7d_mm': 10.0,
        'elevation_meters': 50.0,
        'soil_clay_0_5cm': 200.0,
        'soil_sand_0_5cm': 400.0,
        'terrain_slope': 2.0,
        'terrain_aspect': 90.0
    }
    
    result = engine.predict_risk(safe_input)
    print(f"Risk Level: {result['risk_level']} (Score: {result['risk_score']}/100)")
    print(f"Confidence: {result['confidence'] * 100}%")
    print(f"Calibrated Probability: {result['calibrated_probability']}")
    print(f"OOD Warning: {result['out_of_distribution']}")
    print(f"SHAP Primary Drivers:")
    for driver in result['explanation']['primary_drivers']:
        print(f"   -> {driver}")

    print("\n=======================================================")
    print("SCENARIO 3: IMPOSSIBLE DATA (Testing OOD Guardrails)")
    print("=======================================================")
    impossible_input = {
        'latitude': -50.0,        # Antarctica!
        'longitude': 0.0,
        'rainfall_7d_mm': 5000.0, # Impossible rainfall!
        'elevation_meters': -100.0,
        'soil_clay_0_5cm': 200.0,
        'soil_sand_0_5cm': 400.0,
        'terrain_slope': 90.0,    # Vertical cliff
        'terrain_aspect': 90.0
    }
    
    result = engine.predict_risk(impossible_input)
    print(f"Risk Level: {result['risk_level']} (Score: {result['risk_score']}/100)")
    print(f"OOD Warning triggered: {result['out_of_distribution']}")
    print("Guardrail Reasons:")
    for reason in result['ood_reasons']:
        print(f"   -> {reason}")

if __name__ == "__main__":
    main()
