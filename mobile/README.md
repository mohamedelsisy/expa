# EXPA mobile (Flutter) - task T-028

Arabic-first (ar default, RTL; en and it LTR) client for the EXPA API (`/api/v1`).

## Status and honest limits
- Verified here: `flutter analyze` (clean) and `flutter test` (all passing, see the counts in docs/MOBILE_SETUP.md section 9).
- **Not verified (DEVICE_VERIFICATION_REQUIRED)**: Android/iOS builds, running on a device or emulator, camera capture, push delivery, App Links / Universal Links, TalkBack/VoiceOver. No Android SDK or Xcode here, so no APK/IPA was built.
- **Push**: `PushService` (provider abstraction) + `PushRegistrar` (consent-aware `POST /devices`, `DELETE /devices`, token refresh, allow-listed tap routing) + localized opt-in in Profile are implemented and tested against fakes. The only bundled provider is `NoopPushService`; the FCM adapter is a template (`tool/fcm/fcm_push_service.dart.template`) because it needs a Firebase project (EXTERNAL CREDENTIAL).
- **Scanner foundation**: capture (image_picker) -> optional OCR interface (no engine bundled) -> review -> explicit send to the provisional `POST /documents/explain` (contract isolated in `features/scanner/document_explainer_api.dart`; the endpoint did not exist in `backend/routes/api.php` when this was written) -> explanation. Manual paste fallback. Never auto-uploads.
- **Offline**: guides and lessons the user saves are kept on the device (`core/cache`), opened cache-first and refreshed in the background, with saved/last-verified dates and a stale flag; offline banner; cold start with a valid token stays signed in from the cached profile. No personal documents, chats or exports are cached.
- Screens added: search, government directory (services/offices + detail), study (list/detail), Patente (topics, study view, mock exam with timer, practice, results, progress/weak topics), saved jobs, AI history, saved-offline, scanner, reset-password and verify-email link screens.
- No analytics/crash SDKs. No logging of tokens or personal data. The Sanctum token, cached profile and chosen locale are kept via `flutter_secure_storage` behind `SecureStore`.
- Fonts: platform fonts are used (IBM Plex Sans Arabic / Inter not bundled yet).
- Not implemented: housing, billing UI, document attachment upload, on-device OCR engine, Patente "AI teacher", crash reporting endpoint, certificate pinning, FLAG_SECURE, dark theme.

## Setup
```
cd mobile
/Applications/XAMPP/xamppfiles/htdocs/expa/.tools/flutter/bin/flutter pub get
flutter gen-l10n          # also runs automatically on pub get / run / test
```

## Run
```
flutter run --dart-define=EXPA_API_BASE_URL=http://10.0.2.2:8000/api/v1      # Android emulator -> host
flutter run --dart-define=EXPA_API_BASE_URL=http://127.0.0.1:8000/api/v1     # iOS simulator
```
`EXPA_API_BASE_URL` defaults to `http://10.0.2.2:8000/api/v1` (debug only). **Release builds refuse to start unless it is an https URL.** Release signing, Firebase and links: see ../docs/MOBILE_SETUP.md.

## Test and analyze
```
flutter analyze
flutter test
```
Covers: API client, auth lifecycle (bootstrap resilience, offline start, logout ordering), config guard, push registrar/consent/refresh/routing, local cache and cache-first repository, Ask scoping, deep links (reset/verify), onboarding diff-save, appointment hub, Patente flows (empty state, timer, results), scanner flow with fakes, search, government/study catalog, saved jobs, AI history, privacy/export/delete, offline banner, route allow-list, ARB key parity, and ar/en/it at 360px and 320px with 1.5x text for the new screens.

## Architecture
- `lib/core`: config (dart-defines), `api/` (dio client, envelope, typed exceptions), `storage/`, `push/`, `theme/app_theme.dart` (single token file mirroring `web/assets/css/tokens.css`), shared widgets, `routes.dart` (allow-list for server-provided targets), `util/safe_url.dart` (https-only, external browser).
- `lib/features/<feature>`: auth, onboarding, dashboard (home + tasks), guides, documents, ask, learn, jobs, notifications, appointments, profile (privacy), shell (bottom nav).
- State: Riverpod. Navigation: go_router with an auth redirect.
- Localization: `lib/l10n/app_{ar,en,it}.arb` (Arabic is the template). Source table: `python3 tool/strings.py` regenerates all three ARBs so keys stay identical. Server content arrives already localized (`?lang=` + `Accept-Language`).

## API contract notes
- Envelope `{data, meta}` / `{error:{code,message,details}}`; `meta: []` (PHP empty array) is tolerated.
- 401 on an authenticated request clears the token and returns to login ("session expired"); a failed login (`invalid_credentials`) does not.
- Appointment hub only redirects to official booking pages and shows the API `notice` (local text only as fallback); Jobs apply opens the original URL (`submitted_by_expa:false`). Neither pretends a booking/application was made.
- Data export (`GET /profile/export`) is summarised on screen; the user can hand it to the OS share sheet after a confirmation. The app never writes it to disk itself.
- E-mail links: reset `/{locale}/reset-password?token&email`, verify `/{locale}/verify-email?url=<signed API URL>`; the signed URL is re-sent without an added `lang` query (it would break the signature).
