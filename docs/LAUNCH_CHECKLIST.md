# EXPA — Launch checklist

Snapshot: 2026-10-08 (infrastructure, operations, dependency and load-test rows updated; the rest as of 2026-10-07; prioritised queue in LAUNCH_QUEUE.md). Derived from the repository docs (EXTERNAL_SERVICES, ENVIRONMENT, DEPLOYMENT, SECURITY, GDPR, CONTENT_VERIFICATION, MOBILE_SETUP, MVP_AUDIT, PRODUCTION_AUDIT_*), the BLOCKED rows of TASKS.md and the checks in `php artisan expa:preflight --production` (`backend/app/Console/Commands/Preflight.php`). Nothing below was executed against a real provider, device, store or production host; "DONE" means done in the repository and covered by automated tests only.

Status values: DONE, PARTIAL, TODO, BLOCKED_EXTERNAL_CREDENTIAL, BLOCKED_INFRASTRUCTURE, BLOCKED_LEGAL, BLOCKED_CONTENT, DEVICE_VERIFICATION_REQUIRED.
Owners are roles: Owner (product/business owner), Legal counsel, DevOps, Content team, Mobile dev, Backend dev, Web dev, Accountant, QA.

## 1. Code Complete
| Item | Status | Owner | Blocker | Required action |
|---|---|---|---|---|
| Backend API (auth, profile, consents, RBAC, content engine, guides, government, appointments, documents tracker, reminders, notifications, dashboard, AI pipeline, Italian, Patente, jobs, search, billing, analytics, study, articles, city profiles, marketplace, community, legal, housing, document explainer) | DONE | Backend dev | none | Keep `php artisan test` green on SQLite and MariaDB/MySQL (docs/QA.md). Test counts quoted in docs differ; re-run and update. |
| Web (Nuxt): auth, onboarding, dashboard, guides, admin UI | DONE | Web dev | Keyboard/screen-reader and `/it` layout of the admin UI not verified (TASKS T-027) | Run the accessibility pass. |
| Web screens for housing checker, document explainer, marketplace UI, community | TODO | Web dev | none | T-075 (clients) is BACKLOG; check web/ for what exists before scoping. |
| Mobile (Flutter) app | PARTIAL | Mobile dev | Never built or run on a device (TASKS T-028) | See sections 7 and 8. |
| Live job alerts for saved criteria | BLOCKED_LEGAL | Legal counsel | Needs a new consent purpose and counsel-approved text (T-056) | Decide, approve text, then build. |
| Job matcher education criterion | BLOCKED_CONTENT | Backend dev | Listings carry no education field (T-055) | Only after a source supplies it. |
| LLM-based intent/sensitivity detection | TODO | Backend dev | none (P2, BACKLOG T-042) | Keyword detector is a known limit; decide whether it is acceptable at launch. |
| OpenAPI generation (T-DOC-01) | TODO | Backend dev | none | See TODO list at the end of docs/API_SPEC.md. |
| Community events, language exchange, groups (T-063) | TODO | Product | Out of scope, BACKLOG | Not for launch. |

