# TerraSentinel Mobile Application

**AI-powered Landslide Early Warning, High-Alert Siren, Multi-Agency Disaster Dispatch & Offline Field Intelligence for Northeast India (NER).**

Developed for the **Smart India Hackathon (SIH 2026)**.

---

## Key Features

1. **High-Decibel Emergency Siren Engine**:
   - Replaces ordinary phone notification chimes with a loud emergency siren audio.
   - Configured with `AudioAttributes.USAGE_ALARM` on Android and `InterruptionLevel.critical` on iOS to override device Do Not Disturb (DND) and silent profiles.
   - On-screen flashing strobe alert modal with explicit responder acknowledge control.

2. **Emergency Multi-Agency Control Room Dispatch (Model Fail-Safe)**:
   - When a landslide occurs without prior model warning (sudden cloudburst, unmonitored road excavation, seismic trigger), officers or citizens can tap the prominent **🚨 SOS DISPATCH** trigger.
   - Instantly locks high-accuracy GNSS GPS coordinates (latitude, longitude, altitude).
   - Simultaneously alerts:
     - 🚔 **Police Control Room (PCR / 112)**
     - 🚒 **Fire & Emergency Rescue Services (101)**
     - 🚑 **Disaster Ambulance & Trauma Services (EMRI 108)**
     - 🏛️ **State / District Disaster Management Authority (SDMA / DDMA 1070)**
   - **Offline GSM SMS Fallback**: If cellular data (4G/5G) towers are severed, automatically generates a pre-formatted emergency SMS with Google Maps coordinates link (`https://maps.google.com/?q=lat,lon`) for direct carrier broadcast.

3. **On-Field Live ML Risk Inference & TreeSHAP Explanations**:
   - Directly connects to the backend XGBoost model (`v1.6.0-xgboost-calibrated`).
   - Displays real-time 0–100 risk score and Platt-scaled posterior probabilities.
   - Interactive horizontal **TreeSHAP waterfall chart** ranking features (terrain slope, clay saturation, elevation, circular aspect).
   - Integrated **"What-If" Scenario Simulator** with sliders for slope delta ($\Delta\theta$) and rainfall surge multiplier ($1.0\times - 3.0\times$).

4. **Interactive Offline-First GIS Risk Map**:
   - OpenStreetMap / Vector contour tile layers.
   - Color-coded hazard markers with dynamic pulsing for Critical sectors.
   - User live GPS position tracking with proximity warning ring when approaching danger zones (< 2.5 km).

5. **Field Incident Reporting & Outbox Sync**:
   - In-app camera photo capture with automated EXIF metadata.
   - **SQLite Outbox Pattern**: If the responder is deep in an unserved valley with zero cellular signal, reports are saved locally.
   - A background sync worker continuously monitors connectivity and auto-submits queued reports to `POST /api/v1/field-reports/` as soon as connection is restored.

---

## Directory Structure

```text
terrasentinel_mobile/
├── assets/
│   ├── icons/
│   └── sounds/
│       └── emergency_siren.mp3
├── lib/
│   ├── main.dart                                # App entry point, services bootstrap
│   ├── app.dart                                 # MultiBlocProvider, Dark slate/cyan theme
│   ├── core/
│   │   ├── constants/
│   │   │   ├── api_constants.dart              # REST endpoints
│   │   │   └── emergency_contacts.dart         # 112, 101, 108, 1070 & NER SDMAs
│   │   ├── database/
│   │   │   └── local_database.dart             # SQLite outbox & caching
│   │   ├── network/
│   │   │   └── api_client.dart                 # Dio client with JWT & interceptors
│   │   └── services/
│   │       ├── alert_audio_service.dart        # Looping emergency alarm sound
│   │       ├── emergency_dispatch_service.dart # Multi-agency dispatch & SMS fallback
│   │       ├── geofence_service.dart           # Proximity threat detector
│   │       ├── notification_service.dart       # USAGE_ALARM DND-override
│   │       └── sync_worker.dart                # Background outbox sync
│   ├── data/
│   │   ├── models/
│   │   │   ├── alert_model.dart
│   │   │   ├── emergency_sos_model.dart
│   │   │   ├── field_report_model.dart
│   │   │   ├── landslide_model.dart
│   │   │   └── risk_prediction_model.dart
│   │   └── repositories/
│   │       ├── alert_repository.dart
│   │       ├── field_report_repository.dart
│   │       └── risk_repository.dart
│   └── presentation/
│       ├── blocs/
│       │   ├── alert_bloc.dart
│       │   ├── emergency_bloc.dart
│       │   └── risk_bloc.dart
│       ├── screens/
│       │   ├── home_navigation_screen.dart     # Bottom nav & Floating SOS button
│       │   ├── alerts/alerts_feed_screen.dart
│       │   ├── emergency/emergency_sos_screen.dart
│       │   ├── map/gis_risk_map_screen.dart
│       │   ├── predict/ml_prediction_screen.dart
│       │   └── report/submit_report_screen.dart
│       └── widgets/
│           ├── critical_siren_dialog.dart      # Strobe flashing alarm modal
│           ├── emergency_agency_card.dart      # Agency hotline & SMS launcher
│           ├── risk_badge.dart
│           └── shap_waterfall_chart.dart       # TreeSHAP decision explainability
└── pubspec.yaml
```

---

## Getting Started

### 1. Prerequisites
- Flutter SDK `>=3.0.0`
- Android Studio / VS Code with Flutter extension
- Android SDK (API level 26+ recommended for alarm notification channels)

### 2. Install Dependencies
```bash
cd terrasentinel_mobile
flutter pub get
```

### 3. Run the App
- **On Android Emulator**:
  ```bash
  flutter run
  ```
  *(Default base URL `http://10.0.2.2:8000/api/v1` automatically connects to `Terrasentinel_Backend` running on host).*
- **On Physical Device**:
  Update `lib/core/constants/api_constants.dart` with your machine's LAN IP address (e.g. `http://192.168.1.50:8000/api/v1`).
