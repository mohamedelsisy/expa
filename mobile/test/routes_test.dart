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

  test('MOB-13: every module the backend can point at has a route and keeps its slug/id', () {
    const cases = {
      'learn-italian/lessons/saluti': '/learn/saluti',
      'learn-italian/saluti': '/learn/saluti',
      'jobs/42': '/jobs/42',
      'jobs': '/jobs',
      'appointments/guides/questura': '/appointments/guides/questura',
      'appointments': '/appointments',
      'government': '/government',
      'government/services/permesso': '/government/services/permesso',
      'government/offices/questura-roma': '/government/offices/questura-roma',
      'patente': '/patente',
      'patente/topics/segnali': '/patente/topics/segnali',
      'patente/categories/b': '/patente/categories/b',
      'study': '/study',
      'study/universities/unibo': '/study/universities/unibo',
      'study/programs/cs-msc': '/study/programs/cs-msc',
      'study/scholarships/dsu': '/study/scholarships/dsu',
      'tasks': '/tasks',
      'notifications': '/notifications',
      '/guides/a-b': '/guides/a-b',
    };
    cases.forEach((target, route) => expect(routeForTarget('route', target), route, reason: target));
  });

  test('search targets keep a sane query only', () {
    expect(routeForTarget('route', 'search?q=residenza'), '/search?q=residenza');
    expect(routeForTarget('route', 'search?q=a%20b'), '/search?q=a+b');
    expect(routeForTarget('route', 'search?q=x'), '/search');
    expect(routeForTarget('route', 'search'), '/search');
  });

  test('a non-numeric job id and unknown sub-paths degrade to the list, never to an arbitrary path', () {
    expect(routeForTarget('route', 'jobs/abc'), '/jobs');
    expect(routeForTarget('route', 'study/other/x'), '/study');
    expect(routeForTarget('route', 'government/other/x'), '/government');
  });

  test('unsafe or unknown targets map to nothing', () {
    for (final t in ['https://evil.example', '//evil.example', '../admin', 'javascript:alert(1)', 'unknown', '', r'a\b', 'admin/users', 'government/../x']) {
      expect(routeForTarget('route', t), isNull, reason: t);
    }
  });
}
