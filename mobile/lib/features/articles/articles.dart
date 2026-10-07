import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/cache/content_repository.dart';
import '../../core/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../core/util/format.dart';
import '../../core/widgets/common.dart';
import '../../core/widgets/paged_view.dart';
import '../../core/widgets/saved_content.dart';
import '../../core/widgets/simple_markdown.dart';
import '../../l10n/app_localizations.dart';

List<Map<String, dynamic>> _maps(Object? v) => [for (final e in (v as List? ?? const [])) if (e is Map) Map<String, dynamic>.from(e)];

final articleCategoriesProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  ref.watch(localeProvider);
  try {
    return _maps((await ref.watch(apiClientProvider).get('/articles/categories')).data);
  } catch (_) {
    return const []; // filters are optional; the list still works
  }
});

/// Cache-first like guides: a saved article opens from the device and refreshes in the background.
final articleDetailProvider = StreamProvider.autoDispose.family<ContentResult, String>((ref, slug) {
  ref.watch(localeProvider);
  return ref.watch(contentRepositoryProvider(articleKind)).open(slug);
});

final cityDetailProvider = StreamProvider.autoDispose.family<ContentResult, String>((ref, slug) {
  ref.watch(localeProvider);
  return ref.watch(contentRepositoryProvider(cityKind)).open(slug);
});

String _categoryValue(Map<String, dynamic> c) => '${c['value'] ?? c['slug'] ?? c['key'] ?? ''}';
String _categoryLabel(Map<String, dynamic> c) => '${c['label'] ?? c['title'] ?? c['name'] ?? _categoryValue(c)}';

class ArticlesScreen extends ConsumerStatefulWidget {
  const ArticlesScreen({super.key});
  @override
  ConsumerState<ArticlesScreen> createState() => _ArticlesState();
}

class _ArticlesState extends ConsumerState<ArticlesScreen> {
  String _q = '';
  String? _category;

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final cats = ref.watch(articleCategoriesProvider).valueOrNull ?? const [];
    return Scaffold(
      appBar: AppBar(title: Text(l.articlesTitle)),
      body: PagedView<Map<String, dynamic>>(
        resetKey: '$_q|$_category|${ref.watch(localeProvider).languageCode}',
        emptyText: l.articlesEmpty,
        fetch: (page) async {
          final r = await ref.read(apiClientProvider).get('/articles', query: {'page': page, 'per_page': 20, if (_q.isNotEmpty) 'q': _q, if (_category != null) 'category': _category});
          return pageFrom(r.list, r.meta, (m) => m);
        },
        header: Padding(
          padding: const EdgeInsets.only(bottom: Tokens.s3),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            TextField(key: const ValueKey('articles-search'), textInputAction: TextInputAction.search, decoration: InputDecoration(hintText: l.searchHint, prefixIcon: const Icon(Icons.search)), onSubmitted: (v) => setState(() => _q = v.trim())),
            if (cats.isNotEmpty) ...[
              const SizedBox(height: Tokens.s2),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(children: [
                  Padding(padding: const EdgeInsetsDirectional.only(end: Tokens.s2), child: ChoiceChip(label: Text(l.allCategories), selected: _category == null, onSelected: (_) => setState(() => _category = null))),
                  for (final c in cats)
                    Padding(padding: const EdgeInsetsDirectional.only(end: Tokens.s2), child: ChoiceChip(label: Text(_categoryLabel(c)), selected: _category == _categoryValue(c), onSelected: (_) => setState(() => _category = _categoryValue(c)))),
                ]),
              ),
            ],
          ]),
        ),
        itemBuilder: (context, a) => Card(
          child: InkWell(
            borderRadius: BorderRadius.circular(Tokens.radiusMd),
            onTap: () => context.push('/articles/${Uri.encodeComponent('${a['slug']}')}'),
            child: Padding(
              padding: const EdgeInsets.all(Tokens.s4),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                if (a['category_label'] != null) Text('${a['category_label']}', style: Theme.of(context).textTheme.bodySmall),
                Text('${a['title'] ?? ''}', style: Theme.of(context).textTheme.titleMedium),
                if (a['excerpt'] != null) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Text('${a['excerpt']}', maxLines: 3, overflow: TextOverflow.ellipsis)),
                if (a['published_at'] != null) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Text(formatDate(context, '${a['published_at']}'), style: Theme.of(context).textTheme.bodySmall)),
              ]),
            ),
          ),
        ),
      ),
    );
  }
}

