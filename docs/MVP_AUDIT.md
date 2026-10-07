# EXPA MVP Audit (re-audit)

Date: 2026-10-07. Supersedes the 2026-10-05 audit. Method: every row was re-checked against the current code, route list, tests, web pages and mobile screens. Docs (FINAL_REPORT, TASKS, READMEs) were not trusted without a code check. New code-level gaps found during this pass are in `docs/MVP_REAUDIT_FINDINGS.md` (IDs RA-n).

Commands run:
- `cd backend && php artisan test` -> **905 passed, 7439 assertions** (50 s, SQLite). The 2026-10-05 audit counted 663 / 4955.
- `cd backend && php artisan route:list --path=api` -> **376 API routes** (173 public/user, 203 under `admin/`). The earlier audit counted 198.
- `cd web && npm run test` -> **372 passed in 15 files** (Vitest guard, i18n parity, component tests). Earlier: 281 in 13.
- `cd mobile && ../.tools/flutter/bin/flutter test` -> **335 passed** in 31 test files. Earlier: 43. Mobile tests are runnable here (Flutter SDK in `.tools/flutter`).
- i18n parity checked by script: web 2185 keys in each of ar/en/it (0 diff); mobile ARB 614 keys in each; backend `lang/{ar,en,it}` have identical file lists and key counts, `lang/*.json` 50 keys each.

Not run (by instruction or because the tooling is absent): Playwright E2E (`web/e2e`), web production build and `nuxt typecheck`, MariaDB/MySQL run, any real device or emulator, Lighthouse, a real LLM, Stripe, FCM, ClamAV or tesseract.

Status legend: PASS = implemented, tested, meets the MVP requirement. PARTIAL = works, gaps remain. BLOCKED = needs outside input (credentials, humans, legal, content, infrastructure). NOT IMPLEMENTED = absent. FAIL = required behaviour missing or broken.

## 1. Summary table

