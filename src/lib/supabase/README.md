# Supabase Orders CRUD Operations

This directory contains Supabase service functions for managing orders.

## Quick Reference

### Import the functions
```typescript
import { 
  createOrder, 
  getOrdersByTenant, 
  getOrderById, 
  updateOrder, 
  deleteOrder,
  getOrdersByStatus 
} from '@/lib/supabase/orders';
```

### Example Usage in Components

#### Creating an Order
```typescript
try {
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
      measurements: { chest: 40 },
      unit: 'inches'
    }
  });
  console.log('Order created:', order.id);
} catch (error) {
  console.error('Failed to create order:', error);
}
```

#### Fetching Orders
```typescript
// Get all orders for a tenant
const orders = await getOrdersByTenant('mizuki');

// Get a specific order
const order = await getOrderById('order-uuid-here');

// Get orders by status
const pendingOrders = await getOrdersByStatus('mizuki', 'pricing_pending');
```

#### Updating an Order
```typescript
// Update order status
await updateOrder('order-id', { status: 'processing' });

// Update price
await updateOrder('order-id', { price: 1500.00 });

// Update both
await updateOrder('order-id', { 
  status: 'price_sent', 
  price: 1500.00 
});
```

#### Deleting an Order
```typescript
await deleteOrder('order-id-here');
```

## Integration with React Query

For better data management, consider using React Query:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrdersByTenant, createOrder } from '@/lib/supabase/orders';

// Fetch orders
const { data: orders, isLoading } = useQuery({
  queryKey: ['orders', tenant],
  queryFn: () => getOrdersByTenant(tenant)
});

// Create order mutation
const queryClient = useQueryClient();
const createOrderMutation = useMutation({
  mutationFn: createOrder,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['orders', tenant] });
  }
});
```

## Error Handling

All functions throw errors that can be caught:

```typescript
try {
  const order = await createOrder(payload);
} catch (error: any) {
  console.error('Error:', error.message);
  toast.error(error.message || 'Failed to create order');
}
```





