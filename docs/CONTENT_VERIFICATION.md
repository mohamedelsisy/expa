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
