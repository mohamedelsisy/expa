# External services

Status 2026-10-08. Every adapter is implemented behind an interface, configured only through environment variables, fails safe, and is tested with `Http::fake` or an in-process stream. NONE has been run against the real service (no credentials or hosts exist): **code complete, live-untested**. Variables are defined in ENVIRONMENT.md; `php artisan expa:preflight --production` blocks a deploy that selects a provider without its credentials. Infrastructure files: `docker-compose.prod.yml`, `docker-compose.staging.yml`, `deploy/`, `scripts/` (see DEPLOYMENT.md, OPERATIONS.md).

Conventions for the verification commands:
- `artisan` means `php artisan` inside the api container: `docker compose --env-file deploy/env/stack.env -f docker-compose.prod.yml exec -T api php artisan ...` (staging: add `-f docker-compose.staging.yml`).
- The `tinker --execute` one-liners were executed locally against the **fake/closed** configuration to confirm syntax and the failure output; their success output against the real service is the "Expected result" and is **not yet observed**.
- Where no command exists for a check it says so and proposes one; nothing is invented.
- No value below is a real secret. `__SECRET__` marks values from the secret manager.

---

## 1. Anthropic (AI assistant) — T-019

**BLOCKER:** BLOCKED_EXTERNAL_CREDENTIAL. No API key. Preflight errors on `AI_DRIVER=fake` (`ai_fake`) and on a missing key (`ai_key_missing`), warns on `AI_DAILY_TOKEN_BUDGET=0` (`ai_no_budget`).

**Required account/service:** Anthropic Console organisation with billing and a monthly spend limit; a DPA for personal data (BLOCKED_LEGAL, LAUNCH_QUEUE). Code: `AnthropicClient` (timeout, bounded retries on connection/429/5xx, input/output caps, https-only base URL, exceptions without prompt/answer/key).

**Required credentials:** one API key, restricted by workspace where possible.

**Environment variables:** `AI_DRIVER=anthropic`, `ANTHROPIC_API_KEY` (secret), `AI_MODEL` (default `claude-sonnet-5-5`), `AI_DAILY_TOKEN_BUDGET` (set from the monthly budget), optional `AI_TIMEOUT_SECONDS`, `AI_RETRIES`, `AI_MAX_OUTPUT_TOKENS`, `AI_MAX_INPUT_CHARS`, `ANTHROPIC_BASE_URL` (proxy only).

**Configuration steps:** create key with spend limit; put it in the secret manager; set the variables in `deploy/env/api.env`; `artisan config:cache`; `artisan queue:restart`; run `artisan expa:ai-reindex` after content exists (no content is published yet, so answers needing sources return the "no verified information" reply by design).

**Verification command:**
```
artisan expa:preflight --production
artisan tinker --execute='$r = app(App\Domains\Ai\Contracts\LlmClient::class)->complete("You are a connectivity test. Reply with the single word OK.", [["role"=>"user","content"=>"ping"]]); echo get_class(app(App\Domains\Ai\Contracts\LlmClient::class))." | ".trim($r->text)." | in=".$r->inputTokens." out=".$r->outputTokens;'
```
(Locally with `AI_DRIVER=fake` the first part prints `App\Domains\Ai\Services\FakeLlmClient`.) Then end to end: log in as a verified user and `curl -sS -X POST https://<api>/api/v1/ai/ask -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"message":"How do I renew my permesso di soggiorno?"}'`.

**Expected result:** class `App\Domains\Ai\Services\AnthropicClient`, a short text containing `OK`, non-zero token counts, no exception. Preflight shows no `ai_*` ERROR. `/ai/ask` returns HTTP 200 with an answer and the source label; with the key revoked it returns the localized degraded answer with a search alternative (not a 5xx); `storage/logs` contains no question text.

---

## 2. Firebase Cloud Messaging + APNs (push) — T-016b

**BLOCKER:** BLOCKED_EXTERNAL_CREDENTIAL. No Firebase project, no service account, no APNs key (needs an Apple Developer account). Preflight warns `push_stub` while `PUSH_DRIVER=log`; errors `fcm_credentials_missing` if `fcm` without credentials.

**Required account/service:** Firebase project with Cloud Messaging API (v1) enabled; Android and iOS apps registered; APNs authentication key uploaded in Firebase (iOS). Code: `FcmPushSender` (HTTP v1, RS256 service-account JWT to OAuth token, token cached, retries on 429/5xx, one refresh on 401, deletes `UNREGISTERED` tokens).

