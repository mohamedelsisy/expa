import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../../core/api/api_exception.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/common.dart';
import '../../l10n/app_localizations.dart';
import 'auth_controller.dart';
import 'auth_screens.dart';
import 'two_factor.dart';

/// Second login step. The code is never logged or kept beyond the text field; the challenge token lives in
/// [AuthState.challenge] (memory only).
class TwoFactorChallengeScreen extends ConsumerStatefulWidget {
  const TwoFactorChallengeScreen({super.key});
  @override
  ConsumerState<TwoFactorChallengeScreen> createState() => _ChallengeState();
}

class _ChallengeState extends ConsumerState<TwoFactorChallengeScreen> {
  final _form = GlobalKey<FormState>();
  final _code = TextEditingController();
  bool _recovery = false;
  bool _expired = false;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    final c = ref.read(authControllerProvider).challenge;
    if (c != null) _timer = Timer(c.expiresIn, () => mounted ? setState(() => _expired = true) : null);
  }

  @override
  void dispose() {
    _timer?.cancel();
    _code.dispose();
    super.dispose();
  }

  void _backToLogin() {
    ref.read(authControllerProvider.notifier)
      ..clearError()
      ..cancelTwoFactor();
    context.go('/login');
  }

  Future<void> _submit() async {
    if (_expired || !_form.currentState!.validate()) return;
    final v = _code.text.replaceAll(RegExp(r'\s'), '');
    await ref.read(authControllerProvider.notifier).completeTwoFactor(code: _recovery ? null : v, recoveryCode: _recovery ? v : null);
  }

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final auth = ref.watch(authControllerProvider);
    final notifier = ref.read(authControllerProvider.notifier);
    // invalid_challenge (or a cancelled challenge) -> back to the login form, which shows the error.
    ref.listen<TwoFactorChallenge?>(authControllerProvider.select((s) => s.challenge), (prev, next) {
      if (prev != null && next == null && ref.read(authControllerProvider).status != AuthStatus.authenticated) context.go('/login');
    });
    return PopScope(
      onPopInvokedWithResult: (didPop, _) {
        // Deferred: the pop can happen while the tree is rebuilding (e.g. after context.go).
        if (didPop) Future.microtask(notifier.cancelTwoFactor);
      },
      child: AuthScaffold(
        title: l.tfChallengeTitle,
        subtitle: _recovery ? l.tfRecoveryHint : l.tfChallengeSubtitle,
        children: [
          if (_expired) ...[Notice(key: const ValueKey('tf-expired'), text: l.tfChallengeExpired, kind: NoticeKind.warning), const SizedBox(height: Tokens.s3)],
          if (auth.error != null && !_expired) ...[Notice(key: const ValueKey('tf-error'), text: errorMessage(l, auth.error), kind: NoticeKind.danger), const SizedBox(height: Tokens.s3)],
          Form(
            key: _form,
            child: TextFormField(
              key: ValueKey(_recovery ? 'tf-recovery' : 'tf-code'),
              controller: _code,
              autofocus: true,
              enableSuggestions: false,
              autocorrect: false,
              keyboardType: _recovery ? TextInputType.visiblePassword : TextInputType.number,
              autofillHints: _recovery ? null : const [AutofillHints.oneTimeCode],
              inputFormatters: _recovery ? [LengthLimitingTextInputFormatter(11)] : [FilteringTextInputFormatter.allow(RegExp(r'[0-9 ]')), LengthLimitingTextInputFormatter(7)],
              textDirection: TextDirection.ltr,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(letterSpacing: 4),
              decoration: InputDecoration(labelText: _recovery ? l.tfRecoveryLabel : l.tfCodeLabel),
              validator: (v) {
                final t = (v ?? '').replaceAll(RegExp(r'\s'), '');
                if (t.isEmpty) return l.fieldRequired;
                if (!_recovery && !RegExp(r'^\d{6}$').hasMatch(t)) return l.tfCodeInvalid;
                return null;
              },
              onFieldSubmitted: (_) => _submit(),
            ),
          ),
          const SizedBox(height: Tokens.s4),
          FilledButton(
            key: const ValueKey('tf-submit'),
            onPressed: auth.busy || _expired ? null : _submit,
            child: auth.busy ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2)) : Text(l.tfVerify),
          ),
          TextButton(
            key: const ValueKey('tf-toggle'),
            onPressed: () => setState(() {
              _recovery = !_recovery;
              _code.clear();
              ref.read(authControllerProvider.notifier).clearError();
            }),
            child: Text(_recovery ? l.tfUseApp : l.tfUseRecovery, textAlign: TextAlign.center),
          ),
          TextButton(key: const ValueKey('tf-back'), onPressed: _backToLogin, child: Text(l.tfBackToLogin, textAlign: TextAlign.center)),
        ],
      ),
    );
  }
}

