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
| Documents (tracker) | GET `/document-types` (public, localized). Auth: GET/POST `/my-documents` (filters `filter[type]`, `filter[status]=valid\|expiring_soon\|expired\|no_expiry`, sorted by soonest expiry), GET/PATCH/DELETE `/my-documents/{id}`, POST `/my-documents/{id}/attachments` (multipart `file`; 20/h), GET/DELETE `/my-documents/{id}/attachments/{aid}`. Creating/updating/uploading needs `document_storage` consent (403 `consent_required`); reading and deleting never do. Other users' ids → 404. Each document returns `days_remaining`, `status`, effective `reminder_offsets` |
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
