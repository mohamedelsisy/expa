# EXPA — Security Plan

| Area | Control |
|---|---|
| AuthN | bcrypt/argon2 hashing, Sanctum tokens with expiry, email verification, lockout via throttling, token revocation on password change |
| AuthZ | Roles+permissions, Policies on every user-owned resource (user can only access own rows), admin routes permission-gated; tests for each |
| Input | FormRequest validation everywhere; no raw SQL concatenation (Eloquent/bindings); output via API Resources |
| XSS | API returns JSON only; rich content sanitized server-side (HTMLPurifier-style allowlist) before storage; Vue escapes by default, `v-html` banned except sanitized content component |
| CSRF | Cookie-SPA flow uses Sanctum CSRF; bearer-token API exempt |
| Rate limiting | Named limiters: auth, api, ai, uploads |
| Uploads | Private disk, MIME sniff (not extension), size ≤ 10MB, allowlist (pdf/jpg/png/webp), random names, `MalwareScanner` interface (ClamAV adapter), signed temporary URLs |
| Secrets | Env only; `.env` git-ignored; CI secret scan; config encrypted for `job_sources.config` |
| Data at rest | Sensitive columns (`notes`, attachment refs) use Laravel `encrypted` cast |
| Transport | HTTPS + HSTS in production; secure/httpOnly/sameSite cookies |
| Headers | CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy via middleware |
| Logging | Audit log for admin mutations/auth events; PII-free application logs; IPs hashed |
| Dependencies | `composer audit` / `npm audit` in CI |
| AI | Prompt-injection delimiting, data minimization, no secrets/PII in prompts |

Security review is a gate in the Definition of Done for every task touching auth, uploads, or user data.

## Implemented: document uploads (T-014)
- Allow-list by **detected content type** (finfo), never extension/client MIME: PDF, JPEG, PNG, WEBP. 10 MB per file, 10 files per document, 100 MB per user (all in `config/documents.php`).
- `ContentScanner` interface; default `BasicContentScanner` rejects PDFs with active content (`/JavaScript`, `/JS`, `/Launch`, `/OpenAction`, `/AA`, `/EmbeddedFile`, `/RichMedia`, `/XFA`), undecodable images and images carrying `<?php`/`<script>` payloads. **It is heuristics, not an antivirus**: production must bind a real scanner (ClamAV) — tracked in T-030.
- Files live on the private `documents` disk (not served, no URLs), random UUID names under `{user_id}/`, contents encrypted at rest (AES-256 via app key; `DOCUMENTS_ENCRYPT`). Original filename is display-only, sanitized, stored encrypted. `label` and `notes` are encrypted columns.
- Download only through the authenticated endpoint with `nosniff`, `Content-Disposition: attachment`, `no-store`, CSP `sandbox`. All queries owner-scoped (IDOR → 404). Audit log records actions, never content.
- Erasure deletes files from disk before rows (`DocumentData`).

## Patente content & exams (T-021)
- Copyright: no question bank ships with EXPA. A question cannot be published without a recorded `rights_note` (provenance/licence), source metadata and both Italian + Arabic text; the exam question text is never indexed for the AI assistant.
- Anti-scraping/anti-cheating: no list endpoint for questions; unfinished exams expose statements only; answers/explanations appear only in the post-submission review; exams are graded once; exam creation is throttled (20/h); late submissions fail.
- Exam rules (30 questions / 3 errors / 20 min) live in `config/patente.php` and **must be verified against the current official rules before launch (T-035)**; an exam smaller than the configured size is refused instead of silently shrunk.

## Jobs importers (T-022)
- **No scraping.** A source can only be activated with a documented `legal_basis` (permission for automated use). Drivers: JSON feed and RSS only.
- **SSRF**: feed URLs must be https, credential-free, not localhost/.local/.internal, and (when DNS check is on) must not resolve to private/loopback/link-local/metadata addresses; no redirects, 15 s timeout, 5 MB cap. Validated at configuration time and again at fetch time.
- **XXE**: RSS parsed with `LIBXML_NONET` and no entity substitution (tested with a `file://` entity).
- **Secrets**: source config (URL tokens, headers) is encrypted at rest, never returned by the API, excluded from the audit trail, and never copied into run errors.
- **Integrity**: a failed fetch/parse changes nothing; items are validated individually (https apply URL, size, dates, salary sanity); text is stripped of markup; one bad item never aborts a run.
- **Truthfulness**: visa sponsorship is set only from a structured source field, never inferred from free text; salary is parsed only from explicit € amounts and its period is not guessed.
- **Least privilege**: `job_sources.*` permissions are held by content managers/admins only (found by a test: they were initially grouped with editorial roles).

