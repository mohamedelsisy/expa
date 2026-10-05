import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../l10n/app_localizations.dart';
import '../api/api_exception.dart';
import '../theme/app_theme.dart';
import '../util/format.dart';
import '../util/safe_url.dart';

/// Maps any thrown error to a localized, user-facing message.
String errorMessage(AppL10n l, Object? e) {
  if (e is! ApiException) return l.errorGeneric;
  return switch (e) {
    NetworkException() => l.errorNetwork,
    TimeoutApiException() => l.errorTimeout,
    UnauthorizedException() => e.invalidCredentials ? l.invalidCredentials : l.sessionExpired,
    ForbiddenException() => e.consentRequired
        ? l.consentRequired
        : e.emailNotVerified
            ? l.askVerifyEmail
            : e.code == 'account_suspended'
                ? l.accountSuspended
                : l.errorForbidden,
    NotFoundException() => l.errorNotFound,
    ValidationException() => e.details.values.expand((v) => v).firstOrNull ?? (e.message.isNotEmpty ? e.message : l.errorValidation),
    RateLimitedException() => e.aiLimitReached ? l.askLimitReached : l.errorRateLimited,
    ServerException() => l.errorServer,
    UnknownApiException() => e.message.isNotEmpty ? e.message : l.errorGeneric,
  };
}

class LoadingView extends StatelessWidget {
  const LoadingView({super.key});
  @override
  Widget build(BuildContext context) => Center(
        child: Semantics(
          label: AppL10n.of(context).loading,
          child: const CircularProgressIndicator(),
        ),
      );
}

class ErrorView extends StatelessWidget {
  const ErrorView({super.key, required this.error, this.onRetry});
  final Object? error;
  final VoidCallback? onRetry;
  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(Tokens.s6),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.error_outline, color: Tokens.danger, size: 40),
          const SizedBox(height: Tokens.s3),
          Text(errorMessage(l, error), textAlign: TextAlign.center),
          if (onRetry != null) ...[
            const SizedBox(height: Tokens.s4),
            OutlinedButton(onPressed: onRetry, child: Text(l.retry)),
          ],
        ]),
      ),
    );
  }
}

class EmptyView extends StatelessWidget {
  const EmptyView({super.key, required this.message, this.icon = Icons.inbox_outlined});
  final String message;
  final IconData icon;
  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.all(Tokens.s6),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Icon(icon, size: 40, color: Tokens.muted),
            const SizedBox(height: Tokens.s3),
            Text(message, textAlign: TextAlign.center),
          ]),
        ),
      );
}

/// Renders an [AsyncValue] with consistent loading/error states.
class AsyncBody<T> extends StatelessWidget {
  const AsyncBody({super.key, required this.value, required this.data, this.onRetry});
  final AsyncValue<T> value;
  final Widget Function(T data) data;
  final VoidCallback? onRetry;
  @override
  Widget build(BuildContext context) => value.when(
        data: data,
        loading: () => const LoadingView(),
        error: (e, _) => ErrorView(error: e, onRetry: onRetry),
      );
}

/// Inline message box (info / warning / danger / success) with icon AND colour (never colour alone).
enum NoticeKind { info, warning, danger, success }

class Notice extends StatelessWidget {
  const Notice({super.key, required this.text, this.kind = NoticeKind.info, this.title, this.trailing});
  final String text;
  final String? title;
  final NoticeKind kind;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final (bg, fg, icon) = switch (kind) {
      NoticeKind.info => (Tokens.infoSoft, Tokens.info, Icons.info_outline),
      NoticeKind.warning => (Tokens.warningSoft, Tokens.warning, Icons.warning_amber_rounded),
      NoticeKind.danger => (Tokens.dangerSoft, Tokens.danger, Icons.error_outline),
      NoticeKind.success => (Tokens.successSoft, Tokens.success, Icons.check_circle_outline),
    };
    // Warnings/errors are announced by screen readers when they appear (live region).
    return Semantics(
      liveRegion: kind == NoticeKind.danger || kind == NoticeKind.warning,
      container: true,
      child: Container(
      width: double.infinity,
      padding: const EdgeInsets.all(Tokens.s3),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(Tokens.radiusMd)),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Icon(icon, color: fg, size: 22),
        const SizedBox(width: Tokens.s3),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            if (title != null) Text(title!, style: Theme.of(context).textTheme.labelLarge?.copyWith(color: fg)),
            Text(text, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Tokens.ink), textDirection: null),
            ?trailing,
          ]),
        ),
      ]),
    ));
  }
}

class Pill extends StatelessWidget {
  const Pill({super.key, required this.text, this.bg = Tokens.sunken, this.fg = Tokens.inkSoft, this.icon});
  final String text;
  final Color bg;
  final Color fg;
  final IconData? icon;
  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: Tokens.s2, vertical: Tokens.s1),
        decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(Tokens.radiusSm)),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          if (icon != null) ...[Icon(icon, size: 14, color: fg), const SizedBox(width: Tokens.s1)],
          Flexible(child: Text(text, style: Theme.of(context).textTheme.bodySmall?.copyWith(color: fg, fontWeight: FontWeight.w600))),
        ]),
      );
}

