# EXPA — Deployment Guide

Status: **artifacts written and syntax-checked; not executed** (Docker is not available in the authoring environment). First real deployment must be treated as the verification step.

## Environments
| | local | staging | production |
|---|---|---|---|
| `APP_ENV` | local | staging | production |
| DB | SQLite/MariaDB/docker mysql | MySQL 8 (managed) | MySQL 8 (managed, backups + PITR) |
| Cache/queue | array / sync OK | Redis | Redis (or DB queue) + supervised worker |
| Mail | log / Mailpit | real SMTP sandbox | real provider (SPF/DKIM/DMARC) |
| AI | `AI_DRIVER=fake` | anthropic (low quota) | anthropic |
| Billing | none/fake | provider test mode | provider live |
Config is environment variables only (`backend/.env.example`, `web/.env.example`). Production secrets come from a secret manager; nothing secret is committed (CI runs gitleaks).

## Topology
`nginx → php-fpm (api)` · `queue worker` · `scheduler (cron every minute: php artisan schedule:run)` · `MySQL` · `Redis` · `Nuxt (node) → API` (BFF). Docker images: `backend/Dockerfile`, `web/Dockerfile`; reference stack: `docker-compose.yml` (local/staging parity only).

## Required runtime settings (enforced by `php artisan expa:preflight --production`, run it in the pipeline; it exits non-zero on blockers)
- `APP_DEBUG=false`, `APP_KEY` set, `APP_URL` = https origin of the API **as reachable by the web BFF** (verification links are built from it and the BFF only follows links whose origin equals `API_BASE_URL`; T-033), `FRONTEND_URL` https.
- `QUEUE_CONNECTION=redis|database` with a running worker (imports, erasure, notifications are queued); `CACHE_STORE=redis` (rate limiting needs a shared store).
- `AI_DRIVER=anthropic` + `ANTHROPIC_API_KEY`; `DOCUMENTS_SCANNER` bound to a real scanner (T-030: heuristics only today); `JOBS_SSRF_DNS_CHECK=true`; `BILLING_PROVIDER` ≠ `fake`.
- `APP_TIMEZONE=Europe/Rome` (reminder days, scheduler).
- Cron: `* * * * * php artisan schedule:run` (reminders 08:00, job imports hourly/6 h per source, expiry, retention pruning, billing expiry, scheduled publishing every 5 min).

## Release procedure
1. CI green (backend SQLite + MySQL, web tests/typecheck/build, audits, secret scan).
2. Build images, tag with the git SHA.
3. `php artisan down --retry=30` (optional for breaking migrations) → deploy → `php artisan migrate --force`.
4. `php artisan expa:sync-access` (roles/permissions), `php artisan db:seed --class=GeographySeeder --class=DocumentTypeSeeder` on first deploy only; `PlanSeeder` once (it never overwrites edited plans).
5. `php artisan config:cache route:cache event:cache view:cache`; restart workers (`queue:restart`).
6. `php artisan expa:ai-reindex` and `php artisan expa:search-reindex` after content-affecting releases or restores.
7. `php artisan up`; smoke test `GET /api/v1/health`, `GET /up`, login, `GET /api/v1/guides`.
8. First admin: register normally, then `php artisan expa:make-admin you@example.com`.

## Rollback
Redeploy the previous image tag. Migrations are additive; destructive migrations need a dedicated plan. Restore DB from backup only for data corruption. Re-run step 6 after any restore (indexes are derived data).

## Backups & retention
Daily DB snapshot + PITR; the private `documents` disk (encrypted files) is backed up with the same retention as the DB. Retention jobs: audit logs 24 months, AI messages 12 months (`expa:prune-*`). GDPR erasure also needs a policy for backups (erased users must not be restored: re-run erasure after restore from the erasure audit trail).

## Monitoring (recommended)
Uptime on `/up` and `/api/v1/health`; queue depth + failed jobs (`GET /api/v1/admin/stats` → `system`); error tracking (Sentry/Flare) with PII scrubbing; alert on: failed jobs > 0, job-source auto-deactivation notifications, 5xx rate, p95 latency, disk usage of `storage`, certificate expiry.

## Known blockers before launch
See TASKS.md BLOCKED items: LLM key (T-019), FCM (T-016b), payment provider (T-038), job feeds (T-036), patente content/rules (T-035), curriculum review (T-034), legal texts (privacy/cookies/terms), real antivirus scanner.
