import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/emergency_contacts.dart';
import '../../core/services/emergency_dispatch_service.dart';
import '../../presentation/blocs/emergency_bloc.dart';
import '../../presentation/widgets/emergency_agency_card.dart';

class EmergencySosScreen extends StatefulWidget {
  const EmergencySosScreen({Key? key}) : super(key: key);

  @override
  State<EmergencySosScreen> createState() => _EmergencySosScreenState();
}

class _EmergencySosScreenState extends State<EmergencySosScreen> {
  final TextEditingController _descController = TextEditingController(
    text: 'Active unpredicted landslide detected on road corridor. Potential casualties / blockage. Immediate first-responder dispatch requested.',
  );
  bool _isRoadBlocked = true;
  String _selectedState = 'Sikkim';

  @override
  void dispose() {
    _descController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final primaryAgencies = EmergencyContacts.getAllPrimaryAgencies();
    final stateAgency = EmergencyContacts.getAgencyForState(_selectedState);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF7F1D1D),
        elevation: 0,
        title: const Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: Colors.yellowAccent),
            SizedBox(width: 8),
            Text(
              'Emergency Control Room Dispatch',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
          ],
        ),
      ),
      body: BlocConsumer<EmergencyBloc, EmergencyState>(
        listener: (context, state) {
          if (state is EmergencyDispatchedSuccess) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                backgroundColor: const Color(0xFF10B981),
                duration: const Duration(seconds: 5),
                content: Row(
                  children: [
                    const Icon(Icons.check_circle, color: Colors.white),
                    const SizedBox(width: 8),
                    Expanded(child: Text(state.result.summary)),
                  ],
                ),
              ),
            );
          } else if (state is EmergencyDispatchFailure) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                backgroundColor: const Color(0xFFEF4444),
                content: Text('Dispatch Failed: ${state.error}'),
              ),
            );
          }
        },
        builder: (context, state) {
          final isDispatching = state is EmergencyDispatching;

          return ListView(
            padding: const EdgeInsets.all(16.0),
            children: [
              // Notice banner
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF991B1B).withOpacity(0.3),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFEF4444), width: 1.5),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.crisis_alert_rounded, color: Colors.redAccent, size: 28),
                        SizedBox(width: 8),
                        Text(
                          'UNPREDICTED LANDSLIDE FAIL-SAFE',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                            fontSize: 15,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Use this trigger when a sudden landslide, debris flow, or rockfall occurred without prior model warning. Tapping dispatch will lock high-precision GNSS coordinates and alert all emergency control rooms immediately.',
                      style: TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Rapid State selector
              Card(
                color: const Color(0xFF1E293B),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: DropdownButtonFormField<String>(
                    value: _selectedState,
                    dropdownColor: const Color(0xFF1E293B),
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                    decoration: const InputDecoration(
                      labelText: 'Select NER State for Local DDMA Registry',
                      labelStyle: TextStyle(color: Colors.cyanAccent),
                      border: InputBorder.none,
                    ),
                    items: EmergencyContacts.stateDisasterAgencies.keys.map((s) {
                      return DropdownMenuItem(value: s, child: Text(s));
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedState = val);
                    },
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // Situation Details input
              Card(
                color: const Color(0xFF1E293B),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Incident Description & Ground Truth:',
                        style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _descController,
                        maxLines: 3,
                        style: const TextStyle(color: Colors.white, fontSize: 14),
                        decoration: InputDecoration(
                          filled: true,
                          fillColor: const Color(0xFF0F172A),
                          hintText: 'Enter specific highway km / village / blockage details...',
                          hintStyle: const TextStyle(color: Colors.white30),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none,
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      SwitchListTile(
                        contentPadding: EdgeInsets.zero,
                        title: const Text(
                          'Road / National Highway Blocked?',
                          style: TextStyle(color: Colors.white, fontSize: 14),
                        ),
                        subtitle: const Text(
                          'Flagged for rapid BRO / PWD bulldozer clearance dispatch',
                          style: TextStyle(color: Colors.white38, fontSize: 12),
                        ),
                        value: _isRoadBlocked,
                        activeColor: Colors.redAccent,
                        onChanged: (v) => setState(() => _isRoadBlocked = v),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Giant 1-Tap Multi-Agency Dispatch Action Button
              SizedBox(
                height: 56,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFDC2626),
                    foregroundColor: Colors.white,
                    elevation: 6,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                      side: const BorderSide(color: Colors.yellowAccent, width: 2),
                    ),
                  ),
                  icon: isDispatching
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Icon(Icons.send_rounded, size: 28),
                  label: Text(
                    isDispatching
                        ? 'DISPATCHING TO ALL CONTROL ROOMS...'
                        : 'DISPATCH ALL EMERGENCY CONTROL ROOMS',
                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                  ),
                  onPressed: isDispatching
                      ? null
                      : () {
                          context.read<EmergencyBloc>().add(
                                TriggerSosDispatchEvent(
                                  situationDescription: _descController.text,
                                  state: _selectedState,
                                  isRoadBlocked: _isRoadBlocked,
                                ),
                              );
                        },
                ),
              ),
              const SizedBox(height: 24),

              // Direct Agency Hotlines
              const Text(
                'Direct Agency Emergency Hotlines (Tap to Call / SMS):',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              ...primaryAgencies.map((agency) {
                return EmergencyAgencyCard(
                  agency: agency,
                  onCall: () {
                    context.read<EmergencyBloc>().add(CallAgencyDirectEvent(agency.phoneNumber));
                  },
                  onSms: () {
                    EmergencyDispatchService().launchEmergencySms(
                      phoneNumber: agency.phoneNumber,
                      message: _descController.text,
                    );
                  },
                );
              }).toList(),
              // State DDMA Card
              EmergencyAgencyCard(
                agency: stateAgency,
                onCall: () {
                  context.read<EmergencyBloc>().add(CallAgencyDirectEvent(stateAgency.phoneNumber));
                },
                onSms: () {
                  EmergencyDispatchService().launchEmergencySms(
                    phoneNumber: stateAgency.phoneNumber,
                    message: _descController.text,
                  );
                },
              ),
            ],
          );
        },
      ),
    );
  }
}
