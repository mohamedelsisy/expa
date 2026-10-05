# EXPA MVP Audit

Date: 2026-10-05. Method: code, route list and test inspection. Docs (FINAL_REPORT, TASKS) were not trusted; they were checked against code.

Commands run (all read-only):
- `cd backend && php artisan test` -> 663 passed, 4955 assertions (31 s, SQLite). Matches the docs claim.
- `cd backend && php artisan route:list --path=api` -> 198 API routes.
- `cd web && npm run test` -> 281 passed in 13 files. These are unit/guard tests plus a few component tests. There is no browser or E2E test (no Playwright/Cypress in `web/package.json`).
- `cd mobile && flutter test` -> 43 passed. Only auth, API client, Ask, l10n keys, routes and the app shell are covered. Dashboard, documents, jobs, learn, guides and appointments screens have no tests.

Not run: web production build, typecheck (`nuxt.config.ts` has `typeCheck: false`), MariaDB run, real device, a11y tools.

Status legend: PASS = implemented, tested, meets the requirement for the MVP scope. PARTIAL = works but gaps remain. BLOCKED = needs outside input. NOT IMPLEMENTED = absent. FAIL = required behavior missing or broken.

## 1. Summary table

| # | Item | Status | One-line reason |
|---|---|---|---|
| 1 | Authentication | PASS | Sanctum, throttles, 30-day token expiry, logout-all, change-password; web (httpOnly BFF cookie) and mobile (secure storage) |
| 2 | Email verification | PASS | Signed links, tested; gates AI, Patente exams, admin. Needs a real mail transport |
| 3 | Password reset | PASS | Single-use, expiring, no user enumeration, tokens revoked. Mobile has request screen only |
| 4 | Profile | PASS | GET/PATCH/DELETE, export, erasure job. Countries list not served (T-031) |
| 5 | Onboarding | PASS | All questions skippable; consent-gated personalization |
| 6 | Consents | PARTIAL | Ledger and gating work. No privacy policy, terms or cookie page exists anywhere |
| 7 | Roles and permissions | PARTIAL | 8 roles, matrix tested. Translator cannot save; many permissions have no endpoint; Provider role is empty |
| 8 | Content engine | PASS | Lifecycle, four-eyes, schedule, PublishGuard, source and freshness rules, all tested |
| 9 | Dashboard and EXPA Score | PASS | Explainable score, next actions, document-expiry actions, web and mobile |
| 10 | Documents and immigration | PARTIAL | Tracker, secure uploads and reminders are solid. Zero guides exist (no content) |
| 11 | Government services | PARTIAL | Service/office/region/city model and API done. Zero published services; no mobile screen |
| 12 | Appointment guidance | PARTIAL | Redirect-only hub done correctly. Zero published guides |
| 13 | AI architecture | PARTIAL | Full pipeline. Default driver is fake; live LLM untested; keyword retrieval; no admin KB tooling |
| 14 | Italian learning | PARTIAL | 6 starter lessons (A0-A1) only. No quizzes, audio or speaking. B1-C1 empty |
| 15 | Patente | BLOCKED | Engine done. No question bank, rules unverified, licence needed (T-035) |
| 16 | Jobs and matching | PARTIAL | Importer, dedupe, matcher done. No legal sources (T-036); translation stage missing; education unused |
| 17 | Search | PARTIAL | Arabic-normalized, tested. No mobile screen; study results have no web link; LIKE-based |
| 18 | Notifications | PARTIAL | In-app and email work. Push is a log stub (T-016b); only reminders raise events |
| 19 | Admin API | PARTIAL | Content CRUD, users, jobs, billing, stats, audit. Missing KB, conversations, translations, notifications, settings |
| 20 | Admin web UI | PARTIAL | 10 content modules, users, roles, jobs, subscriptions, audit. a11y and /it untested |
| 21 | Arabic / English / Italian | PASS | 1455 lines per locale file, parity tested; backend lang files for all three; content fallbacks |
| 22 | RTL / LTR | PARTIAL | `dir` is set and logical-CSS lint passes. Never visually verified in a browser or on a device |
| 23 | SEO (web) | PARTIAL | Per-page canonical, hreflang, OG, JSON-LD. No sitemap; robots.txt does not list it or hide admin |
| 24 | Analytics events (CLAUDE.md s42) | PARTIAL | 9 of 12 events fire server-side; `guide_view` and `appointment_clicked` fire nowhere; `job_view` has no client sender |
| 25 | Study in Italy (not in MVP list) | PARTIAL | API, admin, finder done. No web or mobile screens; content BLOCKED (T-041) |
| 26 | Subscriptions and payments (architecture) | PARTIAL | Plans, subscriptions, invoices, idempotent webhooks, fake provider. No live provider; no web or mobile UI |
| 27 | AI Camera / Scanner / Document Explainer | NOT IMPLEMENTED | Post-MVP per PRODUCT_SPEC |
| 28 | AI Rental Checker | NOT IMPLEMENTED | Post-MVP |
| 29 | Housing, Healthcare, Money, Business, Family, Daily life, Legal, Travel modules | NOT IMPLEMENTED | Only guide categories exist. No calculators (RAL to net), no seeded content |
| 30 | Marketplace / service providers / reviews | NOT IMPLEMENTED | Provider role and `providers.*` permissions exist; no model or routes |
| 31 | Community, Articles, Cities pages, Pricing/About pages | NOT IMPLEMENTED | No `articles` model; `/cities` is an API list only |
| 32 | Mobile offline | NOT IMPLEMENTED | Stated in mobile README |
| 33 | End-to-end tests | NOT IMPLEMENTED | CLAUDE.md s43 requires them; QA.md claims Playwright but none exists |
| 34 | Deployment, CI run, staging | BLOCKED | CI file exists, never run (no remote); no staging |

