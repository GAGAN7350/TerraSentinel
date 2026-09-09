import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import '../../data/models/risk_prediction_model.dart';
import '../../presentation/blocs/risk_bloc.dart';
import '../../presentation/widgets/emergency_agency_card.dart';
import '../../presentation/widgets/shap_waterfall_chart.dart';

class GisRiskMapScreen extends StatefulWidget {
  const GisRiskMapScreen({Key? key}) : super(key: key);

  @override
  State<GisRiskMapScreen> createState() => _GisRiskMapScreenState();
}

class _GisRiskMapScreenState extends State<GisRiskMapScreen> {
  final MapController _mapController = MapController();
  LatLng _userPosition = const LatLng(27.33, 88.61); // Gangtok, Sikkim default
  String? _selectedFilter;
  RiskPredictionModel? _selectedPoint;

  @override
  void initState() {
    super.initState();
    _loadUserLocation();
    context.read<RiskBloc>().add(const LoadRiskMapEvent());
  }

  Future<void> _loadUserLocation() async {
    try {
      final pos = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.medium,
        timeLimit: const Duration(seconds: 4),
      );
      if (mounted) {
        setState(() {
          _userPosition = LatLng(pos.latitude, pos.longitude);
        });
      }
    } catch (_) {}
  }

  Color _getMarkerColor(String level) {
    switch (level.toUpperCase()) {
      case 'CRITICAL':
        return const Color(0xFFEF4444);
      case 'HIGH':
        return const Color(0xFFF97316);
      case 'MODERATE':
        return const Color(0xFFEAB308);
      default:
        return const Color(0xFF10B981);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Stack(
        children: [
          // Map canvas
          BlocBuilder<RiskBloc, RiskState>(
            builder: (context, state) {
              List<RiskPredictionModel> points = [];
              if (state is RiskMapLoaded) {
                points = state.riskPoints;
              }

              return FlutterMap(
                mapController: _mapController,
                options: MapOptions(
                  initialCenter: _userPosition,
                  initialZoom: 9.0,
                  maxZoom: 18.0,
                ),
                children: [
                  TileLayer(
                    urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                    userAgentPackageName: 'com.terrasentinel.mobile',
                  ),
                  // Markers for risk predictions
                  MarkerLayer(
                    markers: [
                      // User Live Position Marker
                      Marker(
                        point: _userPosition,
                        width: 32,
                        height: 32,
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.blueAccent.withOpacity(0.4),
                            shape: BoxShape.circle,
                          ),
                          child: const Center(
                            child: Icon(
                              Icons.my_location_rounded,
                              color: Colors.blue,
                              size: 24,
                            ),
                          ),
                        ),
                      ),
                      // Hazard centroid markers
                      ...points.map((p) {
                        final color = _getMarkerColor(p.riskLevel);
                        final isCritical = p.riskLevel == 'CRITICAL';

                        return Marker(
                          point: LatLng(p.latitude, p.longitude),
                          width: isCritical ? 42 : 32,
                          height: isCritical ? 42 : 32,
                          child: GestureDetector(
                            onTap: () {
                              setState(() => _selectedPoint = p);
                            },
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 300),
                              decoration: BoxDecoration(
                                color: color,
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white, width: 2),
                                boxShadow: [
                                  BoxShadow(
                                    color: color.withOpacity(0.6),
                                    blurRadius: isCritical ? 10 : 4,
                                    spreadRadius: isCritical ? 2 : 1,
                                  ),
                                ],
                              ),
                              child: Center(
                                child: Text(
                                  p.riskScore.toStringAsFixed(0),
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 11,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ],
                  ),
                ],
              );
            },
          ),

          // Top Header & Filter Chips
          Positioned(
            top: 48,
            left: 16,
            right: 16,
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B).withOpacity(0.95),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: const [BoxShadow(color: Colors.black45, blurRadius: 10)],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.terrain_rounded, color: Colors.cyanAccent),
                          SizedBox(width: 8),
                          Text(
                            'TerraSentinel GIS Map',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                            ),
                          ),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(Icons.refresh, color: Colors.white70),
                        onPressed: () {
                          context.read<RiskBloc>().add(LoadRiskMapEvent(riskLevel: _selectedFilter));
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildFilterChip('ALL', null),
                      _buildFilterChip('CRITICAL', 'CRITICAL'),
                      _buildFilterChip('HIGH', 'HIGH'),
                      _buildFilterChip('MODERATE', 'MODERATE'),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Bottom Selected Hazard Detail Sheet
          if (_selectedPoint != null)
            Positioned(
              bottom: 16,
              left: 16,
              right: 16,
              child: Card(
                color: const Color(0xFF1E293B),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                elevation: 12,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              RiskBadge(
                                level: _selectedPoint!.riskLevel,
                                score: _selectedPoint!.riskScore,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                'Trend: ${_selectedPoint!.trend}',
                                style: const TextStyle(color: Colors.white70, fontSize: 12),
                              ),
                            ],
                          ),
                          IconButton(
                            icon: const Icon(Icons.close, color: Colors.white54, size: 20),
                            onPressed: () => setState(() => _selectedPoint = null),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Location: (${_selectedPoint!.latitude.toStringAsFixed(3)}, ${_selectedPoint!.longitude.toStringAsFixed(3)})',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                      if (_selectedPoint!.calibratedProbability != null)
                        Text(
                          'Platt Calibrated Posterior Probability: ${(_selectedPoint!.calibratedProbability! * 100).toStringAsFixed(1)}%',
                          style: const TextStyle(color: Colors.cyanAccent, fontSize: 13),
                        ),
                      const SizedBox(height: 8),
                      if (_selectedPoint!.shapDrivers.isNotEmpty)
                        SizedBox(
                          height: 140,
                          child: SingleChildScrollView(
                            child: ShapWaterfallChart(
                              drivers: _selectedPoint!.shapDrivers,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFF0284C7),
        child: const Icon(Icons.my_location_rounded, color: Colors.white),
        onPressed: () {
          _mapController.move(_userPosition, 11.0);
        },
      ),
    );
  }

  Widget _buildFilterChip(String label, String? riskLevel) {
    final isSelected = _selectedFilter == riskLevel;
    return Padding(
      padding: const EdgeInsets.only(right: 6.0),
      child: FilterChip(
        selected: isSelected,
        label: Text(label, style: TextStyle(color: isSelected ? Colors.black : Colors.white, fontSize: 11)),
        backgroundColor: const Color(0xFF1E293B),
        selectedColor: Colors.cyanAccent,
        onSelected: (selected) {
          setState(() => _selectedFilter = selected ? riskLevel : null);
          context.read<RiskBloc>().add(LoadRiskMapEvent(riskLevel: _selectedFilter));
        },
      ),
    );
  }
}
