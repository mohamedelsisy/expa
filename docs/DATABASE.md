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

## Patente (T-021)
`patente_categories`/`patente_topics` (slug, lifecycle, source) + translations(title, summary, body) · `patente_questions` (slug, topic, is_true, **rights_note**, lifecycle, source) + translations(statement, explanation) · `patente_exams` (user, mode exam|practice, question_ids, max_errors, deadline_at, finished_at, correct, errors, passed, timed_out) · `patente_exam_answers` (user, exam, question, topic, answer?, correct). No question bank is bundled.

## Jobs (T-022/T-023)
`job_sources` (key, driver json_feed|rss, config **encrypted** {url, headers, items_path, map, company_default}, legal_basis, active, schedule_hours, last_run_at/status, consecutive_failures) · `job_import_runs` (status, fetched/created/updated/unchanged/duplicates/invalid, error_samples [reasons only], error_message, timings) · `job_listings` (NOT `jobs`: that is Laravel's queue table) (source, external_id [unique per source], dedupe_hash = sha1(company|title|location), title, company, city?, location_text, remote_mode, employment_type, category, salary_min/max/currency/period, italian/english level, experience_years, skills json, description, apply_url, visa_sponsorship_stated, published_at, expires_at, status published|expired|hidden, content_hash, apply_clicks) · `job_profiles` (user, skills, experience, education, remote_preference, employment_types, salary_min_year, city) · `job_saves`. Raw feed payloads are not stored.

## Search (T-024)
`search_documents` (type, item_id, slug, locale?, title, summary, search_title/search_text [normalized], meta; unique type+item+locale) — derived from PUBLIC content only: lifecycle content per translation (published), jobs language-neutral (listed). Rebuild: `expa:search-reindex`.

## Billing (T-037)
`plans` (key, interval, price_minor, currency, features json, active, sort_order) + translations(name, description) · `subscriptions` (user, plan, status active|trialing|past_due|canceled|expired, provider, provider_ref, period start/end, cancel_at_period_end) · `subscription_items` · `payments` (user, subscription?, amount_minor, status, provider+provider_ref unique, failure_code) · `invoices` (number unique) · `payment_methods` (brand, last4, expiry only — no PAN/CVC columns, by design) · `billing_events` (provider+event_id unique: webhook idempotency).

## Analytics (T-039)
`analytics_daily` (day, name, platform, locale, subject [public content slug or ''], count; unique per key). **No user id, IP, session, device or per-event rows** — aggregate counters only.

## Study (T-040)
`universities` (slug, kind, region/city, website, lifecycle, source) + translations(name, summary, notes) · `study_programs` (university, degree_level, field, instruction_language en|it|both, duration_years, tuition_min/max_year [null = unstated], required_italian/english_level, application_deadline, program_url, lifecycle, source) + translations(title, summary, admission_requirements, notes) · `scholarships` (degree_levels json, deadline, apply_url, lifecycle, source) + translations(name, summary, eligibility, how_to_apply). No seeded data.

## Update: production-audit remediation (2026-10-05)
Migration `2026_10_05_090000_harden_billing_reminders_and_indexes`:
- `reminders`: `notified_at` (set only after the user was notified), `attempts` (outbox / retry bound).
- `subscriptions`: unique `(provider, provider_ref)`, `past_due_since`, `grace_ends_at`, `dunning_step`. `subscription_items`: `slot` + unique `(subscription_id, slot)`. `invoices`: unique `payment_id`, `net_minor`, `tax_minor`, `tax_rate`, `tax_country` (all NULL unless a VAT rate was configured). `payments`: `refunded_at`.
- `plans`: `vat_rate` (nullable decimal, never defaulted) and `price_includes_vat`. New `tax_rates(country,label,rate,valid_from,source_url,verified_at)` shipped EMPTY, only rows with `verified_at` are applied. New `invoice_sequences(year,last_number)`: gap-free numbering `EXPA-YYYY-000001`, row-locked in the payment transaction.
- FKs `payments.user_id`, `invoices.user_id`, `consents.user_id` are now `RESTRICT` (a hard delete of a user with billing/consent history fails loudly; normal erasure soft-deletes and anonymises).
- Indexes: `user_notifications(created_at)`, `job_import_runs(started_at)`, `job_listings(status,category|remote_mode|employment_type)`.
- Subscription state machine: `trialing|active -> past_due -> active|expired`, any live state `-> canceled`, `canceled` and `expired` are terminal. Payment: `pending -> succeeded|failed`, `failed -> succeeded`, `succeeded -> refunded`.
### Search (BE-10)
Candidate retrieval stays `LIKE '%term%'` on purpose (substring semantics needed by the Arabic/Italian normaliser; MySQL FULLTEXT is word/prefix based and the ngram parser does not exist on MariaDB). Bounds: at most 6 terms of at most 40 characters, 300 characters of an AI question, 300 candidates per pass, 60 s ranking cache keyed by the index version (any index write invalidates it). If volume requires it, move to Meilisearch/Elasticsearch behind `SearchService::rank()`; do not add FULLTEXT without re-testing recall in Arabic.
