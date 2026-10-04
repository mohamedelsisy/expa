# EXPA — Database Design (initial)

Conventions: bigint PK, `created_at/updated_at`, soft deletes on user-generated/admin content, FK constraints, indexes on every FK and filter column. Translatable entities use `<entity>_translations(entity_id, locale, ...fields)` with unique `(entity_id, locale)`.

## Identity & access
- `users` (name, email unique, password, locale, email_verified_at, status, last_login_at)
- `roles` (key, label) · `permissions` (key) · `permission_role` · `role_user`
- `user_profiles` (user_id unique, nationality*, residence_type* [*encrypted], segment, age_range, italian_level, english_level, goals json, onboarding_skipped json, onboarding_completed_at; `city_id` added in T-010)
- `consents` (user_id, purpose, granted, policy_version, source[web|ios|android|api], ip_hash [HMAC], created_at) — append-only ledger; current state = latest row per purpose
- `audit_logs` (actor_id, action, subject_type, subject_id, changes json, ip_hash, created_at)

## Geography
- `regions` (code = ISTAT 01–20, slug) + `region_translations` · `cities` (region_id, slug) + `city_translations`; `user_profiles.city_id` nullable FK (null on delete). Seeded by `GeographySeeder` (20 regions, 16 main cities; reference data only).

## Knowledge / content (guide engine)
- `guides` (slug, category, italian_term, region_id?, city_id?, sort_order, status/publish_at/published_at, source_name/url/type, last_verified_at, created_by, updated_by, soft deletes) + `guide_translations` (title, summary, what_is, who_needs, required_documents json, steps json[{title,text}], where_to_apply, how_to_book, costs, processing_time, body). HTML is stripped on input; text is markdown/plain.
- `articles` + `article_translations` (same lifecycle)
- `knowledge_sources` (name, type, base_url, trust_level) · `knowledge_chunks` (guide_id/article_id, locale, content, embedding_ref, source_url, last_verified_at) — RAG store

## Government
- `government_services` (slug, domain, italian_term, guide_id?, region/city?, lifecycle, source) + translations(name, summary, how_to_apply, required_documents, notes) · `government_offices` (city_id, type, address, official_url, booking_url, booking_method enum) (+translations)
- `service_office` pivot with `how_to_apply` translation fields
- `appointment_guides` (office_type, booking_method, official_url, status) (+translations)

## Personal tracking
- `document_types` (key, default_reminder_offsets json) (+translations)
- `document_types` (key, sort_order) + translations(name) — seeded reference data (12 types) · `user_documents` (user_id, document_type_id, label*, issue_date, expiry_date, notes*, reminders_enabled, reminder_offsets json) [*encrypted]
- `document_attachments` (user_id [denormalized for quota + privacy guard], user_document_id, storage_path, original_name*, mime, size, sha256, encrypted) — files on private `documents` disk
- `reminders` (user_document_id nullable, user_id, offset_days, remind_at, channel set, sent_at, unique(user_document_id, offset_days))
- `user_tasks` (user_id, task_key, status done|dismissed, completed_at; absence = todo; unique per user+task). The task *catalog* (category, priority, applicability rules, guide/route) lives in `config/setup.php`, texts in `lang/*/setup.php`
- `reminders` (user_id, user_document_id, kind before|expired, offset_days (-1 = expired notice), remind_on DATE, status pending|dispatched|skipped; unique per doc+kind+offset) · `user_notifications` (uuid, user_id, type, data json [locale-neutral], read_at, created_at)
- `device_tokens` (user_id, platform, token unique, last_used_at)

## Learning
- `italian_levels` (A0..C1) · `italian_lessons` (level_id, type, order, status) +translations · `italian_vocabularies` · `italian_exercises` · `lesson_progress` (user_id, lesson_id, status, score)
- `patente_categories` · `patente_topics` · `patente_lessons` · `patente_questions` (+ license/provenance column `rights_note` required) · `patente_attempts` · `patente_attempt_answers`

## Jobs
- `job_sources` (key, driver, config enc json, active, schedule, legal_basis note) · `job_import_runs` (source_id, status, counts, error, started/finished)
- `jobs` (source_id, external_id, dedupe_hash unique, title, company, city_id, remote_mode, employment_type, salary_min/max, italian_req, english_req, experience_years, apply_url, published_at, expires_at, sponsorship_stated bool default false, status) + translations · `job_skills` / `job_job_skill`
- `job_matches` cache (user_id, job_id, score, reasons json)

## Providers & billing
- `service_providers`, `provider_services`, `provider_reviews` (post-MVP)
- `plans` (key, price_minor, currency, interval, features json, active) · `subscriptions` · `subscription_items` · `payments` · `invoices` · `payment_methods`

## AI
- `knowledge_chunks` (derived retrieval index: item_type/id/slug, locale, section, title, content, search_text, source_name/url/type, last_verified_at) · `ai_usage` (user_id, day, count) · `ai_conversations` (user_id, locale, title) · `ai_messages` (role, content, intent, sources json, label enum, tokens) · `ai_usage` (user_id, date, count) for plan limits

## Indexing notes
Composite `(status, publish_at)` on content; `(user_id, expiry_date)` on documents; `(remind_at, sent_at)` on reminders; FULLTEXT on normalized search table.

## Retention (see GDPR.md)
Attachments & AI messages follow configurable retention; account deletion cascades via a queued `EraseUserData` job.

## Learning (T-020)
`italian_lessons` (slug, level a0–c1, type vocabulary|grammar|conversation|pronunciation|mission, scenario?, duration_minutes, lifecycle, optional source) + translations(title, summary, body, items json[{it, gloss, example_it, example_gloss, speaker, tip, phonetic}]) · `lesson_progress` (user_id, lesson_id, started|completed, score, completed_at; unique per user+lesson). Levels are an enum, not a table.