class ArticleDetailScreen extends ConsumerWidget {
  const ArticleDetailScreen({super.key, required this.slug});
  final String slug;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppL10n.of(context);
    final value = ref.watch(articleDetailProvider(slug));
    return Scaffold(
      appBar: AppBar(title: Text(l.articlesTitle), actions: [if (value.valueOrNull != null) SaveOfflineButton(kind: articleKind, slug: slug, data: value.valueOrNull!.data)]),
      body: AsyncBody<ContentResult>(value: value, onRetry: () => ref.invalidate(articleDetailProvider(slug)), data: (r) => ArticleView(result: r)),
    );
  }
}

class ArticleView extends StatelessWidget {
  const ArticleView({super.key, required this.result});
  final ContentResult result;

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final a = result.data;
    final theme = Theme.of(context);
    final source = SourceInfo.fromJson(a['source']);
    final tags = [for (final t in (a['tags'] as List? ?? const [])) t is Map ? '${t['label'] ?? t['name'] ?? t['slug'] ?? ''}' : '$t'];
    final guides = _maps(a['related_guides']);
    final articles = _maps(a['related_articles']);
    final body = a['body'];
    return ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
      CachedCopyNotice(result: result),
      if (a['category_label'] != null) Text('${a['category_label']}', style: theme.textTheme.bodySmall),
      Text('${a['title'] ?? ''}', style: theme.textTheme.titleLarge),
      const SizedBox(height: Tokens.s2),
      Align(alignment: AlignmentDirectional.centerStart, child: Pill(key: const ValueKey('article-editorial'), text: l.articleEditorial, icon: Icons.edit_note)),
      if (a['fallback'] == true) Padding(padding: const EdgeInsets.only(top: Tokens.s3), child: Notice(text: l.fallbackLocale)),
      if (a['published_at'] != null) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Text(formatDate(context, '${a['published_at']}'), style: theme.textTheme.bodySmall)),
      if (a['excerpt'] != null) Padding(padding: const EdgeInsets.only(top: Tokens.s3), child: Text('${a['excerpt']}', style: theme.textTheme.titleSmall)),
      const SizedBox(height: Tokens.s3),
      if (body is String && body.trim().isNotEmpty) SimpleMarkdown(body),
      if (tags.isNotEmpty) ...[
        const SizedBox(height: Tokens.s3),
        Wrap(spacing: Tokens.s2, runSpacing: Tokens.s1, children: [for (final t in tags) Pill(text: t)]),
      ],
      if (guides.isNotEmpty) ...[
        Padding(padding: const EdgeInsets.only(top: Tokens.s5, bottom: Tokens.s2), child: Text(l.articleRelatedGuides, style: theme.textTheme.titleMedium)),
        for (final g in guides) Card(child: ListTile(title: Text('${g['title'] ?? g['slug']}'), trailing: const Icon(Icons.chevron_right), onTap: () => context.push('/guides/${Uri.encodeComponent('${g['slug']}')}'))),
      ],
      if (articles.isNotEmpty) ...[
        Padding(padding: const EdgeInsets.only(top: Tokens.s5, bottom: Tokens.s2), child: Text(l.articleRelatedArticles, style: theme.textTheme.titleMedium)),
        for (final x in articles) Card(child: ListTile(title: Text('${x['title'] ?? x['slug']}'), trailing: const Icon(Icons.chevron_right), onTap: () => context.push('/articles/${Uri.encodeComponent('${x['slug']}')}'))),
      ],
      // The source is shown only when the API gives a complete one; an article never implies an official source.
      if (source != null) Padding(padding: const EdgeInsets.only(top: Tokens.s4), child: Card(child: Padding(padding: const EdgeInsets.all(Tokens.s4), child: SourceBlock(source: source)))),
      const SizedBox(height: Tokens.s3),
      Notice(key: const ValueKey('article-disclaimer'), text: (a['disclaimer'] as String?)?.trim().isNotEmpty == true ? a['disclaimer'] as String : l.articleDefaultDisclaimer, kind: NoticeKind.warning),
    ]);
  }
}

// ---------------------------------------------------------------- cities

class CitiesScreen extends ConsumerWidget {
  const CitiesScreen({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppL10n.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(l.citiesTitle)),
      body: PagedView<Map<String, dynamic>>(
        resetKey: ref.watch(localeProvider).languageCode,
        emptyText: l.citiesEmpty,
        fetch: (page) async {
          final r = await ref.read(apiClientProvider).get('/city-profiles', query: {'page': page});
          return pageFrom(r.list, r.meta, (m) => m);
        },
        itemBuilder: (context, c) => Card(
          child: ListTile(
            minVerticalPadding: Tokens.s3,
            leading: const Icon(Icons.location_city_outlined, color: Tokens.primary),
            title: Text(_cityName(c)),
            subtitle: (c['headline'] ?? c['summary']) == null ? null : Text('${c['headline'] ?? c['summary']}', maxLines: 2, overflow: TextOverflow.ellipsis),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push('/cities/${Uri.encodeComponent('${c['slug']}')}'),
          ),
        ),
      ),
    );
  }
}

