import 'package:url_launcher/url_launcher.dart';

/// Only absolute https URLs from the API are ever opened, and always in the external browser.
/// (Official URLs come from server content; never trust or invent others. Same rule as web utils/routes.ts.)
Uri? safeHttpsUri(String? raw) {
  if (raw == null || raw.isEmpty) return null;
  final uri = Uri.tryParse(raw.trim());
  if (uri == null || uri.scheme != 'https' || uri.host.isEmpty || uri.userInfo.isNotEmpty) return null;
  return uri;
}

typedef UrlOpener = Future<bool> Function(Uri uri);

/// Replaceable in tests.
UrlOpener urlOpener = (uri) => launchUrl(uri, mode: LaunchMode.externalApplication);

/// Returns false when the URL is unsafe or could not be opened.
Future<bool> openExternal(String? raw) async {
  final uri = safeHttpsUri(raw);
  if (uri == null) return false;
  try {
    return await urlOpener(uri);
  } catch (_) {
    return false;
  }
}
