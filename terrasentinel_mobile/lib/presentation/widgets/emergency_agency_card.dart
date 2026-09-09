import 'package:flutter/material.dart';
import '../../core/constants/emergency_contacts.dart';

class EmergencyAgencyCard extends StatelessWidget {
  final EmergencyAgency agency;
  final VoidCallback onCall;
  final VoidCallback onSms;

  const EmergencyAgencyCard({
    Key? key,
    required this.agency,
    required this.onCall,
    required this.onSms,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Color themeColor;
    IconData iconData;

    switch (agency.category) {
      case 'POLICE':
        themeColor = const Color(0xFF3B82F6);
        iconData = Icons.local_police_rounded;
        break;
      case 'FIRE':
        themeColor = const Color(0xFFEF4444);
        iconData = Icons.local_fire_department_rounded;
        break;
      case 'HEALTH':
        themeColor = const Color(0xFF10B981);
        iconData = Icons.medical_services_rounded;
        break;
      default:
        themeColor = const Color(0xFFF59E0B);
        iconData = Icons.security_rounded;
    }

    return Card(
      color: const Color(0xFF1E293B),
      margin: const EdgeInsets.symmetric(vertical: 6),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: themeColor.withOpacity(0.4), width: 1.5),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: themeColor.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(iconData, color: themeColor, size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    agency.name,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Toll-Free: ${agency.phoneNumber}',
                    style: TextStyle(
                      color: themeColor,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    agency.description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: Colors.white54, fontSize: 11),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Column(
              children: [
                IconButton(
                  icon: const Icon(Icons.phone, color: Colors.greenAccent),
                  onPressed: onCall,
                  tooltip: 'Call ${agency.phoneNumber}',
                ),
                IconButton(
                  icon: const Icon(Icons.sms_rounded, color: Colors.cyanAccent),
                  onPressed: onSms,
                  tooltip: 'Send Emergency SOS SMS',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class RiskBadge extends StatelessWidget {
  final String level;
  final double? score;

  const RiskBadge({Key? key, required this.level, this.score}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Color color;
    switch (level.toUpperCase()) {
      case 'CRITICAL':
        color = const Color(0xFFEF4444);
        break;
      case 'HIGH':
        color = const Color(0xFFF97316);
        break;
      case 'MODERATE':
        color = const Color(0xFFEAB308);
        break;
      default:
        color = const Color(0xFF22C55E);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 6),
          Text(
            score != null ? '$level (${score!.toStringAsFixed(0)})' : level,
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}
