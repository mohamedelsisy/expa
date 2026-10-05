# EXPA Mobile (Flutter) - Production Readiness Audit

Scope: `/Applications/XAMPP/xamppfiles/htdocs/expa/mobile` (Flutter 3.47.6 / Dart 3.13, `expa_mobile` 1.0.0+1).
Audit date: 2026-10-05. Method: static code review, comparison with `backend/routes/api.php`, controllers, resources and `docs/API_SPEC.md`, plus `flutter analyze`, `flutter test`, `flutter test --coverage`, `flutter pub outdated` and four throw-away probe tests.
All commands were run on a **copy** of `mobile/` in a scratch directory. No source file in the repository was modified; this document is the only file created.

**What this audit does NOT claim:** no APK/AAB/IPA was built (no Android SDK, no Xcode) and nothing was run on a device or emulator. Everything in section 3 is unverified until it is.

## 1. Summary

| Severity | Count | Meaning |
|---|---|---|
| P0 | 1 | Cannot ship to a store / critical |
| P1 | 6 | High: data exposure, app can become unusable, spec-mandated MVP capability missing |
| P2 | 13 | Medium |
| P3 | 14 | Low / hardening / polish |
| **Total** | **34** | |

Tool results (verified):
- `flutter analyze`: **No issues found**.
- `flutter test`: **43 tests, all passing**.
- Line coverage (only for files loaded by tests): **476 / 1710 lines = 27%**. Ten feature screens are at 0-3%.
- `pubspec.lock` is unchanged after `flutter pub get` (reproducible).

Overall: the code base is small (about 4,100 lines of Dart in 44 files), clean, consistently structured, and has good foundations (typed errors, https-only URL opener, route allow-list, no token logging, localized error mapping, ARB parity). The blocking gaps are release configuration (signing, backup, base URL), resilience of the session bootstrap, cross-account state leakage in the Ask screen, and the fact that push notifications, deep links, offline support and several spec modules do not exist yet.

### Top findings
1. MOB-1 (P0) Release build is signed with the debug key; applicationId is the template placeholder.
2. MOB-2 (P1) Any non-`ApiException` during session bootstrap leaves the app on the splash screen forever (reproduced).
3. MOB-3 (P1) Android `allowBackup` is not disabled while the Sanctum token sits in `flutter_secure_storage` (restore-from-backup produces exactly the MOB-2 failure).
4. MOB-4 (P1) Default API URL is cleartext `http://10.0.2.2:8000`; nothing prevents a release build from shipping it.
5. MOB-5 (P1) Push notifications and device-token registration do not exist (stub only); reminders are a core promise.
6. MOB-18 (P1) AI chat state survives logout; the next user on the device sees the previous user's conversation (reproduced).
7. MOB-7 (P1) The app has no deep-link / app-link support; password reset and e-mail verification can only be completed in a browser.

## 2. Findings verified by static / test analysis

Classification vocabulary: CODE FIX, CONFIGURATION, EXTERNAL CREDENTIAL, EXTERNAL INFRASTRUCTURE, SCOPE GAP (feature in the spec but not built), TEST GAP, DOCS.

### 2.1 Release / platform configuration

**MOB-1 - P0 - CONFIGURATION + EXTERNAL CREDENTIAL - Release build signed with the debug key; template applicationId**
`android/app/build.gradle.kts:34-36` (`// TODO: Add your own signing config`, `signingConfig = signingConfigs.getByName("debug")`) and `:18-19` (`// TODO: Specify your own unique Application ID`, `applicationId = "it.expa.expa_mobile"`). No `key.properties`, no `.jks`, no `signingConfigs.release` exists anywhere under `android/`. Play Console rejects debug-signed bundles and an updatable app needs a stable upload key.
Fix: create an upload keystore outside the repo, add `signingConfigs.release` reading `key.properties`/CI secrets, remove the TODOs, decide the final application id (see MOB-20 for the iOS mismatch) and enable Play App Signing. Needs a human to generate/store the keystore (EXTERNAL CREDENTIAL).

**MOB-3 - P1 - CONFIGURATION - Android auto-backup not disabled for an app that stores a bearer token**
`android/app/src/main/AndroidManifest.xml:3-6`: `<application>` has no `android:allowBackup`, `android:dataExtractionRules` or `android:fullBackupContent`, so backup defaults to enabled. `flutter_secure_storage` (9.2.4) keeps its data in app-private preferences encrypted with a Keystore key. Preferences can be backed up while the Keystore key cannot, so a restored/migrated device holds ciphertext it cannot decrypt, which throws on read (see MOB-2).
Fix: set `android:allowBackup="false"` (or exclude the secure-storage prefs file via `dataExtractionRules` / `fullBackupContent`), per the plugin's README guidance. Confirm on a device (section 3).

**MOB-4 - P1 - CODE FIX + CONFIGURATION - Default API base URL is cleartext and points at the emulator host**
`lib/core/config.dart:6-9`: `defaultValue: 'http://10.0.2.2:8000/api/v1'`. A release build made without `--dart-define=EXPA_API_BASE_URL=https://...` compiles, ships and cannot reach any server (and would transmit credentials in clear text if cleartext were ever allowed). Nothing asserts the scheme. Android release target 36 blocks cleartext by default and iOS ATS blocks it (no exceptions are declared; see MOB-21), which makes the failure a broken app rather than a leak, but it is still a one-flag mistake away.
Fix: no default for release (`kReleaseMode` + `assert`/startup check that the scheme is https), keep the emulator default only for debug, wire the define into CI for staging/production, and explicitly set `android:usesCleartextTraffic="false"` plus a `networkSecurityConfig` that permits cleartext only in the debug source set (`android/app/src/debug`).

