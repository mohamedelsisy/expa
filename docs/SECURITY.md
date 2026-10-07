# EXPA — Security Plan

| Area | Control |
|---|---|
| AuthN | bcrypt/argon2 hashing, Sanctum tokens with expiry, email verification, lockout via throttling, token revocation on password change |
| AuthZ | Roles+permissions, Policies on every user-owned resource (user can only access own rows), admin routes permission-gated; tests for each |
| Input | FormRequest validation everywhere; no raw SQL concatenation (Eloquent/bindings); output via API Resources |
| XSS | API returns JSON only; user-generated text is stripped of HTML server-side (`ContentSanitizer`, `JobNormalizer`) and editorial markdown has unsafe link schemes neutralised on save (BE-21); no HTML purifier library is used; Vue escapes by default, `v-html` banned except sanitized content component |
| CSRF | The API is bearer-token only (no Sanctum stateful/cookie mode, no CSRF endpoint). The Nuxt BFF keeps the token in an httpOnly SameSite=Lax cookie and additionally rejects `Sec-Fetch-Site: cross-site` and a present mismatching `Origin` (`web/server/utils/bff.ts`); a request with no Origin header is still allowed (MVP-25) |
| Rate limiting | Named limiters: auth, api, ai, uploads |
| Uploads | Private disk, MIME sniff (not extension), size ≤ 10MB, allowlist (pdf/jpg/png/webp), random names, `ContentScanner` interface (`BasicContentScanner`, `ClamdScanner`, `ScannerChain`), authenticated download endpoint (no public or signed URLs) |
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
- `ContentScanner` interface; default `BasicContentScanner` rejects PDFs with active content (`/JavaScript`, `/JS`, `/Launch`, `/OpenAction`, `/AA`, `/EmbeddedFile`, `/RichMedia`, `/XFA`), undecodable images and images carrying `<?php`/`<script>` payloads. **It is heuristics, not an antivirus**: production must set `DOCUMENTS_SCANNER=clamav` (`ClamdScanner`, implemented and tested against fakes, T-043; needs a running clamd; preflight errors otherwise).
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
- `BasicContentScanner` remains heuristic; the `ClamdScanner` adapter exists but has not run against a real clamd, so a running ClamAV remains a launch blocker (T-043).
- `Art. [12]`-style bracketed numbers in model output are removed as citations.

## Update: production-audit remediation (2026-10-05)
Resolution of every finding is tabulated at the end of `PRODUCTION_AUDIT_BACKEND.md`. Operational rules that came out of it:
- **Trusted proxies (BE-1)**: `TRUSTED_PROXIES` is read from config in `AppServiceProvider::boot`. Production preflight fails when `BEHIND_PROXY=true` and it is empty. Never read `env()` outside `config/`.
- **Login abuse (BE-2)**: per request: 5/min per (email, IP) and 30/min per IP. Per account: only FAILED attempts count (20/hour). Beyond that an unknown network may spend a shared budget of 10 verifications per hour; a known network (a previous successful login within 30 days) is never blocked. So an attacker can delay a login from a new network but cannot stop the owner on a known device, and password reset is unaffected. Distributed guessing is bounded to 30 guesses/hour/account. Change-password counts only failures (5 per 15 minutes per user).
- **Account status (BE-13)**: `EnsureAccountActive` refuses suspended/erasing accounts on every authenticated route even if a token survives.
- **Tokens (BE-16)**: staff tokens 12 h, user tokens per `SANCTUM_TOKEN_EXPIRATION`, 20 live tokens per user, device list/revoke endpoints. Abilities remain `*`.
- **Privileged accounts (BE-18/19)**: no self-modification and no removal of the last active super admin, enforced in the controller (outside `Gate::before`); revenue figures need `reports.finance`.
- **Logging (BE-3/8)**: expected business errors are not reported; `daily` rotation, `warning` level in production; no prompts, tokens or personal data in logs.
- **Uploads (BE-4)**: `DOCUMENTS_SCANNER=clamav` in production (preflight ERROR otherwise), fail-closed, hex-escaped PDF names are decoded by the heuristic pre-filter. EICAR verification steps in EXTERNAL_SERVICES.md.
- **Billing (BE-5/6/27/28)**: admin cancel goes through the provider first; payment events without a provider payment id are ignored and never adopt another user's row; Stripe webhooks need a valid `Stripe-Signature` within 300 s; unique keys and `RESTRICT` FKs protect financial rows.
- **Reminders (BE-7)**: outbox semantics (`notified_at`, retries with backoff, stale re-queue, max 5 attempts, then `failed`).
- **Official domains (BE-20, MVP-14)**: the allow-list names only domains a person verified; extend with `OFFICIAL_DOMAINS_EXTRA`; the comune./regione. patterns are registrable by anyone and can be switched off with `OFFICIAL_DOMAIN_PATTERNS_ENABLED=false`. Four-eyes approval applies either way. No domain is assumed official by default beyond the existing list.
- **Accepted risks**: registration reveals whether an e-mail exists (BE-15, rate limited, UX decision); public 5-minute cache of regulated content (BE-39): purge the CDN when unpublishing a wrong official procedure; a 20 s synchronous LLM call occupies a php-fpm worker (bounded by 20/min/user and the daily budget; size the pool accordingly).
- **APP_KEY custody and rotation (BE-35)**: the key encrypts documents, profile fields, AI messages, job source config and keys the audit/consent HMACs. Store it in the secret manager with an offline sealed backup held by two people; losing it makes that data unreadable. To rotate: put the old key into `APP_PREVIOUS_KEYS`, set the new `APP_KEY`, deploy (reads fall back to old keys, new writes use the new key), then re-save encrypted records over time. No bulk re-encrypt command exists yet; audit/consent IP hashes computed with the old key will not match new ones (acceptable: they are evidence, not lookups).
- **Markdown (BE-21)**: link/image targets with schemes other than http(s), mailto, tel are neutralised on save; the web renderer must still sanitise.

