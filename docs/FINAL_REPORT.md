# EXPA FINAL PROJECT REPORT

Snapshot: 2026-10-07. Evidence-based; every number below was produced by running the suite in this repo during this session unless marked "agent-reported" or "not run".

## 1. Executive Summary

EXPA — "Your Life Assistant in Italy" — exists as a working, Arabic-first (ar default RTL; en, it) platform: a Laravel API, a Nuxt web app (public site, signed-in app, admin panel) and a Flutter mobile app. The software side of the MVP and most post-MVP modules is built and tested. What stands between this repo and a public launch is almost entirely **not code**: no real content has been published, no legal texts exist, no external credentials (AI, push, payments, mail, antivirus) are configured, there is no hosting/staging, the mobile app has never run on a device, and the CI workflow has never run.

## 2. Overall Status

| Status | Verdict |
|---|---|
| CODE COMPLETE | **PARTIAL** — all planned MVP modules plus housing checker, document explainer, marketplace, community (flag off), articles/cities, recommendations, tax-table and travel engines are implemented. Not built: see §7. |
| MVP COMPLETE | **PARTIAL (software yes, product no)** — features exist, but Patente has no questions, no guides/services/offices are published, no legal text is published. The MVP is not usable as a product until content is entered. |
| LAUNCH BLOCKED | **YES** — see §8, §9, §20. |
| PRODUCTION READY | **NO.** Not claimed. Requires infrastructure, credentials, content, legal approval, device verification, a first CI run, load/pen testing. |

## 3. MVP Audit
Full detail: `docs/MVP_AUDIT.md` (re-audited 2026-10-07, 38 rows) and `docs/MVP_REAUDIT_FINDINGS.md`.
Counts: PASS 12 · PARTIAL 23 · BLOCKED 3 (Patente content/licensing, deployment/CI, live adapters) · NOT IMPLEMENTED 0 · FAIL 0 (at re-audit time; later work closed more of the PARTIAL residuals, which were not re-scored).
Original 22 requested items: PASS 9, PARTIAL 12, BLOCKED 1. Original findings MVP-1..29: 7 fixed, 10 open, 12 blocked (see file). Re-audit findings RA-1..15: RA-1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13 and 15 (CI + signed-in e2e) addressed in code afterwards; RA-14 (stale docs) partly addressed by this report.

## 4. Production Audit
Separate audits were run and each has a Resolution table: `PRODUCTION_AUDIT_BACKEND.md` (39 findings; 0 P0, 1 P1 — fixed), `PRODUCTION_AUDIT_WEB.md` (34 findings; 1 P0, 4 P1 — fixed), `PRODUCTION_AUDIT_MOBILE.md` (34 findings; 1 P0 signing/appId, 6 P1 — code parts fixed). Remaining items are P2/P3, WONTFIX with reason, or blocked externally.
Verified by tests/static analysis vs requires device/browser: see §13, §15 and `docs/LAUNCH_CHECKLIST.md`.

## 5. Completed Features (code + tests)
Auth (register/login/logout/verification/reset/tokens), profile + onboarding, consent ledger, GDPR export/erasure, RBAC + audit log, content engine (lifecycle, sources, freshness, scheduling, four-eyes, translator workflow), guides, government services/offices, appointment guides (redirect only), documents tracker + encrypted attachments, reminders (outbox semantics) + notifications, dashboard + EXPA Score, recommendations, AI assistant (source-aware, safety processing, quotas, emergency path), Italian learning (lessons, vocabulary, exercises, spaced repetition), Patente framework (mock exams, weak topics, practice, licensing guard, AI teacher — no questions), jobs pipeline + matching, unified search (ar normalization), study finder, billing architecture + Stripe adapter (not enabled), analytics (aggregate), articles + city profiles, legal documents mechanism, housing rental checker, document explainer + OCR architecture, marketplace (providers, reviews, leads, provider portal), community (flag off), admin UI (content, users, jobs, billing, audit, marketplace, AI, settings, geography), web public site (SEO, sitemap, security headers, a11y-tested), Flutter app (core + new modules).