| # | Item | Status | Evidence (short) |
|---|---|---|---|
| 1 | Authentication | PASS | `AuthTest` (17), `AuthHardeningTest` (15), `TokenHardeningTest`; token list/revoke `auth/tokens`; web BFF httpOnly cookie; mobile secure storage |
| 2 | Email verification | PASS | `EmailVerificationTest` (9); web `pages/verify-email.vue`; mobile deep link `auth_links.dart` + `auth_links_test.dart`. Needs a real mail transport (MVP-6) |
| 3 | Password reset | PASS | `PasswordResetTest` (7); web pages; mobile now completes reset through deep link (`auth_links.dart`, `deep_links_test.dart`) |
| 4 | Profile | PASS | `ProfileTest`, `PrivacyTest`; `GET /countries` and `GET /meta` served (T-031); web `profile.vue`, mobile `profile.dart` |
| 5 | Onboarding | PASS | all questions skippable; `ProfileTest`, `ConsentTest`; web `onboarding.vue`; mobile `onboarding.dart` + `onboarding_appointments_test.dart` |
| 6 | Consents and legal pages | PARTIAL | Ledger and versioned legal documents done (`ConsentTest`, `LegalDocumentsTest`, web `privacy.vue`/`terms.vue`/`cookies.vue`, analytics banner `AnalyticsConsent.vue`). No counsel-approved text is published (MVP-3) |
| 7 | Roles and permissions | PASS | 9 roles incl. moderator (`config/permissions.php`); `AccessControlTest` (19); translator saves via `PATCH .../translations`. Two permissions have no endpoint (RA-11) |
| 8 | Content engine | PASS | `ContentEngineTest` (27), `ContentIntegrityTest`, `ContentModulesAdminTest`, `GuideAdminTest` (28); four-eyes, scheduling, PublishGuard, freshness |
| 9 | Dashboard and EXPA Score | PASS | `DashboardTest` (23), `DocumentDashboardTest`; explainable score; web and mobile. No recommended guides/lessons (RA-2) |
| 10 | Documents and immigration | PARTIAL | Tracker, uploads, reminders solid (`DocumentsTest` 26, `RemindersTest` 19, `ClamdScannerTest`). No guide content exists (MVP-1) |
| 11 | Government services | PARTIAL | API, admin, web `pages/government/*`, mobile `features/catalog`. Zero published services |
| 12 | Appointment guidance | PARTIAL | Redirect-only hub; `appointment_clicked` fires (web and mobile). Zero published guides |
| 13 | AI architecture | PARTIAL | Full pipeline (`AssistantTest` 29, `AssistantHardeningTest`, `KnowledgeTest`, `AnthropicClientHardeningTest`); default driver fake; live LLM untested; keyword intent and retrieval |
| 14 | Italian learning | PARTIAL | Lessons plus vocabulary, 4 exercise types, Leitner review (`LearningTest` 19, `ItalianPracticeTest` 17). No audio or speaking; starter content only, unreviewed |
| 15 | Patente | BLOCKED | Engine, glossary, weak topics, licence guard done (`PatenteTest` 24, `PatenteLearningTest`, `PatenteHardeningTest`). No questions or topics seeded; rules unverified (T-035) |
| 16 | Jobs and matching | PARTIAL | Pipeline, matcher, saved jobs, preferences done (`JobPipelineTest` 25, `JobApiTest`, `JobAdminTest`). No legal source (T-036); translation stage absent; education unscored |
| 17 | Search | PARTIAL | `SearchTest` (20); web and mobile screens; study links mapped. LIKE-based; city profiles, providers, vocabulary not indexed (RA-1) |
| 18 | Notifications | PARTIAL | In-app and email work; `FcmPushSender` code complete (`FcmPushSenderTest` 9) but unverified live; mobile has only a Noop provider and an FCM template |
| 19 | Admin API | PARTIAL | AI knowledge/conversations/usage, cities/regions, settings (read-only), broadcast, user erasure, legal, articles, marketplace, community, housing rules now exist. Missing: payments, translation queue, user create |
| 20 | Admin web UI | PARTIAL | 17 content modules + marketplace and community queues, users, roles, jobs, subscriptions, audit. No UI for AI KB, conversations, settings, broadcast, cities, user erasure (RA-3) |
| 21 | Arabic / English / Italian | PASS | Parity verified (see above); `i18n.test.ts`, `i18n-usage.test.ts`, mobile `l10n_test.dart`. Native-speaker review pending |
| 22 | RTL / LTR | PARTIAL | `dir`/`lang` asserted in E2E for ar/en/it at 390 and 1280; logical-CSS lint passes. E2E not executed in this audit; no device run |
| 23 | SEO (web) | PASS | `server/routes/sitemap*.xml.ts`, dynamic `robots.txt.ts` with Sitemap line and admin Disallow, `useSeo` (canonical, hreflang, OG, JSON-LD), `Breadcrumbs.vue` on 37 pages, admin `noindex`. Needs live validation |
| 24 | Analytics events (CLAUDE.md s42) | PASS | 16 events; `guide_view`, `job_view` counted server-side with consent; `appointment_clicked` posted by web and mobile; `AnalyticsTest` (16) |
| 25 | Study in Italy | PARTIAL | API, admin, finder, web `pages/study/*`, mobile catalog. Content BLOCKED (T-041) |
| 26 | Subscriptions and payments | PARTIAL | Plans, idempotent webhooks, `StripePaymentProvider` (`StripePaymentProviderTest` 14, live-untested), web pricing + checkout. No cancel/invoice UI; nothing on mobile |
| 27 | Scanner / Document Explainer | PARTIAL | `POST documents/explain` (`DocumentExplainerTest` 21), web `documents/explain.vue`, mobile `features/scanner`. Needs tesseract in production; camera never run on device |
| 28 | AI Rental Checker | PARTIAL | `POST housing/check` (`HousingCheckTest` 18), web `housing/*`, mobile `housing.dart`. Seeded rule texts need native review; sourced thresholds need an editor |
| 29 | Healthcare, Money, Business, Family, Daily life, Legal, Travel | PARTIAL | Only guide categories exist (`GuideCategory`, 14 values). No landing pages, no RAL-to-net calculator, no travel-requirements tool (RA-4, RA-5, RA-6) |
| 30 | Marketplace / providers / reviews | PARTIAL | Built: directory, verification, reviews, leads, portal, admin queues (`MarketplaceDirectoryTest` 11, `MarketplacePortalTest` 9); web + mobile; no verification team or real providers |
| 31 | Community and About page | PARTIAL | Q&A, moderation, flag default off (`CommunityTest` 15); web + mobile. Events, groups, language exchange BACKLOG (T-063). No `/about` page |
| 32 | Mobile offline | PARTIAL | Saved guides, lessons, articles, cities cached cache-first (`offline_content_test.dart`, `local_cache_test.dart`). Patente content and downloaded audio not offline |
| 33 | End-to-end tests | PARTIAL | `web/e2e` Playwright + axe: smoke loop over 18 pages x ar/en/it x 2 viewports plus behaviour, feature and layout specs, against a stub API; not in CI; no signed-in journey flows (RA-15) |
| 34 | Deployment, CI run, staging | BLOCKED | `.github/workflows/ci.yml` (backend SQLite + MySQL, web test/typecheck/build, audits) never run, no remote; no staging; no Flutter job |
| 35 | Legal documents module | PARTIAL | Versioned, four-eyes, linked to consent policy version (`LegalDocumentsTest` 8); web/mobile render or show honest "not published". Text blocked on counsel |
| 36 | Articles and city profiles | PASS | `ArticlesAndCitiesTest` (7); web `articles/*`, `cities/*`; mobile `articles.dart`; admin modules. Content empty. Not indexed for search/AI for city profiles (RA-1) |
| 37 | Italian practice (vocabulary, exercises) | PARTIAL | Leitner, four exercise types, teacher-review flag, audio-rights fields (`ItalianPracticeTest` 17); web `learn-italian/practice|vocabulary`; mobile `practice.dart`. No audio files |
| 38 | Live provider adapters | BLOCKED | Anthropic, Stripe, FCM, ClamAV (`ClamdScanner`), tesseract are code-complete and tested against fakes. None ran live (credentials or binaries absent) |

