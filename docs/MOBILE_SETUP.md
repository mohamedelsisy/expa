# EXPA mobile - setup, release and verification guide

Everything here that touches a device, a store or a third-party account is marked **DEVICE_VERIFICATION_REQUIRED**, **EXTERNAL CREDENTIAL** or **OWNER DECISION**. Nothing in this document has been executed on a device.

## 1. Toolchain
- Flutter 3.47.x / Dart 3.13 (repo-local SDK: `/Applications/XAMPP/xamppfiles/htdocs/expa/.tools/flutter/bin/flutter`). `export FLUTTER_SUPPRESS_ANALYTICS=true`.
- Android: Android Studio + SDK (compileSdk from Flutter), JDK 17. iOS: macOS + Xcode + CocoaPods. Neither is installed in the CI-less dev environment used so far.
- `cd mobile && flutter pub get && flutter analyze && flutter test`. `flutter gen-l10n` runs automatically. Edit strings only in `tool/strings.py`, then `python3 tool/strings.py && flutter gen-l10n`.

## 2. Dart defines
| Define | Purpose |
|---|---|
| `EXPA_API_BASE_URL` | API base, e.g. `https://api.example.com/api/v1`. Default is the cleartext emulator URL and is **refused in release builds** (the app shows a configuration error instead of starting). |

Release example: `flutter build appbundle --release --dart-define=EXPA_API_BASE_URL=https://<api-host>/api/v1 --obfuscate --split-debug-info=build/symbols`.

## 3. Identity (OWNER DECISION)
Placeholder identity `it.expa.app` is used for the Android `applicationId`/namespace and the iOS bundle id (they were `it.expa.expa_mobile` / `it.expa.expaMobile`). The final id must match the Play listing and App Store Connect record and can never change after publishing. iOS `DEVELOPMENT_TEAM` already present in the Xcode project is the owner's; verify it. Display name is `EXPA`.

## 4. Android release signing (EXTERNAL CREDENTIAL)
1. Generate an upload key outside the repo: `keytool -genkey -v -keystore ~/expa-upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload`.
2. Create `android/key.properties` (git-ignored): `storeFile=/abs/path/expa-upload.jks`, `storePassword=...`, `keyAlias=upload`, `keyPassword=...`. In CI use env vars `EXPA_KEYSTORE_FILE`, `EXPA_KEYSTORE_PASSWORD`, `EXPA_KEY_ALIAS`, `EXPA_KEY_PASSWORD`.
3. Without these, any `assemble*Release` / `bundle*Release` / `package*Release` task **fails with an explicit message**; the debug key is never used for release.
4. Enable Play App Signing in Play Console. Release builds have R8 minify + resource shrinking enabled (DEVICE_VERIFICATION_REQUIRED: run a release build and exercise login, push and links to catch missing keep rules).
5. `android:allowBackup=false`, data-extraction rules and `usesCleartextTraffic=false` are set in the main manifest; only the debug manifest allows cleartext for the emulator host.

## 5. Firebase / push (EXTERNAL CREDENTIAL)
The app ships `PushService`, `PushRegistrar` and the opt-in UI. Only `NoopPushService` is bound, so push is off. To enable (the adapter is in `tool/fcm/fcm_push_service.dart.template`, uncompiled):
**Android**: create a Firebase project; add an Android app with the final application id; download `google-services.json` to `android/app/` (git-ignored here, supply per environment); add the Google services Gradle plugin (`com.google.gms.google-services`) to `android/settings.gradle.kts` and `android/app/build.gradle.kts`; `flutter pub add firebase_core firebase_messaging`; call `Firebase.initializeApp()` in `main()`; copy the template to `lib/core/push/fcm_push_service.dart` and bind it in `pushServiceProvider`. `POST_NOTIFICATIONS` is already declared.
**iOS**: add an iOS app with the final bundle id; put `GoogleService-Info.plist` in `ios/Runner/` (Xcode target membership; git-ignored here); in the Apple Developer account create an APNs Auth Key (.p8) and upload it in Firebase > Cloud Messaging; in Xcode > Signing & Capabilities add **Push Notifications** and **Background Modes > Remote notifications** (creates `Runner.entitlements` with `aps-environment` and the `UIBackgroundModes` plist entry); `pod install`.
**Backend**: `LogPushSender` (task T-016b) must be replaced by a real FCM sender; `POST /devices` requires the `push_notifications` consent (the app handles `consent_required` with a one-tap grant).
DEVICE_VERIFICATION_REQUIRED: permission prompt, token registration, foreground banner, tap routing, token rotation, logout unregistering, all on real Android 13+ and iOS devices.

## 6. Universal / App Links (EXTERNAL INFRASTRUCTURE)
E-mails link to the web host: `/{locale}/reset-password?token&email` and `/{locale}/verify-email?url=<signed API URL>`; the router handles them signed in or out.
- **Android**: the manifest intent filter uses host `${expaLinkHost}` (default `app-links.expa.invalid`, a reserved TLD so nothing matches by accident). Build with `-PexpaLinkHost=<web host>` (or set it in `android/gradle.properties`). Publish `https://<host>/.well-known/assetlinks.json` with package `it.expa.app` and the SHA-256 of the Play App Signing key (and the upload key for testing).
- **iOS**: add the **Associated Domains** capability with `applinks:<web host>`; publish `https://<host>/.well-known/apple-app-site-association` with the Team ID + bundle id and paths `/*/reset-password`, `/*/verify-email`, `/reset-password`, `/verify-email`. Not wired in the Xcode project because it needs the final host and a provisioning profile with the capability.
- Until the files are served, links open the web pages (which still work). DEVICE_VERIFICATION_REQUIRED: verified-link behaviour (`adb shell pm get-app-links`), cold start and warm start.

## 7. Camera / scanner
`CAMERA` (+ `uses-feature required=false`) in the manifest; `NSCameraUsageDescription` and `NSPhotoLibraryUsageDescription` in Info.plist (English + Italian). No OCR engine is bundled: plug an `OcrEngine` (e.g. ML Kit text recognition) via `ocrEngineProvider`. The backend endpoint `POST /api/v1/documents/explain` is a **provisional contract** (see `document_explainer_api.dart`); the app shows "service not available yet" on 404. DEVICE_VERIFICATION_REQUIRED: camera permission flow on both platforms and the temporary-file cleanup after capture.

## 8. Store listing prerequisites (OWNER)
Privacy policy and terms URLs (legal approval pending, see MVP_AUDIT), Play Data Safety form and App Store privacy labels (data collected: account e-mail/name, profile, documents metadata, AI chats, push token, optional photos/text sent for explanation), age rating, screenshots in ar/en/it incl. RTL, app icon/splash (template defaults today), support e-mail, account-deletion URL (in-app deletion exists), export compliance answer (HTTPS only).

## 9. Test status and what tests cannot prove
`flutter analyze`: no issues. `flutter test`: see the final counts in the engineering report; widget tests cover ar/en/it and 320px/1.5x text for the new screens. They do not prove: real keystore/Keychain behaviour, camera, push, link verification, performance, TalkBack/VoiceOver, real fonts/RTL shaping on devices, release shrinking.

## 10. Known follow-ups
Dependency upgrades (flutter_secure_storage, go_router, riverpod majors), bundled Arabic font, crash reporting endpoint (needs a consented, scrubbed collector), FLAG_SECURE on document screens, certificate pinning decision, dark theme, ICU plurals for Arabic counts.
