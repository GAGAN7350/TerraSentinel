import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'app.dart';
import 'core/services/notification_service.dart';
import 'core/services/sync_worker.dart';
import 'core/services/geofence_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set preferred orientations for rugged field use
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Set system UI styling
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF1E293B),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  // 1. Initialize High-Alert Siren Notification Channels (USAGE_ALARM for DND override)
  await NotificationService().init();

  // 2. Start Automatic Background Outbox Sync Worker
  SyncWorker().startWorker();

  // 3. Start Geofence Proximity Monitoring
  GeofenceService().startGeofenceMonitoring();

  runApp(const TerraSentinelApp());
}
