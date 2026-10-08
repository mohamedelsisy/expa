# EXPA — Deployment Guide

Status 2026-10-08: **artifacts written and statically validated; never executed.** Docker is not installed in the authoring environment, so `docker compose config`, image builds and `nginx -t` were NOT run (see "Validation performed"). The first staging deployment is the real verification step. Day-2 procedures are in OPERATIONS.md; external services in EXTERNAL_SERVICES.md; variables in ENVIRONMENT.md.

## Files

| Path | Purpose |
|---|---|
| `docker-compose.yml` | local / parity stack (builds from source, Mailpit, fake AI). Unchanged semantics. |
| `docker-compose.prod.yml` | production shape: edge nginx (TLS), api (php-fpm), queue, scheduler, web, mysql, redis, clamav. Pulls images, no `build:`. |
| `docker-compose.staging.yml` | OVERRIDE on top of prod: adds Mailpit, smaller limits, project name `expa-staging`. |
| `docker/nginx/` | `nginx.conf` (http context, gzip, rate-limit zones), `default.conf.template` (API + web vhosts, rendered with `API_HOST`/`WEB_HOST`), `fastcgi.conf`, `snippets-security.conf`. `docker/nginx.conf` is the local compose's config (untouched). |
| `docker/php/`, `docker/redis/` | php.ini and php-fpm pool overrides; redis.conf (AOF, noeviction). |
| `deploy/env/*.example` | env templates (api, api.staging, web, web.staging, db, redis, stack). Real files are git-ignored (`deploy/env/.gitignore`). |
| `deploy/supervisor`, `deploy/systemd`, `deploy/cron`, `deploy/logrotate` | non-Docker equivalents for workers, scheduler, backups, probes, log rotation. |
| `scripts/` | `preflight.sh`, `deploy.sh`, `rollback.sh`, `healthcheck.sh`, `monitor.sh`, `backup-db.sh`, `backup-documents.sh`, `restore-db.sh`, `check-env-docs.sh`, `validate-compose.rb`. |

## Environments

| | local | staging | production |
|---|---|---|---|
| Compose | `docker-compose.yml` or `artisan serve` | prod + staging override | prod |
| `APP_ENV` | local | staging | production |
| DB | SQLite / MariaDB / compose mysql | MySQL 8 (compose or managed), own schema | MySQL 8 managed with backups + PITR (preferred) |
| Cache / queue | file or database / sync OK | Redis | Redis (`noeviction`, AOF) + supervised worker |
| Mail | log / Mailpit | Mailpit (caught), optional provider sandbox | real provider, SPF/DKIM/DMARC |
| AI | `fake` | anthropic, low-quota key | anthropic with spend limit and `AI_DAILY_TOKEN_BUDGET` |
| Billing | none / fake | provider test mode | `none` until launch decision, then live |
| Antivirus | `basic` | clamd | clamd (`CLAMAV_FAIL_CLOSED=true`) |
| Secrets | `.env` (git-ignored) | separate staging secrets | secret manager; never shared with staging |

## Topology (compose)

```
Internet :80/:443 -> edge (nginx: TLS, headers, gzip, rate limit, 12m uploads)
   api.<domain> -> fastcgi -> api (php-fpm :9000)          queue (queue:work)  scheduler (schedule:work)
   www.<domain> -> proxy   -> web (node :3000) --BFF--> https://api.<domain> (alias to edge inside the network)
backend network 172.28.0.0/16: db (mysql) . redis . clamav . api . queue . scheduler . web . edge
```
- The edge exposes only `/api/*` and `/up` on the API host (everything else 404). The front controller is fixed in `fastcgi.conf`, so the edge needs no copy of `backend/public`.
- `TRUSTED_PROXIES=172.28.0.0/16` (the fixed compose subnet) lets the API honour `X-Forwarded-For` appended by the edge and by the BFF; `NUXT_TRUSTED_PROXY_HOPS=1` for the edge. If an outer CDN/LB sits in front, add its CIDRs and enable `set_real_ip_from` in `docker/nginx/nginx.conf`.
- `NUXT_API_BASE_URL` must equal the origin of `APP_URL` (verification links; T-033). The edge carries a network alias equal to `API_HOST`, so the BFF reaches the API through the same public name.
- Brotli: the stock nginx image has no brotli module; gzip is enabled and Nuxt serves pre-compressed assets. Add brotli at the CDN or build an nginx image with the module if wanted.
- Managed MySQL/Redis: delete the `db`/`redis` services, set `DB_HOST`/`REDIS_HOST`, enable TLS (`MYSQL_ATTR_SSL_CA`), keep Redis eviction at `noeviction`.

