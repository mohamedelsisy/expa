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
| T-016b | E5 | FCM/APNs `PushSender` adapter (live push) | T-016 | P2 | BLOCKED_EXTERNAL_CREDENTIAL — code complete, live-untested (`FcmPushSender`, 9 Http::fake tests; needs Firebase project + service account; APNs key for iOS) |
| T-017 | E6 | Setup catalog + EXPA Score + dashboard + next-action providers (documents/reminders plug in later) | T-011 | P0 | DONE |
| T-018 | E7 | AI pipeline w/ FakeLlm, retriever, verifier, labeler | T-011 | P0 | DONE |
| T-019 | E7 | Anthropic adapter (live) | T-018 | P1 | BLOCKED_EXTERNAL_CREDENTIAL — code complete, live-untested (hardened: retries, caps, budget, no PII in logs; needs ANTHROPIC_API_KEY) |
| T-020 | E8 | Italian levels/lessons/progress/daily plan | T-010 | P1 | DONE |
| T-021 | E9 | Patente categories/topics/mock exams/progress | T-010 | P1 | DONE |
| T-022 | E10 | Job sources/importer framework/pipeline/dedupe | T-010 | P1 | DONE |
| T-023 | E10 | Job matching engine w/ explanation | T-022,T-006 | P1 | DONE |
| T-024 | E11 | Unified search with Arabic normalization | T-011 | P1 | DONE |
| T-025 | E12 | Nuxt scaffold, i18n ar/en/it, RTL, design tokens, UI kit | T-003 | P1 | DONE |
| T-026 | E12 | Web auth/onboarding/dashboard pages | T-025,T-017 | P1 | DONE |
| T-027 | E12 | Admin UI | T-025,T-011 | P2 | DONE (280 web tests; keyboard/screen-reader and /it layout not verified) |
| T-028 | E13 | Flutter app | API stable | P2 | DONE (analyze clean, 43 tests; device builds/push/scanner/offline not done — see mobile/README.md) |
| T-029 | E16 | CI workflow, Dockerfiles, compose | T-003 | P2 | DONE |
| T-031 | E1 | Expose password rules + `GET /countries` (localized) so clients don't duplicate them | T-006 | P3 | DONE (rules in `GET /meta`; countries from ICU via `intl`) |
| T-032 | E6 | Dashboard tasks: explicit `dismissed`/`applicable_reason` flags | T-017 | P3 | DONE |
| T-033 | E16 | Document deployment rule: `APP_URL` must be the API origin reachable from the web BFF (verification links) | T-029 | P2 | DONE |
| T-034 | E8 | Teacher/native-speaker review of the starter curriculum (ar/it accuracy) before launch | T-020 | P1 | BLOCKED (human reviewer) |
| T-035 | E9 | Verify mock-exam rules in config/patente.php against current official rules; obtain licensed/original question content | T-021 | P0 | BLOCKED (human: licensing + official verification) |
| T-036 | E10 | Obtain real, legally usable job feeds (licensed aggregator / employer feeds) and record each source's legal basis | T-022 | P0 | BLOCKED (human: business/legal) |
| T-037 | E15 | Subscriptions & payments architecture | T-007 | P2 | DONE |
| T-038 | E15 | Live payment provider adapter (e.g. Stripe) + VAT/tax handling | T-037 | P1 | BLOCKED_EXTERNAL_CREDENTIAL — code complete, live-untested (`StripePaymentProvider`, dunning, state machines, invoice numbering, VAT architecture with empty tax table; needs Stripe keys + accountant VAT decision, see EXTERNAL_SERVICES.md) |
| T-039 | E15 | Privacy-conscious analytics + admin reporting | T-007 | P2 | DONE |
| T-040 | E17 | Study in Italy: universities, programmes, scholarships, Study Finder | T-011 | P2 | DONE |
| T-041 | E17 | Real, sourced study content (universities, programmes, fees, deadlines) entered via admin | T-040 | P1 | BLOCKED (human: content with official sources) |
| T-042 | E7 | LLM/classifier-based intent & sensitivity detection (keyword detector is a known limit) | T-018 | P2 | BACKLOG |
| T-043 | E14 | Real antivirus scanner adapter (ClamAV) for uploads | T-014 | P0 | BLOCKED_EXTERNAL_CREDENTIAL — code complete, live-untested (`ClamdScanner` fail-closed + `ScannerChain`, 11 tests; needs a running clamd; preflight rejects `basic` in production) |
| T-030 | E14 | Security headers, upload scanner interface, privacy docs | T-014 | P1 | DONE |

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

