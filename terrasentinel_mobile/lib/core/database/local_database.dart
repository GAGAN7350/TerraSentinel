import 'dart:async';
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

class LocalDatabase {
  static final LocalDatabase instance = LocalDatabase._init();
  static Database? _database;

  LocalDatabase._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('terrasentinel_local.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future<void> _createDB(Database db, int version) async {
    // 1. Offline Field Reports Queue (Outbox Pattern)
    await db.execute('''
      CREATE TABLE field_reports_queue (
        local_id TEXT PRIMARY KEY,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        state TEXT,
        district TEXT,
        report_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        description TEXT,
        photo_path TEXT,
        observed_at TEXT NOT NULL,
        sync_status TEXT NOT NULL, -- 'PENDING', 'SYNCING', 'SYNCED', 'FAILED'
        sync_attempts INTEGER DEFAULT 0,
        last_error TEXT,
        created_at TEXT NOT NULL
      )
    ''');

    // 2. Cached Risk Predictions (Offline GIS Map fallback)
    await db.execute('''
      CREATE TABLE cached_risk_points (
        id TEXT PRIMARY KEY,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        risk_score REAL NOT NULL,
        risk_level TEXT NOT NULL,
        trend TEXT,
        confidence REAL,
        model_version TEXT,
        json_payload TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    ''');

    // 3. Cached Alerts
    await db.execute('''
      CREATE TABLE cached_alerts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        severity TEXT NOT NULL,
        status TEXT NOT NULL,
        state TEXT,
        district TEXT,
        latitude REAL,
        longitude REAL,
        issued_at TEXT,
        expires_at TEXT,
        created_at TEXT NOT NULL
      )
    ''');

    // 4. Cached Landslide Inventory Pins
    await db.execute('''
      CREATE TABLE cached_landslides (
        id TEXT PRIMARY KEY,
        slide_name TEXT,
        state TEXT,
        district TEXT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        material_involved TEXT,
        movement_type TEXT,
        occurrence_date TEXT
      )
    ''');

    // 5. Emergency SOS Dispatches (Local Audit Trail)
    await db.execute('''
      CREATE TABLE emergency_sos_log (
        id TEXT PRIMARY KEY,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        altitude REAL,
        timestamp TEXT NOT NULL,
        dispatch_agencies TEXT NOT NULL,
        status TEXT NOT NULL, -- 'SENT_TO_BACKEND', 'SMS_FALLBACK_TRIGGERED', 'DISPATCHED'
        sms_body TEXT
      )
    ''');
  }

  // --- Field Report Outbox Operations ---

  Future<void> queueFieldReport(Map<String, dynamic> report) async {
    final db = await instance.database;
    await db.insert(
      'field_reports_queue',
      report,
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<List<Map<String, dynamic>>> getPendingFieldReports() async {
    final db = await instance.database;
    return await db.query(
      'field_reports_queue',
      where: 'sync_status = ? OR sync_status = ?',
      whereArgs: ['PENDING', 'FAILED'],
      orderBy: 'created_at ASC',
    );
  }

  Future<void> updateReportSyncStatus(
    String localId,
    String status, {
    String? error,
  }) async {
    final db = await instance.database;
    await db.update(
      'field_reports_queue',
      {
        'sync_status': status,
        'last_error': error,
      },
      where: 'local_id = ?',
      whereArgs: [localId],
    );
  }

  // --- Emergency SOS Operations ---

  Future<void> logEmergencySos(Map<String, dynamic> sosEntry) async {
    final db = await instance.database;
    await db.insert(
      'emergency_sos_log',
      sosEntry,
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<List<Map<String, dynamic>>> getSosHistory() async {
    final db = await instance.database;
    return await db.query(
      'emergency_sos_log',
      orderBy: 'timestamp DESC',
    );
  }

  // --- Cache Risk Map & Alerts ---

  Future<void> cacheRiskPoints(List<Map<String, dynamic>> points) async {
    final db = await instance.database;
    final batch = db.batch();
    for (final point in points) {
      batch.insert(
        'cached_risk_points',
        point,
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
    await batch.commit(noResult: true);
  }

  Future<List<Map<String, dynamic>>> getCachedRiskPoints() async {
    final db = await instance.database;
    return await db.query('cached_risk_points');
  }

  Future<void> cacheAlerts(List<Map<String, dynamic>> alerts) async {
    final db = await instance.database;
    final batch = db.batch();
    for (final alert in alerts) {
      batch.insert(
        'cached_alerts',
        alert,
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
    await batch.commit(noResult: true);
  }

  Future<List<Map<String, dynamic>>> getCachedAlerts() async {
    final db = await instance.database;
    return await db.query('cached_alerts', orderBy: 'created_at DESC');
  }

  Future<void> close() async {
    final db = await instance.database;
    db.close();
  }
}
