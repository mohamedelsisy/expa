# EXPA Backend - Production Audit

Scope: `/backend` (Laravel 13, PHP 8.3). Audit date: 2026-10-05. Method: full read of routes, controllers, policies, services, requests, resources, models, all 22 migrations, config, console/scheduler, Dockerfile/nginx/compose/CI; `git log -S` secret scan of history (35 commits); `composer audit`; `php artisan test`; `config:cache` + `route:cache` + `event:cache` followed by `optimize:clear`; throwaway PHPUnit probes (kept in the scratchpad dir only, never in the repo) to confirm the findings marked "verified".

Source was not modified. The only file written to the repo is this document.

Baseline: `php artisan test` = 663 tests / 4955 assertions, all passing. `composer audit` = no advisories. No secrets found in the working tree or in git history (patterns: `sk-ant`, `AKIA`, private keys, `APP_KEY=base64`, Slack/GitHub tokens). `backend/.env` is untracked and git-ignored.

Severity: P0 = exploitable now / launch blocker with data or money loss; P1 = must fix before production; P2 = should fix before launch or have a documented mitigation; P3 = hardening / debt.

## Summary

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 1 |
| P2 | 11 |
| P3 | 27 |
| Total | 39 |

No IDOR, privilege escalation, SQL injection, SSRF bypass, path traversal, mass-assignment or secret-leak vulnerability was found. The security design is unusually strong; the findings are mostly operational (proxy/log/queue/cache), financial edge cases, and external prerequisites.

Top findings:
1. BE-1 (P1) `TRUSTED_PROXIES` is read with `env()` in `bootstrap/app.php`, so it is silently ignored after `config:cache` when the value lives in `.env`. `expa:preflight` still passes (it reads the cached config copy). Behind a load balancer every client then shares one IP, so IP-based rate limits (login, register, API) collapse into one bucket.
2. BE-2 (P2, verified) Third parties can lock a victim out of login: 21 failed attempts from different IPs make the real owner's correct login return 429 for up to an hour.
3. BE-3 (P2, verified in the 48 MB `laravel.log`) Every expected business `ApiException` (4xx) is reported as an ERROR with a stack trace, so users can flood logs and hide real errors.
4. BE-4 (P2, verified) The built-in PDF scanner is bypassed by PDF name hex escapes (`/Java#53cript`). A real antivirus is required.
5. BE-5 / BE-6 (P2) Billing: admin cancel never cancels at the provider; a webhook with a null `payment_ref` can overwrite another user's payment row.
6. BE-7 (P2) A document-expiry reminder is marked `dispatched` before the queued listener runs; if the listener fails 3 times the reminder is silently lost.

---

## Part 1 - Security findings

### BE-1 - P1 - CODE FIX - Trusted proxies ignored under config cache (and preflight misreports)
- File: `backend/bootstrap/app.php:36` (`$proxies = env('TRUSTED_PROXIES');`), `backend/config/expa.php:12`, `backend/app/Console/Commands/Preflight.php` (check `trusted_proxies`).
- Scenario: Laravel's `LoadEnvironmentVariables` skips loading `.env` when the config is cached (verified in `vendor/.../LoadEnvironmentVariables.php:22`). With the standard deploy (`.env` file + `php artisan config:cache`), `env('TRUSTED_PROXIES')` in `bootstrap/app.php` returns `null`, so `trustProxies(at: null)` trusts nobody. `config('expa.trusted_proxies')` is baked into the cached config from `.env`, so `expa:preflight` reports it as set. Result: behind a TLS-terminating balancer, `$request->ip()` is the balancer address for all users: `login-ip` (30/min), `register` (10/min per IP), `password-reset` (5/min per IP), `api` for anonymous users (180/min) and `search` all become one global bucket (self-inflicted denial of service, and an attacker can exhaust it for everyone). Consent and audit IP hashes are also wrong, and `isSecure()`/signed URLs depend on the forwarded scheme. It works only when the variable is a real process environment variable (Docker `environment:`), which hides the bug in the compose stack.
- Fix: do not use `env()` in `bootstrap/app.php`. Either set trusted proxies from config in `AppServiceProvider::boot()` (`Illuminate\Http\Request::setTrustedProxies(config('expa.trusted_proxies') ...)` with the proper header flags) or use `TrustProxies::at()` with a closure resolved lazily. Make preflight read the value the middleware really uses. Add a test that boots with a cached config.

### BE-2 - P2 - CODE FIX - Account-level login throttle enables targeted lockout (verified)
- File: `backend/app/Providers/AppServiceProvider.php:184-194`, `backend/routes/api.php:52`.
- Scenario: the limiter `login-account:<sha1(email)>` allows 20 requests/hour per email regardless of IP and counts every request, including the owner's correct one. Probe: 21 wrong passwords for `victim@example.com` from 21 different IPs, then the victim's correct login from a new IP returned HTTP 429. An attacker can keep any known email (including admins) locked out of login indefinitely at about 20 requests/hour.
- Fix: count only failed attempts toward the per-account bucket (`RateLimiter::hit` in the controller on failure, `clear` on success), or make the per-account bucket a soft delay/CAPTCHA step instead of a hard 429. Keep the per-(email, IP) and per-IP buckets.

### BE-3 - P2 - CODE FIX - Business exceptions are logged as ERROR with stack traces (verified)
- File: `backend/bootstrap/app.php` (no `dontReport`), `backend/app/Exceptions/ApiException.php:7`.
- Scenario: `ApiException` extends `RuntimeException` and is not excluded from reporting, so every consent-required, limit-reached, invalid-transition, upload-rejected, etc. response writes an ERROR entry with a stack trace and `userId` context. The dev `storage/logs/laravel.log` is 47,964,710 bytes, dominated by such lines ("We need your consent..." x435, "The file was rejected..." x216). In production any authenticated user can generate unbounded ~3 KB log entries at 180 requests/minute (disk exhaustion, alert fatigue, real errors hidden). Combined with `LOG_STACK=single` (BE-8) there is no rotation.
- Fix: `$exceptions->dontReport(ApiException::class);` (optionally log at `info` for audit-relevant codes).

