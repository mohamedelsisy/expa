# EXPA — Content verification and approvals

EXPA ships **no** legal text, no statutory limits, no exam-question bank and no official procedures inside the code or seeders. Everything below is entered by editors through the admin workflow (Draft → Review → Approved → Published, four-eyes) and must be verified by a person before it goes live.

## Legal documents (privacy, terms, cookies) — needs counsel approval
- API: `GET /api/v1/legal/{privacy|terms|cookies}` returns the **published** version, 404 until one exists. Nothing is seeded.
- The text MUST be drafted or approved by qualified legal counsel (GDPR/Italian law, consumer terms, cookie rules). EXPA developers do not write it.
- Workflow: `legal.*` permissions. Editors cannot touch it; content managers may draft, edit and review; only admins publish. The author cannot approve their own version (`content.four_eyes`). Arabic is required to publish (Arabic-first); English/Italian are strongly recommended, otherwise the API serves a fallback and says so (`fallback: true`).
- Every document is a **version** (`version` ≤ 20 chars, e.g. `2026-11-01`). Publishing a version archives the previous one. The published **privacy** version becomes `consents.policy_version`: users who consented under an older version are flagged `outdated` and asked to re-confirm. Before any privacy version is published the configured `PRIVACY_POLICY_VERSION` (draft) is used.
- Record counsel's approval reference in the optional source fields (name / URL / date) of the version. Never publish a version without that approval.

## Rental checker rules (`housing_rules`)
- Seeded rules are **general guidance only**: "ask for X", "be careful with Y". They contain no numbers and make no legal claim (`basis = general_guidance`).
- Any rule that encodes a number (a maximum deposit, a minimum duration, a notice period…) is a **sourced** rule: `basis = sourced`, with source name, https URL, source type and last-verified date. The publish guard blocks a numeric threshold without `basis = sourced` and blocks a sourced rule without a source. The source must be the actual statute/official page, checked by a person; "official" sources are restricted to the allow-listed domains.
- Rule texts in ar/en/it must be reviewed by a native speaker before launch (seeded rows enter the `review` queue outside local/testing).

## Document explainer
- Classification keywords and date patterns are a heuristic. The explanation is labelled `ai_explanation` unless EXPA's verified knowledge base supplied sources (then `official` / `general_guidance` / `third_party`). It never replaces the original document or the issuing office.

## Italian learning content
- Vocabulary and exercises are original teaching material. Until a qualified Italian teacher / native Arabic speaker marks an item reviewed (`reviewed_by_teacher_at`, endpoint `POST /admin/italian/{vocabulary|exercises}/{id}/teacher-review`) the API returns `reviewed: false` plus a localized notice and clients must show it. Editing reviewed text clears the review. `LEARNING_REQUIRE_TEACHER_REVIEW=true` makes review mandatory to publish.
- Audio: a recording can only be published with an `audio_rights_note` (who recorded it, under which licence).

## Patente questions
- No question content is provided. Each question needs `license_type`, `rights_holder` and `license_proof_ref` (contract / permission / authorship agreement) to be published; a half-filled licence blocks publication. The legacy free-text `rights_note` is accepted only while `PATENTE_LEGACY_RIGHTS_NOTE=true` (default, backward compatible); set it to `false` once existing questions are migrated.
- Exam rules (`config/patente.php`) must be checked against the official source before launch (T-035).

## Verification matrix: who must verify what before publish (CONTENT_VERIFICATION_REQUIRED)

The software enforces the mechanics (Arabic present, source name/https URL/type/date, official domain allow-list, four-eyes approval, per-type guards). It cannot verify truth. Every type below is **CONTENT_VERIFICATION_REQUIRED**: nothing is seeded, and a person in the stated role must check the content against the primary source and record the source and date before the second person approves. `expa:content-readiness` / `GET /admin/content-readiness` show per type published, draft, review, stale (> `content.freshness.stale_after_days`, default 180) and unverified counts; `expa:content-verify-sources` (weekly) logs types that need re-verification.