## First deployment (staging, then production)

1. DNS for `API_HOST` and `WEB_HOST`; certificates in `${CERTS_DIR}/<host>/{fullchain.pem,privkey.pem}` (certbot webroot is `/var/www/acme` in the `acme` volume; or provider certs).
2. `cp deploy/env/*.example` to the real names (staging: the `*.staging.env.example` variants copied to `api.env` / `web.env` on the staging host); fill from the secret manager; `chmod 600 deploy/env/*.env`. Never reuse production secrets in staging.
3. Static validation on the host: `docker compose --env-file deploy/env/stack.env -f docker-compose.prod.yml [-f docker-compose.staging.yml] config -q`; `docker run --rm -v $PWD/docker/nginx:/c nginx:1.27-alpine nginx -t` is not enough alone (templates are rendered at start): after `up`, run `docker compose ... exec edge nginx -t`.
4. `docker compose ... up -d db redis clamav`, wait for `healthy`.
5. `EXPA_COMPOSE="docker compose --env-file deploy/env/stack.env -f docker-compose.prod.yml" scripts/preflight.sh` until no ERROR (warnings reviewed; `--strict` fails on warnings).
6. `docker compose ... up -d` then `artisan migrate --force`, `artisan expa:sync-access`, first time only: `artisan db:seed --class=GeographySeeder --force`, `--class=DocumentTypeSeeder`, `--class=PlanSeeder`; then `artisan config:cache route:cache event:cache view:cache`.
7. First admin: register in the web app, then `artisan expa:make-admin you@example.com`.
8. `artisan expa:ai-reindex` and `artisan expa:search-reindex` once content exists.
9. `scripts/healthcheck.sh`, smoke test (login, `GET /api/v1/guides`, upload a PDF to prove ClamAV), the proxy identity check below, install monitoring (OPERATIONS.md).

Proxy identity check (staging): fail login 6 times from client IP A (HTTP 429 on the sixth), then log in correctly from client IP B: must not be throttled. Fails if `TRUSTED_PROXIES` is wrong (all guests share one bucket).

## Regular release

`scripts/deploy.sh <git-sha>` runs: pull, preflight with the new image, DB backup, `migrate --force`, `expa:sync-access`, roll queue/scheduler, then api, rebuild caches, `queue:restart`, roll web, reload edge, health check. Details, limits and the manual variant: OPERATIONS.md "Deploy". Policy: **migrations must be backward compatible with the previous release** (add, then migrate data, then remove in a later release), because rollback re-runs the old image on the new schema.

Honest limit: on a single host the api container is recreated in place (php-fpm finishes in-flight requests, a few seconds of 502 are possible). "Zero downtime" requires two api replicas (`--scale api=2` with the edge resolving the service name per request, or two hosts behind a balancer) and was not tested.

## Rollback

`scripts/rollback.sh <previous-sha>` after pointing `API_IMAGE`/`WEB_IMAGE` at it. The database is not rolled back; restore from backup only for corruption, into a NEW database, verify, then switch `DB_DATABASE` (OPERATIONS.md). Re-run `expa:ai-reindex` / `expa:search-reindex` after any restore and replay erasures that happened after the backup.

## Required runtime settings (enforced by `php artisan expa:preflight --production`)

`APP_DEBUG=false`, `APP_KEY`, https `APP_URL`/`FRONTEND_URL`, explicit `CORS_ALLOWED_ORIGINS`, non-null token expiry, MySQL/MariaDB (not SQLite), non-sync queue and non-array cache, `AI_DRIVER≠fake`, `DOCUMENTS_SCANNER=clamav` with fail-closed, `DOCUMENTS_ENCRYPT=true`, delivering mailer, `BILLING_PROVIDER≠fake`, `JOBS_SSRF_DNS_CHECK=true`, `TRUSTED_PROXIES` when `BEHIND_PROXY=true`, `CONTENT_FOUR_EYES=true`. Warnings: push stub, cache/queue not Redis, log level, timezone, privacy policy draft, OCR null, teacher review off, community without moderator, AI budget 0. `APP_TIMEZONE=Europe/Rome` (reminders and the scheduler).