### BE-4 - P2 - CODE FIX + EXTERNAL INFRASTRUCTURE - Upload scanner bypass (verified)
- File: `backend/app/Domains/Documents/Services/BasicContentScanner.php:15,27`; `backend/config/documents.php:21`.
- Scenario: the scanner rejects PDFs only if the raw bytes contain literal tokens such as `/JavaScript`. PDF names allow hex escapes: `/Java#53cript` and `/Open#41ction` are accepted (probe returned `NULL` = accepted), and tokens inside compressed object streams are invisible to a raw regex. The scanner is documented as "not an antivirus", and mitigations exist (MIME sniffing by finfo, attachment-only download, `Content-Security-Policy: sandbox`, `nosniff`, encrypted at rest, never rendered server-side). Residual risk is another user or staff opening the file in a desktop viewer, and any future OCR/"AI Document Explainer" pipeline that parses PDFs.
- Fix: bind a real scanner (ClamAV via `clamd` socket or a managed scan API) behind `ContentScanner`; treat the basic scanner as a pre-filter only; normalise `#xx` escapes before matching. `expa:preflight` already warns (`scanner_basic`) - make it a blocking error in production once the real scanner exists.

### BE-5 - P2 - CODE FIX - Admin cancel does not cancel at the payment provider
- File: `backend/app/Domains/Billing/Services/SubscriptionService.php:84-88`, `backend/app/Http/Controllers/Api/V1/Admin/SubscriptionAdminController.php:49-55`.
- Scenario: `adminCancel()` only sets `status=canceled` locally. For a provider-backed subscription (not `manual`) the provider keeps billing the customer; the user pays for a plan EXPA no longer grants, and the next `payment.succeeded` webhook does not reactivate it (by design) but money is taken. User-initiated cancel does call `provider()->cancelSubscription()`.
- Fix: for `provider !== 'manual'` call `provider()->cancelSubscription($sub)` first (and handle failure), or refuse with a clear error.

### BE-6 - P2 - CODE FIX - Webhook payment with null `payment_ref` can overwrite another user's payment
- File: `backend/app/Domains/Billing/Services/WebhookHandler.php:88,113` (`Payment::firstOrNew(['provider'=>..., 'provider_ref'=>$e->paymentRef])`), `backend/database/migrations/2026_10_04_175416_create_billing_tables.php` (`payments.provider_ref` nullable, `unique(provider, provider_ref)`).
- Scenario: if an adapter ever emits `payment.succeeded`/`payment.failed` without a `paymentRef` (the Fake provider allows it), `firstOrNew` with `provider_ref = NULL` matches the first null-ref payment of ANY user and the handler then reassigns `user_id`/`subscription_id` and flips its status. MySQL `UNIQUE` allows multiple NULLs, so the DB does not stop it. Requires a signed webhook, so impact is limited to provider/adapter bugs, but the consequence is cross-user financial data corruption.
- Fix: reject events lacking `paymentRef` in `parseWebhook`/handler (`return 'ignored'`), make `provider_ref` NOT NULL for payments, add `unique(provider, provider_ref)` on subscriptions too (see BE-27).

### BE-7 - P2 - CODE FIX - Expiry reminders can be lost silently
- File: `backend/app/Domains/Reminders/Services/ReminderDispatcher.php:37-39`, `backend/app/Listeners/NotifyUserOfReminder.php:13-14`.
- Scenario: the dispatcher flips the reminder to `dispatched` and fires `ReminderDue`; the queued listener (3 tries, no backoff, no `failed()` handler) does the real work. If the queue/mail/DB is down for the three immediate retries, the reminder is never re-sent (status is already `dispatched`), and for the core "residence permit expires in 30 days" promise nobody is told. Only `failed_jobs` records it.
- Fix: add a `backoff()` (e.g. 60/300/900 s), a `failed()` that resets the reminder to `pending` (or records `failed`), and include failed reminders in a retry pass of `expa:send-reminders`.

### BE-8 - P2 - CONFIGURATION - Logging defaults are not production-safe
- File: `backend/.env.example` (`LOG_STACK=single`, `LOG_LEVEL=debug`), `backend/config/logging.php:21`; production checklist in `.env.example` does not mention logging.
- Scenario: the `single` channel never rotates (the local log already reached 48 MB), and `debug` level writes every query-level/framework message; with BE-3 this fills disks. No central shipping/alerting is configured; `expa:preflight` does not check log settings.
- Fix: production `LOG_CHANNEL=stderr` (or `daily` with `LOG_DAILY_DAYS`) and `LOG_LEVEL=warning`/`error`; ship to a log service; add `log_level_debug` and `log_single` checks to preflight.

### BE-9 - P2 - CONFIGURATION / EXTERNAL INFRASTRUCTURE - Cache, queue and scheduler defaults depend on the database
- File: `backend/.env.example` (`CACHE_STORE=database`, `QUEUE_CONNECTION=database`), `backend/app/Console/Commands/Preflight.php` (only rejects `array`/`null` cache and `sync` queue), `backend/routes/console.php`, `docker-compose.yml:68`.
- Scenario: rate limiters, `withoutOverlapping` scheduler locks and `ShouldBeUnique` imports all use the cache store; with the database store every request does DB writes (throttle `get` + `put`), and lock/limit correctness depends on that table. The scheduler tasks have no `onOneServer()`, so two app servers would double-run `expa:send-reminders` (the atomic claim prevents duplicate reminders, but not duplicate imports queueing) and nothing alerts if the scheduler or the worker stops. Email verification, password reset, reminders, imports and erasure all depend on a worker; if it is not supervised, signup emails silently never arrive (and unverified users cannot use AI/exams).
- Fix: Redis for cache + queue + locks in staging/production, add a preflight check that `cache.default` and `queue.default` are `redis`, supervise `queue:work` (systemd/Supervisor/k8s) with `--timeout` > longest job and `retry_after` greater than that, add `->onOneServer()` and a scheduler heartbeat/`->thenPing` monitor, alert on `failed_jobs` growth (the admin stats endpoint already exposes the count).