## Production-audit remediation (2026-10-05)
| ID | Epic | Task | Status |
|---|---|---|---|
| T-050 | Hardening | Backend audit BE-1..BE-39: resolution table in `docs/PRODUCTION_AUDIT_BACKEND.md` | DONE (FIXED / FIXED-CONFIG items verified by tests; BLOCKED_LEGAL: BE-12, BE-34 provenance model; WONTFIX with reasons: BE-15, BE-10 FULLTEXT, BE-36 sync LLM call, BE-35 re-encrypt command) |
| T-051 | MVP | MVP-5 translator saves translations (`PATCH .../translations`) | DONE |
| T-052 | MVP | MVP-12 backend `guide_view`/`job_view` (consent based), `appointment_clicked` via validated public endpoint | DONE (web/mobile must send the consent header and POST `appointment_clicked`) |
| T-053 | MVP | MVP-14 official-domain extension and pattern switch (no domains invented) | DONE (human: verify and list real comune/ASL domains in `OFFICIAL_DOMAINS_EXTRA`) |
| T-054 | MVP | MVP-15 admin endpoints: cities/regions, user erasure, broadcast, settings, AI knowledge + conversation metadata | DONE (backend; web admin UI is separate) |
| T-055 | MVP | MVP-16 job matcher education criterion | BLOCKED_DATA (listings carry no education requirement; inventing one would mislead) |
| T-056 | MVP | MVP-16 consent-based job alerts for saved criteria | BLOCKED_LEGAL (needs a new consent purpose and counsel-approved text) |
| T-057 | Ops | Provision Redis, supervised worker, scheduler monitor, log shipping, ClamAV, SMTP, TLS to DB | BLOCKED_EXTERNAL_INFRASTRUCTURE (docs/ENVIRONMENT.md, docs/EXTERNAL_SERVICES.md) |
| T-058 | Billing | Live Stripe test-mode run, VAT rates entered and verified, SDI/e-invoicing decision | BLOCKED_EXTERNAL_CREDENTIAL + accountant |

## Content, marketplace and community (2026-10-06)
| ID | Epic | Task | Status |
|---|---|---|---|
| T-060 | Content | Articles (categories, tags, SEO, related guides, optional source) + city profiles with sourced blocks and guide hook; public API, admin CRUD, search indexing for articles AND city profiles; AI knowledge indexing for articles and sourced city blocks (corrected by RA-1: earlier text overstated this) | DONE (backend; web/mobile UI separate) |
| T-061 | Marketplace | Provider directory, verification (evidence, expiry), reviews with moderation, leads with consent, provider portal, admin queues, GDPR provider, retention job | DONE (backend). Human: moderation/verification team and verification procedure; counsel review of consent and notice wording |
| T-062 | Community | Q&A, votes, accepted answer, reports, moderation queue, shadow-ban/mute, blocks, official-guide pin, flag `community.enabled` (default off), GDPR | DONE (backend). Launch is a business decision: enable only with a staffed moderation team |
| T-063 | Community | Events (admin-curated, sourced), language exchange, groups | BACKLOG (planned, out of scope) |
| T-064 | Marketplace | Provider notification on new lead (in-app/email), commissions/payments, marketplace analytics events | PARTIAL: in-app lead notification DONE; email/push to providers BLOCKED_LEGAL (needs a business-message consent purpose); commissions/payments and analytics events BACKLOG |

