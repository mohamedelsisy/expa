# Deploying EXPA on Hostinger shared hosting (Premium / Business)

The main deployment guide (`DEPLOYMENT.md`) targets Docker on a VPS. This is the reduced shape for shared hosting. It works,
but with the limits listed in "What you give up". Read that section before you commit to this plan.

## 0. Reality check: what your plan can run

| Part | Needs | Premium | Business |
|---|---|---|---|
| API (Laravel 13) | PHP 8.3+, MySQL, cron, SSH recommended | yes (select PHP 8.3 or 8.4 in hPanel) | yes |
| Web (Nuxt SSR + BFF) | a long-running **Node.js 22** process | **no**: Premium has no Node.js apps | **check hPanel**: Node.js Web Apps (Websites > Add website > Node.js Apps). Hostinger offers them on Business and Cloud, not on Premium |
| Mobile | app stores | n/a | n/a |

The web app is **not** a static site: login cookies and the API proxy (BFF) are Nuxt server routes. So:

- **Business with Node.js Apps**: API and web both on Hostinger (this guide).
- **Premium (or Business without Node.js)**: run the API on Hostinger and host the web app on any Node 22 host
  (Hostinger VPS/Cloud, Render, Railway, Fly.io...) using the same `expa-web.zip`/`.output`, or upgrade the plan. Everything
  in section 2 (API) still applies; only section 3 changes.

## What you give up on shared hosting (be deliberate)
- **No ClamAV**: uploads of personal documents are rejected by design (`DOCUMENTS_SCANNER=clamav`, fail-closed, no daemon).
  The rest of the app works. Add a reachable clamd later (VPS) and set `CLAMAV_HOST`. Never use `basic` in production.
- **No Redis / no supervisor**: cache, queue and sessions use MySQL; the queue is drained by cron once a minute, so queued
  work (emails, imports, erasure) can lag up to ~1 minute. `expa:preflight` will warn about it; that is expected.
- **No OCR (tesseract)**, so the document explainer works on pasted text only (`OCR_DRIVER=null`).
- **Shared CPU/RAM**: heavy imports (`expa:import:all`, XLSX) should be run from SSH off-peak, not on a web request.
- **No Docker, no zero-downtime deploys**: releases are an upload + a few artisan commands.

## 1. Prepare (once)
1. Domain DNS at Hostinger. Subdomains: `api.<domain>` (API) and `www.<domain>` (web). Enable the free SSL for both
   (hPanel > Security > SSL) and force HTTPS.
2. hPanel > **PHP Configuration**: PHP 8.3 or 8.4 for the API subdomain; enable extensions `bcmath, ctype, curl, dom, fileinfo,
   intl, json, mbstring, openssl, pdo_mysql, tokenizer, xml, zip, gd`; `memory_limit >= 256M`, `upload_max_filesize 12M`,
   `post_max_size 12M`, `max_execution_time 120`.
3. hPanel > **Databases > MySQL**: create the database and user; note the full names (`u123_expa`).
4. hPanel > **Emails**: create `hello@<domain>` and note the SMTP settings (smtp.hostinger.com, 465 SSL).
5. **SSH** (hPanel > Advanced > SSH Access). Check `php -v` in the SSH shell: if it is not 8.3+, find the right binary
   (`ls /opt/alt | grep -i php`, or `which -a php`) and use that full path wherever this guide says `php` and in cron.

## 2. API
**Build the artifacts on your computer** (PHP 8.3+, Composer, Node 22):
```
scripts/build-hostinger-package.sh        # -> dist/hostinger/expa-api.zip, expa-web.zip (+ sha256)
```
**Upload and unpack** (hPanel File Manager or `scp`), *outside* `public_html`:
```
~/expa-api/            <- unzip expa-api.zip here (contains app/, vendor/, public/, ...)
```
**Point the API subdomain at `~/expa-api/public`**: in hPanel create the subdomain with the custom folder
`expa-api/public`. If hPanel will not accept a folder outside `public_html`, create the subdomain normally and replace its
folder with a symlink over SSH: `rm -rf ~/domains/<domain>/public_html/api && ln -s ~/expa-api/public ~/domains/<domain>/public_html/api`.
`public/.htaccess` (committed) does the routing. Only `public/` may be web-reachable, never the project root.