String _cityName(Map<String, dynamic> c) => '${c['name'] ?? (c['city'] is Map ? (c['city'] as Map)['name'] : null) ?? c['title'] ?? c['headline'] ?? c['slug'] ?? ''}';

class CityDetailScreen extends ConsumerWidget {
  const CityDetailScreen({super.key, required this.slug});
  final String slug;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppL10n.of(context);
    final value = ref.watch(cityDetailProvider(slug));
    return Scaffold(
      appBar: AppBar(title: Text(l.citiesTitle), actions: [if (value.valueOrNull != null) SaveOfflineButton(kind: cityKind, slug: slug, data: value.valueOrNull!.data)]),
      body: AsyncBody<ContentResult>(value: value, onRetry: () => ref.invalidate(cityDetailProvider(slug)), data: (r) => CityView(result: r)),
    );
  }
}

class CityView extends StatelessWidget {
  const CityView({super.key, required this.result});
  final ContentResult result;

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final c = result.data;
    final theme = Theme.of(context);
    final blocks = _maps(c['blocks']);
    final guides = _maps(c['guides']);
    final articles = _maps(c['articles']);
    final offices = (c['offices_count'] as num?)?.toInt();
    return ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
      CachedCopyNotice(result: result),
      Text(_cityName(c), style: theme.textTheme.titleLarge),
      if (c['headline'] != null) Padding(padding: const EdgeInsets.only(top: Tokens.s1), child: Text('${c['headline']}', style: theme.textTheme.titleSmall)),
      if (c['fallback'] == true) Padding(padding: const EdgeInsets.only(top: Tokens.s3), child: Notice(text: l.fallbackLocale)),
      if (c['summary'] != null) Padding(padding: const EdgeInsets.only(top: Tokens.s3), child: Text('${c['summary']}')),
      for (final b in blocks)
        Card(
          key: ValueKey('city-block-${b['key']}'),
          margin: const EdgeInsets.only(top: Tokens.s3),
          child: Padding(
            padding: const EdgeInsets.all(Tokens.s4),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              if (b['label'] != null) Text('${b['label']}', style: theme.textTheme.bodySmall),
              Text('${b['title'] ?? ''}', style: theme.textTheme.titleMedium),
              const SizedBox(height: Tokens.s1),
              Pill(
                text: '${b['info_label'] ?? (b['info_type'] == 'official_info' ? l.cityOfficial : l.cityGeneral)}',
                bg: b['info_type'] == 'official_info' ? Tokens.successSoft : Tokens.sunken,
                fg: b['info_type'] == 'official_info' ? Tokens.success : Tokens.inkSoft,
              ),
              const SizedBox(height: Tokens.s2),
              if (b['body'] is String) SimpleMarkdown(b['body'] as String),
              if (SourceInfo.fromJson(b['source']) != null) SourceBlock(source: SourceInfo.fromJson(b['source'])!),
            ]),
          ),
        ),
      if (offices != null && offices > 0) ...[
        const SizedBox(height: Tokens.s3),
        Text(l.cityOffices(formatNumber(context, offices))),
        TextButton(onPressed: () => context.push('/government'), child: Text(l.cityOfficesOpen)),
      ],
      if (guides.isNotEmpty) ...[
        Padding(padding: const EdgeInsets.only(top: Tokens.s5, bottom: Tokens.s2), child: Text(l.cityGuides, style: theme.textTheme.titleMedium)),
        for (final g in guides) Card(child: ListTile(title: Text('${g['title'] ?? g['slug']}'), trailing: const Icon(Icons.chevron_right), onTap: () => context.push('/guides/${Uri.encodeComponent('${g['slug']}')}'))),
      ],
      if (articles.isNotEmpty) ...[
        Padding(padding: const EdgeInsets.only(top: Tokens.s5, bottom: Tokens.s2), child: Text(l.cityArticles, style: theme.textTheme.titleMedium)),
        for (final x in articles) Card(child: ListTile(title: Text('${x['title'] ?? x['slug']}'), trailing: const Icon(Icons.chevron_right), onTap: () => context.push('/articles/${Uri.encodeComponent('${x['slug']}')}'))),
      ],
      const SizedBox(height: Tokens.s3),
      Notice(key: const ValueKey('city-disclaimer'), text: (c['disclaimer'] as String?)?.trim().isNotEmpty == true ? c['disclaimer'] as String : l.articleDefaultDisclaimer, kind: NoticeKind.warning),
    ]);
  }
}
