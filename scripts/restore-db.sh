#!/usr/bin/env bash
# Restore an encrypted dump produced by backup-db.sh into a TARGET database. Verifies the checksum first.
#   scripts/restore-db.sh <backup-file.sql.gz.enc> <target-database> [--yes-overwrite]
# Env: DB_HOST DB_PORT DB_USERNAME DB_PASSWORD  BACKUP_PASSPHRASE_FILE   (MYSQL_BIN default "mysql")
# The target database is created if missing. Restoring INTO the live production database is refused unless
# RESTORE_ALLOW_PRODUCTION=1 and --yes-overwrite are both given. Drill procedure: docs/OPERATIONS.md (restore drill).
set -euo pipefail
file="${1:?backup file}"; target="${2:?target database}"; flag="${3:-}"
: "${DB_USERNAME:?}"; : "${BACKUP_PASSPHRASE_FILE:?}"
DB_HOST="${DB_HOST:-127.0.0.1}"; DB_PORT="${DB_PORT:-3306}"; MYSQL_BIN="${MYSQL_BIN:-mysql}"
if [ -n "${LIVE_DATABASE:-}" ] && [ "$target" = "$LIVE_DATABASE" ]; then
  [ "${RESTORE_ALLOW_PRODUCTION:-0}" = 1 ] && [ "$flag" = "--yes-overwrite" ] || { echo "refusing to overwrite live database '$target'" >&2; exit 1; }
fi
[[ "$target" =~ ^[A-Za-z0-9_]+$ ]] || { echo "invalid database name" >&2; exit 1; }
if [ -f "$file.sha256" ]; then
  ( cd "$(dirname "$file")" && { shasum -a 256 -c "$(basename "$file").sha256" 2>/dev/null || sha256sum -c "$(basename "$file").sha256"; } ) || { echo "checksum mismatch" >&2; exit 1; }
else echo "WARNING: no .sha256 next to the backup" >&2; fi
export MYSQL_PWD="${DB_PASSWORD:-}"
${DB_DOCKER_EXEC:-} "$MYSQL_BIN" -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -e "CREATE DATABASE IF NOT EXISTS \`$target\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass "file:$BACKUP_PASSPHRASE_FILE" -in "$file" | gunzip \
  | ${DB_DOCKER_EXEC:-} "$MYSQL_BIN" -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" "$target"
echo "restored $file into $target. Next: php artisan migrate --force (if the dump is older than the code), expa:ai-reindex, expa:search-reindex, re-apply erasures made after the backup."
