# EXPA web (Nuxt 3)

Arabic-first (ar default, en, it) web app. Talks to the Laravel API only through a server-side BFF; the Sanctum token lives in an httpOnly cookie and never reaches browser JavaScript.

## Run
```bash
cp .env.example .env          # NUXT_API_BASE_URL defaults to http://127.0.0.1:8001/api/v1 (dev only)
npm install
npm run dev                   # http://localhost:3000  (redirects / -> /ar)
```
Backend: from `../backend`, `php artisan serve --port=8001` (set `APP_URL` to the API origin and `FRONTEND_URL` to this app so email links work).

## Scripts
`npm run test` (Vitest) · `npm run typecheck` · `npm run build` · `npm run lint` (style/contrast rule tests)

## Structure
- `assets/css/tokens.css`: the single file to re-skin (colors, radius, elevation, fonts, focus ring). `tailwind.config.ts` only maps names to variables.
- `components/ui`: UI kit (`<UiButton>`, `<UiFormField>`, ...). `components/layout`, `components/guide`, `components/profile`.
- `server/utils/bff.ts`: framework-free BFF core (tested with mocked fetch). `server/api/auth/*` set/clear the cookie; `server/api/proxy/[...path].ts` forwards with the bearer token.
- `i18n/locales/{ar,en,it}.json`: all UI text. Tests enforce identical keys and no empty values.
- `BACKEND_REQUESTS.md`: API gaps noticed.

## Rules enforced by tests
Logical CSS only (no `ml-/mr-/left-/text-left...`), no `v-html`, no web storage, AA contrast for token pairs.

## Modules (delivery 2)
Documents (`/documents`), notifications bell + `/notifications`, Ask EXPA (`/ask`), government + appointments, Learn Italian, Patente (mock exams), jobs, unified search, change password, Explore hub. All data goes through the BFF proxy; multipart upload (`my-documents/{id}/attachments`, <= 11 MB) and attachment download (streamed, API safety headers kept) are the only non-JSON routes it accepts. Runtime API origin: `NUXT_API_BASE_URL` (see Runtime configuration).
Tests: `tests/features.test.ts` (AI renderer, exam clock, match reasons, booking notice, route mapper, combobox, upload pre-check), `tests/bff.test.ts` (multipart/binary passthrough), `tests/i18n-usage.test.ts` (every literal key exists).

## Modules (delivery 4: T-060..T-074)
Public pages: `/housing`, `/articles[/slug]`, `/cities[/slug]` (city profiles; the older guide-by-city list is kept below them), `/services[/slug]` (third-party provider directory), `/learn-italian/practice|vocabulary`, `/patente/glossary`, guide pages get a "local information" block (`?city=`). Signed-in: `/housing/check` (consent `housing_analysis`, optional save), `/documents/explain` (consent `document_analysis`; paste or upload; nothing stored), `/my-requests`, `/provider/*` (apply, listing, verification documents, requests, reviews; role `provider`), `/learn-italian/practice/review` and `/learn-italian/exercises/[slug]`, `/patente/weak`. Community (`/community`, `/community/ask`, `/community/[id]`) exists only while `GET /community/meta` answers 200; otherwise nav entries are hidden and the pages 404.
- **BFF**: multipart is now accepted on `documents/explain` and `provider/verification/documents` (still no other path); the admin evidence download (`admin/marketplace/providers/{id}/evidence/{doc}`) is streamed like attachments. Every upstream call carries `X-Client: web`, and `X-Analytics-Consent: granted` when the visitor accepted the analytics banner (cookie `expa_analytics`).
- **Analytics**: `guide_view`/`job_view` are counted by the API (consent header or stored consent). The web only posts `appointment_clicked` on the official booking link (`composables/useAnalytics.ts`, de-duplicated for 3 s).
- **Admin**: new content modules (legal documents, articles, city profiles with a blocks editor, marketplace providers, housing rules, Italian vocabulary/exercises with the teacher-review action, patente licence fields) live in `utils/admin/modules.ts`; moderation pages `/admin/marketplace/{verification,reviews,reports}` and `/admin/community`.
- **Not rendered on purpose**: article cover images and exercise audio recordings (CSP `img-src`/`media-src` are `'self'`); see BACKEND_REQUESTS #29-30.
Tests: `tests/modules-extra.test.ts` (logic and components), `tests/admin-schema.test.ts` (new modules), e2e `e2e/features.spec.ts` (consent gates, explainer fallback, lead consent, analytics) and the extended smoke pages in `e2e/helpers.ts`.

## Admin panel (T-027)
`/{locale}/admin/**` (role-gated, see `docs/DESIGN_SYSTEM.md` > Admin panel). Schema-driven content workspace in `utils/admin/modules.ts`; `usePermissions()` reads `roles/is_super_admin/permissions` from `GET /auth/me`. Tests: `tests/admin-*.test.ts`.


