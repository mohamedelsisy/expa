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
