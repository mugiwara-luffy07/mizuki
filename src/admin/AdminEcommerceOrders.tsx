import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, X, Package, Truck, CheckCircle, Clock, Hash, Eye, ExternalLink, ZoomIn } from 'lucide-react';
import { supabase } from '@/supabase-client';
import { Button } from '@/components/ui/button';
import { Input as InputField } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { getImageUrl } from '@/lib/imageUtils';

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
  payment_proof_url?: string;
  items: Array<{
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    custom_data?: {
      measurements?: Record<string, number | string>;
      is_custom?: boolean;
      category?: string;
      [key: string]: any;
    };
  }>;
  shipping_address: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  tracking_id?: string;
  created_at: string;
}

const statusOptions: EcommerceOrder['status'][] = ['pending', 'packed', 'shipped', 'delivered'];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'packed':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
    case 'shipped':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400';
    case 'delivered':
      return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
    case 'cancelled':
      return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// Helper function to detect if an order has custom items
const hasCustomItems = (order: EcommerceOrder): boolean => {
  return order.items.some(item => item.custom_data?.is_custom === true);
};

export default function AdminEcommerceOrders() {
  const { tenant } = useParams<{ tenant: string }>();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<EcommerceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<EcommerceOrder | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewModalOrder, setViewModalOrder] = useState<EcommerceOrder | null>(null);
  const [paymentProofUrl, setPaymentProofUrl] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'verified' | 'rejected'>('pending');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [productImages, setProductImages] = useState<Map<string, string>>(new Map());
  const [productSlugs, setProductSlugs] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (tenant) {
      loadOrders();
    }
  }, [tenant]);

  const loadOrders = async () => {
    if (!tenant) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ecommerce_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);

      // Fetch product images and slugs for all unique product IDs
      if (data && data.length > 0) {
        const productIds = new Set<string>();
        data.forEach((order) => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item: any) => {
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
    } catch (error: any) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: EcommerceOrder['status']) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const { error } = await supabase
        .from('ecommerce_orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      // Send email on status change
      const emailEventMap: Record<string, string> = {
        packed: 'ORDER_PACKED',
        shipped: 'ORDER_SHIPPED',
        delivered: 'ORDER_DELIVERED',
      };
      
      if (emailEventMap[newStatus]) {
        try {
          console.log(`📧 Sending ${emailEventMap[newStatus]} email...`, {
            order_id: orderId,
            email: order.customer_email,
            event_type: emailEventMap[newStatus],
            status: newStatus,
          });
          
          const response = await supabase.functions.invoke('send-order-email', {
            body: {
              order_id: orderId,
              email: order.customer_email,
              event_type: emailEventMap[newStatus],
            },
          });
          
          console.log('✅ Email response:', response);
        } catch (emailError) {
          console.error('❌ Email send error:', emailError);
        }
      }
      
      toast.success(`Order status updated to ${formatStatus(newStatus)}`);
      loadOrders();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      const { error } = await supabase
        .from('ecommerce_orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);

      if (error) throw error;
      toast.success('Order cancelled');
      loadOrders();
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    }
  };

  const handleSetTracking = async () => {
    if (!selectedOrder || !trackingInput.trim()) {
      toast.error('Please enter a tracking ID');
      return;
    }

    try {
      const { error } = await supabase
        .from('ecommerce_orders')
        .update({ 
          tracking_id: trackingInput.trim(),
          status: 'shipped'
        })
        .eq('id', selectedOrder.id);

      if (error) throw error;
      toast.success('Tracking ID updated');
      setIsTrackingDialogOpen(false);
      setTrackingInput('');
      setSelectedOrder(null);
      loadOrders();
    } catch (error: any) {
      console.error('Error setting tracking:', error);
      toast.error('Failed to set tracking ID');
    }
  };

  const openTrackingDialog = (order: EcommerceOrder) => {
    setSelectedOrder(order);
    setTrackingInput(order.tracking_id || '');
    setIsTrackingDialogOpen(true);
  };

  const openViewModal = async (order: EcommerceOrder) => {
    setViewModalOrder(order);
    setPaymentStatus(order.payment_status || 'pending');
    
    if (order.payment_proof_url) {
      const resolved = await getImageUrl(order.payment_proof_url);
      setPaymentProofUrl(resolved || '');
    }
    
    setIsViewModalOpen(true);
  };

  const handlePaymentStatusSave = async () => {
    if (!viewModalOrder) return;
    
    try {
      const previousStatus = viewModalOrder.payment_status;
      
      const { error } = await supabase
        .from('ecommerce_orders')
        .update({ payment_status: paymentStatus })
        .eq('id', viewModalOrder.id)
        .select();

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      
      // Send email only if status actually changed to verified
      if (previousStatus !== 'verified' && paymentStatus === 'verified') {
        try {
          console.log('📧 Sending PAYMENT_VERIFIED email...', {
            order_id: viewModalOrder.id,
            email: viewModalOrder.customer_email,
            event_type: 'PAYMENT_VERIFIED',
          });
          
          const response = await supabase.functions.invoke('send-order-email', {
            body: {
              order_id: viewModalOrder.id,
              email: viewModalOrder.customer_email,
              event_type: 'PAYMENT_VERIFIED',
            },
          });
          
          console.log('✅ Email response:', response);
        } catch (emailError) {
          console.error('❌ Email send error:', emailError);
        }
      }
      
      toast.success(`Payment status updated to ${paymentStatus}`);
      setIsViewModalOpen(false);
      loadOrders();
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      toast.error(`Failed to update payment status: ${error.message || 'Unknown error'}`);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Orders</h1>
        <p className="text-muted-foreground">Manage e-commerce orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <InputField
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order number, customer name, or email..."
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {formatStatus(status)}
              </SelectItem>
            ))}
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Product</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Order ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Payment</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Total</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Tracking</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
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
                    <tr key={order.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div 
                          className="relative w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0 border border-border inline-flex cursor-pointer hover:opacity-75 transition-opacity"
                          onClick={handleProductClick}
                        >
                          {firstProductImage ? (
                            <>
                              <img
                                src={firstProductImage}
                                alt={firstProduct?.name}
                                className="w-full h-full object-cover"
                              />
                              {moreCount > 0 && (
                                <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-1 py-0.5 rounded-tl text-[10px]">
                                  +{moreCount}
                                </div>
                              )}
                            </>
                          ) : (
                            <Package className="w-6 h-6 text-muted-foreground m-auto" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-2">
                          <p className="font-medium text-sm">{order.order_number}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                          {hasCustomItems(order) && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
                              <span>●</span>
                              Custom Order
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-sm">{order.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                        {order.customer_phone && (
                          <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                          {formatStatus(order.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          order.payment_status === 'verified' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                          order.payment_status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}>
                          {formatStatus(order.payment_status || 'pending')}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-sm">
                        ₹{order.total.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {order.tracking_id ? (
                          <p className="text-sm font-mono text-xs">{order.tracking_id}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">-</p>
                        )}
                      </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openViewModal(order)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {order.status === 'pending' && (
                          <>
                            <Select
                              value={order.status}
                              onValueChange={(value: EcommerceOrder['status']) => handleStatusChange(order.id, value)}
                            >
                              <SelectTrigger className="w-32 h-8 text-xs">
                                <SelectValue placeholder={formatStatus(order.status)} />
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {formatStatus(status)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelOrder(order.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {order.status === 'packed' && (
                          <Select
                            value={order.status}
                            onValueChange={(value: EcommerceOrder['status']) => handleStatusChange(order.id, value)}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue placeholder={formatStatus(order.status)} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="packed">Packed</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        {order.status === 'shipped' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openTrackingDialog(order)}
                            >
                              <Hash className="w-4 h-4 mr-1" />
                              {order.tracking_id ? 'Edit' : 'Add'} Tracking
                            </Button>
                            <Select
                              value={order.status}
                              onValueChange={(value: EcommerceOrder['status']) => handleStatusChange(order.id, value)}
                            >
                              <SelectTrigger className="w-32 h-8 text-xs">
                                <SelectValue placeholder={formatStatus(order.status)} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                              </SelectContent>
                            </Select>
                          </>
                        )}
                        {order.status === 'delivered' && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs">Completed</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tracking ID Dialog */}
      <Dialog open={isTrackingDialogOpen} onOpenChange={setIsTrackingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Tracking ID</DialogTitle>
            <DialogDescription>
              Enter the tracking ID for order {selectedOrder?.order_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <InputField
              placeholder="Tracking ID"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSetTracking()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTrackingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetTracking}>
              Save Tracking ID
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Order Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          
          {viewModalOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="border border-border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold">Order Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Order ID</p>
                    <p className="font-medium font-mono">{viewModalOrder.order_number}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-medium">{new Date(viewModalOrder.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="font-medium text-lg">₹{viewModalOrder.total.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Order Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(viewModalOrder.status)}`}>
                      {formatStatus(viewModalOrder.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="border border-border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold">Customer Details</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{viewModalOrder.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{viewModalOrder.customer_email}</p>
                  </div>
                  {viewModalOrder.customer_phone && (
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{viewModalOrder.customer_phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border border-border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold">Shipping Address</h3>
                <div className="text-sm space-y-1">
                  <p>{viewModalOrder.shipping_address.fullName}</p>
                  <p className="text-muted-foreground">{viewModalOrder.shipping_address.address}</p>
                  <p className="text-muted-foreground">
                    {viewModalOrder.shipping_address.city}, {viewModalOrder.shipping_address.state} {viewModalOrder.shipping_address.pincode}
                  </p>
                  {viewModalOrder.shipping_address.phone && (
                    <p className="text-muted-foreground">{viewModalOrder.shipping_address.phone}</p>
                  )}
                </div>
              </div>

              {/* Products */}
              <div className="border border-border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold">Products Ordered</h3>
                <div className="space-y-4">
                  {viewModalOrder.items.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between py-2 border-b border-border">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-muted-foreground text-sm">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{item.price.toLocaleString()}</p>
                          <p className="text-muted-foreground text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                      
                      {/* Custom Measurements Section */}
                      {item.custom_data?.measurements && (
                        <div className="bg-muted/30 rounded-lg p-3 mt-2 space-y-2">
                          <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-400 flex items-center gap-2">
                            <span>📏</span>
                            Custom Measurements
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(item.custom_data.measurements).map(([label, value]) => (
                              <div key={label} className="space-y-1">
                                <p className="text-muted-foreground capitalize">{label}</p>
                                <p className="font-medium">
                                  {value}
                                  {item.custom_data?.category && (
                                    <span className="text-muted-foreground text-xs ml-1">
                                      {item.custom_data.category === 'custom_tailoring' ? 'inches' : item.custom_data.category === 'saree_length' ? 'meters' : ''}
                                    </span>
                                  )}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Proof */}
              {viewModalOrder.payment_proof_url && (
                <div className="border border-border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold">Payment Proof</h3>
                  {paymentProofUrl ? (
                    <div 
                      className="relative group cursor-pointer border border-border rounded-lg overflow-hidden bg-muted"
                      onClick={() => setShowPaymentModal(true)}
                    >
                      <img
                        src={paymentProofUrl}
                        alt="Payment proof"
                        className="w-full h-auto max-h-64 object-contain"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                        <div className="bg-white/90 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <ZoomIn className="w-5 h-5 text-black" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Loading payment proof...</p>
                  )}
                </div>
              )}

              {/* Payment Status */}
              <div className="border border-border rounded-lg p-4 space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Payment Status</h3>
                  <Select value={paymentStatus} onValueChange={(value: any) => setPaymentStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Footer Actions */}
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePaymentStatusSave}>
                  Save Payment Status
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Screenshot Fullscreen Modal */}
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
  );
}

