import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../core/services/emergency_dispatch_service.dart';

// --- Events ---
abstract class EmergencyEvent extends Equatable {
  const EmergencyEvent();
  @override
  List<Object?> get props => [];
}

class TriggerSosDispatchEvent extends EmergencyEvent {
  final String situationDescription;
  final String? state;
  final String? district;
  final bool isRoadBlocked;

  const TriggerSosDispatchEvent({
    required this.situationDescription,
    this.state,
    this.district,
    this.isRoadBlocked = true,
  });

  @override
  List<Object?> get props => [situationDescription, state, district, isRoadBlocked];
}

class CallAgencyDirectEvent extends EmergencyEvent {
  final String phoneNumber;
  const CallAgencyDirectEvent(this.phoneNumber);

  @override
  List<Object?> get props => [phoneNumber];
}

// --- States ---
abstract class EmergencyState extends Equatable {
  const EmergencyState();
  @override
  List<Object?> get props => [];
}

class EmergencyInitial extends EmergencyState {}

class EmergencyDispatching extends EmergencyState {}

class EmergencyDispatchedSuccess extends EmergencyState {
  final EmergencyDispatchResult result;
  const EmergencyDispatchedSuccess(this.result);

  @override
  List<Object?> get props => [result];
}

class EmergencyDispatchFailure extends EmergencyState {
  final String error;
  const EmergencyDispatchFailure(this.error);

  @override
  List<Object?> get props => [error];
}

// --- BLoC ---
class EmergencyBloc extends Bloc<EmergencyEvent, EmergencyState> {
  final EmergencyDispatchService _dispatchService = EmergencyDispatchService();

  EmergencyBloc() : super(EmergencyInitial()) {
    on<TriggerSosDispatchEvent>((event, emit) async {
      emit(EmergencyDispatching());
      try {
        final result = await _dispatchService.triggerMultiAgencySos(
          situationDescription: event.situationDescription,
          currentState: event.state,
          district: event.district,
          isRoadBlocked: event.isRoadBlocked,
        );
        emit(EmergencyDispatchedSuccess(result));
      } catch (e) {
        emit(EmergencyDispatchFailure(e.toString()));
      }
    });

    on<CallAgencyDirectEvent>((event, emit) async {
      await _dispatchService.directCallAgency(event.phoneNumber);
    });
  }
}
