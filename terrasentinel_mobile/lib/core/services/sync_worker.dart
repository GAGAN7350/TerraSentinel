import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../database/local_database.dart';
import '../network/api_client.dart';
import '../../data/models/field_report_model.dart';

/// Automatic background worker for syncing offline field reports to the central API.
class SyncWorker {
  static final SyncWorker _instance = SyncWorker._internal();
  factory SyncWorker() => _instance;

  Timer? _periodicSyncTimer;
  bool _isSyncing = false;

  SyncWorker._internal();

  void startWorker() {
    _periodicSyncTimer?.cancel();
    // Check connectivity and sync outbox every 45 seconds
    _periodicSyncTimer = Timer.periodic(const Duration(seconds: 45), (_) {
      syncQueuedReports();
    });

    // Also listen to connectivity changes (e.g. user walked back into 4G range)
    Connectivity().onConnectivityChanged.listen((result) {
      if (result != ConnectivityResult.none) {
        syncQueuedReports();
      }
    });
  }

  Future<int> syncQueuedReports() async {
    if (_isSyncing) return 0;
    _isSyncing = true;

    int successfullySynced = 0;
    try {
      final connectivityResult = await Connectivity().checkConnectivity();
      if (connectivityResult == ConnectivityResult.none) {
        _isSyncing = false;
        return 0;
      }

      final pendingReports = await LocalDatabase.instance.getPendingFieldReports();
      if (pendingReports.isEmpty) {
        _isSyncing = false;
        return 0;
      }

      final dio = ApiClient().dio;

      for (final raw in pendingReports) {
        final report = FieldReportModel.fromDbMap(raw);
        await LocalDatabase.instance.updateReportSyncStatus(report.localId, 'SYNCING');

        try {
          final response = await dio.post(
            '/field-reports/',
            data: report.toApiJson(),
          );

          if (response.statusCode == 201 || response.statusCode == 200) {
            await LocalDatabase.instance.updateReportSyncStatus(report.localId, 'SYNCED');
            successfullySynced++;
          } else {
            await LocalDatabase.instance.updateReportSyncStatus(
              report.localId,
              'FAILED',
              error: 'HTTP ${response.statusCode}',
            );
          }
        } catch (e) {
          await LocalDatabase.instance.updateReportSyncStatus(
            report.localId,
            'FAILED',
            error: e.toString(),
          );
        }
      }
    } finally {
      _isSyncing = false;
    }

    return successfullySynced;
  }

  void stopWorker() {
    _periodicSyncTimer?.cancel();
    _periodicSyncTimer = null;
  }
}
