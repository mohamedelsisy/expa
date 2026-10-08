#!/usr/bin/env bash
# Verifies that (1) every env() key in backend/config/*.php and (2) every key in deploy/env/*.example is documented in
# docs/ENVIRONMENT.md. Read-only. Exit 1 on any gap.  Usage: scripts/check-env-docs.sh
set -euo pipefail
cd "$(dirname "$0")/.."
doc=docs/ENVIRONMENT.md
# Keys that belong to compose/web/db containers rather than Laravel; documented in DEPLOYMENT.md.
other='API_IMAGE|WEB_IMAGE|API_HOST|WEB_HOST|CERTS_DIR|MYSQL_[A-Z_]+|NUXT_[A-Z_]+|NODE_ENV|HOST|PORT'
missing=0
check() { # key source
  grep -q -- "\`$1\`\|\b$1\b" "$doc" || { echo "MISSING in $doc: $1 (from $2)"; missing=1; }
}
while read -r k; do check "$k" "config/*.php"; done < <(grep -rhoE "env\('[A-Z0-9_]+'" backend/config | sed -E "s/env\('//; s/'//" | sort -u)
for f in deploy/env/*.example; do
  while read -r k; do
    [[ "$k" =~ ^($other)$ ]] && continue
    check "$k" "$f"
  done < <(grep -hoE '^#? ?[A-Z][A-Z0-9_]+=' "$f" | sed -E 's/^# ?//; s/=$//' | sort -u)
done
[ "$missing" = 0 ] && echo "env docs: every referenced variable is documented" || exit 1
