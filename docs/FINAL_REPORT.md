# EXPA — Final Project Report (audit snapshot)

Evidence-based status. **Not production-ready**: several launch blockers need humans, credentials or infrastructure (below).

## Verification evidence (this snapshot)
| Area | Result |
|---|---|
| Backend (Laravel 13, PHP 8.3) | 663 tests / 4955 assertions pass (SQLite; MariaDB 10.4 run per docs/QA.md); Pint clean; `composer audit`: no advisories |
| Web (Nuxt 3) | 281 Vitest tests pass; typecheck clean; production build completes |
| Mobile (Flutter 3.47.6) | `flutter analyze` clean; 43 tests pass; **never run on a device/emulator, no APK/IPA built** |
| Independent security/correctness review | Done earlier; findings fixed (docs/SECURITY.md) |
| `npm audit --omit=dev` (web) | 17 high, all transitive build/dev tooling (braces, node-forge via nuxt/nitro/tailwind); fix requires breaking downgrades — tracked, not forced |

## Completed modules
Auth (Sanctum, verification, reset), profile/onboarding, consent ledger + GDPR export/erasure, RBAC + audit log, content engine (lifecycle, sources, freshness, PublishGuard, scheduling), guides, government services/offices, appointment guides (redirect only), documents tracker + secure attachments, reminders + notifications (in-app/mail; push abstraction), dashboard + EXPA Score, AI assistant (source-aware, emergency/no-source short-circuits, link/phone stripping, quotas), Italian learning, Patente (no bundled question bank), jobs pipeline + explainable matching, unified search (Arabic normalization), study finder, billing architecture (fake provider, signed idempotent webhooks), privacy-conscious analytics, web app (public + admin UI), Flutter app (core features), CI/Docker/docs.

## Blocked / remaining (see TASKS.md)
- External: T-019 live Anthropic key, T-016b FCM, T-038 payment provider + VAT, T-043 ClamAV.
- Human/content/legal: T-034 teacher review, T-035 Patente licensing + official rule check, T-036 legal job feeds, T-041 sourced study content, real government content with official sources, privacy policy/terms texts.
- Backlog: T-031 countries endpoint, T-032 dashboard flags, T-042 LLM intent classifier.
- Not built: housing rental checker, document explainer/OCR scanner, marketplace, community, travel, money/business calculators, mobile offline/scanner/Patente exams/study/housing/billing, web SEO audit with real data.

## Known issues / unverified
- Mobile: no device run; push stubbed; Android cleartext http needs config for dev; fonts not bundled; no deep links.
- Admin UI: keyboard/screen-reader and `/it` layouts not tested; several UI flows only exercised via API.
- Keyword intent detector is a known limit (T-042). Backend/web contract notes in web/BACKEND_REQUESTS.md (items 13–22 open).
- No load/performance testing, no staging deployment, no penetration test, no real-provider integration tests.

## Next steps
1. Supply credentials (Anthropic, FCM, payment provider) and infra (clamd, MySQL/Redis, hosting); deploy to staging per docs/DEPLOYMENT.md.
2. Human content pass: sourced guides/services in ar/en/it; legal texts; Patente and job-source licensing.
3. Run mobile on devices; accessibility pass (keyboard + screen reader); performance and load tests; external security test.
