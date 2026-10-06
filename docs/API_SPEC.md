# EXPA — API Specification (v1)

Base: `/api/v1`. JSON. Auth: Sanctum bearer token (mobile) / cookie SPA. Locale: `Accept-Language: ar|en|it` or `?lang=`.

## Envelope
Success: `{"data": <obj|array>, "meta": {"locale":"ar","page":1,"per_page":20,"total":120}}`
Error: `{"error":{"code":"validation_failed","message":"…","details":{"field":["…"]}}}`
Status codes: 200/201/204, 401, 403, 404, 422, 429, 500. Rate limits: auth 5/min per IP+email, API 60/min per user, AI per plan.
List endpoints: `?page`, `?per_page` (max 100), `?sort=-created_at`, `?filter[field]=`.

## Endpoints
| Area | Endpoints |
|---|---|
| Auth | POST `/auth/register`, `/auth/login`, `/auth/logout`, POST `/auth/forgot-password`, `/auth/reset-password`, GET `/auth/verify-email/{id}/{hash}` |
| Profile | GET/PATCH `/profile` (personalization fields need `profile_personalization` consent → 403 `consent_required`), POST `/profile/onboarding/skip {step}`, POST `/profile/onboarding/complete`, GET `/profile/options` (public, localized enum labels + onboarding step copy), GET `/profile/export` (GDPR export, 5/h), DELETE `/profile {password}` (GDPR erasure, 202, async) |
| Privacy | GET `/privacy/purposes` (public: what/why/legal basis/required per purpose, localized), GET/PUT `/profile/consents` (append-only ledger; required purposes cannot be withdrawn) |
| Dashboard | GET `/dashboard` (greeting, personalization state, onboarding summary, `score{overall,categories[],how_calculated,note}`, `next_actions[≤5]`), GET `/dashboard/tasks` (catalog with per-user status/applicability, guide link only if the guide is published), PUT `/dashboard/tasks/{key} {status: todo\|done\|dismissed}` |
| Documents (tracker) | GET `/document-types` (public, localized). Auth: GET/POST `/my-documents` (filters `filter[type]`, `filter[status]=valid\|expiring_soon\|expired\|no_expiry`, sorted by soonest expiry), GET/PATCH/DELETE `/my-documents/{id}`, POST `/my-documents/{id}/attachments` (multipart `file`; 30/h), GET/DELETE `/my-documents/{id}/attachments/{aid}`. Creating/updating/uploading needs `document_storage` consent (403 `consent_required`); reading and deleting never do. Other users' ids → 404. Each document returns `days_remaining`, `status`, effective `reminder_offsets` |
| Guides (public) | GET `/guides` (published only; `category`, `city`, `region`, `q`, `per_page`≤50; city view = national + region + city guides, region view = national + region guides), GET `/guides/{slug}` (full template), GET `/guides/categories`. Every item carries `locale`, `fallback`, `available_locales`, `source{name,url,type,last_verified_at,freshness}` |
| Guides (admin) | GET/POST `/admin/guides`, GET/PUT/PATCH/DELETE `/admin/guides/{id}`, POST `/admin/guides/{id}/transition {to}`, POST `/admin/guides/{id}/schedule {publish_at}`. Workflow permissions: `guides.update` (draft, submit), `guides.review` (approve/reject), `guides.publish` (publish/unpublish/archive/edit live). Editors cannot edit approved/published content (403 `content_locked`); authors cannot approve their own (four-eyes, `CONTENT_FOUR_EYES`). Publishing returns 422 `content_not_publishable` with `details.problems[]` |
| Government (public) | GET `/government/services` (`domain`,`city`,`region`,`q`), `/government/services/{slug}` (adds `guide` link if published + linked `offices`, filterable by `city`), `/government/offices` (`type`,`city`,`region`,`q`), `/government/offices/{slug}`. Same source/freshness/fallback metadata as guides |
| Government (admin) | Standard content routes under `/admin/government/services`, `/admin/government/offices` (see below) |
| Appointments (public) | GET `/appointments/guides` (`office_type`), `/appointments/guides/{slug}`, `/appointments/hub?type=&city=` (how-to guide + offices serving the city, each with its official booking destination). Every `booking` object has `booked_by_expa:false` and a localized notice: EXPA redirects, it never books |
| Appointments (admin) | `/admin/appointments/guides` (standard content routes) |
| Standard admin content routes | For each content module: GET/POST `/admin/{module}`, GET/PUT/PATCH/DELETE `/admin/{module}/{id}`, POST `/{id}/transition {to}`, POST `/{id}/schedule {publish_at}`; permissions `{resource}.view/create/update/review/publish/delete`; filters `filter[status]`, `filter[q]`, `filter[stale]` + module filters |
| Jobs (public) | GET `/jobs` (`q`,`city`,`remote`,`type`,`category`,`italian_max`; listed = published and not expired; with a token each item gets `saved` + `match`), GET `/jobs/{id}` (adds `description`, original `apply_url`, `apply_notice`), GET `/jobs/meta`. `visa_sponsorship.stated` is true only when the source's structured data said so |
| Jobs (auth) | GET `/jobs/recommended` (score ≥ threshold and enough evaluable criteria), GET `/jobs/saved`, POST/DELETE `/jobs/{id}/save`, POST `/jobs/{id}/apply-click` (counts; returns the original URL, `submitted_by_expa:false`), GET/PUT `/jobs/profile` (skills, experience, education, remote/contract/salary/city preferences; needs `profile_personalization`). `match = {score\|null, confidence, reasons[{key,status: match\|partial\|mismatch\|unknown,label,detail}]}` — unknown criteria are excluded, never penalized |
| Jobs (admin) | `/admin/job-sources` CRUD (+ `/{id}/run` queue, `/{id}/runs`; permissions `job_sources.*` held by content_manager/admin only; activation needs a documented `legal_basis`; URL/headers never returned), `/admin/jobs` (list/filter), PATCH `/admin/jobs/{id} {status: published\|hidden}` (`jobs.publish`) |
| Italian (public) | GET `/italian/levels`, `/italian/meta` (localized lesson types + 13 scenarios), `/italian/lessons` (`level`,`type`,`scenario`; own `progress` attached when a token is sent), `/italian/lessons/{slug}` (items: words/dialogue/tips) |
| Italian (auth) | GET `/italian/daily` (5 slots: words, grammar, conversation, pronunciation, mission + minutes, done_today, streak), GET `/italian/progress` (per level, streak), POST `/italian/lessons/{slug}/progress {status: started\|completed, score?}`. Admin: `/admin/italian/lessons` (standard content routes; no external source needed to publish) |
| Patente (public) | GET `/patente/categories[/{slug}]`, `/patente/topics[/{slug}]` (theory, source + freshness; `question_count`), `/patente/rules` (mock-exam settings). **There is deliberately no endpoint that lists or dumps questions.** |
| Patente (auth) | POST `/patente/exams {mode: exam\|practice, topics[], size?}` (exam = full configured size or 422 `not_enough_questions`; 20/h), GET `/patente/exams` (finished history), GET `/patente/exams/{id}` (unfinished: statements only, never answers), POST `/patente/exams/{id}/answers {answers:[{question_id, answer}]}` → graded once (409 `exam_already_finished`), review reveals answer + explanation, GET `/patente/progress` (summary, per-topic accuracy, weak topics) |
| Patente (admin) | `/admin/patente/{categories,topics,questions}` (standard content routes; permissions `patente.*`; questions need `rights_note`, source, `it`+`ar`) |
| AI | POST `/ai/ask {message ≤1000, conversation_id?}` → `{conversation_id, message{content, label[official\|general_guidance\|ai_explanation\|third_party], label_text, sources[{n,title,ref,source{name,url,type,last_verified_at,freshness}}], actions[{type,target,label}], degraded}, usage{remaining}}`, `meta.degraded`; GET `/ai/usage`; GET `/ai/conversations`; GET/DELETE `/ai/conversations/{id}`. 20 req/min + daily plan limit (429 `ai_limit_reached`) |
| Search (public, 60/min) | GET `/search?q=&types[]=&page=&per_page=` → one result per item in the best available language `{type,type_label,id,slug,title,snippet,route,locale,meta}`, `meta.facets[{type,label,count}]`; types: guide, government_service, government_office, appointment_guide, italian_lesson, patente_topic, patente_category, job. GET `/search/suggest?q=` (title completions) |
| Notifications | GET `/notifications` (`unread`, pagination; `meta.unread`; text localized at read time; `cta` only while the target exists), POST `/notifications/{uuid}/read`, POST `/notifications/read-all`, DELETE `/notifications/{uuid}`, POST `/devices {token, platform}` (needs `push_notifications` consent), DELETE `/devices {token}` |
| Admin | `/admin/{users,roles,guides,articles,government-services,government-offices,jobs,job-sources,lessons,translations,audit-logs,stats}` — permission-gated |
| System | GET `/health` (public, minimal) |