Counts (34 rows): PASS 8 (rows 1-5, 8, 9, 21), PARTIAL 17, BLOCKED 2 (rows 15, 34), NOT IMPLEMENTED 7 (rows 27-33), FAIL 0.
Of the 22 originally requested items (rows 1-22): PASS 8, PARTIAL 13, BLOCKED 1, NOT IMPLEMENTED 0, FAIL 0.

## 2. Per-item evidence

### 1. Authentication - PASS
- Routes: `POST auth/register|login|logout|logout-all|change-password`, `GET auth/me` in `backend/routes/api.php` (throttled `register`, `login`).
- Password rule: `Password::min(10)->letters()->numbers()`, plus `uncompromised()` in production (`AppServiceProvider.php:150`).
- Token expiry 43200 min (`config/sanctum.php:53`); `expa:preflight` fails production if null.
- Tests: `tests/Feature/Auth/AuthTest.php` (17), `AuthHardeningTest.php` (9).
- Web: token only in httpOnly, SameSite=Lax cookie via BFF (`web/server/utils/handle.ts:27`, `bff.ts`). Origin check is skipped when the Origin header is absent (`bff.ts:76`). Acceptable with SameSite=Lax; low risk.
- Mobile: `flutter_secure_storage`; 401 clears the session; `auth_controller_test.dart`, `login_screen_test.dart`.
- Gap: no 2FA (not required by CLAUDE.md).

### 2. Email verification - PASS
- `GET auth/verify-email/{id}/{hash}` (signed, throttled), `POST auth/resend-verification`.
- `EnsureEmailIsVerified` guards `POST ai/ask`, `POST patente/exams` and all `/admin`.
- Tests (`EmailVerificationTest.php`, 9): tampered signature, wrong hash, expired link, cross-account hash, resend, localized mail, middleware code.
- Web `pages/verify-email.vue` and `components/auth/VerifyNeeded.vue`. Mobile has a `/verify` notice; the user opens the emailed link in a browser; no deep link.
- Operational: `MAIL_MAILER=log` in `.env.example`. A real mail provider is required (MVP-6).

### 3. Password reset - PASS
- `POST auth/forgot-password`, `POST auth/reset-password`.
- Tests (`PasswordResetTest.php`, 7): identical response for known/unknown email, single-use, expired token, weak password, revoke tokens, localized mail.
- Web `pages/forgot-password.vue`, `pages/reset-password.vue`. Mobile has `ForgotPasswordScreen` only; the reset itself completes on the web.

### 4. Profile - PASS
- `GET|PATCH|DELETE profile`, `GET profile/export` (throttled `privacy`), `GET profile/options`.
- Nationality and residence type are encrypted at rest (docs/GDPR.md; `ProfileTest.php`).
- Erasure uses queued `EraseUserData` plus 12 `PersonalDataProvider` classes (`app/Domains/Privacy/Providers`); `PrivacyTest.php` has a structural guard over user-linked tables.
- Web `pages/profile.vue`, `privacy-settings.vue`. Mobile `profile.dart` (privacy, export summary).
- Gap: no `GET /countries`; web bundles its own country list (T-031, P3).