**Required credentials:** service-account JSON (role "Firebase Cloud Messaging API Admin"); APNs `.p8` key + key id + team id (kept in Firebase, not in EXPA).

**Environment variables:** `PUSH_DRIVER=fcm`, `FCM_CREDENTIALS_PATH` (file mounted read-only outside the web root, e.g. `/run/secrets/fcm-service-account.json`) or `FCM_CREDENTIALS_JSON` (secret), optional `FCM_PROJECT_ID`, `FCM_API_BASE`, `FCM_TIMEOUT`, `FCM_RETRY_SLEEP_MS`. Compose: mount the JSON into api, queue and scheduler (the queue sends reminders).

**Configuration steps:** create project and service account; store JSON in the secret manager; mount it; set variables; `config:cache`; `queue:restart`; mobile team adds `google-services.json` / `GoogleService-Info.plist` (MOBILE_SETUP.md section 5).

**Verification command:** (authentication and request path, no real device needed)
```
artisan tinker --execute='print_r(app(App\Domains\Notifications\Contracts\PushSender::class)->send(["expa-verification-invalid-token"], "EXPA test", "ignore", []));'
```
Then with a real device token registered via `POST /api/v1/devices` and push consent on: create a user document expiring in 7 days and run `artisan expa:send-reminders`.

**Expected result:** the first command returns without exception and an array: FCM answers `INVALID_ARGUMENT`/`UNREGISTERED` for the fake token, which proves the OAuth exchange and project id worked (an exception mentioning "FCM OAuth token request failed" means bad credentials). The reminder arrives on the device; after uninstalling the app and re-running, the row disappears from `device_tokens`. Not proposed: there is no dedicated `expa:push-test` command (propose adding one in a later task).

---

## 3. Payment provider (Stripe) — T-038, T-058

**BLOCKER:** BLOCKED_EXTERNAL_CREDENTIAL + BLOCKED_LEGAL (accountant: VAT, invoicing, SDI; counsel: terms/refunds). Not needed for a free-only launch: keep `BILLING_PROVIDER=none` (preflight warns `billing_none` only). `fake` is a preflight ERROR.

**Required account/service:** Stripe account (legal entity verified), products/prices (optional), webhook endpoint `https://<api>/api/v1/billing/webhook/stripe` for `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`, `charge.refunded`. Code: `StripePaymentProvider` (hosted Checkout, cancel at period end/now, `Stripe-Signature` HMAC with 300 s tolerance and secret rotation), dunning, state machines, invoice numbering; `tax_rates` ships EMPTY.

**Required credentials:** secret API key (restricted key recommended), webhook signing secret(s).

**Environment variables:** `BILLING_PROVIDER=stripe`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (comma separated during rotation), `STRIPE_API_VERSION` (pin), optional `STRIPE_PRICE_PLUS`, `STRIPE_PRICE_PRO`, `STRIPE_TIMEOUT`, `STRIPE_WEBHOOK_TOLERANCE`, `BILLING_GRACE_DAYS`, `BILLING_DUNNING_REMINDER_DAYS`, `BILLING_TAX_COUNTRY`, `BILLING_SEED_PLANS_ACTIVE=false`. Start in test mode (`sk_test_...` equivalents) on staging only.

**Configuration steps:** accountant decision first; create account; test-mode keys on staging; add the webhook endpoint (the edge nginx does not rate-limit it; the app has `throttle:billing-webhook`, 120/min/IP); seed plans with approved prices (`artisan db:seed --class=PlanSeeder`, then activate in admin); run the test-mode scenarios; repeat in live mode with separate secrets.

**Verification command:** there is no artisan command. Real checks:
```
artisan expa:preflight --production
curl -sS https://api.stripe.com/v1/balance -u "$STRIPE_SECRET_KEY:"            # key valid (run from your shell, key never in history: use read -s)
stripe listen --forward-to https://<staging-api>/api/v1/billing/webhook/stripe   # Stripe CLI, prints the whsec_ to use on staging
stripe trigger checkout.session.completed
curl -sS -o /dev/null -w '%{http_code}\n' -X POST https://<api>/api/v1/billing/webhook/stripe -d '{}'   # unsigned: must NOT be 2xx
```
Proposed (not existing): `expa:billing-check` to validate key and webhook secret presence without a network call.

**Expected result:** balance JSON (not an `error`); forwarded events produce 2xx and the subscription becomes `active` (check `GET /api/v1/billing/subscription` as the test user); the unsigned POST returns a 4xx; card `4000 0000 0000 0341` renewal failure sets `past_due` and, after the grace period, `artisan expa:billing-expire` expires it. Event payload shapes against the pinned API version are verified only with fixtures today.

