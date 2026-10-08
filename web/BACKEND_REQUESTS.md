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


## Wave 3 (production audit fixes)
Status of earlier items: #12 (hydration warning on `/profile`) is addressed web-side (WEB-20; needs browser confirmation). Everything else above is still open.

23. **Legal documents endpoint (needed by WEB-5), provisional contract.** `GET /api/v1/legal/{slug}` for `privacy`, `terms`, `cookies`, public, localized by `Accept-Language`, cacheable. Response `{ data: { slug, title, body, version, published_at, source? }, meta }`, where `body` is Markdown (headings `#`..`###`, paragraphs, `-`/`1.` lists, `**bold**`, `[text](https://...)`) **or** an array of blocks `{type:'heading'|'paragraph'|'list', level?, text?, items?, ordered?}`; `source` is optional `{name, url}`. Unpublished/unknown slug: 404 standard error envelope. The web renders these without `v-html` and shows an honest "not published yet" state on 404; it never ships placeholder legal text. The sitemap lists a legal page only while this returns 200. Please also expose the document `version` in `GET /privacy/purposes` (`policy_version` already exists) so consent UI and document agree.
24. **`TRUSTED_PROXIES` must include the web host (WEB-3).** The BFF now sends `X-Forwarded-For: <real client IP>` on every upstream call. Until the API trusts the web server's address, Laravel ignores it and all guests still share one rate-limit bucket. Set `TRUSTED_PROXIES` to the web container/host address (and keep `BEHIND_PROXY=true`).
25. **Sitemap data.** The sitemap generator pages through public lists with `per_page=50` and reads `slug` and `updated_at` from each item: `guides`, `government/services|offices`, `appointments/guides`, `italian/lessons`, `patente/topics`, `study/universities|programs|scholarships`. Lists that omit `updated_at` simply have no `<lastmod>`. Please add `updated_at` to the list items that lack it and honour `per_page` up to 50.
26. **Billing availability for guests.** `billing_available` exists only in the authenticated `GET /billing/subscription`. `/pricing` therefore says "payments are not enabled" for guests. Request: add `billing_available` to the public `GET /billing/plans` meta.
27. **Study `verify_notice` is inside every item** (and in `meta`); fine. Request only: add `updated_at` to study list items (sitemap `lastmod`).
28. **Plural form for result counts** is a web concern (i18n `{count}` without plural rules in it/en "1 risultati"); no backend action.


## Resolution status (backend, 2026-10-07)
RESOLVED in the backend (see docs/API_SPEC.md "Client requests wave"; web code not touched):
- #2 password rules: already in `GET /meta` (`password.min_length`, `requires_letters`, `requires_numbers`).
- #3 countries: `GET /countries[?q]` (localized, ICU data).  #4 `dismissed` + `applicable_reason` on dashboard tasks.
- #6 `daily_exam_limit`, `min_submit_fraction` in `GET /patente/rules` (`email_not_verified` is listed in `GET /meta.verification_required_for`).
- #7 AI message already has a structured `disclaimer` field.  #9 `after_expiry:true` on reminders (`offset_days` still -1).  #10 `resets_at` already in `GET /ai/usage`.
- #8 and #18 `meta`/`map` as `{}`: job source `map` is now always an object (search `meta` unchanged: only the search results with empty metadata were reported, still tolerated by the web).
- #13 `four_eyes_violation` code + `updated_by` + `four_eyes_blocked`.  #14 `cannot_modify_self`, `privileged_target`, `privileged_role_reserved`.
- #15 `GET /admin/lookups/{kind}`.  #16 whitelisted `sort` on `/admin/jobs` and `/admin/subscriptions`.  #17 `billing.currency`.  #19 `error_samples` is a list of reason-code strings.
- #20 audit `subject_type` alias + `actor{id,name}` (email deliberately not exposed).  #21 `daily_totals` (pivot by name stays client-side).
- #22 translators save translations via `PATCH /admin/<module>/{id}/translations` (T-051).
- #23 `GET /legal/{slug}` exists (T-070; `body` is Markdown, `format:"markdown"`, 404 while unpublished). `policy_version` in `GET /privacy/purposes` already linked to the published privacy version.
- #24 documented (docs/ENVIRONMENT.md, docs/DEPLOYMENT.md): set `TRUSTED_PROXIES` to the web host; this is deployment configuration, not code.
- #25 `updated_at` on all sitemap lists; `per_page` max 50 on guides/government/appointments (italian/lessons allows 100); patente topics are unpaginated; study lists max 50.
- #26 `meta.billing_available` on `GET /billing/plans`.  #27 `updated_at` on study list items.
- #1 documented rule: `APP_URL` = API origin reachable from the web server (docs/DEPLOYMENT.md).
- Export: `POST /profile/export {password}` exists; set `EXPORT_REQUIRE_PASSWORD=true` once the web/mobile clients use it.
NOT backend work / unchanged: #5, #11, #12 (web), #28 (web).


