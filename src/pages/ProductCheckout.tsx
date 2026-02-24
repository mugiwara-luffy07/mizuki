import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Copy, Check, Loader2, Eye, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useTenantStore } from '@/store/tenantStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/supabase-client';
import { getImageUrl } from '@/lib/imageUtils';

export default function ProductCheckout() {
  const { tenant } = useParams<{ tenant: string }>();
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
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
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string>('');
  const [paymentProofUrl, setPaymentProofUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [placing, setPlacing] = useState(false);
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

  // Handle file selection for payment proof
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setPaymentProofFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPaymentProofPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload payment proof to Supabase
  const uploadPaymentProof = async () => {
    if (!paymentProofFile || !user) return;

    setUploading(true);
    try {
      const fileExt = paymentProofFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, paymentProofFile);

      if (error) throw error;

      // Store the reference for later signed URL generation
      setPaymentProofUrl(`supabase://payment-proofs/${fileName}`);
      toast.success('Payment proof uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload payment proof');
    } finally {
      setUploading(false);
    }
  };

  // Clear file selection
  const handleClearFile = () => {
    setPaymentProofFile(null);
    setPaymentProofPreview('');
    setPaymentProofUrl('');
  };

  // Place order
  const handlePlaceOrder = async () => {
    if (!user || !paymentProofUrl) {
      toast.error('Please upload payment proof');
      return;
    }

    setPlacing(true);
    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
      
      // Insert order into database
      const { data, error } = await supabase
        .from('ecommerce_orders')
        .insert([
          {
            order_number: orderNumber,
            user_id: user.id,
            customer_email: user.email,
            customer_name: formData.fullName,
            customer_phone: formData.phone,
            shipping_address: formData,
            items,
            subtotal,
            shipping_cost: shipping,
            total,
            status: 'pending',
            payment_status: 'pending',
            payment_method: 'UPI_QR',
            payment_proof_url: paymentProofUrl,
          },
        ])
        .select();

      if (error) throw error;

      // Send order placed email
      try {
        console.log('📧 Sending ORDER_PLACED email...', {
          order_id: data[0].id,
          email: user.email,
          event_type: 'ORDER_PLACED',
        });
        
        const response = await supabase.functions.invoke('send-order-email', {
          body: {
            order_id: data[0].id,
            email: user.email,
            event_type: 'ORDER_PLACED',
          },
        });
        
        console.log('✅ Email response:', response);
      } catch (emailError) {
        console.error('❌ Email send error:', emailError);
        // Don't fail order if email fails
      }

      // Clear cart and navigate to success page
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/${tenant}/product-order-success`, {
        state: { 
          orderId: data[0].id, 
          totalAmount: total,
          shippingAddress: formData,
        },
      });
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
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

              <h2 className="text-xl font-semibold">Payment via UPI</h2>

              {/* QR Code */}
              {config?.payment?.upiQrImage && (
                <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg border border-border">
                  <p className="text-sm font-medium">Google Pay UPI QR</p>
                  <div className="w-40 h-40 bg-muted rounded-lg flex items-center justify-center">
                    <img
                      src={config.payment.upiQrImage}
                      alt="UPI QR Code"
                      className="w-40 h-40 object-contain"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Scan this QR using Google Pay and complete the payment
                  </p>
                </div>
              )}

              {/* UPI Details */}
              <div className="space-y-3 border-t border-border pt-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">UPI ID</p>
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
                  <p className="text-xs text-muted-foreground mb-1">Amount to Pay</p>
                  <p className="text-2xl font-semibold">₹{total.toLocaleString()}</p>
                </div>
              </div>

              {/* Screenshot Upload */}
              <div className="border-t border-border pt-4 space-y-4">
                <p className="text-sm font-medium">Upload Payment Screenshot</p>

                {!paymentProofFile ? (
                  <div className="border-2 border-dashed border-border rounded-lg p-6">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="payment-proof"
                    />
                    <label
                      htmlFor="payment-proof"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <span className="text-sm font-medium">Click to select image</span>
                      <span className="text-xs text-muted-foreground">
                        PNG, JPG up to 5MB
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                      <span className="text-sm truncate">{paymentProofFile.name}</span>
                      <button
                        onClick={handleClearFile}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Image Preview */}
                    {paymentProofPreview && (
                      <div className="mt-4">
                        <p className="text-xs text-muted-foreground mb-2">Preview</p>
                        <div className="border border-border rounded-lg overflow-hidden max-h-64 flex items-center justify-center bg-muted">
                          <img
                            src={paymentProofPreview}
                            alt="Payment proof preview"
                            className="max-w-full max-h-64 object-contain"
                          />
                        </div>
                      </div>
                    )}

                    {!paymentProofUrl && (
                      <Button
                        onClick={uploadPaymentProof}
                        disabled={uploading}
                        className="w-full"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          'Upload Screenshot'
                        )}
                      </Button>
                    )}
                  </div>
                )}

                {paymentProofUrl && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-700">
                      Payment proof uploaded successfully
                    </span>
                  </div>
                )}
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={!paymentProofUrl || placing}
                className="w-full"
                size="lg"
              >
                {placing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  'Place Order'
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
