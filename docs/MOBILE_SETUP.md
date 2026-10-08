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
| `EXPA_ENV` | `local` (default) / `staging` / `production`. Release builds refuse `local`, unknown names and non-https or local hosts for staging/production. |

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

## 11. Added screens and device-only items (T-070..T-074 client)
Routes: `/housing`, `/articles[/slug]`, `/cities[/slug]`, `/providers[/slug|/slug/request|/slug/review]`, `/my/requests`, `/learn/practice|vocabulary|exercises|scenarios`, `/patente/weak|glossary`, `/legal[/slug]` (public), `/community*` (hidden unless `GET /community/meta` succeeds). Analytics: only `appointment_clicked` is client-reported, only with the user's `analytics` consent; guide/job views are counted by the API from the `X-Analytics-Consent` header. The provider portal is now in the app (section 12).
DEVICE_VERIFICATION_REQUIRED: photo -> server OCR on a real camera/gallery image, exercise audio (no playback implemented), external links (booking, provider website, sources), TalkBack/VoiceOver on the new screens, real Arabic RTL rendering and fonts.

## 12. Added in this round (billing, provider portal, tools, Patente teacher, offline)
Routes: `/billing`, `/provider`, `/recommendations`, `/money/net-salary`, `/travel`, `/patente/topics/:slug` (cache-first + AI teacher).
- **Billing** (`GET /billing/plans` + `meta.billing_available`, `/billing/subscription`, `/billing/invoices`, `POST /billing/cancel`): when `billing_available` is false the screen says payments are not enabled and shows **no** buy button. When true, `POST /billing/checkout {plan}` returns `checkout_url`, opened only if https, in the external browser. The app never touches card data. DEVICE_VERIFICATION_REQUIRED: a real checkout round trip (no payment provider is configured here).
- **Provider portal** (`/provider`): apply (`POST /provider/apply`, verified e-mail), tabs profile (PATCH + submit), verification (image upload via the existing image picker, delete, request), leads (seen/closed), reviews (reply, moderated). Shown for any signed-in user as "Become a provider"; provider-only screens depend on the API (`403 provider_account_required` -> apply form). **Skipped**: PDF evidence upload (needs `file_picker`, a native plugin not build-verifiable here; use the web portal), services/areas editor (web only).
- **Tools**: recommendations (`GET /recommendations`, explainable reasons, non-personalized notice), net salary (`POST /money/net-salary`, honest `available:false`), travel (`GET /travel/requirements`, ISO codes typed, "no verified information" never means allowed). Source blocks and server disclaimers are shown as sent.
- **Patente**: topic screen with "save for offline" and the AI teacher (`POST /ai/ask` with `patente_topic`). `patente_question` is supported by the repository (now used from the exam screens, see 12b; the earlier limitation below no longer applies): **cannot be used from the exam screens**: exam questions expose only numeric ids, no slug (contract mismatch, see report).
- **Offline**: saved kinds are now guides, lessons, articles, cities, Patente topics, vocabulary. Personal keys (`progress`, `user`, ...) are stripped before anything is cached; the cache holds public content only and is wiped on logout; saved content is refreshed (server wins, nothing user-written to merge) when the connection returns. Honest limit: cached public content is stored as plain files in the app-private directory (excluded from backup); personal documents, chats, exports and the scanner image are never written to disk.

## 12b. Two-step verification (TOTP) and Patente "Explain this question"
- **Login**: `POST /auth/login` answering `two_factor_required` throws `TwoFactorRequired`; the controller keeps the opaque `challenge_token` in memory only (`AuthState.challenge`; never persisted, never logged) and `LoginScreen` pushes `/login/2fa` (public path). `TwoFactorChallengeScreen`: 6-digit field with `AutofillHints.oneTimeCode`, recovery-code alternative (`xxxxx-xxxxx`), a timer from `expires_in` that disables the form with an "expired" notice, and mapping of `invalid_challenge` (401 -> challenge dropped, back to login with the message), `invalid_two_factor_code` (422, challenge kept), 429 (`too_many_requests`). `POST /auth/2fa/challenge` is unauthenticated, so a 401 there never triggers the session-expired handler.
- **Settings**: Profile -> Security (`/security`): status (`GET /auth/2fa/status`), setup (`POST /auth/2fa/setup`: secret, copy buttons for secret and otpauth URI, QR via `qr_flutter` 4.1.0 / `qr` 3.0.2 - pure Dart/Flutter painting, no native code, no build-environment impact), confirm (shows the 10 recovery codes once with a warning; dropped from memory when acknowledged), disable and regenerate (password + app code or recovery code, errors shown inside the dialog; `validation_failed` on `password` is shown as "wrong password"). The Profile tile shows a hint when `/auth/me` has `two_factor_setup_required`.
- **403 `two_factor_setup_required`**: the app does not call `/admin/*`; the global `errorMessage` mapping still turns that code into a message pointing to Profile -> Security.
- **Patente**: exam questions and review items now carry `slug`; `PatenteQuestionExplain` sends `POST /ai/ask` with `patente_question` after the answer is revealed (practice feedback and the result review). It is intentionally not offered while an exam question is unanswered, and is hidden when an item has no slug.
- DEVICE_VERIFICATION_REQUIRED: OTP autofill from an SMS/keyboard suggestion, scanning the QR with a real authenticator app, clipboard behaviour. Only widget/unit tests ran (fake HTTP backend); nothing was verified on a device or against the live backend.

