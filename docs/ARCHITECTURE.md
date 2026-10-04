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
| D15 | Privacy providers (tagged services) own export + erasure per module | Completeness enforced by test, not by memory |
| D16 | Erasure = anonymize + soft-delete stub, not hard delete | Keeps FK integrity for retained, de-identified records (consent history, audit) |
| D17 | Content = traits `HasTranslations` + `HasContentLifecycle` + `HasSource` composed per model; migrations use `contentLifecycle()` / `sourceFields()` Blueprint macros | Every content module (guides, articles, services, lessons…) shares one tested workflow |
| D18 | Fallback chain is explicit per locale (`config/content.php`): ar→en→it, en→ar→it, it→en→ar; API exposes `fallback` + `available_locales` | Missing translations are visible to clients/editors, never silent |
| D19 | Publishing is guarded (`PublishGuard`): required Arabic translation; if `requiresSource`: name, https URL, type, last_verified_at; `official` sources must be on an allow-listed domain | Enforces "never invent URLs / always show source + last verified" in code. Allow-list is deliberately conservative and reviewed in PRs |
| D20 | Scheduling = `approved` + future `publish_at`, promoted by `expa:publish-scheduled` every 5 min; items that stopped being publishable are skipped and reported | No hidden states; revalidates at publish time |
| D21 | `ApiException(code,message,status,details)` for business-rule failures | One envelope, stable machine codes for clients |
| D22 | Separation of duties encoded in `GuidePolicy` (update / review / publish permissions, locked live content, four-eyes) | Government information is high-risk; no single editor can push unreviewed text live |
| D23 | Guide place applicability: national (no region/city) · region · city; queries by place include broader scopes only (city ⊃ region ⊃ national) | Users see everything relevant to them without region pages leaking city-specific advice |
| D24 | No seeded guide content; `GuideFactory` is test-only with placeholder text | EXPA must not ship invented procedures; real content is entered with sources via admin |
| D25 | Dashboard is a thin aggregator over pluggable parts: `SetupCatalog` (config-driven steps + applicability), `ScoreCalculator`, `NextActionAggregator` fed by services tagged `dashboard.action_providers` | Documents/reminders/jobs/learning/AI plug in by implementing `NextActionProvider`; nothing in the dashboard changes. A failing provider is reported and skipped, never breaks the page |
| D26 | `ProfileContext` is the only way personalization reads the profile and returns an empty context without `profile_personalization` consent | GDPR gating in one place; non-consenting users still get a useful universal dashboard |
| D27 | Score = weighted mean of category percentages over *applicable* steps; categories with no applicable steps are excluded (null), user-dismissed steps are excluded; always shipped with `how_calculated` text | Not misleading; explainable; self-reported by design |
| D28 | T-017 dependency revised (was T-014): dashboard ships first on providers; the document tracker/reminders (T-014/T-015) register their own providers and the `track_residence_permit` step links to them | Matches the requested order (content engine → dashboard) without blocking on documents, no rework later |
| D29 | Documents API scopes every query through `$user->documents()` (IDOR → 404) instead of policies | One rule, impossible to forget per-endpoint; verified for every route in tests |
| D30 | Dashboard priority bands: 0–93 deadlines (expired = 0, expiring = 3 + days), 94–95 profile/consent prompts, 100+ routine setup steps | Deadlines always win; bands are documented in `NextActionProvider` |
| D31 | Setup steps can auto-complete from tracked documents (`auto` in `config/setup.php`) and are flagged `auto:true`; user dismissal always wins | Less manual bookkeeping, no misleading state |
| D32 | Reminders are *materialized* (`reminders` rows, unique per doc+kind+offset) and dispatched by a daily command via an atomic `pending → dispatched` claim, then an event (`ReminderDue`) | Idempotent, restart-safe, no double sends; history kept for audit |
| D33 | Late scheduler run sends only the reminder closest to expiry; older overdue ones are `skipped`. Past offsets are never back-filled; already-expired documents get no "expired" notice | Users get one useful message, not a burst |
| D34 | Renewal (expiry change) starts a new cycle; offset/enabled changes recompute only pending rows | Correct behaviour without losing sent history |
| D35 | Notifications store locale-neutral `data`; text is rendered when read/sent in the reader's language; in-app always recorded, email/push need their own consent (+ verified email / registered device); a failing channel never blocks others | Language switch applies to history; GDPR per channel; resilient delivery |
| D36 | Push payload carries only routing ids, never document names/dates | Lock-screen privacy |
| D37 | Calendar dates use `App\Casts\DateOnly` (stored `Y-m-d`) | Eloquent's `date` cast writes datetimes; boundary-day comparisons differed between SQLite and MySQL (found by tests) |
| D38 | `NotifyUserOfReminder` relies on Laravel listener auto-discovery; do not also register it manually (it ran twice) | Documented to avoid regressions; a test asserts exactly one listener |
| D39 | Content modules are thin: model (traits) + `ContentRequest` subclass + `AdminContentResource` subclass + `ContentAdminController` subclass + `ContentPolicy` subclass + one `$contentAdmin(...)` route line; shared `ContentService` does create/update/delete/translations/pivots | Guides, government services/offices and appointment guides share one tested workflow; articles/lessons/jobs/etc. will cost ~100 lines each |
| D40 | Appointments are not a user-booking entity. `BookingInfo` forces `booked_by_expa:false` + localized notice on every booking payload | Hard product rule: never pretend a booking was made |
| D41 | `official` source domains = explicit allow-list + patterns for `comune|regione|provincia|cittametropolitana.<x>.it` and `*.gov.it`; everything else must be `institutional` | Reviewable trust boundary without maintaining 8,000 municipality domains |
| D42 | AI safety guarantees live in code paths (`AiAssistant`, `ResponseProcessor`, label computation), not in the prompt; the fake LLM makes them testable | A prompt can be ignored by a model; code cannot |
| D43 | Knowledge index is derived data fed by `ContentChanged` events; unpublished/sourceless content is structurally unreachable by the assistant | One source of truth (content engine); no stale citations |
| D44 | `TextNormalizer` is shared infrastructure for AI retrieval and the upcoming unified search | One Arabic/Italian normalization, tested once |
| D45 | Daily plan = first uncompleted lesson per type at the learner's level (moving up when exhausted); lessons finished today stay visible as done; level comes from the profile only with personalization consent (else A0) | Deterministic, explainable, no hidden state |
| D46 | Lessons are original teaching material: `requiresSource=false` (still translatable + reviewed workflow). The starter curriculum is language teaching only, flagged for teacher review (T-034) | Learning content is not a claim about official procedures |
| D47 | `SetupCatalog` memoizes per *request object* (never per process) and is flushed on consent change | Dashboard stays at ≤12 queries as providers grow, without cross-request staleness |
| D48 | Content models may declare `requiredLocales()` and `extraPublishProblems()` (used by questions: it+ar, rights note) | Per-module publish rules without forking the engine |
| D49 | Patente questions are only reachable inside exams; theory topics/categories feed the AI knowledge index, questions never do | Protects licensed content and exam integrity |
| D50 | `patente` is a sensitive AI intent: no verified sources → no LLM answer | Traffic-law claims need sources like any other legal information |
| D51 | Jobs live in `job_listings` (Laravel's queue owns `jobs`); pipeline stages are small single-purpose classes: importer → normalizer → extractor → classifier → validator → publisher | Each stage is unit-testable; new source types add only an importer |
| D52 | Extraction is rule-based and explicit-only (CEFR mentions, € amounts, whole-token skills); an LLM extractor can be added behind the same stage later | Deterministic, free, explainable, no hallucinated requirements |
| D53 | Import failure policy: single attempt failures are logged (run row) and retried by the queue (3 tries, 60/300/900 s); only an exhausted job counts toward deactivation (3 consecutive) and alerts admins in-app | Transient outages don't switch sources off; persistent ones do |
| D54 | Match score excludes unknown criteria and reports `confidence`; recommendations need score ≥ 40 and ≥ 20 % confidence | Never punishes missing data, never over-claims |
| D55 | Search is a normalized index (`search_documents`) fed by `ContentChanged` (+ job publisher/moderation/expiry) — same trigger as the AI index; MySQL-agnostic LIKE candidate selection + PHP scoring (title ×4, coverage, phrase-in-title ×1.5, locale ×1.1, type weight) | Works identically on SQLite/MySQL, Arabic-correct today; swap to Meilisearch behind `SearchService` when volume demands |
| D56 | One result per item in the best language of the reader's fallback chain; Italian terms are indexed on every language version | An Arabic user typing "Permesso di soggiorno" finds the Arabic guide |
| D57 | Middleware priority is set explicitly so `Authorize` precedes `SubstituteBindings`; `SecurityHeaders` is global | Closes 404/403 id enumeration and covers unmatched routes |
| D58 | Billing is provider-agnostic: `PaymentProvider` interface (checkout, cancel, signed webhook parsing) + provider-neutral `BillingEvent`; `WebhookHandler` is idempotent (unique event id + unique payment ref). `fake` provider for dev/tests; real adapter blocked on credentials (T-038) | Switching/adding processors changes one class |
| D59 | Entitlements come from the active subscription's plan *features* (editable data); `past_due` keeps a grace period; cancel keeps access until period end; `PlanResolver`/AI limits read them | Pricing and limits change without releases |
| D60 | Checkout redirect URLs are server-built; manual (admin) grants are audited and expire via `expa:billing-expire` | No open redirect; support can comp users safely |
| D61 | Analytics = aggregate daily counters, closed event enum, client events consent-gated, system events server-side and unforgeable; failures never affect requests | Useful product metrics with nothing personal stored |
| D62 | Study Finder: must-match criteria (field, degree, language) filter; budget/city/levels rank; unknown facts excluded from score and shown as `unknown`; tuition/deadlines are only shown when sourced and always accompanied by a "verify on the official page" notice | A ranking tool that can't mislead about money or deadlines |
| D63 | `study` is a sensitive AI intent; universities/programs/scholarships feed the AI knowledge and search indexes; official-domain allow-list gained `universitaly.it` and `studyinitaly.esteri.it` (university sites themselves are `institutional`) | Same trust model as every other module |
