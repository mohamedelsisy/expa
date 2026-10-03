# EXPA — Product Specification

**EXPA — Your Life Assistant in Italy.** Arabic-first (ar default, en, it) platform + mobile app helping foreigners live, work, study and settle in Italy.

## 1. Principles
1. Arabic-first, not translated-Italian. Italian terms shown beside Arabic explanations (e.g. *Permesso di Soggiorno* → تصريح الإقامة).
2. Never fabricate government procedures, fees, deadlines, offices or URLs. Every official item carries `source_url`, `source_name`, `source_type`, `last_verified_at`. Stale content is detectable.
3. Never claim a booking was made if the user was only redirected. Never claim visa sponsorship unless the job source says so.
4. AI output is labelled: Official Information / AI Explanation / General Guidance / Third-party Service. Not legal, tax or medical advice.
5. Privacy-by-design (GDPR). Sensitive documents stored only when needed.

## 2. User types / roles
Super Admin, Admin, Content Manager, Translator, Editor, Support Agent, Provider, User. Permissions are granular (`resource.action`), roles are bundles of permissions.

User segments (drive personalization): Newcomer, Worker, Student, Self-employed, Family member, Permit-holder nearing expiry.

## 3. Module map
| # | Module | MVP | Notes |
|---|---|---|---|
| 1 | Auth & Profile | ✔ | Sanctum tokens (mobile/SPA), email verification |
| 2 | My Italy Dashboard + EXPA Score + Next actions | ✔ | Explainable score |
| 3 | Ask EXPA (AI) | ✔ | RAG over verified knowledge base |
| 4 | Documents & Immigration guides | ✔ | Guide template w/ source + last verified |
| 5 | Government services directory | ✔ | Service → Region → City → Office |
| 6 | Appointment hub | ✔ | Official booking links only |
| 7 | Learn Italian (A0–C1) | ✔ | Daily 10-min plan |
| 8 | Patente | ✔ | Own/licensed content only |
| 9 | Jobs (aggregation + matching) | ✔ | Licensed/permitted sources only |
| 10 | Personal document tracker + Reminder engine | ✔ | 90/60/30/14/7 + custom |
| 11 | Notifications (in-app/email/push) | ✔ | Event-driven |
| 12 | Unified search (ar/en/it) | ✔ | |
| 13 | Admin panel + content workflow | ✔ | Draft→Review→Approved→Published→Archived |
| 14 | Study, Housing, Healthcare, Money, Business, Family, Daily life, Legal, Travel | Post-MVP | Content modules reuse the guide engine |
| 15 | Marketplace, Community, Scanner/OCR | Post-MVP | Architecture-ready |
| 16 | Subscriptions (Free/Plus/Pro) | Architecture in MVP | Prices configurable, never hard-coded |

Most "life" modules (housing, healthcare, money, business, family, daily life, travel, legal) are **content categories on the same Guide engine**, not separate code bases.

## 4. Key journeys
- **Onboarding** (skippable optional steps): language → nationality → city → status → Italian level → document dates → goals.
- **Dashboard** → score by category + "What should I do next?" (rules engine over profile + document expiries).
- **Ask EXPA** → intent → profile context → retrieval → source check → LLM → answer with labelled sources + action suggestions (e.g. "create reminder").
- **Document expiry** → reminder schedule → notification → guide for renewal.

## 5. EXPA Score (explainable)
Categories: Documents, Housing, Italian, Work, Healthcare, Banking, Driving. Each category = completed checklist items ÷ applicable items (items not applicable to the user's segment are excluded and shown as such). Overall = weighted mean of applicable categories (weights in config). The UI shows the breakdown and "how this is calculated".

## 6. MVP definition
Items 1–15 of the master list: Auth, Profile, Dashboard, AI, Documents, Government, Appointments, Italian, Patente, Jobs, Admin, Notifications, Search, i18n, Security/GDPR.

## 7. Assumptions (documented, revisable)
- A1: Monorepo: `backend/` (Laravel 13), `web/` (Nuxt 3), `mobile/` (Flutter), `docs/`.
- A2: SQLite in-memory for unit/feature tests; MySQL 8 for dev/staging/prod.
- A3: LLM provider is behind an interface (`LlmClient`); default adapter targets the Anthropic API; key via env only.
- A4: No exam question bank is bundled; Patente questions are authored/licensed content entered via admin.
- A5: Seed content is clearly marked `status=draft` and has no invented facts; real facts must be entered with sources by content staff.
