import '../models/alert_model.dart';
import '../../core/network/api_client.dart';
import '../../core/database/local_database.dart';

class AlertRepository {
  final ApiClient _apiClient = ApiClient();

  /// Retrieve active landslide alerts with local SQLite fallback.
  Future<List<AlertModel>> getAlerts({String? status}) async {
    try {
      final response = await _apiClient.dio.get(
        '/alerts/',
        queryParameters: {
          if (status != null) 'status': status,
          'page': 1,
          'page_size': 50,
        },
      );

      final List<dynamic> items = response.data['items'] ?? [];
      final alerts = items.map((json) => AlertModel.fromJson(json)).toList();

      // Cache locally
      final cacheData = alerts.map((a) => a.toLocalMap()).toList();
      LocalDatabase.instance.cacheAlerts(cacheData);

      return alerts;
    } catch (_) {
      // Offline fallback
      final cachedRows = await LocalDatabase.instance.getCachedAlerts();
      return cachedRows.map((row) => AlertModel.fromJson(row)).toList();
    }
  }

  /// Post a new alert (e.g. from officer field console)
  Future<AlertModel> createAlert(Map<String, dynamic> data) async {
    final response = await _apiClient.dio.post('/alerts/', data: data);
    return AlertModel.fromJson(response.data);
  }
}