## 2. Infrastructure
| Item | Status | Owner | Blocker | Required action |
|---|---|---|---|---|
| Hosting, TLS, domains (API origin and web origin, https) | BLOCKED_INFRASTRUCTURE | DevOps | None provisioned | Provision; set `APP_URL` (API origin as reachable by the web BFF, T-033) and `FRONTEND_URL` to https. Preflight errors otherwise. |
| MySQL 8 / MariaDB production database with TLS | BLOCKED_INFRASTRUCTURE | DevOps | SQLite is rejected by preflight (`sqlite`) | Provision managed DB; run `php artisan migrate --force`. |
| Redis (cache + queue) | BLOCKED_INFRASTRUCTURE | DevOps | None provisioned (T-057) | `CACHE_STORE=redis`, `QUEUE_CONNECTION=redis`. `array/null` cache and `sync` queue are preflight errors; database stores are warnings. |
| Supervised queue worker and scheduler | PARTIAL | DevOps | Definitions written (compose `queue`/`scheduler` with restart policy, `deploy/supervisor`, `deploy/systemd`, cron), never run; no host | Start on staging; `scripts/monitor.sh` must show a fresh `scheduler_age_s`. Note: `admin/stats` `pending_queue_jobs` reads 0 under the redis queue, monitor Redis instead. |
| Docker images and compose (`docker-compose.prod.yml`, `docker-compose.staging.yml`, `docker/nginx`, `deploy/env`) | PARTIAL | DevOps | YAML parsed and cross-checked only; Docker is not installed here so `docker compose config`, image builds and `nginx -t` were NOT run | Run `config -q`, build in CI, `nginx -t` in the edge container, bring up staging. The backend image lacks tesseract/poppler (OCR). |
| CI (`.github/workflows/ci.yml`) | PARTIAL | DevOps | A git remote exists (`origin`, master); trigger was reported fixed on 2026-10-08; no green run has been verified from this repo state | Confirm a full green run (backend SQLite/MySQL/MariaDB, web, e2e, mobile, audits, gitleaks) and fix first-run findings. |
| Staging environment | BLOCKED_INFRASTRUCTURE | DevOps | Does not exist | Deploy per docs/DEPLOYMENT.md; this is the first real verification. |
| Reverse proxy checklist (Host, X-Forwarded-*, `TRUSTED_PROXIES`, `NUXT_TRUSTED_PROXY_HOPS`, gzip, no HTML edge cache) | DEVICE_VERIFICATION_REQUIRED | DevOps | Needs a real proxy | Validate on staging: 6 failed logins from one IP must not throttle another IP. |
| `APP_ENV=production`, `APP_DEBUG=false`, `APP_KEY`, `APP_TIMEZONE=Europe/Rome`, `LOG_LEVEL`, daily/stderr logging | TODO | DevOps | Secrets and host needed | Set; run `php artisan expa:preflight --production` in the pipeline until zero errors and review warnings. |
| First deploy steps (migrate, `expa:sync-access`, GeographySeeder, DocumentTypeSeeder, PlanSeeder, caches, `expa:ai-reindex`, `expa:search-reindex`, `expa:make-admin`) | TODO | DevOps | Needs host | Follow docs/DEPLOYMENT.md release procedure. |
| OCR engine for the document explainer (tesseract + language packs, `OCR_DRIVER=tesseract`) | BLOCKED_INFRASTRUCTURE | DevOps | Not in the stock `backend/Dockerfile` (needs tesseract-ocr + ita/eng/ara data + poppler-utils; backend owner must edit it); not installed in production; without it `GET /documents/explain/usage` reports `ocr_available:false` and users must paste text (T-072) | Install, tune on real photos. |

