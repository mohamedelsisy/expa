import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

/// Report reasons accepted by the API (`moderation.report_reasons`): returns `(reason, note)` or null when cancelled.
class ReportDialog extends StatefulWidget {
  const ReportDialog({super.key});
  @override
  State<ReportDialog> createState() => ReportDialogState();
}

class ReportDialogState extends State<ReportDialog> {
  final _note = TextEditingController();
  String _reason = 'spam';

  @override
  void dispose() {
    _note.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final reasons = {'spam': l.reasonSpam, 'abuse': l.reasonAbuse, 'misleading': l.reasonMisleading, 'illegal': l.reasonIllegal, 'personal_data': l.reasonPersonalData, 'other': l.reasonOther};
    return AlertDialog(
      title: Text(l.reviewReportReason),
      content: SingleChildScrollView(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          RadioGroup<String>(
            groupValue: _reason,
            onChanged: (v) => setState(() => _reason = v ?? _reason),
            child: Column(children: [for (final e in reasons.entries) RadioListTile<String>(contentPadding: EdgeInsets.zero, value: e.key, title: Text(e.value))]),
          ),
          TextField(key: const ValueKey('report-note'), controller: _note, maxLines: 3, decoration: InputDecoration(labelText: l.reviewBody)),
        ]),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.of(context).pop(), child: Text(l.cancel)),
        FilledButton(key: const ValueKey('report-send'), onPressed: () => Navigator.of(context).pop((reason: _reason, note: _note.text.trim())), child: Text(l.reviewReportSend)),
      ],
    );
  }
}