### 5. Onboarding - PASS
- `OnboardingService::STEPS`; `POST profile/onboarding/skip|complete`. Fields covered: nationality, city, age range, segment, Italian and English level, residence type, goals (`UpdateProfileRequest`). Document dates go through the documents tracker.
- Personalization fields are refused without `profile_personalization` consent (`ProfileTest`, `ConsentTest`).
- Web `pages/onboarding.vue`; mobile `onboarding.dart`.

### 6. Consents - PARTIAL
- Nine purposes (`ConsentPurpose`); `GET privacy/purposes`, `GET|PUT profile/consents`; append-only versioned ledger; a policy version bump flags consents `outdated` (`config/privacy.php`: `policy_version = 2026-10-draft`). Tests: `ConsentTest.php`.
- Registration requires terms and privacy acceptance (`web/pages/register.vue`).
- Gap: `docs/GDPR.md` lists privacy policy, cookie policy and ToS as "BLOCKED on legal approval". There is no policy page in `web/pages` and no equivalent on mobile. Users consent to texts they cannot read (MVP-3).
- Analytics consent for anonymous visitors is "asserted by the client from its banner" (docs/GDPR.md), but no banner exists in web or mobile.

### 7. Roles and permissions - PARTIAL
- `config/permissions.php` defines the 8 required roles; `AccessControlTest.php` (19 tests): matrix, privilege escalation, self-modification, suspension revokes tokens.
- Defects:
  - Translator holds `translations.update`, but content policies only check `<prefix>.update` (`app/Domains/Content/Policies`, `update()` at line 31-33). A translator can read but cannot save. Admitted as item 22 in `web/BACKEND_REQUESTS.md` (MVP-5).
  - Permissions with no endpoint or UI: `users.delete`, `translations.view/update`, `ai.view_conversations`, `ai.manage_knowledge`, `notifications.send`, `settings.view/update`, `articles.*`, `providers.*`, `cities.*`. The support agent's only AI permission has nothing to act on.
  - Provider role has no permissions and no ownership policy (no provider model).

### 8. Content engine - PASS
- `ContentStatus` = draft, review, approved, published, archived. Four-eyes on approval; scheduling (`POST .../schedule`, `expa:publish-scheduled` every 5 min); `PublishGuard` requires source name, URL, type and `last_verified_at`; an official source must be on the domain allow-list (`config/content.php`); HTTPS-only URLs; freshness thresholds 180 and 365 days.
- Tests: `ContentEngineTest`, `ContentIntegrityTest`, `ContentModulesAdminTest`, `GuideAdminTest`.
- Limits: only `ar` is required to publish (`required_locales_to_publish = ['ar']`), so EN and IT may be missing (CLAUDE.md s73 expects all three). The official-domain list names only six comuni (Roma, Milano, Napoli, Torino, Bologna, Firenze); any other comune site is rejected until code changes (MVP-14).

### 9. Dashboard and EXPA Score - PASS
- `GET dashboard`, `GET dashboard/tasks`, `PUT dashboard/tasks/{key}`.
- `ScoreCalculator`: 7 categories (`config/setup.php`), excludes inapplicable steps, returns `how_calculated` text (`lang/*/setup.php`). Rendered on web (`dashboard.vue:86`) and mobile (`dashboard.dart:107`).
- Next actions: documents expiry (`DocumentActions`), consent, onboarding, learning. Tests: `DashboardTest`, `DocumentDashboardTest`.
- Caveat: tasks link to guide slugs (`codice-fiscale`, `residenza`, `spid`, ...) that do not exist in a fresh database, so those links are dropped until content is entered (MVP-1).

### 10. Documents and immigration - PARTIAL
- Tracker: `my-documents` CRUD plus attachments. Allowed types by detected MIME (pdf/jpg/png/webp), 10 MB file limit, 100 MB quota, AES at rest, `ContentScanner` interface. Default scanner is `basic` heuristics only; ClamAV is BLOCKED (T-043).
- Reminders: default offsets 90/60/30/14/7, custom offsets per document, `expa:send-reminders` daily 08:00 (`routes/console.php`). Tests: `DocumentsTest`, `RemindersTest`, `DateStorageTest`.
- Guides engine carries the required template fields (see `GuideRequest`, `utils/admin/modules.ts`).
- Gap: `DatabaseSeeder` seeds access, geography, document types, 6 lessons and plans. There are no guides, so the immigration/documents guide module is empty.

