import 'package:uuid/uuid.dart';
import '../models/field_report_model.dart';
import '../../core/database/local_database.dart';
import '../../core/services/sync_worker.dart';

class FieldReportRepository {
  /// Submit a field observation report.
  /// Automatically stores in the local SQLite outbox queue first,
  /// then triggers the background sync worker.
  Future<FieldReportModel> submitReport({
    required double latitude,
    required double longitude,
    String? state,
    String? district,
    required String reportType,
    required String severity,
    String? description,
    String? photoPath,
    required DateTime observedAt,
  }) async {
    final String localId = const Uuid().v4();

    final report = FieldReportModel(
      localId: localId,
      latitude: latitude,
      longitude: longitude,
      state: state,
      district: district,
      reportType: reportType,
      severity: severity,
      description: description,
      photoPath: photoPath,
      observedAt: observedAt,
      syncStatus: 'PENDING',
      createdAt: DateTime.now(),
    );

    // 1. Store in local SQLite outbox
    await LocalDatabase.instance.queueFieldReport(report.toDbMap());

    // 2. Trigger async sync worker immediately if online
    SyncWorker().syncQueuedReports();

    return report;
  }

  /// Get pending offline reports in outbox.
  Future<List<FieldReportModel>> getPendingReports() async {
    final rows = await LocalDatabase.instance.getPendingFieldReports();
    return rows.map((r) => FieldReportModel.fromDbMap(r)).toList();
  }
}
