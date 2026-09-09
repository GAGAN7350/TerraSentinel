import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../presentation/blocs/risk_bloc.dart';
import '../../presentation/widgets/shap_waterfall_chart.dart';
import '../../presentation/widgets/emergency_agency_card.dart';

class MlPredictionScreen extends StatefulWidget {
  const MlPredictionScreen({Key? key}) : super(key: key);

  @override
  State<MlPredictionScreen> createState() => _MlPredictionScreenState();
}

class _MlPredictionScreenState extends State<MlPredictionScreen> {
  final _slopeController = TextEditingController(text: '38.5');
  final _elevationController = TextEditingController(text: '1450.0');
  final _clayController = TextEditingController(text: '310.0');
  final _sandController = TextEditingController(text: '320.0');
  final _rainController = TextEditingController(text: '165.0');
  final _aspectController = TextEditingController(text: '180.0');

  // Simulation Sliders
  double _slopeDelta = 0.0;
  double _rainfallMultiplier = 1.0;

  @override
  void dispose() {
    _slopeController.dispose();
    _elevationController.dispose();
    _clayController.dispose();
    _sandController.dispose();
    _rainController.dispose();
    _aspectController.dispose();
    super.dispose();
  }

  void _runInference() {
    context.read<RiskBloc>().add(
          RunLiveMLInferenceEvent(
            latitude: 27.33,
            longitude: 88.61,
            terrainSlope: double.tryParse(_slopeController.text) ?? 35.0,
            elevationMeters: double.tryParse(_elevationController.text) ?? 1200.0,
            soilClay: double.tryParse(_clayController.text) ?? 300.0,
            soilSand: double.tryParse(_sandController.text) ?? 340.0,
            rainfall7d: double.tryParse(_rainController.text) ?? 100.0,
            terrainAspect: double.tryParse(_aspectController.text) ?? 180.0,
          ),
        );
  }

  void _runSimulation() {
    context.read<RiskBloc>().add(
          RunScenarioSimulationEvent(
            latitude: 27.33,
            longitude: 88.61,
            terrainSlope: double.tryParse(_slopeController.text) ?? 35.0,
            elevationMeters: double.tryParse(_elevationController.text) ?? 1200.0,
            soilClay: double.tryParse(_clayController.text) ?? 300.0,
            soilSand: double.tryParse(_sandController.text) ?? 340.0,
            rainfall7d: double.tryParse(_rainController.text) ?? 100.0,
            slopeDeltaDeg: _slopeDelta,
            rainfallMultiplier: _rainfallMultiplier,
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
        title: const Text(
          'AI Landslide Risk Assessment',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // Model Card Info
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.cyanAccent.withOpacity(0.3)),
            ),
            child: const Row(
              children: [
                Icon(Icons.hub_rounded, color: Colors.cyanAccent, size: 32),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'XGBoost Spatial Landslide Engine',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                      Text(
                        'v1.6.0-xgboost-calibrated • TreeSHAP • Platt Scaling',
                        style: TextStyle(color: Colors.white54, fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Input Parameters Form
          Card(
            color: const Color(0xFF1E293B),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Terrain & Precipitation Inputs:',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(child: _buildInputField('Slope (°)', _slopeController)),
                      const SizedBox(width: 12),
                      Expanded(child: _buildInputField('Elevation (m)', _elevationController)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(child: _buildInputField('Soil Clay (g/kg)', _clayController)),
                      const SizedBox(width: 12),
                      Expanded(child: _buildInputField('Soil Sand (g/kg)', _sandController)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(child: _buildInputField('7-Day Rain (mm)', _rainController)),
                      const SizedBox(width: 12),
                      Expanded(child: _buildInputField('Aspect (0-360°)', _aspectController)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0284C7),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: const Icon(Icons.flash_on_rounded),
                      label: const Text('RUN ML INFERENCE', style: TextStyle(fontWeight: FontWeight.bold)),
                      onPressed: _runInference,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // What-If Scenario Simulation Card
          Card(
            color: const Color(0xFF1E293B),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.tune_rounded, color: Colors.amberAccent, size: 20),
                      SizedBox(width: 8),
                      Text(
                        '"What-If" Scenario Simulator',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Slope Instability Delta (Δ°):', style: TextStyle(color: Colors.white70, fontSize: 13)),
                      Text('+${_slopeDelta.toStringAsFixed(1)}°', style: const TextStyle(color: Colors.amberAccent, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  Slider(
                    value: _slopeDelta,
                    min: 0.0,
                    max: 20.0,
                    divisions: 20,
                    activeColor: Colors.amberAccent,
                    onChanged: (v) => setState(() => _slopeDelta = v),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Precipitation Multiplier:', style: TextStyle(color: Colors.white70, fontSize: 13)),
                      Text('${_rainfallMultiplier.toStringAsFixed(1)}x', style: const TextStyle(color: Colors.cyanAccent, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  Slider(
                    value: _rainfallMultiplier,
                    min: 1.0,
                    max: 3.0,
                    divisions: 20,
                    activeColor: Colors.cyanAccent,
                    onChanged: (v) => setState(() => _rainfallMultiplier = v),
                  ),
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.amberAccent,
                        side: const BorderSide(color: Colors.amberAccent),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: const Icon(Icons.science_rounded),
                      label: const Text('SIMULATE CLIMATE/SLOPE SURGE'),
                      onPressed: _runSimulation,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Inference Results
          BlocBuilder<RiskBloc, RiskState>(
            builder: (context, state) {
              if (state is RiskLoading) {
                return const Center(
                  child: Padding(
                    padding: EdgeInsets.all(24.0),
                    child: CircularProgressIndicator(color: Colors.cyanAccent),
                  ),
                );
              }

              if (state is MLInferenceSuccess) {
                final result = state.prediction;
                return Column(
                  children: [
                    Card(
                      color: const Color(0xFF1E293B),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Risk Susceptibility Score:',
                                  style: TextStyle(color: Colors.white70, fontSize: 14),
                                ),
                                RiskBadge(level: result.riskLevel, score: result.riskScore),
                              ],
                            ),
                            const SizedBox(height: 12),
                            LinearProgressIndicator(
                              value: (result.riskScore / 100.0).clamp(0.0, 1.0),
                              backgroundColor: Colors.white12,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                result.riskLevel == 'CRITICAL'
                                    ? Colors.redAccent
                                    : (result.riskLevel == 'HIGH'
                                        ? Colors.orangeAccent
                                        : Colors.greenAccent),
                              ),
                              minHeight: 12,
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    ShapWaterfallChart(
                      drivers: result.shapDrivers,
                      calibratedProbability: result.calibratedProbability,
                    ),
                  ],
                );
              }

              return const SizedBox.shrink();
            },
          ),
        ],
      ),
    );
  }

  Widget _buildInputField(String label, TextEditingController controller) {
    return TextField(
      controller: controller,
      keyboardType: const TextInputType.numberWithOptions(decimal: true),
      style: const TextStyle(color: Colors.white, fontSize: 14),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.white54, fontSize: 12),
        filled: true,
        fillColor: const Color(0xFF0F172A),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
      ),
    );
  }
}
