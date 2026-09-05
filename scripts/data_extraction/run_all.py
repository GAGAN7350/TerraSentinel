import subprocess
import sys
from pathlib import Path

def run_script(script_name):
    script_path = Path("scripts") / "data_extraction" / script_name
    print(f"\n{'='*60}")
    print(f"🚀 RUNNING: {script_name}")
    print(f"{'='*60}\n")
    
    try:
        # Run the script and stream the output to the console
        result = subprocess.run(
            [sys.executable, str(script_path)],
            check=True
        )
        print(f"\n✅ SUCCESS: {script_name} completed.")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ ERROR: {script_name} failed with exit code {e.returncode}.")
        print("Stopping pipeline.")
        sys.exit(1)
    except FileNotFoundError:
        print(f"\n❌ ERROR: Could not find {script_path}. Are you running this from the repository root?")
        sys.exit(1)

if __name__ == "__main__":
    print("🌍 TerraSentinel Data Extraction Pipeline")
    print("This will sequentially fetch all external dataset features.")
    print("Make sure you have an active internet connection and have authenticated Earth Engine.\n")
    
    # Define the exact execution order to build the pipeline
    scripts = [
        ## "extract_gsi.py",
        "extract_rainfall.py",
        "extract_terrain.py",
        "extract_soil.py",
        "extract_moisture.py",
        "extract_satellite.py"
    ]
    
    for script in scripts:
        run_script(script)
        
    print(f"\n{'='*60}")
    print("🎉 ALL EXTRACTIONS COMPLETED SUCCESSFULLY!")
    print("Your final dataset is ready at: data/processed/gsi_ner_landslides_complete.csv")
    print(f"{'='*60}\n")
