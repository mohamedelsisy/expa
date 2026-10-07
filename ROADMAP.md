# EXPA Roadmap

Statuses mirror TASKS.md (the board is authoritative). Snapshot: 2026-10-07. "Code done" means implemented and covered by automated tests; it does not mean verified against real providers, devices or production. Launch blockers are itemised in `docs/LAUNCH_CHECKLIST.md`.

| Phase | Name | Tasks | Status |
|---|---|---|---|
| 0 | Project initialization (monorepo, Laravel scaffold, CI, env, health endpoint) | T-001..T-003, T-029 | DONE (CI file never executed: no git remote) |
| 1 | Architecture docs and design system tokens | T-001, T-025 | DONE |
| 2 | Auth and user system | T-004..T-006, T-031 | DONE |
| 3 | RBAC, audit log, admin foundation | T-007, T-008 | DONE |
| 4 | Content engine (guides, translations, lifecycle) | T-010, T-011 | DONE (code); no content published |
| 5 | Documents and immigration guides | T-011 | Code DONE; content BLOCKED (human) |
| 6 | Government services and offices | T-012 | Code DONE; content BLOCKED (human) |
| 7 | Appointment guides | T-013 | Code DONE; content BLOCKED (human) |
| 8 | Document tracker, reminders, notifications | T-014..T-016 | DONE; T-016b live push BLOCKED_EXTERNAL_CREDENTIAL |
| 9 | My Italy dashboard, EXPA Score, next actions | T-017, T-032 | DONE |
| 10 | AI assistant | T-018, T-019, T-042 | Pipeline DONE; T-019 live LLM BLOCKED_EXTERNAL_CREDENTIAL; T-042 BACKLOG |
| 11 | Italian learning | T-020, T-073, T-034 | Code DONE; T-034 curriculum review BLOCKED (human) |
| 12 | Patente | T-021, T-074, T-035 | Code DONE; T-035 licensing and rule verification BLOCKED (human/legal) |
| 13 | Jobs (importers, pipeline, matching) | T-022, T-023, T-036 | Code DONE; T-036 legal feeds BLOCKED (human/legal); T-055 BLOCKED_DATA; T-056 BLOCKED_LEGAL |
| 14 | Search | T-024 | DONE |
| 15 | Web (Nuxt) | T-025..T-027, T-075 | Core and admin UI DONE; T-075 housing/explainer client screens BACKLOG |
| 16 | Mobile (Flutter) | T-028 | PARTIAL: analyze clean and tests pass; never run on a device; push, scanner, offline not done |
| 17 | Security and GDPR hardening | T-009, T-030, T-043, T-050..T-054 | Code DONE; T-043 ClamAV BLOCKED_EXTERNAL_CREDENTIAL; counsel sign-off BLOCKED_LEGAL (BE-12) |
| 17b | Billing, analytics, study | T-037..T-041, T-058 | Architecture DONE; T-038/T-058 live Stripe BLOCKED_EXTERNAL_CREDENTIAL; T-041 study content BLOCKED (human) |
| 17c | Articles, city profiles, marketplace, community, legal, housing, document explainer | T-060..T-062, T-064, T-070..T-072, T-076 | Backend DONE; T-063 BACKLOG; T-064 PARTIAL (provider email/push BLOCKED_LEGAL) |
| 18 | QA and performance | docs/QA.md | PARTIAL: no load test, no pen test, mobile never on device, a11y unverified |
| 19 | Deployment (Docker, CI/CD, staging/prod) | T-029, T-033, T-057 | BLOCKED_INFRASTRUCTURE: nothing provisioned; Docker artifacts never built |
| 20 | Final audit | docs/MVP_AUDIT.md, docs/PRODUCTION_AUDIT_*.md | Audits done 2026-10-05; re-audit after content and staging |

## Next steps
1. Provision staging and run `php artisan expa:preflight --production` (docs/DEPLOYMENT.md).
2. Supply credentials (Anthropic, Firebase, SMTP; Stripe only if paid plans launch).
3. Counsel-approved legal texts; content pass with official sources; Patente and job-feed licensing decisions.
4. Run the mobile app on devices; accessibility pass; load and security tests.