---

## 4. SMTP / transactional mail

**BLOCKER:** BLOCKED_EXTERNAL_CREDENTIAL. No provider or sending domain. Preflight ERROR `mail_not_delivered` for `log`/`array`; unverified users cannot use AI or exams, so no mail means no usable accounts.

**Required account/service:** transactional provider (SMTP or an API mailer) with a verified domain: SPF, DKIM, DMARC published. Staging uses Mailpit (in `docker-compose.staging.yml`, UI bound to 127.0.0.1:8025), never a real provider.

**Required credentials:** SMTP username and password (or `POSTMARK_API_KEY` / `RESEND_API_KEY` / SES keys for those mailers).

**Environment variables:** `MAIL_MAILER=smtp`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_SCHEME`, `MAIL_USERNAME`, `MAIL_PASSWORD` (secret), `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME`, `APP_URL`/`FRONTEND_URL` (https, used in links).

**Configuration steps:** create credentials; publish DNS records; set variables; `config:cache`; `queue:restart` (mail is queued, the worker must run).

**Verification command:**
```
artisan tinker --execute='Mail::raw("EXPA SMTP test", fn ($m) => $m->to("you@your-inbox.example")->subject("EXPA SMTP test")); echo "sent via ".config("mail.default");'
```
Then register a new account on the web app and complete verification; request a password reset. Staging: open Mailpit at `http://127.0.0.1:8025` through an SSH tunnel.

**Expected result:** `sent via smtp`, the message arrives (check spam placement, DKIM/SPF pass in the headers, RTL rendering of the Arabic templates). Note `Mail::raw` is sent synchronously, whereas verification mail is queued: also confirm `failed_jobs` stays at 0 (`scripts/monitor.sh`).

---

## 5. ClamAV (upload antivirus) — T-043

**BLOCKER:** BLOCKED_INFRASTRUCTURE. No clamd running anywhere (the compose service exists, never started). Preflight ERROR `scanner_basic` for `DOCUMENTS_SCANNER=basic`, `scanner_fail_open` if `CLAMAV_FAIL_CLOSED=false`.

**Required account/service:** the `clamav` service of `docker-compose.prod.yml` (image `clamav/clamav:1.4`, signatures via freshclam inside the image, 2 GB RAM limit, port 3310 only on the internal `backend` network, `StreamMaxLength` 25M >= the 10 MB upload cap). No account.

**Required credentials:** none (network reachability only).

**Environment variables:** `DOCUMENTS_SCANNER=clamav`, `CLAMAV_HOST=clamav`, `CLAMAV_PORT=3310` (or `CLAMAV_SOCKET`), `CLAMAV_TIMEOUT=5`, `CLAMAV_FAIL_CLOSED=true`, `DOCUMENTS_ENCRYPT=true`.

**Configuration steps:** `docker compose ... up -d clamav`; wait for the healthcheck (first start downloads signatures, `start_period` 180 s); set variables; `config:cache`.

**Verification command:**
```
docker compose --env-file deploy/env/stack.env -f docker-compose.prod.yml ps clamav                  # healthy
artisan tinker --execute='file_put_contents("/tmp/eicar.bin", base64_decode("WDVPIVAlQEFQWzRcUFpYNTQoUF4pN0NDKTd9JEVJQ0FSLVNUQU5EQVJELUFOVElWSVJVUy1URVNULUZJTEUhJEgrSCo=")); echo var_export((new App\Domains\Documents\Services\ClamdScanner(config("documents.clamav")))->reject("/tmp/eicar.bin", "application/pdf"), true); unlink("/tmp/eicar.bin");'
```
(base64 of the industry-standard EICAR test string, harmless.) Closed-port behaviour was run locally: `CLAMAV_PORT=3398 ... reject()` returned `'scanner_unavailable'`. End to end: upload the EICAR file and a clean PDF through `POST /api/v1/my-documents/{id}/attachments`; stop clamd; upload a clean PDF.

**Expected result:** health `healthy`; the EICAR call returns `'malware_detected'`; a clean file returns `NULL`; the upload API answers 422 `attachment_rejected` for EICAR, 200 for clean, and with clamd stopped 503 `scanner_unavailable` (nothing stored, an in-app alert for admins, at most hourly); after restart uploads work again.

---

## 6. Hosting, domains, TLS

**BLOCKER:** BLOCKED_INFRASTRUCTURE. Nothing provisioned: no domain, host, certificate, managed database, backup storage.

