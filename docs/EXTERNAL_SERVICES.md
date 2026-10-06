# External services

Every adapter below is implemented provider-independently behind an interface, configured only through environment variables, fails safe, and is tested with `Http::fake` or an in-process stream. NONE of them has been run against the real service (no credentials exist yet): status for each is **BLOCKED_EXTERNAL_CREDENTIAL — code complete, live-untested**. Variables are listed in ENVIRONMENT.md; `php artisan expa:preflight --production` blocks a deploy that selects a provider without its credentials.

## 1. ClamAV (upload antivirus) — T-043
- Code: `ClamdScanner` (clamd INSTREAM over TCP or unix socket), stacked after `BasicContentScanner` by `ScannerChain` when `DOCUMENTS_SCANNER=clamav`.
- Behaviour: infected file gives `attachment_rejected` (422); clamd unreachable, timeout or `ERROR` reply gives `scanner_unavailable` (503, localized), the file is not stored, and admins get an in-app alert (at most one per hour). `CLAMAV_FAIL_CLOSED=false` is refused by preflight in production.
- Owner: infrastructure/DevOps.
- Setup: run `clamd` (official `clamav/clamav` image or the distro package) on the private network, keep signatures updated with `freshclam`, set `StreamMaxLength` at least 10 MB (our upload cap), expose port 3310 only to the API, set `DOCUMENTS_SCANNER=clamav`, `CLAMAV_HOST`/`CLAMAV_PORT` (or `CLAMAV_SOCKET`).
- Verify: upload the EICAR test string saved as a PDF/PNG (it must be rejected with `attachment_rejected`); stop clamd and upload a clean PDF (must return 503 `scanner_unavailable` and notify admins); start clamd again and upload succeeds.

## 2. Firebase Cloud Messaging (push) — T-016b
- Code: `FcmPushSender` (HTTP v1, service-account JWT RS256 to OAuth token, token cached, one message per device, retries with backoff on 429/5xx/connection errors, one refresh on 401). `UNREGISTERED`/not-found and token-blaming `INVALID_ARGUMENT` delete the `DeviceToken`. Device tokens, the access token and the private key are never logged. Notification payloads carry a generic title and routing ids only.
- Owner: product owner creates the Firebase project; DevOps stores the credential; mobile team registers tokens (`POST /devices`) and configures APNs in Firebase for iOS.
- Setup: Firebase console, create project, enable Cloud Messaging API (v1), create a service account with the "Firebase Cloud Messaging API Admin" role, download the JSON, mount it outside the web root (or inject as `FCM_CREDENTIALS_JSON`), set `PUSH_DRIVER=fcm` and `FCM_CREDENTIALS_PATH`. Upload the APNs auth key in Firebase for iOS.
- Verify: register a real device token with push consent on, create a document expiring in 7 days and run `php artisan expa:send-reminders`; confirm delivery, then uninstall the app and trigger again: the token must disappear from `device_tokens`.

## 3. Payments (Stripe) — T-038
- Code: `StripePaymentProvider` (hosted Checkout in subscription mode, cancel at period end or immediately, `Stripe-Signature` verification `t=,v1=` HMAC-SHA256 with 300 s tolerance and secret rotation). State machines (`SubscriptionState`, `PaymentState`), dunning (`DunningService`, grace period, reminders, expiry), sequential invoice numbers (`InvoiceNumberer`), VAT architecture (`plans.vat_rate`, `price_includes_vat`, `tax_rates` table shipped EMPTY, invoice tax lines only when a rate is configured). Not enabled by default (`BILLING_PROVIDER=none`).
- Owner: business owner (Stripe account, legal entity, prices), accountant (VAT), DevOps (secrets).
- Setup: create the Stripe account, create products/prices (optional: set `STRIPE_PRICE_PLUS` and `STRIPE_PRICE_PRO`), add a webhook endpoint `https://<api>/api/v1/billing/webhook/stripe` for `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`, `charge.refunded`, copy the signing secret to `STRIPE_WEBHOOK_SECRET`, set `STRIPE_SECRET_KEY`, pin `STRIPE_API_VERSION`, set `BILLING_PROVIDER=stripe`, seed or activate plans with the approved prices.
- Remaining HUMAN steps: (1) accountant decides VAT treatment and the invoice country, then enter VERIFIED rows in `tax_rates` or set `plans.vat_rate`; (2) legal text for terms, refunds and withdrawal rights; (3) decide whether Stripe-issued receipts suffice or EXPA must issue legal invoices (Italian e-invoicing/SDI is NOT implemented, `invoices` are receipts until decided); (4) test mode end to end with the Stripe CLI (`stripe listen --forward-to`), then live mode; (5) confirm Stripe's current event payload shapes against the pinned API version (the mapper accepts both the classic and the newer `parent.subscription_details` invoice shapes, verified only with fixtures).
- Verify (test mode): checkout creates a session and redirects; paying with `4242 4242 4242 4242` activates the plan via webhook; `4000 0000 0000 0341` (attach, then fails on renewal) puts the subscription `past_due`, sends `payment_failed`, and after the grace period `expa:billing-expire` expires it; cancel from the app ends billing at period end; admin cancel ends it immediately at Stripe.

## 4. Anthropic (AI assistant) — T-019
- Code: `AnthropicClient` with timeout, bounded retries, input/output caps, optional global daily token budget, https-only base URL, exceptions carrying no prompt, answer, key or previous exception. Failure produces the localized degraded answer with a search alternative and refunds the user's quota. A test asserts that a provider outage logs no prompt, e-mail or name.
- Owner: product owner (account, spending limit), DevOps (secret).
- Setup: create an API key with a monthly spend limit, store it in the secret manager as `ANTHROPIC_API_KEY`, set `AI_DRIVER=anthropic`, choose `AI_MODEL`, set `AI_DAILY_TOKEN_BUDGET` from the monthly budget.
- Verify: ask a question with sourced content in ar, en, it (answers cite sources and carry the label); revoke the key temporarily and confirm the degraded answer; check logs contain no question text; review prompts and refusal behaviour with native speakers (T-034 content owners).

## 5. Mail (SMTP / transactional provider) — MVP-6
- Code: standard Laravel mailer; preflight fails in production for `MAIL_MAILER=log|array`. Verification, reset and reminder mails are queued, so a worker must run.
- Owner: DevOps and domain owner.
- Setup: choose a provider, create SMTP credentials, set `MAIL_MAILER=smtp`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_SCHEME`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_ADDRESS`; publish SPF, DKIM and DMARC records; set `APP_URL` and `FRONTEND_URL` to https origins.
- Verify: register a new account, receive the verification mail in a real inbox (check spam placement and rendering in RTL), complete verification; request a password reset.

## Not covered by any adapter yet
Live job feeds (T-036, legal), content review (T-034/T-035/T-041), counsel sign-off (BE-12), APNs specifics beyond FCM relay, SDI e-invoicing, WhatsApp/Telegram channels.