### 11. Government services - PARTIAL
- Models: service and office with `region_id`, `city_id`, booking method, translations; `GET government/services|offices` with `city`/`region` filters; admin CRUD plus workflow; web `pages/government/*`. No mobile screen.
- Tests: `GovernmentPublicApiTest`, `ContentModulesAdminTest`.
- Gap: no content. All facts need official sources entered by editors.

### 12. Appointment guidance - PARTIAL
- `GET appointments/hub|guides|guides/{slug}`; the hub only redirects to official booking pages and returns a notice; web and mobile (`appointments.dart`) show it. The `appointment_clicked` event is defined but fired nowhere (MVP-12).
- No content seeded.

### 13. AI architecture - PARTIAL
- Pipeline in `app/Domains/Ai/Services`: `IntentDetector` (keyword), `UserContextBuilder` (consent-gated), `KeywordRetriever`, `SourceVerifier` (drops chunks without name or HTTPS URL), `PromptBuilder`, `ResponseProcessor` (link and phone stripping), `ActionSuggester`, usage quotas (free 10/day). Indexing uses published content only (`KnowledgeIndexer.php:57`).
- Source labels, emergency and no-source short-circuits, degraded mode. Tests: `AssistantTest`, `AssistantHardeningTest`, `KnowledgeTest`.
- Gaps:
  - `config/ai.php` defaults to `AI_DRIVER=fake`; the live adapter has only been exercised with `Http::fake` (T-019).
  - Retrieval is lexical only; no embeddings. Intent detection is keyword-based (T-042).
  - No admin API for knowledge sources or conversations though the permissions exist.
  - With zero published content the assistant has no sources.
  - No streaming; mobile has no conversation history screen.
  - No "AI Patente Teacher" (CLAUDE.md s7).

### 14. Italian learning - PARTIAL
- API: `italian/levels|meta|lessons|daily|progress`, `POST lessons/{slug}/progress`. `DailyPlanService` builds the 5-word/grammar/conversation/pronunciation/mission plan across A0-C1. Scenario enum has the 12 required scenarios. Tests: `LearningTest`, `LessonAdminTest`.
- Content: `StarterCurriculumSeeder` has 6 lessons (A0-A1), forced to `published` without teacher review (T-034 BLOCKED). B1, B2 and C1 are empty.
- Missing: quizzes, listening/audio, speaking practice, vocabulary and exercise tables. Pronunciation is text transliteration only.

### 15. Patente - BLOCKED
- API: categories, topics, rules, `POST exams`, answers, progress with weak-topic logic (`config/patente.php`); admin CRUD for categories, topics and questions; `rights_note` required for publication; scraping limits.
- Tests: `PatenteTest`, `PatenteHardeningTest`.
- Blockers (T-035): no seeded categories, topics or questions; exam rules (30 questions, 3 errors, 20 minutes) are unverified config; question content needs a licence or original authoring.
- Not present: AI Patente Teacher, Italian to Arabic vocabulary explanations, road-sign content. Mobile has no Patente screen.

### 16. Jobs and matching - PARTIAL
- Pipeline: `RssImporter`, `JsonFeedImporter` -> normalize -> `JobExtractor` (dictionary/regex, not an LLM) -> dedupe -> `JobClassifier` -> `JobValidator` -> `JobPublisher`; `expa:jobs-import` hourly (per-source schedule); sources disabled after 3 consecutive failures with admin alert; SSRF guard `SafeHttp`; sponsorship true only when structured data says so (`JobNormalizer.php:40`). `job_sources.legal_basis` column exists.
- Matching: `MatchScorer` weights skills 35, experience 10, Italian 15, English 10, remote 10, employment 5, salary 10, location 5, with explanations; `GET jobs/recommended`.
- Tests: `JobPipelineTest`, `JobApiTest`, `JobAdminTest`, `JobHardeningTest`, `JobExtractorTest`.
- Gaps:
  - Translation stage is config only (`config/jobs.php`: `translate => false`); nothing under `app/Domains/Jobs` reads it. The pipeline stage required by CLAUDE.md s8 does not exist.
  - Education is stored in `job_profiles.education` but never scored (no reference to education in `app/Domains/Jobs`).
  - No legal job source exists (T-036). `legal_basis` is nullable; enforcement before activation was not confirmed.
  - No user job alerts; `JobAlertService` only notifies admins.
  - Mobile has no saved-jobs UI.