### BE-10 - P2 - CODE FIX - Search and AI retrieval use unindexed leading-wildcard LIKE scans
- File: `backend/app/Domains/Search/Services/SearchService.php:40-50`, `backend/app/Domains/Ai/Services/KeywordRetriever.php:31`; `search_documents` (`search_text` TEXT, `search_title` indexed but unusable with `%x%`), `knowledge_chunks.search_text`.
- Scenario: each anonymous search runs two queries with up to 8 OR-ed `LIKE '%token%'` over TEXT columns (full scan, 300 rows each) and then scores up to 600 rows in PHP with nested token loops. Throttle is 60/min per IP (shared per balancer IP if BE-1 is hit). Jobs are indexed too (2,000 per run, per source), so the table grows quickly. `ai/ask` repeats the pattern against `knowledge_chunks`. This is an anonymous CPU/DB amplification lever at moderate scale.
- Fix: MySQL FULLTEXT (ngram parser for Arabic) or an external search engine (Meilisearch/Elastic), keep the PHP scorer only for re-ranking the top N; cache hot queries with a short TTL.

### BE-11 - P2 - EXTERNAL CREDENTIAL - Production adapters and credentials are not wired
- File: `backend/app/Providers/AppServiceProvider.php:98` (payment provider only `fake`), `app/Domains/Notifications/Services/LogPushSender.php`, `config/ai.php:5` (default `fake`), `.env.example` (`MAIL_MAILER=log`).
- Scenario: launch is blocked until: a real `PaymentProvider` adapter (Stripe or other) with webhook signature verification and credentials; FCM/APNs credentials for `PushSender`; `ANTHROPIC_API_KEY` + `AI_DRIVER=anthropic`; a real SMTP/transactional mail provider (verification and reset links need `FRONTEND_URL`/`APP_URL` set to https origins); ClamAV (BE-4). Preflight already flags several (billing fake = error, ai fake/mail log = warning) but not the push stub.
- Fix: provision credentials in a secret manager (never in the repo); add a `push_stub` preflight warning.

### BE-12 - P2 - LEGAL-HUMAN APPROVAL - Policy and compliance texts pending sign-off
- File: `backend/config/privacy.php:6` (`policy_version` = `2026-10-draft`, "pending legal review"), `backend/config/analytics.php` (system counters recorded without consent, "pending legal review"), `backend/config/patente.php` (exam rules "MUST mirror" official rules, task T-035), `JobSourceAdminController::validated` (`legal_basis` is only a free-text length check of 20 chars).
- Scenario: consent records are tied to a draft policy version; counting analytics without consent and the retention periods (`audit_logs_months 24`, `notifications_months 6`, `job_import_runs_days 90`) are assumptions; exam parameters (30 questions, 3 errors, 20 minutes) are unverified; scraping legality rests on whoever fills `legal_basis`.
- Fix: counsel-approved privacy policy/terms and version bump; written decision on system analytics; verification of exam rules against the official source; human review process for job-source legal basis.

### BE-13 - P3 - CODE FIX - No account-status check on authenticated requests (verified)
- File: `backend/routes/api.php` (`auth:sanctum` groups), `backend/app/Http/Controllers/Api/V1/Admin/UserAdminController.php:60-65`, `app/Domains/Privacy/Services/UserEraser.php:19-24`.
- Scenario: suspension and erasure revoke all tokens, which is correct, but nothing checks `status` per request. Probe: a user set to `suspended` (status changed without token deletion) kept `200` on `/auth/me` and `/dashboard` with the old token. Any future code path that changes status without revoking tokens, or a token created in the small window of a concurrent login, stays valid for up to 30 days.
- Fix: a small middleware after `auth:sanctum` that returns 401/403 unless `$user->isActive()`.

### BE-14 - P3 - CODE FIX - `change-password` has no dedicated throttle
- File: `backend/routes/api.php:64`.
- Scenario: with a stolen token an attacker can test candidate "current passwords" at the global 180/min (reveals the real password for credential stuffing elsewhere). `DELETE /profile` has the stricter `privacy` limiter; this endpoint does not.
- Fix: `throttle:privacy` or a login-style limiter keyed by user id, and count only failures.

### BE-15 - P3 - LEGAL-HUMAN APPROVAL - Email enumeration on registration
- File: `backend/app/Http/Requests/Auth/RegisterRequest.php:15`.
- Scenario (verified): registering an existing email returns `422 validation_failed` with "The email has already been taken." Login and forgot-password are enumeration-safe; register is not (rate limited to 10/min per IP).
- Fix: accept as a UX trade-off (document it) or always return 202 "check your email" and send an "already registered" email.

### BE-16 - P3 - CODE FIX - Tokens are full-ability and have no idle/rotation policy
- File: `backend/app/Http/Controllers/Api/V1/Auth/AuthController.php:116`, `backend/config/sanctum.php:53`.
- Scenario: `createToken($name)` grants `['*']` for 30 days (fixed expiry, no sliding idle timeout, no refresh). Admin and normal tokens are identical, no per-device token cap, no way for a user to list/revoke individual devices (only `logout-all`). A stolen admin token has full admin power for 30 days.
- Fix: shorter admin tokens or an `admin` ability requested only on an admin login; per-user token cap; device list/revoke endpoint; shorter lifetime with refresh for mobile.

