import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/auth/auth_controller.dart';
import '../../l10n/app_localizations.dart';
import '../providers.dart';
import '../theme/app_theme.dart';

/// Wraps the whole app: shows a persistent banner while the last request failed for lack of connectivity
/// (or the app started from the cached profile). Retry probes the API; on success the client flips the state back.
class OfflineBannerHost extends ConsumerWidget {
  const OfflineBannerHost({super.key, required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final offline = ref.watch(offlineProvider);
    final fromCache = ref.watch(authControllerProvider.select((s) => s.fromCache));
    if (!offline && !fromCache) return child;
    final l = AppL10n.of(context);
    return Column(children: [
      Material(
        color: Tokens.warningSoft,
        child: SafeArea(
          bottom: false,
          child: Semantics(
            liveRegion: true,
            container: true,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: Tokens.s3, vertical: Tokens.s1),
              child: Row(children: [
                const Icon(Icons.cloud_off, size: 20, color: Tokens.warning),
                const SizedBox(width: Tokens.s2),
                Expanded(child: Text(l.offlineBanner, key: const ValueKey('offline-banner'), style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Tokens.ink))),
                TextButton(
                  key: const ValueKey('offline-retry'),
                  onPressed: () async {
                    try {
                      await ref.read(apiClientProvider).get('/health');
                    } catch (_) {}
                    if (ref.read(authControllerProvider).status == AuthStatus.authenticated) await ref.read(authControllerProvider.notifier).refreshUser();
                  },
                  child: Text(l.retry),
                ),
              ]),
            ),
          ),
        ),
      ),
      Expanded(child: MediaQuery.removePadding(context: context, removeTop: true, child: child)),
    ]);
  }
}
