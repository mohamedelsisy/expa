# EXPA backend: environment variables

Source of truth: `backend/.env.example` and the `env()` calls in `backend/config/*.php` (they are the only place `env()` may be used, so values survive `php artisan config:cache`). `php artisan expa:preflight --production` enforces everything marked **P** below. Legend: **P** = required/validated in production (preflight ERROR if wrong), **S** = same for staging, **L** = local default is fine, **opt** = optional, secret = never commit, store in a secret manager.

## Application
| Variable | Local | Staging / Production | Notes |
|---|---|---|---|
| `APP_NAME`, `APP_LOCALE` (ar), `APP_FALLBACK_LOCALE` (en), `APP_FAKER_LOCALE` | defaults | defaults | |
| `APP_ENV` | `local` | `staging` / `production` | `production` turns on https URL forcing and the production log level default |
| `APP_KEY` | generated (`php artisan key:generate`) | **P** secret | encrypts documents, messages, profile fields and keys the audit/consent HMACs. See SECURITY.md key custody |
| `APP_PREVIOUS_KEYS` | empty | during rotation only, secret | comma separated old keys |
| `APP_DEBUG` | `true` | **P** must be `false` | |
| `APP_URL` | `http://localhost:8000` | **P** https origin of the API | verification links are built from it |
| `APP_TIMEZONE` | `Europe/Rome` | `Europe/Rome` (warning otherwise) | reminder days and the scheduler |
| `FRONTEND_URL` | `http://localhost:3000` | **P** https origin of the web app | checkout redirects, mail links |
| `CORS_ALLOWED_ORIGINS` | localhost | **P** explicit origins, never `*` | |
| `APP_MAINTENANCE_DRIVER`, `APP_MAINTENANCE_STORE` | file | file or cache | |

## Proxy and edge
| `TRUSTED_PROXIES` | empty | **P** when `BEHIND_PROXY=true`: balancer IPs/CIDRs (`10.0.0.0/8,...`); `*` only on a private network. **With the Nuxt BFF in front of the API, the web server's address (or its Docker/VPC subnet) must be listed here**, otherwise the API ignores the `X-Forwarded-For` the BFF sends and all guests share one rate-limit bucket (web audit WEB-3, BACKEND_REQUESTS #24). Check: two guests from different IPs must show different `RateLimit` buckets, e.g. 6 failed logins from one IP must not block another | read from config, applied in `AppServiceProvider::boot` |
|---|---|---|---|
| `BEHIND_PROXY` | `true` | `true` behind a balancer; `false` only if the API faces clients directly | |

## Database, cache, queue, session
| Variable | Local | Staging / Production | Notes |
|---|---|---|---|
| `DB_CONNECTION` | `sqlite` | **P** `mysql` / `mariadb` (sqlite is an ERROR) | |
| `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME` | | required | |
| `DB_PASSWORD` | | required, secret | |
| `DB_URL`, `DB_SOCKET`, `DB_CHARSET`, `DB_COLLATION`, `MYSQL_ATTR_SSL_CA`, `DB_SSLMODE`, ... | opt | opt | use TLS to the database in production |
| `CACHE_STORE` | `database` | redis recommended (warning if database; ERROR if array/null) | rate limits and scheduler locks use it |
| `QUEUE_CONNECTION` | `database` | redis recommended (warning if database; ERROR if sync) | needs a supervised worker: `queue:work --timeout=600` |
| `DB_QUEUE_RETRY_AFTER`, `REDIS_QUEUE_RETRY_AFTER` | 900 | 900 (must exceed the longest job timeout, 600) | |
| `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_CLIENT`, `REDIS_PREFIX`, ... | opt | required when redis is used, password secret | |
| `SESSION_DRIVER`, `SESSION_LIFETIME`, `SESSION_*` | defaults | defaults | the API is token based; sessions are unused |
| `QUEUE_FAILED_DRIVER` | `database-uuids` | same | alert on growth of `failed_jobs` |

## Logging
| `LOG_CHANNEL` | `stack` | `stack` or `stderr` | |
|---|---|---|---|
| `LOG_STACK` | `daily` | `daily` (warning if `single`) | |
| `LOG_LEVEL` | `debug` | `warning` (default under `APP_ENV=production`; warning if `debug`) | |
| `LOG_DAILY_DAYS` | 14 | 14 or per retention policy | |
| `LOG_DEPRECATIONS_CHANNEL`, `LOG_SLACK_WEBHOOK_URL`, `PAPERTRAIL_*` | opt | opt, webhook secret | |