### BE-17 - P3 - CODE FIX - Data export needs no re-authentication
- File: `backend/app/Http/Controllers/Api/V1/Profile/PrivacyController.php:17`.
- Scenario: `GET /profile/export` (name, email, document labels/notes, AI conversation text, consents, billing) is available with any valid token (5/hour). Erasure re-asks for the password; export does not.
- Fix: require password confirmation (or a recently-confirmed session) for export.

### BE-18 - P3 - CODE FIX - Super admin bypasses all self-protection rules
- File: `backend/app/Providers/AppServiceProvider.php:166` (`Gate::before`), `backend/app/Policies/UserPolicy.php`.
- Scenario: `Gate::before` makes every policy pass for `super_admin`, including `actor->id === target->id` guards, so a super admin can remove their own role or suspend themselves/other super admins via the API, possibly leaving no super admin (recoverable only via `expa:make-admin`).
- Fix: enforce "last super admin" and "not self" invariants in `UserAdminController` explicitly (outside the Gate).

### BE-19 - P3 - CODE FIX - `reports.view` exposes revenue to content managers
- File: `backend/config/permissions.php:43`, `backend/app/Http/Controllers/Api/V1/Admin/StatsController.php:45`.
- Scenario: `content_manager` has `reports.view`, which returns `revenue_30d_minor`, active subscriptions and user counts.
- Fix: split `reports.content` from `reports.finance`.

### BE-20 - P3 - CODE FIX - Official-domain allow pattern is attacker-registrable
- File: `backend/config/content.php:48-52`.
- Scenario: `/(^|\.)(comune|regione|provincia|cittametropolitana)\.[a-z0-9-]+(\.[a-z0-9-]+)*\.it$/` accepts any host containing a `comune.` label under any `.it` domain (e.g. `comune.attacker-example.it`, `x.comune.evil.it`), and look-alike typos such as `comune.rooma.it`. A content editor error or insider could mark a look-alike as `official`.
- Fix: validate against an allow-list of real comune/regione domains (ISTAT/IPA registry) instead of a pattern, or require a second approver for new official hosts.

### BE-21 - P3 - CODE FIX (web) - Stored Markdown only passes through `strip_tags`
- File: `backend/app/Http/Requests/ContentRequest.php:101-117` (`strip_tags` on translations), `guides.body`/`italian_lesson_translations.body`/`patente_*.body` served by public resources.
- Scenario: raw HTML is stripped, but Markdown constructs survive (`[x](javascript:...)`, `![](https://tracker)`). Safe only if the Nuxt renderer sanitises (DOMPurify/markdown-it with `html:false` and URL scheme allow-list). Not exploitable from the API itself (JSON, CSP `default-src 'none'`).
- Fix: also reject/neutralise non-http(s) link targets server-side in `ContentRequest` and confirm the web renderer's sanitiser in the web audit.

### BE-22 - P3 - CODE FIX - Inconsistent error envelope for generic HTTP exceptions (verified)
- File: `backend/bootstrap/app.php:46-71`.
- Scenario: only 401, 403, 404, 422, 429 and `ApiException` are mapped. `POST /api/v1/guides` returns `405 {"message":"The POST method is not supported for route api/v1/guides. Supported methods: GET, HEAD."}` - not the `{error:{code,message}}` envelope, and discloses route/method detail. 400/413/419/503 HTTP exceptions have the same problem.
- Fix: generic `HttpExceptionInterface` renderer producing the standard envelope with a mapped `code` and a generic message.

### BE-23 - P3 - CONFIGURATION - CORS does not allow `X-Analytics-Consent`
- File: `backend/config/cors.php:13`, `backend/app/Http/Controllers/Api/V1/AnalyticsController.php:33`.
- Scenario: a browser calling `POST /analytics/events` cross-origin with `X-Analytics-Consent: granted` fails the preflight (header not in `allowed_headers`), so anonymous analytics silently stop if the web app calls the API directly rather than through its BFF.
- Fix: add the header to `allowed_headers` (or confirm the BFF is the only caller).

### BE-24 - P3 - CONFIGURATION - Docker build context can include local data
- File: `backend/Dockerfile:20` (`COPY . .`), `backend/.dockerignore`.
- Scenario: `.dockerignore` excludes `.env*`, `vendor`, `tests` but not `database/database.sqlite`, `storage/app/**` (a real encrypted upload exists at `storage/app/private/documents/2/...pdf.enc`), `.phpunit.result.cache`, `bootstrap/cache/*`. An image built from a developer workstation would bake local data (CI builds from a clean checkout are fine, since these are git-ignored).
- Fix: add them to `.dockerignore`; build images only in CI.

### BE-25 - P3 - CODE FIX - SafeHttp hardening gaps
- File: `backend/app/Domains/Jobs/Services/SafeHttp.php:22-40,56-60,88-105`, `config/jobs.php:11`.
- Details (SSRF controls are otherwise solid: https only, no credentials, DNS resolved and ALL records checked, IP pinned with `CURLOPT_RESOLVE`, no redirects, 15 s timeout, private/loopback/link-local/CGNAT/IPv4-mapped IPv6 blocked, numeric/hex host forms fail DNS):
  - Size cap is enforced from `Content-Length` and after the body is fully buffered (`strlen($body)`); a chunked response without length is read up to the timeout before being rejected.
  - NAT64 (`64:ff9b::/96`) and 6to4 (`2002::/16`) addresses are treated as public although they embed IPv4.
  - When `JOBS_SSRF_DNS_CHECK=false` hostnames are not checked at all (preflight blocks it in production).
  - Only the first resolved IP is pinned; multi-record hosts always use `$ips[0]`.
- Fix: stream with a byte counter (`sink`/`on_stats`), reject NAT64/6to4 prefixes, keep the preflight error.

