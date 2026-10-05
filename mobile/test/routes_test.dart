import 'package:expa_mobile/core/routes.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('allow-listed targets map to routes', () {
    expect(routeForTarget('guide', 'rinnovo'), '/guides/rinnovo');
    expect(routeForTarget('route', 'guides'), '/guides');
    expect(routeForTarget('route', 'my-documents/12'), '/documents');
    expect(routeForTarget('route', 'learn-italian/daily'), '/learn');
    expect(routeForTarget('route', 'privacy-settings'), '/privacy');
  });

  test('unsafe or unknown targets map to nothing', () {
    for (final t in ['https://evil.example', '//evil.example', '../admin', 'javascript:alert(1)', 'unknown', '', r'a\b']) {
      expect(routeForTarget('route', t), isNull, reason: t);
    }
  });
}