## Runtime configuration (WEB-1)
Nothing environment-specific is baked into the build. Set these when the server starts (`node .output/server/index.mjs`):

| Variable | Meaning |
|---|---|
| `NUXT_API_BASE_URL` | Laravel API origin for the BFF. Required in production. |
| `NUXT_PUBLIC_SITE_URL` | Public origin (canonical, hreflang, og:url, sitemap, robots). Required in production. |
| `NUXT_TRUSTED_PROXY_HOPS` | Reverse proxies in front that append to `X-Forwarded-For` (default 0). |
| `NUXT_SECURITY_HSTS` | `true` adds `Strict-Transport-Security` (https-only deployments). |
| `NUXT_COOKIE_SECURE` | `auto` (default), `true`, `false`. |
| `EXPA_ALLOW_LOCAL=1` | Allows localhost origins in a production build (local compose, e2e). |

A production build **fails fast at boot** when either origin is empty or points at localhost (`server/plugins/runtime-check.ts`, unit-tested in `tests/production.test.ts`).

## Edge behaviour
- **Security headers** (`server/middleware/00.edge.ts`, `server/plugins/csp.ts`): CSP with hashes for Nuxt's inline bootstrap (no `unsafe-inline`/`unsafe-eval` for scripts), `frame-ancestors 'none'`, `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, HSTS by config. CSP is disabled in `nuxt dev`.
- **Client IP** (WEB-3): `X-Forwarded-For` is only trusted for `NUXT_TRUSTED_PROXY_HOPS` hops; the resolved IP is forwarded to the API as `X-Forwarded-For` so API rate limits are per client. Set the API's `TRUSTED_PROXIES` to the web host's address.
- **Caching**: responses to requests carrying the session cookie are `private, no-store` (`Vary: Cookie`). Static assets are pre-compressed (`compressPublicAssets`); compress HTML at the reverse proxy.
- **SEO**: `/sitemap.xml` (index) -> `/sitemap-{ar,en,it}.xml` generated from the public API (cached 1 h); `/robots.txt` is dynamic. Canonical/hreflang drop query strings except `page`. API outages return 503 + `noindex`.
- **Legal pages** `/privacy`, `/terms`, `/cookies` render `GET /api/v1/legal/{slug}`; unpublished documents show an honest state (no placeholder legal text).
- `scripts/generate-og.mjs` regenerates `public/og-image.png`.

## Re-audit additions (RA-3, RA-6, RA-12, RA-15)
- **Admin (RA-3)**: `/admin/ai/knowledge` (index status, rebuild with confirmation), `/admin/ai/conversations` (usage and metadata only, never message content), `/admin/settings` (read only), `/admin/notifications/broadcast` (Arabic required, confirmation, 5/hour limit shown), `/admin/geography` (cities CRUD + regions; "in use" refusal), and an "Erase account" action in the user drawer with typed-email confirmation (the API enforces self/staff protection). Nav entries are gated on the same permissions as the endpoints (`utils/admin/nav.ts`).
- **Life areas (RA-6)**: `/healthcare`, `/money`, `/business`, `/family`, `/travel` (guide-category landing only; no requirements tool), `/daily-life` use `components/guide/CategoryLanding.vue` (published guides + matching articles, empty states, general-guidance disclaimer, JSON-LD, breadcrumbs). `/about` states what EXPA is and is not. All are in the Explore hub, footer and sitemap.
- **Account (RA-12)**: `/settings/security` (devices from `auth/tokens`, revoke, sign out everywhere), `/settings/billing` (plan, cancel at period end, invoices; honest notice when `billing_available` is false), `/community/blocked` and a "Block this member" action on questions and answers. Linked from `/profile`.
- **CI (RA-15)**: see `docs/QA.md` > CI. The workflow has never run on GitHub.

## End-to-end tests
Signed-in journeys live in `e2e/journeys.spec.ts` against `e2e/stub/journey.mjs` (stateful stub user; login `journey@example.test`); admin pages in `e2e/admin-ra3.spec.ts`; life areas and /about in `e2e/areas.spec.ts`. To run next to a dev or preview server that owns `.nuxt`/`.output`, build elsewhere: `EXPA_BUILD_DIR=.nuxt-e2e EXPA_OUTPUT_DIR=.output-e2e npm run build && EXPA_OUTPUT_DIR=.output-e2e npm run test:e2e`.

`npm run build && npm run test:e2e` runs Playwright + axe against the built server with a stub API (`e2e/stub/server.mjs`, no backend needed; ports 3217/8791, override with `E2E_WEB_PORT`/`E2E_API_PORT`). Needs a Chromium: `npx playwright install chromium`, or point `E2E_CHROMIUM` at an existing `chrome-headless-shell`. Not part of `npm test`. Screenshots for visual review: `E2E_SHOTS=/some/dir` (outside the repo).

