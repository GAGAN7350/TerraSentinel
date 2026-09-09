import 'dart:convert';

class ShapFeatureDriver {
  final String featureName;
  final double shapValue;
  final String label;

  ShapFeatureDriver({
    required this.featureName,
    required this.shapValue,
    required this.label,
  });

  factory ShapFeatureDriver.fromMap(String key, dynamic value) {
    final double v = (value as num).toDouble();
    String friendlyLabel = key.replaceAll('_', ' ').toUpperCase();
    if (key == 'terrain_slope') friendlyLabel = 'Terrain Slope Angle';
    if (key == 'soil_clay_0_5cm') friendlyLabel = 'Soil Clay Content';
    if (key == 'soil_sand_0_5cm') friendlyLabel = 'Soil Sand Content';
    if (key == 'elevation_meters') friendlyLabel = 'Elevation (DEM)';
    if (key == 'aspect_sin') friendlyLabel = 'Terrain Aspect (Sin)';
    if (key == 'aspect_cos') friendlyLabel = 'Terrain Aspect (Cos)';

    return ShapFeatureDriver(
      featureName: key,
      shapValue: v,
      label: friendlyLabel,
    );
  }
}

class RiskPredictionModel {
  final String? id;
  final double latitude;
  final double longitude;
  final double riskScore;
  final String riskLevel; // 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'
  final double confidence;
  final String trend; // 'INCREASING', 'STABLE', 'DECREASING'
  final String modelVersion;
  final double? rawProbability;
  final double? calibratedProbability;
  final double? classificationThreshold;
  final bool isOutOfDistribution;
  final List<String> oodReasons;
  final Map<String, dynamic>? explanation;
  final List<ShapFeatureDriver> shapDrivers;
  final DateTime predictionTime;

  RiskPredictionModel({
    this.id,
    required this.latitude,
    required this.longitude,
    required this.riskScore,
    required this.riskLevel,
    required this.confidence,
    required this.trend,
    required this.modelVersion,
    this.rawProbability,
    this.calibratedProbability,
    this.classificationThreshold,
    this.isOutOfDistribution = false,
    this.oodReasons = const [],
    this.explanation,
    this.shapDrivers = const [],
    required this.predictionTime,
  });

  factory RiskPredictionModel.fromJson(Map<String, dynamic> json) {
    final explanationData = json['explanation'] as Map<String, dynamic>?;
    final List<ShapFeatureDriver> drivers = [];

    if (explanationData != null && explanationData['shap_values'] != null) {
      final shapMap = explanationData['shap_values'] as Map<String, dynamic>;
      shapMap.forEach((k, v) {
        if (v is num) {
          drivers.add(ShapFeatureDriver.fromMap(k, v));
        }
      });
      // Sort drivers by magnitude descending
      drivers.sort((a, b) => b.shapValue.abs().compareTo(a.shapValue.abs()));
    }

    // Geometry handling if GeoJSON
    double lat = (json['latitude'] as num?)?.toDouble() ?? 0.0;
    double lon = (json['longitude'] as num?)?.toDouble() ?? 0.0;
    if (json['geometry'] != null && json['geometry']['coordinates'] != null) {
      final coords = json['geometry']['coordinates'] as List;
      if (coords.length >= 2) {
        lon = (coords[0] as num).toDouble();
        lat = (coords[1] as num).toDouble();
      }
    }

    return RiskPredictionModel(
      id: json['id']?.toString() ?? json['saved_record_id']?.toString(),
      latitude: lat,
      longitude: lon,
      riskScore: (json['risk_score'] as num?)?.toDouble() ?? 0.0,
      riskLevel: json['risk_level'] ?? 'LOW',
      confidence: (json['confidence'] as num?)?.toDouble() ?? 0.85,
      trend: json['trend'] ?? 'STABLE',
      modelVersion: json['model_version'] ?? 'v1.6.0-xgboost-calibrated',
      rawProbability: (json['raw_probability'] as num?)?.toDouble(),
      calibratedProbability: (json['calibrated_probability'] as num?)?.toDouble(),
      classificationThreshold: (json['classification_threshold'] as num?)?.toDouble() ?? 0.50,
      isOutOfDistribution: json['out_of_distribution'] ?? false,
      oodReasons: List<String>.from(json['ood_reasons'] ?? []),
      explanation: explanationData,
      shapDrivers: drivers,
      predictionTime: json['prediction_time'] != null
          ? DateTime.tryParse(json['prediction_time']) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toLocalCacheMap() {
    return {
      'id': id ?? '${latitude}_$longitude',
      'latitude': latitude,
      'longitude': longitude,
      'risk_score': riskScore,
      'risk_level': riskLevel,
      'trend': trend,
      'confidence': confidence,
      'model_version': modelVersion,
      'json_payload': jsonEncode({
        'risk_score': riskScore,
        'risk_level': riskLevel,
        'confidence': confidence,
        'trend': trend,
        'model_version': modelVersion,
        'calibrated_probability': calibratedProbability,
        'explanation': explanation,
      }),
      'updated_at': DateTime.now().toIso8601String(),
    };
  }
}
