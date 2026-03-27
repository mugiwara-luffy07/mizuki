# Cashfree + Supabase Edge Functions Setup

This guide matches the code added in this project.

## 1) Edge Function File Structure

```text
supabase/
  functions/
    _shared/
      cors.ts
    create-payment-order/
      index.ts
    verify-payment/
      index.ts
```

## 2) Required Supabase Edge Function Secrets

Set these in Supabase Dashboard -> Edge Functions -> Secrets:

- `CASHFREE_APP_ID` = your Cashfree app id
- `CASHFREE_SECRET_KEY` = your Cashfree secret key
- `CASHFREE_ENV` = `sandbox` or `production`
- `FRONTEND_BASE_URL` = your frontend base URL (example: `http://localhost:8080`)

## 3) Frontend Environment Variable

In local `.env` file (frontend), add only this non-secret value:

```env
VITE_CASHFREE_ENV=sandbox
```

Use `production` in live environment.

## 4) Deploy Edge Functions

From project root:

```bash
supabase functions deploy create-payment-order
supabase functions deploy verify-payment
```

## 5) How the New Payment Flow Works

1. Customer fills shipping form in `ProductCheckout.tsx`.
2. Clicking **Pay Now** calls `create-payment-order` Edge Function.
3. Edge Function creates Cashfree order and returns:
   - `order_id`
   - `payment_session_id`
4. Frontend opens hosted checkout using `cashfree.checkout(...)`.
5. Cashfree redirects to `/:tenant/payment-success?order_id=...`.
6. `PaymentSuccess.tsx` calls `verify-payment` Edge Function.
7. If paid, app inserts row into `ecommerce_orders` with:
   - `payment_status = "paid"`
   - `payment_method = "CASHFREE"`

## 6) Important Note

For production-grade security, final order creation should happen on a trusted backend webhook after payment success. This implementation keeps logic beginner-friendly and uses Edge Functions for API secrets.
