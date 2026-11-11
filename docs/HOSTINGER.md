# EXPA on Hostinger Shared (Business) — runbook for https://expa-italy.com

Status: **written, not yet executed.** Nothing here has been run against the Hostinger account. Every step is done by the
site owner in hPanel/SSH; no credentials are shared with the assistant and none are stored in the repository.

## 0. Layout

| Part | Where | Notes |
|---|---|---|
| Web (Nuxt SSR) | `expa-italy.com` | hPanel → Websites → Add website → **Node.js Web App** (Node 22). |
| API (Laravel) | `api.expa-italy.com` | Subdomain whose document root is `…/backend/public`. PHP 8.3. |
| Database | hPanel → MySQL Databases | MySQL/MariaDB only (SQLite is refused in production). |

The BFF in Nuxt talks to the API server-side (`NUXT_API_BASE_URL`), so browsers never call the API directly.

## 1. Before you start

1. Release from `master`, after the PRs you want are merged (the assistant never merges without your approval).
2. In hPanel enable SSL (Let's Encrypt) for both `expa-italy.com` and `api.expa-italy.com`, and force HTTPS.
3. Create the MySQL database + user. Keep the password; you type it into the server `.env` yourself.
4. hPanel → PHP Configuration: PHP **8.3**, enable `pdo_mysql`, `mbstring`, `intl`, `bcmath`, `zip`, `fileinfo`, `gd`; `memory_limit` ≥ 256M, `upload_max_filesize` ≥ 12M.

## 2. API (Laravel) on `api.expa-italy.com`

SSH in (hPanel → Advanced → SSH Access). `composer.phar` is already in your home directory.

```bash
cd ~/domains/expa-italy.com
git clone https://github.com/mohamedelsisy/expa.git expa-repo     # private: use a deploy key or upload the zip
cd expa-repo/backend
php ~/composer.phar install --no-dev --optimize-autoloader
cp .env.example .env        # then edit .env (section 2.1)
php artisan key:generate    # ONLY on first install. Back up APP_KEY: without it documents/encrypted columns are unreadable.
php artisan migrate --force
php artisan storage:link
php artisan config:cache && php artisan route:cache && php artisan view:cache
```

Point the subdomain `api.expa-italy.com` document root at `expa-repo/backend/public`
(hPanel → Domains → Subdomains → edit). `storage/` and `bootstrap/cache` must be writable (`chmod -R 775`).

### 2.1 `.env` (typed by you on the server)

```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.expa-italy.com
FRONTEND_URL=https://expa-italy.com
APP_TIMEZONE=Europe/Rome
CORS_ALLOWED_ORIGINS=https://expa-italy.com
DB_CONNECTION=mysql
DB_HOST=localhost
DB_DATABASE=…   DB_USERNAME=…   DB_PASSWORD=…
CACHE_STORE=database
QUEUE_CONNECTION=database
SESSION_DRIVER=database
CONTENT_FOUR_EYES=true
DOCUMENTS_ENCRYPT=true
BILLING_PROVIDER=none          # switch to stripe only with your own keys, see STRIPE_SETUP.md
MAIL_MAILER=smtp               # hPanel → Emails → create a mailbox, use its SMTP settings
```
Never copy your local `.env` (it holds local-only values).

### 2.2 Scheduler and queue (hPanel → Advanced → Cron Jobs, every minute)

```
* * * * * cd ~/domains/expa-italy.com/expa-repo/backend && php artisan schedule:run >> /dev/null 2>&1
* * * * * cd ~/domains/expa-italy.com/expa-repo/backend && php artisan queue:work --stop-when-empty --max-time=55 >> /dev/null 2>&1
```
Only one scheduler (do not also run `schedule:work`).

### 2.3 Known gaps on shared hosting (do not hide these)

`php artisan expa:preflight --production` will report errors because shared hosting cannot provide:
- **ClamAV** (`DOCUMENTS_SCANNER=clamav`, fail-closed): uploaded personal documents would **not** be virus-scanned.
  Recommendation: keep user document upload disabled/unannounced until a VPS with ClamAV is used. The preflight is
  intentionally strict and must not be weakened to get a green result.
- **Redis** (warnings only), a real AI provider key (`AI_DRIVER` must not be `fake`), and a delivering mailer.
Run it and read the list: `php artisan expa:preflight --production`. Decide each item consciously.

### 2.4 Content

Production uses four-eyes review: seeded and imported content arrives as `review` and the public site shows nothing until it
is published (`php artisan expa:content-readiness` lists the counts per type).

**Publishing in bulk (owner-run, never automatic).** `expa:content-approve` publishes review items in the name of one named
admin. It uses the same policy and publish checks as the admin screen: the approver needs the review and publish permissions,
may not be the author or last editor (four-eyes), and items that fail the checks (official source host, required language) are
skipped and counted, never forced. It writes one `content.bulk_approved` audit entry and rebuilds the search and AI indexes once.

Run `php artisan expa:sync-access` once after deploying or migrating (it creates the permissions and attaches them to the `admin` and
other roles; `super_admin` has none by design and passes every check through a built-in bypass). The approver may be a `super_admin`
or an `admin`; the author and last editor of an item can never approve it, whatever their role.

```bash
cd ~/expa-repo/backend
php artisan expa:content-approve registry --by=you@example.com --dry-run   # counts only, nothing changes
php artisan expa:content-approve registry --by=you@example.com             # shows the counts, asks, then publishes
```
Groups: `registry` (offices, universities, study programmes, tax tables), `patente` (licence categories), `guides` (guides,
government services, appointment guides, housing rules, city profile), `learning` (lessons, vocabulary, exercises), `all`, or a
single type name. Read a sample in the admin area before approving authored content (`guides`, `learning`) and the Arabic/English
text of `patente`. `--limit=N` approves at most N items per type.

Job sources are not content: they stay inactive until an admin records a legal basis for each source in the admin area.

Create your first super admin by registering on the site and then running `php artisan expa:make-admin your@email.com`
(never reuse `demo@expa.test`/`password`, which exists only locally).

## 3. Web (Nuxt) on `expa-italy.com`

Build locally (needs a few GB free and ~20 min on this machine), then upload:

```bash
cd web
NUXT_PUBLIC_SITE_URL=https://expa-italy.com NUXT_API_BASE_URL=https://api.expa-italy.com/api/v1 npx nuxt build
# result: web/.output  (self-contained; contains server/index.mjs)
```
Upload the **contents of `.output/`** to the Node.js app folder (hPanel File Manager or SFTP), then in hPanel →
Node.js Web App set:
- Node version 22, startup file `server/index.mjs`, application root = the uploaded folder.
- Environment variables:
  `NUXT_API_BASE_URL=https://api.expa-italy.com/api/v1`, `NUXT_PUBLIC_SITE_URL=https://expa-italy.com`,
  `NUXT_SECURITY_HSTS=true`, `NUXT_TRUSTED_PROXY_HOPS=1`.
  **Never** set `EXPA_ALLOW_LOCAL`.
- Add `TRUSTED_PROXIES` / `BEHIND_PROXY=true` to the API `.env` if the preflight asks (see `docs/DEPLOYMENT.md`).

## 4. Smoke test after go-live

1. `https://api.expa-italy.com/api/v1/health` (or the health route in `docs/OPERATIONS.md`) answers 200.
2. `https://expa-italy.com/ar`, `/en`, `/it` load; Arabic is RTL; `robots.txt` and `sitemap.xml` use the production domain.
3. Register a test user, verify e-mail arrives, log in, log out.
4. Admin login; the pending-review queue shows imported content.
5. `/pricing` shows plans with "payments not enabled yet" while `BILLING_PROVIDER=none`.

## 5. Rollback

Keep the previous `.output/` folder and the previous git tag. Web: re-upload the old folder and restart the Node app.
API: `git checkout <previous tag>`, `composer install --no-dev`, `php artisan config:cache`. Migrations are additive;
restore the database from a backup taken before `migrate` if a rollback needs the old schema.

## 6. Backups

hPanel → Backups covers files + DB, but take a manual `mysqldump` and a copy of `.env`/`APP_KEY` before each release.
