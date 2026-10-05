import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/api_exception.dart';
import '../../core/routes.dart';
import '../../core/theme/app_theme.dart';
import '../../core/util/format.dart';
import '../../core/util/safe_url.dart';
import '../../core/widgets/common.dart';
import '../../l10n/app_localizations.dart';
import '../auth/auth_controller.dart';
import 'ask_controller.dart';
import 'ask_models.dart';

class AskScreen extends ConsumerStatefulWidget {
  const AskScreen({super.key});
  @override
  ConsumerState<AskScreen> createState() => _AskScreenState();
}

class _AskScreenState extends ConsumerState<AskScreen> {
  final _input = TextEditingController();
  final _scroll = ScrollController();

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(askControllerProvider.notifier).loadUsage());
  }

  @override
  void dispose() {
    _input.dispose();
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    final text = _input.text;
    if (text.trim().length < 2) return;
    _input.clear();
    await ref.read(askControllerProvider.notifier).send(text);
    if (_scroll.hasClients) {
      await Future<void>.delayed(const Duration(milliseconds: 50));
      if (_scroll.hasClients) _scroll.animateTo(_scroll.position.maxScrollExtent, duration: const Duration(milliseconds: 200), curve: Curves.easeOut);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final s = ref.watch(askControllerProvider);
    final verified = ref.watch(authControllerProvider).user?.emailVerified ?? true;
    final blocked = s.limitReached || !verified;
    return Scaffold(
      appBar: AppBar(title: Text(l.askTitle)),
      body: Column(children: [
        Expanded(
          child: ListView(controller: _scroll, padding: const EdgeInsets.all(Tokens.s4), children: [
            if (s.entries.isEmpty) Notice(text: l.askIntro),
            for (final e in s.entries) Padding(padding: const EdgeInsets.only(bottom: Tokens.s3), child: _entry(context, e)),
            if (s.busy) const Padding(padding: EdgeInsets.all(Tokens.s4), child: LoadingView()),
          ]),
        ),
        _usageBar(context, s, verified),
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(Tokens.s3, Tokens.s1, Tokens.s3, Tokens.s3),
            child: Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
              Expanded(
                child: TextField(
                  key: const ValueKey('ask-input'),
                  controller: _input,
                  enabled: !blocked,
                  minLines: 1,
                  maxLines: 4,
                  maxLength: 1000,
                  textDirection: null,
                  decoration: InputDecoration(hintText: l.askHint, counterText: ''),
                  onSubmitted: (_) => _send(),
                ),
              ),
              const SizedBox(width: Tokens.s2),
              IconButton.filled(key: const ValueKey('ask-send'), tooltip: l.askSend, onPressed: (blocked || s.busy) ? null : _send, icon: const Icon(Icons.send)),
            ]),
          ),
        ),
      ]),
    );
  }

  Widget _usageBar(BuildContext context, AskState s, bool verified) {
    final l = AppL10n.of(context);
    final texts = <Widget>[];
    if (!verified) {
      texts.add(Notice(text: l.askVerifyEmail, kind: NoticeKind.warning, trailing: TextButton(onPressed: () => context.push('/verify'), child: Text(l.resendVerification))));
    }
    if (s.limitReached) {
      texts.add(Notice(text: '${l.askLimitReached}${s.resetsAt != null ? ' ${l.askResets(formatDate(context, s.resetsAt))}' : ''}', kind: NoticeKind.warning));
    } else if (s.remaining != null) {
      texts.add(Text(l.askUsage(formatNumber(context, s.remaining!)), style: Theme.of(context).textTheme.bodySmall));
      if (s.resetsAt != null) texts.add(Text(l.askResets(formatDate(context, s.resetsAt)), style: Theme.of(context).textTheme.bodySmall));
    }
    if (texts.isEmpty) return const SizedBox.shrink();
    return Padding(padding: const EdgeInsets.symmetric(horizontal: Tokens.s4), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: texts));
  }

  Widget _entry(BuildContext context, ChatEntry e) {
    final l = AppL10n.of(context);
    return switch (e) {
      UserEntry() => Align(
          alignment: AlignmentDirectional.centerEnd,
          child: Container(
            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.85),
            padding: const EdgeInsets.all(Tokens.s3),
            decoration: BoxDecoration(color: Tokens.primarySoft, borderRadius: BorderRadius.circular(Tokens.radiusMd)),
            // Rendered as plain text; direction follows the user's own script.
            child: Text(e.text, textDirection: _autoDir(e.text)),
          ),
        ),
      AssistantEntry() => AskMessageView(message: e.message),
      FailureEntry() => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Notice(
            text: switch (e.error) {
              ForbiddenException(emailNotVerified: true) => l.askVerifyEmail,
              RateLimitedException(aiLimitReached: true) => l.askLimitReached,
              RateLimitedException() => l.errorRateLimited,
              _ => l.askFailed,
            },
            kind: NoticeKind.danger,
          ),
          TextButton.icon(onPressed: () => context.push('/guides'), icon: const Icon(Icons.menu_book_outlined), label: Text(l.askBrowseGuides)),
        ]),
    };
  }
}

