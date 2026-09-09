import 'dart:async';
import 'package:audioplayers/audioplayers.dart';
import 'package:vibration/vibration.dart';

/// High-Alert Emergency Siren Service.
/// Plays loud looping alarm audio at maximum volume and triggers pulsing haptic vibrations.
class AlertAudioService {
  static final AlertAudioService _instance = AlertAudioService._internal();
  factory AlertAudioService() => _instance;

  final AudioPlayer _audioPlayer = AudioPlayer();
  bool _isPlaying = false;
  Timer? _vibrationTimer;

  AlertAudioService._internal() {
    _audioPlayer.setReleaseMode(ReleaseMode.loop);
  }

  bool get isAlarmActive => _isPlaying;

  /// Trigger the high-decibel emergency siren.
  Future<void> startEmergencySiren({String? customAudioPath}) async {
    if (_isPlaying) return;
    _isPlaying = true;

    try {
      // Set audio volume to 100% on alarm/notification stream
      await _audioPlayer.setVolume(1.0);

      // Play emergency siren asset
      final soundPath = customAudioPath ?? 'sounds/emergency_siren.mp3';
      await _audioPlayer.play(AssetSource(soundPath));
    } catch (e) {
      // Fallback: If asset audio fails, trigger rapid haptic pulsing
    }

    // Start pulsing emergency vibration pattern: 1200ms ON, 400ms OFF
    _startUrgentVibration();
  }

  void _startUrgentVibration() {
    _vibrationTimer?.cancel();
    _vibrationTimer = Timer.periodic(const Duration(milliseconds: 1600), (timer) async {
      if (!_isPlaying) {
        timer.cancel();
        return;
      }
      final hasVibrator = await Vibration.hasVibrator();
      if (hasVibrator == true) {
        Vibration.vibrate(
          pattern: [0, 1200, 400, 1200],
          intensities: [0, 255, 0, 255],
        );
      }
    });
  }

  /// Stop the siren and cancel vibrations once the user acknowledges the threat.
  Future<void> stopEmergencySiren() async {
    _isPlaying = false;
    _vibrationTimer?.cancel();
    _vibrationTimer = null;

    try {
      await _audioPlayer.stop();
    } catch (_) {}

    try {
      Vibration.cancel();
    } catch (_) {}
  }
}
