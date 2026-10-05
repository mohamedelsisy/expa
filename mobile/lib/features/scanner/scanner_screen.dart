import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/api_exception.dart';
import '../../core/providers.dart';
import '../../core/routes.dart';
import '../../core/theme/app_theme.dart';
import '../../core/util/format.dart';
import '../../core/util/safe_url.dart';
import '../../core/widgets/common.dart';
import '../../l10n/app_localizations.dart';
import 'document_explainer_api.dart';
import 'scanner_service.dart';

final imageCaptureProvider = Provider<ImageCaptureService>((ref) => ImagePickerCapture());
final ocrEngineProvider = Provider<OcrEngine>((ref) => const NoopOcrEngine());
final documentExplainerProvider = Provider<DocumentExplainer>((ref) => ApiDocumentExplainer(ref.watch(apiClientProvider)));

enum _Step { intro, review, result }

/// SCAN -> (local OCR when an engine exists) -> REVIEW -> explicit send -> EXPLANATION.
/// Nothing leaves the device until the user taps "Send": the review screen shows exactly what will be sent.
/// Without a camera/OCR engine the manual paste path gives the same result.
class ScannerScreen extends ConsumerStatefulWidget {
  const ScannerScreen({super.key});
  @override
  ConsumerState<ScannerScreen> createState() => _ScannerState();
}

class _ScannerState extends ConsumerState<ScannerScreen> {
  _Step _step = _Step.intro;
  CapturedImage? _image;
  final _text = TextEditingController();
  bool _busy = false, _denied = false;
  Object? _error;
  Explanation? _result;

  @override
  void dispose() {
    _text.dispose();
    super.dispose();
  }

