import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../l10n/app_localizations.dart';
import '../providers.dart';

/// Segmented ar / en / it selector. Each name is shown in its own language and script.
class LanguageSwitcher extends ConsumerWidget {
  const LanguageSwitcher({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppL10n.of(context);
    final current = ref.watch(localeProvider).languageCode;
    final names = {'ar': l.langAr, 'en': l.langEn, 'it': l.langIt};
    return Semantics(
      label: l.language,
      child: Wrap(
        spacing: 8,
        runSpacing: 8,
        alignment: WrapAlignment.center,
        children: [
          for (final code in supportedLocaleCodes)
            ChoiceChip(
              key: ValueKey('lang-$code'),
              label: Text(names[code]!),
              selected: current == code,
              onSelected: (_) => ref.read(localeProvider.notifier).set(code),
              materialTapTargetSize: MaterialTapTargetSize.padded,
            ),
        ],
      ),
    );
  }
}
