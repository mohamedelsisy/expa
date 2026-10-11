# Spec: Stripe billing hardening (branch feat/stripe-billing)

Status: implemented in code, verified only with `Http::fake` (no Stripe credentials exist). Live Stripe is UNTESTED.

## Objectives
1. The Stripe adapter matches the official Stripe docs (sources below); every mismatch is listed and fixed or justified.
2. `customer.subscription.updated` is handled (status, cancel_at_period_end, period end, plan change), idempotent and out-of-order safe.
3. Misconfiguration cannot silently reach money: live keys refused outside production, `expa:billing:check`, stricter preflight.
4. The owner can activate / re-price plans without SQL: `/admin/billing/plans` (audited, permissioned).
5. Public contract for the web is explicit (`GET /billing/plans`, checkout response, return URLs).

## Assumptions (surfaced, not confirmed by the owner)
- A1 Hosted Checkout only (PCI SAQ A); no card data touches EXPA.
- A2 Entitlements come ONLY from verified webhooks; the success redirect is informational (Stripe docs say the redirect is not reliable for fulfilment).
- A3 Price changes affect NEW checkouts only; existing Stripe subscriptions keep the price they were created with (inline `price_data` creates a new price per session). Optional `STRIPE_PRICE_PLUS/PRO` price ids override `price_data`; if set, the admin price edit does NOT change what Stripe charges (documented; shown as a warning in the admin response).
- A4 Paid plans may be activated while `BILLING_PROVIDER=none`; `GET /billing/plans` then reports `meta.billing_available=false` and checkout returns 503.
- A5 The free plan stays at price 0 and active. Max price cap: 100000 minor units (EUR 1000) per interval: a typo guard, not a product rule.
- A6 Return URL: `{FRONTEND_URL}/{locale}/settings/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}` / `?checkout=cancelled` (the web billing page is `/settings/billing`; the old `/billing/success` page does not exist in web).
- A7 Stripe keys follow `sk_test_…`/`sk_live_…` (also restricted `rk_…`). Anything else is "malformed".

## Boundaries
Always: tests first; amounts from DB; plan key validated against DB; Stripe error bodies never shown/logged; audit every admin plan change.
Ask first: a real VAT rate, real Stripe keys, enabling paid plans in production, changing the webhook event set.
Never: commit/inject keys; trust the redirect for entitlements; accept client-supplied URLs or amounts; use a live key outside production.

## Success criteria
- All new behaviour has a failing-then-passing test; full `php artisan test` and `vendor/bin/phpunit` green, 0 warnings.
- `expa:billing:check` exits 0 only when provider, key, webhook secret and one read-only Stripe call are OK.
- Preflight: ERROR in production for paid-active + (provider!=stripe | non-live key | no webhook secret), WARN otherwise; `sk_live_` outside production is refused at runtime and flagged.

## Tasks (dependency order)
T1 source check + fixes -> T2 subscription.updated -> T3 guards/check command/preflight -> T4 admin plans -> T5 public contract -> T6 docs + security review.

## Sources read (official)
- https://docs.stripe.com/api/checkout/sessions/create (subscription mode, success_url, cancel_url, client_reference_id <= 200 chars, metadata, customer_email, line_items price_data)
- https://docs.stripe.com/payments/checkout/custom-success-page?payment-ui=stripe-hosted (`{CHECKOUT_SESSION_ID}` literal template var in success_url; "webhooks are required for fulfilment")
- https://docs.stripe.com/webhooks (Stripe-Signature `t=`, `v1=` (ignore other schemes), HMAC-SHA256 over `t.payload`, constant-time compare, 5 min default tolerance, never 0, multiple v1 during secret rolling (24h), do not rely on event order, track event ids)
- https://docs.stripe.com/billing/subscriptions/webhooks (events, statuses; revoke on canceled/unpaid; past_due -> notify; invoice.paid -> confirm subscription active; charge.refunded on basil+ has no `invoice`, resolve via payment_intent -> List invoice payments)
- https://docs.stripe.com/api/idempotent_requests (key <= 255 chars; same key + different params = error; v1 keys pruned after >= 24h; POST only)
- https://docs.stripe.com/api/versioning (Stripe-Version header; webhook payload version = endpoint's version, so pin both)

## Mismatch table (adapter vs docs)
See "Findings" section appended at the end of this file.

## Findings (adapter vs docs) and outcome
| # | Doc (URL) | Finding | Outcome |
|---|---|---|---|
| 1 | checkout/custom-success-page | `success_url` had no `{CHECKOUT_SESSION_ID}`; pointed at `/billing/success` which the web does not have | Fixed: `.../settings/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`, cancel `?checkout=cancelled` |
| 2 | api/idempotent_requests | Same key + different params is an error; our key ignored the price, so a price edit within 5 min broke checkout | Fixed: key hashes price, currency, interval, price id |
| 3 | billing/subscriptions/webhooks | `charge.refunded` on API >= 2025-03-31.basil has no `invoice`; refunds were silently ignored | Fixed: invoice resolved via `GET /v1/invoice_payments` by payment_intent; failure -> 5xx retry |
| 4 | billing/subscriptions/webhooks | `customer.subscription.updated` (status changes, cancel scheduling, plan change) not handled | Fixed (T2) |
| 5 | api/checkout/sessions/create | `locale` has no Arabic; unspecified -> browser locale | Added: `locale` only for en/it |
| 6 | webhooks | Signature scheme, v1 only, 5 min tolerance (not 0), multiple v1 during roll, no reliance on event order, dedupe by event id | Already conformant |
| 7 | api/versioning | Webhook payload version = endpoint version; pin both | Documented in STRIPE_SETUP.md; adapter reads pre/post-basil shapes (invoice parent.subscription_details, item-level periods) |
| 8 | billing/subscriptions/webhooks | After `invoice.paid` confirm subscription is `active` before extending access | Partly: `invoice.paid` still sets active; `subscription.updated` (authoritative fetch) corrects it afterwards. Terminal states never revived by it |
| 9 | keys | `sk_`/`rk_` + test/live prefixes | Used for the guards (T3) |
| 10 | api/balance/balance_retrieve | GET /v1/balance is read-only and returns `livemode` | Used by `expa:billing:check` |
| 11 | webhooks / billing | `charge.dispute.created`, customer portal, partial refunds | Out of scope, documented |
