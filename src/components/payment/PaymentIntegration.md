# Payment Integration Guide  
_Bible Character Chat — Stripe Subscription Flow_

> **Audience**: Full-stack developers & dev-ops engineers deploying FaithTalkAI / Bible Character Chat  
> **Goal**: Launch secure, scalable subscription payments in **production** and **test** environments with Stripe.

---

## 1. Prerequisites

| Requirement | Min Version | Notes |
|-------------|------------|-------|
| Node.js     | 18 LTS     | used for local scripts & webhooks |
| Supabase    | 2.x        | user auth & DB (or your own PG)   |
| Stripe CLI  | ≥ 1.19     | for testing webhooks locally      |

Create the following Stripe resources **before writing code**:

1. **Product** → “Bible Character Chat Premium”
2. **Prices**  
   • `price_monthly` – USD $9.99 (recurring / monthly)  
   • `price_annual`  – USD $99.00 (recurring / yearly)  
3. **Tax Settings** (if applicable) & Statement descriptor.

Record the **price IDs** and **product ID**.

---

## 2. Environment Variables

Add to your `.env` and CI secrets:

```
# Stripe
STRIPE_SECRET_KEY=sk_live_***
STRIPE_PUBLISHABLE_KEY=pk_live_***
STRIPE_WEBHOOK_SECRET=whsec_***
STRIPE_PRICE_MONTHLY=price_***
STRIPE_PRICE_ANNUAL=price_***
# App
SITE_URL=https://faithtalkai.com
```

Create a parallel `.env.local` using your **test** keys (start with `sk_test_`).

---

## 3. Database & Entitlement Model

```
Table: users
  id               uuid  PK
  email            text
  stripe_customer  text  (nullable)
  stripe_status    text  ['active','trialing','past_due','canceled', null]
  current_period_end timestamp
  entitlement      jsonb  -- { "maxCharacters": 999, "pro": true }

Table: stripe_events (optional audit log)
```

Update `entitlement` via webhook (see §5).  
Never trust client-side claims.

---

## 4. Front-End Flow

1. **Pricing Page** ➜ calls `/api/stripe/create-checkout` with:
   ```json
   { "priceId": STRIPE_PRICE_MONTHLY, "lookupKey":"monthly" }
   ```
2. Receive `{ url }` → `window.location = url`.
3. After payment, Stripe redirects to:
   ```
   https://faithtalkai.com/subscribe/success?session_id={CHECKOUT_SESSION_ID}
   ```
4. Client hits `/api/stripe/confirm?session_id=…` → backend validates and stores customer + subscription IDs.

Include a **Customer Portal** link (`stripe.billing_portal.sessions.create`) so users can change plans or cancel.

---

## 5. Back-End Endpoints

### 5.1 `/api/stripe/create-checkout`

```ts
import Stripe from 'stripe';
export const POST = async (req) => {
  const { priceId } = await req.json();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: req.user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.SITE_URL}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${process.env.SITE_URL}/subscribe/cancel`,
  });
  return json({ url: session.url });
};
```

### 5.2 `/api/stripe/webhook`

```ts
const buf = await rawBody(req);                 // do NOT use bodyParser
const sig = req.headers['stripe-signature'];
let event;
try {
  event = stripe.webhooks.constructEvent(
    buf, sig, process.env.STRIPE_WEBHOOK_SECRET
  );
} catch (err) {
  console.error('⚠️  Webhook signature verification failed.', err);
  return res.status(400).send(`Webhook Error: ${err.message}`);
}

switch (event.type) {
  case 'checkout.session.completed':
  case 'customer.subscription.updated':
  case 'customer.subscription.deleted':
    await syncSubscription(event.data.object);
    break;
}

res.json({ received: true });
```

### 5.3 `syncSubscription(obj)`

1. Find user by `customer_email` OR `customer` id.  
2. Update columns:
   ```sql
   stripe_customer     = obj.customer
   stripe_status       = obj.status
   current_period_end  = to_timestamp(obj.current_period_end)
   entitlement         = CASE WHEN obj.status = 'active'
                             THEN '{"pro":true,"maxCharacters":999}'
                             ELSE '{"pro":false,"maxCharacters":5}'
                        END
   ```
3. Log to `stripe_events`.

---

## 6. Testing

| Action | Tool | Command |
|--------|------|---------|
| Fire local checkout | Browser + `pk_test` | hit pricing page |
| Forward webhooks    | Stripe CLI | `stripe listen --forward-to localhost:3000/api/stripe/webhook` |
| Simulate payment    | Test card | `4242 4242 4242 4242`  any cvc, any future date |
| Simulate failures   | `4000 0000 0000 0341` | payment_declined |
| Test subscription cycle | Dashboard → “Update Subscription” |

Validate:

1. DB rows update correctly.  
2. User UI shows “Premium” badge.  
3. Customer portal can cancel and entitlement downgrades on `invoice.payment_failed` and `customer.subscription.deleted`.

---

## 7. Security Considerations

1. **PCI-DSS**: Stripe’s Checkout/Elements keeps you SAQ-A; never touch raw card data.  
2. **Webhook authenticity**: verify signature, use `rawBody`.  
3. **Idempotency**: store `event.id` in `stripe_events`; ignore duplicates.  
4. **Least privilege keys**: Use restricted `sk_live` that cannot create Products in prod.  
5. **SSR / XSS**: sanitize success & cancel pages; don’t echo query params unescaped.  
6. **Rate limiting**: throttle `/api/stripe/*` endpoints.  
7. **Secure storage**: environment variables only in secret stores (Vercel env, AWS SM, etc.).  
8. **Logging**: redact card or PII when logging `event` objects.

---

## 8. Best Practices

- Use **Stripe Checkout** for fastest PCI compliance; migrate to **Elements** for custom UI later.  
- Keep price IDs in env vars, not source code.  
- Schedule a cron (daily) to poll `subscription` objects as a failsafe against missed webhooks.  
- Display billing status in account settings (`stripe_status`, `current_period_end`).  
- Write Cypress tests that mock Stripe success & failure redirects.  
- Local currencies: create separate Prices; let user choose with “currency selector.”  
- Grace period: treat `past_due` as active but warn user; cut access on `canceled` or `unpaid`.  
- Use **Customer Portal** to reduce support tickets.

---

## 9. Going Live Checklist ✅

1. Stripe account “Activated” & bank account verified.  
2. Domain added to “Allowed URLs” (Checkout & Portal).  
3. Prod keys in env; test keys removed from server.  
4. Webhook endpoint changed from `https://*.ngrok-free.app` → real domain.  
5. Prices have correct tax & invoicing settings.  
6. Run full test sequence in live mode with $0.50 products.  
7. Update Privacy Policy & ToS with billing clauses.  
8. Notify support team & set up Stripe Alerts (failed payments).  

---

Payment processing is now ready—users can upgrade to **Premium** and unlock unlimited chats with every biblical character ✨
