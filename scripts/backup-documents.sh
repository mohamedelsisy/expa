#!/usr/bin/env bash
# Backup of the private `documents` disk (storage/app/private/documents). Files are already AES-256 encrypted by the app
# (APP_KEY, DOCUMENTS_ENCRYPT=true); the archive is encrypted AGAIN with the backup passphrase so one stolen key is not enough.
# BACKUP_DIR, BACKUP_PASSPHRASE_FILE as in backup-db.sh. DOCUMENTS_PATH (default backend/storage/app/private/documents).
# Docker: DOCUMENTS_DOCKER_EXEC="docker compose ... exec -T api" streams a tar from the container's volume.
# Retention KEEP_DOCS (default 14). The APP_KEY MUST be backed up separately (secret manager): without it these files are unreadable.
set -euo pipefail
: "${BACKUP_DIR:?}"; : "${BACKUP_PASSPHRASE_FILE:?}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${DOCUMENTS_PATH:-$ROOT/backend/storage/app/private/documents}"; KEEP_DOCS="${KEEP_DOCS:-14}"
umask 077; mkdir -p "$BACKUP_DIR/documents"; chmod 700 "$BACKUP_DIR" "$BACKUP_DIR/documents"
if [ -z "${DOCUMENTS_DOCKER_EXEC:-}" ] && [ ! -d "$SRC" ]; then echo "no documents directory at $SRC (nothing uploaded yet?)" >&2; exit 0; fi
name="expa-documents-$(date -u +%Y%m%dT%H%M%SZ).tar.gz.enc"; tmp="$BACKUP_DIR/documents/.$name.partial"; trap 'rm -f "$tmp"' EXIT
if [ -n "${DOCUMENTS_DOCKER_EXEC:-}" ]; then
  $DOCUMENTS_DOCKER_EXEC tar -C /var/www/html/storage/app/private -czf - documents
else
  tar -C "$(dirname "$SRC")" -czf - "$(basename "$SRC")"
fi | openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt -pass "file:$BACKUP_PASSPHRASE_FILE" -out "$tmp"
[ -s "$tmp" ] || { echo "empty archive" >&2; exit 1; }
mv "$tmp" "$BACKUP_DIR/documents/$name"
( cd "$BACKUP_DIR/documents" && { shasum -a 256 "$name" 2>/dev/null || sha256sum "$name"; } > "$name.sha256" )
{ ls -1t "$BACKUP_DIR"/documents/expa-documents-*.enc 2>/dev/null || true; } | tail -n +"$(( KEEP_DOCS + 1 ))" | while read -r f; do rm -f -- "$f" "$f.sha256"; done
[ -n "${BACKUP_REMOTE:-}" ] && rclone copy "$BACKUP_DIR/documents" "$BACKUP_REMOTE/documents" --include "expa-documents-*" --immutable
echo "documents backup ok: $name"
