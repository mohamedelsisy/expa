# EXPA FINAL PROJECT REPORT

Snapshot: 2026-10-08 (launch-execution pass). Numbers come from runs performed during this work; "CI" = GitHub Actions run 37723171358 (all 7 jobs green) on commit `bd4a1d8`.

## 1. Executive Summary

EXPA — "Your Life Assistant in Italy" — is an Arabic-first (ar default RTL; en, it) platform made of a Laravel API, a Nuxt web app (public site, signed-in app, admin) and a Flutter mobile app. The software is built, tested on three database engines and green in CI. What remains between this repository and a public launch is **not code**: no real content is published, no legal texts exist, no external credentials (AI, push, payments, mail, antivirus) are configured, nothing has been deployed, and the mobile app has never been built or run on a device. The first CI run exposed and fixed four real defects (see §12), which is exactly why those external checks matter.

## 2. Overall Status

| Status | Verdict |
|---|---|
| **CODE COMPLETE** | **YES for the planned scope** — MVP + post-MVP modules, staff 2FA, content pipeline, adapters. Listed gaps in §6/§7 are deliberate or need external input. |
| **TECHNICALLY READY** (for a staging deployment) | **YES at code level** — preflight, compose/nginx/supervisor/backup/monitor scripts, env docs and runbooks exist. **Not verified**: Docker and nginx were never run here. |
| **EXTERNAL BLOCKED** | **YES** — Anthropic, Firebase/APNs, payment provider, SMTP, ClamAV, hosting/Redis/monitoring, Apple/Google accounts (§8). |
| **LEGAL BLOCKED** | **YES** — privacy policy, terms, cookies text, consent wording, DPAs, VAT/invoicing (§9). Mechanism built, nothing published (`LEGAL_REVIEW_REQUIRED`). |
| **CONTENT BLOCKED** | **YES** — no guides, services, offices, Patente questions, study data, job feeds, tax tables, travel entries (`CONTENT_VERIFICATION_REQUIRED`). |
| **DEVICE VERIFICATION REQUIRED** | **YES** — mobile never built/run (`BUILD_ENVIRONMENT_REQUIRED` + `DEVICE_VERIFICATION_REQUIRED`); screen readers not run. |
| **PRODUCTION READY** | **NO. Not claimed.** |

## 3. MVP Audit
`docs/MVP_AUDIT.md` (re-audit 2026-10-07: 38 rows — PASS 12, PARTIAL 23, BLOCKED 3, NOT IMPLEMENTED 0, FAIL 0) and `docs/MVP_REAUDIT_FINDINGS.md` (RA-1..15). Since that re-audit the following were closed in code: RA-1 search/AI index expansion, RA-2 recommendations, RA-3 admin screens, RA-4 net-salary engine (empty tables), RA-5 travel engine (empty), RA-6 life-area pages, RA-7 preflight checks, RA-8 env docs, RA-9 Patente teacher, RA-10 route tests, RA-11 permissions, RA-12 account UIs, RA-13 DB docs, RA-15 CI + signed-in e2e. Rows were not re-scored after those fixes; PARTIAL rows that depend on content/credentials remain PARTIAL.

## 4. Production Audit
Backend, web and mobile audits with resolution tables: `PRODUCTION_AUDIT_BACKEND.md`, `_WEB.md`, `_MOBILE.md`. Final launch security pass: `docs/SECURITY.md` ("Final launch security pass"). Infra/ops: `docs/OPERATIONS.md`, `docs/DEPLOYMENT.md`. Load: `docs/LOAD_TESTING.md`. Accessibility: `docs/ACCESSIBILITY.md`.

## 5. Completed Features (code + tests)
Auth (register/login/logout/verification/reset/tokens, **staff TOTP 2FA with recovery codes and admin enforcement**), profile/onboarding, consents, GDPR export/erasure (tested across all personal-data providers), RBAC + audit log, content engine (lifecycle, sources, freshness, four-eyes, translator workflow, **end-to-end pipeline test for 18 content types**, `expa:content-readiness` command + admin endpoint/page), guides, government services/offices, appointment guides (redirect only), documents tracker (encrypted), reminders, notifications, dashboard + EXPA Score, recommendations, AI assistant (+ Patente teacher), Italian learning (lessons, vocabulary, exercises, spaced repetition), Patente framework (no questions), jobs pipeline + matching (legal-basis gate), unified search, study finder, billing + Stripe adapter (off), analytics, articles + city profiles, legal documents mechanism, housing rental checker, document explainer + OCR architecture, marketplace + provider portal, community (flag off), net-salary and travel engines (empty by design), admin UI (all modules), web public/app pages, Flutter app (core + new modules + offline + billing + provider portal + scanner flow + 2FA), CI, Docker/nginx/deploy/backup/monitor assets.

