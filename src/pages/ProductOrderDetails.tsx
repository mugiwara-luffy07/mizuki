import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Image as ImageIcon, X, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/supabase-client';
import { useAuthStore } from '@/store/authStore';
import { getImageUrl } from '@/lib/imageUtils';

interface OrderDetail {
  id: string;
  order_number: string;
  created_at: string;
  items: Array<{
    product_id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  shipping_address: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  total: number;
  subtotal: number;
  shipping_cost: number;
  payment_status: string;
  status: string;
  payment_proof_url: string | null;
}

export default function ProductOrderDetails() {
  const { tenant, orderId } = useParams<{ tenant: string; orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentProofUrl, setPaymentProofUrl] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('ecommerce_orders')
          .select('*')
          .eq('id', orderId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Order not found');

        setOrder(data);

        // Load payment proof preview if available
        if (data.payment_proof_url) {
          const resolved = await getImageUrl(data.payment_proof_url);
          setPaymentProofUrl(resolved || '');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order details');
        navigate('/my-orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, user, navigate]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="mb-4">Please log in to view order details</p>
        <Button onClick={() => navigate('/login')}>Go to Login</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">Order not found</p>
        <Button onClick={() => navigate('/my-orders')}>Back to Orders</Button>
      </div>
    );
  }

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
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Back Button */}
      <Button
        variant="outline"
        onClick={() => navigate(`/${tenant}/my-orders`)}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Orders
      </Button>

      <h1 className="text-3xl md:text-4xl font-semibold mb-8">Order Details</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Header */}
          <div className="border border-border rounded-lg p-6 bg-card">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                <p className="font-semibold">{order.order_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                <p className="font-semibold">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Payment Status
                </p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                    order.payment_status
                  )}`}
                >
                  {order.payment_status.charAt(0).toUpperCase() +
                    order.payment_status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="border border-border rounded-lg p-6 bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Order Items</h2>
            </div>

            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center pb-3 border-b border-border last:border-b-0"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {order.shipping_cost === 0
                    ? 'Free'
                    : `₹${order.shipping_cost}`}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t border-border pt-2">
                <span>Total</span>
                <span>₹{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="border border-border rounded-lg p-6 bg-card">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Shipping Address</h2>
            </div>

            {order.shipping_address && (
              <div className="space-y-2 text-sm">
                <p className="font-medium">{order.shipping_address.fullName}</p>
                <p className="text-muted-foreground">
                  {order.shipping_address.address}
                </p>
                <p className="text-muted-foreground">
                  {order.shipping_address.city}, {order.shipping_address.state}{' '}
                  {order.shipping_address.pincode}
                </p>
                <p className="text-muted-foreground">
                  Phone: {order.shipping_address.phone}
                </p>
              </div>
            )}
          </div>

          {/* Payment Proof */}
          {order.payment_proof_url && (
            <div className="border border-border rounded-lg p-6 bg-card">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Payment Screenshot</h2>
              </div>

              {paymentProofUrl ? (
                <div 
                  className="relative group cursor-pointer border border-border rounded-lg overflow-hidden bg-muted"
                  onClick={() => setShowPaymentModal(true)}
                >
                  <img
                    src={paymentProofUrl}
                    alt="Payment proof"
                    className="w-full h-auto max-h-80 object-contain"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                    <div className="bg-white/90 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <ZoomIn className="w-5 h-5 text-black" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
                  <p className="text-muted-foreground">
                    Loading payment proof...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Payment Screenshot Modal */}
          {showPaymentModal && paymentProofUrl && (
            <div 
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
              onClick={() => setShowPaymentModal(false)}
            >
              <div 
                className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all z-10"
                >
                  <X className="w-6 h-6 text-black" />
                </button>
                
                <img
                  src={paymentProofUrl}
                  alt="Payment proof fullscreen"
                  className="w-full h-full max-h-[90vh] object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="border border-border rounded-lg p-6 bg-card sticky top-24 space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Amount</p>
              <p className="text-3xl font-semibold">
                ₹{order.total.toLocaleString()}
              </p>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-sm font-semibold mb-3">Order Summary</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-mono text-xs">
                    {order.order_number.substring(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items:</span>
                  <span>
                    {order.items?.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span>
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(`/${tenant}/my-orders`)}
            >
              Back to Orders
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
