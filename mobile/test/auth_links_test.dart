import 'package:expa_mobile/features/auth/auth_links.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  final hash = 'a' * 40;
  final sig = 'b' * 64;

  group('parseVerificationLink', () {
    test('accepts the signed API URL carried by the e-mail link', () {
      final l = parseVerificationLink('https://api.expa.example/api/v1/auth/verify-email/7/$hash?expires=1893456000&signature=$sig')!;
      expect(l.id, 7);
      expect(l.hash, hash);
      expect(l.signedQuery, {'expires': '1893456000', 'signature': sig});
    });

    test('only whitelisted query parameters are carried over (no extra params can be smuggled)', () {
      final l = parseVerificationLink('https://x.example/api/v1/auth/verify-email/7/$hash?expires=1&signature=$sig&redirect=https://evil.example')!;
      expect(l.signedQuery.keys, ['expires', 'signature']);
    });

    test('rejects anything that is not exactly the verification route', () {
      for (final bad in [
        null,
        '',
        'https://x.example/api/v1/auth/login',
        'https://x.example/api/v1/auth/verify-email/abc/$hash?expires=1&signature=$sig',
        'https://x.example/api/v1/auth/verify-email/7/short?expires=1&signature=$sig',
        'https://x.example/api/v1/auth/verify-email/7/$hash?signature=$sig',
        'https://x.example/api/v1/auth/verify-email/7/$hash?expires=1',
        'https://x.example/api/v1/auth/verify-email/7/$hash?expires=abc&signature=$sig',
        'https://x.example/api/v1/auth/verify-email/7/$hash/extra?expires=1&signature=$sig',
        'x' * 3000,
      ]) {
        expect(parseVerificationLink(bad), isNull, reason: '$bad');
      }
    });
  });

  test('isUsableResetLink needs a token and a plausible e-mail', () {
    expect(isUsableResetLink('tok', 'a@b.co'), isTrue);
    expect(isUsableResetLink(null, 'a@b.co'), isFalse);
    expect(isUsableResetLink('', 'a@b.co'), isFalse);
    expect(isUsableResetLink('tok', 'nomail'), isFalse);
    expect(isUsableResetLink('t' * 201, 'a@b.co'), isFalse);
  });
}
