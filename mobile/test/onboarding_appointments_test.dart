import 'package:expa_mobile/features/appointments/appointments.dart';
import 'package:expa_mobile/features/onboarding/onboarding.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'support.dart';

TestEnv onboardingEnv({Map<String, dynamic>? profile, bool profileFails = false}) {
  final env = TestEnv();
  env.backend.ok('GET /profile/options', {
    'segment': [{'value': 'worker', 'label': 'Worker'}, {'value': 'student', 'label': 'Student'}],
    'residence_type': [{'value': 'permit', 'label': 'Permit'}],
    'cefr_level': [{'value': 'a2', 'label': 'A2'}, {'value': 'b1', 'label': 'B1'}],
    'age_range': [{'value': '25_34', 'label': '25-34'}],
    'goals': [{'value': 'work', 'label': 'Work'}],
  });
  env.backend.ok('GET /cities', [{'id': 1, 'slug': 'roma', 'name': 'Roma'}]);
  if (profileFails) {
    env.backend.error('GET /profile', 500, 'server_error');
  } else {
    env.backend.ok('GET /profile', profile ?? {'segment': 'worker', 'nationality': 'EG', 'city': {'id': 1}, 'italian_level': 'a2', 'goals': ['work']});
  }
  env.backend.ok('PATCH /profile', {});
  env.backend.ok('POST /profile/onboarding/complete', {});
  return env;
}