### 17. Search - PARTIAL
- `GET search`, `GET search/suggest`; `TextNormalizer` handles Arabic variants; `SearchIndexer` indexes 10 content types plus jobs and reindexes on `ContentChanged`. Tests: `SearchTest`, `TextNormalizerTest`.
- Gaps: mobile has no search screen; web results for universities, programs and scholarships get no link because `mapApiRoute` has no `study/*` mapping (`web/utils/routes.ts`) and no web study pages exist; ranking is LIKE-based with a 300-row cap per pass; articles and providers are not searchable because they do not exist.

### 18. Notifications - PARTIAL
- `NotificationService`: in-app always; email and push each need consent; one failing channel does not block others; push payload carries no document names. Events: `ReminderDue` and job-source failure only. Tests: `NotificationsTest`, `RemindersTest`.
- Gaps: push is `LogPushSender` (T-016b); mobile `PushService` is a Noop and never calls `POST devices`; no per-channel preference UI beyond consents; no events for content updates, job matches or subscription changes; `notifications.send` has no admin endpoint.

### 19. Admin API - PARTIAL
- Present: users (list/show/update/roles), roles, content CRUD plus transition/schedule for guides, government services/offices, appointment guides, Italian lessons, Patente categories/topics/questions, universities/programs/scholarships; job sources and runs; jobs status; subscriptions grant/cancel; stats; analytics; audit logs. Tests: `AccessControlTest`, `AuditLogTest`, `ContentModulesAdminTest`, `JobAdminTest`.
- Missing versus CLAUDE.md s27: Roles/Permissions editing, Articles, Cities, Service Providers, Marketplace, AI Knowledge Base, AI Conversations, Translations, Notifications, Payments, System Settings, user create/delete. No Errors or System Health panel was found for s62.

### 20. Admin web UI - PARTIAL
- `web/pages/admin`: dashboard, content modules (`utils/admin/modules.ts`: guides, government services/offices, appointment guides, Italian lessons, Patente categories/topics/questions, universities, programs, scholarships), users, roles, jobs, subscriptions, audit logs. Navigation is filtered by permission (`utils/admin/nav.ts`); tests `admin-*.test.ts`.
- TASKS.md T-027 itself says keyboard/screen-reader and `/it` layout are not verified. Several flows were exercised only through the API. The users, roles, jobs, subscriptions and audit pages do not call `useSeo`; only `cache-control: no-store` is set for admin routes, with no `X-Robots-Tag`.

### 21. Arabic / English / Italian - PASS
- Web: `i18n/locales/{ar,en,it}.json`, 1455 lines each; `tests/i18n.test.ts` and `i18n-usage.test.ts` enforce parity and usage; `strategy: 'prefix'`, default `ar`.
- Backend: `lang/{ar,en,it}`; `SetLocale` (default ar, `Accept-Language`, `?lang=`); DB content via `HasTranslations` with `config/content.php` fallbacks.
- Mobile: `app_ar/en/it.arb` with a key-completeness test.
- Caveat: wording has not been reviewed by native speakers (MVP-10).

### 22. RTL / LTR - PARTIAL
- `<html lang dir>` set in `app.vue` and `useSeo`; `tests/lint-style.test.ts` bans physical left/right CSS; Flutter uses `AlignmentDirectional` and localization delegates; login screen tested in ar/en/it at 1x and 1.5x text.
- No browser, screenshot, Playwright or device run exists. FINAL_REPORT.md admits mobile was never run on a device. Dashboard, documents, jobs and learn screens have no RTL widget tests. Mobile fonts are not bundled.

### 23. SEO - PARTIAL
- `composables/useSeo.ts` gives canonical, hreflang (ar, en, it, x-default), OG, JSON-LD hook, noindex for private pages. No `sitemap.xml` or sitemap module in `nuxt.config.ts`; `public/robots.txt` has no `Sitemap:` line and does not disallow admin. No breadcrumbs found.

### 24. Analytics - PARTIAL
- `AnalyticsEvent` has 12 events. Fired server-side: signup, login, lesson_started, lesson_completed, ai_question, document_added, reminder_created, job_apply_click, subscription_started. `job_view` is only reachable through `POST analytics/events`, which no web or mobile code calls. `guide_view` and `appointment_clicked` have no hook at all.

