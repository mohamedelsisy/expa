#!/usr/bin/env bash
# Deploy gate: runs `php artisan expa:preflight --production` against the environment of the NEW image.
# Exit 0 = no blocking findings (warnings are printed). Exit 1 = at least one ERROR: do not switch traffic.
# Usage: EXPA_COMPOSE="docker compose ..." scripts/preflight.sh [--strict]    (--strict also fails on warnings)
source "$(dirname "$0")/lib.sh"
strict=0; [ "${1:-}" = "--strict" ] && strict=1
out="$(artisan_run expa:preflight --production 2>&1)" && rc=0 || rc=$?
printf '%s\n' "$out"
if [ "$rc" -ne 0 ]; then log "PREFLIGHT FAILED (blocking findings)"; exit 1; fi
if [ "$strict" = 1 ] && printf '%s' "$out" | grep -q '^\[WARNING\]'; then log "PREFLIGHT STRICT: warnings present"; exit 1; fi
log "preflight ok"
