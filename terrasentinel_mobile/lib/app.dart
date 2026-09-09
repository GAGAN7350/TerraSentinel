import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'presentation/blocs/risk_bloc.dart';
import 'presentation/blocs/alert_bloc.dart';
import 'presentation/blocs/emergency_bloc.dart';
import 'presentation/screens/home_navigation_screen.dart';

class TerraSentinelApp extends StatelessWidget {
  const TerraSentinelApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => RiskBloc()),
        BlocProvider(create: (_) => AlertBloc()),
        BlocProvider(create: (_) => EmergencyBloc()),
      ],
      child: MaterialApp(
        title: 'TerraSentinel Mobile',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          brightness: Brightness.dark,
          scaffoldBackgroundColor: const Color(0xFF0F172A),
          primaryColor: const Color(0xFF0284C7),
          colorScheme: const ColorScheme.dark(
            primary: Color(0xFF0284C7),
            secondary: Colors.cyanAccent,
            surface: Color(0xFF1E293B),
            background: Color(0xFF0F172A),
            error: Color(0xFFEF4444),
          ),
          fontFamily: 'Roboto',
        ),
        home: const HomeNavigationScreen(),
      ),
    );
  }
}
