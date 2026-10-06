# EXPA Web: Production Audit

Scope: `/web` (Nuxt 3.21, `@nuxtjs/i18n` 9, prefix strategy, `ar` default/RTL, `en`, `it`). Audit date 2026-10-05. Source was not modified; only this file was created.

## Method and evidence

| Check | Result |
|---|---|
| `npm run build` | Succeeds (client 5.4 s, server 6.4 s, 4.86 MB / 1.08 MB gz). Warnings: one 574 kB chunk, i18n `optimizeTranslationDirective` notice. |
| `npx vitest run` | 13 files, 281 tests pass (i18n parity, RTL logical-CSS lint, no `v-html`, contrast, BFF). |
| Production server (`node .output/server/index.mjs`) | Curled `/`, `/ar`, `/en`, `/it`, guides, login, 404, auth redirects, BFF routes. |
| Throwaway backend | `php artisan serve` on :8099, temp SQLite in the session scratchpad, env-var overrides only (real `.env` untouched), one super admin and one plain user. Killed afterwards. |
| Playwright (Chromium) + axe-core 4.10 | ar/en/it x 390 px and 1280 px (and 320 px): 12 public, 14 authenticated and 9 admin routes. Overflow, heading, landmark, target-size and axe (wcag2a/aa, 2.1, 2.2 aa, best-practice) checks. Keyboard tests (skip link, tab order, admin drawer, focus ring), 403/404 pages, cookie/token exposure, BFF probes. Screenshots reviewed for ar 390 (home, dashboard), it 390 (admin), en 1280 (ask). |
| Static review | All of `components/ui`, `layout`, `admin/Dialog|DataTable`, `search`, `ask`, `patente/Runner`, `server/`, `middleware/`, `composables/useSeo`, `nuxt.config.ts`, Docker files. |
| i18n | Script: 1211 keys in each of ar/en/it, 0 missing, 0 empty, 0 placeholder mismatches. 24 `it` values equal `en` (legitimate loanwords such as "Home", "Email", Italian office names). Template scan found no hard-coded user-visible strings. |

**Important caveat.** The throwaway DB had no content, so most data pages rendered their empty states only. Guide detail, job detail, office/lesson pages, populated tables, the exam runner and admin workflow dialogs were reviewed statically, not visually. See the manual-verification section.

**Verified as correct (no finding):** token never reaches client JS (cookie `expa_token` is `HttpOnly; Secure; SameSite=Lax; Path=/`, `document.cookie` is empty, no token in HTML/payload/storage); the BFF sends only `Accept`, `Accept-Language`, `Authorization`, `Content-Type` upstream and returns only `retry-after`; path traversal and encoded-slash probes return 404; the `auth/*` routes cannot be reached through the catch-all; evil `Origin` on login and proxy mutations returns 403; verify-email SSRF guard; `safeRedirect`; 401 clears cookie; `/en/admin` as a plain user renders the 403 page with HTTP 403; unknown routes return real 404; `<html lang dir>` is correct server-side in all three locales; hreflang set plus `x-default` present; JSON-LD escapes `<`; admin and account pages are `noindex`; no horizontal scroll at 320/390/1280 in any locale; axe reported zero violations on all scanned pages; all token pairs meet WCAG AA (computed: muted on canvas 6.07, info on info-soft 4.9, accent focus ring on canvas 3.37 for the 3:1 non-text rule); `prefers-reduced-motion` is handled globally; focus ring is visible (2 px accent); skip link works and moves focus to `#main`; physical Tailwind classes are absent (guarded by lint test) and icons mirror via `rtl:-scale-x-100`; tables use caption, `scope`, `aria-sort`, scroll regions with `tabindex=0`.

Severity: P0 launch blocker, P1 high, P2 medium, P3 low.

---

## P0

### WEB-1 (P0) API origin is baked in at build time; Docker/compose/.env.example config does nothing
- `web/nuxt.config.ts:41` `apiBaseUrl: process.env.API_BASE_URL || 'http://127.0.0.1:8001/api/v1'` is evaluated during `nuxt build`. Confirmed in `.output/server/chunks`: `"apiBaseUrl": "http://127.0.0.1:8001/api/v1"`. Nuxt only overrides runtime config from `NUXT_`-prefixed variables.
- `docker-compose.yml:77` sets `API_BASE_URL: http://nginx/api/v1` at runtime, `web/Dockerfile:15` comment says "reads API_BASE_URL at runtime", `web/.env.example:2` documents `API_BASE_URL`. All three are ineffective: in the container the BFF calls `127.0.0.1:8001`, so every login/API call returns 502 `upstream_unavailable`. Reproduced: with `API_BASE_URL` set at runtime, login returned 502; with `NUXT_API_BASE_URL` it worked. (`web/README.md` already documents `NUXT_API_BASE_URL`, so docs contradict each other.)
- Same class of problem: `nuxt.config.ts:35` (`i18n.baseUrl`) and `:44` default to `http://localhost:3000`, so a deployment that forgets `NUXT_PUBLIC_SITE_URL` emits canonical/hreflang/og URLs pointing at localhost (seen in the first curl run). `public.siteUrl` can be overridden at runtime, `i18n.baseUrl` cannot.
- Fix: use `NUXT_API_BASE_URL` / `NUXT_PUBLIC_SITE_URL` in compose, Dockerfile comment, `.env.example` and DEPLOYMENT.md; drop the `process.env` reads (use `apiBaseUrl: ''`, `public.siteUrl: ''`). Add a boot-time check that throws in production if either is empty or contains `localhost`/`127.0.0.1`.