**Required account/service:** one Linux VM (4 vCPU / 8 GB / 80 GB SSD is the sizing the compose limits assume) for staging and one for production, or equivalent; DNS for `API_HOST` and `WEB_HOST`; TLS certificates (Let's Encrypt via certbot webroot `/var/www/acme`, or the provider's); optional managed MySQL 8 with PITR and managed Redis; object storage for backups (S3-compatible, optional); firewall allowing only 80/443 (+22 restricted). Documents live on a local volume (`storage`): there is no env switch to put the `documents` disk on S3 (config/filesystems.php defines it as `local`), so S3 for documents would need a code change (not scheduled).

**Required credentials:** SSH deploy key, registry pull credentials, DNS API token if using DNS-01, secret-manager access.

**Environment variables:** `deploy/env/stack.env` (`API_IMAGE`, `WEB_IMAGE`, `API_HOST`, `WEB_HOST`, `CERTS_DIR`); `APP_URL`, `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`, `TRUSTED_PROXIES` (`172.28.0.0/16`), `BEHIND_PROXY`; web: `NUXT_API_BASE_URL`, `NUXT_PUBLIC_SITE_URL`, `NUXT_TRUSTED_PROXY_HOPS=1`, `NUXT_SECURITY_HSTS=true`.

**Configuration steps:** DNS A/AAAA records; certificates into `${CERTS_DIR}/<host>/{fullchain.pem,privkey.pem}`; env files from the `.example` templates; `docker compose ... config -q`; `up -d`; run `scripts/preflight.sh`; `artisan migrate --force`; first deploy steps in DEPLOYMENT.md.

**Verification command:**
```
docker compose --env-file deploy/env/stack.env -f docker-compose.prod.yml config -q
API_URL=https://api.example.com WEB_URL=https://www.example.com scripts/healthcheck.sh
echo | openssl s_client -connect api.example.com:443 -servername api.example.com 2>/dev/null | openssl x509 -noout -enddate -issuer
curl -sSI https://api.example.com/api/v1/health | grep -iE 'strict-transport|x-content-type|HTTP/'
curl -sS -o /dev/null -w '%{http_code}\n' https://api.example.com/.env      # must be 404
```
plus the rate-limit identity check from DEPLOYMENT.md (6 failed logins from one client IP must not throttle another IP).

**Expected result:** `config -q` silent; healthcheck prints `ok` three times; certificate expires in the future with a public issuer; headers include HSTS and `nosniff`; `/.env` returns 404; the identity check shows distinct buckets.

---

## 7. Redis (cache + queue)

**BLOCKER:** BLOCKED_INFRASTRUCTURE (the compose `redis` service exists, never started). Preflight warns `cache_not_redis` / `queue_not_redis` and errors for `array/null` cache or `sync` queue.

**Required account/service:** Redis 7 with a password (compose service or managed). Config in `docker/redis/redis.conf`: AOF on, `maxmemory-policy noeviction` (an evicted queue job is lost silently), 384 MB. One instance serves cache (db 1), queue and default (db 0); Laravel cannot split instances by env today, so size memory with headroom and alert at 70%.

**Required credentials:** `REDIS_PASSWORD`.

