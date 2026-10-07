# EXPA — QA Strategy

## Pyramid
- **Backend**: Pest/PHPUnit — unit (services, scoring, matching, normalizers), feature/API (every endpoint: happy path, validation, 401, 403, 404, 429 where relevant, localization).
- **Web**: Vitest guard and component tests (372 tests in 15 files, 2026-10-07). Playwright E2E with axe exists in `web/e2e` (smoke over 18 pages in ar/en/it at 390 and 1280 px, behaviour, features, layout). It runs against a stub API (`web/e2e/stub/server.mjs`), is not part of CI, and does not yet cover signed-in journeys (auth, onboarding, dashboard, AI, documents, jobs, learning, Patente); see MVP_REAUDIT_FINDINGS RA-15.
- **Mobile**: Flutter unit/widget tests run locally with the SDK in `.tools/flutter` (335 tests in 31 files, 2026-10-07; ar/en/it at 360 and 320 px with 1.5x text for most screens). No integration tests, no device or emulator run, not part of CI.
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
`.github/workflows/ci.yml`: backend (SQLite) + backend on MySQL 8 service + web (tests, typecheck, build) + composer/npm audit + gitleaks. There is no Flutter job and no Playwright job. Not yet executed on GitHub (no remote configured).

## Content / marketplace / community coverage (T-060..T-062)
Tests: `tests/Feature/Articles`, `tests/Feature/Marketplace` (directory, reviews, leads, portal, verification, erasure, retention) and `tests/Feature/Community` (flag on/off, anti-abuse, moderation, shadow-ban, blocks, GDPR). Fixtures in `tests/Support/MarketplaceFixtures.php` are obviously fake and must never be used by seeders. Manual checks before launch: Arabic RTL rendering of provider/community labels, moderator workflow dry run, enabling `COMMUNITY_ENABLED` only in staging first.

## Coverage: legal, housing, document explainer, practice, patente learning (T-070..T-074)
`tests/Feature/Legal` (versions, workflow, four-eyes, policy-version linkage), `tests/Feature/Housing` (extractor in ar/it/en, cost, rules incl. sourced thresholds, injection, quota, persistence/export/erase/prune), `tests/Feature/DocumentExplainer` (classifier, dates, redaction, upload abuse, fake-binary OCR incl. timeout, nothing persisted), `tests/Feature/Learning/ItalianPracticeTest` (grading, Leitner, teacher review, audio rights, daily plan), `tests/Feature/Patente/PatenteLearningTest` (licence guard, weak topics, practice, glossary). The real-tesseract test is skipped when the binary or GD is missing. Manual before launch: native-speaker review of seeded Arabic/Italian texts, OCR quality with real phone photos in ar/it, and a counsel-approved privacy policy.
