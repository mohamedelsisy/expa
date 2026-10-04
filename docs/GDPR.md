# EXPA — GDPR Plan

- **Roles**: EXPA = controller. Processors (hosting, email, LLM, push) require DPAs; LLM calls send minimized context only.
- **Lawful basis**: contract (account), consent (marketing, analytics, push, document storage), legitimate interest (security logs).
- **Consent**: `consents` table, versioned, append-only, per purpose; withdrawable in settings.
- **Data minimization**: onboarding questions optional; document attachments optional; scanner results not stored unless user saves.
- **Rights**: `GET /profile/export` (JSON bundle, async for large), `DELETE /profile` (queued erasure; anonymizes audit references; completes ≤ 30 days, immediate soft-disable), rectification via profile endpoints.
- **Retention**: AI messages 12 months (configurable), notifications 6 months, import-run logs 90 days, audit logs 24 months, attachments until user deletes or account erasure.
- **Special categories**: nationality/residence status may reveal ethnic origin/immigration status → treated as high-sensitivity: encrypted where feasible, never used in analytics, never in logs.
- **Analytics**: first-party, event names only, no PII, opt-out honoured.
- **Breach process**: documented runbook (detect → assess → notify Garante within 72h when required).
- **Documents to ship**: Privacy Policy, Cookie Policy, ToS (templates need legal review — marked BLOCKED on human/legal approval).

## Implemented (T-006)
- Purposes (`ConsentPurpose`): terms, privacy (required); profile_personalization, document_storage, ai_personalization, email_reminders, push_notifications, analytics, marketing (optional, opt-in, default off).
- Every purpose has localized title / why / data-collected text served by `GET /privacy/purposes` and shown before consent is asked.
- Registration requires accepting terms + privacy; logged with policy version. Policy-version bump flags consents as `outdated` for re-confirmation.
- Personalization data cannot be stored without `profile_personalization`; clearing data is always allowed. Code that personalizes must call `ConsentService::has()` (dashboard/AI/job-matching: enforced in their tasks).
- Nationality and residence type encrypted at rest. IPs stored only as HMAC.

## Implemented (T-009)
- **Architecture**: `PersonalDataProvider` interface (`key/export/erase`), providers tagged `privacy.providers`. Today: account, profile, consents, activity_log. **Every future module with user data must add a provider**; `PrivacyTest::test_every_user_linked_table_is_covered_by_an_erasure_provider` fails when a new `user_id` table appears unregistered.
- **Export** `GET /profile/export` — JSON bundle, rate-limited (5/h), audited. Excludes secrets/hashes.
- **Erasure** `DELETE /profile {password}` — step 1 (sync): status `pending_erasure`, all tokens revoked, login blocked (looks like unknown account); step 2 (queued `EraseUserData`, 5 retries w/ backoff, idempotent): providers erase module data, user row anonymized (`Deleted user`, `deleted-{id}@erased.invalid`) and soft-deleted. The email becomes available for re-registration. No undo/grace period (decision: simplest compliant behaviour; revisit with product).
- **Retained after erasure (documented legitimate basis)**: consent decision history (accountability; IP hash removed, linked only to the anonymized stub) and security audit rows (actor nulled, IP hash and change details removed). `privacy.erased` is logged with no actor.

## Billing data (T-037)
Export includes subscriptions, payments, invoices (no provider references) and payment-method metadata. On erasure payment methods are deleted and live subscriptions ended; **payments and invoices are retained** because accounting/tax law requires it (GDPR Art. 17(3)(b)) — they reference only the anonymized account stub. EXPA never stores card numbers.

## Analytics (T-039)
- Data minimization by construction: only daily aggregate counters (event, platform, language, optional public content slug). No identifiers, so there is nothing to export or erase per user.
- Client-reported behavioural events require the user's `analytics` consent (withdrawal stops recording immediately); anonymous visitors count only when the client asserts consent from its banner.
- **Decision pending legal review**: server-side counters for core product events (signup, login, …) are aggregate counts with no personal data and are recorded without consent. Switch off with `ANALYTICS_SYSTEM_EVENTS=false` if counsel disagrees.