| Content type | Source required to publish | Must be verified by | Verification before publish | Re-verify |
|---|---|---|---|---|
| Guides, government services | yes (official domain when `official`) | Content manager with subject knowledge; immigration topics: immigration lawyer / patronato | Every step, fee, deadline, office against the issuing authority page; Arabic wording by a native speaker | 180 days or on any rule change |
| Government offices | yes | Content manager | Address, booking method, URLs against the office's own site | 180 days |
| Appointment guides | yes | Content manager | Booking portal URL and steps tested by a person; EXPA never claims a booking was made | 180 days |
| Italian lessons / vocabulary / exercises | optional | Qualified Italian teacher + native Arabic speaker (`teacher-review` endpoint; `LEARNING_REQUIRE_TEACHER_REVIEW=true` makes it mandatory) | Language accuracy, CEFR level, Arabic gloss, audio licence (`audio_rights_note`) | on edit (clears review) |
| Patente categories / topics | yes | Driving-school instructor or other qualified expert | Content against current Codice della Strada and Ministry of Transport material | 180 days, and on law changes |
| Patente questions | yes + licence (`license_type`, `rights_holder`, `license_proof_ref`) | Legal/business owner for rights; qualified expert for correctness | Written permission or authorship proof for every question; answer key checked; exam rules in `config/patente.php` checked against official rules (T-035) | on law changes |
| Universities, programs, scholarships | yes | Study content editor | Tuition, deadlines, language, requirements against the university/ministry page; mark amounts as indicative; deadlines are time-sensitive | each admissions cycle; 180 days maximum |
| Articles | optional (a stated source must be valid) | Editor; fact-check by subject editor when it makes claims | Claims, sources, no copied text; editorial content is never labelled official | editor decision |
| City profiles | per block (official blocks require source) | Local content editor | Each official block against the municipality/ASL/transport site | 180 days |
| Legal documents (privacy, terms, cookies) | optional field for counsel reference | **Qualified legal counsel** (LEGAL_REVIEW_REQUIRED) | Counsel drafts or approves each version; reference recorded; admins publish; version change triggers re-consent | on legal/product change |
| Tax tables (net-salary) | yes | **Accountant / commercialista** | Brackets, rates, contribution ceiling and tax year against Agenzia delle Entrate/INPS; estimator is labelled an estimate | each tax year |
| Travel requirements | yes | Editor with immigration/consular knowledge; consular or legal review recommended | Entry rules per nationality/destination/status against the destination government or Italian Ministry of Foreign Affairs; absence of an entry means "not available", never "not required" | 90 days recommended, any rule change |
| Housing rules | numeric rules need `sourced` | Editor + legal review for numbers | General guidance has no numbers; any threshold needs statute source | 180 days |
| Marketplace providers | verification evidence, admin only | Marketplace admin (`providers.verify`) | Licence/registration checked against the professional register; verification expires | `verification_expires_at` |
| Job sources | `legal_basis` (min 20 chars, documented) | Business/legal owner | Terms of use or contract permit automated reuse; robots.txt respected; no scraping of prohibited platforms | at contract renewal |
| Community moderation | n/a | Moderators | Official-guide links by moderators only | n/a |

Rules that apply to all types: never invent procedures, offices, fees, deadlines or URLs; mark uncertainty; `last_verified_at` is the date a person checked the source, not the edit date; an item with a stale/unverified date stays published but is flagged in the admin report and public `freshness`.

### Job ingestion legal basis
A job source cannot be activated without a documented `legal_basis` (validated and audited, `JobSourceAdminController`). `ContentReadiness` reports `active_without_legal_basis` (must stay 0). Visa sponsorship is never shown unless the source states it (`visa_sponsorship.stated`). Failed or partially invalid feeds never delete existing listings (`JobIngestionPipelineTest`).

## Official content packs V1–V4 (seeders) — local workflow and known issues

**Packs:** `OfficialContentV1Seeder`..`V4Seeder` (26 guides, 23 government services, the Rome city profile with 5 blocks; ar/en/it; official sources, `last_verified_at` 2026-10-08). All are registered from `DatabaseSeeder` and are idempotent (`updateOrCreate`).

**Lifecycle by environment (four-eyes is never bypassed):** in `local`/`testing` the packs are seeded as `published` so the app is usable; in `staging`/`production` they are seeded as `review` and must be approved by a second person through the normal workflow (`OfficialContentSeedersTest` asserts both).

**Local setup (non-destructive):**
```
cd backend
php artisan migrate            # additive; never migrate:fresh on a database holding data you want
php artisan db:seed            # runs the packs and, in local/testing, rebuilds the search and AI indexes
```
Seeders write rows directly (no `ContentChanged` event), so `DatabaseSeeder` calls `expa:search-reindex` and `expa:ai-reindex` in local/testing. When seeding a single pack with `--class=`, run those two commands yourself.

**Source verification (2026-10-08):** all 55 seeded records (26 guides, 23 government services, 1 city profile, 5 city blocks) use 31 distinct official URLs; every URL was fetched with up to 3 attempts. 31/31 return HTTP 200, 0 return 404. Notes:
- `atac.roma.it` serves a bot-protection challenge to scripted clients (curl is redirected to a challenge host), so its page was read through a second client: it is the ATAC annual-subscription page and it supports the stated €250 annual and €35 monthly prices. Re-check it in a normal browser when reviewing.
- Four URLs that previously returned 404 were replaced after reading the current official pages (INPS SPID and NASpI pages: the old slugs had an accent mangled in the path; ANPR certificates: the current ANPR portal page, which states the €16 bollo unless exempt, superseding the 2021 news items that said digital certificates carry no bollo; Agenzia delle Entrate: the current "Il Codice Fiscale" citizens page, which describes AA4/8 by PEC and the verification service). `anagrafenazionale.interno.it` (the Ministry of Interior's ANPR portal) was added to `config/content.php` `official_domains` so these records pass the publish guard.
- A source being reachable does not replace human review: facts, amounts and deadlines still need the normal review/approval before staging or production publication.
