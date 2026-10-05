import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

Map<String, dynamic> arb(String lang) => jsonDecode(File('lib/l10n/app_$lang.arb').readAsStringSync()) as Map<String, dynamic>;
Set<String> keys(Map<String, dynamic> m) => m.keys.where((k) => !k.startsWith('@')).toSet();

void main() {
  final ar = arb('ar'), en = arb('en'), it = arb('it');

  test('ar, en and it ARBs have identical keys', () {
    expect(keys(en).difference(keys(ar)), isEmpty, reason: 'in en but not ar');
    expect(keys(ar).difference(keys(en)), isEmpty, reason: 'in ar but not en');
    expect(keys(it).difference(keys(ar)), isEmpty, reason: 'in it but not ar');
    expect(keys(ar).difference(keys(it)), isEmpty, reason: 'in ar but not it');
  });

  test('no empty translations and placeholders match across languages', () {
    final ph = RegExp(r'\{(\w+)\}');
    for (final k in keys(ar)) {
      for (final m in [ar, en, it]) {
        expect((m[k] as String).trim(), isNotEmpty, reason: k);
      }
      Set<String> p(Map<String, dynamic> m) => ph.allMatches(m[k] as String).map((x) => x.group(1)!).toSet();
      expect(p(en), p(ar), reason: 'placeholders of $k (en)');
      expect(p(it), p(ar), reason: 'placeholders of $k (it)');
    }
  });

  test('Arabic is the template language and strings are really Arabic', () {
    expect(ar['@@locale'], 'ar');
    final arabic = RegExp(r'[؀-ۿ]');
    for (final k in ['loginTitle', 'tabHome', 'askTitle', 'jobsTitle']) {
      expect(arabic.hasMatch(ar[k] as String), isTrue, reason: k);
    }
  });

  test('the spec mandated AI failure sentence is used verbatim in English', () {
    expect(en['askFailed'], "I couldn't process that right now. Please try again.");
  });
}