---

## P1

### WEB-2 (P1) The web tier sets no security headers
- `curl -I /ar` returns only `content-type`, `x-powered-by: Nuxt`. No CSP, `X-Frame-Options`/`frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS. `nuxt.config.ts` has no `security` module and `routeRules` (`:58-74`) only sets `cache-control`. `docker/nginx.conf:9` fronts the API only; `docs/SECURITY.md` line 44 describes headers for the API, not the web app, which is the origin that holds the session cookie and renders all pages.
- Impact: clickjacking of authenticated pages, no CSP defence in depth for an app that renders API-provided text and third-party content links.
- Fix: add `nuxt-security` (or a Nitro middleware): CSP (`default-src 'self'`, `frame-ancestors 'none'`, nonce for the Nuxt payload and JSON-LD scripts, `font-src 'self'`, `img-src 'self' data:`), `nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, restrictive `Permissions-Policy` (camera is needed later for the scanner on mobile only), HSTS in production; remove `x-powered-by` (`nitro: { experimental... }` / `removeXPoweredBy`).

### WEB-3 (P1) The BFF hides the client IP, so all anonymous users share one rate-limit bucket
- `web/server/utils/bff.ts:103-105` builds upstream headers from an allow-list that excludes `X-Forwarded-For`/client IP. The API limiters key guests by IP: `backend/app/Providers/AppServiceProvider.php:193-213` (`login-ip` 30/min, `register` 10/min, `api` 180/min, `search` 60/min, `password-reset` 5/min, all `$r->ip()`). Behind the BFF every guest has the web server's IP.
- Impact: 30 failed logins/min from anyone locks out login for everybody; 180 API calls/min across all anonymous visitors (and each SSR page makes at least two: see WEB-18) exhausts the global bucket at roughly 60-90 page views per minute, after which public pages render error states (200, see WEB-7).
- Fix: forward the real client IP (`X-Forwarded-For` from the trusted edge, via `getRequestIP(event, { xForwardedFor: true })`) plus a shared-secret header, and configure backend `TrustProxies` (already env-driven at `AppServiceProvider.php:164`) to trust the web host only. Coordinate with backend; add a test with two client IPs.

### WEB-4 (P1) No sitemap; robots.txt has no Sitemap line
- `/sitemap.xml` returns 404. `web/public/robots.txt` is `User-agent: * / Allow: / / Disallow: /api/`. CLAUDE.md section 41 requires sitemap, hreflang and structured data; hreflang alternates exist only in page `<head>`.
- Fix: `@nuxtjs/sitemap` with i18n alternates (it picks up the three locales) and dynamic sources for `/guides/*`, `/government/*`, `/appointments/*`, `/learn-italian/lessons/*`, `/patente/topics/*`, `/jobs/*` (from public API lists). Add `Sitemap: https://<host>/sitemap.xml` and `Disallow: /*/admin`, `/*/login`, `/*/register`, `/*/dashboard`, `/*/search` (noindex is already set; Disallow saves crawl budget).

### WEB-5 (P1) No public privacy policy or terms; register has no link to either
- There are no `/privacy`, `/terms`, `/about` pages (`grep` for policy/terms routes: none). The only privacy surface is `/privacy-settings`, which requires login (`pages/privacy-settings.vue`, `middleware: 'auth'`). `components/layout/AppFooter.vue:10` links only to it, so guests cannot reach even that. `pages/register.vue` collects consents without a link to the policy text. CLAUDE.md section 37 requires a privacy policy; GDPR art. 13 notice must be available at collection.
- Fix: public localized `/privacy`, `/terms`, `/cookies` (content managed via CMS or static i18n), link them in the footer and next to the register consent checkboxes; show policy version already available from `GET /privacy/purposes`.

---

## P2

### WEB-6 (P2) Canonical, hreflang and `og:url` include arbitrary query strings
`web/composables/useSeo.ts:24,27,54` build URLs from `switchLocalePath()`, which keeps the query. Verified: `/ar/guides?q=abc&page=2` emits `canonical=/ar/guides?q=abc&page=2` and alternates with the same query; `/en/jobs?page=2&category=x` likewise. Any `?utm_x=` or filter creates a new self-canonical URL (duplicate content, split signals).
Fix: build the canonical from the path only (add an explicit allow-list such as `page`), and `noindex,follow` filtered/search variants.

