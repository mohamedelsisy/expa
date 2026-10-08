import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

String read(String p) => File(p).readAsStringSync();

/// Static guards for the native configuration (nothing here proves a build: BUILD_ENVIRONMENT_REQUIRED).
void main() {
  const id = 'it.expa.app';

  test('one application id / bundle id everywhere', () {
    final gradle = read('android/app/build.gradle.kts');
    expect(gradle, contains('namespace = "$id"'));
    expect(gradle, contains('applicationId = "$id"'));
    final pbx = read('ios/Runner.xcodeproj/project.pbxproj');
    final ids = RegExp(r'PRODUCT_BUNDLE_IDENTIFIER = ([^;]+);').allMatches(pbx).map((m) => m.group(1)!).toSet();
    expect(ids, {id, '$id.RunnerTests'});
  });

  test('Android manifest: localized label, minimal permissions, cleartext off (debug-only override)', () {
    final m = read('android/app/src/main/AndroidManifest.xml');
    expect(m, contains('android:label="@string/app_name"'));
    expect(m, contains('android:usesCleartextTraffic="false"'));
    expect(m, contains('android:allowBackup="false"'));
    final perms = RegExp(r'uses-permission android:name="([^"]+)"').allMatches(m).map((x) => x.group(1)).toSet();
    expect(perms, {'android.permission.INTERNET', 'android.permission.POST_NOTIFICATIONS', 'android.permission.CAMERA'});
    expect(m, contains('android:required="false"'));
    expect(read('android/app/src/debug/AndroidManifest.xml'), contains('usesCleartextTraffic="true"'));
    expect(read('android/app/src/main/res/values-ar/strings.xml'), contains('app_name'));
    expect(read('android/app/src/main/res/xml/locales_config.xml'), allOf(contains('"ar"'), contains('"en"'), contains('"it"')));
  });

  test('release signing never falls back to the debug key; no secrets or fake Firebase files committed', () {
    final gradle = read('android/app/build.gradle.kts');
    expect(gradle, contains('key.properties'));
    expect(gradle, isNot(contains('getByName("debug")')));
    expect(gradle, contains('release signing is not configured'));
    expect(File('android/app/google-services.json').existsSync(), isFalse);
    expect(File('ios/Runner/GoogleService-Info.plist').existsSync(), isFalse);
    expect(File('android/key.properties').existsSync(), isFalse);
  });

  test('iOS: no ATS exceptions, camera/photo usage strings, three localizations', () {
    final plist = read('ios/Runner/Info.plist');
    expect(plist, isNot(contains('NSAppTransportSecurity')));
    expect(plist, isNot(contains('NSAllowsArbitraryLoads')));
    expect(plist, contains('NSCameraUsageDescription'));
    for (final k in ['NSMicrophoneUsageDescription', 'NSLocationWhenInUseUsageDescription', 'NSContactsUsageDescription']) {
      expect(plist, isNot(contains(k)), reason: 'no unneeded permission $k');
    }
    for (final l in ['ar', 'en', 'it']) {
      final s = read('ios/Runner/$l.lproj/InfoPlist.strings');
      expect(s, allOf(contains('CFBundleDisplayName'), contains('NSCameraUsageDescription'), contains('NSPhotoLibraryUsageDescription')));
    }
    final pbx = read('ios/Runner.xcodeproj/project.pbxproj');
    expect(pbx, allOf(contains('InfoPlist.strings'), contains('\t\t\t\tar,'), contains('\t\t\t\tit,')));
    expect(RegExp(r'IPHONEOS_DEPLOYMENT_TARGET = (\d+)').allMatches(pbx).every((m) => int.parse(m.group(1)!) >= 13), isTrue);
  });

  test('launcher icons exist (placeholder brand art) for every density and iOS slot', () {
    for (final d in ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi']) {
      expect(File('android/app/src/main/res/mipmap-$d/ic_launcher.png').lengthSync(), greaterThan(100));
    }
    expect(File('ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-1024x1024@1x.png').lengthSync(), greaterThan(100));
  });
}