## Authentication and tokens
| `SANCTUM_TOKEN_EXPIRATION` | 43200 (30 d) | **P** must not be null | minutes |
|---|---|---|---|
| `EXPA_STAFF_TOKEN_MINUTES` | 720 | 720 | lifetime of tokens issued to non-`user` roles |
| `EXPA_MAX_TOKENS` | 20 | 20 | live tokens per user (oldest revoked) |
| `STAFF_2FA_REQUIRED` | false | **P** must be true (preflight `staff_2fa_off` is an ERROR) | staff (super admin or any role holding permissions) without TOTP get 403 `two_factor_setup_required` on `/admin/*` until enabled |
| `TWO_FACTOR_ISSUER` | EXPA | EXPA | label shown in authenticator apps |
| `TWO_FACTOR_CHALLENGE_TTL` | 300 | 300 | seconds a login challenge token stays valid |
| `EXPORT_REQUIRE_PASSWORD` | `false` | `true` once web and mobile use `POST /profile/export` | |
| `BCRYPT_ROUNDS` | 12 | 12 | |

## Per-user limits and search
| `EXPA_MAX_JOB_SAVES` 500, `EXPA_MAX_DEVICES` 10, `EXPA_MAX_DOCUMENTS` 200 | | | abuse bounds |
|---|---|---|---|
| `SEARCH_MAX_TOKENS` 6, `SEARCH_CACHE_TTL` 60 | | | search cost bounds |

## Content and privacy
| `CONTENT_FOUR_EYES` | `true` | `true` | authors cannot approve their own content |
|---|---|---|---|
| `OFFICIAL_DOMAINS_EXTRA` | empty | verified exact domains, comma separated | never assume a domain is official |
| `OFFICIAL_DOMAIN_PATTERNS_ENABLED` | `true` | consider `false` | comune./regione. patterns are registrable by anyone |
| `PRIVACY_POLICY_VERSION` | draft | **counsel-approved version string** | BLOCKED_LEGAL until approved |
| `ANALYTICS_SYSTEM_EVENTS` | `true` | per legal decision | aggregate counters without consent |

## Uploads, antivirus
| `DOCUMENTS_ENCRYPT` | `true` | **P** must be `true` | |
|---|---|---|---|
| `DOCUMENTS_SCANNER` | `basic` | **P** `clamav` (`basic` is an ERROR) | |
| `CLAMAV_HOST`, `CLAMAV_PORT` (3310) or `CLAMAV_SOCKET` | opt | required with `clamav` | reachable only from the API network |
| `CLAMAV_TIMEOUT` | 5 | 5 | seconds |
| `CLAMAV_FAIL_CLOSED` | `true` | **P** must be `true` | uploads are refused when clamd is down |

## Mail
| `MAIL_MAILER` | `log` | **P** `smtp` (or a provider mailer); `log`/`array` is an ERROR | |
|---|---|---|---|
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_SCHEME`, `MAIL_USERNAME` | | required with smtp | |
| `MAIL_PASSWORD` | | required, secret | |
| `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME` | | required; SPF, DKIM, DMARC on the domain | |
| `POSTMARK_API_KEY`, `RESEND_API_KEY`, `AWS_*` (SES) | | only for those mailers, secret | |

## AI (Anthropic)
| `AI_DRIVER` | `fake` | **P** `anthropic` (`fake` is an ERROR) | |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | empty | **P** required with `anthropic`, secret | |
| `ANTHROPIC_BASE_URL` | `https://api.anthropic.com` | https only | |
| `AI_MODEL` | `claude-sonnet-5-5` | model id, change without a release | |
| `AI_TIMEOUT_SECONDS`, `AI_RETRIES`, `AI_RETRY_SLEEP_MS` | 20, 2, 400 | same | retries only on connection errors, 429, 5xx |
| `AI_MAX_OUTPUT_TOKENS`, `AI_MAX_INPUT_CHARS` | 900, 24000 | same | per-call cost bounds |
| `AI_DAILY_TOKEN_BUDGET` | 0 | set a number (warning if 0) | global daily circuit breaker, then degraded answers |

## Push (FCM)
| `PUSH_DRIVER` | `log` | `fcm` (warning while `log`) | |
|---|---|---|---|
| `FCM_CREDENTIALS_PATH` | | required with `fcm` (or `FCM_CREDENTIALS_JSON`), secret file outside the web root | service-account JSON |
| `FCM_PROJECT_ID`, `FCM_API_BASE`, `FCM_TIMEOUT`, `FCM_RETRY_SLEEP_MS` | opt | opt | project id defaults to the one in the JSON |