## Scheduler

Exactly one scheduler: the `scheduler` container (`schedule:work`) **or** the cron line in `deploy/cron/expa.cron`, never both. It writes `scheduler:heartbeat` to the cache every minute (monitoring reads it). Tasks: reminders 08:00, job imports hourly (per-source interval), expiry, retention pruning, billing expiry, scheduled publishing every 5 minutes, search provider prune hourly.

## Storage and backups

The private `documents` disk is `storage/app/private/documents` on the `storage` volume (local driver only; `FILESYSTEM_DISK` does not affect it, there is no S3 switch for it). Application-level AES encryption with `APP_KEY` applies; `APP_KEY` custody is part of the backup plan (without it files and encrypted columns are unreadable). Scripts and drill: OPERATIONS.md. S3-compatible storage can be used as the **offsite backup target** (`BACKUP_REMOTE` via rclone).

## Validation performed (2026-10-08) and not performed

Performed: YAML parse + volume/network/depends_on cross-check of the three compose files (`scripts/validate-compose.rb`, Ruby/Psych); every `env()` key in `backend/config/*.php` and every key in `deploy/env/*.example` verified against ENVIRONMENT.md (`scripts/check-env-docs.sh`); `bash -n` on all scripts; backup, encrypted restore, checksum-tamper rejection, rotation, refusal to overwrite the live DB and an Arabic data round-trip exercised against a throwaway MariaDB; `healthcheck.sh` against the local dev servers; load smoke (LOAD_TESTING.md).
Not performed: `docker compose config` and any image build/run (no Docker), `nginx -t` (no nginx binary; the templates were reviewed by hand, duplicate-directive and nesting errors found and fixed), ClamAV/Redis/MySQL container health, TLS issuance, the deploy and rollback scripts end to end, php-fpm pool sizing under load, and every external service.

## Known blockers before launch

See LAUNCH_QUEUE.md (prioritised) and LAUNCH_CHECKLIST.md.

## Web (Nuxt) runtime environment

The web image contains no environment-specific values. Set these when the container starts (Nuxt only maps `NUXT_`-prefixed variables at runtime); templates `deploy/env/web.env.example`, `web.staging.env.example`:

| Variable | Required | Notes |
|---|---|---|
| `NUXT_API_BASE_URL` | yes | API origin reachable from the web server; equals the origin of the API's `APP_URL` (verification links). |
| `NUXT_PUBLIC_SITE_URL` | yes | Public https origin: canonical/hreflang/OG/sitemap/robots. |
| `NUXT_TRUSTED_PROXY_HOPS` | if proxied | Reverse proxies appending to `X-Forwarded-For` (1 for the edge). 0 ignores the header. |
| `NUXT_SECURITY_HSTS` | https | `true` sends `Strict-Transport-Security` and CSP `upgrade-insecure-requests`. |
| `NUXT_COOKIE_SECURE` | optional | `auto` (default), `true`, `false`. |
| `EXPA_ALLOW_LOCAL` | local only | `1` allows localhost origins in a production build. Never in staging/production. |

A production build refuses to boot if the two origins are empty or localhost.

Reverse proxy checklist (the edge config implements 1-4 and 6; validate on staging): (1) pass the original `Host` (the BFF's CSRF check compares `Origin` with `Host`/`X-Forwarded-Host`); (2) append the client IP with `$proxy_add_x_forwarded_for`, `NUXT_TRUSTED_PROXY_HOPS=1`, web subnet in the API's `TRUSTED_PROXIES`, `BEHIND_PROXY=true`; (3) `X-Forwarded-Proto $scheme`; (4) gzip for SSR HTML/JSON; (5) do not cache HTML at the edge (authenticated responses are `private, no-store`); (6) keep the app's security headers (CSP is not stripped) and add HSTS.
