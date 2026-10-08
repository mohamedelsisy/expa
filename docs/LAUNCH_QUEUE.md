# Launch queue (prioritised)

Snapshot 2026-10-08. Source: TASKS.md, FINAL_REPORT.md, LAUNCH_CHECKLIST.md (detail per area), EXTERNAL_SERVICES.md (verification commands), OPERATIONS.md. Nothing here is DONE unless it says so; no provider, host, device or store was touched. Roles as in the checklist. LQ ids are new and local to this file; "Task ID" cites the existing TASKS.md id where one exists.

Priorities: P0 = launch cannot happen without it. P1 = needed for a safe public launch. P2 = needed shortly after or for scope decisions. P3 = later.

## P0

| ID | Task ID | Description | Status | Owner | Dependency | Blocker | Required action |
|---|---|---|---|---|---|---|---|
| LQ-01 | T-057 | Hosting, domains, TLS, staging environment (`docker-compose.prod.yml` + staging override) | BLOCKED_INFRASTRUCTURE | DevOps | none | No host, domain, certificates | Provision; follow DEPLOYMENT.md first deployment; run `docker compose config -q`, `nginx -t` and the proxy identity check |
| LQ-02 | T-057 | Production-grade MySQL 8 with TLS and PITR; Redis with password and `noeviction` | BLOCKED_INFRASTRUCTURE | DevOps | LQ-01 | Not provisioned | Provision managed or compose services; `migrate --force` |
| LQ-03 | T-084 | `expa:preflight --production` clean (zero ERROR) on staging with production-shaped env | TODO | DevOps | LQ-01, LQ-02, LQ-05..LQ-07 | Needs real env | Run `scripts/preflight.sh` in the deploy pipeline as the gate |
| LQ-04 | T-043 | ClamAV daemon live, EICAR rejected, outage gives 503 | BLOCKED_INFRASTRUCTURE | DevOps | LQ-01 | clamd never started | EXTERNAL_SERVICES.md section 5 |
| LQ-05 | T-019 | Anthropic key, spend limit, `AI_DAILY_TOKEN_BUDGET`, live verification in ar/en/it | BLOCKED_EXTERNAL_CREDENTIAL | Owner | none | No account/key | EXTERNAL_SERVICES.md section 1 |
| LQ-06 | MVP-6 | Real SMTP + SPF/DKIM/DMARC (unverified users cannot use AI/exams) | BLOCKED_EXTERNAL_CREDENTIAL | DevOps | LQ-01 | No provider/domain records | EXTERNAL_SERVICES.md section 4 |
| LQ-07 | T-070 | Counsel-approved privacy policy, terms, cookies published (ar required); `PRIVACY_POLICY_VERSION` set | BLOCKED_LEGAL | Legal counsel | none | No text approved | Draft/approve, publish via `/admin/legal`, verify re-consent |
| LQ-08 | BE-12 | Retention periods and system-analytics basis signed off | BLOCKED_LEGAL | Legal counsel | none | Human decision | Approve or change; set `ANALYTICS_SYSTEM_EVENTS` accordingly |
| LQ-09 | DPAs | Data-processing agreements: Anthropic, mail, hosting, Firebase (if used), Stripe (if used) | BLOCKED_LEGAL | Legal counsel | providers chosen | Not contracted | Sign; document sub-processors/transfers |
| LQ-10 | T-041 and related | First slice of sourced content (immigration guides, government services/offices, appointment guides) in ar/en/it | BLOCKED_CONTENT | Content team | LQ-01 for entry | Zero published | Author through the four-eyes workflow; then `expa:ai-reindex`, `expa:search-reindex` |
| LQ-11 | T-035 | Patente: either licensed question bank + official rule verification, or launch theory only and hide exams | BLOCKED_LEGAL | Legal counsel | none | No licence | Decide scope; each question needs license fields |
| LQ-12 | T-036 | Jobs: licensed feeds with `legal_basis`, or launch without Jobs | BLOCKED_LEGAL | Legal counsel | none | No feeds | Decide scope; the section stays empty otherwise |
| LQ-13 | - | Backups scheduled, offsite copy, `APP_KEY` custody, restore drill with measured RTO/RPO | TODO | DevOps | LQ-01, LQ-02 | Scripts exercised on a toy DB only | OPERATIONS.md backups and restore drill |
| LQ-14 | - | CI green run on GitHub (all jobs) | DONE | DevOps | none | Run 37723171358: 7/7 jobs green (2026-10-08) | Add branch protection |
| LQ-15 | - | External penetration test | TODO | Owner | LQ-01 (staging) | Never performed | Commission against staging |