### WEB-7 (P2) Upstream failure returns HTTP 200 with an indexable error state
Curl with the API down: `/ar/guides`, `/en/jobs`, `/it/patente`, `/ar/government` etc. return `200`, an error UI, no `noindex`, a canonical. A transient outage can get empty/error pages indexed. `/ar/guides/<slug>` in this state also has title "الأدلة" and no `<h1>` (see WEB-21).
Fix: when `error` is an upstream/network error on SSR, call `setResponseStatus(useRequestEvent(), 503)` and add `noindex`; keep 404 for unknown slugs (already correct at `pages/guides/[slug].vue:17-19`).

### WEB-8 (P2) Fallback-language guides are self-canonical and in hreflang
`pages/guides/[slug].vue:22-45` always emits the page as canonical/alternate for the current locale even when `guide.fallback` is true (content is served in another language, banner at `:82`). Result: `/ar/guides/x` is a duplicate of `/en/guides/x` in English while claiming to be the Arabic version.
Fix: when `guide.fallback`, set `noindex` (or canonical to the real-language URL) and drop the fake alternate. Same for any other fallback-capable page.

### WEB-9 (P2) Open Graph: SVG image, non-standard `og:locale`, no image metadata
`useSeo.ts:53,55`: `og:image` is `/og-image.svg` (Facebook, LinkedIn, WhatsApp, X do not render SVG; `twitter:card=summary_large_image` therefore shows nothing). `og:locale` is `ar`/`en`/`it`; the protocol expects `ar_AR`/`en_GB`/`it_IT` plus `og:locale:alternate`. No `og:image:width/height/alt`.
Fix: 1200x630 PNG/JPG per locale (or one neutral), proper locale codes and alternates, alt text.

### WEB-10 (P2) Landing page labels shipped features "Coming soon"
`pages/index.vue:12-16`: Ask EXPA, Government, Appointments, Italian and Jobs have `live: false` and render the "coming soon" badge, but all five exist as working pages (`pages/ask.vue`, `government/`, `appointments/`, `learn-italian/`, `jobs/`) and are in Explore. Misleading to first-time users and undersells the product.
Fix: set `live: true`, add the missing cards (Patente, documents), or drive from one module registry shared with `pages/explore.vue`.

### WEB-11 (P2) Backend/admin modules with no user-facing web pages
Backend routes exist and admin can author them, but the web has no pages: Study (`/study`, universities, programs, scholarships; admin modules `study-*` in `utils/admin/modules.ts:237-273`), billing/plans (`/pricing`, `billing/*`), cities/regions directory (`/cities`), `/about`, articles. `utils/routes.ts:35` even maps `study` API routes to `/guides` as a stopgap. Admins can publish content users can never see.
Fix: add routes or remove modules from admin nav until delivered; at minimum a `/pricing` page driven by `billing/plans` and a Study index. (Per CLAUDE.md section 67 Study/Pricing are post-MVP; confirm scope and record it in TASKS.md.)

### WEB-12 (P2) Attachment file input has no accessible name or error/hint association
`components/documents/Attachments.vue:116-119`: `UiFormField` renders `<label for="ff-...">` but the raw `<input type="file">` has no `id`, `aria-describedby` or `aria-invalid` (only `TextInput/Select/Textarea` inject the field context). The label points to nothing, so screen readers announce an unnamed file control, and the error/hint are not tied to it. WCAG 1.3.1/4.1.2 (Level A) in a core flow.
Fix: inject `FORM_FIELD_KEY` in a `UiFileInput` wrapper (or bind `:id`/`aria-describedby` from the context). Also note the browser-native "No file chosen" text follows the browser locale, not the app locale; consider a custom button plus `sr-only` input.

### WEB-13 (P2) Admin mobile drawer: no Escape, no focus movement, no containment
`web/layouts/admin.vue:34,46-47`. Verified in Chromium at 390 px: after opening the drawer focus stays on the toggle; `Escape` leaves `aria-expanded="true"`; Tab from the toggle goes to the logo, and further Tab presses cycle through header and page content behind the overlay (the sidebar sits after the header in DOM order). `Dialog.vue` implements all of this correctly; the drawer does not reuse it.
Fix: on open move focus to the first nav link, close on Escape and restore focus to the toggle, trap Tab (or reuse `AdminDialog variant="drawer"`), `inert` on `main` while open.

### WEB-14 (P2) Exam runner: radio roles with conflicting arrow-key behavior
`components/patente/Runner.vue:91-92,66-70,74`: `role="radiogroup"/"radio"` buttons both sit in the tab order (no roving tabindex) and `ArrowLeft/ArrowRight` on the wrapper (`@keydown="onKey"`) change the *question* instead of the selection. Screen-reader users in forms mode expect arrows to switch true/false; keyboard users can unintentionally leave an unanswered question.
Fix: either implement the radio pattern (arrows select, roving tabindex) and move question navigation to explicit shortcuts (Alt+arrows / PageUp/PageDown) with a visible hint, or use two toggle buttons with `aria-pressed`. Also move focus into the finish confirmation (`:109` `role="alertdialog"` with no focus handling).