## Platform hardening (T-030) — implemented and tested
- **Headers on every response** (global middleware, so 404s/framework errors too): `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, restrictive `Permissions-Policy`, `Cross-Origin-Resource-Policy: same-site`, CSP `default-src 'none'; frame-ancestors 'none'`, HSTS over https/production. Authenticated responses get `Cache-Control: no-store, private`; endpoints that declare a public policy keep it.
- **Rate limits**: global 180/min per user/IP on all `/api/v1` routes, plus stricter named limiters (login, register, password reset, privacy, uploads, AI, search, patente exams).
- **Attack surface**: no default web page, `local` and `documents` disks are never served over HTTP.
- **Authorization matrix test** iterates every registered route: all `auth:sanctum` routes reject anonymous callers (401); all `/admin/*` routes reject a plain user (403 `forbidden`); the public route set is asserted.
- **Authorization before validation / binding**: content admin routes require `{resource}.view` via route middleware, `Authorize` runs before implicit model binding (so 403 is identical for existing and missing ids: no id enumeration), and controllers authorize before resolving form requests.
- **Hygiene guards**: a test fails if a controller mass-assigns `$request->all()/input()`; production error bodies never contain traces; `.env.example` contains no secrets and documents production settings.
- `composer audit`: no advisories at time of writing (re-run in CI).

## Independent review (two read-only reviewers: security audit + correctness/quality) — outcome
No Critical/High security findings. **All Medium findings and the correctness findings were fixed and regression-tested** (`ReviewFixesTest`, `*HardeningTest`, `ContentIntegrityTest`, billing/job/AI additions):

| Finding | Fix |
|---|---|
| Scheduled publishing only worked for Guides (config list incomplete) | every `HasContentLifecycle` model registered; a test fails if one is missing |
| Un-published items re-published by a stale `publish_at` | schedule consumed on publish and cleared on leaving Published |
| Four-eyes bypass (editor creates, manager rewrites + approves); edits during review | last editor also blocked; any edit during review resets to draft; live/approved edits re-run `PublishGuard` |
| Job feed markup via entity encoding (`&lt;img onerror&gt;`) | decode→strip until stable, leftover tags removed |
| Exam answer scraping (blank submit reveals all answers) | verified email, ≥25 % of the time before submit, daily session caps, solutions only for answered questions |
| AI cost abuse via unverified accounts; emergency blocked by the daily limit | verified email for `ai/ask`; emergencies answered first and never consume quota |
| AI output: bare domains, `javascript:`/`data:`/`mailto:`/`tel:`, invented phone numbers, typographic trailing punctuation | `ResponseProcessor` rewritten and tested (phones kept only if quoted from the sources) |
| Billing out-of-order events (cancel→checkout resurrects; early payments unlinked; null period = unlimited) | cancellation tombstones, no resurrection, orphan payment linking, mandatory period end, failure rolls back the event claim |
| Proxy/host handling | `TRUSTED_PROXIES`, `forceRootUrl`, preflight warning |
| Login throttle gaps | normalised keys, 20/h per account across IPs, malformed input → 422 |
| Reset-token timing/erasure | auth mail queued; `password_reset_tokens` erased with the account and pruned daily |
| Missing retention jobs | `expa:prune-retention` (notifications 6 months, import runs 90 days) |
| Feed fetch: URL tokens in logs; SSRF gaps | no feed URLs in logs; AAAA + CGNAT + IPv4-mapped IPv6 blocked; resolved IP pinned; Content-Length cap |
| Races (uploads quota, lesson progress, exam double-submit, concurrent imports) | row locks / unique-violation handling / `ShouldBeUnique` |
| Misc | analytics subjects limited to real slugs; saved jobs honour moderation; admin cannot reopen a `pending_erasure` account; failed erasure leaves an audit entry; C2 learners get C1 lessons; scheduler mutex expiry; locale restored after push failure |

**Accepted / residual risks (documented, not fixed)**
- Intent detection is keyword-based: an unusual phrasing of a sensitive question may reach the model without sources. Mitigations: system prompt without sources forbids specifics, the disclaimer is always appended to unsourced answers, URLs/phones are stripped. A classifier-based detector is tracked as T-042.
- Exam scraping is bounded (verified email, time gate, 10 exams + 30 practice sessions/day) but not impossible for a determined account farm; the licensing posture (no bundled bank) limits the exposure.
- Device-token takeover requires the victim's secret push token (defence-in-depth only).
- DNS pinning relies on curl `RESOLVE`; behind an egress proxy that option may be ignored (egress filtering is the real control in production).
- `BasicContentScanner` remains heuristic (T-030 note); a real scanner is a launch blocker.
- `Art. [12]`-style bracketed numbers in model output are removed as citations.