## Wave 4 (housing, explainer, articles/cities, marketplace, community, practice; web delivery)
29. **Cover images are not shown.** `articles[].cover_image_url` is an arbitrary https URL, and the web CSP is `img-src 'self' data:`. Request: either serve covers from the EXPA origin (upload + resized variants) or document the allowed image hosts so the CSP can list them.
30. **Listening recordings are not played.** `audio.url` (vocabulary/exercises) would need `media-src` in the CSP. The web uses the browser's own speech synthesis (`it-IT`) for listening exercises and ignores `audio.url` until the hosts are known. A listening exercise has no field that says WHICH text to speak: the web reads `form.stem`, else `prompt`. Request: an explicit `speak_text`.
31. **Match exercises: the answer order is inferred.** The docs say "list of right ids"; the web sends one right id per left item in left order (verified against `ExerciseGrader::gradeMatch`). Please state this in the API docs.
32. **`GET /housing/usage` and `GET /documents/explain/usage` carry the limits** (`max_chars`, `max_file_kb`, `max_text_chars`); the web reads them but falls back to 12000 / 8 MB / 15000 characters when the call fails. `GET /meta` could carry them too.
33. **Provider portal 403 on missing listing.** The web treats `provider_account_required` (or 403/404) on `GET /provider/profile` as "no listing yet". A stable code on every portal route would be cleaner.
34. **Provider services cannot be edited in the admin.** `admin/marketplace/providers` accepts `services` only through the owner payload; the generic admin form edits the listing fields and translations, not the services list.
35. **Community moderation page is always listed** for users with `community.moderate`; it shows "feature off" when the queue answers 404. A flag in `GET /auth/me` (or `/meta`) such as `features.community` would let clients hide it and the public nav without a probe request to `GET /community/meta`.
36. **City profile slug.** The profile slug mirrors the city slug on create; the admin form therefore hides the slug. `GET /admin/city-profiles/{id}` should return `city_slug`/`city_name` so the list can show the city.
37. **Analytics consent for guests.** The web sets a first-party cookie `expa_analytics=granted|denied` from a banner (guests only) and the BFF turns it into `X-Analytics-Consent: granted` on every upstream call, plus `X-Client: web`. Signed-in users rely on the stored `analytics` purpose. `guide_view`/`job_view` are counted by the API; the web only POSTs `appointment_clicked`.
38. **Admin AI and settings item shapes are only in the controllers.** `admin/ai/knowledge`, `admin/ai/usage`, `admin/ai/conversations`, `admin/settings` and `admin/notifications/broadcast` are rendered from the controller code (`AiAdminController`, `SettingsAdminController`, `NotificationAdminController`), not from `docs/API_SPEC.md`. The settings page renders whatever nested keys come back (labels are the raw keys), so new keys appear without a web change.
39. **User erasure has no password step.** `DELETE admin/users/{id}` does not ask for the acting admin's password; the web asks for the typed email only. If a re-authentication step is wanted for this irreversible action, the API must enforce it (for example `password` in the body) and return a stable code.
40. **Community blocks never name the blocked member** (by design), so the blocked list shows "Blocked member N" and the date. Fine for privacy, but users cannot tell whom they unblock; a client-side label chosen when blocking (kept only on the device) is not possible because the web stores nothing in the browser. Tell us if a masked display name should be returned.
41. **Billing invoices are JSON only.** `GET billing/invoices` has no PDF or hosted-invoice URL; the web lists number, date, description, total and VAT, without a download link.
42. **Comments cannot be blocked from the web yet.** The block button exists on questions and answers; `POST community/blocks` also accepts `type=comment` and the web can add it to comments when needed.
43. **No per-area article category for business, family and travel.** `articles/categories` has no such values, so those landing pages show guides only and say nothing about articles. Add the categories (or a tag filter) if editors want articles there.
44. **Patente question slug is not exposed.** `POST /ai/ask` accepts `patente_question` (slug), but `GET patente/exams/{id}` questions and review items carry only a numeric `id`. The web renders "Explain this" on a question only when `slug` is present (`ExamQuestion.slug`, `ReviewItem.slug`); until the API adds it, the Teacher is reachable for topics (topic page and Ask EXPA) but not for individual exam questions.
45. **Content readiness cannot separate "never verified" from "stale".** Admin lists only offer `filter[stale]=true` (null OR older than the window). The readiness page therefore shows one column, "needs verification", counted on published items (`filter[status]=published&filter[stale]=true`). A `filter[verified]=never` or per-freshness counts in `meta` (or one `GET /admin/content/summary`) would avoid 4 list calls per module (about 80 calls per page load, throttled to 3 in flight).
46. **Tax table / travel requirement admin: no list filters in the generic workspace.** `filter[tax_year]`, `filter[nationality]`, `filter[destination]` exist on the API, but the generic filter bar only supports enum and relation filters; the web does not expose them yet.
47. **Travel `residence_status` vocabulary.** The API accepts any `[a-z_]{2,40}` and documents only `visa` and `residence_permit`. The public form offers just those two; a `GET /travel/meta` with the allowed statuses would keep form and admin in step.
48. **Service providers have no source columns** (`ServiceProvider::contentAttributes()`), so the admin hides the source card for them (previously it showed fields the API silently dropped). Region and city (accepted by the API) are now editable for providers.
49. **Net salary `rate` unit.** The web assumes bracket `rate` and `contribution_rate` are percentages 0-100 (as in `TaxTableRequest`) and prints them as `23%`; confirm `estimate.brackets[].rate` uses the same unit.
