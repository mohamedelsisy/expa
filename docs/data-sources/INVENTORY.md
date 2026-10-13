# Database inventory — before and after the real-data import

Initial = local database before this work (backup taken 2026-10-11); final = after the importers ran. Regenerate current counts with `php artisan expa:data-inventory`.

- Tables: 119 (9 infrastructure, 110 application)
- Application tables with rows: 51 (was 36)
- Application tables still empty: 59 — each with the reason below. None is empty because of a bug; they are empty because no legitimate public dataset exists or the data is private.

| Table | Kind | Initial | Final | Source / reason |
|---|---|---:|---:|---|
| `ai_conversations` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `ai_messages` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `ai_usage` | application | 0 | 0 | Runtime usage telemetry. |
| `analytics_daily` | application | 10 | 10 | Existing content / reference data |
| `appointment_guide_translations` | application | 0 | 18 **▲** | Source: Authored from official pages |
| `appointment_guides` | application | 0 | 6 **▲** | Source: Authored from official pages (expa:import:appointment-guides) |
| `article_guide` | application | 0 | 0 | See articles. |
| `article_tags` | application | 0 | 0 | See articles. |
| `article_translations` | application | 0 | 0 | See articles. |
| `articles` | application | 0 | 0 | Editorial content; no public dataset to import. |
| `audit_logs` | application | 148 | 12837 **▲** | Existing content / reference data |
| `billing_events` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `cache` | infrastructure | 40 | 50 **▲** | Runtime cache |
| `cache_locks` | infrastructure | 0 | 0 | Runtime |
| `cities` | application | 16 | 119 **▲** | Source: ISTAT comuni (expa:import:istat-comuni) |
| `city_block_translations` | application | 15 | 15 | Existing content / reference data |
| `city_blocks` | application | 5 | 5 | Existing content / reference data |
| `city_profile_translations` | application | 3 | 3 | Existing content / reference data |
| `city_profiles` | application | 1 | 1 | Existing content / reference data |
| `city_translations` | application | 48 | 151 **▲** | Source: ISTAT comuni |
| `community_answers` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `community_blocks` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `community_comments` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `community_question_tags` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `community_questions` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `community_restrictions` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `community_votes` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `consents` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `content_reports` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `data_import_runs` | application | — | 24 **new** | Source: Provenance log of every import run |
| `device_tokens` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `document_attachments` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `document_type_translations` | application | 36 | 36 | Existing content / reference data |
| `document_types` | application | 12 | 12 | Existing content / reference data |
| `failed_jobs` | infrastructure | 0 | 0 | Queue failures |
| `feature_usage` | application | 0 | 0 | Runtime usage telemetry. |
| `government_office_translations` | application | 0 | 154 **▲** | Source: IPA open data |
| `government_offices` | application | 0 | 154 **▲** | Source: IPA open data (expa:import:ipa-offices) |
| `government_service_office` | application | 0 | 1 **▲** | Source: 1 verifiable link (Rome permesso service ↔ Questura di Roma) |
| `government_service_translations` | application | 69 | 69 | Source: Curated |
| `government_services` | application | 23 | 23 | Source: Curated (V1–V4) |
| `guide_translations` | application | 150 | 150 | Source: Curated |
| `guides` | application | 50 | 50 | Source: Curated official-source guides (V1–V7 seeders) |
| `housing_checks` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `housing_rule_translations` | application | 33 | 33 | Existing content / reference data |
| `housing_rules` | application | 11 | 11 | Existing content / reference data |
| `invoice_sequences` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `invoices` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `italian_exercise_attempts` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `italian_exercise_translations` | application | 18 | 18 | Existing content / reference data |
| `italian_exercises` | application | 6 | 6 | Existing content / reference data |
| `italian_lesson_translations` | application | 18 | 18 | Existing content / reference data |
| `italian_lessons` | application | 6 | 6 | Existing content / reference data |
| `italian_vocab_progress` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `italian_vocabularies` | application | 22 | 22 | Existing content / reference data |
| `italian_vocabulary_translations` | application | 44 | 44 | Existing content / reference data |
| `job_batches` | infrastructure | 0 | 0 | Queue |
| `job_import_runs` | application | 0 | 0 | No importable job feed is active (curated sources are inactive by design; no reuse-licensed feed found — see jobs-review.md). |
| `job_listings` | application | 16 | 16 | Source: Curated; links re-verified (expa:jobs-verify-links) |
| `job_profiles` | application | 0 | 0 | User data. |
| `job_saves` | application | 0 | 0 | User data. |
| `job_sources` | application | 3 | 3 | Source: Curated |
| `jobs` | infrastructure | 0 | 0 | Queue |
| `knowledge_chunks` | application | 1548 | 14048 **▲** | Source: Derived index (rebuilt by expa:ai-reindex) |
| `legal_document_translations` | application | 0 | 0 | See legal_documents. |
| `legal_documents` | application | 0 | 0 | Privacy policy / terms need counsel-approved text (LEGAL_REVIEW_REQUIRED). |
| `lesson_progress` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `migrations` | infrastructure | 33 | 34 **▲** | Laravel migration log |
| `password_reset_tokens` | infrastructure | 0 | 0 | Private |
| `patente_categories` | application | 0 | 15 **▲** | Source: MIT Portale dell'Automobilista (expa:import:patente-categories) |
| `patente_category_translations` | application | 0 | 45 **▲** | Source: MIT Portale dell'Automobilista |
| `patente_exam_answers` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `patente_exams` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `patente_question_translations` | application | 0 | 0 | See patente_questions. |
| `patente_questions` | application | 0 | 0 | Official quiz questions are copyrighted: never imported. |
| `patente_topic_translations` | application | 0 | 0 | See patente_topics. |
| `patente_topics` | application | 0 | 0 | Topic content would be licensed/authored exam material; no reusable public dataset. Not populated. |
| `payment_methods` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `payments` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `permission_role` | application | 266 | 266 | Existing content / reference data |
| `permissions` | application | 114 | 114 | Existing content / reference data |
| `personal_access_tokens` | infrastructure | 15 | 15 | Login tokens (private) |
| `plan_translations` | application | 9 | 9 | Existing content / reference data |
| `plans` | application | 3 | 3 | Existing content / reference data |
| `provider_areas` | application | 0 | 0 | See service_providers. |
| `provider_leads` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `provider_reviews` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `provider_service_translations` | application | 0 | 0 | See service_providers. |
| `provider_services` | application | 0 | 0 | See service_providers. |
| `provider_verification_documents` | application | 0 | 0 | Private evidence documents. |
| `region_translations` | application | 60 | 60 | Existing content / reference data |
| `regions` | application | 20 | 20 | Source: ISTAT (verified; istat_code filled) |
| `reminders` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `role_user` | application | 2 | 2 | Existing content / reference data |
| `roles` | application | 9 | 9 | Existing content / reference data |
| `scholarship_translations` | application | 0 | 0 | See scholarships. |
| `scholarships` | application | 0 | 0 | No open dataset lists individual scholarships: MUR DSU data is aggregate regional statistics. Not populated. |
| `search_documents` | application | 300 | 6573 **▲** | Source: Derived index (rebuilt by expa:search-reindex) |
| `service_provider_translations` | application | 0 | 0 | See service_providers. |
| `service_providers` | application | 0 | 0 | Marketplace listings must be real, consenting, verified businesses. |
| `sessions` | infrastructure | 0 | 0 | Runtime |
| `study_program_translations` | application | 0 | 5988 **▲** | Source: MUR open data |
| `study_programs` | application | 0 | 5988 **▲** | Source: MUR open data |
| `subscription_items` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `subscriptions` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `tax_rates` | application | 0 | 1 **▲** | Source: Agenzia delle Entrate (IVA ordinaria) |
| `tax_table_translations` | application | 0 | 6 **▲** | Source: Agenzia delle Entrate + INPS |
| `tax_tables` | application | 0 | 2 **▲** | Source: Agenzia delle Entrate + INPS (expa:import:tax-reference) |
| `travel_requirement_translations` | application | 0 | 0 | See travel_requirements. |
| `travel_requirements` | application | 0 | 0 | Per-nationality entry rules: no reuse-licensed official dataset verified; wrong data is harmful. Not populated. |
| `universities` | application | 0 | 92 **▲** | Source: MUR open data (expa:import:study) |
| `university_translations` | application | 0 | 92 **▲** | Source: MUR open data |
| `user_documents` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `user_notifications` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `user_profiles` | application | 1 | 1 | Existing content / reference data |
| `user_recovery_codes` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `user_tasks` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `user_two_factor_credentials` | application | 0 | 0 | Private / transactional: intentionally empty (no real user data is imported or invented). |
| `users` | application | 1 | 1 | Existing content / reference data |