**Configure**:
```
cd ~/expa-api
cp /path/to/deploy/hostinger/api.env.example .env      # or paste it via File Manager
php artisan key:generate --show                        # put the value in APP_KEY, keep a copy offline
nano .env                                              # fill DB_*, MAIL_*, URLs, ANTHROPIC_API_KEY
chmod 600 .env
chmod -R ug+rwX storage bootstrap/cache
php artisan package:discover --ansi                    # composer ran with --no-scripts
php artisan migrate --force
php artisan expa:sync-access
php artisan db:seed --class=GeographySeeder --force    # first time only
php artisan db:seed --class=DocumentTypeSeeder --force
php artisan db:seed --class=PlanSeeder --force
php artisan config:cache && php artisan route:cache && php artisan event:cache && php artisan view:cache
php artisan storage:link   # only if your env serves public storage; documents are private and never linked
php artisan expa:preflight --production
```
`expa:preflight --production` must print **no ERROR**. Expected warnings on this setup: `cache_not_redis`,
`queue_not_redis`, `push_stub`, `billing_none`, `ocr_null`, and `privacy_policy_draft` until counsel approves the policy.
An ERROR you did not expect (`mail_not_delivered`, `trusted_proxies`, `app_url_not_https`...) means the `.env` is wrong.

**Cron** (hPanel > Advanced > Cron Jobs, every minute each; use the full PHP path from step 1.5):
```
* * * * * cd $HOME/expa-api && php artisan schedule:run >> /dev/null 2>&1
* * * * * cd $HOME/expa-api && php artisan queue:work --stop-when-empty --max-time=55 --tries=3 >> /dev/null 2>&1
```
Reminders, imports and notifications depend on these two lines. Without them, the app looks fine and nothing is sent.

**First admin**: register through the web app, then `php artisan expa:make-admin you@example.com`. Staff must enrol
2FA (`STAFF_2FA_REQUIRED=true`).

**Optional, real data**: `php artisan expa:import:all --dry-run`, then without `--dry-run`, from SSH, not from a request.
Raw downloads land in `storage/app/private/imports` and are pruned by `expa:prune-retention`.

### Proxy identity check
Hostinger fronts your site with its own proxy. `TRUSTED_PROXIES=*` is only safe if clients cannot reach the origin
directly. Verify: fail a login 6 times from device A (the 6th answers HTTP 429), then log in correctly from device B on a
different network: it must **not** be throttled. If it is, all users share one rate-limit bucket; fix `TRUSTED_PROXIES`.

## 3. Web (Business with Node.js Apps)
1. hPanel > Websites > Add website > **Node.js Apps** > upload `expa-web.zip` (or connect the GitHub repo and build there).
2. Node version **22**. Entry point: `.output/server/index.mjs`. Start command if asked: `node .output/server/index.mjs`.
3. Environment variables from `deploy/hostinger/web.env.example` (they are read at start, not at build). The server
   refuses to boot if `NUXT_API_BASE_URL` / `NUXT_PUBLIC_SITE_URL` are empty or point at localhost.
4. Attach `www.<domain>` and restart. `NUXT_API_BASE_URL` must equal the API origin + `/api/v1`, and `APP_URL`,
   `FRONTEND_URL` and `CORS_ALLOWED_ORIGINS` in the API `.env` must match the web origin exactly.

## 4. Verify
- `https://api.<domain>/up` returns 200; `https://api.<domain>/api/v1/guides` returns JSON.
- `https://www.<domain>/ar` renders RTL; register, receive the verification email, log in.
- `https://www.<domain>/robots.txt` and `/sitemap.xml` show the production host.
- Upload a document: expected to be **rejected** (no antivirus). Anything else means the scanner config is wrong.
- Wait 2 minutes and check `php artisan queue:monitor database` / `jobs` and `failed_jobs` tables are empty.

## 5. Update / roll back
Update: build a new `expa-api.zip`, upload over `~/expa-api` **without** deleting `.env` and `storage/`, then
`php artisan down && php artisan migrate --force && php artisan config:cache route:cache event:cache view:cache && php artisan queue:restart && php artisan up`.
Keep the previous zip: rollback is re-uploading it (migrations must be backward compatible, as in `DEPLOYMENT.md`).
Back up the database from hPanel (Backups) or `mysqldump` before each migrate. The `APP_KEY` must never change.

## 6. Troubleshooting
| Symptom | Likely cause |
|---|---|
| 500 on every request | `.env` missing/unreadable, `APP_KEY` empty, `storage/` or `bootstrap/cache` not writable, wrong PHP version. See `storage/logs/laravel-*.log` |
| 404 on every route except `/` | `.htaccess` not uploaded, or `mod_rewrite` disabled for the subdomain; subdomain folder is not `public/` |
| Login works then logs out / 419 | `APP_URL`/`FRONTEND_URL`/`CORS_ALLOWED_ORIGINS` mismatch, or web not on https (`NUXT_COOKIE_SECURE=true`) |
| No emails | wrong SMTP port/scheme (465 + `smtps`), mailbox password, or queue cron missing |
| "Class not found" after upload | `vendor/` missing, or `package:discover` not run |
| Web will not start | missing `NUXT_*` variables, Node < 22 |
