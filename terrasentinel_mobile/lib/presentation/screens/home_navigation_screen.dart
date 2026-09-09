import 'package:flutter/material.dart';
import 'map/gis_risk_map_screen.dart';
import 'predict/ml_prediction_screen.dart';
import 'alerts/alerts_feed_screen.dart';
import 'report/submit_report_screen.dart';
import 'emergency/emergency_sos_screen.dart';

class HomeNavigationScreen extends StatefulWidget {
  const HomeNavigationScreen({Key? key}) : super(key: key);

  @override
  State<HomeNavigationScreen> createState() => _HomeNavigationScreenState();
}

class _HomeNavigationScreenState extends State<HomeNavigationScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    GisRiskMapScreen(),
    MlPredictionScreen(),
    AlertsFeedScreen(),
    SubmitReportScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        backgroundColor: const Color(0xFF1E293B),
        selectedItemColor: Colors.cyanAccent,
        unselectedItemColor: Colors.white54,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.map_rounded),
            label: 'GIS Map',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.psychology_rounded),
            label: 'AI Inference',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.notifications_active_rounded),
            label: 'Alerts',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.add_a_photo_rounded),
            label: 'Field Report',
          ),
        ],
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFFDC2626),
        elevation: 10,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(30),
          side: const BorderSide(color: Colors.yellowAccent, width: 1.5),
        ),
        icon: const Icon(Icons.crisis_alert_rounded, color: Colors.white, size: 22),
        label: const Text(
          'SOS DISPATCH',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w900,
            fontSize: 12,
            letterSpacing: 1.0,
          ),
        ),
        onPressed: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const EmergencySosScreen()),
          );
        },
      ),
    );
  }
}
