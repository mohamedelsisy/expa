import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/cache/content_repository.dart';
import '../../core/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/common.dart';
import '../../core/widgets/content_view.dart';
import '../../core/widgets/paged_view.dart';
import '../../core/widgets/saved_content.dart';
import '../../l10n/app_localizations.dart';

class Guide {
  Guide(this.raw);
  final Map<String, dynamic> raw;
  String get slug => raw['slug'] as String;
  String get title => (raw['title'] ?? '').toString();
  String? get summary => raw['summary'] as String?;
  String? get categoryLabel => raw['category_label'] as String?;
  String? get italianTerm => raw['italian_term'] as String?;
  bool get fallback => raw['fallback'] == true;
  SourceInfo? get source => SourceInfo.fromJson(raw['source']);
}

final guideCategoriesProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final r = await ref.watch(apiClientProvider).get('/guides/categories');
  return [for (final e in r.list) if (e is Map) Map<String, dynamic>.from(e)];
});

/// Cache-first / network-refresh: a saved guide opens instantly from the device and is refreshed in the background.
final guideDetailProvider = StreamProvider.autoDispose.family<ContentResult, String>((ref, slug) {
  ref.watch(localeProvider);
  return ref.watch(contentRepositoryProvider(guideKind)).open(slug);
});

class GuidesScreen extends ConsumerStatefulWidget {
  const GuidesScreen({super.key});
  @override
  ConsumerState<GuidesScreen> createState() => _GuidesScreenState();
}

class _GuidesScreenState extends ConsumerState<GuidesScreen> {
  String _q = '';
  String? _category;
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final cats = ref.watch(guideCategoriesProvider).valueOrNull ?? const [];
    return Scaffold(
      appBar: AppBar(title: Text(l.guidesTitle)),
      body: PagedView<Guide>(
        resetKey: '$_q|$_category|${ref.watch(localeProvider).languageCode}',
        emptyText: l.emptyList,
        fetch: (page) async {
          final r = await ref.read(apiClientProvider).get('/guides', query: {'page': page, 'per_page': 20, if (_q.isNotEmpty) 'q': _q, if (_category != null) 'category': _category});
          return pageFrom(r.list, r.meta, Guide.new);
        },
        header: Padding(
          padding: const EdgeInsets.only(bottom: Tokens.s3),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            TextField(
              controller: _controller,
              textInputAction: TextInputAction.search,
              decoration: InputDecoration(hintText: l.searchHint, prefixIcon: const Icon(Icons.search)),
              onSubmitted: (v) => setState(() => _q = v.trim()),
            ),
            const SizedBox(height: Tokens.s2),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(children: [
                Padding(padding: const EdgeInsetsDirectional.only(end: Tokens.s2), child: ChoiceChip(label: Text(l.allCategories), selected: _category == null, onSelected: (_) => setState(() => _category = null))),
                for (final c in cats)
                  Padding(
                    padding: const EdgeInsetsDirectional.only(end: Tokens.s2),
                    child: ChoiceChip(label: Text('${c['label']}'), selected: _category == c['value'], onSelected: (_) => setState(() => _category = c['value'] as String)),
                  ),
              ]),
            ),
          ]),
        ),
        itemBuilder: (context, g) => Card(
          child: InkWell(
            borderRadius: BorderRadius.circular(Tokens.radiusMd),
            onTap: () => context.push('/guides/${Uri.encodeComponent(g.slug)}'),
            child: Padding(
              padding: const EdgeInsets.all(Tokens.s4),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                if (g.categoryLabel != null) Text(g.categoryLabel!, style: Theme.of(context).textTheme.bodySmall),
                Text(g.title, style: Theme.of(context).textTheme.titleMedium),
                if (g.italianTerm != null) Padding(padding: const EdgeInsets.only(top: Tokens.s1), child: Pill(text: g.italianTerm!, bg: Tokens.primarySoft, fg: Tokens.primaryStrong)),
                if (g.summary != null) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Text(g.summary!, maxLines: 3, overflow: TextOverflow.ellipsis)),
                if (g.source != null) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: FreshnessBadge(freshness: g.source!.freshness)),
              ]),
            ),
          ),
        ),
      ),
    );
  }
}

class GuideDetailScreen extends ConsumerWidget {
  const GuideDetailScreen({super.key, required this.slug});
  final String slug;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppL10n.of(context);
    final value = ref.watch(guideDetailProvider(slug));
    return Scaffold(
      appBar: AppBar(title: Text(l.guidesTitle), actions: [
        if (value.valueOrNull != null) SaveOfflineButton(kind: guideKind, slug: slug, data: value.valueOrNull!.data),
      ]),
      body: AsyncBody<ContentResult>(
        value: value,
        onRetry: () => ref.invalidate(guideDetailProvider(slug)),
        data: (r) => GuideDetailView(guide: Guide(r.data), cached: r),
      ),
    );
  }
}

class GuideDetailView extends StatelessWidget {
  const GuideDetailView({super.key, required this.guide, this.cached});
  final Guide guide;
  final ContentResult? cached;

  Widget _section(BuildContext context, String title, Object? value) => ContentSection(title: title, value: value);

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final g = guide;
    final r = g.raw;
    return ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
      if (cached != null) CachedCopyNotice(result: cached!),
      if (g.categoryLabel != null) Text(g.categoryLabel!, style: Theme.of(context).textTheme.bodySmall),
      Text(g.title, style: Theme.of(context).textTheme.titleLarge),
      if (g.italianTerm != null) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Align(alignment: AlignmentDirectional.centerStart, child: Pill(text: g.italianTerm!, bg: Tokens.primarySoft, fg: Tokens.primaryStrong))),
      if (g.fallback) Padding(padding: const EdgeInsets.only(top: Tokens.s3), child: Notice(text: l.fallbackLocale, kind: NoticeKind.info)),
      if (g.summary != null) Padding(padding: const EdgeInsets.only(top: Tokens.s3), child: Text(g.summary!)),
      _section(context, l.secWhatIs, r['what_is']),
      _section(context, l.secWhoNeeds, r['who_needs']),
      _section(context, l.secDocuments, r['required_documents']),
      _section(context, l.secSteps, r['steps']),
      _section(context, l.secWhere, r['where_to_apply']),
      _section(context, l.secBook, r['how_to_book']),
      _section(context, l.secCosts, r['costs']),
      _section(context, l.secTime, r['processing_time']),
      _section(context, '', r['body']),
      const SizedBox(height: Tokens.s5),
      if (g.source != null) Card(child: Padding(padding: const EdgeInsets.all(Tokens.s4), child: SourceBlock(source: g.source!))),
      const SizedBox(height: Tokens.s3),
      Notice(text: l.verifyOfficialNotice, kind: NoticeKind.warning),
    ]);
  }
}