### 25-26. Study and billing
- Study: `study/*` routes and admin CRUD; no `web/pages/study`, no mobile screen; content BLOCKED (T-041).
- Billing: `plans`, `subscriptions`, `subscription_items`, `payments`, `invoices`, `payment_methods`; idempotent signed webhooks; `BILLING_PROVIDER=fake` is rejected in production by preflight. No pricing page on web, nothing on mobile; live provider and VAT BLOCKED (T-038).

### 27-33. Missing entirely
- Camera scanner, OCR, Document Explainer (s14, s24).
- AI Rental Checker (s11).
- Housing, Healthcare, Money (RAL to net), Business, Family, Daily life, Legal help, Travel as dedicated modules; only `GuideCategory` values exist and no guide content is seeded.
- Service marketplace and provider reviews (s19); Community (s18); Articles.
- Web routes from s25 not present: `/study`, `/housing`, `/healthcare`, `/money`, `/business`, `/family`, `/travel`, `/cities`, `/services`, `/articles`, `/about`, `/pricing`. Existing: `/guides`, `/government`, `/appointments`, `/jobs`, `/learn-italian`, `/patente`, `/documents`, `/search`, auth and settings pages.
- Mobile offline (s64); mobile Patente, study, search, government, billing, saved jobs, AI history, attachment upload.
- Recommendation engine (s57) beyond dashboard actions and `jobs/recommended`: no recommended guides, lessons or services.
- E2E tests (s43), performance or load tests, staging deployment.

## 3. Cross-surface matrix

Y = implemented, partial = partial, - = absent.

| Capability | Backend API | Web | Mobile |
|---|---|---|---|
| Register / login / logout | Y | Y | Y |
| Email verification | Y | Y | partial (notice, no deep link) |
| Password reset | Y | Y | partial (request only) |
| Profile / privacy / export / erase | Y | Y | Y |
| Consents | Y | Y | Y |
| Onboarding | Y | Y | Y |
| Dashboard + EXPA Score | Y | Y | Y |
| Tasks | Y | Y | Y |
| Guides | Y | Y | Y |
| Government services/offices | Y | Y | - |
| Appointment hub | Y | Y | Y |
| Document tracker | Y | Y | Y |
| Document attachments upload | Y | Y | - |
| Reminders | Y | via document form | via document form |
| Notifications (in-app) | Y | Y | Y |
| Push | stub | - | stub |
| Ask EXPA | Y | Y | Y (no history) |
| Italian lessons / daily plan | Y | Y | Y |
| Patente practice and mock exams | Y | Y | - |
| Jobs list / detail / match | Y | Y | Y |
| Saved jobs / preferences / recommended | Y | Y | partial (no saved UI) |
| Search | Y | Y | - |
| Study finder | Y | - | - |
| Billing / plans | Y | - | - |
| Admin: content | Y | Y (10 modules) | - |
| Admin: users / roles | Y | Y | - |
| Admin: job sources | Y | Y | - |
| Admin: subscriptions | Y | Y | - |
| Admin: analytics / audit | Y | Y | - |
| Admin: AI KB / conversations / translations / settings | - | - | - |
| Client analytics events | Y (endpoint only) | - | - |

## 4. Findings

Format: ID, severity, classification, location, suggested fix.

### P0

**MVP-1. No published content exists in any content module.** P0, CONTENT VERIFICATION.
Location: `backend/database/seeders/DatabaseSeeder.php` (no guides, services, offices, appointments, Patente or study seed); `StarterCurriculumSeeder.php` is the only content.
Effect: guides, government services, appointment guides, dashboard guide links and the AI knowledge base are empty, so Ask EXPA has nothing to cite.
Fix: editors enter sourced, officially verified content through the admin (invented seed facts violate CLAUDE.md s54). Cover at least the slugs in `config/setup.php` (`codice-fiscale`, `residenza`, `spid`, `tessera-sanitaria`, `medico-di-base`, `conto-corrente`, `contratto-di-locazione`, `partita-iva`, `patente-b`) and the permesso topics.

**MVP-2. Patente cannot launch.** P0, LICENSE.
Location: `config/patente.php`; T-035.
Effect: zero questions or topics; mock-exam rules unverified.
Fix: obtain a licensed or original question set with a `rights_note`; verify exam rules against the official source.

