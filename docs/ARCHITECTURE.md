# EXPA — Architecture

## 1. Topology
```
Nuxt 3 web (SSR, SEO) ─┐
Flutter mobile ────────┼──> Laravel REST API /api/v1 (Sanctum) ──> MySQL
Admin panel (Nuxt /admin, role-gated) ┘          │ ├─> Redis (cache, queue, rate limit)
                                                  │ ├─> Queue workers (importers, notifications, AI jobs)
                                                  │ ├─> Scheduler (importers q6h, reminders daily)
                                                  │ └─> Object storage (private disk, signed URLs)
                                                  └─> LLM provider (via LlmClient interface)
```

## 2. Repo layout
```
backend/   Laravel 13 API (modular by domain under app/Domains)
web/       Nuxt 3 + TS + Tailwind + @nuxtjs/i18n
mobile/    Flutter (BLOCKED locally: SDK not installed)
docs/      specs
```

## 3. Backend structure
Domain-oriented inside Laravel: `app/Domains/{Auth,Profile,Content,Government,Jobs,Learning,Patente,Documents,Reminders,Notifications,Ai,Search,Billing,Admin}` each with Models, Services, Http (Controllers/Requests/Resources), Policies. Shared kernel in `app/Support` (ApiResponse, Localization, Enums).

Conventions
- Thin controllers → FormRequest validation → Service → API Resource.
- Uniform response envelope: `{ "data": ..., "meta": {...} }`; errors `{ "error": {"code","message","details"} }`.
- Locale from `Accept-Language` / `?lang=` ; fallback ar → en → it. Resolved by middleware `SetLocale`.
- Translations: per-entity `*_translations` tables via a `HasTranslations` trait (locale, fields). Missing translation falls back and is flagged in response (`meta.locale_fallback`).
- Content lifecycle: `status` enum draft/review/approved/published/archived + `publish_at`; global scope `published()` for public endpoints.
- Authorization: roles+permissions tables (own implementation, small) + Policies; admin routes `/api/v1/admin/*` require permission middleware.
- Audit: `AuditLog` written for admin mutations and sensitive user actions (observer-based).

## 4. Key subsystems
- **Localization**: `ar|en|it`, RTL flag in locale config; web uses `dir` attribute from locale; no strings in components.
- **Reminders**: `user_documents.expires_on` + `reminder_schedules` (offsets 90/60/30/14/7 + custom). Daily scheduler command creates `notifications` rows (idempotent via unique key doc+offset+channel) which dispatch events → channels.
- **Notifications**: event → `NotificationService` → channel drivers (database/in-app, mail, push[FCM adapter, blocked on credentials]).
- **Jobs pipeline**: `JobSource` (driver config) → `Importer` interface → Normalizer → Deduper (hash of company+title+location+source id) → Classifier → Translator (queued) → Validator → upsert. Each run logged in `job_import_runs`; failure leaves existing rows untouched (transaction per batch), retries with backoff, admin alert notification.
- **AI**: see AI_SPEC.md.
- **Search**: MVP = MySQL FULLTEXT + normalized `search_index` table (Arabic normalization: strip tashkeel/tatweel, unify alef/ya/ta-marbuta). Interface `SearchEngine` allows Meilisearch later.
- **Billing**: plans/subscriptions/payments tables + `PaymentProvider` interface; no provider wired in MVP.
- **Files**: private disk, MIME sniffing, size limits, randomized names, AV-scan hook interface (`MalwareScanner`, ClamAV adapter documented).

## 5. Environments
local / staging / production via `.env`; `.env.example` committed; secrets never committed. CI: GitHub Actions (lint, tests). Docker compose provided for staging parity (cannot be verified locally: Docker absent).

## 6. Decisions log
| ID | Decision | Reason |
|---|---|---|
| D1 | Laravel 13 API-only + Sanctum | Per spec |
| D2 | Own roles/permissions (not a package) | Few tables, granular, no dependency risk |
| D3 | Translation tables (not JSON columns) | Per spec, searchable/indexable |
| D4 | Admin panel as Nuxt route group over the same API | One design system, API-first |
| D5 | Tests on SQLite memory | Fast, no services needed; MySQL-specific features (FULLTEXT) isolated behind interface with fallback LIKE driver |
| D6 | Verification mail links to web app `/{locale}/verify-email?url=<signed API URL>`; API verify route is signed GET with no session | Works from any device/mail client; web/mobile just forward the URL |
| D7 | Register reveals duplicate emails via 422 (throttled) | Standard UX trade-off; login/forgot-password do not reveal existence |
| D8 | Validation strings from `laravel-lang/lang` (dev dependency, files published into `lang/`) | Complete ar/it coverage without hand-translation; app-specific strings live in `errors.php`, `messages.php`, `mail.php` |
| D9 | Unverified users may log in but `verified`-gated features return 403 `email_not_verified` | Lets onboarding proceed while verification is pending |
| D10 | Onboarding state is derived from data (+ explicit skips), not stored as a step counter | Single source of truth; resumable on any device |
| D11 | Profile enums are PHP backed enums; client-visible labels come from `GET /profile/options` | No UI strings in clients; labels translated in `lang/*/profile.php` |
| D12 | Consent is a purpose-keyed append-only ledger; gating is enforced in services (`ConsentService::has`) | Auditable history; each consumer enforces its own purpose |
| D13 | Roles/permissions defined in `config/permissions.php`, synced to DB idempotently on deploy | Reviewable in PRs; DB can't drift from code |
| D14 | Gates for `resource.action` + target-aware Policies for escalation rules | Granular permissions without losing target checks |