## Abuse and moderation threat model (articles / marketplace / community, T-060..T-063)
| Threat | Control |
|---|---|
| Fake or manipulated reviews | verified email, account-age gate, one review per user per provider, no review of own listing, every review moderated before it is public or counted, rate limits (5/h, 15/day), reports, duplicate-text detection |
| Provider impersonation / false trust | verification is a separate expiring state set only by `providers.verify` holders (not content editors), requires `verification_basis` and evidence, owners cannot verify themselves, effective status degrades to `expired`; every listing carries "third party, not recommended or guaranteed by EXPA" |
| IDOR on provider data | provider identity resolved from the authenticated account (`EnsureProviderAccount`); leads, reviews and replies queried scoped to the owned listing; cross-tenant ids return 404 (tests) |
| Evidence/leads disclosure | evidence encrypted at rest, downloadable only by `providers.verify`, each access audited; leads encrypted at rest, visible only to the addressed provider and the sender; retention job (`expa:prune-marketplace-leads`) |
| Contact harvesting | private contacts public only with explicit provider opt-in; contact requests need per-request consent, a cooldown and an open-request cap |
| Provider edits live content | owner edits to a published listing wait as `pending_changes` until an admin approves (re-validated by the publish guard) |
| Spam, phishing, link abuse (reviews, leads, community) | `ContentSanitizer`: HTML stripped, non-https links removed and flagged, https links capped, URL shorteners rejected, duplicate detection, length bounds |
| Community brigading / sock puppets | new-account hourly caps, premoderation for new users and any post with links, rate limits, one vote per user, no self-vote, reports, shadow-ban and mute (moderator-only, staff cannot be restricted), user blocks |
| Harassment / doxxing | authors are never identified publicly (no names, ids or emails in any public payload); block list never reveals identity |
| Medical/legal advice presented as official | every community item labelled "not verified"; sensitive topics add a stronger notice; moderators can pin the official guide; community content is NOT indexed for search or the AI assistant |
| Moderator abuse | separate permissions (`community.moderate`, `community.restrict_users`, `provider_reviews.moderate`) on a `moderator` role never given to users; all actions audit-logged with actor and reason |
| Feature leakage while disabled | `community.enabled=false`: all community routes 404 (after authentication on protected routes, so anonymous/unauthorised callers still get 401/403) |

## Update: sensitive documents, housing text, legal texts (T-070..T-074)
- **Document explainer**: type decided by `finfo` (jpg/png/pdf only), size cap, image header dimensions/pixels checked before decoding (decompression-bomb guard `EXPLAIN_MAX_PIXELS`), PDF page cap, `ContentScanner` (heuristics + ClamAV in production, fail-closed). The upload is copied to a private 0700 workspace under a random name (client file names never touch the filesystem) and deleted in `finally`. OCR shells out to `tesseract`/`pdftotext`/`pdftoppm` only if configured (`OCR_DRIVER=tesseract`): argument arrays (no shell), absolute binaries, fixed language list, hard timeout, page cap; otherwise `NullOcrEngine` answers `ocr_unavailable`. No document content is logged; only exception class names are reported.
- **Rate limits/quotas**: `document-explain` 6/min + 60/h, `housing-check` 10/min, plus per-day plan quotas (`feature_usage`). Verified e-mail and a dedicated consent are required (paid LLM and personal text).
- **Housing text** is processed in memory; saving a result stores findings only (encrypted), never the pasted text. Prompt-injection inside pasted text is neutralised by delimiter stripping and tested.
- **Legal texts**: `legal.publish` is admin-only, four-eyes applies, markdown is stripped of HTML and unsafe link schemes.
- **Learning**: answers live in `content` JSON and are never returned before an attempt; attempts store only right/wrong.

## Update: RA pass (2026-10-07)
- **Numbers are claims.** `tax_tables` and `travel_requirements` ship empty; an entry is public only after the content workflow (four-eyes) and PublishGuard (official https source, verification date). Tax-table publishing is restricted to admins (`tax_tables.publish`); `POST /money/net-salary` and `GET /travel/requirements` are public, throttled (60/min), stateless and never read or store profile data.
- **AI Patente Teacher** only sees the single published, licensed, sourced topic/question named by the request; output goes through `ResponseProcessor` (no invented links/phones/citations). Exam questions remain out of the general knowledge index.
- **Providers in search** are shown only while publicly listable and always as third party; contact data is never indexed.
- **Preflight** (`expa:preflight --production`): `CONTENT_FOUR_EYES=false` is a blocking error; draft privacy version, `OCR_DRIVER=null`, teacher review off and community without moderators are warnings.
- Removed the unenforced `settings.update` permission (configuration is environment-driven and read-only in the admin API).