## 6. Partially Completed Features
Mobile: push is an abstraction + template (no Firebase files); ML Kit OCR only as a template (Latin script only anyway); PDF evidence upload and provider services editor stay web-only; launcher icon/splash are placeholders. Web: community and several admin flows not exercised against a real backend; cover images/audio not rendered (CSP `'self'`); `contentLang()` not yet on all fallback pages. Job matching ignores education (no data); job alerts blocked on legal consent text. Italian content: starter only, unreviewed. Admin: provider services editor, user picker.

## 7. Not Implemented
Real content; WhatsApp/Telegram channels; voice assistant; digital wallet; appointment integrations; community events/groups; marketplace payments/commissions; WebAuthn; admin-side 2FA reset (operator DB reset documented); OpenAPI generation; S3 for user documents (disk is local, needs code change); Sentry/OpenTelemetry (documented as proposal); LLM-based intent classifier (T-042).

## 8. External Blockers (credential / infrastructure)
Exact steps, env vars, verification commands: `docs/EXTERNAL_SERVICES.md` (9 services). Anthropic key (T-019) · Firebase + APNs (T-016b) · payment provider + tax set-up (T-038) · SMTP · ClamAV daemon (T-043) · tesseract/poppler in the backend image (optional) · Redis · supervised queue/scheduler hosts · production MySQL · domain/TLS · monitoring/alerting · backups storage · Apple/Google developer accounts and signing keys.

## 9. Human / Legal Blockers
Counsel-approved privacy policy, terms, cookies (`LEGAL_REVIEW_REQUIRED`; `policy_version` still draft) · consent wording and retention periods · DPAs with LLM/mail/hosting processors, ROPA/DPIA · breach procedure · Patente licensing and official-rule verification (T-035) · legal job feeds (T-036) · teacher/native review of Italian content (T-034) · sourced content for guides/services/offices/study (T-041) · tax tables and travel requirements entered with official sources · VAT/invoicing decisions · moderation/verification team before community/marketplace · decision whether erased users' community posts should be deleted rather than anonymised.

## 10. Security Findings
No IDOR, privilege escalation, SQLi, SSRF bypass, path traversal, mass assignment or committed secrets were found by the independent audits (secret scan of the full git history clean). Fixed during this work: trusted-proxy config, login lockout abuse, log flooding, billing webhook row adoption, reminder loss, upload-scanner fail-closed + ClamAV adapter, web runtime config (P0), missing web security headers, client-IP forwarding, markdown-link XSS in user content (P1), LIKE wildcard escaping, exam option contrast race. New automated guards: IDOR route matrix, route-hardening test (every admin route gated; every authenticated route runs the active-account check; anonymous writes throttled), XSS/SQLi payload test, all-providers privacy test. **Staff 2FA** implemented; must be switched on in production (`STAFF_2FA_REQUIRED=true`, enforced by preflight). Residual: no penetration test; public list endpoints rely on the global 180/min limiter; rate limits behind a proxy unverified until staging; built-in PDF scanner is weak (real AV required); registration reveals email existence (accepted trade-off).

## 11. Dependency Findings
Backend `composer audit`: clean. Web `npm audit --omit=dev`: criticals removed via verified `overrides` (simple-git 4.0.2, argv-parser 2.0.1); remaining 20 (16 high, 4 moderate) come from `braces ≤3.0.3` and `node-forge ≤1.4.0` which have **no patched release published**; all in build/dev tooling and absent from the production bundle; framework downgrade rejected. CI gates at `critical`. Full decision: `docs/DEPENDENCY_AUDIT.md`. Mobile: several packages behind major versions, two discontinued transitive packages (see mobile audit).

## 12. Test Results
| Suite | Result |
|---|---|
| Backend (SQLite) | local **1012 passed**, 11149 assertions, Pint clean, direct `phpunit` 0 warnings; CI: 1011 passed + 1 skipped (tesseract) |
| Backend on MariaDB 10.11 and MySQL 8 | **CI green**, 1011 passed + 1 skipped each |
| Web unit | local **546 passed** (19 files); CI job green; typecheck and production build green locally |
| Web e2e (Playwright + axe, stub API) | **268 passed on CI (8.6 min)**; also 268 locally |
| Mobile | `flutter analyze` clean; **429 tests passed** locally; CI mobile job green (Flutter 3.47.6) |
| CI overall | **First fully green run: 37723171358, 7/7 jobs.** Earlier runs failed and led to real fixes: `OCR_DRIVER=null` parsed to PHP null (explainer 500 on every clean checkout), npm lockfile unusable with npm 10, MySQL JSON key-order assumptions in 7 tests, a test-data-provider warning, an axe contrast race on the exam options |
| Dev-machine smoke load (20 VUs, 25 s, SQLite, empty content) | 59.5 req/s, 0 5xx; p95 login 334 ms, dashboard 547, search 466, jobs 510, guides 523 (misses 500 ms target), ai_ask 682 — **not a load test** |
| NOT run | real load test, penetration test, Docker/nginx, any real external service, any mobile device/emulator, screen readers |

