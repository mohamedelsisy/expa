#!/usr/bin/env bash
# Roll back to a previous image tag (code only; the database is NOT rolled back automatically).
#   EXPA_COMPOSE="..." scripts/rollback.sh <previous-sha>   (after setting API_IMAGE/WEB_IMAGE in stack.env to <previous-sha>)
# Schema: migrations are additive by policy, so the previous code runs on the new schema. If a migration was destructive or the
# data is corrupt, restore with scripts/restore-db.sh into a NEW database, verify, then switch DB_DATABASE (docs/OPERATIONS.md).
source "$(dirname "$0")/lib.sh"
: "${EXPA_COMPOSE:?}"; sha="${1:?previous git sha}"
log "rolling back to $sha"
$EXPA_COMPOSE pull api web
$EXPA_COMPOSE up -d --no-deps queue scheduler api web
for i in $(seq 1 30); do $EXPA_COMPOSE exec -T api php -r 'exit(@fsockopen("127.0.0.1",9000)?0:1);' && break; sleep 2; done
artisan config:cache; artisan route:cache; artisan queue:restart
[ -n "${API_URL:-}" ] && "$ROOT/scripts/healthcheck.sh"
log "rollback to $sha complete"
