import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../data/models/alert_model.dart';
import '../../data/repositories/alert_repository.dart';
import '../../core/services/alert_audio_service.dart';

// --- Events ---
abstract class AlertEvent extends Equatable {
  const AlertEvent();
  @override
  List<Object?> get props => [];
}

class LoadAlertsEvent extends AlertEvent {
  final String? status;
  const LoadAlertsEvent({this.status});

  @override
  List<Object?> get props => [status];
}

class StopAlertSirenEvent extends AlertEvent {}

// --- States ---
abstract class AlertState extends Equatable {
  const AlertState();
  @override
  List<Object?> get props => [];
}

class AlertInitial extends AlertState {}

class AlertLoading extends AlertState {}

class AlertsLoaded extends AlertState {
  final List<AlertModel> alerts;
  final bool hasActiveCritical;

  const AlertsLoaded({
    required this.alerts,
    this.hasActiveCritical = false,
  });

  @override
  List<Object?> get props => [alerts, hasActiveCritical];
}

class AlertError extends AlertState {
  final String error;
  const AlertError(this.error);

  @override
  List<Object?> get props => [error];
}

// --- BLoC ---
class AlertBloc extends Bloc<AlertEvent, AlertState> {
  final AlertRepository _repository = AlertRepository();

  AlertBloc() : super(AlertInitial()) {
    on<LoadAlertsEvent>((event, emit) async {
      emit(AlertLoading());
      try {
        final alerts = await _repository.getAlerts(status: event.status);
        final bool hasCritical = alerts.any((a) => a.isCritical && a.isActive);

        emit(AlertsLoaded(
          alerts: alerts,
          hasActiveCritical: hasCritical,
        ));
      } catch (e) {
        emit(AlertError(e.toString()));
      }
    });

    on<StopAlertSirenEvent>((event, emit) async {
      await AlertAudioService().stopEmergencySiren();
      if (state is AlertsLoaded) {
        final current = state as AlertsLoaded;
        emit(AlertsLoaded(alerts: current.alerts, hasActiveCritical: false));
      }
    });
  }
}