## 13. Web Status
Builds and runs; production server verified behind a tunnel for demos. Security headers/CSP, sitemap, robots, JSON-LD, runtime config, ar/en/it parity (2185+ keys), axe zero violations across ar/en/it × 390/1280 on public and signed-in pages, keyboard flows, 320px reflow. Manual checks remaining: screen readers, real devices/zoom, native-Arabic visual review, populated pages, staging proxy, Lighthouse (`docs/ACCESSIBILITY.md`).

## 14. Backend Status
~380 API routes, 1012 tests on SQLite/MariaDB/MySQL, preflight with production errors/warnings, content-readiness command, scheduler jobs defined, adapters (ClamAV, FCM, Stripe, Anthropic) complete but live-untested. Known: `admin/stats` `pending_queue_jobs` reads 0 under Redis queue (monitor Redis instead); backend image lacks tesseract/poppler; documents disk is local-only.

## 15. Mobile Status
Flutter app (~45 screens), ar/en/it (parity-tested), secure storage, offline cache (guides, articles, lessons, vocabulary, Patente topics), scanner with review-before-send, billing and provider portal, 2FA, Patente exam + AI teacher. Build readiness (ids `it.expa.app`, localized names, permissions, release signing via `key.properties`, `EXPA_ENV` guards) done statically; `docs/MOBILE_SETUP.md` §14 lists every item as DONE-static / `BUILD_ENVIRONMENT_REQUIRED` / `DEVICE_VERIFICATION_REQUIRED`. **No APK/IPA was built and the app was never run on a device. Not production-ready.**

## 16. AI Status
Pipeline, safety processing, quotas, fallback and no-prompt-in-logs are tested. Default driver is `fake`; the Anthropic adapter is exercised only with HTTP fakes (`BLOCKED_EXTERNAL_CREDENTIAL`). Keyword intent detection. With no published sources, sensitive questions get the canned "no verified information" reply. Preflight errors on `AI_DRIVER=fake` in production.

## 17. Content Status
Empty by design (§9). Engines to enter it exist for all types; admin "Content readiness" page and `expa:content-readiness --strict` show what is missing/stale. Per-type verification matrix: `docs/CONTENT_VERIFICATION.md`.

## 18. GDPR Status
Implemented: consent ledger, export (password re-auth available) and erasure across all providers (tested), retention jobs, encryption of sensitive data, aggregate analytics, data-minimising explainer/housing, 2FA data handled. Open: published policy/ROPA/DPIA/DPAs, cookie wording, breach process, backup-retention alignment (`docs/GDPR.md`).

## 19. Deployment Status
Nothing deployed. Prod/staging compose, nginx, supervisor/systemd, backup/restore (restore drill executed on a throwaway MariaDB), monitor and healthcheck scripts, runbooks exist; Docker/nginx unverified here. A temporary local preview (dev servers + ngrok to a throwaway DB) was used for demos only.

## 20. Launch Checklist
`docs/LAUNCH_CHECKLIST.md` (14 sections; STATUS / OWNER / BLOCKER / REQUIRED ACTION) and the prioritised queue `docs/LAUNCH_QUEUE.md` (P0–P3).

## 21. Remaining Work
P0 (cannot launch without): staging infra + credentials; counsel-approved legal texts; first verified content slice with official sources; staff 2FA enabled in production; device builds + Firebase + store accounts for mobile. P1: external penetration test, real load test on staging, screen-reader pass, Anthropic live verification, SMTP deliverability, ClamAV in the image. P2/P3: open items in the audit resolution tables and `web/BACKEND_REQUESTS.md`.

## 22. Recommended Launch Sequence
1. Provision staging (MySQL, Redis, workers, scheduler, TLS, SMTP, ClamAV); run `php artisan expa:preflight` with production env until clean; `docker compose config`/image builds/`nginx -t` in CI.
2. Counsel approves legal texts → publish; set policy version; enable `STAFF_2FA_REQUIRED=true` and enrol staff.
3. Content team enters and verifies a first slice (immigration guides, government services, appointment guides) in ar/en/it with official sources; connect Anthropic and index knowledge.
4. Closed web beta (Arabic-first users), community and marketplace disabled; monitor errors/cost; run load + penetration tests.
5. Mobile: device QA, Firebase, signing, store review; staged rollout.
6. Enable Patente (after licensing), jobs (after legal feeds), payments (after provider + accountant), marketplace/community (after moderation team).
