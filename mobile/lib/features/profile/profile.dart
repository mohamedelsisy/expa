import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:share_plus/share_plus.dart';

import '../../core/push/push_registrar.dart';
import '../../core/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/common.dart';
import '../../core/widgets/language_switcher.dart';
import '../../l10n/app_localizations.dart';
import '../auth/auth_controller.dart';
import '../dashboard/dashboard.dart';
import '../documents/documents.dart' show grantConsent;

/// Hands text to the OS share sheet. The user picks the destination, so nothing is written to disk silently.
/// Replaced in tests.
typedef ShareText = Future<void> Function(String text, {String? subject});
final shareTextProvider = Provider<ShareText>((ref) => (text, {subject}) async {
      await SharePlus.instance.share(ShareParams(text: text, subject: subject));
    });

final pushEnabledProvider = FutureProvider.autoDispose<bool>((ref) => ref.watch(sessionStoreProvider).readPushEnabled());

/// Push opt-in: localized rationale first, then the OS prompt, then `POST /devices` (needs the
/// `push_notifications` consent; the consent_required error offers a one-tap grant).
class PushSettingsCard extends ConsumerStatefulWidget {
  const PushSettingsCard({super.key});
  @override
  ConsumerState<PushSettingsCard> createState() => _PushSettingsState();
}

class _PushSettingsState extends ConsumerState<PushSettingsCard> {
  bool _busy = false;
  PushEnableResult? _result;

  Future<void> _toggle(bool on) async {
    final l = AppL10n.of(context);
    final registrar = ref.read(pushRegistrarProvider);
    if (!on) {
      setState(() => _busy = true);
      await registrar.disable();
      ref.invalidate(pushEnabledProvider);
      if (mounted) {
        setState(() {
          _busy = false;
          _result = null;
        });
      }
      return;
    }
    final ok = await showDialog<bool>(
      context: context,
      builder: (c) => AlertDialog(
        title: Text(l.pushRationaleTitle),
        content: Text(l.pushRationaleBody),
        actions: [
          TextButton(onPressed: () => Navigator.of(c).pop(false), child: Text(l.cancel)),
          FilledButton(key: const ValueKey('push-allow'), onPressed: () => Navigator.of(c).pop(true), child: Text(l.pushAllow)),
        ],
      ),
    );
    if (ok != true || !mounted) return;
    setState(() => _busy = true);
    final r = await registrar.enable();
    ref.invalidate(pushEnabledProvider);
    if (mounted) {
      setState(() {
        _busy = false;
        _result = r;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final service = ref.watch(pushServiceProvider);
    if (!service.isAvailable) return Notice(text: l.pushNote);
    final enabled = ref.watch(pushEnabledProvider).valueOrNull ?? false;
    final msg = switch (_result) {
      PushEnableResult.permissionDenied => (l.pushDenied, NoticeKind.warning),
      PushEnableResult.failed => (l.pushFailed, NoticeKind.danger),
      PushEnableResult.unavailable => (l.pushNote, NoticeKind.info),
      PushEnableResult.enabled => (l.pushEnabledNote, NoticeKind.success),
      _ => null,
    };
    return Column(children: [
      Card(
        child: SwitchListTile(
          key: const ValueKey('push-switch'),
          title: Text(l.pushTitle),
          subtitle: Text(l.pushSubtitle),
          value: enabled,
          onChanged: _busy ? null : _toggle,
        ),
      ),
      if (_result == PushEnableResult.consentRequired)
        Notice(
          text: l.consentRequired,
          kind: NoticeKind.warning,
          trailing: TextButton(
            onPressed: () async {
              try {
                await grantConsent(ref, 'push_notifications');
                await _toggleAfterConsent();
              } catch (e) {
                if (context.mounted) showSnack(context, errorMessage(l, e));
              }
            },
            child: Text(l.grantConsent),
          ),
        ),
      if (msg != null) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Notice(text: msg.$1, kind: msg.$2)),
    ]);
  }

  Future<void> _toggleAfterConsent() async {
    setState(() => _busy = true);
    final r = await ref.read(pushRegistrarProvider).enable();
    ref.invalidate(pushEnabledProvider);
    if (mounted) {
      setState(() {
        _busy = false;
        _result = r;
      });
    }
  }
}

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppL10n.of(context);
    final user = ref.watch(authControllerProvider).user;
    return Scaffold(
      appBar: AppBar(title: Text(l.profileTitle)),
      body: ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
        Card(
          child: ListTile(
            leading: const CircleAvatar(child: Icon(Icons.person_outline)),
            title: Text(user?.name ?? ''),
            subtitle: Text(user?.email ?? '', textDirection: TextDirection.ltr),
          ),
        ),
        const SizedBox(height: Tokens.s3),
        Card(child: ListTile(leading: const Icon(Icons.tune), title: Text(l.profileOnboarding), trailing: const Icon(Icons.chevron_right), onTap: () => context.push('/onboarding'))),
        const SizedBox(height: Tokens.s2),
        Card(child: ListTile(leading: const Icon(Icons.shield_outlined), title: Text(l.profilePrivacy), trailing: const Icon(Icons.chevron_right), onTap: () => context.push('/privacy'))),
        Card(child: ListTile(key: const ValueKey('profile-legal'), leading: const Icon(Icons.gavel_outlined), title: Text(l.legalTitle), trailing: const Icon(Icons.chevron_right), onTap: () => context.push('/legal'))),
        const SizedBox(height: Tokens.s2),
        Card(child: ListTile(leading: const Icon(Icons.notifications_none), title: Text(l.notificationsTitle), trailing: const Icon(Icons.chevron_right), onTap: () => context.push('/notifications'))),
        const SizedBox(height: Tokens.s2),
        Card(child: ListTile(leading: const Icon(Icons.bookmark_border), title: Text(l.savedTitle), trailing: const Icon(Icons.chevron_right), onTap: () => context.push('/saved'))),
        const SizedBox(height: Tokens.s2),
        Card(child: ListTile(leading: const Icon(Icons.history), title: Text(l.askHistoryTitle), trailing: const Icon(Icons.chevron_right), onTap: () => context.push('/ai/history'))),
        const SizedBox(height: Tokens.s4),
        Text(l.language, style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: Tokens.s2),
        const LanguageSwitcher(),
        const SizedBox(height: Tokens.s4),
        const PushSettingsCard(),
        const SizedBox(height: Tokens.s4),
        OutlinedButton.icon(
          key: const ValueKey('logout'),
          onPressed: () async {
            final ok = await showDialog<bool>(
              context: context,
              builder: (c) => AlertDialog(
                title: Text(l.logoutConfirmTitle),
                content: Text(l.logoutConfirmBody),
                actions: [
                  TextButton(onPressed: () => Navigator.of(c).pop(false), child: Text(l.cancel)),
                  FilledButton(key: const ValueKey('logout-confirm'), onPressed: () => Navigator.of(c).pop(true), child: Text(l.logout)),
                ],
              ),
            );
            if (ok == true) await ref.read(authControllerProvider.notifier).logout();
          },
          icon: const Icon(Icons.logout),
          label: Text(l.logout),
        ),
      ]),
    );
  }
}

