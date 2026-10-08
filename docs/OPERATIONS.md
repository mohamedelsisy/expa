# EXPA — Operations runbooks

Status 2026-10-08. Written for the compose deployment (DEPLOYMENT.md); for supervisor/systemd hosts replace `$C exec -T api php artisan` with `php artisan` in `/srv/expa/current/backend`. None of these procedures has been executed on a real host; the backup/restore scripts were exercised against a throwaway MariaDB (see "Restore drill").

Shorthand used below:
```
C="docker compose --env-file deploy/env/stack.env -f docker-compose.prod.yml"      # staging: add -f docker-compose.staging.yml
A="$C exec -T api php artisan"
```
Severity: SEV1 = users cannot log in / data loss / security; SEV2 = a feature is down; SEV3 = degraded. First response target is a decision for the owner, not an SLA promise.

## Monitoring plan

| Signal | How | Alert when | Source |
|---|---|---|---|
| API up | uptime monitor on `https://<api>/api/v1/health` (+ `/up`) every 1 min | 2 consecutive failures | `scripts/healthcheck.sh` |
| Web up | uptime monitor on `https://<web>/` (200/30x) | 2 consecutive failures | `scripts/healthcheck.sh` |
| Certificate expiry | monitor or `openssl s_client ... -enddate` | < 21 days | host / monitor |
| Queue depth | `queue_pending` (`LLEN <REDIS_PREFIX>queues:default`) | > 500 for 10 min | `scripts/monitor.sh` with `REDIS_CLI` |
| Failed jobs | `failed_jobs` table count | > 0 | `scripts/monitor.sh`; also `GET /api/v1/admin/stats` `system.failed_queue_jobs` |
| Scheduler heartbeat | cache key `scheduler:heartbeat` age | > 180 s | `scripts/monitor.sh`; `admin/stats` `system.scheduler_heartbeat_at` |
| Disk | `df` of the volume holding `storage` and the DB volume | > 85% | `scripts/monitor.sh` (storage only; add the DB volume at host level) |
| Error rate / latency | edge `access.log` (`rt=`, `urt=`, status) | 5xx > 2% for 5 min; p95 > 1 s | log collector (not provisioned) |
| Redis memory | `redis-cli info memory` | used > 70% of `maxmemory` | host agent (not provisioned) |
| Job source health | `GET /admin/stats` `jobs.failing_sources`, admin notifications | > 0 | admin UI |
| AI cost | `AI_DAILY_TOKEN_BUDGET` breaker, `GET /admin/ai/usage` | usage > 80% of budget | admin UI |
| ClamAV | container health; admin in-app alert `scanner_unavailable` | unhealthy > 5 min | compose health |
| Backups | newest file in `$BACKUP_DIR/db/daily` | older than 26 h | add a cron `find ... -mmin` check |