**Environment variables:** `CACHE_STORE=redis`, `QUEUE_CONNECTION=redis`, `SESSION_DRIVER=redis` (sessions unused by the token API), `REDIS_CLIENT=phpredis`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_PREFIX` (distinct per environment), `REDIS_QUEUE_RETRY_AFTER=900`, `REDIS_CACHE_DB`, `REDIS_DB`.

**Configuration steps:** set the variables; `config:cache`; start `queue` and `scheduler`; confirm the heartbeat.

**Verification command:**
```
docker compose --env-file deploy/env/stack.env -f docker-compose.prod.yml exec redis sh -c 'REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli ping'
artisan tinker --execute='Cache::put("expa:redis-check", "ok", 30); echo config("cache.default")." ".Cache::get("expa:redis-check")." queue=".config("queue.default");'
scripts/monitor.sh        # scheduler_age_s must be < 180 once the scheduler runs
```
**Expected result:** `PONG`; `redis ok queue=redis`; `scheduler_age_s` small. Note: `GET /admin/stats` `system.pending_queue_jobs` counts the SQL `jobs` table only and reads 0 under the redis queue; use `scripts/monitor.sh` (`queue_pending` via `REDIS_CLI`) instead.

---

## 8. Monitoring and error tracking

**BLOCKER:** BLOCKED_INFRASTRUCTURE. No uptime service, alerting channel or error tracker. There is **no Sentry/OpenTelemetry integration in the code** (no package in `composer.json` or `web/package.json`, no config key): the "optional env" is therefore a proposal, not an existing variable.

**Required account/service:** an uptime monitor (any), an alert channel (email/Slack), a log collector or the Docker log driver, optionally an error tracker with PII scrubbing (decision recorded in LAUNCH_QUEUE). Implemented probes: `scripts/healthcheck.sh` (public), `scripts/monitor.sh` (failed jobs, redis queue depth, scheduler heartbeat age, disk), `GET /api/v1/admin/stats` (`system.failed_queue_jobs`, `system.scheduler_heartbeat_at`, needs `reports.view`).

**Required credentials:** monitor/alert account tokens; error-tracker DSN if chosen (secret).

**Environment variables:** none exist today. Proposal if adopted: `SENTRY_LARAVEL_DSN` (+ `sentry/sentry-laravel`) and `NUXT_PUBLIC_SENTRY_DSN`, with `send_default_pii=false` and a `before_send` scrubber; must be added to ENVIRONMENT.md in the same change. Log level: `LOG_LEVEL=warning`.

**Configuration steps:** point the uptime monitor at `https://<api>/api/v1/health` and `https://<web>/` (1 min, 2 failures); install `deploy/cron/expa.cron` probes; route non-zero exits to the alert channel; certificate-expiry and disk alerts at the host level (thresholds in OPERATIONS.md).

**Verification command:**
```
API_URL=https://api.example.com WEB_URL=https://www.example.com scripts/healthcheck.sh; echo "exit=$?"
EXPA_COMPOSE="docker compose --env-file deploy/env/stack.env -f docker-compose.prod.yml" scripts/monitor.sh; echo "exit=$?"
```
Alert test: stop the scheduler container for 4 minutes, `monitor.sh` must exit 1 with `scheduler_age_s>180`; insert nothing into `failed_jobs`, instead run a job that throws on staging and see `failed_jobs=1`.
**Expected result:** healthy stack prints `ok` lines and exit 0 / `failed_jobs=0`, small `scheduler_age_s`, exit 0. (Run locally without Docker: `healthcheck.sh` returned `ok` for api-health, api-up and web against the dev servers, and exit 2 with `FAIL ... unreachable` for a closed port; `monitor.sh` returned exit 1 because no scheduler runs locally.)

---

## 9. Tesseract OCR (document explainer) — T-072

**BLOCKER:** BLOCKED_INFRASTRUCTURE. The stock `backend/Dockerfile` installs neither `tesseract-ocr` nor `poppler-utils`; with `OCR_DRIVER=tesseract` the binding silently falls back to `NullOcrEngine` when the binary is missing (users paste text instead). Preflight warns `ocr_null` while `null`. Adding the packages means editing `backend/Dockerfile` (`apk add tesseract-ocr tesseract-ocr-data-ita tesseract-ocr-data-eng tesseract-ocr-data-ara poppler-utils`), which is outside this infrastructure task and needs a backend owner; image size grows by roughly 100 MB.

**Required account/service:** the binaries inside the api container (queue workers do not run OCR; it is request-time). No account.

**Required credentials:** none.

**Environment variables:** `OCR_DRIVER=tesseract`, `OCR_LANGUAGES=ita+eng+ara`, `OCR_TESSERACT_BINARY`, `OCR_PDFTOTEXT_BINARY`, `OCR_PDFTOPPM_BINARY` (only if not on PATH), `OCR_TIMEOUT_SECONDS=25`, `OCR_TEMP_DIR`, `EXPLAIN_MAX_*`.

**Configuration steps:** rebuild the image with the packages; set the variables; `config:cache`.

**Verification command:**
```
tesseract --list-langs        # inside the container: must list ara, eng, ita
OCR_DRIVER=tesseract artisan tinker --execute='echo get_class(app(App\Domains\Documents\Contracts\OcrEngine::class));'
```
Then `GET /api/v1/documents/explain/usage` as a user (`ocr_available`) and upload a photographed letter.
**Expected result:** the class is `App\Domains\Documents\Explainer\TesseractOcrEngine` (run locally on the authoring Mac, where Homebrew tesseract and pdftotext exist, this printed `TesseractOcrEngine`; `NullOcrEngine` means the binary was not found); `ocr_available:true`; the extracted text is shown for review before any AI call. Accuracy on real Arabic/Italian photos is unmeasured.
