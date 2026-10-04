# Backend requests from the web app

No blocking API problems found. Observations and small requests (none required a workaround that weakens security):

1. **Verification link host must equal the API origin the BFF calls.** `VerifyEmailNotification` embeds the signed URL built from `APP_URL`. The BFF only follows it when scheme/host/port and the path `/api/v1/auth/verify-email/{id}/{40-hex}` match `API_BASE_URL`. Observed: works when `APP_URL` equals the API origin (verified locally with `APP_URL=http://127.0.0.1:8001`). Expected: documented deployment rule (`APP_URL` = API origin reachable from the web server), or a separate `API_PUBLIC_URL` allow-list entry on the web side.
2. **Password rules are not discoverable.** The register form hint ("at least 10 characters, letters and numbers") mirrors `Password::min(10)->letters()->numbers()` in `AppServiceProvider` but is a static i18n string. Request: expose the rules in `GET /profile/options` (or a `/meta` endpoint) so clients cannot drift.
3. **No countries list.** Onboarding `nationality` needs ISO 3166 alpha-2 codes; the web uses `Intl.DisplayNames` with a code list bundled in `web/utils/countries.ts`. A `GET /countries` endpoint (localized names) would remove that duplication.
4. **Dismissed tasks report `applicable:false`.** In `GET /dashboard/tasks`, a task the user marked "not applicable" has `status:"dismissed"` and `applicable:false`, indistinguishable from "does not apply to your profile" except by status. The web handles it (shows Reopen when `status==='dismissed'`); a separate `dismissed` flag or `applicable_reason` would be clearer.
5. **Unknown guide slug 404 body** is the standard error envelope (good); noted only for completeness.