### BE-26 - P3 - CODE FIX - `external_id` length not validated (MySQL vs SQLite divergence)
- File: `backend/app/Domains/Jobs/Services/JobNormalizer.php:25` (falls back to the apply URL), `backend/app/Domains/Jobs/Services/JobValidator.php:13-35`, column `job_listings.external_id` `string(191)`.
- Scenario: a feed item whose id (or URL fallback) is longer than 191 characters passes validation; SQLite (tests) stores it, MySQL strict mode throws "Data too long", the item is counted as `processing_error`/invalid and never imported.
- Fix: validate `external_id` length (hash it when long) in `JobValidator`.

### BE-27 - P3 - CODE FIX - Missing uniqueness on billing relations
- File: `backend/database/migrations/2026_10_04_175416_create_billing_tables.php`.
- Details: `subscriptions(provider, provider_ref)` is only indexed, not unique; `subscription_items(subscription_id, kind)` has no unique key while the handler uses `firstOrCreate(['kind'=>'base'])`; `invoices.payment_id` is not unique while the code uses a check-then-insert. The event claim in `billing_events` protects against replays but not against two different event ids racing.
- Fix: add the unique indexes (partial/nullable-safe).

### BE-28 - P3 - CODE FIX - Financial and consent rows cascade-delete from `users`
- File: migrations for `payments`, `invoices`, `subscriptions`, `payment_methods`, `consents` (`foreignId('user_id')->constrained()->cascadeOnDelete()`).
- Scenario: normal erasure is safe because users are soft-deleted (and `BillingData`/`ConsentData` deliberately keep those rows). But any hard delete (`forceDelete`, manual SQL, a future admin purge) would silently destroy invoices (legal retention obligation) and consent proofs.
- Fix: `restrictOnDelete()` on `payments`/`invoices`/`consents` so a hard delete fails loudly.

### BE-29 - P3 - CODE FIX - Deleting a job source hard-deletes its jobs and users' saved jobs
- File: `backend/app/Http/Controllers/Api/V1/Admin/JobSourceAdminController.php:62-69`, migration `job_listings.job_source_id ... cascadeOnDelete`, `job_saves.job_id ... cascadeOnDelete`.
- Scenario: `DELETE /admin/job-sources/{id}` removes every listing, every user's saved jobs referencing them, apply-click counts and import history. It is audited but irreversible.
- Fix: deactivate instead of delete, or soft-delete sources and expire their jobs.

### BE-30 - P3 - CODE FIX - Missing indexes for retention jobs and job filters
- File: `backend/database/migrations/2026_10_04_023337_create_reminders_and_notifications_tables.php` (`user_notifications` indexes lead with `user_id`), `...172948_create_jobs_tables.php`.
- Details: `expa:prune-retention` filters `user_notifications.created_at` and `job_import_runs.started_at` alone (full scans); public job filters on `category`, `remote_mode`, `employment_type`, `italian_level` have no index (the `(status, published_at)` index serves only the base listing); `patente_questions` random selection uses `ORDER BY RAND()` (`ExamService::start`) which degrades with a large bank.
- Fix: add `created_at` / `started_at` indexes; composite job filter indexes once volumes justify; random selection via id sampling.

### BE-31 - P3 - CODE FIX - Unpaginated and unbounded collections
- File: `backend/app/Http/Controllers/Api/V1/GeographyController.php:25` (`cities` returns all, currently ~tens of rows from the seeder, will not scale to full ISTAT), `JobController.php:116` (`saved` loads every saved job), `BillingController.php:57` (invoices), `JobSourceAdminController.php:30`, `DocumentTypeController`, Patente categories/topics.
- Scenario: also no per-user cap on `my-documents`, `devices`, `job_saves` or issued tokens, only the global 180/min throttle, so one account can create unbounded rows.
- Fix: paginate or cap (`limit`) these endpoints; add per-user maxima (documents, devices, saves).

### BE-32 - P3 - CODE FIX - Counters can be inflated
- File: `backend/app/Http/Controllers/Api/V1/JobController.php:143`, `AnalyticsController.php`, `Analytics.php`.
- Scenario: `apply-click` increments `apply_clicks` per request (a single user at up to 180/min), and anonymous analytics trust a self-asserted `X-Analytics-Consent: granted` header with 60/min per IP. Metrics used for decisions (job popularity, content popularity) can be skewed; no privacy impact.
- Fix: de-duplicate per user/job/day; accept the analytics trust model explicitly.

### BE-33 - P3 - CONTENT VERIFICATION - Seeders publish unreviewed content and active placeholder plans
- File: `backend/database/seeders/StarterCurriculumSeeder.php:23` (`forceFill(['status'=>'published'])` bypasses the four-eyes workflow), `backend/database/seeders/PlanSeeder.php` (placeholder prices, `active => true`, listed publicly by `GET /billing/plans` even while billing is `none`), `DatabaseSeeder` seeds both.
- Fix: seed as `draft`/`review` in production, make plans inactive until prices and legal text are approved, and require native-speaker review of the Arabic starter lessons (task T-034).

### BE-34 - P3 - LICENSE - Patente `rights_note` is a 5-character check
- File: `backend/app/Domains/Patente/Models/PatenteQuestion.php:47-51`.
- Scenario: the licence gate for exam questions (`strlen(trim(rights_note)) < 5`) accepts any placeholder text; nothing proves rights to the question text. The project rule is to never ship an unlicensed question bank.
- Fix: structured provenance (licence id, source URL, reviewer) and an explicit human approval step before `published`.

### BE-35 - P3 - CONFIGURATION - `APP_KEY` rotation affects every encrypted/hashed field
- File: `backend/config/app.php:100-106`, `AuditLogger::hash`, `ConsentService::record`, casts `encrypted` (document labels/notes/names, AI messages/titles, profile nationality/residence type, job source config), attachment `Crypt`.
- Scenario: rotating or losing `APP_KEY` makes all of that data unreadable and invalidates audit/consent IP HMACs. `APP_PREVIOUS_KEYS` is wired in config but there is no runbook, backup policy, or re-encryption command.
- Fix: document key custody/backups, rotation steps with `APP_PREVIOUS_KEYS`, and add a re-encrypt command.