/// `source{name,url,type,last_verified_at,freshness}` as sent by the API.
class SourceInfo {
  const SourceInfo({this.name, this.url, this.type, this.lastVerifiedAt, this.freshness});
  final String? name;
  final String? url;
  final String? type;
  final String? lastVerifiedAt;
  final String? freshness;

  static SourceInfo? fromJson(Object? j) {
    if (j is! Map) return null;
    return SourceInfo(
      name: j['name'] as String?,
      url: j['url'] as String?,
      type: j['type'] as String?,
      lastVerifiedAt: j['last_verified_at'] as String?,
      freshness: j['freshness'] as String?,
    );
  }
}

String sourceTypeLabel(AppL10n l, String? type) => switch (type) {
      'official' => l.sourceOfficial,
      'institutional' => l.sourceInstitutional,
      'verified_partner' => l.sourceVerifiedPartner,
      'third_party' => l.sourceThirdParty,
      _ => l.sourceThirdParty,
    };

class FreshnessBadge extends StatelessWidget {
  const FreshnessBadge({super.key, required this.freshness});
  final String? freshness;
  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    return switch (freshness) {
      'fresh' => Pill(text: l.freshFresh, bg: Tokens.successSoft, fg: Tokens.success, icon: Icons.check_circle_outline),
      'stale' => Pill(text: l.freshStale, bg: Tokens.warningSoft, fg: Tokens.warning, icon: Icons.schedule),
      'outdated' => Pill(text: l.freshOutdated, bg: Tokens.dangerSoft, fg: Tokens.danger, icon: Icons.warning_amber_rounded),
      _ => Pill(text: l.freshUnverified, bg: Tokens.warningSoft, fg: Tokens.warning, icon: Icons.help_outline),
    };
  }
}

/// Source name, type, last-verified date, freshness and a button opening the official URL externally.
class SourceBlock extends StatelessWidget {
  const SourceBlock({super.key, required this.source});
  final SourceInfo source;

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final canOpen = safeHttpsUri(source.url) != null;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(l.sourceLabel, style: Theme.of(context).textTheme.labelLarge),
      const SizedBox(height: Tokens.s1),
      Text(source.name ?? '—', textDirection: TextDirection.ltr),
      const SizedBox(height: Tokens.s2),
      Wrap(spacing: Tokens.s2, runSpacing: Tokens.s2, children: [
        Pill(text: sourceTypeLabel(l, source.type)),
        FreshnessBadge(freshness: source.freshness),
      ]),
      const SizedBox(height: Tokens.s2),
      Text(
        source.lastVerifiedAt == null ? l.neverVerified : l.lastVerified(formatDate(context, source.lastVerifiedAt)),
        style: Theme.of(context).textTheme.bodySmall,
      ),
      if (canOpen) ...[
        const SizedBox(height: Tokens.s2),
        Text(source.url!, style: Theme.of(context).textTheme.bodySmall, textDirection: TextDirection.ltr),
        const SizedBox(height: Tokens.s2),
        OutlinedButton.icon(
          onPressed: () => openUrlWithFeedback(context, source.url),
          icon: const Icon(Icons.open_in_new, size: 18),
          label: Text(l.openOfficialSite),
        ),
      ],
    ]);
  }
}

Future<void> openUrlWithFeedback(BuildContext context, String? url) async {
  final l = AppL10n.of(context);
  final messenger = ScaffoldMessenger.of(context);
  final unsafe = safeHttpsUri(url) == null;
  final ok = await openExternal(url);
  if (!ok) messenger.showSnackBar(SnackBar(content: Text(unsafe ? l.linkUnsafe : l.linkOpenFailed)));
}

void showSnack(BuildContext context, String text) =>
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(text)));

/// Circular score indicator with a text alternative.
class ScoreRing extends StatelessWidget {
  const ScoreRing({super.key, required this.percent, this.size = 96});
  final int? percent;
  final double size;
  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final p = percent;
    return Semantics(
      label: p == null ? l.scoreUnavailable : l.scoreSemantics(p.toString()),
      child: ExcludeSemantics(
        child: SizedBox(
          width: size,
          height: size,
          child: Stack(alignment: Alignment.center, children: [
            SizedBox.expand(
              child: CircularProgressIndicator(
                value: p == null ? 0 : p / 100,
                strokeWidth: 9,
                backgroundColor: Tokens.sunken,
                color: Tokens.primary,
              ),
            ),
            Text(p == null ? '—' : '${formatNumber(context, p)}%', style: Theme.of(context).textTheme.titleLarge),
          ]),
        ),
      ),
    );
  }
}
