import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/services/alert_audio_service.dart';

/// Full-screen emergency alert modal with flashing strobe effect and siren stop controls.
class CriticalSirenDialog extends StatefulWidget {
  final String title;
  final String message;
  final VoidCallback onAcknowledge;

  const CriticalSirenDialog({
    Key? key,
    required this.title,
    required this.message,
    required this.onAcknowledge,
  }) : super(key: key);

  @override
  State<CriticalSirenDialog> createState() => _CriticalSirenDialogState();
}

class _CriticalSirenDialogState extends State<CriticalSirenDialog> {
  bool _flash = false;
  Timer? _strobeTimer;

  @override
  void initState() {
    super.initState();
    // 500ms red/dark strobe flashing animation
    _strobeTimer = Timer.periodic(const Duration(milliseconds: 500), (timer) {
      if (mounted) {
        setState(() {
          _flash = !_flash;
        });
      }
    });
  }

  @override
  void dispose() {
    _strobeTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bgColor = _flash ? const Color(0xFF7F1D1D) : const Color(0xFF450A0A);

    return Dialog(
      backgroundColor: bgColor,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: const BorderSide(color: Colors.redAccent, width: 3),
      ),
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.red.withOpacity(0.3),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.warning_amber_rounded,
                color: Colors.white,
                size: 54,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              widget.title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.w900,
                letterSpacing: 1.1,
              ),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.black45,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                'CRITICAL EVACUATION ALARM ACTIVE',
                style: TextStyle(
                  color: Colors.yellowAccent,
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              widget.message,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Colors.white70,
                fontSize: 14,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.red.shade900,
                  elevation: 8,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                icon: const Icon(Icons.volume_off_rounded, size: 24),
                label: const Text(
                  'ACKNOWLEDGE & SILENCE SIREN',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                onPressed: () {
                  AlertAudioService().stopEmergencySiren();
                  widget.onAcknowledge();
                  Navigator.of(context).pop();
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
