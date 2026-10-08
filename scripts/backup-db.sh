#!/usr/bin/env bash
# Encrypted MySQL/MariaDB backup with rotation. Run daily from cron/systemd timer (deploy/cron/expa.cron).
#
# Required env (from a root-only file, e.g. /etc/expa/backup.env; NEVER in git):
#   DB_HOST DB_PORT DB_DATABASE DB_USERNAME DB_PASSWORD       credentials of a user with SELECT, SHOW VIEW, TRIGGER, EVENT, LOCK TABLES
#   BACKUP_DIR              backup root (created 0700), on a volume that is NOT the database volume
#   BACKUP_PASSPHRASE_FILE  file (0600) with the encryption passphrase; keep a copy in the secret manager, separate from the backups
# Optional:
#   DUMP_BIN (default mysqldump; set mariadb-dump for MariaDB)   DUMP_EXTRA (extra flags)
#   KEEP_DAILY=14 KEEP_WEEKLY=8 KEEP_MONTHLY=12                  retention (count of files per tier)
#   BACKUP_REMOTE            rclone remote:path for an offsite copy (optional; rclone must be configured out of band)
#   DB_DOCKER_EXEC           e.g. "docker compose ... exec -T db" to dump from inside the db container
#
# Output: $BACKUP_DIR/db/daily/expa-db-<UTC>.sql.gz.enc (+ .sha256). Sundays also copy to weekly/, the 1st to monthly/.
# Security: password passed through MYSQL_PWD (not the process list); dump is encrypted before it touches the final path.
set -euo pipefail
: "${DB_DATABASE:?}"; : "${DB_USERNAME:?}"; : "${BACKUP_DIR:?}"; : "${BACKUP_PASSPHRASE_FILE:?}"
DB_HOST="${DB_HOST:-127.0.0.1}"; DB_PORT="${DB_PORT:-3306}"
DUMP_BIN="${DUMP_BIN:-mysqldump}"
KEEP_DAILY="${KEEP_DAILY:-14}"; KEEP_WEEKLY="${KEEP_WEEKLY:-8}"; KEEP_MONTHLY="${KEEP_MONTHLY:-12}"
[ -r "$BACKUP_PASSPHRASE_FILE" ] || { echo "passphrase file not readable" >&2; exit 1; }
[ "$(stat -f %Lp "$BACKUP_PASSPHRASE_FILE" 2>/dev/null || stat -c %a "$BACKUP_PASSPHRASE_FILE")" = "600" ] || { echo "passphrase file must be mode 600" >&2; exit 1; }
umask 077
mkdir -p "$BACKUP_DIR"/db/{daily,weekly,monthly}; chmod 700 "$BACKUP_DIR" "$BACKUP_DIR"/db

ts="$(date -u +%Y%m%dT%H%M%SZ)"; name="expa-db-$ts.sql.gz.enc"
tmp="$BACKUP_DIR/db/daily/.$name.partial"; trap 'rm -f "$tmp"' EXIT

# --single-transaction: consistent InnoDB snapshot without locking writers. --routines/--triggers/--events: complete schema.
export MYSQL_PWD="${DB_PASSWORD:-}"
# shellcheck disable=SC2086
${DB_DOCKER_EXEC:-} "$DUMP_BIN" -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" \
  --single-transaction --quick --routines --triggers --events --hex-blob --default-character-set=utf8mb4 ${DUMP_EXTRA:-} "$DB_DATABASE" \
  | gzip -9 \
  | openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt -pass "file:$BACKUP_PASSPHRASE_FILE" -out "$tmp"
[ -s "$tmp" ] || { echo "empty backup" >&2; exit 1; }
mv "$tmp" "$BACKUP_DIR/db/daily/$name"
( cd "$BACKUP_DIR/db/daily" && { shasum -a 256 "$name" 2>/dev/null || sha256sum "$name"; } > "$name.sha256" )
[ "$(date -u +%u)" = "7" ] && cp -p "$BACKUP_DIR/db/daily/$name"* "$BACKUP_DIR/db/weekly/"
[ "$(date -u +%d)" = "01" ] && cp -p "$BACKUP_DIR/db/daily/$name"* "$BACKUP_DIR/db/monthly/"

prune() { # dir keep : keep the newest N dumps (and their checksums)
  { ls -1t "$1"/expa-db-*.enc 2>/dev/null || true; } | tail -n +"$(( $2 + 1 ))" | while read -r f; do rm -f -- "$f" "$f.sha256"; done
}
prune "$BACKUP_DIR/db/daily" "$KEEP_DAILY"; prune "$BACKUP_DIR/db/weekly" "$KEEP_WEEKLY"; prune "$BACKUP_DIR/db/monthly" "$KEEP_MONTHLY"

if [ -n "${BACKUP_REMOTE:-}" ]; then rclone copy "$BACKUP_DIR/db" "$BACKUP_REMOTE/db" --include "expa-db-*" --immutable; fi
echo "backup ok: $BACKUP_DIR/db/daily/$name ($(wc -c < "$BACKUP_DIR/db/daily/$name") bytes)"