enum _Phase { loading, error, overview, setup, codes }

/// Profile -> Security: status, setup (secret + QR + confirm), recovery codes, disable.
class SecurityScreen extends ConsumerStatefulWidget {
  const SecurityScreen({super.key});
  @override
  ConsumerState<SecurityScreen> createState() => _SecurityState();
}

class _SecurityState extends ConsumerState<SecurityScreen> {
  _Phase _phase = _Phase.loading;
  TwoFactorStatus _status = const TwoFactorStatus();
  TwoFactorSetup? _setup;
  List<String> _codes = const [];
  Object? _error;
  bool _busy = false;
  String? _flash;
  final _code = TextEditingController();

  TwoFactorRepository get _repo => ref.read(twoFactorRepositoryProvider);

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _code.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _phase = _Phase.loading;
      _error = null;
    });
    try {
      final s = await _repo.status();
      if (mounted) {
        setState(() {
          _status = s;
          _phase = _Phase.overview;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e;
          _phase = _Phase.error;
        });
      }
    }
  }

  Future<void> _run(Future<void> Function() body) async {
    setState(() {
      _busy = true;
      _error = null;
      _flash = null;
    });
    try {
      await body();
    } catch (e) {
      if (mounted) setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _start() => _run(() async {
        final s = await _repo.setup();
        if (mounted) {
          _code.clear();
          setState(() {
            _setup = s;
            _phase = _Phase.setup;
          });
        }
      });

  Future<void> _confirm() => _run(() async {
        final t = _code.text.replaceAll(RegExp(r'\s'), '');
        if (!RegExp(r'^\d{6}$').hasMatch(t)) throw const _LocalInvalidCode();
        final codes = await _repo.confirm(t);
        _code.clear();
        if (!mounted) return;
        setState(() {
          _codes = codes;
          _setup = null;
          _phase = _Phase.codes;
        });
        unawaited(ref.read(authControllerProvider.notifier).refreshUser());
      });

  Future<void> _copy(String text) async {
    try {
      await Clipboard.setData(ClipboardData(text: text));
      if (mounted) setState(() => _flash = AppL10n.of(context).tfCopied);
    } catch (_) {
      // clipboard unavailable: the secret stays selectable on screen
    }
  }

  Future<void> _proofDialog({required bool regenerate}) async {
    final done = await showDialog<bool>(
      context: context,
      builder: (_) => _ProofDialog(
        regenerate: regenerate,
        submit: (password, code, recovery) async {
          try {
            if (regenerate) {
              final codes = await _repo.regenerateRecoveryCodes(password: password, code: code, recoveryCode: recovery);
              if (mounted) {
                setState(() {
                  _codes = codes;
                  _phase = _Phase.codes;
                });
              }
            } else {
              await _repo.disable(password: password, code: code, recoveryCode: recovery);
            }
            return null;
          } catch (e) {
            return e;
          }
        },
      ),
    );
    if (done == true && !regenerate && mounted) {
      final l = AppL10n.of(context);
      unawaited(ref.read(authControllerProvider.notifier).refreshUser());
      await _load();
      if (mounted) setState(() => _flash = l.tfDisabledDone);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(l.tfSecurityTitle)),
      body: switch (_phase) {
        _Phase.loading => const LoadingView(),
        _Phase.error => ErrorView(error: _error, onRetry: _load),
        _ => ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
            if (_error != null) ...[Notice(key: const ValueKey('sec-error'), text: _error is _LocalInvalidCode ? l.tfCodeInvalid : errorMessage(l, _error), kind: NoticeKind.danger), const SizedBox(height: Tokens.s3)],
            if (_flash != null) ...[Notice(key: const ValueKey('sec-flash'), text: _flash!, kind: NoticeKind.success), const SizedBox(height: Tokens.s3)],
            ...switch (_phase) { _Phase.setup => _setupView(context, l), _Phase.codes => _codesView(context, l), _ => _overview(context, l) },
          ]),
      },
    );
  }

  Widget _spinner() => const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2));

  List<Widget> _overview(BuildContext context, AppL10n l) {
    final s = _status;
    return [
      Notice(key: const ValueKey('sec-status'), text: s.enabled ? l.tfStatusOn : l.tfStatusOff, kind: s.enabled ? NoticeKind.success : NoticeKind.info),
      const SizedBox(height: Tokens.s3),
      if (s.required || s.setupRequired) ...[Notice(text: l.tfRequiredNotice, kind: NoticeKind.warning), const SizedBox(height: Tokens.s3)],
      Text(l.tfIntro),
      if (s.enabled) ...[
        const SizedBox(height: Tokens.s2),
        Text(l.tfRecoveryRemaining(s.recoveryCodesRemaining.toString()), key: const ValueKey('sec-remaining')),
        const SizedBox(height: Tokens.s4),
        OutlinedButton(key: const ValueKey('sec-regenerate'), onPressed: _busy ? null : () => _proofDialog(regenerate: true), child: Text(l.tfRegenerate, textAlign: TextAlign.center)),
        const SizedBox(height: Tokens.s2),
        OutlinedButton(
          key: const ValueKey('sec-disable'),
          style: OutlinedButton.styleFrom(foregroundColor: Tokens.danger),
          onPressed: _busy ? null : () => _proofDialog(regenerate: false),
          child: Text(l.tfDisable, textAlign: TextAlign.center),
        ),
      ] else ...[
        const SizedBox(height: Tokens.s4),
        FilledButton(key: const ValueKey('sec-enable'), onPressed: _busy ? null : _start, child: _busy ? _spinner() : Text(l.tfEnable, textAlign: TextAlign.center)),
      ],
    ];
  }

  List<Widget> _setupView(BuildContext context, AppL10n l) {
    final s = _setup!;
    final theme = Theme.of(context);
    return [
      Text(l.tfSetupStep1),
      const SizedBox(height: Tokens.s3),
      Center(
        child: Semantics(
          label: l.tfQrLabel,
          image: true,
          child: Container(
            color: Colors.white, // a QR code needs a light quiet zone even in dark mode
            padding: const EdgeInsets.all(Tokens.s2),
            child: QrImageView(key: const ValueKey('sec-qr'), data: s.otpauthUri, size: 168, backgroundColor: Colors.white),
          ),
        ),
      ),
      const SizedBox(height: Tokens.s3),
      Text(l.tfSecretLabel, style: theme.textTheme.labelLarge),
      SelectableText(s.secret, key: const ValueKey('sec-secret'), textDirection: TextDirection.ltr, style: theme.textTheme.titleMedium?.copyWith(fontFamily: 'monospace', letterSpacing: 1)),
      const SizedBox(height: Tokens.s2),
      Wrap(spacing: Tokens.s2, runSpacing: Tokens.s2, children: [
        OutlinedButton.icon(key: const ValueKey('sec-copy-secret'), onPressed: () => _copy(s.secret), icon: const Icon(Icons.copy, size: 18), label: Text(l.tfCopySecret)),
        OutlinedButton.icon(key: const ValueKey('sec-copy-uri'), onPressed: () => _copy(s.otpauthUri), icon: const Icon(Icons.link, size: 18), label: Text(l.tfCopyUri)),
      ]),
      const SizedBox(height: Tokens.s4),
      Text(l.tfSetupStep2),
      const SizedBox(height: Tokens.s2),
      TextField(
        key: const ValueKey('sec-confirm-code'),
        controller: _code,
        keyboardType: TextInputType.number,
        autofillHints: const [AutofillHints.oneTimeCode],
        inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[0-9 ]')), LengthLimitingTextInputFormatter(7)],
        textDirection: TextDirection.ltr,
        decoration: InputDecoration(labelText: l.tfCodeLabel),
        onSubmitted: (_) => _confirm(),
      ),
      const SizedBox(height: Tokens.s3),
      FilledButton(key: const ValueKey('sec-confirm'), onPressed: _busy ? null : _confirm, child: _busy ? _spinner() : Text(l.tfConfirm)),
      TextButton(
        key: const ValueKey('sec-cancel-setup'),
        onPressed: _busy
            ? null
            : () => setState(() {
                  _setup = null;
                  _error = null;
                  _phase = _Phase.overview;
                }),
        child: Text(l.tfCancelSetup),
      ),
    ];
  }

  List<Widget> _codesView(BuildContext context, AppL10n l) {
    final theme = Theme.of(context);
    return [
      Text(l.tfCodesTitle, style: theme.textTheme.titleLarge),
      const SizedBox(height: Tokens.s2),
      Notice(key: const ValueKey('sec-codes-warning'), text: l.tfCodesWarning, kind: NoticeKind.warning),
      const SizedBox(height: Tokens.s3),
      Wrap(spacing: Tokens.s4, runSpacing: Tokens.s2, children: [
        for (final c in _codes) SelectableText(c, textDirection: TextDirection.ltr, style: theme.textTheme.titleMedium?.copyWith(fontFamily: 'monospace')),
      ]),
      const SizedBox(height: Tokens.s3),
      OutlinedButton.icon(key: const ValueKey('sec-copy-codes'), onPressed: () => _copy(_codes.join('\n')), icon: const Icon(Icons.copy, size: 18), label: Text(l.tfCopyCodes)),
      const SizedBox(height: Tokens.s2),
      FilledButton(
        key: const ValueKey('sec-codes-saved'),
        onPressed: () {
          setState(() => _codes = const []); // gone from memory once acknowledged
          _load();
        },
        child: Text(l.tfCodesSaved),
      ),
    ];
  }
}

