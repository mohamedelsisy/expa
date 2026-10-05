/// Maps server-provided `cta`/action targets to in-app routes through an allow-list.
/// Unknown, absolute, protocol-relative or traversal targets map to null (mirrors web utils/routes.ts).
String? routeForTarget(String type, String target) {
  if (target.isEmpty || target.contains('://') || target.startsWith('//') || target.contains('..') || target.contains('\\')) return null;
  if (type == 'guide') return '/guides/${Uri.encodeComponent(target)}';
  final path = target.split('?').first.replaceAll(RegExp(r'^/+'), '');
  final segments = path.split('/');
  switch (segments.first) {
    case 'guides':
      return segments.length > 1 && segments[1].isNotEmpty ? '/guides/${Uri.encodeComponent(segments[1])}' : '/guides';
    case 'my-documents':
      return '/documents';
    case 'onboarding':
      return '/onboarding';
    case 'privacy-settings':
      return '/privacy';
    case 'learn-italian':
    case 'italian':
      return '/learn';
    case 'jobs':
      return '/jobs';
    case 'appointments':
      return '/appointments';
    case 'notifications':
      return '/notifications';
  }
  return null;
}