## Billing
| `BILLING_PROVIDER` | `none` | `none` until launch; `stripe` when ready; `fake` is an ERROR | |
|---|---|---|---|
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | | **P** required with `stripe`, secrets | webhook secret may list two values during rotation |
| `STRIPE_PRICE_PLUS`, `STRIPE_PRICE_PRO` | opt | opt | otherwise the plan's own price is sent inline |
| `STRIPE_API_VERSION`, `STRIPE_API_BASE`, `STRIPE_TIMEOUT`, `STRIPE_WEBHOOK_TOLERANCE` | opt | pin the API version | |
| `BILLING_GRACE_DAYS` 7, `BILLING_DUNNING_REMINDER_DAYS` 3,6 | | product decision | |
| `BILLING_TAX_COUNTRY` | empty | set only after the accountant decides | rates are never hard-coded |
| `BILLING_SEED_PLANS_ACTIVE` | true locally | `false` | paid plans are seeded inactive |
| `BILLING_FAKE_WEBHOOK_SECRET` | local only | never | |

## Jobs
| `JOBS_SSRF_DNS_CHECK` | `true` | **P** must be `true` | tests set it false |
|---|---|---|---|

## Object storage / other framework variables
`FILESYSTEM_DISK`, `AWS_*`, `MEMCACHED_*`, `DYNAMODB_*`, `SQS_*`, `BEANSTALKD_*`, `SLACK_*`, `VITE_APP_NAME`: framework defaults, unused unless that driver is selected. Uploaded documents use the private `documents` disk (never public).

## Community, marketplace, moderation, explainer, OCR, housing, learning (RA-8)
| Variable | Default | Production | Notes |
|---|---|---|---|
| `COMMUNITY_ENABLED` | `false` | `true` only with at least one user holding the `moderator` role | preflight warns otherwise (`community_no_moderator`) |
| `COMMUNITY_PREMODERATION` | `new_users` | `new_users` or `all` | who is held in the moderation queue |
| `COMMUNITY_ERASE_TEXT` | `false` | per legal decision | erase post text (not only the author) on account deletion |
| `MODERATION_MAX_LINKS` | `2` | `2` | links allowed in a post before it is held |
| `MODERATION_NEW_ACCOUNT_DAYS` | `3` | `3` | accounts younger than this are "new" |
| `MARKETPLACE_LIST_UNVERIFIED` | `true` | consider `false` | `false` lists only verified providers |
| `MARKETPLACE_VERIFICATION_DAYS` | `365` | `365` | default validity of an approved verification |
| `MARKETPLACE_REVIEW_MIN_ACCOUNT_HOURS` | `24` | `24` | minimum account age to post a review |
| `MARKETPLACE_LEAD_RETENTION_DAYS` | `365` | per privacy policy | `expa:prune-marketplace-leads` |
| `EXPLAIN_MAX_FILE_KB` / `EXPLAIN_MAX_PIXELS` / `EXPLAIN_MAX_DIMENSION` / `EXPLAIN_MAX_PDF_PAGES` / `EXPLAIN_MAX_TEXT_CHARS` | 8192 / 25000000 / 10000 / 5 / 15000 | defaults | document explainer upload and text bounds |
| `OCR_DRIVER` | `null` | `tesseract` (preflight warns on `null`) | `null` = clients fall back to pasted text |
| `OCR_TESSERACT_BINARY`, `OCR_PDFTOTEXT_BINARY`, `OCR_PDFTOPPM_BINARY` | auto | absolute paths if not on PATH | |
| `OCR_LANGUAGES` | `ita+eng+ara` | | Tesseract language packs |
| `OCR_TEMP_DIR` | `storage/app/private/ocr-tmp` | private path | temp files are deleted after use |
| `OCR_TIMEOUT_SECONDS` | `25` | | per OCR process |
| `HOUSING_MAX_CHARS` / `HOUSING_RETENTION_DAYS` | 12000 / 90 | per privacy policy | rental checker input size, saved-result retention |
| `LEARNING_REQUIRE_TEACHER_REVIEW` | `false` | `true` once a teacher reviews content | preflight warns when `false` |
| `PATENTE_LEGACY_RIGHTS_NOTE` | `true` | `true` | note on questions imported before licence tracking |

