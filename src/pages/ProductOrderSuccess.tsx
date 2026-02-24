import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  CheckCircle,
  Package,
  MapPin,
  Truck,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderState {
  orderId: string;
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export default function ProductOrderSuccess() {
  const { tenant } = useParams<{ tenant: string }>();
  const location = useLocation();
  const [orderData, setOrderData] = useState<OrderState | null>(null);

  useEffect(() => {
    // Get order data from navigation state
    const state = location.state as OrderState | undefined;
    if (state) {
      setOrderData(state);
    }
  }, [location.state]);

  if (!orderData) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">Order information not found</p>
        <Link to={`/${tenant}/shop`}>
          <Button>
            Back to Shop
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Success Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-lg text-muted-foreground mb-4">
          Thank you for your order. We've received your payment and will verify it shortly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order ID & Status */}
          <div className="border border-border rounded-lg p-6 bg-card">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Order ID</span>
                <code className="bg-muted px-3 py-1 rounded text-sm font-mono">
                  {orderData.orderId}
                </code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="text-2xl font-semibold">
                  ₹{orderData.totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="text-muted-foreground">Payment Status</span>
                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700">
                    Pending Verification
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="border border-border rounded-lg p-6 bg-card">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Delivery Address</h2>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{orderData.shippingAddress.fullName}</p>
              <p className="text-muted-foreground">
                {orderData.shippingAddress.address}
              </p>
              <p className="text-muted-foreground">
                {orderData.shippingAddress.city}, {orderData.shippingAddress.state}{' '}
                {orderData.shippingAddress.pincode}
              </p>
              <p className="text-muted-foreground">
                Phone: {orderData.shippingAddress.phone}
              </p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="border border-border rounded-lg p-6 bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">What's Next?</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
                  1
                </div>
                <div>
                  <p className="font-medium">Payment Verification</p>
                  <p className="text-muted-foreground text-xs">
                    We'll verify your payment screenshot within 2-4 hours
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
                  2
                </div>
                <div>
                  <p className="font-medium">Order Confirmation</p>
                  <p className="text-muted-foreground text-xs">
                    You'll receive a confirmation email once payment is verified
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
                  3
                </div>
                <div>
                  <p className="font-medium">Shipment</p>
                  <p className="text-muted-foreground text-xs">
                    Your order will be prepared and shipped within 3-5 business days
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-1">
          <div className="border border-border rounded-lg p-6 bg-card sticky top-24 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Truck className="w-5 h-5 text-muted-foreground" />
                <p className="font-semibold">Estimated Delivery</p>
              </div>
              <p className="text-sm text-muted-foreground">
                3-5 business days from payment verification
              </p>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground mb-3">
                Order ID: {orderData.orderId.slice(0, 8)}...
              </p>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">To:</span> {orderData.shippingAddress.city}
                </p>
                <p className="font-medium">
                  ₹{orderData.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="text-center space-y-4 max-w-md mx-auto">
        <Link to={`/${tenant}/shop`} className="block">
          <Button className="w-full" variant="outline">
            Continue Shopping
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
        <p className="text-sm text-muted-foreground">
          A confirmation email will be sent to your registered email address.
        </p>
      </div>
    </div>
  );
}
