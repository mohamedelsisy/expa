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

## Update: production-audit remediation (2026-10-05)
- **Export re-authentication (BE-17)**: `POST /profile/export` requires the password; `EXPORT_REQUIRE_PASSWORD=true` disables the token-only GET form.
- **Admin access to AI data (MVP-15)**: `GET /admin/ai/conversations` and `/admin/ai/usage` return ids, user id, locale, message and degraded COUNTS, intents and token totals only. Conversation titles and message text (encrypted at rest) are never exposed to any admin role; support needing content must obtain the user's own export. Knowledge-base views contain only public, published content.
- **Admin-triggered erasure**: `DELETE /admin/users/{id}` (`users.delete`) runs the same two-phase erasure as the user's own request (lock and token revocation now, queued erase), is audited with the actor, and cannot target self, staff or an account already being erased.
- **Retention rows kept by design**: payments, invoices and consents (legal retention); their FKs are now `RESTRICT` so nothing can destroy them silently (BE-28).
- **Analytics (MVP-12)**: guide/job views are counted by the backend only with consent (stored consent or the consent header); aggregate counters, no person identifier.
- **Broadcasts** are in-app only; no email or push is sent for announcements because no dedicated consent purpose exists. Job alerts for saved criteria need a new consent purpose and counsel-approved text: BLOCKED_LEGAL, not built.
- **Antivirus**: files are streamed to clamd inside the private network; nothing is sent to a third party. A scan outage rejects the upload rather than storing an unscanned file.
- **Logs**: AI failures log no prompt, name or e-mail (asserted by `AnthropicClientHardeningTest`); push logs only counts; Stripe error bodies are never logged or shown.
- **Pending human decisions** (BE-12): policy text and version, system-analytics basis, retention periods, VAT/invoice obligations.

## Marketplace and community data (T-060..T-063)
- Providers `MarketplaceData` and `CommunityData` are registered in `privacy.providers` and the structural guard test covers their tables.
- Export: reviews written, contact requests sent (including what was shared and the consent timestamp/version), reports filed, the owned provider listing; community questions/answers/comments (including ones the user deleted), vote/block counts, any moderation restriction.
- Erasure: reviews are anonymised (author link and text removed, the star rating stays so aggregates are not silently altered); contact requests deleted; reports keep the outcome but lose the reporter; an owned listing is unpublished, stripped of contact data, evidence files and leads, and soft-deleted; community posts are detached from the account and kept for thread integrity (optionally text blanked with `COMMUNITY_ERASE_TEXT=true`), votes, blocks and restrictions deleted.
- Legal basis: contact requests rest on explicit per-request consent for sharing contact data with that provider (`consent_given_at`, `consent_version` stored); posting reviews/community content is part of the service (terms). Retention: leads `MARKETPLACE_LEAD_RETENTION_DAYS` (365).
- Planned (not built): events, language exchange and groups.

## Update: document explainer, housing checker, practice data (T-070..T-074)
- **Nothing is persisted by default** by `POST /documents/explain` and `POST /housing/check`: files live in a temp directory for the request and are deleted; text is held in memory. Tests assert that no table contains the submitted text and that the temp directory is empty afterwards. Optional LLM processing sends redacted text to the configured AI provider; this is covered by dedicated consent purposes `document_analysis` and `housing_analysis` (withdrawable; legal basis consent).
- Only per-day counters (`feature_usage`) are kept for quotas. Saved housing results (explicit user action) are encrypted, expire after `HOUSING_RETENTION_DAYS` (default 90, pruned by `expa:prune-housing-checks`), are exported and erased by `HousingData`.
- Providers added to `privacy.providers`: `FeatureUsageData`, `HousingData`, `ItalianPracticeData` (vocabulary Leitner state and exercise attempts). The structural guard test lists their tables.
- Legal basis for the privacy policy version: consents record the published privacy document version (`PolicyVersion`); a new published version triggers re-consent. Legal texts need counsel approval (docs/CONTENT_VERIFICATION.md).