final consentsProvider = FutureProvider.autoDispose<({List<Map<String, dynamic>> purposes, Map<String, dynamic> current})>((ref) async {
  ref.watch(localeProvider);
  final api = ref.watch(apiClientProvider);
  final p = await api.get('/privacy/purposes');
  final c = await api.get('/profile/consents');
  return (
    purposes: [for (final e in (p.map['purposes'] as List? ?? const [])) if (e is Map) Map<String, dynamic>.from(e)],
    current: Map<String, dynamic>.from((c.map['consents'] as Map?) ?? const {}),
  );
});

class PrivacyScreen extends ConsumerStatefulWidget {
  const PrivacyScreen({super.key});
  @override
  ConsumerState<PrivacyScreen> createState() => _PrivacyState();
}

class _PrivacyState extends ConsumerState<PrivacyScreen> {
  final _password = TextEditingController();
  bool _busy = false;
  Map<String, dynamic>? _exportData; // held in memory only; dropped with the screen
  Object? _error;

  @override
  void dispose() {
    _password.dispose();
    super.dispose();
  }

  Future<void> _toggle(String key, bool value) async {
    final l = AppL10n.of(context);
    try {
      await ref.read(apiClientProvider).put('/profile/consents', body: {'consents': {key: value}});
      if (key == 'analytics') ref.read(analyticsConsentProvider.notifier).state = value;
      ref.invalidate(consentsProvider);
      ref.invalidate(dashboardProvider);
    } catch (e) {
      if (mounted) showSnack(context, errorMessage(l, e));
    }
  }

