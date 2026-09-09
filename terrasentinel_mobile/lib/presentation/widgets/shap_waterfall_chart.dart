import 'package:flutter/material.dart';
import '../../data/models/risk_prediction_model.dart';

class ShapWaterfallChart extends StatelessWidget {
  final List<ShapFeatureDriver> drivers;
  final double? calibratedProbability;

  const ShapWaterfallChart({
    Key? key,
    required this.drivers,
    this.calibratedProbability,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (drivers.isEmpty) {
      return const Card(
        color: Color(0xFF1E293B),
        child: Padding(
          padding: EdgeInsets.all(16.0),
          child: Text(
            'TreeSHAP explainability log-odds not available for heuristic estimate.',
            style: TextStyle(color: Colors.white70),
          ),
        ),
      );
    }

    return Card(
      elevation: 4,
      color: const Color(0xFF1E293B),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.psychology, color: Colors.cyanAccent),
                    SizedBox(width: 8),
                    Text(
                      'AI Decision Drivers (TreeSHAP)',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                if (calibratedProbability != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.cyanAccent.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.cyanAccent),
                    ),
                    child: Text(
                      'Calibrated P: ${(calibratedProbability! * 100).toStringAsFixed(1)}%',
                      style: const TextStyle(
                        color: Colors.cyanAccent,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            const Text(
              'Feature contributions to landslide susceptibility (log-odds impact):',
              style: TextStyle(color: Colors.white60, fontSize: 13),
            ),
            const SizedBox(height: 16),
            ...drivers.map((driver) {
              final isPositive = driver.shapValue >= 0;
              final Color barColor = isPositive ? const Color(0xFFEF4444) : const Color(0xFF10B981);
              final double normalizedWidth = (driver.shapValue.abs() / 2.5).clamp(0.05, 1.0);

              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 6.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          driver.label,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        Text(
                          '${isPositive ? "+" : ""}${driver.shapValue.toStringAsFixed(3)}',
                          style: TextStyle(
                            color: barColor,
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Stack(
                      children: [
                        Container(
                          height: 8,
                          decoration: BoxDecoration(
                            color: Colors.white10,
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                        FractionallySizedBox(
                          widthFactor: normalizedWidth,
                          child: Container(
                            height: 8,
                            decoration: BoxDecoration(
                              color: barColor,
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            }).toList(),
            const Divider(color: Colors.white12, height: 24),
            const Row(
              children: [
                Icon(Icons.info_outline, color: Colors.white38, size: 16),
                SizedBox(width: 6),
                Expanded(
                  child: Text(
                    'Red indicates features increasing slope instability. Green indicates stabilizing factors.',
                    style: TextStyle(color: Colors.white38, fontSize: 11),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