## Foundations: legal, housing, documents, learning, patente (2026-10-06)
| ID | Epic | Task | Status |
|---|---|---|---|
| T-070 | Legal | Versioned legal documents (privacy/terms/cookies), lifecycle + four-eyes, `policy_version` linked to the published privacy version | DONE (backend). BLOCKED on counsel: text must be written/approved by legal counsel before publishing |
| T-071 | Housing | Rental checker: extractor (ar/it/en), editable sourced rule table, cost estimate with assumptions, optional AI explanation, optional encrypted save | DONE (backend). Human: native review of seeded rule texts; admin-entered sourced rules for any statutory limit |
| T-072 | Documents | Explainer + OCR architecture (`OcrEngine`, Null/Tesseract), classifier, key dates, redaction, nothing persisted | DONE (backend). Human: install tesseract + language packs and set `OCR_DRIVER=tesseract` in production; tune on real photos |
| T-073 | Learning | Vocabulary, exercises, attempts, Leitner, daily-plan integration, teacher-review flag, audio rights, admin CRUD | DONE (backend). Human: Italian teacher / native Arabic review of the starter content (T-034) |
| T-074 | Patente | Structured licensing guard, weak topics, topic/weak practice, instant feedback, glossary, admin meta | DONE (backend). Human: licensed question bank + proof (no content shipped) |
| T-075 | Housing/Docs | Web/mobile screens for the above (consent prompts, fallback to pasted text, reviewed notice) | BACKLOG (clients) |
| T-076 | Clients | Backend requests wave: billing_available, updated_at, four-eyes/escalation codes, admin lookups, shapes, audit alias, analytics daily_totals, sortable admin lists, TRUSTED_PROXIES docs (web/BACKEND_REQUESTS #13-#27) | DONE (backend). Left: see web/BACKEND_REQUESTS.md |

## Re-audit pass (2026-10-07)
| ID | Epic | Task | Status |
|---|---|---|---|
| T-080 | Search | RA-1: search index covers city profiles, listable providers (third party), vocabulary, legal documents; AI index covers sourced city blocks, never providers; hourly provider prune | DONE (`SearchExpansionTest`) |
| T-081 | Dashboard | RA-2: `GET /recommendations` with reasons, consent-gated | DONE (`RecommendationsTest`). Clients: web/mobile UI BACKLOG |
| T-082 | Money | RA-4: `tax_tables` + net-salary estimator, no seeded numbers | DONE (backend). BLOCKED_LEGAL/CONTENT: an admin must enter and publish verified tables (official source, tax year); until then the endpoint answers `available:false` |
| T-083 | Travel | RA-5: `travel_requirements` + lookup, no seeded data | DONE (backend). BLOCKED_CONTENT: entries must be researched and sourced by editors |
| T-084 | Ops | RA-7 preflight checks, RA-8 env documentation | DONE (`PreflightTest`) |
| T-085 | AI | RA-9: AI Patente Teacher | DONE (backend, `PatenteTeacherTest`). BLOCKED on a licensed question bank for question mode; topic mode works with published theory |
| T-086 | QA | RA-10 direct tests for six routes; RA-11 permissions; RA-13 DATABASE.md | DONE |
| T-087 | Content | End-to-end content pipeline tests for all 17 content types + job ingestion (legal basis, Http::fake), `expa:content-readiness`, `GET /admin/content-readiness`, weekly `expa:content-verify-sources` | T-080 | P1 | DONE (`ContentPipelineTest`, `JobIngestionPipelineTest`). BLOCKED_CONTENT: no official content is seeded; editors must enter and verify it |
| T-088 | Security | Final launch security pass (IDOR matrix, route hardening, XSS payloads, Markdown link neutralisation in UGC, audit LIKE escape) | T-030 | P0 | DONE (docs/SECURITY.md). OPEN: 2FA for staff (P1 recommended), live ClamAV |
| T-089 | GDPR | Export/erasure test across all providers; LEGAL_REVIEW_REQUIRED and CONTENT_VERIFICATION_REQUIRED matrices | T-009 | P1 | DONE (`PrivacyAllProvidersTest`). BLOCKED_LEGAL: counsel must approve texts |
