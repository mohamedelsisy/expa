# Changelog

Format: Keep a Changelog. Unreleased changes at top.

## [Unreleased]
### Added
- T-007: RBAC — `roles`, `permissions` + pivots, config-driven (`config/permissions.php`, `expa:sync-access`, `AccessSeeder`), 8 roles, granular `resource.action` permissions registered as Gates, `super_admin` bypass, `UserPolicy` blocking privilege escalation (only super_admin can touch admins / grant privileged roles; no self-modification), default `user` role on signup (self-healing on fresh DB), `expa:make-admin`, admin users API (`/admin/users`, `/admin/roles`) establishing pagination/filter/sort conventions (`ApiResponse::paginated`). Suspension revokes tokens. 19 new tests (88 total).
- T-006: Profile + progressive onboarding + consent. `user_profiles` (nationality/residence encrypted), append-only `consents` ledger with versioned policy, `GET /privacy/purposes`, `GET /profile/options` (localized labels, Italian terms preserved in Arabic), `GET/PATCH /profile`, onboarding skip/complete (only `status` required; 5 optional skippable steps), `GET/PUT /profile/consents`. Registration now requires accepting terms & privacy and logs consent. 24 new tests (69 total).
- T-004/T-005: Auth — register, login, logout, logout-all, me, change-password, forgot/reset password, email verification (signed link) + resend, `EnsureEmailIsVerified` middleware (`email_not_verified` code). Sanctum tokens expire (30d, env-configurable) and are pruned daily. Per-email+IP login throttle (5/min), register and password-reset throttles. Mail notifications localized (ar/en/it) and link to the web app in the user's locale. ar/en/it validation messages via `laravel-lang/lang`. 31 new tests (45 total).
### Security
- Login runs a constant bcrypt comparison for unknown emails (no timing/response enumeration); forgot-password response identical for known/unknown emails; password reset and change revoke other tokens; breached-password check (`uncompromised`) enforced in production only.
- T-002: Laravel 13.34 API scaffold in `backend/` with Sanctum; root `.gitignore`; EXPA `.env.example` (ar default locale, AI driver = fake).
- T-003: `/api/v1` routing, `ApiResponse` envelope, localized error rendering (401/403/404/422/429/500), `SetLocale` middleware (ar default; `?lang=` > Accept-Language q-values > default), `GET /api/v1/health`, `config/expa.php`, ar/en/it error strings. 14 feature tests passing, Pint clean.
- T-001: Planning documents (PRODUCT_SPEC, ARCHITECTURE, DATABASE, API_SPEC, DESIGN_SYSTEM, AI_SPEC, SECURITY, GDPR, QA), ROADMAP, TASKS.
