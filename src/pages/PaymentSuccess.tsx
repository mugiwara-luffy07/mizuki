import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/supabase-client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCartStore } from '@/store/cartStore';

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

export default function PaymentSuccess() {
  const { tenant } = useParams<{ tenant: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);
  const hasProcessedRef = useRef(false);

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    if (hasProcessedRef.current) {
      return;
    }

    hasProcessedRef.current = true;

    const finalizeOrder = async () => {
      const cashfreeOrderId = searchParams.get('order_id')?.trim();

      console.log('[PaymentSuccess] Starting order finalization', {
        cashfreeOrderId,
        tenant,
        sessionStorageKeys: Object.keys(sessionStorage).filter(k => k.includes('cashfree')),
      });

      if (!tenant || !cashfreeOrderId) {
        setStatus('failed');
        setMessage('Missing tenant or order id in payment callback URL.');
        console.error('[PaymentSuccess] Missing tenant or cashfreeOrderId');
        return;
      }

      try {
        const storageKey = `${PENDING_ORDER_KEY_PREFIX}${cashfreeOrderId}`;
        const sessionDraft = sessionStorage.getItem(storageKey);
        const localDraft = localStorage.getItem(storageKey);
        const draftRaw = sessionDraft || localDraft;

        console.log('[PaymentSuccess] Draft lookup:', {
          sessionDraftExists: !!sessionDraft,
          localDraftExists: !!localDraft,
          draftExists: !!draftRaw,
        });
        
        if (!draftRaw) {
          throw new Error('Could not find pending order details. Please try checkout again.');
        }

        const draft = JSON.parse(draftRaw) as PendingOrderDraft;

        // Step 1: Verify payment status with Cashfree via Edge Function.
        console.log('[PaymentSuccess] Calling verify-payment edge function', { cashfreeOrderId });
        const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-payment', {
          body: { order_id: cashfreeOrderId },
        });

        console.log('[PaymentSuccess] verify-payment response', { verifyData, verifyError });

        if (verifyError) {
          throw new Error(`Payment verification failed: ${verifyError.message}`);
        }

        if (!verifyData?.success) {
          setStatus('failed');
          const statusMsg = `Payment not completed yet. Current status: ${verifyData?.order_status || 'UNKNOWN'}`;
          setMessage(statusMsg);
          console.error('[PaymentSuccess] Payment verification failed', verifyData);
          return;
        }

        console.log('[PaymentSuccess] Payment verified successfully');
        setMessage('Payment verified. Creating your order...');

        // Step 2: Avoid duplicate inserts on page refresh.
        console.log('[PaymentSuccess] Checking for existing order');
        const { data: existingOrder, error: existingError } = await supabase
          .from('ecommerce_orders')
          .select('id')
          .eq('order_number', cashfreeOrderId)
          .maybeSingle();

        console.log('[PaymentSuccess] Existing order check', { existingOrder, existingError });

        if (existingError) {
          throw existingError;
        }

        let orderId = existingOrder?.id;

        if (!orderId) {
          console.log('[PaymentSuccess] Inserting new order', { tenant: draft.tenant });
          const payloadBase = {
            order_number: cashfreeOrderId,
            user_id: draft.user_id,
            customer_email: draft.customer_email,
            customer_name: draft.customer_name,
            customer_phone: draft.customer_phone,
            shipping_address: draft.shipping_address,
            items: draft.items,
            subtotal: draft.subtotal,
            shipping_cost: draft.shipping_cost,
            total: draft.total,
            status: 'pending',
            payment_status: 'paid',
            payment_method: 'CASHFREE',
          };

          let { data: insertedOrder, error: insertError } = await supabase
            .from('ecommerce_orders')
            .insert([payloadBase])
            .select('id')
            .single();

          console.log('[PaymentSuccess] Order insert response', { insertedOrder, insertError });

          const tenantRequired =
            !!insertError?.message &&
            (insertError.message.toLowerCase().includes("tenant") &&
              (insertError.message.toLowerCase().includes("null") ||
                insertError.message.toLowerCase().includes("required")));

          if (insertError && tenantRequired) {
            console.warn('[PaymentSuccess] tenant required by schema, retrying with tenant');

            const retryResult = await supabase
              .from('ecommerce_orders')
              .insert([{ ...payloadBase, tenant: draft.tenant }])
              .select('id')
              .single();

            insertedOrder = retryResult.data;
            insertError = retryResult.error;

            console.log('[PaymentSuccess] Retry insert response', {
              insertedOrder,
              insertError,
            });
          }

          if (insertError) {
            throw new Error(`Failed to create order: ${insertError.message}`);
          }

          orderId = insertedOrder.id;
          console.log('[PaymentSuccess] Order created successfully', { orderId });
        } else {
          console.log('[PaymentSuccess] Order already exists');
        }

        clearCart();
        sessionStorage.removeItem(storageKey);
        localStorage.removeItem(storageKey);

        setStatus('success');
        setMessage('Payment successful. Redirecting to order success page...');
        toast.success('Payment successful and order placed.');

        navigate(`/${tenant}/product-order-success`, {
          replace: true,
          state: {
            orderId,
            totalAmount: draft.total,
            shippingAddress: draft.shipping_address,
          },
        });
      } catch (error) {
        const text = error instanceof Error ? error.message : 'Unexpected error while finalizing order';
        console.error('[PaymentSuccess] Error:', text);
        setStatus('failed');
        setMessage(text);
      }
    };

    finalizeOrder();
  }, [tenant, searchParams, clearCart, navigate]);

  return (
    <div className="container mx-auto px-4 py-16 max-w-xl text-center">
      {status === 'loading' && (
        <div className="space-y-4">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
          <h1 className="text-2xl font-semibold">Processing Payment</h1>
          <p className="text-muted-foreground">{message}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-4">
          <CheckCircle2 className="w-10 h-10 mx-auto text-green-600" />
          <h1 className="text-2xl font-semibold">Payment Successful</h1>
          <p className="text-muted-foreground">{message}</p>
        </div>
      )}

      {status === 'failed' && (
        <div className="space-y-4">
          <XCircle className="w-10 h-10 mx-auto text-red-600" />
          <h1 className="text-2xl font-semibold">Payment Could Not Be Confirmed</h1>
          <p className="text-muted-foreground">{message}</p>
          <div className="flex gap-3 justify-center pt-2">
            <Button onClick={() => navigate(`/${tenant}/product-checkout`)}>Try Again</Button>
            <Button variant="outline" onClick={() => navigate(`/${tenant}/cart`)}>
              Back to Cart
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