Counts (38 rows): PASS 12 (rows 1-5, 7, 8, 9, 21, 23, 24, 36), PARTIAL 23, BLOCKED 3 (rows 15, 34, 38), NOT IMPLEMENTED 0, FAIL 0.
For the 22 originally requested items (rows 1-22): PASS 9 (1, 2, 3, 4, 5, 7, 8, 9, 21), PARTIAL 12 (6, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 22), BLOCKED 1 (15), NOT IMPLEMENTED 0, FAIL 0.
Changes since 2026-10-05 (34 rows then, 38 now): PASS 8 -> 12; PARTIAL 17 -> 23; NOT IMPLEMENTED 7 -> 0; BLOCKED 2 -> 3.

## 2. Per-item evidence

### 1. Authentication - PASS
- Routes: `POST auth/register|login|logout|logout-all|change-password|forgot-password|reset-password|resend-verification`, `GET auth/me|tokens`, `DELETE auth/tokens/{id}`.
- Password rule `Password::min(10)->letters()->numbers()`, `uncompromised()` in production; token expiry from `SANCTUM_TOKEN_EXPIRATION` (default 43200 min); staff tokens 12 h, 20 live tokens per user; `EnsureAccountActive` on every authenticated route.
- Web: token only in an httpOnly SameSite=Lax cookie through the BFF (`web/server/utils/bff.ts`, `handle.ts`). Mobile: `flutter_secure_storage`, 401 clears the session (`session_resilience_test.dart`).
- Gap: no 2FA (not required). No web or mobile UI for `auth/tokens` or `logout-all` (RA-12).

### 2-3. Email verification, password reset - PASS
- `EmailVerificationTest`, `PasswordResetTest` cover tampered signatures, expiry, single-use tokens, no user enumeration, localized mails.
- Web pages `verify-email.vue`, `forgot-password.vue`, `reset-password.vue`. Mobile `auth_links.dart` handles both links (`auth_links_test.dart`, `deep_links_test.dart`); real App Links/Universal Links are DEVICE_VERIFICATION_REQUIRED.
- Operational: `MAIL_MAILER=log` in `.env.example`; preflight warns (MVP-6).

### 4. Profile - PASS
- `GET|PATCH|DELETE profile`, `GET profile/options`, `GET|POST profile/export` (POST re-authenticates), `GET countries`, `GET regions`. Encrypted nationality and residence type. Erasure through `EraseUserData` and `PersonalDataProvider` classes; `PrivacyTest::test_every_user_linked_table_is_covered_by_an_erasure_provider` guards new tables.

### 5. Onboarding - PASS
- `OnboardingService`, `POST profile/onboarding/skip|complete`; personalization fields refused without the `profile_personalization` consent. Web `onboarding.vue`; mobile `onboarding.dart`.

### 6. Consents and legal pages - PARTIAL
- Purposes served by `GET privacy/purposes`; `GET|PUT profile/consents`; append-only versioned ledger; `PRIVACY_POLICY_VERSION` (default `2026-10-draft`) or the published privacy document version triggers re-consent.
- `GET legal/{privacy|terms|cookies}` (public); web `privacy.vue`, `terms.vue`, `cookies.vue` render the published version or an honest "not published yet" with noindex (`e2e/behaviour.spec.ts` "legal pages"); register links the documents with the version.
- Web analytics consent banner exists (`components/layout/AnalyticsConsent.vue`, `utils/analytics.ts`); mobile gates analytics on consent (`analytics_test.dart`).
- Gap: no counsel-approved text exists; production would run with the draft version string unless a document is published (MVP-3, RA-7).

### 7. Roles and permissions - PASS
- Roles: super_admin, admin, content_manager, editor, translator, support_agent, moderator, provider, user. Provider access is by ownership (`EnsureProviderAccount`), so the provider role carries no permissions by design.
- `AccessControlTest` (19), `AdminInvariantsTest`, plus a route-wide authorization matrix (`SecurityTest`).
- Translator: `PATCH admin/*/{id}/translations` (`GuideAdminTest::test_translator_can_save_translation_text_through_the_translations_endpoint_only`).
- Residual: `legal.review` and `settings.update` exist but nothing checks them (settings is read-only) (RA-11).

### 8. Content engine - PASS
- Draft/review/approved/published/archived; four-eyes (`CONTENT_FOUR_EYES`, default true); `expa:publish-scheduled`; `PublishGuard` (source name, https URL, type, `last_verified_at`; official domains allow-list plus `OFFICIAL_DOMAINS_EXTRA`); freshness thresholds.
- Limit: only `ar` is required to publish (`config/content.php` `required_locales_to_publish`) (MVP-14).

