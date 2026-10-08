#!/usr/bin/env bash
# Internal checks to run every 1-5 minutes from cron/monitoring agent. Prints `key=value` lines and exits non-zero on breach.
#   failed_jobs      rows in failed_jobs                           (alert > 0)
#   queue_pending    waiting jobs on the redis queue `default`     (alert > QUEUE_MAX, default 500)
#   queue_delayed    delayed/retrying jobs                         (info)
#   scheduler_age_s  seconds since cache key scheduler:heartbeat   (alert > 180; the scheduler writes it every minute)
#   disk_pct         usage of the volume holding storage/          (alert > 85)
# Redis-queue depth needs REDIS_CLI (a command that reaches redis with auth), e.g.
#   REDIS_CLI="docker compose ... exec -T redis sh -c 'REDISCLI_AUTH=\$REDIS_PASSWORD redis-cli'"  and REDIS_PREFIX matching api.env.
# NOTE (verify on staging): the Laravel redis queue key is "<REDIS_PREFIX>queues:default". The admin stats endpoint's
# `pending_queue_jobs` counts the SQL `jobs` table only, so it reads 0 under QUEUE_CONNECTION=redis: do not alert on it.
source "$(dirname "$0")/lib.sh"
QUEUE_MAX="${QUEUE_MAX:-500}"; HB_MAX="${HB_MAX:-180}"; DISK_MAX="${DISK_MAX:-85}"; breach=0
failed="$(tinker_value "DB::table('failed_jobs')->count()")"
hb="$(tinker_value "Cache::get('scheduler:heartbeat') ?? 'none'")"
echo "failed_jobs=${failed:-unknown}"
case "$failed" in 0) ;; *) breach=1 ;; esac   # anything but a literal 0 (incl. unknown) is a breach
if [ "$hb" = "none" ] || [ -z "$hb" ]; then echo "scheduler_age_s=none"; breach=1
else
  age="$(php -r '$t=strtotime($argv[1]); echo $t?time()-$t:-1;' "$hb")"
  echo "scheduler_age_s=$age"; { [ "$age" -lt 0 ] || [ "$age" -gt "$HB_MAX" ]; } && breach=1
fi
if [ -n "${REDIS_CLI:-}" ]; then
  p="${REDIS_PREFIX:-}"
  pending="$(eval "$REDIS_CLI LLEN '${p}queues:default'" | tr -d '\r')"
  delayed="$(eval "$REDIS_CLI ZCARD '${p}queues:default:delayed'" | tr -d '\r')"
  echo "queue_pending=$pending"; echo "queue_delayed=$delayed"
  [ "${pending:-0}" -gt "$QUEUE_MAX" ] && breach=1
fi
disk="$(df -P "${STORAGE_PATH:-$ROOT/backend/storage}" 2>/dev/null | awk 'NR==2{gsub("%","",$5);print $5}')"
echo "disk_pct=${disk:-unknown}"; [ -n "${disk:-}" ] && [ "$disk" -gt "$DISK_MAX" ] && breach=1
exit "$breach"