## Additional product variables (RA-8)
| Variable | Default | Notes |
|---|---|---|
| `AI_RETRY_SLEEP_MS` | `400` | wait between LLM retries |
| `ANTHROPIC_BASE_URL` | `https://api.anthropic.com` | override only for a proxy |
| `APP_PREVIOUS_KEYS` | empty | comma separated old APP_KEYs during rotation |
| `CORS_ALLOWED_ORIGINS` | `FRONTEND_URL` | explicit origins, never `*` |
| `SANCTUM_TOKEN_EXPIRATION` / `SANCTUM_TOKEN_PREFIX` / `SANCTUM_STATEFUL_DOMAINS` | 43200 / empty / local | token lifetime in minutes, secret-scanning prefix, SPA domains |
| `DOCUMENTS_ENCRYPT` | `true` | must stay `true` (preflight) |
| `FCM_API_BASE` / `FCM_CREDENTIALS_JSON` / `FCM_RETRY_SLEEP_MS` / `FCM_TIMEOUT` | Google / none / 250 / 10 | push delivery |
| `STRIPE_API_BASE` / `STRIPE_API_VERSION` / `STRIPE_PRICE_PLUS` / `STRIPE_PRICE_PRO` / `STRIPE_TIMEOUT` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_WEBHOOK_TOLERANCE` | see `config/billing.php` | webhook secret may be comma separated for rotation; secrets from the secret manager |
| `BILLING_FAKE_WEBHOOK_SECRET` | local value | only with `BILLING_PROVIDER=fake` (never production) |

## Framework variables (unchanged Laravel config, RA-8)
Listed so that every `env()` key in `config/` is documented; leave unset unless that driver is chosen.
`AUTH_GUARD`, `AUTH_MODEL`, `AUTH_PASSWORD_BROKER`, `AUTH_PASSWORD_RESET_TOKEN_TABLE`, `AUTH_PASSWORD_TIMEOUT`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`, `AWS_BUCKET`, `AWS_ENDPOINT`, `AWS_URL`, `AWS_USE_PATH_STYLE_ENDPOINT`, `BEANSTALKD_QUEUE`, `BEANSTALKD_QUEUE_HOST`, `BEANSTALKD_QUEUE_RETRY_AFTER`, `CACHE_PREFIX`, `CACHE_STORAGE_DISK`, `CACHE_STORAGE_PATH`, `DB_CACHE_CONNECTION`, `DB_CACHE_LOCK_CONNECTION`, `DB_CACHE_LOCK_TABLE`, `DB_CACHE_TABLE`, `DB_ENCRYPT`, `DB_FOREIGN_KEYS`, `DB_QUEUE_CONNECTION`, `DB_QUEUE_TABLE`, `DB_TRUST_SERVER_CERTIFICATE`, `DYNAMODB_CACHE_TABLE`, `DYNAMODB_ENDPOINT`, `LOG_DEPRECATIONS_TRACE`, `LOG_PAPERTRAIL_HANDLER`, `LOG_SLACK_EMOJI`, `LOG_SLACK_USERNAME`, `LOG_STDERR_FORMATTER`, `LOG_SYSLOG_FACILITY`, `MAIL_EHLO_DOMAIN`, `MAIL_LOG_CHANNEL`, `MAIL_SENDMAIL_PATH`, `MAIL_URL`, `MEMCACHED_HOST`, `MEMCACHED_PASSWORD`, `MEMCACHED_PERSISTENT_ID`, `MEMCACHED_PORT`, `MEMCACHED_USERNAME`, `PAPERTRAIL_PORT`, `PAPERTRAIL_URL`, `POSTMARK_MESSAGE_STREAM_ID`, `REDIS_BACKOFF_ALGORITHM`, `REDIS_BACKOFF_BASE`, `REDIS_BACKOFF_CAP`, `REDIS_CACHE_CONNECTION`, `REDIS_CACHE_DB`, `REDIS_CACHE_LOCK_CONNECTION`, `REDIS_CLUSTER`, `REDIS_DB`, `REDIS_MAX_RETRIES`, `REDIS_PERSISTENT`, `REDIS_QUEUE_CONNECTION`, `REDIS_URL`, `REDIS_USERNAME`, `SESSION_CONNECTION`, `SESSION_DOMAIN`, `SESSION_ENCRYPT`, `SESSION_EXPIRE_ON_CLOSE`, `SESSION_HTTP_ONLY`, `SESSION_PARTITIONED_COOKIE`, `SESSION_PATH`, `SESSION_SAME_SITE`, `SESSION_SECURE_COOKIE`, `SESSION_STORE`, `SESSION_TABLE`, `SLACK_BOT_USER_DEFAULT_CHANNEL`, `SLACK_BOT_USER_OAUTH_TOKEN`, `SQS_PREFIX`, `SQS_QUEUE`, `SQS_SUFFIX`.