### 9. Dashboard and EXPA Score - PASS
- `GET dashboard|dashboard/tasks`, `PUT dashboard/tasks/{key}`; `ScoreCalculator` with `how_calculated`; document-expiry actions; dismissed/applicable flags (T-032 done).
- Caveat: tasks link to guide slugs (`codice-fiscale`, `residenza`, `spid`, ...) that do not exist until editors enter content (MVP-1).

### 10-12. Documents, government, appointments - PARTIAL
- Tracker: `my-documents` CRUD plus attachments; MIME-sniffed uploads; encrypted at rest; scanner chain with `ClamdScanner` (fail-closed) and `BasicContentScanner`; reminders 90/60/30/14/7 plus custom offsets; `expa:send-reminders` daily.
- Government: `GET government/services|offices` with region/city filters; admin CRUD; web and mobile screens. Appointments: `GET appointments/hub|guides`, redirect only (`booked_by_expa:false`).
- Gap: `DatabaseSeeder` seeds access, geography, document types, lessons, vocabulary, housing rules and plans; no guides, services, offices or appointment guides (invented facts would violate CLAUDE.md s54).

### 13. AI architecture - PARTIAL
- Pipeline in `app/Domains/Ai/Services` (intent, consent-gated context, retriever, `SourceVerifier`, prompt, `ResponseProcessor`, `ActionSuggester`, quotas). `GET|DELETE ai/conversations`, `GET ai/usage`; admin `ai/knowledge`, `ai/knowledge/reindex`, `ai/conversations` (metadata only), `ai/usage`.
- Knowledge indexed: guides, government services/offices, appointment guides, Patente topics/categories, universities, programs, scholarships, articles (sourced only). Not indexed: city profiles, providers, lessons, legal (RA-1).
- Gaps: `AI_DRIVER=fake` default; Anthropic adapter only tested with `Http::fake` (MVP-4); keyword intent (T-042, MVP-22); lexical retrieval; no streaming; no AI Patente Teacher (RA-9).

### 14. Italian learning - PARTIAL
- Lessons (`italian/lessons|daily|levels|progress|meta`) plus `italian/vocabulary`, `italian/exercises` (4 types), `italian/practice/review|progress`, `italian/scenarios`; 12 scenarios; daily plan integrates practice.
- Seeders: `StarterCurriculumSeeder`, `ItalianPracticeStarterSeeder`. Outside local/testing they enter the review queue (not auto-published). In local/testing they are published.
- Missing: listening audio (no files, licence unknown), speaking practice, B1-C1 content.

### 15. Patente - BLOCKED
- 15 public routes (categories, topics, rules, exams, answers, progress, weak-topics, glossary, topic/weak practice, instant check). Licensing guard: questions need `license_type` or `rights_note`, `license_proof_ref`; `PATENTE_LEGACY_RIGHTS_NOTE` handling. Mobile has Patente screens (`patente_test.dart`, `patente_learning_test.dart`).
- Blockers (T-035): no categories, topics or questions; exam rules unverified; no AI Patente Teacher; no road-sign content.

### 16. Jobs and matching - PARTIAL
- Pipeline importers, normalizer, extractor, classifier, validator, publisher; `JobSourceAdminController` refuses `active=true` without a `legal_basis` of at least 20 characters (`JobAdminTest::test_an_active_source_requires_a_documented_legal_basis`). `GET jobs|jobs/recommended|jobs/saved|jobs/profile`, save/apply-click.
- Gaps: no legal source (T-036); `config/jobs.php` `translate` is read by no code (MVP-16); education has no scoring (T-055, BLOCKED_DATA); user alerts BLOCKED_LEGAL (T-056).

### 17. Search - PARTIAL
- `GET search|search/suggest`, Arabic normalization, index over 11 content types plus jobs; web `search.vue`; mobile `search.dart`; web `mapApiRoute` maps study, articles, cities, providers.
- Gaps: LIKE-based, 300-row caps (MVP-20); city profiles, providers, vocabulary, legal not indexed (RA-1).

### 18. Notifications - PARTIAL
- `NotificationService`: in-app always; email and push consent-gated; `FcmPushSender` (HTTP v1) selected by `notifications.push_driver=fcm`; `LogPushSender` default; `POST|DELETE devices`; mobile `PushRegistrar` with Noop provider and `tool/fcm/fcm_push_service.dart.template`.
- Events: reminders, job-source failure, provider lead, broadcast. No job-match or content-update events.

