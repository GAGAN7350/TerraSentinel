import 'dart:convert';
import '../models/risk_prediction_model.dart';
import '../../core/network/api_client.dart';
import '../../core/database/local_database.dart';

class RiskRepository {
  final ApiClient _apiClient = ApiClient();

  /// Execute real-time XGBoost ML inference for given environmental/terrain inputs.
  Future<RiskPredictionModel> predictLiveRisk({
    required double latitude,
    required double longitude,
    required double terrainSlope,
    required double elevationMeters,
    required double soilClay,
    required double soilSand,
    required double rainfall7d,
    double terrainAspect = 180.0,
    double rainfall15d = 0.0,
    double rainfall30d = 0.0,
    double soilMoisture = 0.5,
    double ndvi = 0.45,
    bool storeInDb = false,
  }) async {
    final payload = {
      'latitude': latitude,
      'longitude': longitude,
      'terrain_slope': terrainSlope,
      'terrain_aspect': terrainAspect,
      'elevation_meters': elevationMeters,
      'soil_clay_0_5cm': soilClay,
      'soil_sand_0_5cm': soilSand,
      'rainfall_7d_mm': rainfall7d,
      'rainfall_15d_mm': rainfall15d,
      'rainfall_30d_mm': rainfall30d,
      'soil_moisture_root_7d_avg': soilMoisture,
      'soil_moisture_prof_7d_avg': soilMoisture,
      'sentinel2_ndvi': ndvi,
      'store_in_db': storeInDb,
    };

    final response = await _apiClient.dio.post(
      '/risk-predictions/predict',
      data: payload,
    );

    return RiskPredictionModel.fromJson(response.data);
  }

  /// Simulate What-If environmental scenarios (additive slope changes or precipitation multipliers).
  Future<RiskPredictionModel> simulateScenario({
    required double latitude,
    required double longitude,
    required double terrainSlope,
    required double elevationMeters,
    required double soilClay,
    required double soilSand,
    required double rainfall7d,
    required double slopeDeltaDeg,
    required double rainfallMultiplier,
  }) async {
    final payload = {
      'latitude': latitude,
      'longitude': longitude,
      'terrain_slope': terrainSlope,
      'terrain_aspect': 180.0,
      'elevation_meters': elevationMeters,
      'soil_clay_0_5cm': soilClay,
      'soil_sand_0_5cm': soilSand,
      'rainfall_7d_mm': rainfall7d,
      'slope_delta_deg': slopeDeltaDeg,
      'rainfall_multiplier': rainfallMultiplier,
    };

    final response = await _apiClient.dio.post(
      '/risk-predictions/simulate',
      data: payload,
    );

    return RiskPredictionModel.fromJson(response.data);
  }

  /// Fetch spatial risk points for map rendering with offline SQLite fallback.
  Future<List<RiskPredictionModel>> getRiskMapPoints({String? riskLevel}) async {
    try {
      final response = await _apiClient.dio.get(
        '/risk-predictions/risk-map',
        queryParameters: {
          if (riskLevel != null) 'risk_level': riskLevel,
          'page': 1,
          'page_size': 200,
        },
      );

      final List<dynamic> data = response.data;
      final points = data.map((json) => RiskPredictionModel.fromJson(json)).toList();

      // Update local SQLite cache in the background
      final cacheData = points.map((p) => p.toLocalCacheMap()).toList();
      LocalDatabase.instance.cacheRiskPoints(cacheData);

      return points;
    } catch (_) {
      // Fallback: Read from local SQLite cache
      final cachedRows = await LocalDatabase.instance.getCachedRiskPoints();
      return cachedRows.map((row) {
        final payload = jsonDecode(row['json_payload'] ?? '{}');
        return RiskPredictionModel(
          id: row['id'],
          latitude: (row['latitude'] as num).toDouble(),
          longitude: (row['longitude'] as num).toDouble(),
          riskScore: (row['risk_score'] as num).toDouble(),
          riskLevel: row['risk_level'],
          confidence: (row['confidence'] as num?)?.toDouble() ?? 0.85,
          trend: row['trend'] ?? 'STABLE',
          modelVersion: row['model_version'] ?? 'v1.6.0',
          calibratedProbability: (payload['calibrated_probability'] as num?)?.toDouble(),
          predictionTime: DateTime.now(),
        );
      }).toList();
    }
  }
}
