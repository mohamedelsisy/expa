# EXPA — QA Strategy

## Pyramid
- **Backend**: Pest/PHPUnit — unit (services, scoring, matching, normalizers), feature/API (every endpoint: happy path, validation, 401, 403, 404, 429 where relevant, localization).
- **Web**: Vitest component tests; Playwright E2E (auth, onboarding, dashboard, AI, documents, jobs, learning, patente) in ar/RTL, en, it.
- **Mobile**: Flutter unit/widget/integration (blocked until SDK available).
- **Non-functional**: security (authz matrix tests, upload abuse), performance (query counts via `preventLazyLoading` in tests, API p95 budget 300ms w/o AI), a11y (axe in Playwright).

## Per-task QA gate
Implement → run tests → code review → edge cases → localization (ar/en/it) → RTL → authorization → fix → re-run. Task is DONE only with: tests passing, acceptance criteria verified, no Critical/High open issues.

## Commands
- Backend: `cd backend && php artisan test`
- Lint: `cd backend && vendor/bin/pint --test`

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
~575 feature/unit tests: auth, RBAC + authorization matrix over every route, audit, GDPR export/erasure (structural guard for user-linked tables), content engine + workflow, guides/government/appointments, documents + secure uploads, reminders/notifications, dashboard, AI (safety rules, injection, degraded mode), learning, patente (exam integrity), jobs (pipeline, SSRF/XXE, matching), search, billing (idempotent webhooks), analytics privacy, security headers, preflight. Run on SQLite and MariaDB (MySQL in CI). Web: Vitest guard tests (i18n parity, RTL logical CSS, no v-html, WCAG contrast, BFF security) + component tests.

## CI
`.github/workflows/ci.yml`: backend (SQLite) + backend on MySQL 8 service + web (tests, typecheck, build) + composer/npm audit + gitleaks. Not yet executed on GitHub (no remote configured).
