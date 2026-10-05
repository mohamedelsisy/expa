# Backend requests from the web app

No blocking API problems found. Observations and small requests (none required a workaround that weakens security):

1. **Verification link host must equal the API origin the BFF calls.** `VerifyEmailNotification` embeds the signed URL built from `APP_URL`. The BFF only follows it when scheme/host/port and the path `/api/v1/auth/verify-email/{id}/{40-hex}` match `API_BASE_URL`. Observed: works when `APP_URL` equals the API origin (verified locally with `APP_URL=http://127.0.0.1:8001`). Expected: documented deployment rule (`APP_URL` = API origin reachable from the web server), or a separate `API_PUBLIC_URL` allow-list entry on the web side.
2. **Password rules are not discoverable.** The register form hint ("at least 10 characters, letters and numbers") mirrors `Password::min(10)->letters()->numbers()` in `AppServiceProvider` but is a static i18n string. Request: expose the rules in `GET /profile/options` (or a `/meta` endpoint) so clients cannot drift.
3. **No countries list.** Onboarding `nationality` needs ISO 3166 alpha-2 codes; the web uses `Intl.DisplayNames` with a code list bundled in `web/utils/countries.ts`. A `GET /countries` endpoint (localized names) would remove that duplication.
4. **Dismissed tasks report `applicable:false`.** In `GET /dashboard/tasks`, a task the user marked "not applicable" has `status:"dismissed"` and `applicable:false`, indistinguishable from "does not apply to your profile" except by status. The web handles it (shows Reopen when `status==='dismissed'`); a separate `dismissed` flag or `applicable_reason` would be clearer.
5. **Unknown guide slug 404 body** is the standard error envelope (good); noted only for completeness.

## Added with the second delivery (documents, AI, government, Italian, patente, jobs, search)
6. **`email_not_verified` / `exam_daily_limit` / min-time rules are not discoverable.** `POST /ai/ask` and `POST /patente/exams` now return 403 `email_not_verified` for unverified users (docs D9); the web shows a resend-verification prompt. Patente returns 429 `exam_daily_limit`, and an exam cannot be submitted before a quarter of its time has passed. These are only known from error responses; request: list them in `GET /patente/rules` (e.g. `daily_exam_limit`, `min_submit_fraction`) so clients can show them up front.
7. **AI message has no separate `disclaimer` field.** The built-in disclaimer is appended to `content` after a blank line starting with the warning sign. The web detects that last paragraph to style it. A structured `disclaimer` string on the message would be more robust.
8. **`meta: []` instead of `{}`** on search results without metadata (PHP empty array encodes as a JSON list). The web tolerates it; `meta` should be an object or null.
9. **Documents: `upcoming_reminders[].offset_days` is `-1` with `kind:"expired"`.** The web special-cases it. A `null` offset (or explicit `after_expiry`) would be cleaner.
10. **No endpoint to resume an AI request / see the daily reset time.** `ai_limit_reached` only says "try tomorrow"; a `reset_at` in `GET /ai/usage` would allow an exact message.
11. **Weak-topic data requires at least `weak_min_answers`.** Fine, but `GET /patente/topics` could return `question_count` only for topics with published questions, which it does; no change needed. (Noted for completeness.)
12. **Pre-existing hydration warning on `/profile`** (not caused by this delivery): a "Hydration completed but contains mismatches" console warning appears in production builds on the profile page only.

## Added with the admin panel (T-027)
13. **Four-eyes refusal is indistinguishable from "no permission".** `POST /admin/*/{id}/transition` to `approved` by the author/last editor returns the same 403 `forbidden` as a missing permission. The web infers it (target `approved` + user holds `<prefix>.review`). Request: a distinct code (e.g. `four_eyes_violation`) and `updated_by` in the admin resource so the UI can disable the button up front.
14. **Escalation refusals are generic too.** `PUT /admin/users/{id}/roles` and `PATCH /admin/users/{id}` return plain 403 `forbidden` for self-modification, privileged roles and privileged targets; the UI explains all the rules in one text. Distinct codes would allow an exact message.
15. **No lookup endpoints for relation selects.** Universities, topics, guides and offices are loaded with `GET /admin/<module>?per_page=100&sort=slug` (max 100, needs that module's view permission; the select falls back to a numeric ID input on 403). A lightweight `GET /admin/lookups/{kind}?q=` (id, slug, title) would remove the 100 cap and the extra permission.
16. **`GET /admin/jobs` and `GET /admin/subscriptions` ignore `sort`** and return `data` + `meta` without `locale`-only differences; sortable columns are therefore not offered there.
17. **`GET /admin/stats` has no currency** (`revenue_30d_minor`); the web assumes EUR (`config/billing.currency`). Add `currency` to `billing`.
18. **Job source `map` is `[]` (not `{}`) when empty** (PHP empty array). Handled in the UI; should be an object.
19. **`error_samples` shape is undocumented** (strings or objects). The UI renders each entry as text (objects as truncated JSON).
20. **Audit `subject_type` is a PHP class name** (`App\Domains\Guides\Models\Guide`). The UI shows the last segment; a stable short type key would be better, and `actor_id` has no name/email (only an id).
21. **Analytics has no per-event daily pivot or per-day totals**; the web sums `daily[]` per day. A `granularity`/`group` parameter would help.
22. **Translators hold `translations.update` but the content policies only check `<prefix>.update`**, so the translator role can read but not save translations. The web shows them read-only; a translations-only update path is needed to make that role useful.