## RA pass: recommendations, money, travel, Patente Teacher, content pipeline
- **Recommendations**: `/recommendations` (signed in, noindex) and a section on `/dashboard` render `GET /recommendations` through `components/recs/List.vue`: guides, lessons, third-party services (always labelled "Third party" with the verification state) and reminders, each with the API's reason text. When `personalization.enabled=false` a notice links to `/privacy-settings`. A failing call never breaks the dashboard.
- **Net salary**: `/money/net-salary` (public, SEO) posts `money/net-salary`; shows the breakdown and bracket tables, `table.source`, freshness warning for `stale|outdated|unverified`, the API disclaimer, and an honest "tables not published yet" state for `available:false`. The web contains no tax numbers. Input rules: `utils/netSalary.ts`.
- **Travel requirements**: `/travel/requirements` (public, SEO) uses `GET /countries` (Intl fallback) and `GET travel/requirements`; empty answers say "No verified information" and explicitly "does not mean travel is allowed or not allowed". Linked from `/travel`.
- **Patente Teacher**: `components/patente/Explain.vue` ("Explain this") on `/patente/topics/[slug]` (and on exam questions when the API supplies `slug`, see BACKEND_REQUESTS #44) and a Patente Teacher panel on `/ask` (`?patente_topic=slug&title=`). Answers render through the normal assistant message (sources, glossary text from the API, canned no-content reply); quota errors use the existing limit messages. Nothing is sent automatically.
- **Admin**: new modules `tax-tables` (brackets editor, year, contribution fields, source, workflow) and `travel-requirements` in `utils/admin/modules.ts`; `/admin/readiness` shows total/published/draft/needs-verification per module from the existing list endpoints (`meta.total`, `per_page=1`) plus job source counts. `tests/admin-content-contract.test.ts` cross-checks every module against the backend model (`contentAttributes`, `$translatable`, `$requiresSource`, required translatable fields). It found and fixed: articles `body` and housing-rule `explanation` not flagged required-to-publish, exercises missing `italian_vocabulary_id`, providers missing region/city and showing a source card the API ignores.
- **Tests**: `tests/ra-pass.test.ts`, `tests/admin-content-contract.test.ts`; e2e `e2e/ra.spec.ts` with the stateless stub `e2e/stub/ra.mjs`; new pages are in the smoke `PAGES`.

## Staff two-factor authentication and accessibility pass
- **Login with 2FA**: `POST /api/auth/login` answers `{data:{two_factor_required:true, expires_in}}` and sets no session. The API's `challenge_token` never reaches the browser: the BFF parks it in the httpOnly cookie `expa_2fa` (path `/api/auth`, max-age = `expires_in`, clamped 30-900 s). `components/auth/TwoFactorStep.vue` then posts the code to `POST /api/auth/two-factor`, which reads the cookie, calls `POST /auth/2fa/challenge` and sets the normal `expa_token` cookie (like login). `invalid_challenge`/`account_suspended` drop the cookie and restart at the password step; 429 shows the `Retry-After` wait (carried in `ApiError.details.retry_after`); the step has a wall-clock expiry countdown. `auth/2fa/challenge` is blocked in the generic proxy (`BLOCKED_PREFIXES`) so the token can never be returned to client JS; all other `auth/2fa/*` calls use the proxy with the bearer.
- **Settings**: `/settings/two-factor` (linked from `/profile`): status, setup (QR drawn in the browser from `otpauth_uri` with the MIT `uqr` encoder, no network request; the secret and URI are also copyable), confirm, one-time recovery codes (copy, download, "I saved them" acknowledgement), regenerate and disable (password + code or recovery code, `components/auth/TwoFactorReauth.vue`). Secret and codes live in component memory only.
- **Admin gate**: a 403 `two_factor_setup_required` from any API call sets `useTwoFactorGate()`; `layouts/admin.vue` then renders `components/auth/TwoFactorGate.vue` (localized, links to the setup) instead of the page. `middleware/admin.ts` sets the gate from `user.two_factor_setup_required`; `auth.setTwoFactor()` lifts it after confirm.
- **Accessibility**: see `docs/ACCESSIBILITY.md`. New shared pieces: `utils/focus.ts` (focus trap used by `AdminDialog` and the admin drawer), `plugins/a11y-focus.client.ts` (focus moves to the first `aria-invalid` field after a submit), `<NuxtRouteAnnouncer />` in `app.vue`, `contentLang()` for fallback-language content.
- **Tests**: `tests/bff.test.ts` (2FA BFF), `tests/two-factor.test.ts`, `tests/a11y-static.test.ts`; e2e `e2e/two-factor.spec.ts` (stub `e2e/stub/twofactor.mjs`, account `tfa@example.test`), `e2e/a11y.spec.ts`, and the keyboard/axe additions at the end of `e2e/journeys.spec.ts`.
