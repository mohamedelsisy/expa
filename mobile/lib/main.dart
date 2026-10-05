import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/date_symbol_data_local.dart';

import 'app.dart';
import 'features/auth/auth_controller.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting();
  final container = ProviderContainer();
  // Restore the session (token from the secure store) before the first frame is routed.
  container.read(authControllerProvider.notifier).bootstrap();
  runApp(UncontrolledProviderScope(container: container, child: const ExpaApp()));
}
