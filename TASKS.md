# EXPA Tasks

Statuses: BACKLOG · READY · IN_PROGRESS · BLOCKED · REVIEW · TESTING · DONE
Priority: P0 critical · P1 high · P2 medium · P3 low
Format per task: ID | Epic | Title | Deps | Pri | Status. Full acceptance criteria for READY/active tasks are in the "Task details" section; later tasks get details when they become READY (avoids stale specs).

## Epics
- E0 Foundation · E1 Auth & Users · E2 RBAC/Admin · E3 Content engine · E4 Immigration/Gov/Appointments · E5 Reminders & Notifications · E6 Dashboard · E7 AI · E8 Learning · E9 Patente · E10 Jobs · E11 Search · E12 Web · E13 Mobile · E14 Security/GDPR · E15 QA/Perf · E16 DevOps

## Board
| ID | Epic | Title | Deps | Pri | Status |
|---|---|---|---|---|---|
| T-001 | E0 | Planning docs & project files | — | P0 | DONE |
| T-002 | E0 | Scaffold Laravel 13 API in `backend/`, env config, git init, .gitignore | T-001 | P0 | DONE |
| T-003 | E0 | API foundation: `/api/v1`, response envelope, error handler, SetLocale middleware, `/health` | T-002 | P0 | DONE |
| T-004 | E1 | Users table + register/login/logout (Sanctum), throttling | T-003 | P0 | DONE |
| T-005 | E1 | Email verification + password reset | T-004 | P1 | DONE |
| T-006 | E1 | Profile + onboarding endpoints, consents | T-004 | P0 | DONE |
| T-007 | E2 | Roles/permissions + policies + seeders | T-004 | P0 | DONE |
| T-008 | E2 | Audit log service + observer | T-007 | P1 | DONE |
| T-009 | E14 | GDPR export + erasure job | T-006 | P1 | DONE |
| T-010 | E3 | HasTranslations trait, content lifecycle enum, regions/cities | T-003 | P0 | DONE |
| T-011 | E3 | Guides model + public API + admin CRUD | T-007,T-010 | P0 | DONE |
| T-012 | E4 | Government services/offices + API | T-011 | P1 | DONE |
| T-013 | E4 | Appointment guides | T-012 | P1 | DONE |
| T-014 | E5 | User documents tracker + attachments (secure upload) | T-006 | P0 | DONE |
| T-015 | E5 | Reminder engine + scheduler | T-014 | P0 | DONE |
| T-016 | E5 | Notification service (in-app, mail; push adapter) | T-015 | P1 | DONE |
| T-016b | E5 | FCM/APNs `PushSender` adapter (live push) | T-016 | P2 | BLOCKED (FCM credentials + Firebase project) |
| T-017 | E6 | Setup catalog + EXPA Score + dashboard + next-action providers (documents/reminders plug in later) | T-011 | P0 | DONE |
| T-018 | E7 | AI pipeline w/ FakeLlm, retriever, verifier, labeler | T-011 | P0 | DONE |
| T-019 | E7 | Anthropic adapter (live) | T-018 | P1 | BLOCKED (ANTHROPIC_API_KEY: adapter built + tested with Http::fake, live untested) |
| T-020 | E8 | Italian levels/lessons/progress/daily plan | T-010 | P1 | DONE |
| T-021 | E9 | Patente categories/topics/mock exams/progress | T-010 | P1 | DONE |
| T-022 | E10 | Job sources/importer framework/pipeline/dedupe | T-010 | P1 | DONE |
| T-023 | E10 | Job matching engine w/ explanation | T-022,T-006 | P1 | DONE |
| T-024 | E11 | Unified search with Arabic normalization | T-011 | P1 | DONE |
| T-025 | E12 | Nuxt scaffold, i18n ar/en/it, RTL, design tokens, UI kit | T-003 | P1 | DONE |
| T-026 | E12 | Web auth/onboarding/dashboard pages | T-025,T-017 | P1 | DONE |
| T-027 | E12 | Admin UI | T-025,T-011 | P2 | BACKLOG |
| T-028 | E13 | Flutter app | API stable | P2 | BLOCKED (Flutter SDK) |
| T-029 | E16 | CI workflow, Dockerfiles, compose | T-003 | P2 | BACKLOG |
| T-031 | E1 | Expose password rules + `GET /countries` (localized) so clients don't duplicate them | T-006 | P3 | BACKLOG |
| T-032 | E6 | Dashboard tasks: explicit `dismissed`/`applicable_reason` flags | T-017 | P3 | BACKLOG |
| T-033 | E16 | Document deployment rule: `APP_URL` must be the API origin reachable from the web BFF (verification links) | T-029 | P2 | BACKLOG |
| T-034 | E8 | Teacher/native-speaker review of the starter curriculum (ar/it accuracy) before launch | T-020 | P1 | BLOCKED (human reviewer) |
| T-035 | E9 | Verify mock-exam rules in config/patente.php against current official rules; obtain licensed/original question content | T-021 | P0 | BLOCKED (human: licensing + official verification) |
| T-036 | E10 | Obtain real, legally usable job feeds (licensed aggregator / employer feeds) and record each source's legal basis | T-022 | P0 | BLOCKED (human: business/legal) |
| T-030 | E14 | Security headers, upload scanner interface, privacy docs | T-014 | P1 | BACKLOG |

## Task details (active/ready)

### T-002 Scaffold Laravel backend
- Description: `composer create-project laravel/laravel backend`; git init at root; root `.gitignore`; `.env.example` with local/staging/prod notes; no secrets.
- Files: `backend/**`, `.gitignore`
- Acceptance: `php artisan test` passes on fresh scaffold; `.env` ignored; `.env.example` present; DB for tests = sqlite memory; Laravel version recorded in CHANGELOG.
- Tests: default example tests.

### T-003 API foundation
- Description: API routes under `/api/v1`; `ApiResponse` helper; exception renderer → error envelope for validation/auth/404/throttle; `SetLocale` middleware (ar default; Accept-Language/`?lang=`; fallback); `GET /api/v1/health`.
- Dependencies: T-002
- Files: `routes/api.php`, `bootstrap/app.php`, `app/Support/*`, `app/Http/Middleware/SetLocale.php`, `lang/{ar,en,it}`, tests.
- Acceptance:
  1. `/api/v1/health` returns `{data:{status:"ok"}}` with `meta.locale`.
  2. Unknown route → 404 envelope; invalid input → 422 envelope w/ `details`; unauthenticated → 401 envelope.
  3. Locale resolution: default ar; `Accept-Language: it` → it; unsupported → ar; `?lang=en` overrides header.
  4. Error messages localized in ar/en/it.
  5. Health leaks no versions/env info.
- Tests: feature tests for each criterion.
- Owner: Backend.
