#!/usr/bin/env bash
# Rolling deploy for the compose stack (single host). Gate -> migrate -> roll -> verify. See docs/OPERATIONS.md "Deploy".
#   EXPA_COMPOSE="docker compose --env-file deploy/env/stack.env -f docker-compose.prod.yml" \
#   API_URL=https://api.example.com WEB_URL=https://www.example.com  scripts/deploy.sh <git-sha>
# Prereqs: images <sha> already built and pushed by CI; deploy/env/stack.env API_IMAGE/WEB_IMAGE are updated to <sha> by the caller
# (this script does not edit env files). Migrations MUST be backward compatible with the previous release (expand/contract),
# because old and new containers overlap for a few seconds and rollback re-runs the old image on the migrated schema.
# Honest limit: on ONE host the api container is replaced in place (php-fpm drains in-flight requests, then restarts):
# expect a few seconds of 502 on the API; true zero downtime needs two api replicas behind the edge/LB (see runbook).
source "$(dirname "$0")/lib.sh"
: "${EXPA_COMPOSE:?set EXPA_COMPOSE}"; : "${API_URL:?}"; sha="${1:?git sha (for the log only)}"
log "deploy $sha: pulling images"; $EXPA_COMPOSE pull api web
log "gate 1/4: preflight with the NEW image and the live environment"; "$ROOT/scripts/preflight.sh"
log "gate 2/4: database backup before migrating"
[ -z "${SKIP_BACKUP:-}" ] && "$ROOT/scripts/backup-db.sh" || log "backup skipped (SKIP_BACKUP set)"
log "step 3/4: migrate"; artisan_run migrate --force
artisan_run expa:sync-access
log "step 4/4: roll containers"
$EXPA_COMPOSE up -d --no-deps queue scheduler      # workers first: they restart with the new code (old jobs finish: stop_grace_period)
$EXPA_COMPOSE up -d --no-deps api
for i in $(seq 1 30); do $EXPA_COMPOSE exec -T api php -r 'exit(@fsockopen("127.0.0.1",9000)?0:1);' && break; sleep 2; done
artisan config:cache; artisan route:cache; artisan event:cache; artisan view:cache
artisan queue:restart
$EXPA_COMPOSE up -d --no-deps web
$EXPA_COMPOSE exec -T edge nginx -s reload || true
log "verify"; API_URL="$API_URL" WEB_URL="${WEB_URL:-}" "$ROOT/scripts/healthcheck.sh" || { log "HEALTH FAILED: roll back (docs/OPERATIONS.md#rollback)"; exit 1; }
log "deploy $sha done. Remaining manual steps: smoke test login, GET /api/v1/guides; expa:ai-reindex / expa:search-reindex if content changed."