## 3. Credentials
| Item | Status | Owner | Blocker | Required action |
|---|---|---|---|---|
| `ANTHROPIC_API_KEY` (`AI_DRIVER=anthropic`, `AI_MODEL`, `AI_DAILY_TOKEN_BUDGET`) | BLOCKED_EXTERNAL_CREDENTIAL | Owner | No key (T-019); preflight errors on `AI_DRIVER=fake` and missing key; warns on budget 0 | Create key with spend limit, store in secret manager. |
| Firebase service account (`FCM_CREDENTIALS_PATH` or `FCM_CREDENTIALS_JSON`, `PUSH_DRIVER=fcm`) | BLOCKED_EXTERNAL_CREDENTIAL | Owner | No Firebase project (T-016b); preflight warns `push_stub` | See docs/EXTERNAL_SERVICES.md section 2. |
| Stripe keys and webhook secret (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_API_VERSION`, optional price ids) | BLOCKED_EXTERNAL_CREDENTIAL | Owner | No Stripe account (T-038, T-058) | Only needed if paid plans launch; otherwise leave `BILLING_PROVIDER=none` (preflight warns only). `fake` is a preflight error. |
| SMTP credentials | BLOCKED_EXTERNAL_CREDENTIAL | DevOps | No provider; preflight errors on `log`/`array` mailer | See section 11. |
| Secret manager with all production secrets; none in git (CI runs gitleaks) | TODO | DevOps | none | Provision and document custody of `APP_KEY` (SECURITY.md key rotation runbook). |
| Android upload keystore and Play App Signing | BLOCKED_EXTERNAL_CREDENTIAL | Mobile dev | Owner must generate the key (docs/MOBILE_SETUP.md section 4) | Release tasks fail on purpose without it. |
| Apple Developer account, APNs auth key, signing profile | BLOCKED_EXTERNAL_CREDENTIAL | Owner | Not available | Needed for TestFlight, push and associated domains. |

## 4. Content
No guides, government services, appointment guides, study programmes, job listings or Patente questions are shipped; seeders add only structure and starter material (MVP_AUDIT rows 10-12, 15, 25).
| Item | Status | Owner | Blocker | Required action |
|---|---|---|---|---|
| Sourced guides (documents and immigration, health, money, etc.) in ar/en/it | BLOCKED_CONTENT | Content team | Zero published; every item needs a verified official source and last-verified date | Author through the admin workflow (Draft, Review, Approved, Published; four-eyes). |
| Government services and offices | BLOCKED_CONTENT | Content team | Zero published | Enter from official sources. |
| Official domain allow-list for comune/ASL sites (`OFFICIAL_DOMAINS_EXTRA`, T-053) | BLOCKED_CONTENT | Content team | Real domains must be verified by a person | List verified domains only. |
| Appointment guides | BLOCKED_CONTENT | Content team | Zero published | Enter official booking destinations. |
| Italian curriculum review (T-034) | BLOCKED_CONTENT | Content team | Needs an Italian teacher / native Arabic reviewer; B1-C1 empty | Mark items reviewed; consider `LEARNING_REQUIRE_TEACHER_REVIEW=true`. |
| Patente rules (`config/patente.php`) verified and licensed question bank (T-035) | BLOCKED_LEGAL | Legal counsel | Licence and official verification required; no questions shipped | Obtain rights; each question needs `license_type`, `rights_holder`, `license_proof_ref`. Section may launch as theory only. |
| Job sources with documented `legal_basis` (T-036) | BLOCKED_LEGAL | Legal counsel | No licensed feeds | Obtain feeds; activation requires `legal_basis`. Jobs section stays empty until then. |
| Study content (T-041) | BLOCKED_CONTENT | Content team | Sourced universities/programmes/fees/deadlines needed | Enter via admin with official sources. |
| Housing rule texts native review; sourced rules for any statutory number (T-071) | BLOCKED_CONTENT | Content team | Native review pending | Review; add sourced rules for numeric limits only with source. |
| Articles and city profiles | BLOCKED_CONTENT | Content team | None published | Optional for launch. |

## 5. Legal
| Item | Status | Owner | Blocker | Required action |
|---|---|---|---|---|
| Privacy policy, terms, cookie policy published through `/admin/legal` (T-070) | BLOCKED_LEGAL | Legal counsel | No text exists; `GET /legal/{slug}` returns 404 and web shows "not published yet" | Counsel drafts or approves in ar (required), en, it; record approval reference in source fields. Required for store listings. |
| Sign-off on retention periods and system-analytics basis (BE-12, `ANALYTICS_SYSTEM_EVENTS`) | BLOCKED_LEGAL | Legal counsel | Human process | Decide; set `ANALYTICS_SYSTEM_EVENTS=false` if counsel disagrees (docs/GDPR.md). |
| Marketplace and community consent/notice wording (T-061, T-062) | BLOCKED_LEGAL | Legal counsel | Review pending | Review before enabling those modules. |
| Business-message consent purpose (provider email/push, T-064; announcements by email/push) | BLOCKED_LEGAL | Legal counsel | No purpose exists | Add purpose with approved text before building. |
| Payments terms, refunds, withdrawal rights, VAT and invoice obligations, SDI/e-invoicing decision (T-058) | BLOCKED_LEGAL | Accountant | Only if paid plans launch | Decide; fill VERIFIED rows in `tax_rates`; `invoices` are receipts until decided. |
| Registration email-enumeration decision (BE-15) | TODO | Owner | Product/legal decision, WONTFIX for now | Confirm acceptance. |

## 6. Security
| Item | Status | Owner | Blocker | Required action |
|---|---|---|---|---|
| Code-level controls (hashing, token expiry, rate limits, authz matrix tests, encryption of sensitive columns/files, headers, upload validation, audit logs) | DONE | Backend dev | none | Independent review findings fixed (docs/SECURITY.md). |
| Real antivirus: ClamAV (`DOCUMENTS_SCANNER=clamav`, `CLAMAV_FAIL_CLOSED=true`) (T-043) | BLOCKED_INFRASTRUCTURE | DevOps | No clamd; `basic` scanner is a preflight error | Run clamd, verify EICAR rejection and the 503 `scanner_unavailable` path. |
| `JOBS_SSRF_DNS_CHECK=true`, explicit CORS origins, token expiry | TODO | DevOps | Production env | Preflight enforces; confirm. |
| External penetration test | TODO | Owner | Never performed | Commission before launch. |
| Dependency advisories (web `npm audit --omit=dev`: 23 findings, 6 critical, all in dev/build tooling; none in `.output`) | PARTIAL | Web dev | Critical simple-git advisories have patched versions (4.0.2) reachable only by a cross-major `overrides` that is untested; braces/node-forge have no patch (docs/DEPENDENCY_AUDIT.md) | Apply and verify the overrides in a branch with build + tests; gate CI at critical. Backend `composer audit` clean. |
| Key custody and `APP_PREVIOUS_KEYS` rotation runbook | PARTIAL | DevOps | Bulk re-encrypt command not built (WONTFIX) | Store `APP_KEY` safely; no rotation planned. |

## 7. Mobile
| Item | Status | Owner | Blocker | Required action |
|---|---|---|---|---|
| `flutter analyze` and tests | DONE | Mobile dev | none | Re-run before each build. |
| First build and run on Android and iOS devices | DEVICE_VERIFICATION_REQUIRED | Mobile dev | Never run on a device or emulator | Build, exercise login, dashboard, documents, AI, jobs, learning. |
| Final application id / bundle id (placeholder `it.expa.app`) | TODO | Owner | Owner decision, immutable after publishing | Decide before creating store records. |
| Release build with `EXPA_API_BASE_URL` https (refused otherwise), R8 shrinking check | DEVICE_VERIFICATION_REQUIRED | Mobile dev | Needs signing key | Run a release build and exercise login, push, links. |
| Push (firebase_core, google-services, APNs, `FcmPushSender` template bound) | BLOCKED_EXTERNAL_CREDENTIAL | Mobile dev | Firebase project and APNs key | docs/MOBILE_SETUP.md section 5; verify on real devices. |
| Universal/App Links (`assetlinks.json`, apple-app-site-association, `-PexpaLinkHost`) | BLOCKED_INFRASTRUCTURE | DevOps | Final web host and signing fingerprints | Publish files; verify with `adb shell pm get-app-links`. |
| Camera scan and OCR plug-in (`OcrEngine`, e.g. ML Kit) | DEVICE_VERIFICATION_REQUIRED | Mobile dev | No OCR engine bundled; server OCR needs tesseract | Implement and test on camera. |
| Offline, exercise audio playback, Patente exams/study/housing/billing screens, bundled Arabic font, FLAG_SECURE, dark theme | TODO | Mobile dev | Not built | Decide which are launch scope. |
| TalkBack/VoiceOver, real Arabic RTL rendering | DEVICE_VERIFICATION_REQUIRED | QA | Needs devices | Test. |

## 8. App Store / Play Store
| Item | Status | Owner | Blocker | Required action |
|---|---|---|---|---|
| Developer accounts (Google Play, Apple) | BLOCKED_EXTERNAL_CREDENTIAL | Owner | Not created | Create. |
| Privacy policy and terms URLs | BLOCKED_LEGAL | Legal counsel | See section 5 | Required by both stores. |
| Play Data Safety form, App Store privacy labels | TODO | Owner | Needs final data inventory | Declare: account email/name, profile, document metadata, AI chats, push token, optional photos/text. |
| Screenshots ar/en/it incl. RTL, icon, splash (template defaults today), support email, age rating | TODO | Owner | Needs working builds | Produce after device verification. |
| Account-deletion URL (in-app deletion exists) | TODO | Owner | Public URL needed | Publish a page describing deletion. |
| Export compliance answer | TODO | Owner | none | HTTPS only. |
| TestFlight / internal testing track | BLOCKED_EXTERNAL_CREDENTIAL | Mobile dev | Accounts and signing | Run before release. |

## 9. Monitoring
| Item | Status | Owner | Blocker | Required action |
|---|---|---|---|---|
| Health endpoints (`/up`, `GET /api/v1/health`) and `GET /admin/stats` system block | DONE | Backend dev | none | Wire uptime checks. |
| Uptime, queue depth, failed jobs, 5xx rate, p95, disk, certificate expiry alerts | PARTIAL | DevOps | Probes written (`scripts/healthcheck.sh`, `scripts/monitor.sh`) and plan in docs/OPERATIONS.md; no monitoring stack or alert channel | Provision uptime monitor + alert channel and route the script exit codes. |
| Error tracking with PII scrubbing (Sentry/Flare) | TODO | DevOps | Account needed | Choose, scrub, verify no prompts or emails logged. |
| Log shipping and rotation | PARTIAL | DevOps | Docker json-file rotation and `deploy/logrotate/expa` written; no collector (T-057) | Choose a collector; keep personal data out of logs. |
| Load and performance tests | PARTIAL | QA | Plan, scripts (`tests/load`) and a 25 s dev-machine smoke exist (59.5 req/s, 0 5xx, NOT a load test, docs/LOAD_TESTING.md); nothing run on staging | Run phases 1-5 on staging with realistic data volumes. |
| Web end-to-end (Playwright, `web/e2e`) and axe accessibility | PARTIAL | QA | Config exists; not part of verified runs in audits | Run and record results. |

## 10. Backups
| Item | Status | Owner | Blocker | Required action |
|---|---|---|---|---|
| Daily DB snapshot with point-in-time recovery | PARTIAL | DevOps | `scripts/backup-db.sh` (encrypted, rotated) exercised against a throwaway MariaDB only; no production DB or backup storage | Schedule, add offsite copy, enable provider PITR. |
| Backup of private `documents` disk (encrypted files), same retention as DB | PARTIAL | DevOps | `scripts/backup-documents.sh` written and run on a sample directory; no restore script for documents; `APP_KEY` custody undecided | Schedule; back up `APP_KEY` separately; add and test a documents restore. |
| Restore drill, then `expa:ai-reindex` and `expa:search-reindex` | PARTIAL | DevOps | Procedure in docs/OPERATIONS.md; script path exercised on a toy database, not on the app schema, no RTO/RPO measured | Rehearse on staging with a real dump and record times. |
| Erasure replay after restore (erased users must not return) | TODO | DevOps | Runbook only | Re-run erasure from the audit trail after any restore. |
| Rollback by redeploying previous image tag (`scripts/rollback.sh`) | PARTIAL | DevOps | Script written, never run | Rehearse on staging. |

## 11. GDPR
| Item | Status | Owner | Blocker | Required action |
|---|---|---|---|---|
| Consent ledger, policy-version re-consent, export (`GET|POST /profile/export`), erasure (`DELETE /profile`, queued), per-module privacy providers (structural test), retention prune jobs | DONE | Backend dev | none | Keep structural test green. |
| `EXPORT_REQUIRE_PASSWORD=true` once clients use the POST flow | TODO | Backend dev | Web/mobile must switch to POST | Flip after verifying both clients. |
| Retention periods approved (audit 24 months, AI messages 12 months, housing `HOUSING_RETENTION_DAYS`, marketplace leads) | BLOCKED_LEGAL | Legal counsel | BE-12 | Approve or change. |
| Privacy policy text and re-consent on first publication | BLOCKED_LEGAL | Legal counsel | See section 5 | Publish; verify users are prompted. |
| Data-processing agreements with Anthropic, Firebase, Stripe, mail provider, hosting | BLOCKED_LEGAL | Legal counsel | Providers not selected/contracted | Sign DPAs; document sub-processors and transfers. |
| DPO / records of processing / DPIA decision | TODO | Legal counsel | Not addressed in repo | Decide whether required. |

## 12. Payments
| Item | Status | Owner | Blocker | Required action |
|---|---|---|---|---|
| Plans, subscriptions, invoices, webhooks, dunning, state machines | DONE | Backend dev | none | Tested with fakes only. |
| Launch decision: free-only (`BILLING_PROVIDER=none`, `billing_available:false`) or paid | TODO | Owner | Business decision | If free-only, nothing else here blocks. |
| Stripe live integration (T-038) | BLOCKED_EXTERNAL_CREDENTIAL | Owner | Account, keys, webhook endpoint | Test mode end to end with Stripe CLI, then live. Confirm event shapes against the pinned API version. |
| Approved prices and plans seeded (`PlanSeeder`; `BILLING_SEED_PLANS_ACTIVE`) | TODO | Owner | Prices are placeholders | Set approved prices; paid plans are seeded inactive outside local. |
| VAT rates and invoicing model | BLOCKED_LEGAL | Accountant | Decision pending | See section 5. |
| Web/mobile billing UI | TODO | Web dev | Not built on mobile; check web | Scope if paid launch. |

## 13. Notifications
| Item | Status | Owner | Blocker | Required action |
|---|---|---|---|---|
| In-app notifications and reminder engine | DONE | Backend dev | none | Scheduler must run (`expa:send-reminders` 08:00 Europe/Rome). |
| Email (verification, reset, reminders) over real SMTP; SPF/DKIM/DMARC | BLOCKED_EXTERNAL_CREDENTIAL | DevOps | No provider or domain records | Configure; verify RTL rendering and spam placement. |
| Push delivery (FCM) | BLOCKED_EXTERNAL_CREDENTIAL | DevOps | See section 3 | Verify token cleanup on uninstall. |
| Email/push for announcements and provider leads | BLOCKED_LEGAL | Legal counsel | No consent purpose | See section 5. |
| WhatsApp/Telegram | TODO | Product | Not built, future | Out of launch scope. |

## 14. External Services
Summary of docs/EXTERNAL_SERVICES.md. Every adapter is code complete and tested with fakes only; none has run against the real service.
| Service | Status | Owner | Blocker | Required action |
|---|---|---|---|---|
| ClamAV (T-043) | BLOCKED_INFRASTRUCTURE | DevOps | No clamd host | Section 5 of EXTERNAL_SERVICES, run EICAR and outage checks. |
| Firebase Cloud Messaging (T-016b) | BLOCKED_EXTERNAL_CREDENTIAL | Owner | No project | Create project and service account. |
| Stripe (T-038) | BLOCKED_EXTERNAL_CREDENTIAL | Owner | No account | See section 12. |
| Anthropic (T-019) | BLOCKED_EXTERNAL_CREDENTIAL | Owner | No key | Verify answers cite sources in ar/en/it; degraded mode when the key is revoked; logs contain no question text; native-speaker review of prompts and refusals. |
| SMTP | BLOCKED_EXTERNAL_CREDENTIAL | DevOps | No provider | See section 13. |
| Tesseract OCR | BLOCKED_INFRASTRUCTURE | DevOps | Not installed | See section 2. |
| Licensed job feeds | BLOCKED_LEGAL | Legal counsel | T-036 | See section 4. |
| SDI e-invoicing, WhatsApp, Telegram, APNs specifics beyond FCM relay | TODO | Owner | Not implemented | Out of launch scope unless decided otherwise. |