### WEB-15 (P2) Entry bundle contains all three full locale files; no HTTP compression
Bundle search: the strings for ar, en and it all live in `_nuxt/B6E8xW6_.js` (574 kB, 168 kB gz; Vite warns). A visitor downloads the Italian and English texts and the whole admin namespace (about 1200 keys x 3). The Node server also sends JS/HTML uncompressed (no `content-encoding` with `Accept-Encoding: gzip`; home HTML is 94 kB raw; 54 JS requests, about 693 kB on `/ar`).
Fix: lazy-load per locale (verify `i18n.lazy`/dynamic messages in v9 with `langDir`), split `admin.*` into an admin-only locale chunk, enable `nitro.compressPublicAssets: true` or compress at the reverse proxy (document it in DEPLOYMENT.md).

### WEB-16 (P2) Authenticated SSR HTML has no cache-control
`GET /en/dashboard` (signed in) returns no `Cache-Control`/`Vary`. Only `/api/**` and admin/patente-run routes are `no-store` (`nuxt.config.ts:58-74`). A CDN or shared proxy in front could cache personalised HTML (the SSR payload contains the user object).
Fix: `private, no-store` for any response when the `expa_token` cookie is present (Nitro middleware), `Vary: Cookie, Accept-Language`; public pages `s-maxage` with `stale-while-revalidate`.

### WEB-17 (P2) CSRF Origin check depends on the `Host` header surviving the proxy
`server/utils/bff.ts` `originAllowed` compares `new URL(origin).host` with the `host` header (`server/api/auth/*.ts`, `server/api/proxy/[...path].ts:7`). Behind nginx/Traefik with the default `proxy_pass` Host rewrite, every mutating call (login included) would 403. Missing `Origin` is also accepted (acceptable with SameSite=Lax, but login CSRF remains possible from non-browser clients).
Fix: use `getRequestHost(event, { xForwardedHost: true })`, document `proxy_set_header Host $host` or `X-Forwarded-Host`, optionally also validate `Sec-Fetch-Site` when present and require `Origin` for `POST /api/auth/*`.

### WEB-18 (P2) Every guest page view blocks SSR on `GET /auth/me`
`middleware/00.session.global.ts:5` → `stores/auth.ts:21-31`: `ensureLoaded()` calls the API on every server render even when no `expa_token` cookie exists (a guaranteed 401). Cost: one extra upstream round trip (up to the 10 s `apiTimeoutMs`) per public page, counts against the shared rate bucket (WEB-3), and TTFB depends on API health. Other errors (403/429) are rethrown (`:29`), so `auth`/`admin`/`guest` middleware (which call `ensureLoaded` without try/catch) would return 500 on a throttled `/auth/me`.
Fix: on the server, skip the call when `useCookie('expa_token')` is empty (`auth.reset()`); treat 429 like 5xx.

### WEB-19 (P2) Mobile header has no "Sign in" for guests
`components/layout/AppHeader.vue:41-42`: Login/Register buttons are `hidden sm:inline-flex`. At less than 640 px a returning guest sees only the language switcher (screenshot ar 390). The only routes to login are the landing hero CTA (register) or tapping "Profile" in the bottom nav, which silently redirects to login.
Fix: show a compact "Sign in" link at all widths (or make the bottom-nav fifth item "Sign in" for guests).

