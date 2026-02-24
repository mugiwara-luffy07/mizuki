import { supabase } from '@/supabase-client';
import { CustomOrder, OrderData } from '@/store/orderStore';

export interface CreateOrderPayload {
  tenant: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  orderData: OrderData;
  userId?: string; // Optional user ID for authenticated users
}

export interface UpdateOrderPayload {
  status?: CustomOrder['status'];
  price?: number | null;
}

/**
 * Create a new order in Supabase
 */
export async function createOrder(payload: CreateOrderPayload): Promise<CustomOrder> {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      tenant: payload.tenant,
      customer: payload.customer,
      order_data: payload.orderData,
      status: 'pricing_pending',
      price: null,
      user_id: payload.userId || null, // Link order to authenticated user if available
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error);
    throw new Error(`Failed to create order: ${error.message}`);
  }

  return {
    id: data.id,
    tenant: data.tenant,
    customer: data.customer,
    orderData: data.order_data,
    price: data.price,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Get all orders for a specific tenant
 */
export async function getOrdersByTenant(tenant: string): Promise<CustomOrder[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('tenant', tenant)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }

  return data.map((order) => ({
    id: order.id,
    tenant: order.tenant,
    customer: order.customer,
    orderData: order.order_data,
    price: order.price,
    status: order.status,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  }));
}

/**
 * Get a single order by ID
 */
export async function getOrderById(orderId: string): Promise<CustomOrder | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error fetching order:', error);
    throw new Error(`Failed to fetch order: ${error.message}`);
  }

  return {
    id: data.id,
    tenant: data.tenant,
    customer: data.customer,
    orderData: data.order_data,
    price: data.price,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Update an order
 */
export async function updateOrder(
  orderId: string,
  updates: UpdateOrderPayload
): Promise<CustomOrder> {
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.status !== undefined) {
    updateData.status = updates.status;
  }

  if (updates.price !== undefined) {
    updateData.price = updates.price;
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating order:', error);
    throw new Error(`Failed to update order: ${error.message}`);
  }

  return {
    id: data.id,
    tenant: data.tenant,
    customer: data.customer,
    orderData: data.order_data,
    price: data.price,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Delete an order
 */
export async function deleteOrder(orderId: string): Promise<void> {
  const { error } = await supabase.from('orders').delete().eq('id', orderId);

  if (error) {
    console.error('Error deleting order:', error);
    throw new Error(`Failed to delete order: ${error.message}`);
  }
}

/**
 * Get orders by status for a tenant
 */
export async function getOrdersByStatus(
  tenant: string,
  status: CustomOrder['status']
): Promise<CustomOrder[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('tenant', tenant)
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders by status:', error);
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }

  return data.map((order) => ({
    id: order.id,
    tenant: order.tenant,
    customer: order.customer,
    orderData: order.order_data,
    price: order.price,
    status: order.status,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  }));
}





