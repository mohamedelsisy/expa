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
