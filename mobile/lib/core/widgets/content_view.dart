import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';
import '../theme/app_theme.dart';
import '../util/safe_url.dart';
import 'common.dart';

/// Renders API content values: plain strings, string lists (bullets) and `{title,text}` lists (numbered steps).
/// Returns null when there is nothing to show so callers can skip the whole section.
Widget? renderContentValue(BuildContext context, Object? v) {
  if (v == null) return null;
  if (v is String) return v.trim().isEmpty ? null : Text(v);
  if (v is List && v.isNotEmpty) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      for (var i = 0; i < v.length; i++)
        Padding(
          padding: const EdgeInsets.only(bottom: Tokens.s2),
          child: v[i] is Map
              ? Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('${i + 1}. ${(v[i] as Map)['title'] ?? ''}', style: Theme.of(context).textTheme.labelLarge),
                  if (((v[i] as Map)['text'] ?? '').toString().isNotEmpty) Text('${(v[i] as Map)['text']}'),
                ])
              : Row(crossAxisAlignment: CrossAxisAlignment.start, children: [const Text('•  '), Expanded(child: Text('${v[i]}'))]),
        ),
    ]);
  }
  return null;
}

class ContentSection extends StatelessWidget {
  const ContentSection({super.key, required this.title, required this.value});
  final String title;
  final Object? value;
  @override
  Widget build(BuildContext context) {
    final body = renderContentValue(context, value);
    if (body == null) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(top: Tokens.s5),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        if (title.isNotEmpty) ...[Text(title, style: Theme.of(context).textTheme.titleMedium), const SizedBox(height: Tokens.s2)],
        body,
      ]),
    );
  }
}

/// Localized label for `OfficeType` values (the API only returns the label alongside a response).
String officeTypeLabel(AppL10n l, String? type) => switch (type) {
      'questura' => l.officeQuestura,
      'prefettura' => l.officePrefettura,
      'comune' => l.officeComune,
      'anagrafe' => l.officeAnagrafe,
      'asl' => l.officeAsl,
      'inps' => l.officeInps,
      'agenzia_entrate' => l.officeAgenziaEntrate,
      'poste' => l.officePoste,
      'motorizzazione' => l.officeMotorizzazione,
      'university' => l.officeUniversity,
      _ => l.officeOther,
    };

const officeTypes = ['questura', 'prefettura', 'comune', 'anagrafe', 'asl', 'inps', 'agenzia_entrate', 'poste', 'motorizzazione', 'university', 'other'];

/// A government office: contact data as plain text, the official website and the official booking
/// destination as external links. EXPA never books; the booking block says so.
class OfficeCard extends StatelessWidget {
  const OfficeCard({super.key, required this.office, this.onTap});
  final Map<String, dynamic> office;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final o = office;
    final booking = o['booking'] is Map ? Map<String, dynamic>.from(o['booking'] as Map) : null;
    final bookingUrl = booking?['url'] as String?;
    final officialUrl = o['official_url'] as String?;
    final source = SourceInfo.fromJson(o['source']);
    final theme = Theme.of(context);
    final body = Padding(
      padding: const EdgeInsets.all(Tokens.s4),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('${o['name']}', style: theme.textTheme.titleMedium),
        if (o['office_type'] != null) Text(o['office_type_label'] as String? ?? officeTypeLabel(l, '${o['office_type']}'), style: theme.textTheme.bodySmall),
        if (o['address'] != null) Padding(padding: const EdgeInsets.only(top: Tokens.s1), child: Text([o['address'], o['postal_code'], (o['city'] as Map?)?['name']].where((e) => e != null && '$e'.isNotEmpty).join(', '))),
        if (o['opening_hours'] != null) Text('${o['opening_hours']}', style: theme.textTheme.bodySmall),
        if (o['phone'] != null) Text('${l.officePhone}: ${o['phone']}', style: theme.textTheme.bodySmall, textDirection: TextDirection.ltr),
        if (o['email'] != null) Text('${o['email']}', style: theme.textTheme.bodySmall, textDirection: TextDirection.ltr),
        if (booking != null) ...[
          const SizedBox(height: Tokens.s2),
          Pill(text: '${booking['method_label'] ?? ''}'),
          Padding(padding: const EdgeInsets.only(top: Tokens.s1), child: Text(l.apptNotBookedByExpa, style: theme.textTheme.bodySmall)),
          if (safeHttpsUri(bookingUrl) != null)
            Padding(
              padding: const EdgeInsets.only(top: Tokens.s2),
              child: FilledButton.icon(onPressed: () => openUrlWithFeedback(context, bookingUrl), icon: const Icon(Icons.open_in_new), label: Text(l.apptGoOfficial)),
            )
          else
            Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Text(l.apptNoUrl, style: theme.textTheme.bodySmall)),
        ],
        if (safeHttpsUri(officialUrl) != null)
          Padding(
            padding: const EdgeInsets.only(top: Tokens.s2),
            child: OutlinedButton.icon(onPressed: () => openUrlWithFeedback(context, officialUrl), icon: const Icon(Icons.public, size: 18), label: Text(l.openOfficialSite)),
          ),
        if (source != null) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: FreshnessBadge(freshness: source.freshness)),
      ]),
    );
    return Card(child: onTap == null ? body : InkWell(borderRadius: BorderRadius.circular(Tokens.radiusMd), onTap: onTap, child: body));
  }
}