## 13. On-device OCR (ML Kit adapter) - BUILD_ENVIRONMENT_REQUIRED
Shipped: `OcrEngine` interface, `ManualEntryOcrEngine` (default fallback: user types/pastes), local redaction hint (`detectSensitive`), review-before-send, camera rationale. The ML Kit adapter is a template: `mobile/tool/ocr/mlkit_ocr_engine.dart.template` (pub resolution of `google_mlkit_text_recognition` was checked and succeeds, but a native plugin must not be added without a build).
Steps: (1) `flutter pub add google_mlkit_text_recognition`. (2) Android: minSdk 24 already satisfies it; nothing else. (3) iOS: set the deployment target to at least 15.5 (project is 15.0; ML Kit pods require it), create `ios/Podfile` via `flutter build ios`/`pod install`, exclude `armv7`/simulator arm64 issues per the plugin README. (4) Copy the template to `lib/features/scanner/mlkit_ocr_engine.dart`, bind it in `ocrEngineProvider`. (5) Re-run analyze/tests and exercise on devices. Limit: ML Kit on-device recognition covers Latin script; Arabic letters need the server OCR (`/documents/explain`) or manual entry.

## 14. Build readiness checklist
| Item | Status |
|---|---|
| Single id `it.expa.app` (Android namespace/applicationId, iOS app + tests); final id | DONE static (guard test); final id is an OWNER DECISION |
| App name ar/en/it: Android `values*/strings.xml` (ar "إكسبا", en/it "EXPA"), iOS `*.lproj/InfoPlist.strings` wired into `project.pbxproj` + `knownRegions` | DONE static (`plutil -lint` OK); brand name in Arabic is an OWNER DECISION; Xcode open/build BUILD_ENVIRONMENT_REQUIRED |
| Android 13 per-app language (`locales_config.xml`) | DONE static; DEVICE_VERIFICATION_REQUIRED |
| Launcher icons (all Android densities, all iOS slots) and Android splash | DONE as PLACEHOLDER: generated plain "E" on brand green (`#0F6B5C`); final brand artwork needed (OWNER). `flutter_launcher_icons` / `flutter_native_splash` were not added (they need a code-generation run that is not verified here). iOS LaunchScreen storyboard is still the template |
| Permissions: Android INTERNET, POST_NOTIFICATIONS, CAMERA (optional feature); iOS camera + photo strings only, no microphone/location/contacts | DONE static (guard test) |
| Android release signing via `key.properties` / env, never the debug key, build refused without it | DONE static; real keystore EXTERNAL CREDENTIAL; BUILD_ENVIRONMENT_REQUIRED |
| Network security: cleartext off in main manifest, on only in the debug manifest; iOS no ATS exceptions | DONE static (guard test) |
| minSdk 24 / compile+target 36 from the Flutter SDK; iOS deployment target 15.0 (ML Kit would need 15.5) | DONE static; Gradle 9.3.1 sync BUILD_ENVIRONMENT_REQUIRED |
| Podfile | Not in the repo (generated by the first iOS build / `pod install`): BUILD_ENVIRONMENT_REQUIRED |
| `--dart-define` environments: `EXPA_ENV` (local/staging/production) + `EXPA_API_BASE_URL`; release refuses `local`, http, localhost/10.0.2.2/.example/.invalid hosts, unknown names | DONE (`AppConfig.startupProblem`, tests in `config_test.dart`) |
| Firebase: no fake `google-services.json` / `GoogleService-Info.plist`; steps in section 5; guard test fails if one is committed by mistake without review | DONE static; EXTERNAL CREDENTIAL |
| Push, camera, deep links, billing checkout, provider upload, TalkBack/VoiceOver, RTL on devices | DEVICE_VERIFICATION_REQUIRED |
| `flutter build apk/appbundle/ios`, store upload, Play/App Store forms | BUILD_ENVIRONMENT_REQUIRED / OWNER |

Release example with environments: `flutter build appbundle --release --dart-define=EXPA_ENV=production --dart-define=EXPA_API_BASE_URL=https://<api-host>/api/v1 --obfuscate --split-debug-info=build/symbols`.
