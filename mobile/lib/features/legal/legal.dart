import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/api_exception.dart';
import '../../core/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../core/util/format.dart';
import '../../core/widgets/common.dart';
import '../../core/widgets/simple_markdown.dart';
import '../../l10n/app_localizations.dart';

const legalSlugs = ['privacy', 'terms', 'cookies'];

String legalSlugLabel(AppL10n l, String slug) => switch (slug) { 'privacy' => l.legalPrivacy, 'terms' => l.legalTerms, 'cookies' => l.legalCookies, _ => slug };

/// `GET /legal/{slug}`. A 404 is a normal, expected state (nothing is published until the admin workflow publishes it).
final legalDocumentProvider = FutureProvider.autoDispose.family<Map<String, dynamic>?, String>((ref, slug) async {
  ref.watch(localeProvider);
  try {
    return (await ref.watch(apiClientProvider).get('/legal/${Uri.encodeComponent(slug)}')).map;
  } on NotFoundException {
    return null;
  }
});

/// Public (reachable before sign-in: the register screen links here).
class LegalIndexScreen extends StatelessWidget {
  const LegalIndexScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(l.legalTitle)),
      body: ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
        for (final s in legalSlugs) Card(child: ListTile(key: ValueKey('legal-$s'), minVerticalPadding: Tokens.s3, leading: const Icon(Icons.gavel_outlined, color: Tokens.primary), title: Text(legalSlugLabel(l, s)), trailing: const Icon(Icons.chevron_right), onTap: () => context.push('/legal/$s'))),
      ]),
    );
  }
}

class LegalDocumentScreen extends ConsumerWidget {
  const LegalDocumentScreen({super.key, required this.slug});
  final String slug;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppL10n.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(legalSlugLabel(l, slug))),
      body: AsyncBody<Map<String, dynamic>?>(
        value: ref.watch(legalDocumentProvider(slug)),
        onRetry: () => ref.invalidate(legalDocumentProvider(slug)),
        data: (d) {
          if (d == null) return Padding(padding: const EdgeInsets.all(Tokens.s4), child: Center(child: Notice(key: const ValueKey('legal-not-published'), text: l.legalNotPublished, kind: NoticeKind.info)));
          final at = d['published_at'] as String?;
          final version = '${d['version'] ?? ''}';
          final source = SourceInfo.fromJson(d['source']);
          return ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
            Text('${d['title'] ?? legalSlugLabel(l, slug)}', style: Theme.of(context).textTheme.titleLarge),
            if (version.isNotEmpty) Padding(padding: const EdgeInsets.only(top: Tokens.s1), child: Text(at == null ? l.legalVersionOnly(version) : l.legalVersion(version, formatDate(context, at)), key: const ValueKey('legal-version'), style: Theme.of(context).textTheme.bodySmall)),
            if (d['fallback'] == true) Padding(padding: const EdgeInsets.only(top: Tokens.s3), child: Notice(text: l.fallbackLocale)),
            const SizedBox(height: Tokens.s3),
            SimpleMarkdown('${d['body'] ?? ''}'),
            if (source != null) Padding(padding: const EdgeInsets.only(top: Tokens.s4), child: Card(child: Padding(padding: const EdgeInsets.all(Tokens.s4), child: SourceBlock(source: source)))),
          ]);
        },
      ),
    );
  }
}