### WEB-20 (P2) Hydration mismatch on `/profile` in production (reproduced)
Console on the production build: "Hydration completed but contains mismatches." on `/en|ar|it/profile` only (also logged as BACKEND_REQUESTS #12). Likely cause: `watch(data, ..., { immediate: true })` (`pages/profile.vue:28-32`) mutating `form` while SSR state is serialised, or locale-dependent option lists. Mismatches can drop server markup and break focus/screen-reader state.
Fix: bisect in dev (Nuxt reports the node), initialise `form`/`name` synchronously from `data` before render.

---

## P3

### WEB-21 (P3) Error page and error/loading states have no `<h1>`
`web/error.vue:23-24`: the status code is a `<p>`, `UiErrorState` renders `<h2>` (`components/ui/ErrorState.vue`). Confirmed on `/en/nope` and the 403 page (0 `h1`). Same for data pages in their error/skeleton branches (e.g. `pages/dashboard.vue:50-52`, guide detail). Screen-reader users get no page title heading. Fix: `UiErrorState` takes a `heading-level` prop; error.vue renders `<h1>`, pages keep their `<h1>` outside the conditional.

### WEB-22 (P3) Inconsistent `<title>` pattern
Home "EXPA: …", guide detail `"{title} | EXPA"`, list pages with no brand ("أدلة للعيش في إيطاليا", "Jobs"), search `"{q} | Search"`. Use one template (`%s | EXPA`) via `useHead({ titleTemplate })`. Also `useSeoMeta(computed(...).value)` at `useSeo.ts:46` is a one-time snapshot, so OG/Twitter tags do not update on client-side title changes; pass the computed/getter itself.

### WEB-23 (P3) Structured data gaps
Only `WebSite` (home) and `Article` (guide). Missing: `BreadcrumbList` (breadcrumbs are visible but not in JSON-LD, `components/ui/Breadcrumbs.vue`), `Organization` + logo, `WebSite.potentialAction/SearchAction` and `inLanguage`, `Article.author`/`image`, `GovernmentService`/`GovernmentOffice` for gov pages, `Course`/`LearningResource` for lessons. Job posts are third-party, so `JobPosting` is intentionally omitted (confirm policy).

### WEB-24 (P3) URL hygiene and Arabic SEO
Slugs come from the API and are shared across locales, so there are no Arabic/localised slugs (CLAUDE.md section 41 asks for Arabic SEO). `/en/guides/` (trailing slash) and `/AR` return 200 duplicates; `/` is a 302 to `/ar` (use 301/308 or content-negotiated redirect decision); unprefixed unknown paths (`/xyz`) render the Arabic 404 instead of redirecting to `/ar/xyz`. Add `trailingSlash` redirect and lower-case normalisation in a Nitro middleware; decide on a localized-slug strategy.

### WEB-25 (P3) Error toasts auto-dismiss and cannot be paused
`composables/useToast.ts:13,20`: errors vanish after 9 s, no pause on hover/focus (WCAG 2.2.1/2.2.2 intent; messages such as failed saves are important). Pause timers on hover/focus-within and keep danger toasts until dismissed.

### WEB-26 (P3) Loading buttons are `disabled`, which drops keyboard focus
`components/ui/Button.vue:25` sets `disabled` while `loading`; the focused submit button loses focus and screen readers lose context. Use `aria-disabled` + ignore clicks while loading. `aria-busy` alone is not announced.

### WEB-27 (P3) Salary text: raw currency/period and awkward alignment in RTL
`components/jobs/JobCard.vue:8-13,25` and `pages/jobs/[id].vue:54-59,80` duplicate the formatter, print `s.currency` and `s.period` raw (e.g. `year`, not localised) and wrap the value in `dir="ltr"` with `text-align:start`, so in Arabic the amount sits on the left of an otherwise right-aligned card. Use `Intl.NumberFormat(..., { style:'currency' })`, translate the period, and isolate with `<bdi>`/`unicode-bidi:isolate` instead of a LTR block; extract one `formatSalary()` util.

### WEB-28 (P3) Small localisation and a11y inconsistencies
- `utils/documents.ts:18-22` `formatBytes` hard-codes `B/KB/MB` and uses `.toFixed()` (Italian expects `1,5 MB`, Arabic units); use `Intl.NumberFormat` with `style:'unit'`.
- `components/admin/JobSourceForm.vue:146` prints the raw API `status` enum in a badge.
- `pages/admin/users/roles.vue:32` puts `aria-label` on bare `<span>`s ("✓"/"–"), which is not reliably announced; use `sr-only` text.
- Western digits are used for Arabic by design (documented in `utils/locale.ts`, DESIGN_SYSTEM.md); confirm with Arabic users since many expect Eastern Arabic digits for dates.
- `components/admin/ScheduleDialog.vue:17` interprets `datetime-local` in the browser time zone; editors outside Europe/Rome schedule at the wrong hour. Show the zone or convert from `Europe/Rome`.

### WEB-29 (P3) `UiAutoItalian` marks any Latin parenthetical as Italian
`components/ui/AutoItalian.vue:10`: `"(PDF)"`, `"(IBAN)"`, `"(ISEE)"` in Arabic text get `lang="it"` and the Italian-term chip; screen readers switch voice to Italian for non-Italian tokens. Only wrap when the API says it is an Italian term (`italian_term` field), or restrict to a known list.

### WEB-30 (P3) BFF hardening nits
`server/api/auth/login.post.ts:7`, `register.post.ts:7` call `readRawBody(event)` without a size cap (the cap in `forwardRequest` applies after the whole body is buffered); cap at 16 kB at the handler. `x-powered-by: Nuxt` disclosed. Cookie could use the `__Host-` prefix (it already satisfies the requirements: Secure, Path=/, no Domain). `secure` depends on `NODE_ENV === 'production'` (`server/utils/handle.ts`): a staging deployment with `NODE_ENV=staging` would issue non-Secure cookies; use an explicit flag or `X-Forwarded-Proto`.

### WEB-31 (P3) Navigation inconsistencies
- `components/layout/BrandLogo.vue:8` always links to `/` (marketing page) even for signed-in users, while the "Home" nav item goes to `/dashboard` (`composables/useNav.ts`). Signed-in users land on the landing page with a redundant "Go to dashboard" CTA.
- Admin link is `hidden md:inline-flex` (`AppHeader.vue:37`): on phones an admin has no way to reach `/admin` from the public layout.
- Authenticated users on phones lose the language switcher in the header (`hidden sm:flex`); it exists in Profile, but this is not discoverable.
- Footer (`AppFooter.vue`) has no sitemap-style links (guides, government, jobs, contact), which hurts internal linking and orientation.
- Notifications are reachable only through the bell; no inbox link in Profile.
- Two `role="search"` landmarks with the same label appear on `/search` at lg+ (header SearchBox plus page form); give them distinct labels or hide the header one on that page.

### WEB-32 (P3) Cached `useAsyncData` state is not cleared on logout
No `clearNuxtData`/`clearNuxtState` anywhere (grep). `auth.logout()` (`stores/auth.ts:32-39`) only resets the user. On a shared device, the next user's pages briefly receive the previous user's keyed data (`dashboard`, `profile-page`, `documents`, …) as initial `data` before the refetch completes (visible if the refetch fails or for `watch(..., { immediate: true })` consumers such as `pages/profile.vue:28`). Call `clearNuxtData()` and reset Pinia stores on logout/401.

### WEB-33 (P3) Focus management gaps in small flows
`Dialog.vue` restores focus to the opener, but not if the opener was removed meanwhile (falls to `body`); onboarding step changes (`pages/onboarding.vue:96,143`) announce only via `aria-live` and keep focus on the old "Continue" button; search/guide pagination does not move focus or scroll to the list start (`components/ui/Pagination.vue`), and relies on the `aria-live` page counter only. Move focus to the step heading or results heading after the update.

### WEB-34 (P3) Fonts and tooling
8 font files (5 Inter, 3 IBM Plex Arabic, about 270 kB) load on `/ar` with no `<link rel="preload">` for the primary face and with Latin fonts for Arabic pages (only the "EXPA" wordmark and Italian terms need Inter). Preload the active-locale regular weight; subset Inter to what Arabic pages need. The i18n build warning (`bundle.optimizeTranslationDirective`) should be set explicitly. Header search shows a truncated placeholder at 1280 px ("Search EXP…", screenshot en 1280).

---

## Cross-check table (requested areas)

| Area | Status |
|---|---|
| Pages / redirects | 48 page files; `/` → `/ar` (302); protected routes 302 to `/{locale}/login?redirect=…`; guest pages redirect signed-in users to dashboard; 404/403 pages good (WEB-21 for h1); 500 handled by `error.vue` (not simulated). |
| Auth middleware | `auth`, `admin` (permission-aware), `guest`, global session; API remains the authority. WEB-18 for error handling. |
| BFF | Cookie flags, allow-lists, origin check, traversal, size/multipart limits OK; WEB-1, 3, 17, 30. |
| SEO | Title/description/OG/hreflang/canonical/lang/dir/JSON-LD present and correct per locale; gaps WEB-4, 6-9, 22-24. |
| a11y | axe clean; real defects WEB-12, 13, 14, 21, 25, 26, 33 (see manual list). |
| RTL / logical CSS | No physical classes (lint-enforced); icons mirror; ScoreRing flips; no overflow at 320 px in any locale. Minor: WEB-27. |
| i18n | Full key parity, no hard-coded strings; formatting gaps WEB-27/28. |
| States | Every data page has skeleton, error (with retry) and empty branches; `exam`, `explore`, `index`, auth form pages need none. Gaps: error-state headings (WEB-21), status codes (WEB-7). |
| UX reachability | All implemented backend modules reachable except Study, billing/plans, cities (WEB-11); landing stale (WEB-10); mobile sign-in (WEB-19). |

---

## Requires manual browser / assistive-tech verification

The sandbox had no screen reader, no real devices and no seeded content, so the following were **not** verified:

1. **Screen readers** (VoiceOver macOS/iOS, NVDA+Firefox, TalkBack): combobox search announcements, `role="log"` and live regions in Ask EXPA, toast live regions (polite/assertive regions are persistent), `aria-current` on language links, the unnamed file input (WEB-12), radio semantics in the exam runner (WEB-14), the drawer (WEB-13), Arabic reading order of mixed Arabic/Italian text (`UiItalianTerm`, `dir="ltr"` blocks).
2. **Populated data pages** (needs seeded content or the real staging API): guide detail with long steps/sources, government office/service pages, appointment guides, lesson pages, patente topic/run/results, jobs list/detail (long titles, long company names, salary), tasks with many items, documents list with attachments and expiry states, notifications with many rows, admin lists with rows, the admin workflow bar and Schedule dialog, the translation editor with long Arabic/Italian strings.
3. **Real devices**: iOS Safari (safe-area bottom nav, `min-h-screen`/100vh behaviour, sticky exam header with the dynamic toolbar, `datetime-local`, file picker and camera), Android Chrome, text-size 200 %, browser zoom 400 % (WCAG 1.4.10 reflow), landscape phone.
4. **Arabic visual QA by a native reader**: typographic quality (IBM Plex Sans Arabic at 17 px), numerals preference (Western vs Eastern digits), mixed-direction punctuation in breadcrumbs, dates (`ar-u-nu-latn`), chevron/arrow direction in every control, card/table alignment in admin.
5. **Italian length**: strings up to 47 characters against 29 in English (`verify.neededTitle`, `ask.errorTitle`, `auth.sendResetLink`) rendered without overflow at 320 px in the pages scanned; confirm in context for long real content and admin form labels.
6. **Windows High Contrast / forced-colors**, dark-mode extensions, `prefers-contrast`; checkbox `accent-color` and the focus ring on tinted backgrounds.
7. **Keyboard on Safari** (Tab behaviour requires Option+Tab by default), focus order after route changes (Nuxt does not move focus to `#main` on client-side navigation; verify with a screen reader whether the new page is announced), and Escape/focus return in every `Dialog` usage (ScheduleDialog and others need rows in `approved` state).
8. **Hydration mismatch** on `/profile` (WEB-20): reproduce in `nuxt dev` to see which node differs.
9. **Social previews**: share links through Facebook Debugger, LinkedIn Post Inspector, WhatsApp (WEB-9); Google Rich Results test for the Article JSON-LD; Search Console hreflang report once a sitemap exists.
10. **Reverse-proxy deployment**: Host/Origin handling (WEB-17), compression, cache headers, client-IP forwarding and rate limits (WEB-3, 15, 16) can only be validated on staging with the real edge.
11. **Performance** under realistic conditions: Lighthouse mobile (LCP/INP/CLS) on staging, font loading flash (WEB-34), 3G throttling of the 693 kB JS (WEB-15).
12. **Reduced motion**: the global override is correct in CSS; verify the OS setting visually (skeleton pulse, spinner, ring transition).

---

## Summary counts

| Severity | Count | IDs |
|---|---|---|
| P0 | 1 | WEB-1 |
| P1 | 4 | WEB-2, 3, 4, 5 |
| P2 | 15 | WEB-6 to WEB-20 |
| P3 | 14 | WEB-21 to WEB-34 |
| **Total** | **34** | |

Recommended order: WEB-1 (deploy blocker) → WEB-3 (needs backend coordination) → WEB-2 → WEB-5 → WEB-4 → WEB-6/7/8 together (SEO pass) → WEB-12/13/14 (a11y pass) → WEB-10/11/19 (UX pass) → performance (WEB-15/16/18) → P3 backlog.

Build artifacts `web/.nuxt` and `web/.output` were regenerated by `npm run build` (standard build output); no source file was changed.


---

## Resolution (web fix wave)

Evidence key: UT = unit test in `web/tests/production.test.ts`; E2E = Playwright + axe suite in `web/e2e` (stub API, built server); BUILD = inspected build output; CODE = code change reviewed, needs manual confirmation.

| ID | Status | Resolution / evidence |
|---|---|---|
| WEB-1 | FIXED | `runtimeConfig` no longer reads `process.env`; production defaults are empty, `NUXT_API_BASE_URL` / `NUXT_PUBLIC_SITE_URL` set at start; `i18n.baseUrl` removed. Boot check `server/plugins/runtime-check.ts` throws on empty/localhost (UT). Dockerfile, docker-compose, `.env.example`, README, DEPLOYMENT.md updated. E2E boots the production build with only runtime env. |
| WEB-2 | FIXED | CSP (script hashes, no unsafe-inline/eval, `frame-ancestors 'none'`), nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP, HSTS via `NUXT_SECURITY_HSTS`, no `x-powered-by` (UT + E2E headers test + CSP does-not-block-app test). Needs a real-browser check of every page under CSP in staging. |
| WEB-3 | FIXED (web) / BLOCKED (backend config) | BFF forwards the resolved client IP as `X-Forwarded-For` using `NUXT_TRUSTED_PROXY_HOPS` (UT two clients, E2E spoof test). Rate limits become per-client only after the API's `TRUSTED_PROXIES` includes the web host (BACKEND_REQUESTS #24). |
| WEB-4 | FIXED | `/sitemap.xml` index + `sitemap-{ar,en,it}.xml` with hreflang alternates, static routes and dynamic slugs (guides, government, appointments, lessons, patente topics, study); dynamic `/robots.txt` with Sitemap and admin/account Disallow (UT + E2E). Jobs intentionally omitted (third party, expiring). |
| WEB-5 | FIXED (web) / BLOCKED (backend endpoint) | `/privacy`, `/terms`, `/cookies` from provisional `GET /legal/{slug}`; honest "not published yet" + noindex on 404; no legal text written (E2E). Linked from footer, register (with policy version), privacy settings, consent gate. Real content needs the backend endpoint (#23). |
| WEB-6 | FIXED | Canonical/hreflang/og:url from path only (`page` kept); filtered variants `noindex, follow` (UT + E2E). |
| WEB-7 | FIXED | SSR GET failures set 503 and `noindex` (`useApi` + `app.vue`). Only code-reviewed: needs a run with the API down. |
| WEB-8 | FIXED | `fallback` option: noindex, no alternates; used on guide, study pages. |
| WEB-9 | FIXED | Generated 1200x630 PNG (`scripts/generate-og.mjs`), `og:locale` ar_AR/en_GB/it_IT + alternates, width/height/alt (E2E). |
| WEB-10 | FIXED | Landing cards all link to live pages, "coming soon" removed; Patente and Study cards added. |
| WEB-11 | FIXED | Added `/study`, `/study/finder`, programmes, universities, scholarships (list + detail), `/pricing`, `/cities`; explore hub and routes mapper updated. Not built (no endpoint use): `/about`, articles. |
| WEB-12 | FIXED | `UiFileInput` wired to `UiFormField`. Native "No file chosen" text still follows the browser locale. |
| WEB-13 | FIXED | Admin drawer: focus in, Tab contained, Escape closes, focus restored, `main` inert (E2E keyboard test at 390). |
| WEB-14 | FIXED | Radio pattern with roving tabindex; Alt+Arrow/PageUp/PageDown for questions; focus moves into finish confirmation. Screen-reader behaviour unverified. |
| WEB-15 | FIXED | `lazy: true` locale loading (entry chunk 574 kB -> 326 kB, locale files are separate 87-105 kB chunks, BUILD); `compressPublicAssets`; proxy compression documented. Admin namespace is not split from the locale file. |
| WEB-16 | FIXED | Requests with the session cookie get `private, no-store` + `Vary: Cookie, Accept-Language` (E2E). Guest HTML left uncached on purpose. |
| WEB-17 | FIXED | `Origin` accepted against `Host` or `X-Forwarded-Host`; `Sec-Fetch-Site: cross-site` refused (UT). Missing Origin still allowed. |
| WEB-18 | FIXED | SSR skips `/auth/me` without a cookie; 429 treated like 5xx. |
| WEB-19 | FIXED | "Sign in" visible at all widths; Register from `lg`. |
| WEB-20 | FIXED (unverified) | `/profile` form initialised synchronously instead of `watch(immediate)`. The mismatch could not be reproduced in the stub e2e (no profile stub): confirm in a browser. |
| WEB-21 | FIXED | `UiErrorState heading-level`, h1 on error.vue and detail pages' error branches (E2E 404 h1). |
| WEB-22 | FIXED | One `%s | EXPA` title template; OG/Twitter tags are reactive getters. |
| WEB-23 | FIXED (partly) | Organization, WebSite (SearchAction, inLanguage), BreadcrumbList on all breadcrumb pages, Article author/publisher/image. GovernmentService/Course schemas and JobPosting not added (policy decision). |
| WEB-24 | FIXED (partly) | Trailing slash 308 redirect. Not done: `/AR` lowercase normalisation, 301 for `/`, localized slugs (needs backend slugs per locale). |
| WEB-25 | FIXED | Error toasts persist until dismissed. |
| WEB-26 | FIXED | Loading buttons use `aria-disabled` and ignore activation. |
| WEB-27 | FIXED | `formatSalary`/`formatMoney` (Intl, translated period, `<bdi>`) (UT). |
| WEB-28 | FIXED (partly) | `formatBytes` via Intl, roles table sr-only text (UT). Not done: raw job-source status badge, ScheduleDialog time zone, digit preference. |
| WEB-29 | FIXED | Short all-caps parentheticals are not marked Italian. |
| WEB-30 | FIXED (partly) | 16 kB auth body cap, explicit cookie secure mode (`NUXT_COOKIE_SECURE`/X-Forwarded-Proto), `x-powered-by` removed. `__Host-` prefix not adopted. |
| WEB-31 | FIXED (partly) | Footer has section and legal links; logo goes to dashboard when signed in. Not done: admin link on phones, language switcher for signed-in phones, notifications link in profile, duplicate search landmark labels. |
| WEB-32 | FIXED | `clearNuxtData()` when a signed-in session is reset. |
| WEB-33 | WONTFIX (this wave) | Pagination/onboarding focus management not changed; needs a design decision on focus targets. |
| WEB-34 | PARTLY | i18n `optimizeTranslationDirective` set explicitly. Font preload/subsetting and header search placeholder truncation not done. |

New automated checks: `npm run test:e2e` (ar/en/it x 390/1280 on home, login, register, guides, ask, privacy, pricing with axe zero violations, no overflow, one h1, no hydration warnings; header keyboard test; admin drawer test; layout sweep at 320/390/768/1280 including admin users with long Italian strings).
