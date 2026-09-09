import 'dart:convert';

class EmergencySosModel {
  final String id;
  final double latitude;
  final double longitude;
  final double altitude;
  final String timestamp;
  final String situationDescription;
  final List<String> dispatchedAgencies;
  final String backendStatus;
  final String? smsBody;

  EmergencySosModel({
    required this.id,
    required this.latitude,
    required this.longitude,
    required this.altitude,
    required this.timestamp,
    required this.situationDescription,
    required this.dispatchedAgencies,
    required this.backendStatus,
    this.smsBody,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'latitude': latitude,
      'longitude': longitude,
      'altitude': altitude,
      'timestamp': timestamp,
      'dispatch_agencies': jsonEncode(dispatchedAgencies),
      'status': backendStatus,
      'sms_body': smsBody,
    };
  }

  factory EmergencySosModel.fromMap(Map<String, dynamic> map) {
    List<String> agencies = [];
    try {
      final decoded = jsonDecode(map['dispatch_agencies'] ?? '[]');
      if (decoded is List) {
        agencies = List<String>.from(decoded);
      }
    } catch (_) {}

    return EmergencySosModel(
      id: map['id'],
      latitude: (map['latitude'] as num).toDouble(),
      longitude: (map['longitude'] as num).toDouble(),
      altitude: (map['altitude'] as num?)?.toDouble() ?? 0.0,
      timestamp: map['timestamp'],
      situationDescription: map['sms_body'] ?? '',
      dispatchedAgencies: agencies,
      backendStatus: map['status'] ?? 'DISPATCHED',
      smsBody: map['sms_body'],
    );
  }
}
