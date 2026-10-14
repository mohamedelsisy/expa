#!/usr/bin/env bash
# Builds the two upload artifacts for Hostinger shared hosting into dist/hostinger/:
#   expa-api.zip  Laravel backend with production vendor/ (no tests, no .env, no logs, no local caches)
#   expa-web.zip  Nuxt .output (server + public) ready for the hPanel Node.js app
# Run from the repo root on a machine with PHP 8.3+, Composer and Node 22. Secrets are never packaged.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/dist/hostinger"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT
mkdir -p "$OUT"

command -v composer >/dev/null || { echo "composer not found" >&2; exit 1; }
php -r 'exit(version_compare(PHP_VERSION, "8.3.0", ">=") ? 0 : 1);' || { echo "PHP 8.3+ required locally (matches composer.json)" >&2; exit 1; }

echo "== api"
rsync -a --delete \
  --exclude '.env' --exclude '.env.*' --exclude 'tests/' --exclude 'node_modules/' --exclude '.git*' \
  --exclude 'storage/logs/*' --exclude 'storage/framework/cache/data/*' --exclude 'storage/framework/sessions/*' --exclude 'storage/framework/views/*' \
  --exclude 'bootstrap/cache/*.php' --exclude 'database/*.sqlite' --exclude 'vendor/' \
  "$ROOT/backend/" "$STAGE/api/"
( cd "$STAGE/api" && composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction --no-scripts )
mkdir -p "$STAGE/api/storage/logs" "$STAGE/api/storage/framework/"{cache/data,sessions,views} "$STAGE/api/bootstrap/cache"
test -f "$STAGE/api/public/.htaccess" || { echo "public/.htaccess missing" >&2; exit 1; }
( cd "$STAGE/api" && rm -f "$OUT/expa-api.zip" && zip -qr "$OUT/expa-api.zip" . )

echo "== web"
( cd "$ROOT/web" && npm ci --no-audit --no-fund && npm run build )
rm -f "$OUT/expa-web.zip"
( cd "$ROOT/web" && zip -qr "$OUT/expa-web.zip" .output package.json )

echo "== done"
ls -lh "$OUT"
( cd "$OUT" && shasum -a 256 expa-api.zip expa-web.zip )
