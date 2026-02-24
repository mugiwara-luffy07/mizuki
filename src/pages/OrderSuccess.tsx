import { useParams, useLocation, Link, Navigate } from 'react-router-dom';
import { Check, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderState {
  orderId: string;
  totalAmount?: number;
  total?: number;
  items?: any[];
}

export default function OrderSuccess() {
  const { tenant } = useParams<{ tenant: string }>();
  const location = useLocation();
  const state = location.state as OrderState | null;

  const orderId = state?.orderId || 'ORDER_ID';
  const totalAmount = state?.totalAmount || state?.total || 0;

  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in">
      <div className="max-w-md mx-auto text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl md:text-4xl font-semibold mb-2">
          Order Placed Successfully!
        </h1>

        <p className="text-muted-foreground text-lg mb-8">
          Your payment will be verified shortly. We'll send you an email confirmation once your order is confirmed.
        </p>

        {/* Order Details */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8 space-y-4 text-left">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Order ID</p>
            <p className="font-mono text-sm break-all">{orderId}</p>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
            <p className="text-2xl font-semibold">₹{totalAmount.toLocaleString()}</p>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <p className="text-sm">Payment Verification Pending</p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
          <p className="text-sm font-medium text-blue-900 mb-2">What happens next?</p>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>✓ Our team will verify your payment screenshot</li>
            <li>✓ You'll receive a confirmation email</li>
            <li>✓ Your order will be processed and shipped</li>
          </ul>
        </div>

        {/* Continue Shopping Button */}
        <Link to={`/${tenant}/shop`}>
          <Button className="w-full" size="lg">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