## P1

| ID | Task ID | Description | Status | Owner | Dependency | Blocker | Required action |
|---|---|---|---|---|---|---|---|
| LQ-20 | - | Monitoring and alerting wired (uptime, failed jobs, queue depth, scheduler heartbeat, disk, cert expiry, 5xx) | PARTIAL | DevOps | LQ-01 | Probes written; no stack/channel | OPERATIONS.md monitoring plan; fix `pending_queue_jobs` gap (reads 0 on redis) |
| LQ-21 | - | Error tracking with PII scrubbing (Sentry/OTel) | TODO | DevOps | decision | Not integrated in code; needs account + code change | Decide; add package, DSN env, scrubber; update ENVIRONMENT.md |
| LQ-22 | - | Load test phases 1-5 on staging with realistic data | PARTIAL | QA | LQ-01, LQ-10 | Only a 25 s dev smoke exists | LOAD_TESTING.md |
| LQ-23 | - | Zero-downtime deploy (two api replicas) or accept brief 502 per release | TODO | DevOps | LQ-01 | Untested | Decide; rehearse `scripts/deploy.sh` and `rollback.sh` on staging |
| LQ-24 | T-072 | OCR in the backend image (tesseract + ita/eng/ara + poppler) and `OCR_DRIVER=tesseract` | BLOCKED_INFRASTRUCTURE | Backend dev | none | Dockerfile lacks packages | Edit `backend/Dockerfile`, rebuild, EXTERNAL_SERVICES.md section 9 |
| LQ-25 | T-016b | Firebase project, service account, push verification on real devices | BLOCKED_EXTERNAL_CREDENTIAL | Owner | LQ-30 | No project | EXTERNAL_SERVICES.md section 2 |
| LQ-26 | T-034 | Italian curriculum teacher/native review; `LEARNING_REQUIRE_TEACHER_REVIEW=true` | BLOCKED_CONTENT | Content team | none | Human reviewer | Review and mark items |
| LQ-27 | - | Web dependency overrides (simple-git 4.0.2 / argv-parser 2.0.1) verified by build + tests; CI audit gate at critical | DONE | Web dev | none | postcss-selector-parser override not applied (moderate only) | Re-check upstream for braces/node-forge |
| LQ-28 | - | Reverse-proxy rate-limit identity check on staging | DEVICE_VERIFICATION_REQUIRED | DevOps | LQ-01 | Needs real proxy | DEPLOYMENT.md proxy identity check |
| LQ-29 | - | Breach-notification procedure (72 h) and DPO/ROPA/DPIA decision | BLOCKED_LEGAL | Legal counsel | none | Not in repo | Write procedure; link from OPERATIONS.md incident section |
| LQ-30 | T-028 | Mobile: first build/run on Android and iOS devices; final application/bundle id | DEVICE_VERIFICATION_REQUIRED | Mobile dev / Owner | store accounts for iOS | Never run on a device | docs/MOBILE_SETUP.md |
| LQ-31 | - | Launch decision on billing: free-only (`BILLING_PROVIDER=none`) or paid | TODO | Owner | none | Business decision | If free-only, LQ-40 items are post-launch |
| LQ-32 | - | `EXPORT_REQUIRE_PASSWORD=true` after web and mobile use the POST export flow | TODO | Backend dev | clients | Clients must switch | Verify both, flip |
| LQ-33 | - | `OFFICIAL_DOMAINS_EXTRA` populated with verified domains | BLOCKED_CONTENT | Content team | none | Human verification | List only verified domains |

