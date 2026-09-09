class FieldReportModel {
  final String localId;
  final String? remoteId;
  final double latitude;
  final double longitude;
  final String? state;
  final String? district;
  final String reportType; // 'LANDSLIDE', 'ROCKFALL', 'SUBSIDENCE', 'CRACK', 'OTHER'
  final String severity; // 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'
  final String? description;
  final String? photoPath;
  final DateTime observedAt;
  final String syncStatus; // 'PENDING', 'SYNCING', 'SYNCED', 'FAILED'
  final String? lastError;
  final DateTime createdAt;

  FieldReportModel({
    required this.localId,
    this.remoteId,
    required this.latitude,
    required this.longitude,
    this.state,
    this.district,
    required this.reportType,
    required this.severity,
    this.description,
    this.photoPath,
    required this.observedAt,
    this.syncStatus = 'PENDING',
    this.lastError,
    required this.createdAt,
  });

  Map<String, dynamic> toDbMap() {
    return {
      'local_id': localId,
      'latitude': latitude,
      'longitude': longitude,
      'state': state,
      'district': district,
      'report_type': reportType,
      'severity': severity,
      'description': description,
      'photo_path': photoPath,
      'observed_at': observedAt.toIso8601String(),
      'sync_status': syncStatus,
      'last_error': lastError,
      'created_at': createdAt.toIso8601String(),
    };
  }

  factory FieldReportModel.fromDbMap(Map<String, dynamic> map) {
    return FieldReportModel(
      localId: map['local_id'],
      latitude: (map['latitude'] as num).toDouble(),
      longitude: (map['longitude'] as num).toDouble(),
      state: map['state'],
      district: map['district'],
      reportType: map['report_type'] ?? 'OTHER',
      severity: map['severity'] ?? 'LOW',
      description: map['description'],
      photoPath: map['photo_path'],
      observedAt: DateTime.tryParse(map['observed_at'] ?? '') ?? DateTime.now(),
      syncStatus: map['sync_status'] ?? 'PENDING',
      lastError: map['last_error'],
      createdAt: DateTime.tryParse(map['created_at'] ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toApiJson() {
    return {
      'latitude': latitude,
      'longitude': longitude,
      'state': state,
      'district': district,
      'report_type': reportType,
      'severity': severity,
      'description': description,
      'observed_at': observedAt.toIso8601String(),
    };
  }
}
