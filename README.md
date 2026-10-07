# EXPA — Your Life Assistant in Italy

Arabic-first (ar · en · it) platform and mobile app that helps foreigners live, work, study and settle in Italy.

| Part | Path | Stack | Status |
|---|---|---|---|
| API | `backend/` | Laravel 13, PHP 8.3, Sanctum, MySQL/MariaDB (tests on SQLite, second-engine run on MariaDB) | Backend feature-complete for the MVP and later modules (see TASKS.md); live providers untested |
| Web | `web/` | Nuxt 3, Vue 3, TypeScript, Tailwind, i18n (ar RTL default), BFF to the API; Vitest + Playwright | Auth, onboarding, dashboard, guides, modules and admin UI; some client screens still BACKLOG (T-075) |
| Mobile | `mobile/` | Flutter (repo-local SDK in `.tools/flutter`) | Analyze clean and tests pass; never run on a device, no store build (T-028, docs/MOBILE_SETUP.md) |
| Docker | `docker/`, `docker-compose.yml`, `*/Dockerfile` | nginx, php-fpm, worker, scheduler, MySQL, Redis, Nuxt | Written, never built (docs/DEPLOYMENT.md) |
| Docs | `docs/` | see links below | kept in sync with the code |

**Not production-ready.** Launch blockers (credentials, infrastructure, legal texts, content, device verification) are tracked item by item in [docs/LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md). No guides, government content, Patente questions or job feeds are shipped.

Project state lives in `TASKS.md` (board), `ROADMAP.md` (phases), `CHANGELOG.md`.

## Run locally
```bash
# API (http://127.0.0.1:8001)
cd backend && composer install && cp .env.example .env && php artisan key:generate
php artisan migrate --seed          # roles, regions/cities, document types, starter lessons, plans
php artisan serve --port=8001
php artisan queue:work              # needed for erasure, imports, queued mail/notifications
php artisan schedule:work           # reminders and scheduled jobs
php artisan expa:make-admin you@example.com   # after registering

# Web (talks to the API through its BFF; set NUXT_API_BASE_URL and NUXT_PUBLIC_SITE_URL, see web/.env.example)
cd web && npm install && cp .env.example .env && npm run dev

# Mobile (emulator; release builds require an https EXPA_API_BASE_URL)
cd mobile && ../.tools/flutter/bin/flutter pub get
../.tools/flutter/bin/flutter run --dart-define=EXPA_API_BASE_URL=http://10.0.2.2:8001/api/v1
```

## Tests and checks
```bash
cd backend && php artisan test                    # SQLite in memory
cd backend && vendor/bin/pint --test              # style
cd backend && php artisan expa:preflight --production   # deploy readiness (errors block)
cd web && npm run test && npm run typecheck && npm run lint
cd web && npm run test:e2e                        # Playwright
cd mobile && ../.tools/flutter/bin/flutter analyze && ../.tools/flutter/bin/flutter test
```
Test counts change often; run the commands rather than trusting numbers in docs. MariaDB/MySQL second-engine run and the QA process: `docs/QA.md`.

## Docs
[PRODUCT_SPEC](docs/PRODUCT_SPEC.md) · [ARCHITECTURE](docs/ARCHITECTURE.md) · [DATABASE](docs/DATABASE.md) · [API_SPEC](docs/API_SPEC.md) · [DESIGN_SYSTEM](docs/DESIGN_SYSTEM.md) · [AI_SPEC](docs/AI_SPEC.md) · [SECURITY](docs/SECURITY.md) · [GDPR](docs/GDPR.md) · [QA](docs/QA.md) · [DEPLOYMENT](docs/DEPLOYMENT.md) · [ENVIRONMENT](docs/ENVIRONMENT.md) · [EXTERNAL_SERVICES](docs/EXTERNAL_SERVICES.md) · [CONTENT_VERIFICATION](docs/CONTENT_VERIFICATION.md) · [MOBILE_SETUP](docs/MOBILE_SETUP.md) · [LAUNCH_CHECKLIST](docs/LAUNCH_CHECKLIST.md) · [MVP_AUDIT](docs/MVP_AUDIT.md) · [PRODUCTION_AUDIT_BACKEND](docs/PRODUCTION_AUDIT_BACKEND.md) / [WEB](docs/PRODUCTION_AUDIT_WEB.md) / [MOBILE](docs/PRODUCTION_AUDIT_MOBILE.md) · [FINAL_REPORT](docs/FINAL_REPORT.md)

## Ground rules that shape the code
- Never invent government/legal/tax information: official content carries source, URL, type and last-verified date, can't be published without them, and the AI only answers from verified sources.
- EXPA redirects to official booking/application pages; it never books or applies on a user's behalf.
- Privacy by design: consent ledger, encrypted sensitive columns/files, export + erasure for every module (a test fails when a new user-linked table lacks a privacy provider), aggregate-only analytics.
