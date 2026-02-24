import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Copy, Check, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useTenantStore } from '@/store/tenantStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/supabase-client';

export default function Checkout() {
  const { tenant } = useParams<{ tenant: string }>();
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { config } = useTenantStore();
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofUrl, setPaymentProofUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [copiedUPI, setCopiedUPI] = useState(false);

  const subtotal = getTotal();
  const shipping = subtotal > 5000 ? 0 : 200;
  const total = subtotal + shipping;

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
  };

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

      // Generate signed URL
      const { data: signedData } = await supabase.storage
        .from('payment-proofs')
        .createSignedUrl(fileName, 604800); // 7 days

      setPaymentProofUrl(`supabase://payment-proofs/${fileName}`);
      toast.success('Payment proof uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload payment proof');
    } finally {
      setUploading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user || !paymentProofUrl) {
      toast.error('Please upload payment proof');
      return;
    }

    setPlacing(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            tenant,
            items,
            total_amount: total,
            payment_proof_url: paymentProofUrl,
            payment_method: 'UPI_QR',
            payment_status: 'pending_verification',
            order_status: 'placed',
            created_at: new Date(),
          },
        ])
        .select();

      if (error) throw error;

      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/${tenant}/order-success`, {
        state: { orderId: data[0].id, totalAmount: total },
      });
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

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
        <p className="mb-4">Please log in to proceed</p>
        <Button onClick={() => navigate(`/${tenant}/login`)}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-semibold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary - Left */}
        <div className="lg:col-span-2">
          <div className="border border-border rounded-lg p-6 bg-card space-y-4 mb-8">
            <h2 className="text-xl font-semibold">Order Summary</h2>

            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.product_id} className="flex justify-between text-sm">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t border-border pt-2 mt-2">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Section - Right */}
        <div className="lg:col-span-1">
          <div className="border border-border rounded-lg p-6 bg-card space-y-6 sticky top-24">
            <h2 className="text-xl font-semibold">Payment</h2>

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
                <p className="text-xs text-muted-foreground mb-1">Amount</p>
                <p className="text-2xl font-semibold">₹{total.toLocaleString()}</p>
              </div>
            </div>

            {/* Screenshot Upload */}
            <div className="border-t border-border pt-4 space-y-3">
              <p className="text-sm font-medium">Upload Payment Screenshot</p>

              <div className="border-2 border-dashed border-border rounded-lg p-4">
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
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <span className="text-sm">
                    {paymentProofFile
                      ? paymentProofFile.name
                      : 'Click to select image'}
                  </span>
                </label>
              </div>

              {paymentProofFile && !paymentProofUrl && (
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

              {paymentProofUrl && (
                <div className="bg-green-50 text-green-700 p-3 rounded text-sm flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Payment proof uploaded
                </div>
              )}
            </div>

            {/* Place Order Button */}
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
        </div>
      </div>
    </div>
  );
}