class _LocalInvalidCode implements Exception {
  const _LocalInvalidCode();
}

/// Password + (app code | recovery code), used to disable 2FA and to regenerate recovery codes.
class _ProofDialog extends StatefulWidget {
  const _ProofDialog({required this.regenerate, required this.submit});
  final bool regenerate;
  final Future<Object?> Function(String password, String? code, String? recovery) submit;
  @override
  State<_ProofDialog> createState() => _ProofDialogState();
}

class _ProofDialogState extends State<_ProofDialog> {
  final _password = TextEditingController();
  final _code = TextEditingController();
  bool _recovery = false, _busy = false;
  Object? _error;

  @override
  void dispose() {
    _password.dispose();
    _code.dispose();
    super.dispose();
  }

  Future<void> _go() async {
    final l = AppL10n.of(context);
    final v = _code.text.replaceAll(RegExp(r'\s'), '');
    if (_password.text.isEmpty || v.isEmpty || (!_recovery && !RegExp(r'^\d{6}$').hasMatch(v))) {
      setState(() => _error = _password.text.isEmpty || v.isEmpty ? l.fieldRequired : l.tfCodeInvalid);
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    final e = await widget.submit(_password.text, _recovery ? null : v, _recovery ? v : null);
    if (!mounted) return;
    if (e == null) {
      Navigator.of(context).pop(true);
    } else {
      setState(() {
        _busy = false;
        _error = e;
      });
    }
  }

  String _message(AppL10n l) {
    final e = _error;
    if (e is String) return e;
    // `validation_failed` on `password` -> wrong password.
    if (e is ValidationException && e.code != 'invalid_two_factor_code' && e.details.containsKey('password')) return l.tfPasswordWrong;
    return errorMessage(l, e);
  }

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    return AlertDialog(
      title: Text(widget.regenerate ? l.tfRegenerate : l.tfDisable),
      scrollable: true,
      content: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Text(l.tfConfirmIdentity),
        if (widget.regenerate) Padding(padding: const EdgeInsets.only(top: Tokens.s1), child: Text(l.tfRegenerateHint, style: Theme.of(context).textTheme.bodySmall)),
        if (_error != null) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Notice(key: const ValueKey('proof-error'), text: _message(l), kind: NoticeKind.danger)),
        const SizedBox(height: Tokens.s3),
        TextField(key: const ValueKey('proof-password'), controller: _password, obscureText: true, autofillHints: const [AutofillHints.password], textDirection: TextDirection.ltr, decoration: InputDecoration(labelText: l.password)),
        const SizedBox(height: Tokens.s3),
        TextField(
          key: const ValueKey('proof-code'),
          controller: _code,
          autocorrect: false,
          enableSuggestions: false,
          keyboardType: _recovery ? TextInputType.visiblePassword : TextInputType.number,
          inputFormatters: _recovery ? [LengthLimitingTextInputFormatter(11)] : [FilteringTextInputFormatter.allow(RegExp(r'[0-9 ]')), LengthLimitingTextInputFormatter(7)],
          textDirection: TextDirection.ltr,
          decoration: InputDecoration(labelText: _recovery ? l.tfRecoveryLabel : l.tfCodeLabel),
        ),
        TextButton(
          key: const ValueKey('proof-toggle'),
          onPressed: () => setState(() {
            _recovery = !_recovery;
            _code.clear();
          }),
          child: Text(_recovery ? l.tfUseApp : l.tfUseRecovery, textAlign: TextAlign.center),
        ),
      ]),
      actions: [
        TextButton(onPressed: _busy ? null : () => Navigator.of(context).pop(false), child: Text(l.cancel)),
        FilledButton(key: const ValueKey('proof-submit'), onPressed: _busy ? null : _go, child: Text(widget.regenerate ? l.tfRegenerate : l.tfDisable)),
      ],
    );
  }
}