### 19. Admin API - PARTIAL
- 203 admin routes: users (list, show, update, roles, erasure), roles, cities/regions, content modules (guides, government, appointments, Italian lessons/vocabulary/exercises, Patente, study, articles, city profiles, legal, housing rules), marketplace and community moderation, job sources and runs, jobs status, subscriptions, stats (incl. system health: failed/pending queue, scheduler heartbeat), analytics, audit logs, AI knowledge/conversations/usage, broadcast, settings (GET).
- Missing against CLAUDE.md s27: Payments list, Translations queue (beyond per-item PATCH), user create, settings update.

### 20. Admin web UI - PARTIAL
- `utils/admin/modules.ts`: guides, government services/offices, appointment guides, Italian lessons/vocabulary/exercises, Patente categories/topics/questions, universities, programs, scholarships, legal documents, articles, city profiles, marketplace providers, housing rules. Separate pages for marketplace verification/reviews/reports, community moderation, users, roles, jobs, subscriptions, audit logs, dashboard.
- Missing UI for endpoints that exist: AI knowledge and conversations, settings, broadcast, cities/regions, user erasure (RA-3). E2E covers the mobile drawer focus handling and axe on the users table in ar/en/it (not run here).

### 21. Arabic / English / Italian - PASS
- Web `i18n/locales/{ar,en,it}.json` 2695 lines, 2185 keys each, zero key diff; heuristic scan finds only 2 Arabic values equal to English (proper nouns) and 5 Italian values equal to English. Mobile ARB 614 keys each (`l10n_test.dart`). Backend lang files identical per locale. DB content via `HasTranslations` with explicit fallback chains.
- Caveat: no native-speaker review (MVP-10).

### 22. RTL / LTR - PARTIAL
- `useSeo` and `app.vue` set `lang` and `dir`; `lint-style.test.ts` bans physical left/right CSS; E2E asserts `dir` per locale, no horizontal overflow, axe, one `h1`; Flutter widget tests run ar/en/it at 360 and 320 px with 1.5x text for most screens. Not executed in a browser or on a device in this audit; mobile fonts not bundled.

### 23. SEO - PASS
- Dynamic `robots.txt` (Sitemap line, admin and private paths disallowed), `sitemap.xml` index plus per-locale sitemaps, canonical and hreflang ignoring query strings (E2E "canonical and hreflang ignore the query string"), OG, JSON-LD on home, articles, cities, guides, breadcrumbs, 503+noindex on API outage.
- Needs validation on a deployed host (search console, structured-data test).

### 24. Analytics - PASS
- 16 `AnalyticsEvent` cases (all 12 from CLAUDE.md s42 plus `patente_practice`, `vocabulary_practice`, `document_explained`, `housing_check`). `GuideController::show` and `JobController::show` count views with consent; web `useAnalytics` posts `appointment_clicked`; mobile `core/analytics`. No marketplace events (T-064 partial).

### 25. Study in Italy - PARTIAL
- `study/finder|meta|universities|programs|scholarships` plus detail; web `pages/study/*`; mobile `features/catalog`. Content BLOCKED (T-041).

### 26. Subscriptions and payments - PARTIAL
- `billing/plans|subscription|checkout|cancel|invoices`, signed webhooks; `StripePaymentProvider`, dunning, state machines. Web `pricing.vue` with checkout and `billing_available` handling. No cancel or invoice UI (RA-12); nothing on mobile. Live Stripe and VAT BLOCKED (T-038, T-058).

### 27. Scanner and Document Explainer - PARTIAL
- Backend `POST documents/explain`, `GET documents/explain/usage`; classifier, key dates, redaction, nothing persisted; web `documents/explain.vue`; mobile scanner flow with manual paste fallback. `OCR_DRIVER=null` by default (tesseract needs install); camera, OCR quality and real documents not verified.

### 28. AI Rental Checker - PARTIAL
- `POST housing/check`, `GET housing/checks|usage`; extractor in ar/it/en, editable sourced rules (`HousingRuleSeeder` general guidance, review queue outside local), cost estimate with assumptions, optional LLM explanation, encrypted optional save with `HOUSING_RETENTION_DAYS`. Web and mobile screens; never a legal conclusion.

### 29. Life-area modules - PARTIAL
- `GuideCategory`: immigration, documents, work, study, housing, healthcare, money, business, family, daily_life, driving, travel, legal, language. No seeded content, no per-category routes, no RAL-to-net calculator, no travel-requirements tool (RA-4 to RA-6). The provider directory covers legal-help discovery (CAF, patronato, lawyers, translators).

### 30. Marketplace - PARTIAL
- `providers`, `providers/{slug}/reviews|leads`, `provider/*` portal, `my/provider-leads|reviews`, report endpoints, admin verification and review moderation, GDPR provider and retention job. Web `pages/services`, `pages/provider/*`, `my-requests.vue`; mobile `marketplace.dart`. Provider portal is web-only. Needs a staffed verification process.

### 31. Community - PARTIAL
- 18 community routes; `community.enabled` default off (`COMMUNITY_ENABLED`); `GET community/meta` lets clients hide entry points. Web `pages/community/*`; mobile `community.dart` (list, detail, ask, answer, report; votes/comments/blocks web-only). Launch is a business decision (moderation staffing). No `/about` page (RA-6).

