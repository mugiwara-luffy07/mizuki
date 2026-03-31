# Mizuki E-commerce Platform

Mizuki is a multi-tenant fashion e-commerce application with support for:

- Product catalog and cart
- User authentication and orders
- Ready-made and custom-order flows
- Admin and super-admin panels
- Cashfree payment integration via Supabase Edge Functions

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Supabase (Auth, Database, Edge Functions)
- Cashfree Payment Gateway
- Zustand + React Query

## Project Structure

- `src/`: Frontend application code
- `src/pages/`: Public pages and policy pages
- `src/admin/`: Tenant admin dashboard and management screens
- `src/superadmin/`: Super-admin tenant management
- `src/store/`: Zustand state stores
- `supabase/functions/`: Edge Functions (`create-payment-order`, `verify-payment`)
- `public/config/`: Tenant branding and config files
- `*.sql`: Schema and migration scripts

## Prerequisites

- Node.js 18+
- npm 9+
- Supabase project (with database + edge functions)

## Local Development

1. Clone and install dependencies:

```bash
git clone <your-repository-url>
cd mizuki
npm install
```

2. Create `.env` in project root:

```env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_CASHFREE_ENV=sandbox
```

3. Start development server:

```bash
npm run dev
```

## Available Scripts

- `npm run dev`: Start local Vite server
- `npm run build`: Build production bundle
- `npm run build:dev`: Build in development mode
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## Supabase Setup

1. Run required SQL schema/migration files in Supabase SQL editor.
2. Deploy edge functions from `supabase/functions`.
3. Configure edge function secrets:

```env
CASHFREE_APP_ID=<cashfree-app-id>
CASHFREE_SECRET_KEY=<cashfree-secret-key>
CASHFREE_ENV=sandbox
FRONTEND_BASE_URL=http://localhost:5173
```

For production, set:

- `CASHFREE_ENV=production`
- `FRONTEND_BASE_URL=https://your-domain.com`
- `VITE_CASHFREE_ENV=production`

## Multi-tenant Notes

- Default tenant is configured in `src/config/defaultTenant.ts`.
- Main tenant routes follow pattern `/:tenant/...`.
- Tenant-specific branding/config is loaded from `public/config/`.

## Payment Flow (Cashfree)

1. Frontend creates payment order via edge function.
2. Customer completes payment on Cashfree.
3. Cashfree redirects to `/:tenant/payment-success`.
4. Frontend verifies payment through `verify-payment` edge function.
5. Order is finalized in database after successful verification.

## Deployment

1. Build frontend:

```bash
npm run build
```

2. Deploy `dist/` to your hosting provider.
3. Ensure environment variables and Supabase edge function secrets are set for production.

## Legal & Policy Pages

Policy pages are available under tenant routes:

- `/:tenant/privacy-policy`
- `/:tenant/terms-conditions`
- `/:tenant/refund-policy`
- `/:tenant/delivery-policy`
- `/:tenant/disclaimer-policy`

## Contact

Mizuki (A Unit of Aadharsh International)

- Email: mizukibeautifulmoon123@gmail.com
- Phone: +91 9942322743