Caveats found while writing this plan: (1) `GET /admin/stats` `pending_queue_jobs` counts the SQL `jobs` table, so it is always 0 with `QUEUE_CONNECTION=redis`: alert on Redis `LLEN` instead (the key name `<prefix>queues:default` follows Laravel's convention and must be confirmed on staging). (2) There is no error tracker or metrics exporter in the code (EXTERNAL_SERVICES.md section 8). (3) Nothing sends the alerts: wire the exit codes of `monitor.sh`/`healthcheck.sh` into the chosen channel.

## Deploy

Automated: `EXPA_COMPOSE="$C" API_URL=https://<api> WEB_URL=https://<web> scripts/deploy.sh <sha>` after setting `API_IMAGE`/`WEB_IMAGE` in `deploy/env/stack.env` to the new tag (CI has built and pushed them).

Manual steps and reasons:
1. CI green; images tagged with the git SHA; note the currently running tags (needed for rollback): `$C images`.
2. `$C pull api web`.
3. Gate: `EXPA_COMPOSE="$C" scripts/preflight.sh`. A non-zero exit stops the release.
4. Backup (`scripts/backup-db.sh`; env as in "Backups"). Required before any release with migrations.
5. Migrate with the NEW image before it serves traffic: `$C run --rm --no-deps -T api php artisan migrate --force`. Migrations must be additive/backward compatible (old code keeps running while new code deploys and after a rollback). Destructive changes (drop/rename) ship in a later release after the code stopped using the column.
6. `$A expa:sync-access` (roles/permissions are code-defined).
7. Roll workers first, then api, then web: `$C up -d --no-deps queue scheduler`, `$C up -d --no-deps api`, `$A config:cache && $A route:cache && $A event:cache && $A view:cache`, `$A queue:restart`, `$C up -d --no-deps web`, `$C exec edge nginx -s reload`.
8. Verify: `scripts/healthcheck.sh`; manual login; `GET /api/v1/guides`; `scripts/monitor.sh` (failed_jobs 0).
9. Content-affecting releases: `$A expa:ai-reindex` and `$A expa:search-reindex`.

Maintenance mode for a risky migration: `$A down --retry=30` then `$A up` (the maintenance store is Redis in the prod template, so every container sees it).
Zero-downtime reality: see DEPLOYMENT.md "Regular release". A rolling replacement with two api replicas has not been tested.

## Rollback

Trigger: health check fails after deploy, error rate spikes, or a migration misbehaves.
1. Set `API_IMAGE`/`WEB_IMAGE` back to the previous tags (step 1 of Deploy). 2. `scripts/rollback.sh <previous-sha>` (pull, recreate queue/scheduler/api/web, rebuild caches, `queue:restart`, health check). 3. The schema stays migrated; this is safe only because migrations are backward compatible. If a migration is the culprit and is not backward compatible: do NOT run `migrate:rollback` blindly in production; restore (below) into a new database and switch `DB_DATABASE`.
4. Record the incident (section Incident).

## Key rotation

| Secret | Procedure | Notes |
|---|---|---|
| `APP_KEY` | NOT a casual rotation: it encrypts documents, messages, profile fields and keys the audit/consent HMACs. Procedure: put the old key in `APP_PREVIOUS_KEYS` (comma separated), set the new `APP_KEY`, deploy, keep the old key until all data is re-encrypted. A bulk re-encrypt command does not exist (WONTFIX BE-35), so the old key must be kept indefinitely; back up both keys in the secret manager. Existing API tokens are unaffected (database tokens). | Rehearse on staging with a copy of the data first. |
| `ANTHROPIC_API_KEY` | create new key, update secret, `$C up -d --no-deps api queue` (or `config:cache` + `queue:restart`), verify (EXTERNAL_SERVICES.md section 1), revoke old. | no downtime |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | roll the key in Stripe, set the webhook secret to `new,old` (comma separated), deploy, then remove `old` after the old endpoint secret expires. | the app accepts several webhook secrets |
| DB password | create the new password on MySQL, update `DB_PASSWORD` (and `MYSQL_PASSWORD` for the compose db), restart api/queue/scheduler together. | brief errors |
| `REDIS_PASSWORD` | update `redis.env` and `api.env`, restart redis then api/queue/scheduler. Queue content survives (AOF) but cached rate-limit state resets. | |
| SMTP / FCM credentials | replace secret/file, `config:cache`, `queue:restart`, send the test in EXTERNAL_SERVICES.md. | |
| Backup passphrase | new passphrase file, run a fresh backup; keep the old passphrase until the last backup encrypted with it ages out (14 days daily, 12 months monthly) or re-encrypt the monthlies. | losing it makes the backups useless |
| TLS certificate | renew (certbot) then `$C exec edge nginx -s reload`. | |
Token revocation for a compromised user: `POST /api/v1/auth/logout-all` (user) or admin account suspension.

## Backups

Env file (root-only, e.g. `/etc/expa/backup.env`, never in git): `DB_HOST DB_PORT DB_DATABASE DB_USERNAME DB_PASSWORD BACKUP_DIR BACKUP_PASSPHRASE_FILE` (+ optional `KEEP_DAILY=14 KEEP_WEEKLY=8 KEEP_MONTHLY=12`, `BACKUP_REMOTE`, `DUMP_BIN`). For the compose database use `DB_DOCKER_EXEC="$C exec -T db"` and run the dump client inside the container.
- Database: `scripts/backup-db.sh` (mysqldump `--single-transaction --routines --triggers --events`, gzip, AES-256-CBC with PBKDF2 and a passphrase file that must be mode 600, SHA-256 file, directories mode 700, daily + Sunday weekly + 1st-of-month monthly, count-based retention, optional rclone offsite). Schedule with `deploy/systemd/expa-backup.timer` or cron.
- Documents: `scripts/backup-documents.sh` (tar of the private documents disk, encrypted again; `DOCUMENTS_DOCKER_EXEC="$C exec -T api"` streams from the volume; retention `KEEP_DOCS=14`). The files are already encrypted by the app with `APP_KEY`: back up `APP_KEY` separately.
- Managed MySQL: also enable the provider's PITR; these scripts are the portable, provider-independent copy.
- Redis (AOF) is not a backup target: queue contents are transient; losing them loses pending jobs only (reminders are re-derivable by the scheduler).
- ClamAV signatures are re-downloaded; nothing to back up.

## Restore drill (run quarterly and before launch)

1. Pick the newest `daily` file and its `.sha256`. 2. Restore into a NEW database, never the live one: `DB_USERNAME=... BACKUP_PASSPHRASE_FILE=... LIVE_DATABASE=expa scripts/restore-db.sh <file>.sql.gz.enc expa_restore_drill` (verifies the checksum, decrypts, creates the database; refuses the live name unless `RESTORE_ALLOW_PRODUCTION=1` and `--yes-overwrite`). 3. Point a staging api at `expa_restore_drill`, run `php artisan migrate --force` if the code is newer than the dump. 4. Verify: row counts of `users`, `user_documents`, `guides`, `audit_logs` vs production; log in; open a document attachment (proves `APP_KEY` + documents backup match). 5. `expa:ai-reindex`, `expa:search-reindex` (derived data). 6. Replay erasures: every erased user after the backup timestamp must be erased again (list from `audit_logs`, erasure events), otherwise erased people return. 7. Record date, backup used, elapsed time (RTO) and data loss window (RPO) in the drill log; drop the drill database.
Exercised so far (2026-10-08, throwaway MariaDB on a scratch port, not the app schema): backup, checksum, decrypt, restore of an Arabic/Italian text table, tamper rejection, refusal to overwrite the live name, retention pruning (kept 2 of 4 with `KEEP_DAILY=2`), file modes 700/600. The weekly/monthly branches, the document restore (no restore script for documents yet: `openssl enc -d ... | tar -xz -C <dir>`), `DB_DOCKER_EXEC` and `BACKUP_REMOTE` paths were not exercised. Timing numbers were not collected.

## Incident procedure

1. Declare severity and one incident lead; open a timeline (UTC). 2. Stabilise first: roll back (above), disable a feature (`COMMUNITY_ENABLED=false`, `BILLING_PROVIDER=none`, `AI_DRIVER` is not to be switched to `fake` in production because preflight forbids it: use the degraded answer path by revoking the key), or enable maintenance mode. 3. Preserve evidence: `$C logs --since 2h > incident.log`, edge `access.log`, `audit_logs` export; do not delete data. 4. Security incidents: rotate the affected secrets (Key rotation), revoke tokens (`DELETE FROM personal_access_tokens` only on the owner's decision; it logs out everyone), review the audit trail. 5. Personal-data breach: the controller must decide within 72 hours whether to notify the Garante (GDPR art. 33); counsel involvement is a LAUNCH_QUEUE item (BLOCKED_LEGAL), the repo has no breach procedure text yet. 6. Communicate status to users in ar/en/it (status page not provisioned). 7. Post-mortem within 5 working days: cause, detection gap, action items into TASKS.md.

## Runbook: queue stuck or growing

Symptoms: `queue_pending` rising, emails/reminders/exports not arriving, `failed_jobs` > 0.
1. `$C ps queue` (restarting?) and `$C logs --tail=200 queue`. 2. Worker alive but idle: `$A queue:restart` then `$C restart queue`. 3. Redis reachable? `$C exec redis sh -c 'REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli ping'`; memory `info memory` (with `noeviction` a full Redis rejects writes: raise `maxmemory` or clear expired cache keys, never flush the queue DB). 4. A poison job: `$A queue:failed`; inspect, fix cause, `$A queue:retry <uuid>` (or `queue:retry all` after a provider outage); permanently bad: `$A queue:forget <uuid>`. 5. A job running longer than 600 s is killed by `--timeout=600`; `REDIS_QUEUE_RETRY_AFTER=900` must stay above it or jobs run twice. 6. Backlog after downtime: add a second worker temporarily (`$C up -d --scale queue=2`, then back to 1) — jobs are idempotent per their tests, but confirm for imports. 7. Verify: `scripts/monitor.sh` shows pending falling, `failed_jobs=0`.

## Runbook: scheduler stopped

Symptoms: `scheduler_age_s` > 180 or `none`; reminders not sent at 08:00; job imports stale.
1. `$C ps scheduler`; `$C logs --tail=100 scheduler`. 2. Restart: `$C restart scheduler`. 3. Heartbeat check: `$A tinker --execute="echo Cache::get('scheduler:heartbeat');"`; it must be within a minute. 4. If Redis cache is unreachable the heartbeat cannot be written: fix Redis first. 5. Missed work: reminders for today run when the scheduler is back only if before the day ends (`expa:send-reminders` is daily 08:00; run it manually: `$A expa:send-reminders` — reminders use outbox semantics, so repeating is safe by design but check `notifications` for duplicates after the first run); imports: `$A expa:jobs-import`; publishing: `$A expa:publish-scheduled`; billing: `$A expa:billing-expire`. 6. Make sure only ONE scheduler exists (container or cron, not both).

## Runbook: antivirus (ClamAV) down

Behaviour is fail-closed: uploads return 503 `scanner_unavailable`, nothing is stored, admins are alerted at most hourly; everything else works.
1. `$C ps clamav` / `$C logs --tail=100 clamav`. Common causes: signature download in progress after (re)start (`start_period` 180 s), out of memory (the 2 GB limit), network egress blocked for freshclam. 2. `$C restart clamav`, wait for `healthy`. 3. Test with the commands in EXTERNAL_SERVICES.md section 5 (EICAR must be `malware_detected`, clean file `NULL`). 4. **Never** set `CLAMAV_FAIL_CLOSED=false` or `DOCUMENTS_SCANNER=basic` in production (preflight errors; it removes the only malware control). If uploads must stay off for longer, say so in the status message to users.

## Runbook: LLM (Anthropic) down or over budget

Behaviour: the assistant returns the localized degraded answer with a search alternative and refunds the user's quota; no 5xx for users; prompts are never logged.
1. Confirm: status page of the provider; run the tinker check in EXTERNAL_SERVICES.md section 1 (exception class and HTTP status are logged without content). 2. 401/403: key revoked or wrong: rotate (Key rotation). 429 or budget: `AI_DAILY_TOKEN_BUDGET` reached (resets at midnight Europe/Rome) — raise it deliberately after checking `GET /admin/ai/usage`, or wait. 3. Timeouts: `AI_TIMEOUT_SECONDS=20`, `AI_RETRIES=2` already bound the user wait (up to about 60 s worst case; BE-36 accepted the synchronous call); do not raise them during an outage. 4. Do not switch the driver to `fake` (preflight error, and it would present scripted text as an answer). 5. After recovery run a sourced question in ar/en/it.

## Runbook: payment webhook failures

Only relevant once `BILLING_PROVIDER=stripe`.
1. Symptoms: payments succeed at the provider but subscriptions stay inactive; Stripe dashboard shows failed deliveries. 2. Check the edge: `grep billing/webhook` in `access.log` for status codes. 400/401-class means signature failure: `STRIPE_WEBHOOK_SECRET` wrong (test vs live, or after rotation — it accepts `new,old`), or the request body was altered by a proxy (do not add body-modifying middleware in front of the endpoint). 429 means the app limiter (`billing-webhook`, 120/min/IP) hit: unlikely; check for a replay storm. 5xx: look at api logs and `failed_jobs`. 3. Clock skew: signature tolerance is 300 s (`STRIPE_WEBHOOK_TOLERANCE`); check NTP on the host. 4. Redeliver: Stripe dashboard "resend" per event, or `stripe events resend <evt_id> --webhook-endpoint=<we_id>`; handlers are expected to be idempotent (covered by tests with fixtures, not by a live run). 5. Reconcile after an outage: compare Stripe subscriptions with `GET /api/v1/admin/...` billing views; a missing `invoice.paid` leaves a subscription `past_due` until redelivered; `expa:billing-expire` only expires subscriptions whose paid period ended. 6. If broken for long, set `BILLING_PROVIDER=none` to stop new checkouts (existing subscriptions are untouched) and tell the owner.

## Runbook: disk full

`df -h`; large consumers: `storage/logs` (check `LOG_DAILY_DAYS`), Docker (`docker system df`; `docker image prune` removes dangling images only), MySQL binlogs (`--binlog-expire-logs-seconds=604800`), old backups (retention), ClamAV volume. Free space before restarting services; MySQL on a full disk can corrupt: stop writes first.

## Redis guidance

Single instance, three uses: cache (db 1), queue (db 0), sessions (unused by the token API). `appendonly yes`, `maxmemory-policy noeviction`, 384 MB in `docker/redis/redis.conf`: size to peak queue length x job size + cache + 50% headroom; a cache that cannot evict will fill up, so keep TTLs on cache keys (the app does; rate-limit keys expire). Password required; not published to the host. Prefix per environment (`REDIS_PREFIX`) when sharing an instance, but staging should have its own. For HA use the provider's managed Redis (failover): `REDIS_CLIENT=phpredis` retries (`REDIS_MAX_RETRIES`, backoff variables) are configured in `config/database.php`.

## Storage disks

`local` (private, `storage/app/private`), `documents` (private, encrypted, never served), `public` (`storage/app/public`, unused by the API contract), `s3` (defined in `config/filesystems.php`, configured by `AWS_*` variables, optional). Uploaded user documents are pinned to the `documents` local disk; moving them to S3-compatible storage needs a code change (new disk driver config and a migration plan for existing files) — not scheduled. Use S3 for offsite backups through rclone (`BACKUP_REMOTE`).

## Log rotation

Containers log to stderr; Docker json-file rotates at 20 MB x 5 per container (compose `logging`). Laravel `daily` channel files rotate by date with `LOG_DAILY_DAYS=14`. Host files (supervisor logs, nginx on bare metal, backup logs): `deploy/logrotate/expa`. Logs must not contain personal data or prompts (tested for the AI path); keep retention aligned with the privacy policy (counsel decision pending).
