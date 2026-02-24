# Payment + Order Flow Implementation Guide

## Setup Instructions

### 1. Create Orders Table in Supabase

Run the SQL migration file `create-orders-table.sql` in your Supabase SQL editor:

```bash
# In Supabase Dashboard → SQL Editor
# Copy and paste the contents of create-orders-table.sql
```

### 2. Create Payment Proofs Storage Bucket

1. Go to Supabase → Storage
2. Create a new bucket named `payment-proofs`
3. Set it as **PRIVATE**
4. Add RLS Policy (optional):
   - Allow users to upload their own payment proofs
   - Allow admins to view all proofs

### 3. Install QR Code Package

```bash
npm install qrcode
npm install --save-dev @types/qrcode
```

### 4. Update Cart Page Button

The Cart page already has the checkout button configured. It will:
- Check if user is logged in
- Navigate to `/:tenant/checkout` on successful login
- Navigate directly to checkout if already logged in

## Workflow Overview

### Customer Journey

1. **Shop Page** → Add items to cart
2. **Cart Page** → Review items, click "Proceed to Checkout"
3. **Checkout Page** (`/:tenant/checkout`)
   - Display order summary
   - Show UPI QR code
   - Show UPI ID (clickable to copy)
   - Show payment amount
   - User uploads payment screenshot
   - Click "Place Order" button

4. **Order Confirmation** → Order stored in database, user redirected to success page
5. **Order Success Page** (`/:tenant/order-success`)
   - Display order ID
   - Display order total
   - Show "Payment Verification Pending" status
   - Next steps information

### Database

**Orders Table Schema:**
```sql
- id (UUID) - Primary key
- user_id (UUID) - User who placed order
- tenant (TEXT) - Store identifier
- items (JSONB) - Cart items array
- total_amount (DECIMAL) - Total order value
- payment_proof_url (TEXT) - supabase://payment-proofs/<uuid>
- payment_method (TEXT) - 'UPI_QR'
- payment_status (TEXT) - 'pending_verification'
- order_status (TEXT) - 'placed'
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Payment Details

- **UPI ID**: `mizuki@upi` (configured in Checkout.tsx)
- **Payment Method**: Google Pay / UPI
- **QR Code**: Generated dynamically from UPI string
- **Proof Upload**: Screenshot uploaded to `payment-proofs` bucket

## Files Created/Modified

### New Files
- `src/pages/Checkout.tsx` - Checkout page with QR code and payment proof upload
- `create-orders-table.sql` - Database schema migration

### Modified Files
- `src/App.tsx` - Added checkout route
- `src/pages/OrderSuccess.tsx` - Updated with new order success flow
- `src/pages/Cart.tsx` - Already has checkout navigation (no changes needed)

## Configuration

### UPI Details (in Checkout.tsx, line 11-12)
```typescript
const UPI_ID = 'mizuki@upi';
const UPI_NAME = 'Mizuki Store';
```

### Shipping Calculation (in Checkout.tsx, line 26-28)
```typescript
const shipping = subtotal > 5000 ? 0 : 200; // Free shipping over ₹5000
```

## Testing

1. Login as a customer
2. Add products to cart
3. Click "Proceed to Checkout"
4. Verify:
   - Order summary displays correctly
   - QR code generates and displays
   - UPI ID is copyable
   - File upload works
   - Order is saved to database
   - Redirect to success page works

## Error Handling

- File validation: Only image files, max 5MB
- Upload errors: Toast notifications
- Order placement errors: Toast notifications
- Authentication: Redirects to login if not authenticated

## Next Steps (Admin)

1. Create admin dashboard to view pending orders
2. Verify payment screenshots
3. Update order status to 'verified' or 'rejected'
4. Send confirmation email to customer
5. Trigger order fulfillment