## 6. Partially Completed Features
Mobile: push (stub + template), scanner (no on-device OCR), offline (guides/articles/lessons only), no billing UI, no provider portal, no attachment upload. Web: no recommendations/net-salary/travel/Patente-teacher UIs yet; community untested with flag on; cover images/audio not rendered (CSP). Job matching ignores education (no data); job alerts blocked on legal consent text. Italian learning: starter content only, unreviewed. Admin: provider services editor, user picker missing.

## 7. Not Implemented
Real content of any kind; on-device OCR; WhatsApp/Telegram channels; voice assistant; digital wallet; appointment integrations; community events/groups; marketplace payments/commissions; OpenAPI generation; request-field docs for auth endpoints; web UIs listed in §6; per-user LLM intent classifier (T-042); bulk key re-encryption command.

## 8. External Blockers (credential / infrastructure)
Anthropic key (T-019: adapter tested with fakes only) · Firebase/APNs (T-016b) · payment provider + tax set-up (T-038: Stripe adapter tested with fakes only) · SMTP · ClamAV daemon (T-043: fail-closed adapter tested with a fake stream only) · tesseract (optional) · Redis, supervised workers/scheduler, production MySQL, hosting/domain/TLS, monitoring, backups · Apple/Google developer accounts.

## 9. Human / Legal Blockers
Counsel-approved privacy policy, terms, cookies text (mechanism built, nothing published; `policy_version` still draft) · consent wording review · Patente: licensing and official rule verification (T-035) · legal job feeds (T-036) · teacher/native review of Italian content (T-034) · sourced content for guides/services/offices/study (T-041) · accountant decisions on VAT/invoicing · moderation/verification team before community/marketplace launch · content for tax tables and travel requirements (engines ship empty by design).

## 10. Security Findings
No IDOR, privilege escalation, SQLi, SSRF bypass, path traversal, mass assignment or committed secrets found in the independent backend audit; items fixed include trusted-proxy config, login-lockout abuse, log flooding, billing webhook row adoption, reminder loss, web runtime-config (P0), missing web security headers, client-IP forwarding, upload scanner bypass strategy (ClamAV adapter). Residual: built-in PDF scanner is weak by design (real AV required), registration reveals email existence (accepted), 20s synchronous LLM call, no penetration test, rate limits behind proxy unverified until staging. Details: `docs/SECURITY.md`, audit resolution tables.

## 11. Dependency Findings
Backend: `composer audit` clean (last run this session earlier). Web: 17 "high" in `npm audit --omit=dev`, all transitive from two advisories (braces ≤3.0.3, node-forge ≤1.4.0) with **no patched release published**; not present in the production bundle (`.output`); `npm audit fix --force` would downgrade nuxt/tailwind module — rejected. Documented in `docs/DEPENDENCY_AUDIT.md`. Mobile: major-version-behind packages and two discontinued transitive packages (see mobile audit).

## 12. Test Results (run this session)
| Suite | Result |
|---|---|
| Backend `php artisan test` (SQLite) | **933 passed**, 7762 assertions; Pint clean |
| Backend on MariaDB 10.4 | 933 passed (agent-reported; instance since deleted to free disk) |
| Web `npm run test` | **375 passed** (15 files); typecheck clean; production build completes |
| Web e2e (Playwright + axe, stub API) | ~210 tests; **no single clean full run was obtained** (failures were timeouts/browser-closed under machine load, passing on isolated re-run; one real race fixed) — agent-reported, not re-run by me |
| Mobile `flutter analyze` / `flutter test` | clean / **335 passed** (re-run by me earlier this session; counts since then unchanged) |
| CI workflow | YAML parses (7 jobs); **never run on GitHub** |
| Not run: load/performance, penetration test, device/emulator, screen readers, real providers |

