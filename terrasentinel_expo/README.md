# TerraSentinel Expo Mobile App

Run TerraSentinel natively on your Android or iPhone using **Expo Go** in 60 seconds without installing Android Studio or the Flutter SDK.

---

## Quick Start (3 Steps)

### Step 1: Install Expo Go on your Phone
- **Android**: Install [Expo Go from Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent).
- **iOS**: Install [Expo Go from App Store](https://apps.apple.com/app/expo-go/id982107779).

---

### Step 2: Install Dependencies on your PC
Open PowerShell and run:

```powershell
cd c:\new_drive\GYANS_CODES\TerraSentinel\terrasentinel_expo
npm.cmd install
```

---

### Step 3: Start the App & Scan QR Code

In the same PowerShell window, run:

```powershell
npx.cmd expo start
```

1. A large **QR Code** will be printed in your terminal.
2. Open the **Expo Go** app on your phone:
   - On Android: Tap **"Scan QR code"** inside Expo Go and point your camera at your terminal screen.
   - On iPhone: Open your default Camera app, point it at the QR code, and tap the Expo notification.
3. The app will load directly on your phone with live hot-reloading!

---

## Features Available on Mobile

1. 🗺️ **GIS Risk Map**: Interactive OpenStreetMap / satellite terrain map with color-coded landslide hazard centroids and live GPS centering.
2. 🧠 **AI Inference & TreeSHAP**: Interactive XGBoost susceptibility engine with feature sliders (Slope, Elevation, Clay, Sand, 7-Day Rainfall) and horizontal TreeSHAP attribution bars.
3. 🔬 **"What-If" Scenario Simulator**: Dynamic sliders for slope degradation (+Δ°) and precipitation surge multipliers (1.0x – 2.5x).
4. 🔔 **Disaster Alerts & Emergency Siren**: High-alert warning cards with looping emergency siren audio and vibration.
5. 🚨 **1-Tap Emergency SOS Dispatch (Fail-Safe)**: Floating red emergency trigger locking GPS coordinates and dispatching to Police (112), Fire (101), Health/Ambulance (108), and State DDMA (1070) with offline GSM SMS fallback.
6. 📷 **Field Incident Reporting & Outbox**: Camera photo evidence capture, GNSS lock, and local outbox queue for zero-connectivity valleys.
