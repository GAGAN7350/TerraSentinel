                 TERRASENTINEL DATA
                        │
       ┌────────────────┼────────────────┐
       │                │                │
       ▼                ▼                ▼
 LANDSLIDES          RAINFALL          TERRAIN
 GSI/NRSC             GPM/IMD          DEM
       │                │                │
       │                │          ┌─────┴─────┐
       │                │          │           │
       │                │        Slope      Elevation
       │                │        Aspect      Curvature
       │                │
       ├────────────────┼──────────────────────┐
       │                │                      │
       ▼                ▼                      ▼
     SOIL           SATELLITE              SOIL MOISTURE
 SoilGrids        Sentinel-2               Sensors/etc.
       │                │
       └────────────────┼──────────────────────┘
                        ▼
                 FEATURE ENGINEERING
                        │
                        ▼
                  ML RISK MODEL
                        │
                        ▼
                 RISK SCORE 0-100
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
          GIS MAP             IMPACT ENGINE
                                   │
                                   ▼
                              ALERT / PRIORITY