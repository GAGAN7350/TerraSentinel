class AlertModel {
  final String id;
  final String title;
  final String message;
  final String severity; // 'INFO', 'WARNING', 'HIGH', 'CRITICAL'
  final String status; // 'DRAFT', 'ACTIVE', 'RESOLVED', 'EXPIRED'
  final String? alertType;
  final String? state;
  final String? district;
  final double? latitude;
  final double? longitude;
  final DateTime? issuedAt;
  final DateTime? expiresAt;
  final DateTime createdAt;

  AlertModel({
    required this.id,
    required this.title,
    required this.message,
    required this.severity,
    required this.status,
    this.alertType,
    this.state,
    this.district,
    this.latitude,
    this.longitude,
    this.issuedAt,
    this.expiresAt,
    required this.createdAt,
  });

  bool get isCritical => severity == 'CRITICAL';
  bool get isActive => status == 'ACTIVE';

  factory AlertModel.fromJson(Map<String, dynamic> json) {
    double? lat = (json['latitude'] as num?)?.toDouble();
    double? lon = (json['longitude'] as num?)?.toDouble();
    if (json['geometry'] != null && json['geometry']['coordinates'] != null) {
      final coords = json['geometry']['coordinates'] as List;
      if (coords.length >= 2) {
        lon = (coords[0] as num).toDouble();
        lat = (coords[1] as num).toDouble();
      }
    }

    return AlertModel(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      severity: json['severity'] ?? 'INFO',
      status: json['status'] ?? 'ACTIVE',
      alertType: json['alert_type'],
      state: json['state'],
      district: json['district'],
      latitude: lat,
      longitude: lon,
      issuedAt: json['issued_at'] != null ? DateTime.tryParse(json['issued_at']) : null,
      expiresAt: json['expires_at'] != null ? DateTime.tryParse(json['expires_at']) : null,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at']) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toLocalMap() {
    return {
      'id': id,
      'title': title,
      'message': message,
      'severity': severity,
      'status': status,
      'state': state,
      'district': district,
      'latitude': latitude,
      'longitude': longitude,
      'issued_at': issuedAt?.toIso8601String(),
      'expires_at': expiresAt?.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
    };
  }
}