**MVP-3. No privacy policy, terms or cookie page; consent texts are drafts.** P0, LEGAL-HUMAN APPROVAL.
Location: `backend/config/privacy.php` (`policy_version = 2026-10-draft`); `web/pages` has no privacy/terms/cookies page; `docs/GDPR.md` lists them as blocked.
Fix: obtain approved texts in ar/en/it; add public pages and links from `register.vue`, `privacy-settings.vue` and the mobile register screen; set the real version.

**MVP-4. Live AI is unverified and defaults to fake.** P0, EXTERNAL CREDENTIAL.
Location: `config/ai.php` (`AI_DRIVER=fake`); `AnthropicClient.php`; T-019.
Fix: set `ANTHROPIC_API_KEY` from a secret manager; run end-to-end tests in ar/en/it against real content; review prompts and refusal behavior. `expa:preflight` already warns on `fake`.

### P1

**MVP-5. Translator role cannot save translations.** P1, CODE FIX.
Location: `backend/app/Domains/Content/Policies` (`update()` checks only `<prefix>.update`); `config/permissions.php` translator role.
Fix: let `translations.update` edit translation fields of drafts (or add a separate translation endpoint); add a policy test; close item 22 in `web/BACKEND_REQUESTS.md`.

**MVP-6. Mail transport not configured.** P1, EXTERNAL CREDENTIAL.
Location: `.env.example` (`MAIL_MAILER=log`).
Effect: verification and reset mails never reach users; AI and Patente exams need a verified email.
Fix: SMTP or transactional provider credentials, SPF/DKIM, and a queue worker (verification and reset mails are queued).

**MVP-7. Push notifications are stubbed.** P1, EXTERNAL CREDENTIAL.
Location: `LogPushSender`; `mobile/lib/core/push`; T-016b.
Fix: Firebase project and FCM/APNs keys; implement the `PushSender` adapter and mobile token registration.

**MVP-8. No legal job sources.** P1, LEGAL-HUMAN APPROVAL.
Location: T-036; `job_sources.legal_basis`.
Fix: contract licensed or employer feeds, record the legal basis per source, and enforce a non-empty `legal_basis` before `active = true` in `JobSourceAdminController` (add a test).

**MVP-9. Production infrastructure absent.** P1, EXTERNAL INFRASTRUCTURE.
Location: `docker-compose.yml`, `.github/workflows/ci.yml` (never run, no remote), `docs/DEPLOYMENT.md`; ClamAV (T-043); no staging.
Fix: MySQL and Redis, queue worker and scheduler, HTTPS origins (`expa:preflight --production` must pass), ClamAV, run CI once on a remote.

**MVP-10. Italian curriculum is a 6-lesson stub and unreviewed.** P1, CONTENT VERIFICATION.
Location: `StarterCurriculumSeeder.php`; T-034.
Fix: author A0-C1 lessons with native-speaker (ar) and teacher (it) review; stop forcing `published` on unreviewed seed content.

**MVP-11. Missing learning formats.** P1, CODE FIX.
Location: `backend/app/Domains/Learning` (types: vocabulary, grammar, conversation, pronunciation, mission only).
Fix: add a quiz/exercise model and endpoints, audio (licensed or TTS) for listening and pronunciation, a speaking-practice flow; or mark these post-MVP in PRODUCT_SPEC.

**MVP-12. Analytics events `guide_view` and `appointment_clicked` never fire; no client sends events.** P1, CODE FIX.
Location: `backend/app/Domains/Analytics/AnalyticsEvent.php`; `GuideController::show`, `AppointmentController`; no call to `analytics/events` in `web` or `mobile/lib`.
Fix: record `guide_view` in `GuideController::show` and `appointment_clicked` on a click endpoint; make web and mobile report `job_view` after consent; add a consent banner for anonymous visitors.

**MVP-13. Web quality gates are thin.** P1, CODE FIX.
Location: `web/nuxt.config.ts` (`typeCheck: false`), no E2E, no browser run of RTL pages.
Fix: add Playwright flows (auth, onboarding, dashboard, AI, documents, jobs, learning, Patente) in ar/en/it with axe checks; run typecheck and build in CI.

### P2

**MVP-14. Only Arabic is required to publish; official-domain allow-list is narrow.** P2, CODE FIX / CONFIGURATION.
Location: `config/content.php` (`required_locales_to_publish`, `official_domains`).
Fix: require en and it for core guides or show an explicit "translation pending" label; make the allow-list admin-managed so other comuni and ASL domains need no release.

