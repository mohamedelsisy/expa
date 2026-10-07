# EXPA MVP Re-audit: new findings (RA-n)

Date: 2026-10-07. Companion to `docs/MVP_AUDIT.md`. These findings are NOT in any earlier audit (`MVP_AUDIT.md` MVP-n, `PRODUCTION_AUDIT_*.md`). Each was verified against the code before being written; evidence names files, routes or commands.

Test baseline for this pass: backend 905 tests / 7439 assertions, web 372 tests (15 files), mobile 335 tests, 376 API routes (203 admin).

Classification values: CODE FIX, CONFIGURATION, EXTERNAL CREDENTIAL, EXTERNAL INFRASTRUCTURE, LEGAL-HUMAN APPROVAL, LICENSE, CONTENT VERIFICATION.

Sorted by severity. No P0 was found. Reuse of earlier IDs: MVP-n items are tracked in `MVP_AUDIT.md`, not repeated here.

## P1

### RA-15. CI has no Flutter or Playwright job; E2E is stub-only and has no signed-in journeys
P1, CODE FIX.
Evidence: `.github/workflows/ci.yml` jobs are `backend`, `backend-mysql`, `web` (test, typecheck, build) and `security`; `grep -n "flutter\|playwright\|e2e" ci.yml` returns nothing. 335 mobile tests and the Playwright suite never run in CI. `web/e2e` tests run against `web/e2e/stub/server.mjs` (a 119-line stub API) and cover public pages, headers, SEO, legal pages, housing, explainer, contact consent, analytics header, and the admin drawer/users table. CLAUDE.md s43 requires end-to-end coverage of authentication, onboarding, dashboard, AI, documents, jobs, learning, Patente and notifications; none of those signed-in journeys is exercised end to end. Not run in this audit.
Fix: add `flutter analyze` + `flutter test` and a Playwright job (browsers cached) to CI; add journey specs (register -> verify -> onboarding -> dashboard -> ask -> document add -> job save -> lesson -> Patente practice) in ar/en/it, ideally against the real API with the fake LLM.

## P2

### RA-1. Search and the AI knowledge index omit city profiles, providers, vocabulary and legal documents
P2, CODE FIX.
Evidence: `SearchIndexer::MAP` (`backend/app/Domains/Search/Services/SearchIndexer.php:28-40`) lists guides, government services/offices, appointment guides, Italian lessons, Patente topics/categories, universities, programs, scholarships and articles. `KnowledgeIndexer::MAP` (`backend/app/Domains/Ai/Services/KnowledgeIndexer.php:28-41`) is the same minus lessons. `grep -rn "CityProfile\|ServiceProvider" app/Domains/Search app/Domains/Ai` returns nothing. `TASKS.md` T-060 says city profiles have "search + knowledge indexing"; that is true only for articles. CLAUDE.md s65 requires searching services and city information. The web route map already links `providers/{slug}` (`web/utils/routes.ts:55`) but no result of that type can occur.
Fix: add `CityProfile` (via its blocks, sourced blocks only) and `ServiceProvider` (published and not expired-verification, labelled third party) to both maps, plus vocabulary to search. Keep community content and exam questions excluded. Add `SearchTest` and `KnowledgeTest` cases.

### RA-2. No recommended guides, lessons, services or reminders (CLAUDE.md s57)
P2, CODE FIX.
Evidence: `grep -ril recommend backend/app/Domains/Dashboard` returns nothing; the only recommendation surface is `GET jobs/recommended` plus dashboard next actions. `GET dashboard` returns no recommended guides, lessons or providers.
Fix: add a `NextActionProvider`/recommendation block driven by profile segment, city, level and missing setup steps, consent-gated (`ProfileContext`), linking only to published content.

