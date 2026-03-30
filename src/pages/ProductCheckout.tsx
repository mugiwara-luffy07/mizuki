import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Check, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useTenantStore } from '@/store/tenantStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/supabase-client';

const PENDING_ORDER_KEY_PREFIX = 'cashfree_pending_order_';

interface PendingOrderDraft {
  order_number: string;
  user_id: string;
  tenant: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: any[];
  subtotal: number;
  shipping_cost: number;
  total: number;
}

export default function ProductCheckout() {
  const { tenant } = useParams<{ tenant: string }>();
  const navigate = useNavigate();
  const { items, getTotal } = useCartStore();
  const { user } = useAuthStore();
  const { config } = useTenantStore();

  // Shipping address form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Payment section state
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment'>('shipping');
  const [paying, setPaying] = useState(false);
  const [copiedUPI, setCopiedUPI] = useState(false);

  const subtotal = getTotal();
  const shipping = items.reduce((sum, item) => sum + (item.shipping_cost || 0), 0);
  const total = subtotal + shipping;

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate shipping form
  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      toast.error('Please enter your full name');
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return false;
    }
    if (!formData.address.trim()) {
      toast.error('Please enter your address');
      return false;
    }
    if (!formData.city.trim()) {
      toast.error('Please enter your city');
      return false;
    }
    if (!formData.state.trim()) {
      toast.error('Please enter your state');
      return false;
    }
    if (!formData.pincode.trim() || formData.pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }
    return true;
  };

  // Proceed to payment step
  const handleContinueToPayment = () => {
    if (validateForm()) {
      setCurrentStep('payment');
    }
  };

  const getCashfreeMode = () => {
    return import.meta.env.VITE_CASHFREE_ENV === 'production' ? 'production' : 'sandbox';
  };

  const handlePayNow = async () => {
    if (!user || !tenant) {
      toast.error('Please log in to continue');
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setPaying(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-order', {
        body: {
          amount: total,
          customer_name: formData.fullName,
          customer_email: user.email,
          customer_phone: formData.phone,
          tenant,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to create payment order');
      }

      if (!data?.order_id || !data?.payment_session_id) {
        throw new Error('Invalid response from payment gateway');
      }

      // Save order draft locally and finalize only after payment verification.
      const pendingOrder: PendingOrderDraft = {
        order_number: data.order_id,
        user_id: user.id,
        tenant: tenant!,
        customer_email: user.email || '',
        customer_name: formData.fullName,
        customer_phone: formData.phone,
        shipping_address: formData,
        items,
        subtotal,
        shipping_cost: shipping,
        total,
      };

      sessionStorage.setItem(
        `${PENDING_ORDER_KEY_PREFIX}${data.order_id}`,
        JSON.stringify(pendingOrder)
      );

      // Fallback persistence for gateway redirects that may lose sessionStorage state.
      localStorage.setItem(
        `${PENDING_ORDER_KEY_PREFIX}${data.order_id}`,
        JSON.stringify(pendingOrder)
      );

      if (!window.Cashfree) {
        throw new Error('Cashfree SDK is not loaded');
      }

      const cashfree = window.Cashfree({ mode: getCashfreeMode() });
      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: '_self',
      });

      // Cashfree handles redirect to the return URL.
      return;

    } catch (error) {
      console.error('Order error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start payment');
    } finally {
      setPaying(false);
    }
  };

  // Copy UPI ID
  const copyUPI = () => {
    if (config?.payment?.upiId) {
      navigator.clipboard.writeText(config.payment.upiId);
      setCopiedUPI(true);
      setTimeout(() => setCopiedUPI(false), 2000);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="mb-4">Please log in to proceed with your order</p>
        <Button onClick={() => navigate(`/${tenant}/login`)}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-semibold mb-8">
        {currentStep === 'shipping' ? 'Shipping Address' : 'Payment'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStep === 'shipping' ? (
            // SHIPPING ADDRESS FORM
            <div className="border border-border rounded-lg p-6 bg-card space-y-6">
              <h2 className="text-xl font-semibold">Delivery Address</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleFormChange}
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    placeholder="Enter your 10-digit phone number"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Address Line</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    placeholder="Enter your address (street, area, etc.)"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleFormChange}
                      placeholder="City"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleFormChange}
                      placeholder="State"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleFormChange}
                    placeholder="6-digit pincode"
                    maxLength={6}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <Button
                onClick={handleContinueToPayment}
                className="w-full"
                size="lg"
              >
                Continue to Payment
              </Button>
            </div>
          ) : (
            // PAYMENT SECTION
            <div className="border border-border rounded-lg p-6 bg-card space-y-6">
              <div>
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('shipping')}
                  className="mb-4"
                >
                  ← Back to Address
                </Button>
              </div>

              <h2 className="text-xl font-semibold">Payment via Cashfree</h2>

              {/* Optional fallback UPI details */}
              <div className="space-y-3 border-t border-border pt-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">UPI ID (Optional Fallback)</p>
                  <div className="flex items-center gap-2 bg-muted p-2 rounded">
                    <code className="text-sm flex-1">{config?.payment?.upiId}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyUPI}
                      className="h-8 w-8 p-0"
                    >
                      {copiedUPI ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Amount</p>
                  <p className="text-2xl font-semibold">₹{total.toLocaleString()}</p>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Click the button below to open Cashfree Hosted Checkout. You will be redirected to a secure payment page.
                </p>
              </div>

              <Button
                onClick={handlePayNow}
                disabled={paying}
                className="w-full"
                size="lg"
              >
                {paying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Redirecting to Cashfree...
                  </>
                ) : (
                  'Pay Now'
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Order Summary - Right Sidebar (Always Visible) */}
        <div className="lg:col-span-1">
          <div className="border border-border rounded-lg p-6 bg-card space-y-4 sticky top-24">
            <h2 className="text-lg font-semibold">Order Summary</h2>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {items.map((item) => (
                <div key={item.product_id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.name} <span className="text-xs">x{item.quantity}</span>
                  </span>
                  <span className="font-medium">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping === 0 ? 'Free' : `₹${shipping}`}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-base border-t border-border pt-2">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