Each endpoint documented with request/response examples in OpenAPI (`backend/storage/api-docs`, generated later — task T-DOC-01).

## Billing (T-037)
| Endpoint | Notes |
|---|---|
| GET `/billing/plans` | public, localized, active only; `price{amount_minor,currency,interval}` (editable data, never hard-coded), `features` |
| GET `/billing/subscription` | `plan`, `status` (free\|active\|past_due\|…), `current_period_end`, `cancel_at_period_end`, `billing_available` |
| POST `/billing/checkout {plan}` | → `{checkout_url}` (provider-hosted page). Redirect URLs are fixed server-side. 503 `billing_unavailable` when no provider; 422 `plan_not_purchasable`; 409 `already_subscribed` |
| POST `/billing/cancel` | cancel at period end (access kept until then) |
| GET `/billing/invoices` | own invoices (`EXPA-YYYY-######`) |
| POST `/billing/webhook/{provider}` | provider → EXPA, no user auth; signature verified by the provider adapter (400 on failure); idempotent by event id |
| Admin | GET `/admin/subscriptions` (`subscriptions.view`), POST `/admin/subscriptions/grant`, POST `/admin/subscriptions/{id}/cancel` (`subscriptions.manage`, audited) |

## Analytics (T-039)
| Endpoint | Notes |
|---|---|
| POST `/analytics/events {name, subject?}` | client-reported behaviour (`guide_view`, `job_view`, `appointment_clicked`, `lesson_started`); always 204; recorded only with the user's `analytics` consent (authenticated) or `X-Analytics-Consent: granted` (anonymous, set by the client's consent banner); `X-Client: web\|ios\|android`; 60/min |
| GET `/admin/stats` | dashboard numbers (users, AI usage, content pending review/stale, jobs, billing, queue health); `reports.view` |
| GET `/admin/analytics?from&to&name` | totals, daily series and top content slugs; `reports.view` |
Server-side counters (signup, login, ai_question, document_added, reminder_created, lesson_started/completed, job_apply_click, subscription_started) are aggregate-only and cannot be forged by clients.