  Future<void> _export() async {
    setState(() {
      _busy = true;
      _error = null;
      _exportData = null;
    });
    try {
      final r = await ref.read(apiClientProvider).get('/profile/export');
      // Never written to disk by the app: the user decides where it goes via the share sheet (_shareExport).
      if (mounted) setState(() => _exportData = r.map);
    } catch (e) {
      if (mounted) setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _shareExport() async {
    final l = AppL10n.of(context);
    final data = _exportData;
    if (data == null) return;
    final ok = await showDialog<bool>(
      context: context,
      builder: (c) => AlertDialog(
        title: Text(l.exportShareConfirmTitle),
        content: Text(l.exportShareConfirmBody),
        actions: [
          TextButton(onPressed: () => Navigator.of(c).pop(false), child: Text(l.cancel)),
          FilledButton(key: const ValueKey('export-share-confirm'), onPressed: () => Navigator.of(c).pop(true), child: Text(l.exportShare)),
        ],
      ),
    );
    if (ok != true) return;
    try {
      await ref.read(shareTextProvider)(const JsonEncoder.withIndent('  ').convert(data), subject: 'EXPA data export');
    } catch (_) {
      if (mounted) showSnack(context, l.errorGeneric);
    }
  }

  Future<void> _delete() async {
    final l = AppL10n.of(context);
    if (_password.text.isEmpty) {
      setState(() => _error = null);
      showSnack(context, l.fieldRequired);
      return;
    }
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (c) => AlertDialog(
        title: Text(l.deleteAccountTitle),
        content: Text(l.deleteConfirmBody),
        actions: [
          TextButton(onPressed: () => Navigator.of(c).pop(false), child: Text(l.cancel)),
          FilledButton(key: const ValueKey('delete-confirm'), style: FilledButton.styleFrom(backgroundColor: Tokens.danger, foregroundColor: Tokens.onPrimary), onPressed: () => Navigator.of(c).pop(true), child: Text(l.deleteAccountConfirm)),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await ref.read(apiClientProvider).delete('/profile', body: {'password': _password.text});
      _password.clear();
      if (mounted) {
        showSnack(context, l.deleteRequested);
        await ref.read(authControllerProvider.notifier).logout();
      }
    } catch (e) {
      if (mounted) setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final consents = ref.watch(consentsProvider);
    return Scaffold(
      appBar: AppBar(title: Text(l.privacyTitle)),
      body: ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
        Text(l.consentsTitle, style: Theme.of(context).textTheme.titleMedium),
        Text(l.consentsHint, style: Theme.of(context).textTheme.bodySmall),
        Wrap(children: [
          TextButton(key: const ValueKey('consent-read-privacy'), onPressed: () => context.push('/legal/privacy'), child: Text(l.legalReadPrivacy)),
          TextButton(key: const ValueKey('consent-read-terms'), onPressed: () => context.push('/legal/terms'), child: Text(l.legalReadTerms)),
        ]),
        const SizedBox(height: Tokens.s2),
        AsyncBody<({List<Map<String, dynamic>> purposes, Map<String, dynamic> current})>(
          value: consents,
          onRetry: () => ref.invalidate(consentsProvider),
          data: (d) => Column(children: [
            for (final p in d.purposes)
              Card(
                child: SwitchListTile(
                  title: Text('${p['title']}'),
                  subtitle: Text('${p['why']}${p['required'] == true ? '\n${l.consentRequiredBadge}' : ''}'),
                  isThreeLine: true,
                  value: (d.current['${p['key']}'] as Map?)?['granted'] == true,
                  // Required purposes (terms, privacy) cannot be withdrawn without deleting the account.
                  onChanged: p['required'] == true ? null : (v) => _toggle('${p['key']}', v),
                ),
              ),
          ]),
        ),
        const Divider(height: Tokens.s8),
        Text(l.exportTitle, style: Theme.of(context).textTheme.titleMedium),
        Text(l.exportBody),
        const SizedBox(height: Tokens.s2),
        OutlinedButton(onPressed: _busy ? null : _export, child: Text(l.exportRequest)),
        if (_exportData != null) ...[
          const SizedBox(height: Tokens.s2),
          Notice(key: const ValueKey('export-summary'), text: l.exportDone(_exportData!.length.toString()), kind: NoticeKind.success),
          for (final e in _exportData!.entries)
            Text('• ${e.key}${e.value is List ? ' (${(e.value as List).length})' : ''}', textDirection: TextDirection.ltr, style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: Tokens.s2),
          FilledButton.icon(key: const ValueKey('export-share'), onPressed: _shareExport, icon: const Icon(Icons.ios_share), label: Text(l.exportShare)),
        ],
        const Divider(height: Tokens.s8),
        Text(l.deleteAccountTitle, style: Theme.of(context).textTheme.titleMedium?.copyWith(color: Tokens.danger)),
        Text(l.deleteAccountBody),
        const SizedBox(height: Tokens.s2),
        TextField(key: const ValueKey('delete-password'), controller: _password, obscureText: true, autofillHints: const [AutofillHints.password], textDirection: TextDirection.ltr, decoration: InputDecoration(labelText: l.password)),
        const SizedBox(height: Tokens.s2),
        FilledButton(
          style: FilledButton.styleFrom(backgroundColor: Tokens.danger, foregroundColor: Tokens.onPrimary),
          onPressed: _busy ? null : _delete,
          child: Text(l.deleteAccountConfirm),
        ),
        if (_error != null) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Notice(text: errorMessage(l, _error), kind: NoticeKind.danger)),
      ]),
    );
  }
}
