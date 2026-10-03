# EXPA Roadmap

Order adjusted for dependencies (Notifications before Reminders-driven Dashboard actions; Search after content modules).

| Phase | Name | Depends on | Notes |
|---|---|---|---|
| 0 | Project initialization (monorepo, Laravel scaffold, CI, env, health endpoint) | — | **Current** |
| 1 | Architecture docs & design system tokens | 0 | docs done; web tokens after Nuxt scaffold |
| 2 | Auth & user system (register/login/verify/reset, profile, consents, locale middleware, response envelope) | 0 | |
| 3 | RBAC + audit log + admin foundation | 2 | |
| 4 | Content engine (guides, translations, lifecycle) | 3 | Base for phases 5,6,7 |
| 5 | Documents & Immigration guides | 4 | |
| 6 | Government services/offices | 4 | |
| 7 | Appointment guides | 6 | |
| 8 | Personal document tracker + Reminders + Notifications | 2 | |
| 9 | My Italy dashboard, EXPA Score, next actions | 4,8 | |
| 10 | AI assistant | 4,9 | LLM key = BLOCKED for live calls; Fake client for tests |
| 11 | Italian learning | 3 | |
| 12 | Patente | 3 | Content licensing = human |
| 13 | Jobs (importers, pipeline, matching) | 3 | Source licensing = human |
| 14 | Search | 4–13 | |
| 15 | Web (Nuxt) — design system, i18n/RTL, pages, admin UI | 2+ (incremental) | Starts after phase 2 API is stable |
| 16 | Mobile (Flutter) | API stable | BLOCKED: Flutter SDK not installed |
| 17 | Security & GDPR hardening (export/erasure, headers, scanning) | 2–13 | export/erasure start in phase 2 |
| 18 | QA / Performance | all | |
| 19 | Deployment (Docker, CI/CD, staging/prod) | all | Docker not installed locally |
| 20 | Final audit | all | |

## Immediate sequence
T-001 → T-002 → T-003 → T-004 → T-005 …