### RA-3. Admin web UI is missing for endpoints that already exist
P2, CODE FIX.
Evidence: backend routes `admin/ai/knowledge`, `admin/ai/knowledge/reindex`, `admin/ai/conversations`, `admin/ai/usage`, `admin/settings`, `admin/notifications/broadcast`, `admin/cities|regions`, `DELETE admin/users/{id}` (`backend/routes/api.php:219-229`, `:215`). `web/utils/admin/nav.ts` and `web/utils/admin/modules.ts` contain no entry for them and no page under `web/pages/admin` calls them. Support agents hold `ai.view_conversations` with nothing to open.
Fix: add pages (knowledge status and reindex, conversation metadata, settings view, broadcast form with confirmation, cities/regions editor, erase-user action with typed confirmation) and nav entries gated on the same permissions.

### RA-4. Money module has no RAL-to-net estimator, IRPEF/INPS or payslip helper (CLAUDE.md s13, s14)
P2, CODE FIX plus CONTENT VERIFICATION.
Evidence: `grep -rli "net_salary\|netto\|calculator" backend/app backend/routes web/pages web/composables mobile/lib` matches no feature; `GuideCategory::Money` is a taxonomy value only. The AI Document Explainer covers payslips only as a classified upload.
Fix: add a `/money/net-salary` tool backed by an editable, sourced tax-table config (rates, brackets, regional/municipal add-ons entered by an accountant with source and last-verified date), clearly labelled an estimate. Do not hard-code rates.

### RA-6. Web has none of the life-area routes from CLAUDE.md s25 and no `/about` page
P2, CODE FIX.
Evidence: `web/pages` contains `guides`, `government`, `appointments`, `documents`, `study`, `jobs`, `learn-italian`, `patente`, `housing`, `cities`, `services`, `articles`, `pricing`, `login`, but no `healthcare`, `money`, `business`, `family`, `travel`, `about`. `GuideCategory` values `healthcare`, `money`, `business`, `family`, `daily_life`, `travel`, `legal` only filter the `/guides` list. `explore.vue` has no entry for them. SEO-friendly landing pages per life area are a stated website priority.
Fix: add category landing pages (title, intro, guides filtered by category, related articles/providers, breadcrumbs, JSON-LD, sitemap entries) and an About page with mission and trust model; keep copy in i18n files.

### RA-7. Production preflight does not check several safety switches
P2, CODE FIX.
Evidence: `backend/app/Console/Commands/Preflight.php` checks app key/debug/https, queue, cache, CORS, token expiry, AI/billing/scanner/mail/push drivers, SSRF DNS, logging, proxy, timezone. It does not check `config('content.four_eyes')` (`CONTENT_FOUR_EYES=false` silently removes separation of duties on government content), `config('privacy.policy_version')` still `2026-10-draft` (no published privacy document), `OCR_DRIVER=null` while the explainer is exposed, `LEARNING_REQUIRE_TEACHER_REVIEW=false`, or `COMMUNITY_ENABLED=true` without any moderator role member. `grep -n "four_eyes\|draft\|ocr\|community" Preflight.php` finds nothing.
Fix: add ERROR for four-eyes off in production, WARNING for the others, with tests in `PreflightTest`.