## Queue names and container-level variables (infrastructure, 2026-10-08)
| Variable | Local | Staging | Production | Notes |
|---|---|---|---|---|
| `DB_QUEUE`, `REDIS_QUEUE` | `default` | `default` | `default` | queue name per driver (`config/queue.php`); the compose workers run the default queue, change both together |
| `REDIS_PREFIX` | app default | `expa-staging-` | `expa-prod-` | key prefix; also used by `scripts/monitor.sh` to read queue depth (`<prefix>queues:default`) |
| `SESSION_DRIVER` | `database` | `redis` | `redis` | unused by the token API |
| `APP_MAINTENANCE_DRIVER` / `APP_MAINTENANCE_STORE` | `file` | `cache` / `redis` | `cache` / `redis` | `artisan down` must be visible to every container |
| `LOG_CHANNEL` | `stack` | `stderr` | `stderr` | containers log to stderr (Docker json-file rotation 20m x 5) |
| `TRUSTED_PROXIES` | empty | `172.28.0.0/16` | `172.28.0.0/16` | the fixed `backend` subnet of `docker-compose.prod.yml`; change both together |

Compose-level (not read by Laravel; `deploy/env/stack.env`, `db.env`, `redis.env`; documented in DEPLOYMENT.md): `API_IMAGE`, `WEB_IMAGE`, `API_HOST`, `WEB_HOST`, `CERTS_DIR`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD` (secret, equals `DB_PASSWORD`), `MYSQL_ROOT_PASSWORD` (secret), `REDIS_PASSWORD` (secret, equals the Laravel one). Web container: `NODE_ENV`, `HOST`, `PORT`, `NUXT_*` (DEPLOYMENT.md). Backup scripts (host env file, root-only, not in the app): `BACKUP_DIR`, `BACKUP_PASSPHRASE_FILE`, `KEEP_DAILY|WEEKLY|MONTHLY`, `BACKUP_REMOTE`, `DUMP_BIN`, `DB_DOCKER_EXEC` (OPERATIONS.md). No Sentry/OpenTelemetry variable exists (not integrated, EXTERNAL_SERVICES.md section 8).

## Local / staging / production at a glance
| Concern | Local | Staging | Production |
|---|---|---|---|
| Debug | `APP_DEBUG=true` | `false` | `false` (**P**) |
| URLs | http localhost | https staging hosts | https production hosts (**P**) |
| Database | sqlite or compose mysql | mysql, own schema and credentials | mysql managed, TLS (**P**: not sqlite) |
| Cache / queue | file or database / sync ok | redis / redis | redis / redis (warning otherwise; array/sync ERROR) |
| AI | `fake` | `anthropic`, low quota | `anthropic` (**P**), `AI_DAILY_TOKEN_BUDGET` > 0 |
| Antivirus | `basic` | `clamav` | `clamav` + fail closed (**P**) |
| Mail | `log` / Mailpit | `smtp` to Mailpit | provider `smtp` (**P**) |
| Push | `log` | `log` or FCM test project | `fcm` |
| Billing | `none` / `fake` | `stripe` test mode or `none` | `none` until launch, then `stripe`; `fake` is an ERROR |
| OCR | `null` | `tesseract` if image has it | `tesseract` (warning on `null`) |
| Secrets | `.env`, git-ignored | separate, secret manager | secret manager; never shared with staging |
| Content four-eyes | true | true | true (**P**) |

## Preflight checks (`php artisan expa:preflight --production`)
Blocking: app key, debug, https URLs, sqlite, sync/array drivers, CORS wildcard, token expiry, fake AI/billing, scanner, mail, SSRF check, proxies, **`CONTENT_FOUR_EYES=false` (`four_eyes_off`)**. Warnings: push stub, cache/queue not redis, logging, timezone, **draft `PRIVACY_POLICY_VERSION` with no published privacy document (`privacy_policy_draft`)**, **`OCR_DRIVER=null` (`ocr_null`)**, **`LEARNING_REQUIRE_TEACHER_REVIEW=false` (`teacher_review_off`)**, **community enabled without a moderator (`community_no_moderator`)**.
