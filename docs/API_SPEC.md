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
| Jobs | GET `/jobs`, `/jobs/{id}`, POST `/jobs/{id}/save`, GET `/jobs/recommended`, POST `/jobs/{id}/apply-click` |
| Italian | GET `/italian/levels`, `/italian/lessons`, `/italian/daily`, POST `/italian/lessons/{id}/progress` |
| Patente | GET `/patente/categories`, `/topics`, POST `/patente/exams`, POST `/patente/exams/{id}/answers`, GET `/patente/progress` |
| AI | POST `/ai/ask`, GET `/ai/conversations`, GET `/ai/conversations/{id}` |
| Search | GET `/search?q=&types[]=` |
| Notifications | GET `/notifications` (`unread`, pagination; `meta.unread`; text localized at read time; `cta` only while the target exists), POST `/notifications/{uuid}/read`, POST `/notifications/read-all`, DELETE `/notifications/{uuid}`, POST `/devices {token, platform}` (needs `push_notifications` consent), DELETE `/devices {token}` |
| Admin | `/admin/{users,roles,guides,articles,government-services,government-offices,jobs,job-sources,lessons,translations,audit-logs,stats}` — permission-gated |
| System | GET `/health` (public, minimal) |

Each endpoint documented with request/response examples in OpenAPI (`backend/storage/api-docs`, generated later — task T-DOC-01).
