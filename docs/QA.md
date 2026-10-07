# EXPA — QA Strategy

## Pyramid
- **Backend**: Pest/PHPUnit — unit (services, scoring, matching, normalizers), feature/API (every endpoint: happy path, validation, 401, 403, 404, 429 where relevant, localization).
- **Web**: Vitest guard and component tests (375 tests in 15 files, 2026-10-07). Playwright E2E with axe exists in `web/e2e` (smoke over 18 pages in ar/en/it at 390 and 1280 px, behaviour, features, layout). It runs against a stub API (`web/e2e/stub/server.mjs`), is wired into CI as the `web-e2e` job (never executed on GitHub yet) and now covers signed-in journeys (see CI > Signed-in journeys); see MVP_REAUDIT_FINDINGS RA-15.
- **Mobile**: Flutter unit/widget tests run locally with the SDK in `.tools/flutter` (335 tests in 31 files, 2026-10-07; ar/en/it at 360 and 320 px with 1.5x text for most screens). No integration tests, no device or emulator run; `flutter analyze` and `flutter test` are a CI job (`mobile`, never executed on GitHub yet).
- **Non-functional**: security (authz matrix tests, upload abuse), performance (query counts via `preventLazyLoading` in tests, API p95 budget 300ms w/o AI), a11y (axe in Playwright).

## Per-task QA gate
Implement → run tests → code review → edge cases → localization (ar/en/it) → RTL → authorization → fix → re-run. Task is DONE only with: tests passing, acceptance criteria verified, no Critical/High open issues.

## Commands
- Backend: `cd backend && php artisan test`
- Lint: `cd backend && vendor/bin/pint --test`
- Web: `cd web && npm run test` (Vitest); `npm run typecheck`; `npm run test:e2e` (Playwright, needs browsers installed)
- Mobile: `cd mobile && ../.tools/flutter/bin/flutter test` (set `FLUTTER_SUPPRESS_ANALYTICS=true CI=true`); `flutter analyze`

## Test data
Factories only; never real personal data. Content fixtures carry obviously fake sources (`https://example.test/...`).

## Defect log
Tracked in TASKS.md under `BUG-xxx`.

## Running the suite on MariaDB/MySQL (second engine)
Default tests use in-memory SQLite. Before closing a task that touches migrations/queries, also run against MariaDB/MySQL (found a real ordering bug in T-010):
```
DB_CONNECTION=mariadb DB_HOST=127.0.0.1 DB_PORT=<port> DB_DATABASE=expa_test DB_USERNAME=root DB_PASSWORD= php artisan test
```
Use a throwaway server (never a shared dev DB: `RefreshDatabase` wipes it). On this machine XAMPP ships MariaDB 10.4 (`/Applications/XAMPP/xamppfiles/sbin/mysqld`); start a private instance with its own `--datadir`, `--port` and a short relative `--socket` (macOS 104-char socket path limit).
Rule: API output must never depend on DB row order — sort explicitly.

## Current automated coverage (backend)
905 tests, 7439 assertions (2026-10-07, SQLite): auth, RBAC + authorization matrix over every route, audit, GDPR export/erasure (structural guard for user-linked tables), content engine + workflow, guides/government/appointments, documents + secure uploads, reminders/notifications, dashboard, AI (safety rules, injection, degraded mode), learning, patente (exam integrity), jobs (pipeline, SSRF/XXE, matching), search, billing (idempotent webhooks), analytics privacy, security headers, preflight. Run on SQLite and MariaDB (MySQL in CI). Web: Vitest guard tests (i18n parity and usage, RTL logical CSS, no v-html, WCAG contrast, BFF security, admin schema/permissions) + component tests. Mobile: 335 widget/unit tests (API client, auth, push registrar with fakes, offline cache, deep links, scanner with fakes, housing, marketplace, community, Patente, practice, l10n key parity).

