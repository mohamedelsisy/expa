# Stripe setup runbook (owner)

Status: the integration (hosted Checkout, webhooks, cancel, plan admin) is code complete and tested with `Http::fake` ONLY. It has never talked to the real Stripe API: no keys existed when it was written. Section 8 lists exactly what is verified and what is not. Do steps 1-6 in TEST MODE first.

Never paste keys into chat, tickets or git. Keys live in `backend/.env` (local, untracked) or the production secret manager.

## 1. Account and test mode
1. Create an account at https://dashboard.stripe.com/register (business details can wait for go-live).
2. Use a sandbox / test mode (toggle in the Dashboard). Test keys start with `sk_test_`; live keys with `sk_live_`. The app REFUSES a live key unless `APP_ENV=production`.

## 2. API key
Dashboard > Developers > API keys > secret key `sk_test_...` (a restricted `rk_test_...` key also works if it may create Checkout Sessions, read/write Subscriptions, read Balance and read Invoices).

## 3. Environment variables (backend/.env, local)
```
BILLING_PROVIDER=stripe
STRIPE_SECRET_KEY=sk_test_...        # from step 2
STRIPE_WEBHOOK_SECRET=whsec_...      # from step 4 (comma separated while rotating)
# optional: pin the API version to the one your webhook endpoint uses (see 4)
# STRIPE_API_VERSION=
# optional: use pre-created Stripe prices instead of the plan's own price. If set, admin price edits do NOT change what Stripe charges.
# STRIPE_PRICE_PLUS=price_...   STRIPE_PRICE_PRO=price_...
# paid plans are seeded INACTIVE in staging/production; activate with the admin endpoint (step 6) or BILLING_SEED_PLANS_ACTIVE=true before seeding
```
Then `php artisan config:clear`.

## 4. Webhooks
Local development (Stripe CLI, https://docs.stripe.com/stripe-cli):
```
stripe login
stripe listen --forward-to http://127.0.0.1:8000/api/v1/billing/webhook/stripe
```
`stripe listen` prints a `whsec_...`: that is `STRIPE_WEBHOOK_SECRET` for local use.

Staging/production (Dashboard > Developers > Webhooks > Add endpoint):
- URL: `https://<api-host>/api/v1/billing/webhook/stripe`
- Events to enable (exactly these; others are ignored with 200):
  `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`, `charge.refunded`
  (`invoice.payment_succeeded` is also accepted as an alias of `invoice.paid`.)
- Copy the endpoint's signing secret into `STRIPE_WEBHOOK_SECRET`. Set the endpoint's API version equal to `STRIPE_API_VERSION` (events use the endpoint's version; the adapter reads both the pre- and post-2025-03-31 "basil" shapes).
- Secret rotation: roll the secret in the Dashboard, set `STRIPE_WEBHOOK_SECRET=new,old`, deploy, remove `old` after 24 h.

## 5. Check it
```
php artisan expa:billing:check
```
Read-only: prints provider, key mode (test/live, never the key), webhook secret present, per active paid plan whether a Checkout can be built, and performs ONE `GET /v1/balance`. Exit code 0 only if everything is fine; otherwise it prints what to fix. It creates no Checkout session.
`php artisan expa:preflight --production` includes the billing rules (live key required in production only when paid plans are active).

## 6. Activate and price the plans
Staging/production seed `plus` and `pro` inactive. As an admin (permission `plans.manage`):
```
PATCH /api/v1/admin/billing/plans/plus   {"active": true, "price_minor": 599}
```
Prices are in euro cents. A price change affects NEW checkouts only; running subscriptions keep their price. `GET /api/v1/billing/plans` is cached for up to 5 minutes. Plans may be activated while no provider is configured; the public listing then reports `meta.billing_available=false` and checkout answers 503.

## 7. End-to-end test in test mode
1. Log in on the web as a normal user, open Settings > Billing, choose Plus.
2. On the Stripe page use test cards (https://docs.stripe.com/testing): `4242 4242 4242 4242` succeeds; `4000 0000 0000 9995` declines (insufficient funds); `4000 0025 0000 3155` requires 3-D Secure. Any future expiry, any CVC.
3. You return to `/{locale}/settings/billing?checkout=success&session_id=cs_test_...`. The page must only SHOW "processing"; the plan changes when the webhook arrives (`GET /billing/subscription` -> `status: active`). If the `stripe listen` terminal shows `[200]` for `checkout.session.completed` and `invoice.paid`, the loop works.
4. Cancel in the app (cancel at period end); then in the Dashboard cancel immediately and watch `customer.subscription.deleted` arrive.
5. Useful triggers: `stripe trigger invoice.payment_failed`, `stripe trigger customer.subscription.updated` (triggered fixtures have no `metadata.user_id`, so EXPA ignores them: expected).

## 8. What is verified and what is not
Verified (automated, Http::fake): request bodies (subscription mode, price_data/price id, client_reference_id, metadata, success/cancel URLs, locale, idempotency key), signature scheme + tolerance + rotation, idempotent and out-of-order-safe event handling, subscription.updated sync (fetches current state), refunds on both API shapes, key-mode guards, `expa:billing:check`, admin plans.
NOT verified until real test keys exist: that Stripe accepts the exact request bodies, real event payloads for your account's API version, the Dashboard webhook configuration, 3-D Secure, real Smart Retries timing, and the customer portal (not integrated: cancellation is in-app). Run section 7 once with test keys and record the result in `docs/QA.md`.

## 9. Go-live checklist (do not skip)
- [ ] Section 7 passed in test mode on staging.
- [ ] Business verification complete in Stripe; payout bank account added.
- [ ] Accountant decision on VAT/invoicing (rates in `plans.vat_rate` or verified `tax_rates`; EXPA invoice numbering vs Stripe invoices; SDI e-invoicing). No rate is hard-coded.
- [ ] Counsel-approved terms, refund and withdrawal policy published (EU consumer 14-day right; digital content rules).
- [ ] Refund/dispute process owned by a named person: refunds are issued in the Dashboard; `charge.refunded` marks the payment refunded in EXPA. Disputes (`charge.dispute.created`) are NOT handled automatically: watch the Dashboard email.
- [ ] Live secret key and live webhook secret exist ONLY in the production secret manager (never `.env` files in git, never staging). Restrict the key with a Stripe access policy to the production server IPs.
- [ ] Production webhook endpoint created (section 4) with the live signing secret; API version pinned.
- [ ] `APP_ENV=production`, `BILLING_PROVIDER=stripe`; `php artisan expa:billing:check` and `expa:preflight --production` both pass on the production host.
- [ ] Activate paid plans only after the above (`PATCH /admin/billing/plans/{key}`).
- [ ] First real purchase made by the owner with a real card, then refunded.
- PCI: card data is entered on Stripe's hosted Checkout page only and never touches EXPA servers: SAQ A scope (confirm with your acquirer/accountant).
