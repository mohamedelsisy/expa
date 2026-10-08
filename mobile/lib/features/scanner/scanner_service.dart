import 'dart:io';

import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';

/// A photo held in memory only (never written to app storage by EXPA, never uploaded automatically).
class CapturedImage {
  const CapturedImage({required this.bytes, required this.filename, required this.mimeType});
  final Uint8List bytes;
  final String filename;
  final String mimeType;
}

/// The user (or the OS) denied camera/photo access.
class CapturePermissionDenied implements Exception {
  const CapturePermissionDenied();
}

abstract class ImageCaptureService {
  /// False when this build/platform cannot capture (the UI then offers the manual text fallback only).
  bool get isAvailable;

  /// Opens the camera (or the photo library). Returns null when the user cancelled.
  /// Throws [CapturePermissionDenied] when access is denied.
  Future<CapturedImage?> capture({required bool fromCamera});
}

/// On-device text recognition boundary. The screens only know this interface:
/// * [ManualEntryOcrEngine] (bundled): no recognition, the user types or pastes the text.
/// * An ML Kit / Apple Vision adapter can be bound through `ocrEngineProvider` without touching any screen.
///   It is NOT bundled because a native plugin cannot be build-verified here: exact steps and the adapter source
///   are in docs/MOBILE_SETUP.md section 'On-device OCR' and tool/ocr/mlkit_ocr_engine.dart.template (BUILD_ENVIRONMENT_REQUIRED).
/// Recognition must run fully on the device; an engine must never send the image anywhere.
abstract class OcrEngine {
  /// Stable identifier (`manual`, `mlkit`, ...); used for diagnostics only, never sent to the server.
  String get id;
  bool get isAvailable;

  /// Recognised text, or null when nothing could be read.
  Future<String?> recognize(CapturedImage image);
}

/// Fallback engine: nothing is recognised, the review step lets the user enter the text by hand.
class ManualEntryOcrEngine implements OcrEngine {
  const ManualEntryOcrEngine();
  @override
  String get id => 'manual';
  @override
  bool get isAvailable => false;
  @override
  Future<String?> recognize(CapturedImage image) async => null;
}

enum SensitiveKind { iban, fiscalCode, longNumber, email }

/// Heuristic, on-device hint (never a guarantee): finds data the user may want to black out before sending a
/// letter's text for explanation. Returns the kinds found, without the matched values.
Set<SensitiveKind> detectSensitive(String text) {
  final out = <SensitiveKind>{};
  if (RegExp(r'\b[A-Z]{2}\d{2}\s?(?:[A-Z0-9]{4}\s?){4,7}[A-Z0-9]{1,4}\b', caseSensitive: false).hasMatch(text)) out.add(SensitiveKind.iban);
  if (RegExp(r'\b[A-Z]{6}\d{2}[A-EHLMPR-T]\d{2}[A-Z]\d{3}[A-Z]\b', caseSensitive: false).hasMatch(text)) out.add(SensitiveKind.fiscalCode);
  if (RegExp(r'\d(?:[ .-]?\d){8,}').hasMatch(text)) out.add(SensitiveKind.longNumber);
  if (RegExp(r'[\w.+-]+@[\w-]+\.[\w.-]+').hasMatch(text)) out.add(SensitiveKind.email);
  return out;
}

/// Capture through `image_picker`. The OS shows the permission prompt on first use (usage strings are in
/// Info.plist / AndroidManifest). DEVICE_VERIFICATION_REQUIRED: not exercised on a real device in this repo.
class ImagePickerCapture implements ImageCaptureService {
  ImagePickerCapture([ImagePicker? picker]) : _picker = picker ?? ImagePicker();
  final ImagePicker _picker;

  @override
  bool get isAvailable => Platform.isAndroid || Platform.isIOS;

  @override
  Future<CapturedImage?> capture({required bool fromCamera}) async {
    try {
      final x = await _picker.pickImage(
        source: fromCamera ? ImageSource.camera : ImageSource.gallery,
        maxWidth: 2200,
        imageQuality: 85,
        requestFullMetadata: false,
      );
      if (x == null) return null;
      final bytes = await x.readAsBytes();
      // The picker leaves a temporary copy in the cache directory: remove it, we only keep the bytes in memory.
      try {
        await File(x.path).delete();
      } catch (_) {}
      final name = x.name.isEmpty ? 'scan.jpg' : x.name;
      final mime = name.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
      return CapturedImage(bytes: bytes, filename: name, mimeType: mime);
    } on PlatformException catch (e) {
      if (e.code == 'camera_access_denied' || e.code == 'photo_access_denied') throw const CapturePermissionDenied();
      rethrow;
    }
  }
}
