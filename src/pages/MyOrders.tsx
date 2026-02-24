import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Package, ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/supabase-client';
import { useAuthStore } from '@/store/authStore';
import { getImageUrl } from '@/lib/imageUtils';

interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  total: number;
  payment_status: string;
  status: string;
  items: OrderItem[];
}

export default function MyOrders() {
  const { tenant } = useParams<{ tenant: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [productImages, setProductImages] = useState<Map<string, string>>(new Map());
  const [productSlugs, setProductSlugs] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('ecommerce_orders')
          .select('id, order_number, created_at, total, payment_status, status, items')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setOrders(data || []);

        // Fetch product images and slugs for all unique product IDs
        if (data && data.length > 0) {
          const productIds = new Set<string>();
          data.forEach((order) => {
            if (order.items && Array.isArray(order.items)) {
              order.items.forEach((item: OrderItem) => {
                productIds.add(item.product_id);
              });
            }
          });

          if (productIds.size > 0) {
            const { data: products, error: prodError } = await supabase
              .from('products')
              .select('id, main_image_url, slug')
              .in('id', Array.from(productIds));

            if (!prodError && products) {
              const imgMap = new Map<string, string>();
              const slugMap = new Map<string, string>();
              for (const product of products) {
                if (product.main_image_url) {
                  const resolved = await getImageUrl(product.main_image_url);
                  imgMap.set(product.id, resolved || '');
                }
                if (product.slug) {
                  slugMap.set(product.id, product.slug);
                }
              }
              setProductImages(imgMap);
              setProductSlugs(slugMap);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'processing':
        return 'text-blue-600 bg-blue-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'rejected':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="mb-4">Please log in to view your orders</p>
        <Button onClick={() => navigate('/login')}>Go to Login</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Orders Yet</h2>
          <p className="text-muted-foreground mb-6">
            You haven't placed any product orders yet.
          </p>
          <Button onClick={() => navigate('/shop')}>
            Continue Shopping
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-semibold mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const firstProduct = order.items && order.items.length > 0 ? order.items[0] : null;
          const firstProductImage = firstProduct ? productImages.get(firstProduct.product_id) : null;
          const firstProductSlug = firstProduct ? productSlugs.get(firstProduct.product_id) : null;
          const moreCount = order.items && order.items.length > 1 ? order.items.length - 1 : 0;

          const handleProductClick = () => {
            if (firstProductSlug) {
              navigate(`/${tenant}/product/${firstProductSlug}`);
            }
          };

          return (
            <div
              key={order.id}
              className="border border-border rounded-lg p-4 md:p-6 bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:items-center">
                {/* Product Image */}
                <div className="flex items-center gap-3 min-w-fit">
                  {firstProductImage ? (
                    <div 
                      className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted border border-border cursor-pointer hover:opacity-75 transition-opacity"
                      onClick={handleProductClick}
                    >
                      <img
                        src={firstProductImage}
                        alt={firstProduct?.name}
                        className="w-full h-full object-cover"
                      />
                      {moreCount > 0 && (
                        <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-tl">
                          +{moreCount}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-muted flex items-center justify-center border border-border">
                      <Package className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="hidden md:block">
                    <p className="text-sm font-medium">{firstProduct?.name}</p>
                    {moreCount > 0 && (
                      <p className="text-xs text-muted-foreground">+{moreCount} more item{moreCount > 1 ? 's' : ''}</p>
                    )}
                  </div>
                </div>

                {/* Order Details */}
                <div className="flex-1 grid grid-cols-2 md:flex md:gap-6 gap-4">
                  <div className="md:flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Order ID</p>
                    <p className="font-semibold text-sm md:text-base">{order.order_number}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total</p>
                    <p className="font-semibold text-sm md:text-base">
                      ₹{order.total.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Payment</p>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(
                        order.payment_status || 'pending'
                      )}`}
                    >
                      {(order.payment_status || 'pending').charAt(0).toUpperCase() +
                        (order.payment_status || 'pending').slice(1)}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* View Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/${tenant}/my-orders/${order.id}`)}
                  className="md:w-auto w-full"
                >
                  View
                  <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
