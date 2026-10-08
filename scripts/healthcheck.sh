#!/usr/bin/env bash
# External health check for uptime monitors/cron. Public endpoints only (no credentials needed):
#   API  GET $API_URL/api/v1/health  -> HTTP 200 and {"data":{"status":"ok"}}
#   API  GET $API_URL/up             -> HTTP 200 (framework health route)
#   WEB  GET $WEB_URL/               -> HTTP 200 or a locale redirect (301/302/307)
# Usage: API_URL=https://api.example.com WEB_URL=https://www.example.com scripts/healthcheck.sh
# Exit 0 healthy, 2 unhealthy (prints which check failed).
set -uo pipefail
API_URL="${API_URL:-http://127.0.0.1:8000}"; WEB_URL="${WEB_URL:-}"; T="${HEALTH_TIMEOUT:-5}"
fail=0
check() { # name url expected-body-fragment
  local code body
  body="$(curl -sS -m "$T" -o - -w '\n%{http_code}' "$2" 2>&1)" || { echo "FAIL $1: unreachable ($2)"; fail=1; return; }
  code="${body##*$'\n'}"; body="${body%$'\n'*}"
  if ! [[ "$code" =~ ^(${4:-200})$ ]]; then echo "FAIL $1: HTTP $code"; fail=1
  elif [ -n "${3:-}" ] && ! printf '%s' "$body" | grep -q "$3"; then echo "FAIL $1: unexpected body"; fail=1
  else echo "ok   $1"; fi
}
check api-health "$API_URL/api/v1/health" '"status":"ok"'
check api-up "$API_URL/up"
[ -n "$WEB_URL" ] && check web "$WEB_URL/" "" "200|301|302|307"   # the web app redirects / to the default locale
exit $(( fail ? 2 : 0 ))
