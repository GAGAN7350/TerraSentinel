import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../data/models/risk_prediction_model.dart';
import '../../data/repositories/risk_repository.dart';
import '../../core/services/geofence_service.dart';

// --- Events ---
abstract class RiskEvent extends Equatable {
  const RiskEvent();
  @override
  List<Object?> get props => [];
}

class LoadRiskMapEvent extends RiskEvent {
  final String? riskLevel;
  const LoadRiskMapEvent({this.riskLevel});

  @override
  List<Object?> get props => [riskLevel];
}

class RunLiveMLInferenceEvent extends RiskEvent {
  final double latitude;
  final double longitude;
  final double terrainSlope;
  final double elevationMeters;
  final double soilClay;
  final double soilSand;
  final double rainfall7d;
  final double terrainAspect;

  const RunLiveMLInferenceEvent({
    required this.latitude,
    required this.longitude,
    required this.terrainSlope,
    required this.elevationMeters,
    required this.soilClay,
    required this.soilSand,
    required this.rainfall7d,
    this.terrainAspect = 180.0,
  });

  @override
  List<Object?> get props => [
        latitude,
        longitude,
        terrainSlope,
        elevationMeters,
        soilClay,
        soilSand,
        rainfall7d,
        terrainAspect,
      ];
}

class RunScenarioSimulationEvent extends RiskEvent {
  final double latitude;
  final double longitude;
  final double terrainSlope;
  final double elevationMeters;
  final double soilClay;
  final double soilSand;
  final double rainfall7d;
  final double slopeDeltaDeg;
  final double rainfallMultiplier;

  const RunScenarioSimulationEvent({
    required this.latitude,
    required this.longitude,
    required this.terrainSlope,
    required this.elevationMeters,
    required this.soilClay,
    required this.soilSand,
    required this.rainfall7d,
    required this.slopeDeltaDeg,
    required this.rainfallMultiplier,
  });

  @override
  List<Object?> get props => [
        latitude,
        longitude,
        terrainSlope,
        elevationMeters,
        soilClay,
        soilSand,
        rainfall7d,
        slopeDeltaDeg,
        rainfallMultiplier,
      ];
}

// --- States ---
abstract class RiskState extends Equatable {
  const RiskState();
  @override
  List<Object?> get props => [];
}

class RiskInitial extends RiskState {}

class RiskLoading extends RiskState {}

class RiskMapLoaded extends RiskState {
  final List<RiskPredictionModel> riskPoints;
  const RiskMapLoaded(this.riskPoints);

  @override
  List<Object?> get props => [riskPoints];
}

class MLInferenceSuccess extends RiskState {
  final RiskPredictionModel prediction;
  const MLInferenceSuccess(this.prediction);

  @override
  List<Object?> get props => [prediction];
}

class SimulationSuccess extends RiskState {
  final RiskPredictionModel baseline;
  final RiskPredictionModel simulated;
  const SimulationSuccess({required this.baseline, required this.simulated});

  @override
  List<Object?> get props => [baseline, simulated];
}

class RiskOperationFailure extends RiskState {
  final String message;
  const RiskOperationFailure(this.message);

  @override
  List<Object?> get props => [message];
}

// --- BLoC ---
class RiskBloc extends Bloc<RiskEvent, RiskState> {
  final RiskRepository _repository = RiskRepository();

  RiskBloc() : super(RiskInitial()) {
    on<LoadRiskMapEvent>((event, emit) async {
      emit(RiskLoading());
      try {
        final points = await _repository.getRiskMapPoints(riskLevel: event.riskLevel);
        // Update Geofence service with monitored points
        GeofenceService().updateMonitoredZones(points);
        emit(RiskMapLoaded(points));
      } catch (e) {
        emit(RiskOperationFailure(e.toString()));
      }
    });

    on<RunLiveMLInferenceEvent>((event, emit) async {
      emit(RiskLoading());
      try {
        final result = await _repository.predictLiveRisk(
          latitude: event.latitude,
          longitude: event.longitude,
          terrainSlope: event.terrainSlope,
          elevationMeters: event.elevationMeters,
          soilClay: event.soilClay,
          soilSand: event.soilSand,
          rainfall7d: event.rainfall7d,
          terrainAspect: event.terrainAspect,
        );
        emit(MLInferenceSuccess(result));
      } catch (e) {
        emit(RiskOperationFailure(e.toString()));
      }
    });

    on<RunScenarioSimulationEvent>((event, emit) async {
      emit(RiskLoading());
      try {
        final simResult = await _repository.simulateScenario(
          latitude: event.latitude,
          longitude: event.longitude,
          terrainSlope: event.terrainSlope,
          elevationMeters: event.elevationMeters,
          soilClay: event.soilClay,
          soilSand: event.soilSand,
          rainfall7d: event.rainfall7d,
          slopeDeltaDeg: event.slopeDeltaDeg,
          rainfallMultiplier: event.rainfallMultiplier,
        );
        emit(MLInferenceSuccess(simResult));
      } catch (e) {
        emit(RiskOperationFailure(e.toString()));
      }
    });
  }
}