**MOB-20 - P2 - CONFIGURATION - Inconsistent / template bundle identity**
Android `applicationId` is `it.expa.expa_mobile` (build.gradle.kts:19); iOS `PRODUCT_BUNDLE_IDENTIFIER` is `it.expa.expaMobile` (`ios/Runner.xcodeproj/project.pbxproj:387,569,592`; tests `.RunnerTests`). They differ, which complicates Firebase/APNs/Universal-Link registration. iOS `CFBundleDisplayName` is `Expa Mobile` (`ios/Runner/Info.plist:9-10`) while Android shows `EXPA` and the brand is "EXPA". A personal `DEVELOPMENT_TEAM = 4KF9YZZ4MX` is committed in the project (pbxproj:380,562,585) with `CODE_SIGN_STYLE = Automatic`. App icons/launch image are not verified to be branded (probably the Flutter template defaults).
Fix: choose one reverse-DNS id for both platforms, rename the iOS display name to `EXPA`, move signing team to an xcconfig/CI, supply real icons and splash.

**MOB-21 - P3 - CONFIGURATION - Permissions: current set is minimal and correct; future usage strings/entitlements are absent**
Android main manifest declares only `INTERNET` (line 2) - correct for the current feature set; `<queries>` for `https` VIEW intents (lines 40-49) is correct for `url_launcher` on Android 11+. iOS `Info.plist` declares no usage descriptions, no `UIBackgroundModes`, no entitlements file (no `aps-environment`, no Associated Domains). That is correct today but means the planned scanner and push cannot be added without: Android `CAMERA`, `POST_NOTIFICATIONS` (Android 13+); iOS `NSCameraUsageDescription` (ar/en/it via `InfoPlist.strings`), `NSPhotoLibraryUsageDescription` if gallery import is added, Push Notifications capability and `remote-notification` background mode. ATS: no `NSAppTransportSecurity` key, so iOS defaults to enforcing https (good). `minSdk = flutter.minSdkVersion` = 24, `targetSdk = flutter.targetSdkVersion` = 36, `compileSdk` 36 (from the SDK's `FlutterExtension.kt`); iOS deployment target 15.0. iPhone Info.plist allows landscape (lines 56-61) although the UI is designed portrait-first (see section 3).
Fix: document the permission plan; add strings together with the feature, not before (data minimisation).

**MOB-22 - P2 - CODE FIX + DEPENDENCY - Dependency health**
`flutter pub outdated` (verified): direct dependencies behind a major version: `flutter_riverpod` 2.6.1 (latest 3.4.3), `go_router` 14.8.1 (18.0.2), `flutter_secure_storage` 9.2.4 (11.2.0), `cupertino_icons` 1.0.9 (2.0.0). Dev deps up to date. Discontinued transitive packages: `flutter_secure_storage_macos`, `js`. `intl: any` in `pubspec.yaml:41` is unconstrained (it is pinned by `flutter_localizations` in practice, but `any` hides drift). `pubspec.lock` is committed and reproducible (good). All packages come from pub.dev; no git/path dependencies. No in-app open-source licence page (`showLicensePage` not used) although every dependency carries a notice obligation (BSD/MIT-style); licences were not machine-audited here.
Fix: plan a controlled upgrade of `flutter_secure_storage` first (it holds the credential; read its changelog for storage-backend/migration changes before bumping), then go_router/riverpod; constrain `intl`; add a licences screen (`showLicensePage`) and a CI `pub outdated`/`pub audit`-style check.

### 2.2 Authentication, token storage and lifecycle

Verified good:
- Token stored via `flutter_secure_storage` behind `SecureStore` (`lib/core/storage/secure_store.dart`), key `expa.token`; no use of shared_preferences or any plaintext store.
- No `print`, `debugPrint`, `LogInterceptor`, or `dart:developer` anywhere in `lib/`; `ApiException.toString()` omits the message and body; the token is never interpolated into UI or errors.
- Bearer token is read per request (`api_client.dart:41`); `401` with a token triggers `onUnauthorized` except for `invalid_credentials` (tested). Logout always clears the token locally even if the server call fails (tested).
- Login/register use the API contract exactly (see 2.3).

**MOB-2 - P1 - CODE FIX - Session bootstrap is not resilient: unexpected exceptions strand the app on the splash screen (reproduced)**
`lib/main.dart:13` calls `bootstrap()` without `await` or error handling; `lib/features/auth/auth_controller.dart:114-131` catches only `UnauthorizedException` and `ApiException`. A probe test with a secure store that throws on `read` (what a decrypt failure after restore, a Keystore reset or a corrupted Keychain item raises) ended with `status == AuthStatus.unknown` and an unhandled exception; the router (`app.dart:38`) keeps `/splash` for `unknown`, so the user can never reach the login screen. Reinstalling is the only recovery.
Fix: wrap the whole bootstrap in `try/catch (Object)`; on storage errors delete the key and go to `unauthenticated`; add a timeout so splash cannot last longer than the 15 s connect timeout; add a test with a throwing store.

**MOB-8 - P2 - CODE FIX - Controllers only catch `ApiException`; any other failure leaves the UI busy forever (reproduced for Ask)**
`ask_controller.dart:62-84` (`busy: true` then `on ApiException`), `auth_controller.dart:143-154` (`_authenticate`), `forgotPassword` (186-196). A response with an unexpected shape (captive portal returning HTTP 200 HTML parses to an empty map, then `d['token'] as String` throws `TypeError`; a malformed `message` map) is not an `ApiException`. The probe with a `TypeError` left `AskState.busy == true`, so the send button and input stay disabled until the app restarts; login would show a permanent spinner. Same for `saveToken` throwing a platform exception.
Fix: add `catch (_)` branches (map to `ApiException`/generic failure) or parse defensively inside repositories and throw a typed `UnknownApiException`; use `finally` to reset busy.

**MOB-9 - P2 - CODE FIX - Offline cold start looks like a logout**
`auth_controller.dart:128-129`: on any `ApiException` other than 401 (network/timeout/5xx) `/auth/me` failure sets `unauthenticated` and routes to the login screen while the valid token stays in storage. A user who opens the app without connectivity is asked to sign in (and cannot, offline). Worst case waits up to 15 s on splash first.
Fix: on network/timeout/5xx keep the token, enter an `authenticated-offline` state (cached last user from secure storage or a minimal profile) and retry `/me` when connectivity returns; only 401 should end the session.

**MOB-23 - P3 - CODE FIX - Secure storage options left at defaults; token survives reinstall on iOS**
`secure_store.dart:11-15`: `const FlutterSecureStorage()` with no `IOSOptions`/`AndroidOptions`. On iOS Keychain items persist across app deletion by default, so after a reinstall the app can restore a stale token (and a deleted account's token). Default accessibility is not `*_this_device`, so the item may migrate with encrypted device backups.
Fix: set `IOSOptions(accessibility: KeychainAccessibility.first_unlock_this_device)`, store a first-run marker and clear the Keychain on first launch after install, and set explicit `AndroidOptions`. Verify on device (section 3).

**MOB-24 - P3 - CODE FIX - Auth screen polish (autofill, shared error state)**
`AuthState.error` is shared by login, register and forgot screens and `clearError()` (auth_controller.dart:208) is never called from the UI, so a failed login's error banner is still displayed after navigating to Register or Forgot password (`auth_screens.dart:80,160,210`). The register password fields have no `AutofillHints.newPassword`, no `AutofillGroup`, and only the login screen sets `autofillHints`; password fields do not turn off suggestions/autocorrect explicitly (`obscureText` implies it, but e-mail/name fields do not set `autocorrect: false`). Client password rule is only length >= 10 (`auth_screens.dart:168`), while the backend also requires letters and numbers (`AppServiceProvider.php:150-155`), and `GET /meta` (which exposes the rule) is unused; the server error is shown, so this is cosmetic.
Fix: clear errors on screen entry/dispose, add `AutofillGroup` + `newPassword`, read `/meta` password policy.

**MOB-25 - P3 - CODE FIX - Destructive actions have little friction**
`profile.dart:42` logout is a single tap without confirmation; account deletion (`profile.dart:106-129`) requires the password (good) but no confirmation dialog or typed phrase, and the password field has no `autofillHints`. After a successful delete the app calls `logout()`, whose server call 401s (account locked) and is handled, so the sequence works.
Fix: add a confirm dialog explaining that erasure is irreversible.

### 2.3 API integration vs backend contract

Verified to match (path, verb, payload, response fields, envelope):
`POST /auth/login|register|logout|forgot-password|resend-verification`, `GET /auth/me`, `GET /dashboard`, `GET /dashboard/tasks`, `PUT /dashboard/tasks/{key}`, `GET /guides`, `/guides/categories`, `/guides/{slug}`, `GET /document-types`, `GET|POST|DELETE /my-documents`, `GET /cities`, `GET /appointments/hub`, `GET /italian/daily|lessons|lessons/{slug}`, `POST /italian/lessons/{slug}/progress`, `GET /jobs`, `/jobs/{id}`, `POST /jobs/{id}/apply-click`, `GET /notifications`, `POST /notifications/{uuid}/read|read-all`, `POST /ai/ask`, `GET /ai/usage`, `GET|PATCH /profile`, `/profile/options`, `POST /profile/onboarding/complete`, `GET|PUT /profile/consents`, `GET /privacy/purposes`, `GET /profile/export`, `DELETE /profile`.
- Envelope: `{data, meta}` / `{error:{code,message,details}}` parsed correctly, including `meta: []` and 204. Error codes consumed: `invalid_credentials`, `unauthenticated`, `consent_required`, `email_not_verified`, `account_suspended`, `forbidden`, `not_found`, `validation_failed` (details map of lists), `too_many_requests`, `ai_limit_reached`, `server_error`; any other 4xx falls back to the server message.
- Query-param limits respected: guides `per_page` 20 (max 50), jobs 20 (max 50), documents 50 (max 100), notifications 20 (max 100), lessons 30 (max 100).
- Headers: `Authorization: Bearer`, `Accept-Language` and `?lang=` on every request, `X-Client: mobile` (used by the backend consent log).
- Registration sends `accept_terms`, `accept_privacy`, `password_confirmation`, `locale`, `device_name` as `RegisterRequest` requires.
- Documents/consents/AI conform to the contract; HTTPS-only opening of `apply_url`, `source.url` and `booking.url`; the job flow never claims EXPA applied (`submitted_by_expa:false`).

Mismatches / gaps:

**MOB-5 - P1 - CODE FIX + EXTERNAL CREDENTIAL - Push notifications and `POST /devices` are not implemented**
`lib/core/push/push_service.dart:4-19` has only `NoopPushService` (register returns null, unregister does nothing); `providers.dart:17` binds it; `profile.dart:40` shows a "push not enabled" note. No FCM/APNs dependency, no `google-services.json`/`GoogleService-Info.plist` (verified absent), no permission prompt. Backend contract (DeviceController.php, routes api.php:136-137, API_SPEC.md:36): `POST /devices {token: string 8..512, platform: "ios"|"android"|"web"}` returns 201 `{data:{registered:true}}`; it requires the `push_notifications` consent (otherwise 403 `consent_required`); `DELETE /devices {token}` requires auth and the exact token. The interface cannot satisfy the DELETE (see MOB-6), there is no token-refresh listener, no consent step, and `CLAUDE.md` section 23/61 lists push as a primary reminder channel. Blocked task T-016b (Firebase project) is the external dependency.
Fix (once credentials exist): add `firebase_messaging`, request permission after the user grants `push_notifications` consent in the privacy screen, register on login and on token refresh with `platform` = `android`/`ios`, handle foreground/tap routing through `routeForTarget`, add `POST_NOTIFICATIONS` and the iOS capability/entitlement (MOB-21).

**MOB-6 - P2 - CODE FIX - Logout ordering makes device-token removal impossible (latent)**
`auth_controller.dart:166-184`: `logout()` first calls `/auth/logout` (token revoked), then `_clear` deletes the stored token (line 179) and only then calls `pushService.unregister()` (181). `DELETE /devices` needs both an authenticated request and the device token; at that point the bearer token is already gone and `PushService.unregister()` takes no token argument. With a real push service the device would stay registered to the previous account and keep receiving that user's reminders on a shared phone (privacy issue).
Fix: change the interface to `unregister(String token)`, call `DELETE /devices` before `/auth/logout`, then clear storage.

**MOB-7 - P1 - CONFIGURATION + CODE FIX + EXTERNAL INFRASTRUCTURE - No deep links / app links**
No `intent-filter` for custom scheme/https links in the manifest, no URL types or Associated Domains on iOS, and no handling in go_router. Password reset (`/auth/reset-password`) and e-mail verification (`/auth/verify-email/{id}/{hash}`, a signed API URL) are e-mail links; the mobile app has no reset-password screen at all and the "verify" flow relies on the user opening the link in a browser and then pressing "I have verified" (`auth_screens.dart:259-265`). README acknowledges this. Notification taps (when push exists) also need a link/route path.
Fix: host `/.well-known/assetlinks.json` and `apple-app-site-association` on the web domain (EXTERNAL INFRASTRUCTURE), add intent filters/associated domains and `go_router` routes for `/reset-password` and verification result; make the web verification page redirect into the app.

**MOB-13 - P2 - CODE FIX - Server-provided action targets are silently dropped or degraded**
`lib/core/routes.dart` maps only: `guides[/slug]`, `my-documents`, `onboarding`, `privacy-settings`, `learn-italian|italian` (-> `/learn`, slug lost), `jobs` (-> `/jobs`, id lost), `appointments`, `notifications`. The backend emits (ActionSuggester.php / SourceVerifier.php): `government/services/{slug}`, `government/offices/{slug}`, `appointments/guides/{slug}`, `patente`, `patente/topics|categories/{slug}`, `study`, `study/universities|programs|scholarships/{slug}`, and `search?q=...`. These return `null`, so AI answers that cite such sources show a source card but the suggested-action chip disappears with no explanation, and `appointments/guides/{slug}` / `learn-italian/...` lose their slug. This is intentional allow-listing (and the test asserts unsafe targets return null) but the product impact is not documented.
Fix: add routes for the modules as they ship; until then show a non-interactive chip or "open on web" for allow-listed prefixes; keep the allow-list.

**MOB-14 - P2 - CODE FIX - Appointment hub under-uses the API response**
`appointments.dart:10,63`: the dropdown shows raw enum keys (`questura`, `agenzia_entrate`...) as `Text(t)` (not localized; API provides `office_type_label`), and the list is a hard-coded subset of `OfficeType` (missing `university`, `other`). The response's `guide` (steps/documents for booking), per-office `notice`, `official_url`, `phone`, `email`, `postal_code` are ignored; the screen shows a local string (`l.apptNotice`) although README says it "always repeats the API's notice". The "never pretend EXPA booked" requirement is met (redirect only).
Fix: fetch labels from the API (or localized ARB keys), render `guide` and the official URL/phone, use the API `notice`.

**MOB-15 - P3 - CODE FIX - Lesson items rendered generically**
`learn.dart:153-154`: every non-`it`/`speaker` key of a lesson item is printed raw (`gloss`, `example_it`, `example_gloss`, possibly future/internal keys). `example_it` (Italian) is rendered with the UI's text direction, so in Arabic it is right-aligned/bidi-reordered, while `it` is forced LTR (line 152). No audio/pronunciation, no quiz/exercise support, and a lesson is marked `started` on every open (`learn.dart:131-133`, harmless server-side because completed never regresses).
Fix: model lesson items explicitly, force LTR on all Italian fields.

**MOB-26 - P2 - CODE FIX - Onboarding save can erase profile data**
`onboarding.dart:72-81`: `PATCH /profile` always sends every field, using `null` for unanswered ones. The form is pre-filled only after `profileProvider` loads (`_seed`, lines 45-56, 123). If the profile request is slow or failed and the user taps Save (only `segment` is validated), the backend treats `null` as "clear" (`ProfileController::update`, clearing is always allowed) and wipes existing nationality/city/levels/goals. `nationality` is a free-text 2-letter box (`onboarding.dart:150`) that silently becomes `null` if the user types a country name.
Fix: disable Save until the profile has loaded, send only changed fields, use a country picker.

**MOB-27 - P3 - CODE FIX - Misc contract/UX details**
(a) Notification list ignores `meta.unread` (no badge on the bell, `dashboard.dart:34`) and notification `type`; (b) dashboard tasks ignore the `route` field and rely on guide slug only (`dashboard.dart:195`); (c) a 404 from `/ai/ask` with a stale `conversation_id` (`AiController::ask`, `findOrFail`) leaves `conversationId` set so every later question fails (`ask_controller.dart:62-84`); (d) the Ask input is cleared before the request (`ask_screen.dart:42`), so the user loses the text on failure; (e) `Retry-After` on 429 is ignored and there is no retry/backoff; (f) `jobs/{id}` `apply_url` with `http://` is blocked as "unsafe" (`safe_url.dart:8`), which may block real employer URLs; (g) `PagedView` replaces the whole body (including the search box) with the error view when page 1 fails (`paged_view.dart:92`); (h) `GET /meta` unused.

### 2.4 Data privacy / GDPR on the client

**MOB-10 - P2 - CODE FIX - Data export is requested but never delivered**
`profile.dart:88-104`: `GET /profile/export` is called and only `r.map.length` is displayed ("Your data is ready (N sections). It was not saved on this device."). The user receives nothing, so GDPR Art. 15/20 portability is not satisfied on mobile, and the success message is misleading. Not writing PII to disk by default is a defensible choice, but a share-sheet/save-as flow (user-initiated) or an e-mail delivery is needed.
Fix: add an explicit "Save/Share export" action (e.g. `share_plus` with the JSON) or deliver via e-mail from the backend.

No analytics/crash SDKs are present (privacy-positive), but also no crash reporting (MOB-30).

### 2.5 State management and architecture

Verified good: feature-first layout, a single `ApiClient`, repository interfaces for auth and Ask (test fakes), Riverpod providers, `autoDispose` on screen-scoped `FutureProvider`s so dashboard/profile/consent data does not outlive the screen, go_router with a status-driven redirect (a probe confirmed register -> `/verify` works).

**MOB-18 - P1 - CODE FIX - Ask EXPA state is not scoped to the session; previous user's chat visible to the next login (reproduced)**
`ask_controller.dart:87`: `askControllerProvider` is a plain `NotifierProvider` (not `autoDispose`, not invalidated on logout) and `AuthController._clear` (`auth_controller.dart:178-184`) resets only the token and push. Probe: log in, ask a question, log out -> `entries.length == 2` and `conversationId == 1` remain. A second account on the same device sees the previous user's questions and AI answers (which may contain immigration details) and continues that server conversation id (the backend 404s on another user's conversation, so the new user's next question fails, compounding MOB-27c). `ProviderContainer` in `main.dart:11` lives for the whole process.
Fix: `ref.invalidate(askControllerProvider)` (and any future user-scoped provider) in `_clear`, or make the provider depend on the current user id; add a test.

**MOB-28 - P3 - CODE FIX - Reuse / structure**
Feature screens use untyped `Map<String, dynamic>` (`'${j['title']}'` everywhere) instead of models; a field rename in the API silently renders `null` text. `routerProvider` in `app.dart` is declared next to the app widget. `NotificationsScreen`, `DocumentsScreen` etc. use `ref.read(apiClientProvider)` directly in widgets rather than repositories, which is why they are untested (MOB-31). No global error handler (`FlutterError.onError`, `PlatformDispatcher.instance.onError`).
Fix: introduce small models/repositories per feature as they are touched, add a root error handler (also see MOB-30).

### 2.6 Localization and RTL

Verified good:
- ARB parity: `app_ar.arb`, `app_en.arb`, `app_it.arb` each have **224 keys**, identical key sets, no empty values, identical placeholders (script-checked and covered by `test/l10n_test.dart`). Arabic is the template (`l10n.yaml`), default locale `ar`, RTL by `directionFor`.
- No hard-coded user-visible strings in `lib/` (grep of `Text('...')`, `labelText`, `hintText`, `tooltip`, `label:` literals): the only literals are the `-` placeholder (`—`), bullets (`•`), the match glyphs `✓ △ ✗ ?` (paired with a localized word for semantics) and the source ordinal `[n]`. Server text arrives already localized via `?lang=`.
- Directional layout: edge insets use `EdgeInsetsDirectional`, alignment uses `AlignmentDirectional`, `TextAlign.end`; the only `fromLTRB` (`ask_screen.dart:70`) is symmetric. Directional icons (`chevron_right`, `send`, `logout`) are Material icons flagged `matchTextDirection`, so they mirror in RTL. Italian terms/emails/URLs are forced `TextDirection.ltr` where appropriate, and chat bubbles pick direction from the text (`_autoDir`). Login renders without overflow in ar/en/it including 1.5x text (test), and a probe rendered the dashboard and match view at 2.0x text on a 360 px width in all three locales with no overflow.

Findings:

**MOB-29 - P3 - CODE FIX - Localization quality gaps**
(a) Arabic count strings are not ICU plurals: `daysRemaining` = "متبقي {n} يوم", `expiredDaysAgo`, `minutes` use the singular noun for every count (should be أيام / يوم / يومان by number); English/Italian also lack singular forms ("1 days left"). (b) Numerals: client formatting (`format.dart`) uses `intl`, which may produce Arabic-Indic digits for `ar`, while server-provided strings (task hints, notification bodies) use Latin digits, so a single screen may mix digit systems. (c) `Icons.checklist_rtl` is used as the selected icon of the Tasks tab (`shell.dart:24`) in every locale, so in LTR the selected/unselected glyphs face opposite directions. (d) Appointment office types and Learn level chips (`A0`...) are not localized (MOB-14). (e) Fonts are platform fonts (`app_theme.dart:52-53`): Arabic typography and glyph coverage rely on device fallback.
Fix: use ICU `{n, plural, ...}` in the ARB files, decide on a digit policy, bundle IBM Plex Sans Arabic/Inter as the design system specifies.

### 2.7 Notification architecture
See MOB-5/6/27(a). In-app notification centre works (list, mark read, mark all read, CTA routing through the allow-list). The abstraction (`PushService`) is the right seam but its signature is insufficient (no token in `unregister`, no permission state, no token-refresh stream, no tap callback). `POST /devices` contract: see MOB-5.

### 2.8 Error handling, empty/loading states
Verified good: `errorMessage()` maps every `ApiException` subtype to a localized message; `LoadingView`, `ErrorView` (with retry), `EmptyView`, `AsyncBody`, `PagedView` (loading/error/empty/pull-to-refresh/load-more with stale-response guard); Ask failure shows the spec sentence plus a "browse guides" fallback and never invents an answer (`ask_controller_test.dart`); AI/limit/e-mail-not-verified are distinct states. Gaps: MOB-8, MOB-9, MOB-27(c,d,g), MOB-30.

**MOB-30 - P2 - CODE FIX - No global error handling or crash reporting**
No `FlutterError.onError`, `PlatformDispatcher.onError`, `runZonedGuarded` or `ErrorWidget.builder` override. Unhandled async errors (as in MOB-2) disappear silently in release; a build error shows the default grey screen. CLAUDE.md section 52 requires meaningful user-facing messages and section 42 privacy-conscious monitoring.
Fix: install handlers that show a localized fallback and send scrubbed reports to a self-hosted/consented crash endpoint (no PII, no tokens).

### 2.9 Accessibility (static)
Verified: minimum tap target 48 px is set globally for filled/outlined/text/icon buttons (`app_theme.dart:43,93-131`) and `MaterialTapTargetSize.padded`; `NavigationBar` has labels; icon-only buttons carry tooltips (`notifications`, `delete`, `send`, date pickers); `ScoreRing` and `MatchView` provide semantic labels; `Notice` uses icon + colour, not colour alone; `LoadingView` has a localized label; text uses theme scaling (no `textScaleFactor` clamping, no fixed-height text containers in the audited screens except the 400 px error box in `dashboard.dart:43`). Colours in `Tokens` appear chosen for contrast (e.g. muted `#625C54` on `#F7F5F2`); contrast was not measured.

**MOB-32 - P3 - CODE FIX - Accessibility gaps**
Only 4 files use `Semantics`. Error `Notice`s and snackbars are not live regions, so TalkBack/VoiceOver users are not told that login failed; form fields rely on `labelText` only; the `ChoiceChip` filter rows have no semantic grouping; the Ask message cards are not marked as headings/regions; `ListTile`s containing a trailing `IconButton` (documents) merge semantics in ways not tested. No dark theme or high-contrast theme is defined (`AppTheme.of(locale)` only), so system dark mode renders the light palette.
Fix: add `Semantics(liveRegion: true)` to error notices, add dark theme, run a TalkBack/VoiceOver pass (section 3).

### 2.10 Offline behaviour

**MOB-33 - P2 - SCOPE GAP - No offline support**
No local cache, no connectivity awareness, no saved guides/lessons (CLAUDE.md section 64 asks for saved guides and selected lessons offline). Every screen refetches (autoDispose providers), `PagedView` loses its list on locale change, and the app shows only "no internet" with a retry button. Combined with MOB-9 the app is unusable offline even for content previously viewed.
Fix: introduce a small cache (e.g. sqflite/drift or a JSON store) for guides/lessons/dashboard, with explicit "saved" semantics and the no-PII-at-rest rule.

### 2.11 Security hardening (beyond MOB-3/4/23)

**MOB-34 - P3 - CONFIGURATION + CODE FIX - Additional hardening not present**
No certificate pinning (acceptable for MVP, document the decision), no `FLAG_SECURE`/screenshot protection on document screens, no root/jailbreak or biometric re-auth gate for the documents area, no `allowBackup=false` (MOB-3), no `usesCleartextTraffic="false"` (MOB-4), no R8/obfuscation flags (`--obfuscate --split-debug-info` should be part of the release script), no ProGuard keep rules reviewed. URL handling is good: only absolute https URLs without userinfo open, in the external browser.

### 2.12 Test coverage

**MOB-31 - P2 - TEST GAP - Coverage is concentrated on core infrastructure**
43 tests across 9 files cover: API client envelope/401/timeout behaviour (92% lines), auth controller with a fake repository, Ask controller/message rendering, route allow-list, l10n parity, login screen in 3 locales at 1.5x, app shell start in RTL.
Gaps (measured line coverage, files exercised by tests only): dashboard 1%, documents 1%, guides 0%, jobs 1%, learn 1%, notifications 3%, onboarding 0%, profile/privacy 2%, appointments 1%, shell 3%, `PagedView` 0%, `common.dart` 32%, `auth_screens.dart` 40%, `auth_controller.dart` 49%; overall about 27% of the measured lines. Not tested at all: `ApiAuthRepository` request payloads (the contract with `LoginRequest/RegisterRequest`), `FlutterSecureStore`/`SessionStore`, 403 consent flows, account deletion, router redirects for the unverified-email state, any integration test, any golden test, any contract test against the Laravel API (e.g. replaying `docs/API_SPEC.md` fixtures). The probes in this audit (MOB-2, MOB-8, MOB-18) are not in the suite.
Fix: add tests for the three reproduced bugs first, then widget tests per screen with fake repositories, a fixture-based contract test, and an `integration_test` smoke run (login -> dashboard -> ask) for CI emulators.

### 2.13 Scope gaps against the product spec (informational)
README and code confirm these CLAUDE.md MVP/mobile items do not exist yet: camera scanner/OCR, Patente (lessons, exams, progress), study finder, housing/rental checker, saved jobs / job profile, document attachments upload and reminder-offset editing, AI conversation history, unified search, government service directory, offline guides/lessons, reminder push/e-mail channels on device, subscription/billing screens, analytics events (`POST /analytics/events` not used). Classified **MOB-35 - P2 - SCOPE GAP** as one tracking item; each should become a task rather than a defect.

### 2.14 Documentation
**MOB-36 - P3 - DOCS** README says the appointment hub "always shows the API notice" (it shows a local string, MOB-14) and "43 tests passing" (true today). `docs/QA.md` still lists mobile as "blocked until SDK available"; update with the actual state and the limits in section 3.

### 2.15 Findings table (index)

| ID | Sev | Classification | Location | Title |
|---|---|---|---|---|
| MOB-1 | P0 | CONFIGURATION / EXTERNAL CREDENTIAL | android/app/build.gradle.kts:18-19,34-36 | Debug-signed release, template applicationId |
| MOB-2 | P1 | CODE FIX | lib/main.dart:13; lib/features/auth/auth_controller.dart:114-131 | Bootstrap hang on unexpected exception (reproduced) |
| MOB-3 | P1 | CONFIGURATION | android/app/src/main/AndroidManifest.xml:3-6 | allowBackup not disabled with secure-storage token |
| MOB-4 | P1 | CODE FIX / CONFIGURATION | lib/core/config.dart:6-9 | Cleartext emulator URL as default |
| MOB-5 | P1 | CODE FIX / EXTERNAL CREDENTIAL | lib/core/push/push_service.dart; lib/core/providers.dart:17 | Push + POST /devices not implemented |
| MOB-7 | P1 | CONFIGURATION / CODE FIX / EXTERNAL INFRASTRUCTURE | AndroidManifest.xml, ios/Runner/Info.plist, lib/app.dart | No deep links; no reset-password screen |
| MOB-18 | P1 | CODE FIX | lib/features/ask/ask_controller.dart:87; auth_controller.dart:178-184 | Ask chat survives logout (reproduced) |
| MOB-6 | P2 | CODE FIX | auth_controller.dart:166-184; push_service.dart:7 | Device-token unregister after token revoked |
| MOB-8 | P2 | CODE FIX | ask_controller.dart:62-84; auth_controller.dart:143-154 | Non-ApiException leaves busy=true (reproduced) |
| MOB-9 | P2 | CODE FIX | auth_controller.dart:128-129 | Offline cold start looks like logout |
| MOB-10 | P2 | CODE FIX | lib/features/profile/profile.dart:88-104 | Export not delivered to the user |
| MOB-13 | P2 | CODE FIX | lib/core/routes.dart | AI/notification targets dropped or lose slug |
| MOB-14 | P2 | CODE FIX | lib/features/appointments/appointments.dart:10,63 | Hub ignores labels, guide, notice; subset of office types |
| MOB-20 | P2 | CONFIGURATION | project.pbxproj:380,387,562; Info.plist:9-10 | Bundle ids differ across platforms; display name; team id |
| MOB-22 | P2 | CODE FIX / DEPENDENCY | pubspec.yaml | Major-version drift, discontinued transitives, intl any, no licence page |
| MOB-26 | P2 | CODE FIX | lib/features/onboarding/onboarding.dart:72-81 | PATCH sends nulls, can erase profile |
| MOB-30 | P2 | CODE FIX | lib/main.dart | No global error handler / crash reporting |
| MOB-31 | P2 | TEST GAP | test/ | 27% measured coverage, 10 screens untested |
| MOB-33 | P2 | SCOPE GAP | lib/ | No offline support |
| MOB-35 | P2 | SCOPE GAP | lib/ | Spec modules not built |
| MOB-15 | P3 | CODE FIX | lib/features/learn/learn.dart:131-154 | Lesson items rendered raw; example_it direction |
| MOB-16 | P3 | CODE FIX | lib/features/documents/documents.dart:129-130,217-219 | Date picker assertion risk |
| MOB-17 | P3 | CODE FIX | lib/features/documents/documents.dart:61 | `days ?? 0` shows "0 days left" when expiry present but days missing |
| MOB-19 | P3 | CODE FIX | lib/features/auth/auth_screens.dart:149 | Redundant `context.go('/verify')` race-prone pattern (works today) |
| MOB-21 | P3 | CONFIGURATION | AndroidManifest.xml, Info.plist | Future permission strings/entitlements absent (correct today) |
| MOB-23 | P3 | CODE FIX | lib/core/storage/secure_store.dart:11-15 | Keychain persists after reinstall; default options |
| MOB-24 | P3 | CODE FIX | lib/features/auth/auth_screens.dart | Shared auth error, autofill, password policy |
| MOB-25 | P3 | CODE FIX | lib/features/profile/profile.dart:42,106-129 | No confirmation for logout/delete |
| MOB-27 | P3 | CODE FIX | various (a-h) | Contract/UX details (unread badge, stale conversation, Retry-After, http apply urls, paged error) |
| MOB-28 | P3 | CODE FIX | lib/features/* | Untyped maps, no models/repositories for most features |
| MOB-29 | P3 | CODE FIX | lib/l10n/*.arb; shell.dart:24 | Arabic plurals, digits, icon, fonts |
| MOB-32 | P3 | CODE FIX | lib/core/theme/app_theme.dart etc. | Accessibility: live regions, dark theme |
| MOB-34 | P3 | CONFIGURATION / CODE FIX | n/a | Hardening: pinning, FLAG_SECURE, obfuscation, cleartext flag |
| MOB-36 | P3 | DOCS | mobile/README.md; docs/QA.md | Docs inaccurate/outdated |

MOB-16 detail: `documents.dart:213-219` - if the user picks an expiry date, then later picks an issue date after it, re-opening the expiry picker passes `initialDate` (the old expiry) earlier than `firstDate` (the new issue date); `showDatePicker` asserts this in debug builds (release behaviour unverified). MOB-17 detail: `documents.dart:61` uses `days ?? 0`. MOB-19 detail: register relies on `context.go('/verify')` after the auth state has already flipped to authenticated; a probe shows it works, but it is order-dependent; navigate via the router's redirect instead.

Counts check: P0 = 1 (MOB-1); P1 = 6 (MOB-2, 3, 4, 5, 7, 18); P2 = 13 (MOB-6, 8, 9, 10, 13, 14, 20, 22, 26, 30, 31, 33, 35); P3 = 14 (MOB-15, 16, 17, 19, 21, 23, 24, 25, 27, 28, 29, 32, 34, 36). Total 34. (IDs are not contiguous; numbering follows discovery order.)

## 3. DEVICE_VERIFICATION_REQUIRED (not verified; needs a device/emulator or Apple/Google toolchains)

Nothing below was built or executed. Do not treat any as passing.

Build and packaging
- `flutter build apk/appbundle/ios` succeeds with the pinned toolchain; Gradle 8/AGP, Kotlin, CocoaPods resolution (no `ios/Podfile` exists yet, it is generated on first build); `flutter_secure_storage` 9.2.4 pods/Gradle compile on the target SDK 36 / iOS 15.
- Release signing with the real upload key (MOB-1); `--obfuscate --split-debug-info`; APK/AAB size; ProGuard/R8 behaviour with secure storage.
- Launcher icon, adaptive icon, splash/launch screen branding (assumed template defaults).

Session and storage
- Token persists across app restart; behaviour after Android backup/restore and after "clear storage" (MOB-2/3); Keychain persistence after uninstall/reinstall on iOS (MOB-23); logout really removes the item (inspect via adb/Keychain); behaviour after Android Keystore invalidation (screen-lock change).
- 401 mid-session returns to login with the expired-session notice; offline cold start path (MOB-9); behaviour of the 15 s connect timeout on slow networks.

Networking
- Live calls against a staging API over https with a real certificate; emulator `10.0.2.2` reachability; iOS simulator `127.0.0.1`; ATS and Android cleartext policy with a release build (MOB-4); proxy/captive-portal behaviour (MOB-8).
- `url_launcher` opening https links on Android 11+ (queries entry present) and iOS.

UI, RTL and accessibility
- Visual RTL correctness on real devices: bidi mixing of Arabic with Italian terms, URLs, emails and numbers; mirrored icons (chevrons, send); NavigationBar order in RTL; digit style mixing (MOB-29b); Arabic font fallback quality (platform fonts); line height of Arabic text.
- Dynamic Type / Android font scale at 200% across every screen (only login at 1.5x and dashboard/match at 2.0x were tested in a test harness); `configChanges` includes `fontScale|layoutDirection|locale` so runtime changes should not recreate the activity - confirm no state loss.
- TalkBack and VoiceOver passes (labels, focus order, error announcements, MOB-32); switch access; minimum tap sizes on 320 dp-wide phones; landscape layout on iPhone (Info.plist permits landscape) and tablets.
- Soft keyboard behaviour (`adjustResize`) on Login, Register, Ask and Documents forms; password-manager autofill (MOB-24); date-picker behaviour (MOB-16); Android 15 edge-to-edge insets with target SDK 36; system back button/gesture with `StatefulShellRoute` branches; pull-to-refresh behaviour.
- System dark mode and high-contrast rendering (MOB-32).

Notifications and links (once built)
- FCM/APNs token issuance, permission prompts on Android 13+ and iOS, `POST /devices` registration, token rotation, unregister on logout (MOB-5/6), notification tap routing, Do-not-disturb behaviour; App Links / Universal Links verification (MOB-7).

Performance and stability
- Cold start time, scroll jank in long lists (`PagedView` builds all items in a `ListView(children: [...])`, not a lazy builder, so 100+ items per page should be profiled), memory over a long Ask session, battery/network use, behaviour under low-memory process death and restoration.
- Offline behaviour on a real network drop; airplane mode toggling mid-request (MOB-9, MOB-33).

Security
- Inspect the app sandbox for plaintext tokens/PII; verify that screenshots/app-switcher thumbnails may expose document data (MOB-34); jailbreak/root behaviour; traffic inspection with a proxy to confirm no sensitive data in query strings (note `?lang=` only).

## 4. Appendix

Commands run (scratch copy): `flutter pub get`, `flutter analyze` (0 issues), `flutter test` (43 passed), `flutter test --coverage` (27% of lines measured), `flutter pub outdated`; throw-away probe tests (not left in the repository) established: bootstrap with a throwing store ends `unknown` (MOB-2); a `TypeError` in the Ask repository leaves `busy == true` (MOB-8); Ask entries survive logout (MOB-18); register navigates to `/verify` correctly; dashboard/match views do not overflow at 2.0x text in ar/en/it.

Backend files consulted for the contract: `backend/routes/api.php`, `bootstrap/app.php` (exception rendering), `AuthController`, `RegisterRequest`, `LoginRequest`, `UserResource`, `AiController`, `DeviceController`, `NotificationController`, `DashboardController`, `UserDocumentController/Resource/Request`, `ProfileController`, `UpdateProfileRequest`, `ConsentController`, `PrivacyController`, `JobController`, `JobResource`, `ItalianController`, `ItalianLessonResource`, `GuideController`, `GuideResource`, `AppointmentController`, `GovernmentOfficeResource`, `GeographyController`, `MetaController`, `ApiResponse`, `docs/API_SPEC.md`. Sanctum token lifetime is 30 days (`config/sanctum.php`, `SANCTUM_TOKEN_EXPIRATION`), with no refresh endpoint, so the 401 path is the only renewal mechanism.