## 13. Web Status
Builds and runs (verified by build + a locally served production build + a headless-browser check of key pages). Arabic RTL, English and Italian pages pass axe and overflow checks in e2e at 390/1280 (agent-reported). Security headers/CSP, sitemap, robots, JSON-LD, runtime config in place. Needs manual: screen readers, real devices/zoom, native-Arabic visual review, populated pages, staging proxy behaviour, Lighthouse.

## 14. Backend Status
376+ API routes, 933 tests, preflight command with production errors/warnings, scheduler/queues defined (supervision not set up). Defaults for prod documented in `docs/ENVIRONMENT.md` (cache/queue should move off the database; Redis not configured). Adapters (ClamAV, FCM, Stripe, Anthropic) complete but live-untested.

## 15. Mobile Status
Flutter app with ~35 feature screens, ar/en/it (614 ARB keys, parity-tested), secure token storage, 401 handling, offline cache for guides/articles/lessons, scanner flow (review-before-send, paste fallback), push abstraction. **DEVICE_VERIFICATION_REQUIRED:** it has never been built for or run on Android/iOS (no SDK/Xcode here). Release signing, bundle ids, Firebase files, app links, stores: see `docs/MOBILE_SETUP.md`. Not production-ready.

## 16. AI Status
Pipeline, safety processing, quotas, failure fallback, no-prompt-in-logs (tested) are implemented. Default driver is `fake`; the Anthropic adapter has only been exercised with HTTP fakes. Intent detection is keyword-based. No knowledge base content exists, so answers needing sources return the canned "no verified information" reply. Preflight errors if `AI_DRIVER=fake` in production.

## 17. Content Status
**Empty by design.** No guides, services, offices, appointments, Patente questions, study data, jobs, legal texts, tax tables, travel requirements or marketplace providers are published. Starter Italian lessons/vocabulary (22 words, 6 exercises) are marked unreviewed. See `docs/CONTENT_VERIFICATION.md`.

## 18. GDPR Status
Implemented: consent ledger by purpose, export (password re-auth available) and erasure across all personal-data providers (structural guard test), retention jobs, encrypted sensitive fields/files, aggregate-only analytics, data-minimising explainer/housing (nothing stored by default). Open: counsel review, published privacy policy/ROPA/DPIA, DPA with processors (LLM, mail, hosting), cookie banner legal wording, breach process, backups retention alignment. See `docs/GDPR.md`.

## 19. Deployment Status
Dockerfiles, compose, CI workflow and `docs/DEPLOYMENT.md` exist. Nothing has been deployed. A temporary local preview (dev servers + ngrok tunnel to a throwaway database) was used during this session for demonstration only.

## 20. Launch Checklist
`docs/LAUNCH_CHECKLIST.md` (14 sections; every item has STATUS / OWNER / BLOCKER / REQUIRED ACTION). It has not been verified against real providers, devices or hosts.

## 21. Remaining Work
1. Provide credentials and infrastructure; deploy to staging; run CI; fix first-run workflow issues.
2. Content and legal pass (§9) — the dominant effort.
3. Mobile: build on real devices, Firebase, signing, store assets; scanner on-device OCR; remaining screens.
4. Web: UIs for recommendations/tools/Patente teacher; manual accessibility and RTL review.
5. Security: penetration test, load test, proxy/rate-limit verification on staging, key rotation drill.
6. Open P2/P3 items in the audit resolution tables and `web/BACKEND_REQUESTS.md`.

## 22. Recommended Launch Sequence
1. Staging environment (MySQL, Redis, workers, scheduler, TLS, mail, ClamAV) → run `php artisan expa:preflight` with production env until clean.
2. Counsel approves legal texts → publish; set policy version.
3. Content team enters and verifies a first slice (immigration guides, government services, appointment guides) with official sources in ar/en/it; Anthropic key + knowledge indexing.
4. Closed beta on web (Arabic-first users) with community and marketplace disabled; monitor errors/costs.
5. Mobile: device QA, Firebase, store review; staged rollout.
6. Enable Patente (after licensing), jobs (after legal feeds), payments (after provider + accountant), marketplace/community (after moderation team).