TextDirection _autoDir(String text) {
  for (final r in text.runes) {
    if ((r >= 0x0590 && r <= 0x08FF) || (r >= 0xFB1D && r <= 0xFEFF)) return TextDirection.rtl;
    if ((r >= 0x41 && r <= 0x5A) || (r >= 0x61 && r <= 0x7A)) return TextDirection.ltr;
  }
  return TextDirection.ltr;
}

/// One assistant answer: label badge (colour + icon + text), content, degraded notice, numbered sources
/// with verification metadata, suggested actions, and the disclaimer as its own notice.
/// Text is rendered as plain Text (no HTML/Markdown interpretation). Nothing here is generated client-side.
class AskMessageView extends StatelessWidget {
  const AskMessageView({super.key, required this.message});
  final AskMessage message;

  ({Color bg, Color fg, IconData icon, String text}) _label(AppL10n l) => switch (message.label) {
        'official' => (bg: Tokens.successSoft, fg: Tokens.success, icon: Icons.verified_user_outlined, text: message.labelText ?? l.askLabelOfficial),
        'general_guidance' => (bg: Tokens.infoSoft, fg: Tokens.info, icon: Icons.info_outline, text: message.labelText ?? l.askLabelGeneral),
        'ai_explanation' => (bg: Tokens.accentSoft, fg: Tokens.accentStrong, icon: Icons.auto_awesome, text: message.labelText ?? l.askLabelAi),
        _ => (bg: Tokens.warningSoft, fg: Tokens.warning, icon: Icons.warning_amber_rounded, text: message.labelText ?? l.askLabelThird),
      };

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(Tokens.s4),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          if (message.label != null)
            Builder(builder: (_) {
              final lab = _label(l);
              return Pill(key: const ValueKey('ask-label'), text: lab.text, bg: lab.bg, fg: lab.fg, icon: lab.icon);
            }),
          const SizedBox(height: Tokens.s2),
          Text(message.content, key: const ValueKey('ask-content'), textDirection: _autoDir(message.content)),
          if (message.degraded) ...[const SizedBox(height: Tokens.s3), Notice(key: const ValueKey('ask-degraded'), text: l.askDegraded, kind: NoticeKind.warning)],
          const SizedBox(height: Tokens.s3),
          Text(l.askSourcesTitle, style: theme.textTheme.labelLarge),
          if (message.sources.isEmpty) Text(l.askNoSources, key: const ValueKey('ask-no-sources'), style: theme.textTheme.bodySmall),
          for (final s in message.sources)
            Padding(
              padding: const EdgeInsets.only(top: Tokens.s2),
              child: Container(
                padding: const EdgeInsets.all(Tokens.s3),
                decoration: BoxDecoration(color: Tokens.canvas, borderRadius: BorderRadius.circular(Tokens.radiusSm)),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('[${s.n}] ${s.title}', style: theme.textTheme.labelLarge),
                  if (s.source != null) ...[
                    if (s.source!.name != null) Text(s.source!.name!, style: theme.textTheme.bodySmall, textDirection: TextDirection.ltr),
                    const SizedBox(height: Tokens.s1),
                    Wrap(spacing: Tokens.s2, runSpacing: Tokens.s1, children: [
                      Pill(text: sourceTypeLabel(l, s.source!.type)),
                      FreshnessBadge(freshness: s.source!.freshness),
                    ]),
                    Text(s.source!.lastVerifiedAt == null ? l.neverVerified : l.lastVerified(formatDate(context, s.source!.lastVerifiedAt)), style: theme.textTheme.bodySmall),
                    if (safeHttpsUri(s.source!.url) != null)
                      TextButton.icon(onPressed: () => openUrlWithFeedback(context, s.source!.url), icon: const Icon(Icons.open_in_new, size: 18), label: Text(l.openOfficialSite)),
                  ],
                ]),
              ),
            ),
          if (message.disclaimer != null) ...[
            const SizedBox(height: Tokens.s3),
            Notice(key: const ValueKey('ask-disclaimer'), title: l.askNoticeTitle, text: message.disclaimer!, kind: NoticeKind.warning),
          ],
          ..._actions(context, l),
        ]),
      ),
    );
  }

  List<Widget> _actions(BuildContext context, AppL10n l) {
    final mapped = [
      for (final a in message.actions)
        if (routeForTarget(a.type, a.target) case final route?) (a, route),
    ];
    if (mapped.isEmpty) return const [];
    return [
      const SizedBox(height: Tokens.s3),
      Text(l.askSuggested, style: Theme.of(context).textTheme.labelLarge),
      Wrap(spacing: Tokens.s2, children: [for (final (a, route) in mapped) ActionChip(label: Text(a.label), onPressed: () => context.push(route))]),
    ];
  }
}