### 32. Mobile offline - PARTIAL
- `core/cache` (local cache, cache-first repository), `saved_content.dart`, offline banner, cold start from cached profile. Patente content, vocabulary and audio are not available offline.

### 33. End-to-end tests - PARTIAL
- `web/e2e`: smoke (18 pages x 3 locales x 2 viewports with axe, overflow, hydration), behaviour (headers, CSP, canonical/hreflang, robots/sitemap, legal pages, 404, keyboard menu, admin drawer), features (housing, explainer, contact consent, analytics header, community hidden), layout. They use `e2e/stub/server.mjs` instead of the real API; no CI job; no full signed-in journeys (RA-15). No mobile integration tests.

### 34. Deployment - BLOCKED
- `docker-compose.yml`, `docker/`, `docs/DEPLOYMENT.md`, `.github/workflows/ci.yml` exist; CI has never run; no staging; ClamAV, Redis, supervised worker, SMTP, TLS not provisioned (T-057).

### 35. Legal documents - PARTIAL
- `GET legal/{slug}`, admin `legal` module with four-eyes and `legal.publish` (admin only); consent records the published privacy version. Texts must come from counsel.

### 36. Articles and city profiles - PASS
- `articles`, `articles/categories`, `articles/{slug}`, `cities/{slug}`, `city-profiles`, `guides/{slug}/local-info`; sourced blocks, `general_guidance` labelling; admin CRUD; articles indexed for search and AI. City profiles are not indexed (RA-1). `GET articles/categories` has no direct test (RA-10).

### 37. Italian practice - PARTIAL
- See row 14. Audio is rights-gated (`audio` fields carry licence data) but no audio is shipped; teacher-review flag `LEARNING_REQUIRE_TEACHER_REVIEW` defaults to false.

### 38. Live adapters - BLOCKED
- `AnthropicClient` (T-019), `StripePaymentProvider` (T-038), `FcmPushSender` (T-016b), `ClamdScanner` (T-043), `TesseractOcrEngine` (T-072). All covered by fakes; none exercised against the real service.

## 3. Cross-surface matrix

Y = implemented, partial = partial, - = absent.

| Capability | Backend API | Web | Mobile |
|---|---|---|---|
| Register / login / logout | Y | Y | Y |
| Email verification | Y | Y | Y (deep link; device-unverified) |
| Password reset | Y | Y | Y (deep link) |
| Session list / logout-all | Y | - | - |
| Profile / privacy / export / erase | Y | Y | Y |
| Consents, legal pages | Y | Y | Y |
| Onboarding | Y | Y | Y |
| Dashboard + EXPA Score, tasks | Y | Y | Y |
| Guides, articles, city profiles | Y | Y | Y |
| Government services/offices | Y | Y | Y |
| Appointment hub | Y | Y | Y |
| Document tracker | Y | Y | Y |
| Attachment upload | Y | Y | - |
| Reminders | Y | via document form | via document form |
| Notifications in-app | Y | Y | Y |
| Push | Y (FCM, unverified) | - | partial (Noop + template) |
| Ask EXPA + history | Y | Y | Y |
| Italian lessons / daily plan | Y | Y | Y |
| Vocabulary / exercises | Y | Y | Y |
| Patente practice, mock exams, glossary | Y | Y | Y |
| Jobs list / detail / match / saved / preferences | Y | Y | Y |
| Search | Y | Y | Y |
| Study finder | Y | Y | Y |
| Billing plans / checkout | Y | Y | - |
| Billing cancel / invoices | Y | - | - |
| Document explainer / scanner | Y | Y | Y |
| Rental checker | Y | Y | Y |
| Marketplace directory / reviews / leads | Y | Y | Y |
| Provider portal | Y | Y | - (out of scope) |
| Community Q&A | Y | Y | partial (no votes/comments/blocks) |
| Admin: content modules | Y | Y | - |
| Admin: users / roles / jobs / subscriptions / audit | Y | Y | - |
| Admin: marketplace / community moderation | Y | Y | - |
| Admin: AI KB / conversations / settings / broadcast / cities | Y | - | - |
| Client analytics events | Y | partial (`appointment_clicked`; consent header on views) | partial (same) |

## 4. Findings (original IDs, re-verified 2026-10-07)

Marks: FIXED (evidence) / OPEN / BLOCKED (classification). Residual work is listed where an item is only partly done.

### P0

**MVP-1. No published content in any content module.** P0, CONTENT VERIFICATION. **BLOCKED.**
Evidence: `DatabaseSeeder` seeds access, geography, document types, starter lessons, practice vocabulary/exercises, housing rules and plans only. No guides, services, offices, appointment guides, Patente or study rows.
Fix: editors enter sourced content through the admin (D24); cover the slugs in `config/setup.php`.