void main() {
  group('onboarding (MOB-26: never erase data)', () {
    testWidgets('saving without touching anything sends NO profile fields (no nulls)', (tester) async {
      final env = onboardingEnv();
      await pumpScreen(tester, const OnboardingScreen(), env, size: const Size(360, 1600));
      await tester.tap(find.byKey(const ValueKey('onboarding-save')));
      await tester.pumpAndSettle();
      expect(env.backend.where('PATCH', '/profile'), isEmpty);
      expect(env.backend.where('POST', '/profile/onboarding/complete'), hasLength(1));
    });

    testWidgets('only changed fields are sent', (tester) async {
      final env = onboardingEnv();
      await pumpScreen(tester, const OnboardingScreen(), env, size: const Size(360, 1600));
      await tester.tap(find.widgetWithText(DropdownButtonFormField<String>, 'A2').first);
      await tester.pumpAndSettle();
      await tester.tap(find.text('B1').last);
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(const ValueKey('onboarding-save')));
      await tester.pumpAndSettle();
      expect(env.backend.where('PATCH', '/profile').single.body, {'italian_level': 'b1'});
    });

    testWidgets('clearing a field on purpose is sent as an explicit null; invalid nationality is rejected locally', (tester) async {
      final env = onboardingEnv();
      await pumpScreen(tester, const OnboardingScreen(), env, size: const Size(360, 1600));
      final nat = find.byWidgetPredicate((w) => w is TextField && w.maxLength == 2);
      await tester.enterText(nat, 'E1');
      await tester.pump();
      await tester.tap(find.byKey(const ValueKey('onboarding-save')));
      await tester.pumpAndSettle();
      expect(find.text((await l10n('en')).nationalityInvalid), findsOneWidget);
      expect(env.backend.where('PATCH', '/profile'), isEmpty);
      await tester.enterText(nat, '');
      await tester.tap(find.byKey(const ValueKey('onboarding-save')));
      await tester.pumpAndSettle();
      expect(env.backend.where('PATCH', '/profile').single.body, {'nationality': null});
    });

    testWidgets('Save stays disabled while the stored profile has not loaded; failure offers retry', (tester) async {
      final env = onboardingEnv(profileFails: true);
      await pumpScreen(tester, const OnboardingScreen(), env, size: const Size(360, 1600));
      expect(tester.widget<FilledButton>(find.byKey(const ValueKey('onboarding-save'))).onPressed, isNull);
      expect(find.text((await l10n('en')).retry), findsOneWidget);
    });

    testWidgets('a status is still required', (tester) async {
      final env = onboardingEnv(profile: {'segment': null});
      await pumpScreen(tester, const OnboardingScreen(), env, size: const Size(360, 1600));
      await tester.tap(find.byKey(const ValueKey('onboarding-save')));
      await tester.pumpAndSettle();
      expect(find.text((await l10n('en')).onboardingSegmentRequired), findsOneWidget);
      expect(env.backend.calls.where((c) => c.method != 'GET'), isEmpty);
    });

    for (final lang in langs) {
      for (final (name, size, scale) in sizes) {
        testWidgets('[$lang] $name renders without overflow', (tester) async {
          await pumpScreen(tester, const OnboardingScreen(), onboardingEnv(), lang: lang, size: size, textScale: scale);
          expect(tester.takeException(), isNull);
        });
      }
    }
  });

  group('appointment hub (MOB-14)', () {
    TestEnv hubEnv() {
      final env = TestEnv();
      env.backend.ok('GET /cities', [{'slug': 'roma', 'name': 'Roma'}]);
      env.backend.ok('GET /appointments/hub', {
        'office_type': 'questura',
        'notice': 'API NOTICE: EXPA never books for you.',
        'guide': {'title': 'How to book at the Questura', 'summary': 'Short', 'steps': [{'title': 'Open portal', 'text': 'Go'}], 'tips': ['Be early'], 'cautions': ['Beware fakes']},
        'offices': [
          {'name': 'Questura di Roma', 'office_type': 'questura', 'office_type_label': 'Police', 'address': 'Via X 1', 'phone': '+39 06 1', 'official_url': 'https://questure.poliziadistato.it', 'booking': {'method_label': 'Online', 'url': 'https://prenotazioni.example/', 'booked_by_expa': false}},
          {'name': 'Sportello B', 'booking': {'method_label': 'In person', 'url': 'http://insecure.example'}},
        ],
      });
      return env;
    }

    Future<void> search(WidgetTester tester) async {
      await tester.tap(find.byType(DropdownButtonFormField<String>).last);
      await tester.pumpAndSettle();
      await tester.tap(find.text('Roma').last);
      await tester.pumpAndSettle();
      await tester.tap(find.byType(FilledButton).first);
      await tester.pumpAndSettle();
    }

    testWidgets('shows the API notice, the booking guide, official links and never claims a booking', (tester) async {
      final env = hubEnv();
      await pumpScreen(tester, const AppointmentsScreen(), env, size: const Size(360, 2000));
      await search(tester);
      final l = await l10n('en');
      expect(find.text('API NOTICE: EXPA never books for you.'), findsOneWidget);
      expect(find.text('How to book at the Questura'), findsOneWidget);
      expect(find.text('1. Open portal'), findsOneWidget);
      expect(find.text('Be early'), findsOneWidget);
      expect(find.text('Beware fakes'), findsOneWidget);
      expect(find.text(l.apptGoOfficial), findsOneWidget, reason: 'only the https booking URL gets a button');
      expect(find.text(l.apptNoUrl), findsOneWidget, reason: 'http URL is not offered');
      expect(find.text(l.openOfficialSite), findsOneWidget);
      expect(find.text(l.apptNotBookedByExpa), findsNWidgets(2));
      expect(env.backend.where('GET', '/appointments/hub').single.query, containsPair('type', 'questura'));
    });

    testWidgets('office types are localized (no raw enum keys) and include university/other', (tester) async {
      await pumpScreen(tester, const AppointmentsScreen(), hubEnv(), lang: 'ar');
      await tester.tap(find.byType(DropdownButtonFormField<String>).first);
      await tester.pumpAndSettle();
      final l = await l10n('ar');
      expect(find.text(l.officeUniversity), findsWidgets);
      expect(find.text('agenzia_entrate'), findsNothing);
    });

    testWidgets('a hub failure shows the localized error', (tester) async {
      final env = hubEnv();
      env.backend.error('GET /appointments/hub', 404, 'not_found');
      await pumpScreen(tester, const AppointmentsScreen(), env);
      await search(tester);
      expect(find.text((await l10n('en')).errorNotFound), findsOneWidget);
    });

    for (final lang in langs) {
      for (final (name, size, scale) in sizes) {
        testWidgets('[$lang] $name results render without overflow', (tester) async {
          await pumpScreen(tester, const AppointmentsScreen(), hubEnv(), lang: lang, size: Size(size.width, 2400), textScale: scale);
          await search(tester);
          expect(tester.takeException(), isNull);
        });
      }
    }
  });
}