### BE-36 - P3 - CODE FIX - Timeouts and synchronous heavy work
- File: `backend/app/Jobs/RunJobImport.php` (no `$timeout`), `backend/config/queue.php:43` (`retry_after` 90), `docker-compose.yml:68` (worker without `--timeout`), `app/Domains/Ai/Services/AnthropicClient.php:20` (20 s synchronous call inside the web request), `app/Events/ContentChanged` listeners (`ReindexSearch`, `ReindexKnowledge`) run synchronously inside the admin DB transaction (`ContentService`).
- Details: a large feed (up to 2,000 items, one transaction and a search reindex each) can exceed the default 60 s worker timeout, be killed, and count toward the 3-failure auto-deactivation; a 20 s LLM call occupies a php-fpm worker (at the 20/min/user AI limit this is a pool-exhaustion lever); reindex failures roll back the editor's save.
- Fix: set explicit job timeouts with `retry_after` above them, queue the reindex listeners, and consider streaming/queueing AI responses.

### BE-37 - P3 - CODE FIX - Non-ASCII filename in raw `Content-Disposition` (verified)
- File: `backend/app/Http/Controllers/Api/V1/UserDocumentController.php:126`.
- Scenario: an Arabic upload name produces `filename="تصريح الإقامة.png"` with raw UTF-8 bytes in the header (invalid per RFC 6266; some proxies/clients mangle or reject it). Header injection is not possible (control characters are stripped in `safeName`).
- Fix: use `HeaderUtils::makeDisposition()` (ASCII fallback + `filename*=UTF-8''...`).

### BE-38 - P3 - CODE FIX - Attachment deletion is not audited
- File: `backend/app/Http/Controllers/Api/V1/UserDocumentController.php:133-139`.
- Scenario: `document.attachment_added` and `attachment_downloaded` are logged but `deleteAttachment` writes no audit row (the document deletion is audited).
- Fix: add `document.attachment_deleted`.

### BE-39 - P3 - CONTENT VERIFICATION - Public 5-minute caching of regulated content
- File: `GuideController`, `GovernmentController`, `AppointmentController`, `PatenteController`, `StudyController`, `BillingController::plans` (`Cache-Control: public, max-age=300`).
- Scenario: unpublishing wrong or outdated government information can still be served by CDNs/browsers for up to 5 minutes (acceptable for most content; relevant for withdrawal of an incorrect official procedure). `Vary: Accept-Language` is set by `SetLocale`, so cached copies are per language.
- Fix: keep, but document it and expose a CDN purge on unpublish for high-risk content.

---

## Part 2 - Database review

All 22 migrations, models and query patterns were read. Highlights not already listed above:

- Foreign keys: present everywhere with explicit delete semantics (`cascadeOnDelete` for user-owned data, `restrictOnDelete` for `cities.region_id`, `user_documents.document_type_id`, `patente_questions.patente_topic_id`, `study_programs.university_id`, `subscriptions.plan_id`; `nullOnDelete` for optional links). `created_by`/`updated_by` are deliberately not FKs (they must survive account erasure; documented in the migration).
- Localization: consistent `<entity>_translations(entity_id, locale, ...)` with `unique(entity_id, locale)` everywhere (explicit short names for long MySQL identifiers), `locale` is `string(2)`, fallback chain in `config/content.php`. Required-locale rule (`ar`) enforced in `PublishGuard`.
- Soft deletes: content tables and `users` use them; slug is rewritten on delete to free the unique index (`ContentService::delete`).
- GDPR erasure vs delete behaviour: users are soft-deleted and anonymised; per-module `PersonalDataProvider::erase` removes documents, files, reminders, notifications, device tokens, AI data, learning/patente/job data; audit/consent/billing rows are kept but unlinked (hash/IP/`changes` nulled). Issues: BE-28 (cascade), `AttachmentStore` file deletion happens inside the erasure transaction (a later failure rolls rows back after files are gone; the retry is idempotent so this is safe).
- Timestamps: mostly `timestamps()`; append-only tables (`consents`, `audit_logs`, `ai_messages`, `user_notifications`, `job_saves`, `document_attachments`) use `created_at` only by design. `analytics_daily`, `billing_events`, translations have none.
- Naming: consistent snake_case plurals; minor inconsistencies (`lesson_progress` singular, `user_notifications` vs Laravel `notifications`, `knowledge_chunks` vs `knowledge_documents` in the spec) - cosmetic.
- Rollbacks: every `down()` drops what `up()` created; rollbacks are inherently destructive for data but there are no partial/unsafe `down()` methods. `0001_01_01_000000` and the user-columns migration are the only ones touching an existing table's columns and are reversible.
- MySQL vs SQLite: CI runs the suite on SQLite and on MySQL 8 (`.github/workflows/ci.yml`), which is good. Remaining divergence risks: BE-26 (column length), `LIKE` on JSON columns (`scholarships.degree_levels`, relies on MySQL's JSON text form and `"degree"` quoting), `orderByRaw('expiry_date IS NULL')` (portable). `utf8mb4` index sizes checked: `analytics_daily_unique` about 691 bytes, `device_tokens.token` 512 chars = 2,048 bytes (under the 3,072 limit of DYNAMIC row format; fails on COMPACT/older MariaDB with 767).
- N+1: no N+1 was found in the audited endpoints. Public list endpoints eager-load `translations`, `region.translations`, `city.translations`, `university.*`; `JobController` eager-loads `city.translations` and `source`; notifications resolve document ids in one query; the test suite contains query-count assertions for the main lists. Admin lists load only `translations` (resources emit ids, not relations). `UserResource` reloads role permissions per call (constant, small). `DailyPlanService` runs up to 5 types x 6 levels bounded queries.
- Pagination: see BE-31 for the exceptions; every paginated endpoint caps `per_page` (max 50 public, 100 admin).
- Unique constraints: slug unique on all content, `(user_id, task_key)`, `(user_id, italian_lesson_id)`, `(patente_exam_id, patente_question_id)`, `(user_document_id, kind, offset_days)`, `(job_source_id, external_id)`, `(provider, event_id)`, `(provider, provider_ref)` on payments, `device_tokens.token`. Gaps: BE-27.

## Part 3 - API conventions and operations

Per-group matrix (authn / authz / validation / pagination / sort whitelist / error envelope / rate limit / localisation / resources):

| Group | Authn | Authz / ownership | Validation | Pagination & sorting | Rate limit | Notes |
|---|---|---|---|---|---|---|
| `auth/*` | public + sanctum | n/a | FormRequests / inline | n/a | login (3 buckets), register, password-reset, verify (6/min) | BE-2, BE-14, BE-15 |
| `profile/*`, `my-documents/*` | sanctum | scoped by `user->documents()` / `user_id`; foreign id returns 404 | strict, enum/exists rules | documents: `per_page` <= 100, sort limited to expiry asc/desc | uploads 30/h, privacy 5/h | consent gates enforced |
| `notifications`, `devices` | sanctum | `where user_id` | yes | paginated (<=100) | global | BE-31 |
| `ai/*` | sanctum (+verified for `ask`) | conversations scoped by `user_id` | length 2-1000 | conversations `per_page` <= 50 | `ai` 20/min + daily quota (atomic) | LLM failure degrades gracefully |
| `patente/*` | sanctum for exams | exams scoped by `user_id` | yes (answers, topics exist) | exams paginated | start: verified + 20/h + daily limits | server-side grading, answers hidden |
| `jobs/*` public + user | optional bearer on public | saves by `user_id` | yes | `per_page` <= 50; fixed order | global | BE-31, BE-32 |
| `billing/*` | sanctum / webhook signature | by `user_id` | yes | invoices unbounded | privacy 5/h on checkout/cancel; webhook 120/min | BE-5, BE-6 |
| `dashboard/*` | sanctum | per user | task key whitelisted via catalog | n/a | global | |
| public content (`guides`, `government`, `appointments`, `italian`, `patente` content, `study`, `regions`, `cities`, `search`) | none | published scope only | enum/length rules, array inputs rejected (verified 422) | `per_page` <= 50; fixed `orderBy` (no client-supplied sort) | search 60/min, global 180/min | BE-10, BE-31 |
| `admin/*` | sanctum + verified email | every route has `can:` middleware (explicit per-route or via `$contentAdmin` helper) plus Policy/Gate per action; `Authorize` is ordered before model binding | FormRequests with `strip_tags` and `url:https` | `per_page` <= 100; sort whitelist per controller | global | BE-18, BE-19 |

- Error envelope: consistent `{error:{code,message,details?}}` for validation, authn, authz, 404, 429, business and 500 errors (debug off); exceptions: BE-22. Success envelope `{data, meta:{locale,...}}` is consistent; some controllers hand-build `meta` for pagination instead of `ApiResponse::paginated` (`AiController`, `JobController`, `NotificationController`, `StudyController`) but with identical keys.
- Localisation: `SetLocale` (query `lang`, then `Accept-Language` quality order, default `ar`), `Content-Language`/`Vary` set, fallback chain exposed as `locale`/`fallback` on content.
- Queues: `EraseUserData` (5 tries, backoff, `failed()` audit entry), `RunJobImport` (unique per source, 3 tries, backoff, auto-deactivation and admin alert after 3 failed runs), reminders (BE-7), notifications. `failed_jobs` uses `database-uuids`; no alerting (BE-9).
- Scheduler (`routes/console.php`): `withoutOverlapping` on the mutating schedules, retention/pruning present (audit logs, AI messages, notifications, import runs, expired tokens, reset tokens); no `onOneServer`, no monitoring (BE-9).
- Caching: no application-level caching at all (only HTTP `Cache-Control`); every public request hits the database (acceptable at MVP, relevant with BE-10).
- Config caching: `php artisan config:cache`, `route:cache`, `event:cache` all succeed (no closure routes, no `env()` in app code outside config except the one in `bootstrap/app.php`, BE-1). Caches were cleared afterwards with `optimize:clear`; framework manifests (`bootstrap/cache/packages.php`, `services.php`) were regenerated by the following test run and are unchanged in content. The only `env()` calls outside `config/` are `bootstrap/app.php:36`.
- Logging: no secrets, prompts or PII were found in application log calls (`Log::warning('job_import.fetch_failed')` logs source key, class and host only; push stub logs a count; AI failures call `report()` on an exception that never includes request data - `AnthropicClient` rethrows with the class name only). The issues are volume and rotation (BE-3, BE-8). A local log contains mail bodies with reset/verification links because `MAIL_MAILER=log` in development; not a production issue provided SMTP is used.

## Checked and found OK

IDOR / broken access control
- Every route taking a model id/slug/uuid was traced: `my-documents/{document}`, attachments, `notifications/{id}`, `devices`, `ai/conversations/{id}`, `patente/exams/{id}`, `jobs/{id}/save|apply-click`, `billing/*`, `dashboard/tasks/{key}`, `italian/lessons/{slug}/progress`. All user-owned resources are queried through the authenticated user (relation or `where user_id`), return 404 for foreign ids, and have tests (`SecurityTest` sweeps all routes, including an unauthenticated and an authenticated-without-permission pass over every admin route).
- Admin: every `admin/*` route carries a `can:` middleware; `ContentAdminController` adds Policy checks per action, edit locks for approved/published content, four-eyes approval, workflow transition permissions (`update`/`review`/`publish`) and per-resource prefixes. `Authorize` runs before `SubstituteBindings`, so 403 is returned for every id (no 404/403 oracle).
- Privilege escalation: `UserPolicy::assignRoles/update` block self-assignment, granting/revoking privileged roles and editing admins unless super admin; status is not mass-assignable; roles come only from `config/permissions.php`.
- Mass assignment: `User` uses an explicit `#[Fillable]` allow-list; every domain model uses `$guarded` including ownership/workflow keys (`user_id`, `status`, `publish_at`, `created_by`, `apply_clicks`). The unguarded models (`Role`, `Permission`, geography, `DocumentType`, `Consent`, `AuditLog`) are only written by seeders/services, never from request data. All request-driven `fill()/create()` calls use `validated()` or key whitelists (`contentAttributes()`).

Injection / input handling
- SQL: only static `selectRaw`/`orderByRaw` fragments exist (no user input in raw SQL); every `orderBy` column comes from a controller whitelist or is fixed; every `LIKE` escapes `%`, `_`, `\`; array-typed query inputs are rejected with 422 (verified).
- XSS: API returns JSON only with `Content-Type: application/json`, `nosniff`, `Content-Security-Policy: default-src 'none'`, `X-Frame-Options: DENY`, HSTS (https/production), `Referrer-Policy: no-referrer`, `Permissions-Policy`; stored admin text is stripped with `strip_tags`; job feed text is decoded and stripped repeatedly (nested/encoded tags), user free text (labels, notes, AI message) is stripped. See BE-21 for Markdown.
- SSRF: only `SafeHttp` (admin-configured feed URLs, validated at save and at fetch) and the fixed Anthropic base URL fetch external URLs. Controls listed under BE-25. RSS parsing uses `LIBXML_NONET` without `NOENT` (no XXE).
- Open redirects: none; checkout success/cancel URLs are server-built from `FRONTEND_URL`; `apply_url` is returned as data and validated `https`; mail links are built from config.
- File uploads: finfo content-type detection with an allow-list (PDF/JPEG/PNG/WEBP), size 1 B-10 MB, max 10 files and 100 MB per user (checked inside a locked transaction), random UUID storage names (no client path), encrypted at rest (AES-256 via app key), private disk with `serve=false`, owner-scoped download with `attachment`, `nosniff`, `no-store`, sandbox CSP, display name stripped of path/control characters and stored encrypted. No path traversal vector.

Authentication / session
- Passwords: bcrypt (12 rounds), `Password::min(10)->letters()->numbers()` (+`uncompromised()` in production), timing-equalised login with a dummy hash, generic `invalid_credentials`, pending-erasure accounts look unknown, suspended accounts blocked after a correct password only.
- Reset: Laravel's hashed 64-char random token, 60-minute expiry, single use (deleted on success), 60 s per-user throttle, response identical for known/unknown emails, all tokens revoked on reset and on password change (except the current token), `remember_token` rotated.
- Email verification: signed (`signed` middleware) + `hash_equals(sha1(email))`, 60-minute expiry, idempotent, throttled; verification required for AI, exams, admin; the email cannot be changed through the API.
- Sanctum: bearer tokens only (no stateful/cookie middleware registered), 30-day expiry, `sanctum:prune-expired` scheduled, hashed in DB, `logout`/`logout-all`, tokens revoked on suspension, erasure, reset, password change. See BE-13, BE-16.
- Rate limits: per-route limiters for login (email+IP, IP, account), register, password reset, uploads, privacy actions, AI, exams, search, analytics, webhook; global `throttle:api` keyed by user id or IP; `X-Forwarded-For` is ignored unless the proxy is trusted (no spoofing when `TRUSTED_PROXIES` is unset). See BE-1, BE-2, BE-14.
- Token/PII leakage: tokens are never logged or returned except at login/register; query-string tokens are limited to the mail links; audit log stores HMACs of email/IP, not raw values; `Hidden` on `User`; API resources expose only intended fields (`UserResource` returns own email/roles/permissions; `AdminUserResource` is admin-only; `UserDocumentResource` returns only the owner's decrypted fields; job source config is never returned, only host/shape).
- Billing webhook: unauthenticated by design, provider must match config, signature verified in the adapter, constant-time compare, idempotent event claim inside the transaction, out-of-order tolerant, refuses to revive cancelled subscriptions. `FakePaymentProvider` is blocked by preflight in production.
- AI safety: emergency and sensitive-without-source intents never reach the LLM; model output has non-verified URLs, phone numbers, schemes and citations stripped (`ResponseProcessor`); prompts are delimiter-escaped; user context is consent-gated and excludes name/email/document text; messages and titles are encrypted at rest; 12-month retention job; usage quota is atomic and refunded on failure; the LLM client never includes request data in exceptions.
- Secrets: none in the tree or in git history; `.env` ignored; `.env.example` has placeholders only; compose passwords are labelled local-only; CI runs `composer audit`, `npm audit`, gitleaks and Pint.
- GDPR plumbing: export and erasure are provider-driven (`privacy.providers` tag covers 12 modules), erasure is two-phase (immediate lock + token revocation, queued idempotent erase), password re-entry for erasure, retention commands, consent log with policy version, consent-gated personalisation, data minimisation (aggregate-only analytics, hashed IPs).
- Dependency health: `composer audit` clean; no deprecated packages reported.

## Suggested fix order

1. BE-1 (proxies), BE-3 (dontReport), BE-8 (log config), BE-9 (Redis/worker/scheduler supervision and alerts) - these decide whether production is operable.
2. BE-2, BE-13, BE-14 (auth abuse).
3. BE-5, BE-6, BE-7 (money and reminder correctness), BE-4 + BE-11 (ClamAV and provider credentials).
4. BE-10 (search), then the P3 list as hardening.
5. BE-12, BE-33, BE-34 need people (legal, content and licence owners), not code.