**MVP-2. Patente cannot launch.** P0, LICENSE. **BLOCKED.**
Evidence: no categories, topics or questions; `config/patente.php` rules unverified. The engine and the licence guard (`license_type`, `rights_note`, `license_proof_ref`) are done.

**MVP-3. No approved privacy policy, terms or cookie text.** P0, LEGAL-HUMAN APPROVAL. **BLOCKED** (mechanism FIXED).
FIXED: `LegalDocument` model with versions, four-eyes, public `GET legal/{slug}`, web pages `privacy.vue`/`terms.vue`/`cookies.vue`, mobile `legal.dart`, register links the version (`LegalDocumentsTest`, `e2e/behaviour.spec.ts`). OPEN: counsel text in ar/en/it; preflight does not warn on the draft policy version (RA-7).

**MVP-4. Live AI unverified, default `fake`.** P0, EXTERNAL CREDENTIAL. **BLOCKED.**
Evidence: `config/ai.php` default `fake`; `AnthropicClientHardeningTest` uses `Http::fake`; preflight errors on `fake` in production.

### P1

**MVP-5. Translator cannot save translations.** P1, CODE FIX. **FIXED.**
Evidence: `PATCH admin/*/{id}/translations` (`routes/api.php:204`), `GuideAdminTest::test_translator_can_save_translation_text_through_the_translations_endpoint_only`, `test_translator_cannot_edit_live_content_...`, `test_translation_save_cannot_remove_the_required_arabic_text_...`.

**MVP-6. Mail transport not configured.** P1, EXTERNAL CREDENTIAL. **BLOCKED.** `.env.example` `MAIL_MAILER=log`; preflight warns.

**MVP-7. Push stubbed.** P1, EXTERNAL CREDENTIAL. **BLOCKED** (backend FIXED).
FIXED: `FcmPushSender` (`FcmPushSenderTest`, 9 tests), `POST|DELETE devices`, mobile `PushRegistrar` (`push_registrar_test.dart`). OPEN: Firebase project and keys; the mobile FCM adapter is a template, not compiled in (`tool/fcm/fcm_push_service.dart.template`).

**MVP-8. No legal job sources.** P1, LEGAL-HUMAN APPROVAL. **BLOCKED** (enforcement FIXED).
FIXED: `JobSourceAdminController` rejects `active=true` without a documented `legal_basis` (`JobAdminTest::test_an_active_source_requires_a_documented_legal_basis`). OPEN: contract real feeds (T-036).

**MVP-9. Production infrastructure absent.** P1, EXTERNAL INFRASTRUCTURE. **BLOCKED.** CI never run, no staging, no ClamAV/Redis/worker (T-057).

**MVP-10. Italian curriculum is a stub and unreviewed.** P1, CONTENT VERIFICATION. **BLOCKED** (partial fix).
FIXED: `StarterCurriculumSeeder` and `ItalianPracticeStarterSeeder` send content to `review` outside local/testing; `LEARNING_REQUIRE_TEACHER_REVIEW` exists (default false). OPEN: teacher and native-speaker review, B1-C1 content (T-034).

**MVP-11. Missing learning formats.** P1, CODE FIX. **OPEN** (partial fix).
FIXED: vocabulary, Leitner review, four exercise types, scenarios (`ItalianPracticeTest`). OPEN: audio (BLOCKED, LICENSE) and speaking practice (CODE FIX).

**MVP-12. Analytics `guide_view` / `appointment_clicked` never fire.** P1, CODE FIX. **FIXED.**
Evidence: `GuideController::show` and `JobController::show` count views with consent; `appointment_clicked` through the validated `POST analytics/events` from web (`e2e/features.spec.ts` "appointment clicks are reported") and mobile (`analytics_test.dart`); web consent banner. `AnalyticsTest`.

**MVP-13. Web quality gates thin.** P1, CODE FIX. **OPEN** (partial fix).
FIXED: `web/e2e` Playwright + axe in ar/en/it; CI runs `npm run typecheck` and `npm run build`. OPEN: E2E is not in CI, uses a stub API and has no signed-in journeys (RA-15); `nuxt.config.ts` keeps `typeCheck: false` for dev builds.

### P2

**MVP-14. Only Arabic is required to publish; official-domain list narrow.** P2, CODE FIX / CONFIGURATION. **OPEN** (partial fix).
FIXED: `OFFICIAL_DOMAINS_EXTRA` and `OFFICIAL_DOMAIN_PATTERNS_ENABLED` (`AuditHardeningTest`). OPEN: `required_locales_to_publish = ['ar']`; real comune/ASL domains must be verified and listed by a human.

**MVP-15. Admin gaps against CLAUDE.md s27.** P2, CODE FIX. **OPEN** (backend FIXED).
FIXED: `admin/ai/knowledge|conversations|usage`, `admin/cities|regions`, `admin/settings` (GET), `admin/notifications/broadcast`, `DELETE admin/users/{id}` (`AdminOperationsTest`, `ClientRequestsTest`). OPEN: web UI for these (RA-3); settings update; payments; translation queue.

