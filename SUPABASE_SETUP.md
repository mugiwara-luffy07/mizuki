# Supabase CRUD Operations Setup Guide

This guide will help you set up CRUD operations for orders using Supabase.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Your Supabase project URL and anon key

## Step 1: Set Up Environment Variables

1. Create a `.env` file in the root of your project (if it doesn't exist)
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Note:** The code currently has fallback values, but it's recommended to use environment variables for security.

## Step 2: Create the Database Table

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase-migration.sql` from this project
4. Copy and paste the entire SQL script into the SQL Editor
5. Click **Run** to execute the migration

This will create:
- `orders` table with all necessary columns
- Indexes for better query performance
- Row Level Security (RLS) policies
- Automatic timestamp updates

## Step 3: Verify the Table

1. Go to **Table Editor** in your Supabase Dashboard
2. You should see the `orders` table
3. Check that all columns are present:
   - `id` (UUID)
   - `tenant` (TEXT)
   - `customer` (JSONB)
   - `order_data` (JSONB)
   - `price` (DECIMAL)
   - `status` (TEXT)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

## Step 4: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to your website and click "Start Custom Order"
3. Fill out the order form
4. Submit the order
5. Check your Supabase Dashboard > Table Editor > orders table to see the new order

## Available CRUD Operations

The following functions are available in `src/lib/supabase/orders.ts`:

### Create Order
```typescript
import { createOrder } from '@/lib/supabase/orders';

const order = await createOrder({
  tenant: 'mizuki',
  customer: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    address: '123 Main St'
  },
  orderData: {
    fabric: { type: 'silk', color: 'red' },
    garment: 'saree',
    design: { neckDesign: 'v-neck', embroidery: 'none', painting: 'none' },
    measurements: { chest: 40, waist: 32 },
    unit: 'inches'
  }
});
```

### Get Orders by Tenant
```typescript
import { getOrdersByTenant } from '@/lib/supabase/orders';

const orders = await getOrdersByTenant('mizuki');
```

### Get Order by ID
```typescript
import { getOrderById } from '@/lib/supabase/orders';

const order = await getOrderById('order-id-here');
```

### Update Order
```typescript
import { updateOrder } from '@/lib/supabase/orders';

// Update status
await updateOrder('order-id', { status: 'processing' });

// Update price
await updateOrder('order-id', { price: 1500.00 });

// Update both
await updateOrder('order-id', { status: 'price_sent', price: 1500.00 });
```

### Delete Order
```typescript
import { deleteOrder } from '@/lib/supabase/orders';

await deleteOrder('order-id-here');
```

### Get Orders by Status
```typescript
import { getOrdersByStatus } from '@/lib/supabase/orders';

const pendingOrders = await getOrdersByStatus('mizuki', 'pricing_pending');
```

## Order Status Flow

The order status follows this flow:
1. `pricing_pending` - Order created, waiting for price quote
2. `price_sent` - Price quote sent to customer
3. `processing` - Order is being processed
4. `packed` - Order is packed and ready
5. `dispatched` - Order has been shipped
6. `delivered` - Order has been delivered

## Security Notes

- Row Level Security (RLS) is enabled on the orders table
- Public users can create and read orders
- Only authenticated users can update or delete orders
- You can customize these policies in Supabase Dashboard > Authentication > Policies

## Troubleshooting

### Error: "relation 'orders' does not exist"
- Make sure you've run the SQL migration script in Step 2

### Error: "new row violates row-level security policy"
- Check your RLS policies in Supabase Dashboard
- Ensure the policies allow the operations you're trying to perform

### Error: "Failed to create order"
- Check your Supabase URL and anon key in `.env` file
- Verify your Supabase project is active
- Check the browser console for detailed error messages

## Next Steps

1. Update `AdminOrders.tsx` to use Supabase functions instead of API calls
2. Update `OrderTracking.tsx` to fetch orders from Supabase
3. Consider adding user authentication for better security
4. Add real-time subscriptions for order status updates

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check Supabase Dashboard > Logs for database errors
3. Verify your environment variables are set correctly
4. Ensure your Supabase project is active and not paused





