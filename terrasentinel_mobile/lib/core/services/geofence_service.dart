import 'dart:async';
import 'package:geolocator/geolocator.dart';
import '../services/notification_service.dart';
import '../../data/models/risk_prediction_model.dart';

/// Evaluates real-time GPS proximity against high-risk and critical landslide hazard zones.
/// If user is within the danger perimeter (< 2.5 km from a CRITICAL landslide zone),
/// it immediately fires the high-priority alarm siren.
class GeofenceService {
  static final GeofenceService _instance = GeofenceService._internal();
  factory GeofenceService() => _instance;

  StreamSubscription<Position>? _positionSubscription;
  List<RiskPredictionModel> _monitoredZones = [];
  bool _isTracking = false;
  String? _lastAlertedZoneId;

  GeofenceService._internal();

  bool get isTracking => _isTracking;

  void updateMonitoredZones(List<RiskPredictionModel> zones) {
    _monitoredZones = zones
        .where((z) => z.riskLevel == 'CRITICAL' || z.riskLevel == 'HIGH')
        .toList();
  }

  Future<void> startGeofenceMonitoring() async {
    if (_isTracking) return;

    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return;

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return;
    }

    _isTracking = true;

    // Listen to location updates with 100m distance filter
    _positionSubscription = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 100,
      ),
    ).listen((Position position) {
      _checkProximityToHazardZones(position);
    });
  }

  void _checkProximityToHazardZones(Position currentPos) {
    for (final zone in _monitoredZones) {
      final double distanceInMeters = Geolocator.distanceBetween(
        currentPos.latitude,
        currentPos.longitude,
        zone.latitude,
        zone.longitude,
      );

      // Threat boundary: 2500 meters (2.5 km)
      if (distanceInMeters <= 2500.0) {
        final zoneId = zone.id ?? '${zone.latitude}_${zone.longitude}';
        if (_lastAlertedZoneId != zoneId) {
          _lastAlertedZoneId = zoneId;

          // Trigger high-decibel alarm siren and emergency notification
          NotificationService().showCriticalLandslideAlert(
            id: zone.hashCode,
            title: 'CRITICAL HAZARD PROXIMITY WARNING',
            body:
                'You have entered a verified high-risk landslide hazard zone (${(distanceInMeters / 1000).toStringAsFixed(1)} km away). Immediate caution / evacuation advised.',
            payload: zoneId,
          );
        }
        break;
      }
    }
  }

  void stopMonitoring() {
    _positionSubscription?.cancel();
    _positionSubscription = null;
    _isTracking = false;
  }
}
