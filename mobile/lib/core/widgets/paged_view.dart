import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';
import '../theme/app_theme.dart';
import 'common.dart';

class PageResult<T> {
  const PageResult(this.items, {required this.page, required this.lastPage});
  final List<T> items;
  final int page;
  final int lastPage;
}

/// Self-contained paginated list (first page + "load more"), pull-to-refresh, loading/error/empty states.
/// Changing [resetKey] reloads from page 1.
class PagedView<T> extends StatefulWidget {
  const PagedView({
    super.key,
    required this.fetch,
    required this.itemBuilder,
    required this.emptyText,
    this.resetKey,
    this.header,
  });
  final Future<PageResult<T>> Function(int page) fetch;
  final Widget Function(BuildContext context, T item) itemBuilder;
  final String emptyText;
  final Object? resetKey;
  final Widget? header;

  @override
  State<PagedView<T>> createState() => _PagedViewState<T>();
}

class _PagedViewState<T> extends State<PagedView<T>> {
  final List<T> _items = [];
  int _page = 0;
  int _last = 1;
  bool _loading = true;
  bool _loadingMore = false;
  Object? _error;
  int _generation = 0;

  @override
  void initState() {
    super.initState();
    _load(reset: true);
  }

  @override
  void didUpdateWidget(covariant PagedView<T> old) {
    super.didUpdateWidget(old);
    if (old.resetKey != widget.resetKey) _load(reset: true);
  }

  Future<void> _load({required bool reset}) async {
    final gen = ++_generation; // ignore stale responses after a filter change
    setState(() {
      if (reset) {
        _loading = true;
        _items.clear();
        _page = 0;
      } else {
        _loadingMore = true;
      }
      _error = null;
    });
    try {
      final r = await widget.fetch(_page + 1);
      if (!mounted || gen != _generation) return;
      setState(() {
        _items.addAll(r.items);
        _page = r.page;
        _last = r.lastPage;
        _loading = false;
        _loadingMore = false;
      });
    } catch (e) {
      if (!mounted || gen != _generation) return;
      setState(() {
        _error = e;
        _loading = false;
        _loadingMore = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    if (_loading) return const LoadingView();
    if (_error != null && _items.isEmpty) return ErrorView(error: _error, onRetry: () => _load(reset: true));
    return RefreshIndicator(
      onRefresh: () => _load(reset: true),
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(Tokens.s4),
        children: [
          if (widget.header != null) widget.header!,
          if (_items.isEmpty) Padding(padding: const EdgeInsets.only(top: Tokens.s8), child: EmptyView(message: widget.emptyText)),
          for (final item in _items) Padding(padding: const EdgeInsets.only(bottom: Tokens.s3), child: widget.itemBuilder(context, item)),
          if (_error != null) Notice(text: errorMessage(l, _error), kind: NoticeKind.danger),
          if (_page < _last)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: Tokens.s2),
              child: OutlinedButton(
                onPressed: _loadingMore ? null : () => _load(reset: false),
                child: _loadingMore ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2)) : Text(l.loadMore),
              ),
            ),
        ],
      ),
    );
  }
}

PageResult<T> pageFrom<T>(List<dynamic> data, Map<String, dynamic> meta, T Function(Map<String, dynamic>) parse) => PageResult<T>(
      [for (final e in data) if (e is Map) parse(Map<String, dynamic>.from(e))],
      page: (meta['page'] as num?)?.toInt() ?? 1,
      lastPage: (meta['last_page'] as num?)?.toInt() ?? 1,
    );
