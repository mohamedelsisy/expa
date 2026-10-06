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