  Future<void> _capture(bool camera) async {
    setState(() {
      _busy = true;
      _error = null;
      _denied = false;
    });
    try {
      final img = await ref.read(imageCaptureProvider).capture(fromCamera: camera);
      if (img == null || !mounted) return;
      final ocr = ref.read(ocrEngineProvider);
      String? recognized;
      if (ocr.isAvailable) {
        try {
          recognized = await ocr.recognize(img);
        } catch (_) {}
      }
      if (!mounted) return;
      setState(() {
        _image = img;
        _text.text = recognized ?? '';
        _step = _Step.review;
      });
    } on CapturePermissionDenied {
      if (mounted) setState(() => _denied = true);
    } catch (e) {
      if (mounted) setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  void _manual() => setState(() {
        _image = null;
        _text.clear();
        _error = null;
        _step = _Step.review;
      });

  void _discard() => setState(() {
        _image = null;
        _text.clear();
        _result = null;
        _error = null;
        _step = _Step.intro;
      });

  Future<void> _send() async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final svc = ref.read(documentExplainerProvider);
      final text = _text.text.trim();
      // Text (recognised or pasted) is preferred: the user has seen and can edit exactly what is sent.
      final r = text.isNotEmpty ? await svc.explainText(text) : await svc.explainImage(_image!);
      if (mounted) {
        setState(() {
          _result = r;
          _step = _Step.result;
          _image = null; // drop the photo from memory once it is no longer needed
        });
      }
    } catch (e) {
      if (mounted) setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  String _errorText(AppL10n l) => _error is NotFoundException ? l.scannerBackendUnavailable : errorMessage(l, _error);

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final capture = ref.watch(imageCaptureProvider);
    return Scaffold(
      appBar: AppBar(title: Text(l.scannerTitle)),
      body: ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
        if (_error != null) ...[Notice(key: const ValueKey('scanner-error'), text: _errorText(l), kind: NoticeKind.danger), const SizedBox(height: Tokens.s3)],
        if (_denied) ...[Notice(key: const ValueKey('scanner-denied'), text: l.scannerPermissionDenied, kind: NoticeKind.warning), const SizedBox(height: Tokens.s3)],
        ...switch (_step) {
          _Step.intro => _intro(context, l, capture),
          _Step.review => _review(context, l),
          _Step.result => _resultView(context, l),
        },
      ]),
    );
  }

  List<Widget> _intro(BuildContext context, AppL10n l, ImageCaptureService capture) => [
        Text(l.scannerIntro),
        const SizedBox(height: Tokens.s3),
        Notice(text: l.scannerPrivacy, kind: NoticeKind.info),
        const SizedBox(height: Tokens.s4),
        if (capture.isAvailable) ...[
          Notice(text: l.scannerCameraWhy),
          const SizedBox(height: Tokens.s3),
          FilledButton.icon(key: const ValueKey('scanner-camera'), onPressed: _busy ? null : () => _capture(true), icon: const Icon(Icons.photo_camera_outlined), label: Text(l.scannerUseCamera)),
          const SizedBox(height: Tokens.s2),
          OutlinedButton.icon(key: const ValueKey('scanner-gallery'), onPressed: _busy ? null : () => _capture(false), icon: const Icon(Icons.photo_library_outlined), label: Text(l.scannerUseGallery)),
        ] else
          Notice(key: const ValueKey('scanner-no-camera'), text: l.scannerNoCamera, kind: NoticeKind.warning),
        const SizedBox(height: Tokens.s2),
        OutlinedButton.icon(key: const ValueKey('scanner-paste'), onPressed: _busy ? null : _manual, icon: const Icon(Icons.edit_note), label: Text(l.scannerPasteText)),
      ];

  List<Widget> _review(BuildContext context, AppL10n l) {
    final ocrAvailable = ref.read(ocrEngineProvider).isAvailable;
    return [
      Text(l.scannerReviewTitle, style: Theme.of(context).textTheme.titleMedium),
      const SizedBox(height: Tokens.s2),
      if (_image != null) ...[
        ClipRRect(borderRadius: BorderRadius.circular(Tokens.radiusMd), child: Image.memory(_image!.bytes, height: 220, fit: BoxFit.cover, semanticLabel: l.scannerPreview)),
        const SizedBox(height: Tokens.s2),
        if (!ocrAvailable) Notice(key: const ValueKey('scanner-no-ocr'), text: l.scannerNoOcr, kind: NoticeKind.info),
        const SizedBox(height: Tokens.s2),
      ],
      TextField(
        key: const ValueKey('scanner-text'),
        controller: _text,
        minLines: 5,
        maxLines: 12,
        maxLength: 8000,
        onChanged: (_) => setState(() {}),
        decoration: InputDecoration(labelText: l.scannerTextLabel, hintText: l.scannerTextHint, alignLabelWithHint: true),
      ),
      const SizedBox(height: Tokens.s2),
      Notice(text: _text.text.trim().isNotEmpty ? l.scannerSendsText : (_image != null ? l.scannerSendsImage : l.scannerNothingToSend), kind: NoticeKind.warning),
      const SizedBox(height: Tokens.s3),
      FilledButton(
        key: const ValueKey('scanner-send'),
        onPressed: (_busy || (_text.text.trim().isEmpty && _image == null)) ? null : _send,
        child: _busy ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2)) : Text(l.scannerSend),
      ),
      TextButton(key: const ValueKey('scanner-discard'), onPressed: _busy ? null : _discard, child: Text(l.scannerDiscard)),
    ];
  }

  List<Widget> _resultView(BuildContext context, AppL10n l) {
    final r = _result!;
    final theme = Theme.of(context);
    return [
      if (r.classification != null) Pill(text: r.classification!, bg: Tokens.primarySoft, fg: Tokens.primaryStrong),
      const SizedBox(height: Tokens.s2),
      Text(r.summary.isEmpty ? l.scannerNoSummary : r.summary, key: const ValueKey('scanner-summary')),
      if (r.keyDates.isNotEmpty) ...[
        const SizedBox(height: Tokens.s4),
        Text(l.scannerKeyDates, style: theme.textTheme.titleMedium),
        for (final d in r.keyDates)
          ListTile(contentPadding: EdgeInsets.zero, leading: const Icon(Icons.event), title: Text(d.label), subtitle: d.date == null ? null : Text(formatDate(context, d.date))),
        // Reminders live on tracked documents: send the user there instead of inventing a second reminder system.
        OutlinedButton.icon(onPressed: () => context.push('/documents/new'), icon: const Icon(Icons.add_alert_outlined), label: Text(l.scannerCreateReminder)),
      ],
      if (r.actions.isNotEmpty) ...[
        const SizedBox(height: Tokens.s4),
        Text(l.scannerActions, style: theme.textTheme.titleMedium),
        for (final a in r.actions)
          Builder(builder: (_) {
            final route = a.target == null ? null : routeForTarget(a.type ?? 'route', a.target!);
            return route == null ? ListTile(contentPadding: EdgeInsets.zero, leading: const Icon(Icons.check_circle_outline), title: Text(a.label)) : ListTile(contentPadding: EdgeInsets.zero, leading: const Icon(Icons.arrow_forward), title: Text(a.label), onTap: () => context.push(route));
          }),
      ],
      for (final s in r.sources)
        if (safeHttpsUri(s.url) != null) TextButton.icon(onPressed: () => openUrlWithFeedback(context, s.url), icon: const Icon(Icons.open_in_new, size: 18), label: Text(s.title.isEmpty ? l.openOfficialSite : s.title)),
      const SizedBox(height: Tokens.s3),
      Notice(key: const ValueKey('scanner-disclaimer'), text: r.disclaimer ?? l.scannerDefaultDisclaimer, kind: NoticeKind.warning),
      const SizedBox(height: Tokens.s3),
      OutlinedButton(onPressed: _discard, child: Text(l.scannerAnother)),
    ];
  }
}
