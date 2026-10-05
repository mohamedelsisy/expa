/// Parsing of the e-mail links the app can be opened with (https App Links / Universal Links).
/// Nothing from the link is ever fetched directly: only whitelisted pieces (id, hash, `expires`, `signature`)
/// are re-sent to the configured API, which validates the signature itself.
class VerificationLink {
  const VerificationLink({required this.id, required this.hash, required this.signedQuery});
  final int id;
  final String hash;
  final Map<String, String> signedQuery;
}

/// `url` is the signed API URL carried in the web link `/{locale}/verify-email?url=...`
/// (`.../auth/verify-email/{id}/{sha1}?expires=...&signature=...`). Returns null when it does not match exactly.
VerificationLink? parseVerificationLink(String? url) {
  if (url == null || url.isEmpty || url.length > 2048) return null;
  final uri = Uri.tryParse(url);
  if (uri == null) return null;
  final m = RegExp(r'/auth/verify-email/(\d{1,12})/([A-Fa-f0-9]{40})$').firstMatch(uri.path);
  if (m == null) return null;
  final expires = uri.queryParameters['expires'];
  final signature = uri.queryParameters['signature'];
  if (expires == null || !RegExp(r'^\d{1,12}$').hasMatch(expires)) return null;
  if (signature == null || !RegExp(r'^[A-Fa-f0-9]{16,128}$').hasMatch(signature)) return null;
  return VerificationLink(id: int.parse(m.group(1)!), hash: m.group(2)!, signedQuery: {'expires': expires, 'signature': signature});
}

/// A reset link is usable only with both a token and an e-mail address of sane size.
bool isUsableResetLink(String? token, String? email) =>
    token != null && token.isNotEmpty && token.length <= 200 && email != null && email.contains('@') && email.length <= 254;
