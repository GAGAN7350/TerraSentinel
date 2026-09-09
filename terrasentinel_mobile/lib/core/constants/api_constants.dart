class ApiConstants {
  // Default URL points to backend API
  // Android Emulator: 10.0.2.2:8000 | Physical Device / iOS: Configure your local network IP
  static const String defaultBaseUrl = 'http://10.0.2.2:8000/api/v1';

  // Authentication
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String me = '/auth/me';

  // Landslides
  static const String landslides = '/landslides/';
  static const String landslidesNearby = '/landslides/nearby';
  static const String landslidesBbox = '/landslides/bbox';

  // Rainfall Telemetry
  static const String rainfall = '/rainfall/';
  static const String rainfallNearby = '/rainfall/nearby';

  // ML Risk Predictions & Inference
  static const String riskPredict = '/risk-predictions/predict';
  static const String riskSimulate = '/risk-predictions/simulate';
  static const String riskMap = '/risk-predictions/risk-map';
  static const String riskModelInfo = '/risk-predictions/model-info';
  static const String riskModelHealth = '/risk-predictions/health';
  static const String riskPredictionsNearby = '/risk-predictions/nearby';

  // Alerts & Warnings
  static const String alerts = '/alerts/';

  // Field Reports (Offline Outbox Sync Target)
  static const String fieldReports = '/field-reports/';

  // Health
  static const String health = '/health';
}
