import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/date_symbol_data_local.dart';

import 'app.dart';
import 'core/config.dart';
import 'core/providers.dart';
import 'features/auth/auth_controller.dart';

const _installMarker = 'expa:install';

/// iOS Keychain items survive an uninstall; app files do not. If the marker file is missing this is a
/// fresh install, so a leftover token from a previous install (or a deleted account) is discarded (MOB-23).
Future<void> _firstRunGuard(ProviderContainer container) async {
  try {
    final cache = container.read(localCacheProvider);
    if ((await cache.read(_installMarker)) == null) {
      await container.read(sessionStoreProvider).clearToken();
      await cache.write(_installMarker, {'v': 1});
    }
  } catch (_) {}
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Release builds must talk https only (MOB-4): refuse to start rather than ship a cleartext build.
  final problem = AppConfig.startupProblem();
  if (problem != null) {
    runApp(MaterialApp(home: Scaffold(body: Center(child: Padding(padding: const EdgeInsets.all(24), child: Text('Configuration error\n$problem', textDirection: TextDirection.ltr))))));
    return;
  }

  // No PII or tokens are ever logged. Unhandled async errors must not crash release builds silently.
  FlutterError.onError = (details) {
    if (kDebugMode) FlutterError.presentError(details);
  };
  PlatformDispatcher.instance.onError = (error, stack) => !kDebugMode;
  if (kReleaseMode) ErrorWidget.builder = (details) => const SizedBox.shrink();

  await initializeDateFormatting();
  final container = ProviderContainer();
  // Restore the session (token from the secure store) before the first frame is routed. Never throws.
  final boot = _firstRunGuard(container).then((_) => container.read(authControllerProvider.notifier).bootstrap());
  runApp(UncontrolledProviderScope(container: container, child: const ExpaApp()));
  await boot;
}
