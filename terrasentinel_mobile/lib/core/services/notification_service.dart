import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'alert_audio_service.dart';

/// Notification service managing system notifications and high-decibel disaster sirens.
class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;

  final FlutterLocalNotificationsPlugin _notificationsPlugin =
      FlutterLocalNotificationsPlugin();

  static const String criticalChannelId = 'terrasentinel_critical_alerts';
  static const String criticalChannelName = 'TerraSentinel Critical Landslide Sirens';

  NotificationService._internal();

  Future<void> init() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
      requestCriticalPermission: true,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _notificationsPlugin.initialize(
      initSettings,
      onDidReceiveNotificationResponse: (details) {
        // Stop the siren when user taps on the notification
        AlertAudioService().stopEmergencySiren();
      },
    );

    // Create the high-priority alarm notification channel for Android
    final androidNotificationChannel = AndroidNotificationChannel(
      criticalChannelId,
      criticalChannelName,
      description:
          'High-decibel emergency siren for critical landslide and evacuation alerts. Bypasses DND.',
      importance: Importance.max,
      playSound: true,
      sound: const RawResourceAndroidNotificationSound('emergency_landslide_siren'),
      enableVibration: true,
      vibrationPattern: Int64List.fromList([0, 1200, 400, 1200, 400, 1200]),
      enableLights: true,
      ledColor: const Color(0xFFFF0000),
      audioAttributesUsage: AudioAttributesUsage.alarm,
    );

    await _notificationsPlugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(androidNotificationChannel);
  }

  /// Trigger high-priority emergency notification with alarm siren and full-screen alert.
  Future<void> showCriticalLandslideAlert({
    required int id,
    required String title,
    required String body,
    String? payload,
  }) async {
    // 1. Start in-app emergency siren player
    await AlertAudioService().startEmergencySiren();

    // 2. Post system alert notification
    final androidDetails = AndroidNotificationDetails(
      criticalChannelId,
      criticalChannelName,
      channelDescription: 'High-Alert Disaster Siren',
      importance: Importance.max,
      priority: Priority.high,
      fullScreenIntent: true,
      playSound: true,
      sound: const RawResourceAndroidNotificationSound('emergency_landslide_siren'),
      audioAttributesUsage: AudioAttributesUsage.alarm,
      color: const Color(0xFFD32F2F),
      enableLights: true,
      ledColor: const Color(0xFFFF0000),
      ledOnMs: 500,
      ledOffMs: 250,
      vibrationPattern: Int64List.fromList([0, 1200, 400, 1200, 400, 1200]),
      category: AndroidNotificationCategory.alarm,
      styleInformation: BigTextStyleInformation(
        body,
        contentTitle: '🚨 $title',
        summaryText: 'TERRASENTINEL EVACUATION ALERT',
      ),
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
      sound: 'emergency_landslide_siren.caf',
      interruptionLevel: InterruptionLevel.critical,
    );

    final notificationDetails = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _notificationsPlugin.show(
      id,
      '🚨 $title',
      body,
      notificationDetails,
      payload: payload,
    );
  }
}