**MVP-16. Job matching ignores education; no translation stage; no user alerts.** P2, CODE FIX. **OPEN.**
Education BLOCKED_DATA (T-055), alerts BLOCKED_LEGAL (T-056); `config/jobs.php` `translate` still read by no code, and ARCHITECTURE.md still promised a translator stage.

**MVP-17. Mobile coverage gaps.** P2, CODE FIX. **FIXED** (residual in README).
Evidence: mobile now has search, government, study, Patente (exams + practice + glossary), saved jobs, AI history, offline cache, deep links, scanner, housing, marketplace, community, legal, articles/cities; 335 tests. Residual: attachment upload, billing, bundled fonts, dark theme, device builds (DEVICE_VERIFICATION_REQUIRED).

**MVP-18. No sitemap; robots incomplete; admin not noindex.** P2, CODE FIX. **FIXED.**
Evidence: `web/server/routes/sitemap*.xml.ts`, `robots.txt.ts`, `useAdminSeo` sets `noindex`, E2E "robots.txt and sitemaps".

**MVP-19. Web search dead ends for study content.** P2, CODE FIX. **FIXED.** `web/utils/routes.ts` maps study, articles, cities, providers; `web/pages/study/*` exist.

**MVP-20. Search scalability.** P2, CODE FIX. **OPEN.** `SearchService` still LIKE with 300-row caps; measure first.

**MVP-21. Payments not live; no pricing UI.** P2, EXTERNAL CREDENTIAL (+ LEGAL for VAT). **BLOCKED** (pricing UI FIXED).
FIXED: `pricing.vue` with checkout, `StripePaymentProvider`. OPEN: credentials, VAT decision, cancel/invoice UI (RA-12).

**MVP-22. Keyword intent detection.** P2, CODE FIX. **OPEN** (T-042 BACKLOG).

**MVP-23. Government data must be sourced per region and city.** P2, CONTENT VERIFICATION. **BLOCKED.**

### P3

**MVP-24. Countries endpoint and dashboard flags.** P3, CODE FIX. **FIXED.** `GET countries`, `GET regions`, dashboard `dismissed`/`applicable_reason` (T-031, T-032).

**MVP-25. BFF accepts requests with no Origin header.** P3, CODE FIX. **OPEN** (reduced). `originAllowed` now also rejects `Sec-Fetch-Site: cross-site`, but a missing Origin is still allowed (`web/server/utils/bff.ts`).

**MVP-26. Provider role and marketplace models absent.** P3, CODE FIX. **FIXED.** Marketplace domain, portal and admin queues exist.

**MVP-27. Post-MVP modules not built.** P3, CODE FIX. **OPEN** (partial fix). Built: housing checker, document explainer, marketplace, community Q&A, articles, cities, legal documents. Not built: RAL-to-net, travel requirements, per-category landing pages, community events/groups, AI Patente Teacher (RA-4 to RA-6, RA-9).

**MVP-28. Admin accessibility and `/it` layout untested.** P3, CODE FIX. **OPEN.** E2E has an admin drawer and users-table axe test in ar/en/it but it was not run; no screen-reader pass.

**MVP-29. Security tooling not run in the real world.** P3, EXTERNAL INFRASTRUCTURE. **BLOCKED.** External penetration test; transitive `npm audit` findings.

Final counts for MVP-1..29: FIXED 7 (5, 12, 17, 18, 19, 24, 26), OPEN 10 (11, 13, 14, 15, 16, 20, 22, 25, 27, 28), BLOCKED 12 (1, 2, 3, 4, 6, 7, 8, 9, 10, 21, 23, 29). Total 29.

## 5. Honesty check of existing docs (as of this audit)
- `FINAL_REPORT.md` (and `PRODUCTION_AUDIT_*.md` baselines, which are dated snapshots) quote 663 / 281 / 43 tests; `TASKS.md` T-028 quotes 43 mobile tests. Current: 905 / 372 / 335.
- `TASKS.md` T-075 ("Web/mobile screens for housing/documents") is BACKLOG but web pages (`housing/*`, `documents/explain.vue`) and mobile screens (`housing.dart`, `scanner_screen.dart`) exist. T-060 claims city profiles are indexed for search and AI; they are not (RA-1).
- `mobile/README.md` says the `/documents/explain` endpoint "did not exist" in one bullet and describes the final contract in another; the endpoint exists.
- `QA.md`, `PRODUCT_SPEC.md`, `ARCHITECTURE.md`, `AI_SPEC.md`, `GDPR.md`, `SECURITY.md` were corrected in this pass (see the list at the end of `MVP_REAUDIT_FINDINGS.md`).
- `DATABASE.md` has no entry for `city_profiles`, `city_blocks`, `devices` (RA-13).
