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
| Profile | GET/PATCH `/profile`, POST `/profile/onboarding`, GET `/profile/export`, DELETE `/profile` (erasure), GET/PUT `/profile/consents` |
| Dashboard | GET `/dashboard` (score, categories, next actions), GET `/dashboard/score` |
| Documents (tracker) | CRUD `/my-documents`, POST `/my-documents/{id}/attachments`, CRUD reminders |
| Guides | GET `/guides`, `/guides/{slug}` (category, region, city filters) |
| Government | GET `/government/services`, `/government/services/{slug}`, `/government/offices` |
| Appointments | GET `/appointments/guides` |
| Jobs | GET `/jobs`, `/jobs/{id}`, POST `/jobs/{id}/save`, GET `/jobs/recommended`, POST `/jobs/{id}/apply-click` |
| Italian | GET `/italian/levels`, `/italian/lessons`, `/italian/daily`, POST `/italian/lessons/{id}/progress` |
| Patente | GET `/patente/categories`, `/topics`, POST `/patente/exams`, POST `/patente/exams/{id}/answers`, GET `/patente/progress` |
| AI | POST `/ai/ask`, GET `/ai/conversations`, GET `/ai/conversations/{id}` |
| Search | GET `/search?q=&types[]=` |
| Notifications | GET `/notifications`, POST `/notifications/{id}/read`, POST `/devices` |
| Admin | `/admin/{users,roles,guides,articles,government-services,government-offices,jobs,job-sources,lessons,translations,audit-logs,stats}` — permission-gated |
| System | GET `/health` (public, minimal) |

Each endpoint documented with request/response examples in OpenAPI (`backend/storage/api-docs`, generated later — task T-DOC-01).