## CI
`.github/workflows/ci.yml` jobs: `backend` (SQLite, Pint, tests), `backend-mysql` (MySQL 8 service), `backend-mariadb` (MariaDB 10.11 service, the engine used locally), `web` (Vitest, typecheck, build, Node 22, npm cache), `web-e2e` (Playwright + axe against a production build and the stub API; Chromium installed with `--with-deps` and cached by Playwright version; `test-results` uploaded on failure), `mobile` (`subosito/flutter-action@v2`, channel stable pinned to Flutter 3.47.6 = Dart 3.13.5, the SDK in `.tools/flutter`; `flutter analyze` then `flutter test`, pub cache enabled) and `security` (composer/npm audit + gitleaks). The YAML parses locally (Ruby `YAML.load_file`; `actionlint` is not installed on this machine) but the workflow has NEVER run on GitHub, so cache keys, `--with-deps` and the mobile job are untested there. Not yet executed (no remote configured).

### Running the e2e suite next to a running server
`npm run test:e2e` serves `.output`. When `.nuxt`/`.output` belong to a running dev or preview server, build into separate directories first: `EXPA_BUILD_DIR=.nuxt-e2e EXPA_OUTPUT_DIR=.output-e2e npm run build` then `EXPA_OUTPUT_DIR=.output-e2e npm run test:e2e` (both directories are git-ignored; unset, the defaults are unchanged).

### Signed-in journeys (RA-15)
`web/e2e/journeys.spec.ts` (serial, one stateful stub user, `web/e2e/stub/journey.mjs`): guest redirect, wrong then right password with the httpOnly cookie check, onboarding (consent, required step, optional skips), dashboard score and next actions, Ask EXPA answer with label, sources and disclaimer, document tracker (consent gate, create, list), jobs (list, match score, save, saved list), Learn Italian (daily plan, lesson completion), Patente (practice run, submit, review), notifications (mark read, mark all), devices and sessions (revoke, sign out everywhere), billing (honest notice while payments are off, cancel at period end and invoices when on), blocked community members, sign out, plus Arabic and Italian dashboards. Each step runs axe (wcag2a/aa/21/22 + best-practice) with zero violations and a no-overflow check. `admin-ra3.spec.ts` covers the new admin pages, `areas.spec.ts` the life-area pages and /about; `PAGES` in `helpers.ts` adds all of them to the ar/en/it x 390/1280 smoke matrix. Not covered: register -> email verification (the BFF verification link needs the real API), uploads, English/Arabic variants of every journey step beyond the dashboard and Ask pages, and a run against the real Laravel API with the fake LLM.

## Content / marketplace / community coverage (T-060..T-062)
Tests: `tests/Feature/Articles`, `tests/Feature/Marketplace` (directory, reviews, leads, portal, verification, erasure, retention) and `tests/Feature/Community` (flag on/off, anti-abuse, moderation, shadow-ban, blocks, GDPR). Fixtures in `tests/Support/MarketplaceFixtures.php` are obviously fake and must never be used by seeders. Manual checks before launch: Arabic RTL rendering of provider/community labels, moderator workflow dry run, enabling `COMMUNITY_ENABLED` only in staging first.

## Coverage: legal, housing, document explainer, practice, patente learning (T-070..T-074)
`tests/Feature/Legal` (versions, workflow, four-eyes, policy-version linkage), `tests/Feature/Housing` (extractor in ar/it/en, cost, rules incl. sourced thresholds, injection, quota, persistence/export/erase/prune), `tests/Feature/DocumentExplainer` (classifier, dates, redaction, upload abuse, fake-binary OCR incl. timeout, nothing persisted), `tests/Feature/Learning/ItalianPracticeTest` (grading, Leitner, teacher review, audio rights, daily plan), `tests/Feature/Patente/PatenteLearningTest` (licence guard, weak topics, practice, glossary). The real-tesseract test is skipped when the binary or GD is missing. Manual before launch: native-speaker review of seeded Arabic/Italian texts, OCR quality with real phone photos in ar/it, and a counsel-approved privacy policy.
