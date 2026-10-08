/// Maps server-provided `cta`/action targets (AI actions, notifications, push payloads, search results)
/// to in-app routes through an allow-list. Unknown, absolute, protocol-relative or traversal targets map
/// to null (mirrors web utils/routes.ts). Every module the backend can point at has a mobile route, and
/// slugs/ids are preserved (MOB-13).
String? routeForTarget(String type, String target) {
  if (target.isEmpty || target.contains('://') || target.startsWith('//') || target.contains('..') || target.contains('\\')) return null;
  if (type == 'guide') return '/guides/${Uri.encodeComponent(target)}';
  final qIndex = target.indexOf('?');
  final path = (qIndex < 0 ? target : target.substring(0, qIndex)).replaceAll(RegExp(r'^/+'), '');
  final query = qIndex < 0 ? '' : target.substring(qIndex + 1);
  final s = path.split('/').where((e) => e.isNotEmpty).toList();
  if (s.isEmpty) return null;
  String? slugAt(int i) => s.length > i && s[i].isNotEmpty ? Uri.encodeComponent(s[i]) : null;

  switch (s.first) {
    case 'guides':
      final slug = slugAt(1);
      return slug == null ? '/guides' : '/guides/$slug';
    case 'my-documents':
      return '/documents';
    case 'onboarding':
      return '/onboarding';
    case 'privacy-settings':
      return '/privacy';
    case 'learn-italian':
    case 'italian':
      // `learn-italian/lessons/{slug}` (search) or `learn-italian/{slug}`.
      final slug = s.length > 1 && s[1] == 'lessons' ? slugAt(2) : (s.length > 1 && const {'daily', 'progress', 'levels'}.contains(s[1]) ? null : slugAt(1));
      return slug == null ? '/learn' : '/learn/$slug';
    case 'jobs':
      final id = s.length > 1 ? int.tryParse(s[1]) : null;
      return id == null ? '/jobs' : '/jobs/$id';
    case 'appointments':
      final slug = s.length > 1 && s[1] == 'guides' ? slugAt(2) : null;
      return slug == null ? '/appointments' : '/appointments/guides/$slug';
    case 'articles':
      final slug = slugAt(1);
      return slug == null ? '/articles' : '/articles/$slug';
    case 'cities':
      final slug = slugAt(1);
      return slug == null ? '/cities' : '/cities/$slug';
    case 'housing':
      return '/housing';
    case 'recommendations':
      return '/recommendations';
    case 'travel':
      return '/travel';
    case 'billing':
    case 'pricing':
      return '/billing';
    case 'notifications':
      return '/notifications';
    case 'tasks':
      return '/tasks';
    case 'government':
      if (s.length > 2 && (s[1] == 'services' || s[1] == 'offices')) return '/government/${s[1]}/${slugAt(2)}';
      return '/government';
    case 'patente':
      if (s.length > 2 && (s[1] == 'topics' || s[1] == 'categories')) return '/patente/${s[1]}/${slugAt(2)}';
      return '/patente';
    case 'study':
      if (s.length > 2 && const {'universities', 'programs', 'scholarships'}.contains(s[1])) return '/study/${s[1]}/${slugAt(2)}';
      return '/study';
    case 'search':
      final q = (Uri.splitQueryString(query)['q'] ?? '').trim();
      return q.length >= 2 && q.length <= 100 ? '/search?q=${Uri.encodeQueryComponent(q)}' : '/search';
  }
  return null;
}
