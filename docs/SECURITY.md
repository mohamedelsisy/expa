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