## P2

| ID | Task ID | Description | Status | Owner | Dependency | Blocker | Required action |
|---|---|---|---|---|---|---|---|
| LQ-40 | T-038, T-058 | Stripe live integration: test mode end to end, VAT rates, invoice model, terms/refunds | BLOCKED_EXTERNAL_CREDENTIAL | Owner / Accountant | LQ-31 | No account, accountant decision | EXTERNAL_SERVICES.md section 3 |
| LQ-41 | T-062/T-061 | Enable community/marketplace only with a staffed moderation/verification team and counsel-reviewed wording | BLOCKED_LEGAL | Product / Legal | team | Business decision | Keep `COMMUNITY_ENABLED=false` until then |
| LQ-42 | - | Universal/App Links files, store listings, Data Safety/App Store labels, screenshots | BLOCKED_INFRASTRUCTURE | DevOps / Owner | LQ-01, LQ-30 | Final host and signing keys | MOBILE_SETUP.md |
| LQ-43 | - | Documents restore script and S3-compatible storage for documents (code change) | TODO | Backend dev | decision | `documents` disk is local-only | Decide whether needed beyond volume backups |
| LQ-44 | T-082/T-083 | Tax tables and travel requirements entered with sources | BLOCKED_CONTENT | Content / Accountant | none | Engines ship empty | Enter and publish verified data |
| LQ-45 | T-075 | Web/mobile screens for housing checker, document explainer, recommendations | BACKLOG | Web dev / Mobile dev | none | Not built | Scope for launch or after |
| LQ-46 | - | Accessibility pass (keyboard, screen reader, `/it` admin layout), native-Arabic visual review | DEVICE_VERIFICATION_REQUIRED | QA | LQ-01 | Manual | Run and record |

## P3

| ID | Task ID | Description | Status | Owner | Dependency | Blocker | Required action |
|---|---|---|---|---|---|---|---|
| LQ-50 | T-042 | LLM-based intent and sensitivity detection | BACKLOG | Backend dev | none | none | Decide if the keyword detector is acceptable |
| LQ-51 | T-056 | Job alerts for saved criteria | BLOCKED_LEGAL | Legal counsel | LQ-12 | New consent purpose | Approve text, then build |
| LQ-52 | T-063 | Community events, language exchange, groups | BACKLOG | Product | none | Out of scope | Later |
| LQ-53 | - | WhatsApp/Telegram, SDI e-invoicing, OpenAPI generation, brotli at the edge | TODO | various | none | Not built | After launch |

## Contradictions found while building this queue
1. LAUNCH_CHECKLIST said CI had "no git remote"; the repository has `origin` (github.com) and is on master tracking origin/master.
2. `GET /admin/stats` `system.pending_queue_jobs` counts the SQL `jobs` table (StatsController) so it is 0 with `QUEUE_CONNECTION=redis`; DEPLOYMENT.md previously recommended it for queue depth.
3. DEPENDENCY_AUDIT.md said 17 high / 2 advisories with no patched versions; today it is 23 findings including 6 critical, and patched simple-git (4.0.2) and argv-parser (2.0.1) exist.
4. ENVIRONMENT.md omitted `DB_QUEUE` and `REDIS_QUEUE` (now documented); `scripts/check-env-docs.sh` keeps docs and `config/*.php` in sync.
5. The stock backend image has no tesseract/poppler although the docs list OCR as an installable option; with `OCR_DRIVER=tesseract` the binding silently degrades to `NullOcrEngine`.
6. The `documents` disk is hard-wired to local storage (`config/filesystems.php`); `FILESYSTEM_DISK`/`AWS_*` do not move user documents, so S3 cannot simply be "configured".