### RA-8. About 30 product configuration variables are undocumented
P2, CONFIGURATION (documentation).
Evidence (script comparing `env('X')` in `backend/config/*.php` with `.env.example` and `docs/ENVIRONMENT.md`; 215 variables in total):
- Missing from both `.env.example` and `ENVIRONMENT.md`: `COMMUNITY_ENABLED`, `COMMUNITY_PREMODERATION`, `COMMUNITY_ERASE_TEXT`, `MARKETPLACE_LEAD_RETENTION_DAYS`, `MARKETPLACE_LIST_UNVERIFIED`, `MARKETPLACE_REVIEW_MIN_ACCOUNT_HOURS`, `MARKETPLACE_VERIFICATION_DAYS`, `MODERATION_MAX_LINKS`, `MODERATION_NEW_ACCOUNT_DAYS`, `EXPLAIN_MAX_DIMENSION`, `EXPLAIN_MAX_TEXT_CHARS`, `OCR_PDFTOPPM_BINARY`, `OCR_PDFTOTEXT_BINARY`, `OCR_TEMP_DIR`, `OCR_TIMEOUT_SECONDS`.
- In `.env.example` or `ENVIRONMENT.md` only partly: `HOUSING_MAX_CHARS`, `HOUSING_RETENTION_DAYS`, `EXPLAIN_MAX_FILE_KB`, `EXPLAIN_MAX_PDF_PAGES`, `EXPLAIN_MAX_PIXELS`, `LEARNING_REQUIRE_TEACHER_REVIEW`, `PATENTE_LEGACY_RIGHTS_NOTE`, `OCR_DRIVER`, `OCR_LANGUAGES`, `OCR_TESSERACT_BINARY` are absent from `ENVIRONMENT.md`.
- In `ENVIRONMENT.md` but not `.env.example`: `CONTENT_FOUR_EYES`, `OFFICIAL_DOMAINS_EXTRA`, `OFFICIAL_DOMAIN_PATTERNS_ENABLED`, `PRIVACY_POLICY_VERSION`, `SANCTUM_TOKEN_EXPIRATION`, `CORS_ALLOWED_ORIGINS`, `ANALYTICS_SYSTEM_EVENTS`, `JOBS_SSRF_DNS_CHECK`, `EXPA_MAX_DEVICES`, `EXPA_MAX_DOCUMENTS`, `EXPA_MAX_JOB_SAVES`, `SEARCH_CACHE_TTL`, `SEARCH_MAX_TOKENS` (verify each before copying).
Fix: add each variable with a safe default and a one-line comment to both files; add a test or script that fails when a new `env()` key in `config/` is in neither.

### RA-9. AI Patente Teacher and Italian-to-Arabic explanation of exam wording are absent
P2, CODE FIX (depends on LICENSE for question content).
Evidence: `grep -rin "teacher" backend/app/Domains/Ai backend/lang/en/ai.php` returns nothing; the AI knowledge index deliberately excludes exam questions (`KnowledgeIndexer.php:33`, D49). The Patente glossary (`GET patente/glossary`, web `patente/glossary.vue`) exists, but there is no tutor flow that explains a topic or a wrong answer in Arabic. CLAUDE.md s7 lists "AI Patente Teacher".
Fix: after licensing, add a topic-scoped explainer that uses only theory topics and the answered question's licensed explanation, reusing `ResponseProcessor` and quotas.

### RA-5. No travel-requirements tool (CLAUDE.md s20)
P2, CONTENT VERIFICATION (plus CODE FIX).
Evidence: `grep -rli travel backend/app backend/routes web/pages mobile/lib` finds only `GuideCategory::Travel` and `config/community.php`. There is no nationality + residence-status + destination flow.
Fix: model it as sourced guides per destination first (official sources only; never claim eligibility without a source), then a lookup UI that links to them. Do not compute eligibility from invented rules.

## P3

### RA-10. Public and admin routes with no direct test
P3, CODE FIX.
Evidence (route list vs `grep -rn` over `backend/tests`): `GET patente/categories`, `GET patente/categories/{slug}`, `GET articles/categories`, `DELETE community/answers/{id}`, `POST admin/community/answer/{id}/moderate`, `POST admin/community/comment/{id}/moderate` have no test that calls them. The route-wide authorization matrix (`SecurityTest`) covers 401/403 only. All other new controllers (housing, explainer, marketplace, community, articles, legal, practice) have dedicated test files.
Fix: add happy-path, 404 and visibility (draft hidden) tests for each.

### RA-11. Permissions that nothing enforces
P3, CODE FIX.
Evidence: `config/permissions.php` defines `settings.update` and `legal.review`; `grep -rn "settings.update\|legal.review" backend/app backend/routes` finds nothing. `admin/settings` is GET only.
Fix: implement the settings update endpoint with audit, or remove the permissions; give `legal.review` a transition check or drop it.

### RA-12. Backend endpoints with no web or mobile UI
P3, CODE FIX.
Evidence (grep of each path over `web/pages|components|composables|stores|server|utils` and `mobile/lib`): `auth/tokens` and `auth/logout-all` (no session-management UI on either client), `billing/cancel` and `billing/invoices` (web `pricing.vue` only starts checkout; mobile has no billing), `community/blocks` (block list management), `italian/levels` (unused; levels come from `italian/meta`).
Fix: add a "devices and sessions" section and a billing management page (cancel at period end, invoices) to web settings; add a blocked-users list to the community UI; or remove unused endpoints.

