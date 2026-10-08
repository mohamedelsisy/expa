# Shared helpers (sourced). No secrets are read or printed here.
# EXPA_COMPOSE: how to reach the stack, e.g.
#   EXPA_COMPOSE="docker compose --env-file deploy/env/stack.env -f docker-compose.prod.yml"
# When empty, commands run against the local checkout (php backend/artisan), which is how CI and the smoke tests use them.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXPA_COMPOSE="${EXPA_COMPOSE:-}"

artisan() {
  if [ -n "$EXPA_COMPOSE" ]; then $EXPA_COMPOSE exec -T api php artisan "$@"
  else (cd "$ROOT/backend" && php artisan "$@"); fi
}
artisan_run() { # one-off container with the NEW image (before it receives traffic)
  if [ -n "$EXPA_COMPOSE" ]; then $EXPA_COMPOSE run --rm --no-deps -T api php artisan "$@"
  else artisan "$@"; fi
}
tinker_value() { artisan tinker --execute="echo $1;" 2>/dev/null | tail -n1 | tr -d '\r'; }
log() { printf '%s %s\n' "$(date -u +%FT%TZ)" "$*"; }
