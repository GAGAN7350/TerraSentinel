class LandslideModel {
  final String id;
  final String? slideName;
  final String? source;
  final String? state;
  final String? district;
  final double latitude;
  final double longitude;
  final String? materialInvolved;
  final String? movementType;
  final String? occurrenceDate;
  final String? history;

  LandslideModel({
    required this.id,
    this.slideName,
    this.source,
    this.state,
    this.district,
    required this.latitude,
    required this.longitude,
    this.materialInvolved,
    this.movementType,
    this.occurrenceDate,
    this.history,
  });

  factory LandslideModel.fromJson(Map<String, dynamic> json) {
    double lat = (json['latitude'] as num?)?.toDouble() ?? 0.0;
    double lon = (json['longitude'] as num?)?.toDouble() ?? 0.0;
    if (json['geometry'] != null && json['geometry']['coordinates'] != null) {
      final coords = json['geometry']['coordinates'] as List;
      if (coords.length >= 2) {
        lon = (coords[0] as num).toDouble();
        lat = (coords[1] as num).toDouble();
      }
    }

    return LandslideModel(
      id: json['id']?.toString() ?? '',
      slideName: json['slide_name'] ?? 'Historical Landslide Event',
      source: json['source'] ?? 'GSI_BHUSANKET',
      state: json['state'],
      district: json['district'],
      latitude: lat,
      longitude: lon,
      materialInvolved: json['material_involved'] ?? 'Soil & Rock debris',
      movementType: json['movement_type'] ?? 'Debris Flow',
      occurrenceDate: json['occurrence_date'],
      history: json['history'],
    );
  }
}