## Study in Italy (T-040)
| Endpoint | Notes |
|---|---|
| GET `/study/meta` | localized degree levels, fields, instruction languages, `verify_notice` |
| GET `/study/universities[/{slug}]` | published only; detail lists its published programs |
| GET `/study/programs` (`field`,`degree`,`language`,`city`,`q`) / `/{slug}` | `tuition` is `null` unless the source states it; `deadline{date,status: upcoming\|passed\|not_stated}`; every item has `verify_notice`, source + freshness |
| GET `/study/finder?field&degree&language&budget&city&italian_level&english_level[&use_profile=1]` | ranked programs with `match{score,confidence,reasons[]}`. Field, degree and language are **must-match**; budget, city and language levels rank; unknown facts are excluded from the score. `use_profile` needs sign-in + personalization consent |
| GET `/study/scholarships[/{slug}]` (`degree`,`open_only`) | deadline status + verify notice |
| Admin | `/admin/study/{universities,programs,scholarships}` (standard content routes, `universities.*` permissions; a programme cannot be published before its university) |

## Update: production-audit remediation (2026-10-05)
Corrections to stale rows above and new endpoints.
- **AI answer shape**: `message` also carries `disclaimer` (localized safety note, shown separately from `content`; present on unsourced and sensitive answers, otherwise null), `degraded` (boolean) and `created_at`. `GET /ai/usage` returns `{limit, remaining, resets_at}` where `resets_at` is the next local midnight (ISO 8601).
- **`GET /meta`** (public, `Cache-Control: public, max-age=300`): `locales[{code,name,dir}]`, `default_locale`, `password{min_length,requires_letters,requires_numbers}`, `uploads{max_file_mb,max_files_per_document,max_total_mb_per_user,allowed_mimes}`, `ai{max_message_chars,daily_limits}`, `patente{exam_questions,exam_max_errors,exam_minutes,daily_exam_limit,daily_practice_limit}`, `reminders{default_offsets_days}`, `verification_required_for[ai_ask,patente_exams,admin]`. Clients must read limits from here instead of hard-coding them.
- **Error envelope**: every HTTP error uses `{error:{code,message,details?}}`. New codes: `method_not_allowed` (405), `bad_request`, `payload_too_large`, `unsupported_media_type`, `session_expired` (419), `service_unavailable`, `request_failed`, `scanner_unavailable` (503, upload could not be virus-checked, nothing stored, retry later), `limit_reached` (422, per-user maximum), `cannot_modify_self`, `last_super_admin`, `password_required`, `source_has_data` (409), `city_in_use` (409).
- **Auth**: `GET /auth/tokens` (own signed-in devices: id, name, last_used_at, created_at, expires_at, current), `DELETE /auth/tokens/{id}` (revoke one). Login responds `429` with `Retry-After` when the per-account guard refuses an unknown network. Staff tokens expire after 12 h. A suspended or erasing account gets `401 unauthenticated` on any request.
- **Privacy**: `POST /profile/export {password}` (same payload as GET); with `EXPORT_REQUIRE_PASSWORD=true` the GET form returns `403 password_required`.
- **Documents**: attachment download uses an RFC 6266 `Content-Disposition` (ASCII fallback + `filename*=UTF-8''`). Per-user maxima: 200 documents, 10 devices, 500 saved jobs.
- **Analytics**: `POST /analytics/events` whitelist unchanged (`guide_view`, `job_view`, `appointment_clicked`, `lesson_started`; consent header or stored consent, always 204). The backend now also counts `guide_view` (`GET /guides/{slug}`) and `job_view` (`GET /jobs/{id}`) itself when the request carries `X-Analytics-Consent: granted` or a signed-in user has analytics consent; clients must not also POST the same view. `appointment_clicked` is client-reported (the redirect to the official booking page happens client-side).
- **Billing**: `GET /billing/invoices` adds `net_minor` and `tax{rate,amount_minor,country}` only when a VAT rate was configured; webhook `POST /billing/webhook/{provider}` supports `fake` and `stripe` (`Stripe-Signature`). Subscription `status` values: `active`, `trialing`, `past_due` (grace period, access kept), `canceled`, `expired`. New notification types `payment_failed`, `payment_failed_reminder`, `subscription_ended`, `scanner_unavailable` (admins), `announcement`.
- **Translations (MVP-5)**: `PATCH /admin/{resource}/{id}/translations {translations}` on every content resource: translation text only, allowed with `{resource}.update` or `translations.update`; live (approved/published) content stays locked unless the caller may publish; workflow transitions are unchanged.
- **New admin endpoints (MVP-15)**: `GET/POST /admin/cities`, `PUT|PATCH/DELETE /admin/cities/{id}`, `GET /admin/regions` (`cities.*`); `DELETE /admin/users/{id}` (`users.delete`, starts GDPR erasure, 202; not self, not staff); `POST /admin/notifications/broadcast {title{ar,..},body{ar,..},role?}` (`notifications.send`, in-app only, 5/hour, Arabic required, 202); `GET /admin/settings` (`settings.view`, read-only, no secrets); `GET /admin/ai/knowledge`, `POST /admin/ai/knowledge/reindex` (`ai.manage_knowledge`); `GET /admin/ai/conversations`, `GET /admin/ai/usage` (`ai.view_conversations`, METADATA ONLY, never titles or messages). `GET /admin/stats` returns `billing: null` without `reports.finance`, and `system.scheduler_heartbeat_at`.
