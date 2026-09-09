import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../presentation/blocs/alert_bloc.dart';
import '../../presentation/widgets/critical_siren_dialog.dart';
import '../../presentation/widgets/emergency_agency_card.dart';
import '../../core/services/alert_audio_service.dart';

class AlertsFeedScreen extends StatefulWidget {
  const AlertsFeedScreen({Key? key}) : super(key: key);

  @override
  State<AlertsFeedScreen> createState() => _AlertsFeedScreenState();
}

class _AlertsFeedScreenState extends State<AlertsFeedScreen> {
  @override
  void initState() {
    super.initState();
    context.read<AlertBloc>().add(const LoadAlertsEvent());
  }

  void _showCriticalSirenModal(String title, String message) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => CriticalSirenDialog(
        title: title,
        message: message,
        onAcknowledge: () {
          context.read<AlertBloc>().add(StopAlertSirenEvent());
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        title: const Row(
          children: [
            Icon(Icons.notifications_active_rounded, color: Colors.redAccent),
            SizedBox(width: 8),
            Text('Disaster Alerts & Early Warnings', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white70),
            onPressed: () => context.read<AlertBloc>().add(const LoadAlertsEvent()),
          ),
        ],
      ),
      body: BlocConsumer<AlertBloc, AlertState>(
        listener: (context, state) {
          if (state is AlertsLoaded && state.hasActiveCritical) {
            final critical = state.alerts.firstWhere((a) => a.isCritical && a.isActive);
            _showCriticalSirenModal(critical.title, critical.message);
          }
        },
        builder: (context, state) {
          if (state is AlertLoading) {
            return const Center(child: CircularProgressIndicator(color: Colors.redAccent));
          }

          if (state is AlertsLoaded) {
            if (state.alerts.isEmpty) {
              return const Center(
                child: Text('No active disaster alerts in your sector.', style: TextStyle(color: Colors.white54)),
              );
            }

            final isSirenActive = AlertAudioService().isAlarmActive;

            return ListView(
              padding: const EdgeInsets.all(16.0),
              children: [
                // Top Siren Control Banner if Alarm is active
                if (isSirenActive)
                  Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFDC2626),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.yellowAccent, width: 2),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.volume_up_rounded, color: Colors.white, size: 28),
                            SizedBox(width: 12),
                            Text(
                              'HIGH-ALERT SIREN IS ACTIVE',
                              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: Colors.red,
                          ),
                          child: const Text('SILENCE'),
                          onPressed: () => context.read<AlertBloc>().add(StopAlertSirenEvent()),
                        ),
                      ],
                    ),
                  ),

                ...state.alerts.map((alert) {
                  final isCritical = alert.isCritical;
                  return Card(
                    color: isCritical ? const Color(0xFF450A0A) : const Color(0xFF1E293B),
                    margin: const EdgeInsets.only(bottom: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                      side: BorderSide(
                        color: isCritical ? const Color(0xFFEF4444) : Colors.white10,
                        width: isCritical ? 2 : 1,
                      ),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              RiskBadge(level: alert.severity),
                              Text(
                                '${alert.district ?? alert.state ?? "NER Sector"}',
                                style: const TextStyle(color: Colors.white54, fontSize: 12),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Text(
                            alert.title,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            alert.message,
                            style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Status: ${alert.status}',
                                style: TextStyle(
                                  color: alert.isActive ? Colors.greenAccent : Colors.white38,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              if (isCritical)
                                TextButton.icon(
                                  icon: const Icon(Icons.warning, color: Colors.yellowAccent, size: 16),
                                  label: const Text(
                                    'EVACUATION GUIDELINES',
                                    style: TextStyle(color: Colors.yellowAccent, fontSize: 11, fontWeight: FontWeight.bold),
                                  ),
                                  onPressed: () {
                                    _showCriticalSirenModal(alert.title, alert.message);
                                  },
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ],
            );
          }

          return const SizedBox.shrink();
        },
      ),
    );
  }
}
