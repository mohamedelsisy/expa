# EXPA mobile (Flutter) - task T-028

Arabic-first (ar default, RTL; en and it LTR) client for the EXPA API (`/api/v1`).

## Status and honest limits
- Verified here: `flutter analyze` (clean) and `flutter test` (43 tests passing).
- **Not verified**: Android/iOS builds, running on a device or emulator, screenshots. The environment has no Android SDK or Xcode, so no APK/IPA was built and the UI has only been exercised through widget tests.
- **Push notifications are stubbed.** `PushService` (lib/core/push) has only `NoopPushService`; FCM is blocked on T-016b (needs a Firebase project). Nothing registers a device token via `POST /devices`.
- No analytics/crash SDKs. No logging of tokens or personal data. The Sanctum token and the chosen locale are kept via `flutter_secure_storage` (Keychain / Android Keystore-backed) behind the `SecureStore` interface (`lib/core/storage/secure_store.dart`); tests use `InMemorySecureStore`.
- Fonts: platform fonts are used (IBM Plex Sans Arabic / Inter from the web design are not bundled yet).
- Not implemented (out of this task's scope): camera scanner/OCR, offline content, Patente exams, study finder, housing, billing, document attachments upload, saved jobs UI, AI conversation history, password reset by deep link, email verification by deep link (user opens the emailed link in the browser, then taps "I have verified my email").

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
`EXPA_API_BASE_URL` defaults to `http://10.0.2.2:8000/api/v1`. Use https for anything but local development.

## Test and analyze
```
flutter analyze
flutter test
```
Covers: API client envelope/error parsing and 401 handling, auth controller with a fake repository, default locale ar/RTL, login screen in ar/en/it (no overflow, also at 1.5x text), Ask EXPA message rendering (label, sources, separate disclaimer, degraded, safe actions), Ask controller, route allow-list, and ARB key completeness.

## Architecture
- `lib/core`: config (dart-defines), `api/` (dio client, envelope, typed exceptions), `storage/`, `push/`, `theme/app_theme.dart` (single token file mirroring `web/assets/css/tokens.css`), shared widgets, `routes.dart` (allow-list for server-provided targets), `util/safe_url.dart` (https-only, external browser).
- `lib/features/<feature>`: auth, onboarding, dashboard (home + tasks), guides, documents, ask, learn, jobs, notifications, appointments, profile (privacy), shell (bottom nav).
- State: Riverpod. Navigation: go_router with an auth redirect.
- Localization: `lib/l10n/app_{ar,en,it}.arb` (Arabic is the template). Source table: `python3 tool/strings.py` regenerates all three ARBs so keys stay identical. Server content arrives already localized (`?lang=` + `Accept-Language`).

## API contract notes
- Envelope `{data, meta}` / `{error:{code,message,details}}`; `meta: []` (PHP empty array) is tolerated.
- 401 on an authenticated request clears the token and returns to login ("session expired"); a failed login (`invalid_credentials`) does not.
- Appointment hub only redirects to official booking pages and always shows the API notice; Jobs apply opens the original URL (`submitted_by_expa:false`). Neither pretends a booking/application was made.
- Data export (`GET /profile/export`) is requested and summarised on screen but intentionally not written to disk.
