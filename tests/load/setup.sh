#!/usr/bin/env bash
# Prepare a THROWAWAY database + server for tests/load/load.mjs. Never point this at staging/production data.
#   WORK=/some/scratch/dir USERS=20 PORT=8099 tests/load/setup.sh    -> prints the BASE_URL to use; stop with: kill $(cat $WORK/serve.pid)
# Uses its own SQLite file, AI_DRIVER=fake, a throwaway APP_KEY, TRUSTED_PROXIES=* (so SPOOF_IP=1 can vary the client IP)
# and the file cache. It does not touch backend/.env or any running dev server.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; WORK="${WORK:?scratch dir}"; USERS="${USERS:-20}"; PORT="${PORT:-8099}"
mkdir -p "$WORK/storage"; : > "$WORK/load.sqlite"
export APP_ENV=local APP_DEBUG=false APP_URL="http://127.0.0.1:$PORT" DB_CONNECTION=sqlite DB_DATABASE="$WORK/load.sqlite" \
  CACHE_STORE=file QUEUE_CONNECTION=sync SESSION_DRIVER=array AI_DRIVER=fake MAIL_MAILER=array LOG_CHANNEL=null \
  APP_KEY="base64:$(openssl rand -base64 32)" TRUSTED_PROXIES='*' BEHIND_PROXY=true BCRYPT_ROUNDS=4 LOG_LEVEL=error
cd "$ROOT/backend"
php artisan migrate --force --no-interaction >/dev/null
php artisan db:seed --force --no-interaction >/dev/null
php artisan tinker --execute="\$h=Hash::make('password'); for(\$i=1;\$i<=$USERS;\$i++){ \$u=App\\Models\\User::firstOrCreate(['email'=>\"load\$i@load.test\"],['name'=>\"Load \$i\",'password'=>\$h,'email_verified_at'=>now()]); \$u->forceFill(['email_verified_at'=>now()])->save(); \$u->syncRoleKeys(['user']); } echo 'users ok';"
echo
PHP_CLI_SERVER_WORKERS="${WORKERS:-4}" nohup php artisan serve --host=127.0.0.1 --port="$PORT" >"$WORK/serve.log" 2>&1 &
echo $! > "$WORK/serve.pid"; sleep 3
curl -fsS "http://127.0.0.1:$PORT/api/v1/health" && echo && echo "BASE_URL=http://127.0.0.1:$PORT"
