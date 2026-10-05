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

/// On-device text recognition. No engine is bundled in this build ([NoopOcrEngine]); an ML Kit / Vision based
/// implementation can be plugged in without touching the screens (see docs/MOBILE_SETUP.md).
abstract class OcrEngine {
  bool get isAvailable;

  /// Recognised text, or null when nothing could be read.
  Future<String?> recognize(CapturedImage image);
}

class NoopOcrEngine implements OcrEngine {
  const NoopOcrEngine();
  @override
  bool get isAvailable => false;
  @override
  Future<String?> recognize(CapturedImage image) async => null;
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
