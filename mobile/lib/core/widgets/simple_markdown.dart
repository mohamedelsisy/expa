import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

/// Minimal, safe renderer for server text: `#`/`##`/`###` headings, `-`/`*` bullets, numbered items and
/// paragraphs. No HTML, no images, no links (so content can never trigger a navigation or a remote load).
/// Inline markers (`**`, `__`, backticks) are stripped.
class SimpleMarkdown extends StatelessWidget {
  const SimpleMarkdown(this.text, {super.key});
  final String text;

  static String _inline(String s) => s.replaceAll(RegExp(r'(\*\*|__|`)'), '').replaceAllMapped(RegExp(r'\[([^\]]+)\]\([^)]*\)'), (m) => m.group(1)!);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final out = <Widget>[];
    final para = <String>[];
    void flush() {
      if (para.isEmpty) return;
      out.add(Padding(padding: const EdgeInsets.only(bottom: Tokens.s3), child: Text(_inline(para.join(' ')))));
      para.clear();
    }

    for (final raw in text.replaceAll('\r\n', '\n').split('\n')) {
      final line = raw.trimRight();
      final t = line.trim();
      if (t.isEmpty) {
        flush();
        continue;
      }
      final h = RegExp(r'^(#{1,4})\s+(.*)$').firstMatch(t);
      final b = RegExp(r'^([-*•]|\d+[.)])\s+(.*)$').firstMatch(t);
      if (h != null) {
        flush();
        out.add(Padding(padding: const EdgeInsets.only(top: Tokens.s2, bottom: Tokens.s2), child: Text(_inline(h.group(2)!), style: h.group(1)!.length == 1 ? theme.textTheme.titleLarge : theme.textTheme.titleMedium)));
      } else if (b != null) {
        flush();
        final marker = RegExp(r'^\d').hasMatch(b.group(1)!) ? '${b.group(1)} ' : '•  ';
        out.add(Padding(padding: const EdgeInsets.only(bottom: Tokens.s1), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(marker), Expanded(child: Text(_inline(b.group(2)!)))])));
      } else {
        para.add(t);
      }
    }
    flush();
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: out);
  }
}
