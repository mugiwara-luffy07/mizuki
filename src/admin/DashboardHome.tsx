import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ClipboardList, Clock, Package, CheckCircle } from 'lucide-react';
import { useTenantStore } from '@/store/tenantStore';
import { supabase } from '@/supabase-client';

interface EcommerceOrder {
  id: string;
  order_number: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  total: number;
  subtotal: number;
  shipping_cost: number;
  status: 'pending' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'verified' | 'rejected';
  items: Array<{
    product_id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  created_at: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'packed':
      return 'bg-blue-100 text-blue-700';
    case 'shipped':
      return 'bg-purple-100 text-purple-700';
    case 'delivered':
      return 'bg-green-100 text-green-700';
    case 'cancelled':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function DashboardHome() {
  const { tenant } = useParams<{ tenant: string }>();
  const { config } = useTenantStore();
  const [orders, setOrders] = useState<EcommerceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load real data on mount and subscribe to real-time updates
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        console.log('[Dashboard] Loading e-commerce orders');
        const { data, error } = await supabase
          .from('ecommerce_orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[Dashboard] Supabase error:', error);
          setOrders([]);
          return;
        }

        console.log('[Dashboard] Loaded orders:', data?.length || 0);
        setOrders(data || []);
      } catch (error) {
        console.error('[Dashboard] Failed to load orders:', error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('ecommerce_orders_dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ecommerce_orders',
        },
        async (payload) => {
          console.log('[Dashboard] Real-time update received:', payload.eventType);
          // Refetch orders when any change occurs
          try {
            const { data, error } = await supabase
              .from('ecommerce_orders')
              .select('*')
              .order('created_at', { ascending: false });

            if (!error && data) {
              setOrders(data);
            }
          } catch (error) {
            console.error('[Dashboard] Failed to sync real-time update:', error);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  if (!config) return null;

  // Compute metrics from real data
  const totalOrders = orders.length;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const ordersThisWeek = orders.filter(
    (order) => new Date(order.created_at) >= sevenDaysAgo
  ).length;

  // Pending orders (payment verification needed)
  const pendingOrders = orders.filter(
    (order) => order.status === 'pending' || order.payment_status === 'pending'
  ).length;

  // In Production (packed, shipped)
  const inProduction = orders.filter(
    (order) => order.status === 'packed' || order.status === 'shipped'
  ).length;

  // Completed (delivered)
  const completed = orders.filter(
    (order) => order.status === 'delivered'
  ).length;

  const stats = [
    {
      label: 'Total Orders',
      value: totalOrders.toString(),
      change: `+${ordersThisWeek} this week`,
      icon: ClipboardList,
      trend: 'up',
    },
    {
      label: 'Pending',
      value: pendingOrders.toString(),
      change: 'Needs attention',
      icon: Clock,
      trend: 'neutral',
    },
    {
      label: 'In Production',
      value: inProduction.toString(),
      change: 'Packed & Shipped',
      icon: Package,
      trend: 'up',
    },
    {
      label: 'Completed',
      value: completed.toString(),
      change: 'Total delivered',
      icon: CheckCircle,
      trend: 'up',
    },
  ];

  // Get recent 5 orders
  const recentOrders = orders.slice(0, 5).map((order) => ({
    id: order.order_number,
    customer: order.customer_name,
    product: order.items?.[0]?.name || 'Product',
    status: order.status,
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with {config.brandName}.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="stat-card animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-tenant-primary/10">
                <stat.icon className="w-5 h-5 text-tenant-primary" />
              </div>
            </div>
            <p className="text-2xl font-semibold mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xs text-muted-foreground mt-2">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="admin-card">
        <h2 className="font-semibold mb-4">Recent Orders</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 animate-pulse">
                <div className="h-4 bg-muted rounded w-24" />
              </div>
            ))}
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div>
                  <p className="font-medium text-sm">{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.customer}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm">{order.product}</p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full capitalize ${getStatusColor(order.status)}`}
                >
                  {formatStatus(order.status)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No orders yet</p>
        )}
      </div>
    </div>
  );
}
