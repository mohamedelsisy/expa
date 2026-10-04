# EXPA — Your Life Assistant in Italy

Arabic-first (ar · en · it) platform and mobile app that helps foreigners live, work, study and settle in Italy.

| Part | Path | Stack | Status |
|---|---|---|---|
| API | `backend/` | Laravel 13, Sanctum, MySQL/MariaDB (tests also on SQLite) | MVP backend complete, 570+ tests |
| Web | `web/` | Nuxt 3, Vue 3, TypeScript, Tailwind, i18n (ar RTL default) | auth, onboarding, dashboard, guides, + modules (see TASKS.md) |
| Mobile | `mobile/` | Flutter | **blocked**: Flutter SDK not installed in the authoring environment (T-028) |
| Docs | `docs/` | PRODUCT_SPEC, ARCHITECTURE, DATABASE, API_SPEC, DESIGN_SYSTEM, AI_SPEC, SECURITY, GDPR, QA, DEPLOYMENT | kept in sync with the code |

Project state lives in `TASKS.md` (board), `ROADMAP.md`, `CHANGELOG.md`.

## Run locally
```bash
# API
cd backend && composer install && cp .env.example .env && php artisan key:generate
php artisan migrate --seed          # roles, regions/cities, document types, starter lessons, plans
php artisan serve --port=8001
php artisan expa:make-admin you@example.com   # after registering

# Web (talks to the API through its BFF)
cd web && npm install && cp .env.example .env && npm run dev

# Tests
cd backend && php artisan test      # SQLite in memory
cd web && npm run test && npm run typecheck
```
Second-engine run (MariaDB/MySQL) and the full QA process: `docs/QA.md`. Deployment: `docs/DEPLOYMENT.md`. Production readiness check: `php artisan expa:preflight --production`.

## Ground rules that shape the code
- Never invent government/legal/tax information: official content carries source, URL, type and last-verified date, can't be published without them, and the AI only answers from verified sources.
- EXPA redirects to official booking/application pages; it never books or applies on a user's behalf.
- Privacy by design: consent ledger, encrypted sensitive columns/files, export + erasure for every module (a test fails when a new user-linked table lacks a privacy provider), aggregate-only analytics.