**MVP-15. Admin gaps against CLAUDE.md s27.** P2, CODE FIX.
Location: `backend/routes/api.php`; `web/utils/admin/nav.ts`.
Fix: add endpoints and UI for knowledge sources (`ai.manage_knowledge`), AI conversations (`ai.view_conversations`), translation queue, manual notifications, cities, settings and user deletion; or remove unused permissions from `config/permissions.php`.

**MVP-16. Job matching ignores education; translation stage missing; no user job alerts.** P2, CODE FIX.
Location: `app/Domains/Jobs/Services/MatchScorer.php`, `config/jobs.php`, `JobAlertService.php`.
Fix: add an education weight and explanation row; implement the translation stage behind `LlmClient` or remove the config key; add user alerts through `NotificationService`.

**MVP-17. Mobile coverage gaps.** P2, CODE FIX.
Location: `mobile/lib/features`; `mobile/README.md`.
Missing: search, government directory, Patente, saved jobs, AI history, attachment upload, offline, deep links, bundled fonts. Never built for a device; 43 tests.
Fix: add search, government and Patente screens; run on Android and iOS; add widget tests for dashboard, documents and jobs in ar.

**MVP-18. No sitemap; robots.txt incomplete; admin not marked noindex.** P2, CODE FIX.
Location: `web/public/robots.txt`, `web/nuxt.config.ts`.
Fix: sitemap covering guides, services and lessons in all locales with hreflang; `Sitemap:` line and `Disallow` for admin and private pages; `X-Robots-Tag: noindex` for admin routes.

**MVP-19. Web search leads to dead ends for study content; no study pages.** P2, CODE FIX.
Location: `web/utils/routes.ts`; no `web/pages/study`.
Fix: add study pages (finder, universities, programs, scholarships) and map the routes, or hide study types from web search until then.

**MVP-20. Search scalability.** P2, CODE FIX.
Location: `backend/app/Domains/Search/Services/SearchService.php` (LIKE, 300-row caps, PHP scoring).
Fix: MySQL FULLTEXT or an external index once content grows; measure first.

**MVP-21. Payments not live; no pricing UI.** P2, EXTERNAL CREDENTIAL (also LEGAL-HUMAN APPROVAL for VAT).
Location: T-038; `BillingController`; no web or mobile billing screens.
Fix: provider credentials, VAT decision by an accountant, pricing page and checkout flow; keep prices in configuration.

**MVP-22. Intent detection is keyword-based.** P2, CODE FIX.
Location: `IntentDetector.php` (T-042).
Fix: add a classifier or LLM intent step; keep the emergency keyword list as a safety net.

**MVP-23. Government and appointment data must be sourced per region and city.** P2, CONTENT VERIFICATION.
Location: `GovernmentController` filters; admin forms.
Fix: give editors a verification checklist; freshness thresholds already exist in `config/content.php`.

### P3

**MVP-24. Countries endpoint and dashboard task flags** (T-031, T-032). P3, CODE FIX. Fix: serve `GET /countries`; add explicit `dismissed` and `applicable_reason`.

**MVP-25. BFF accepts requests with no Origin header.** P3, CODE FIX. Location: `web/server/utils/bff.ts:76`. Fix: require Origin or a custom header on state-changing methods.

**MVP-26. Provider role and marketplace models absent.** P3, CODE FIX. Location: `config/permissions.php`; no providers migration. Fix: plan after MVP or drop the unused permissions.

**MVP-27. Post-MVP modules not built** (housing, healthcare, money calculators, business, family, daily life, legal, travel, rental checker, scanner, document explainer, community, offline). P3 for MVP (post-MVP in PRODUCT_SPEC), CODE FIX. Fix: seed these as guide categories first, then build the tools.

**MVP-28. Admin accessibility and `/it` layout untested.** P3, CODE FIX. Location: T-027. Fix: keyboard and screen-reader pass; include `/it/admin` in E2E.

**MVP-29. Security tooling not run in the real world.** P3, EXTERNAL INFRASTRUCTURE. Fix: external penetration test; clear the 17 high transitive `npm audit` findings as upstream releases land.

## 5. Honesty check of existing docs
- Test counts in FINAL_REPORT.md and TASKS.md (663 backend, 281 web, 43 mobile) are accurate.
- QA.md describes Playwright E2E and axe tests in the pyramid; neither exists in the repository.
- PRODUCT_SPEC assumption A5 says seed content is draft; the only seed content (lessons) is forced to `published`.
