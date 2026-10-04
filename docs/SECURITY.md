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