### RA-13. `DATABASE.md` lacks newer tables
P3, CODE FIX (documentation).
Evidence: `grep -ci "city_profile" docs/DATABASE.md` = 0; `devices` and `city_blocks` are not described; marketplace, community and housing are mentioned only briefly.
Fix: add the missing tables, indexes and retention rules.

### RA-14. Stale statements in documents outside this pass's edit scope
P3, CODE FIX (documentation).
Evidence:
- `TASKS.md` T-075 is BACKLOG although web `pages/housing/*`, `pages/documents/explain.vue` and mobile `housing.dart`, `scanner_screen.dart` exist; T-028 quotes 43 mobile tests (335 now); T-060 claims city-profile search/knowledge indexing (RA-1).
- `docs/FINAL_REPORT.md` quotes 663 / 281 / 43 tests and lists the explainer, marketplace, community and housing as "Not built".
- `mobile/README.md` says the `POST /documents/explain` endpoint "did not exist" in one bullet and documents its final contract in the next.
- `docs/ENVIRONMENT.md` lacks the variables in RA-8.
Fix: update after owners confirm; keep test counts out of prose or generate them in CI.

## Contradictions fixed in docs during this pass
`docs/QA.md`
- Mobile tests were described as "blocked until SDK available": now runnable, 335 tests.
- Playwright E2E and axe were described as part of the pyramid without qualification: now states they exist in `web/e2e`, use a stub API, are not in CI and lack signed-in journeys.
- "~767 feature/unit tests": now 905 tests / 7439 assertions; web 372; mobile 335.
- Added web and mobile run commands; CI note now says there is no Flutter or Playwright job.

`docs/PRODUCT_SPEC.md`
- Module rows 14 and 15 said Study, Housing, Marketplace, Community and Scanner/OCR were post-MVP with "architecture-ready" only: now says what is built and what remains.
- Assumption A5 said seed content is marked `status=draft`: now describes the real behaviour (no facts seeded; teaching and housing seed content is published locally and goes to `review` in staging/production).

`docs/ARCHITECTURE.md`
- Repo layout said mobile is "BLOCKED locally: SDK not installed": SDK present, tests run.
- Domain list was outdated: now lists the actual `app/Domains` set and where controllers live.
- Push channel said FCM adapter "blocked": `FcmPushSender` exists (credentials still needed).
- Jobs pipeline listed a queued Translator stage: not implemented.
- Search said MySQL FULLTEXT and a `SearchEngine` interface: neither exists (LIKE over `search_documents`, per D55).
- Billing said no provider wired: `StripePaymentProvider` exists.
- Files said `MalwareScanner`/ClamAV "documented": `ContentScanner`, `ClamdScanner`, `ScannerChain` exist.
- Added decisions D67-D69 (explainer/OCR, marketplace/community, legal documents).

`docs/AI_SPEC.md`
- Intent detection was described as "rules + LLM fallback": keyword rules only.
- "Later" and "Not built yet" listed Rental Checker, Document Explainer and OCR as future: built (T-071, T-072); index scope updated (Patente theory, study, articles).

`docs/GDPR.md`
- Export described as `GET`: `POST` with password re-authentication.
- Legal documents said "templates need legal review": mechanism exists, texts still blocked.
- Analytics banner described as absent-implied: web banner and mobile consent gate exist.
- Provider list "account, profile, consents, activity_log": updated to the current coverage.

`docs/SECURITY.md`
- CSRF row claimed Sanctum CSRF for a cookie SPA: the API is bearer-only; the BFF origin/fetch-site check is described and the no-Origin gap noted (MVP-25).
- Upload row and residual risk said ClamAV adapter was only a plan (T-030): `ClamdScanner` exists (T-043), still needs a running clamd.
- Upload row said "signed temporary URLs": downloads are authenticated endpoint only.
- XSS row claimed an HTMLPurifier-style allowlist: not used; `ContentSanitizer`/`JobNormalizer` strip HTML and markdown link schemes are neutralised.
