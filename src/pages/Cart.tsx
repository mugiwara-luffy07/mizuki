import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function Cart() {
  const { tenant } = useParams<{ tenant: string }>();
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleCheckout = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    // Navigate to product checkout
    navigate(`/${tenant}/product-checkout`);
  };

  const handleLogin = () => {
    sessionStorage.setItem('redirectAfterLogin', `/${tenant}/product-checkout`);
    navigate(`/${tenant}/login`);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your bag is empty</h2>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added anything to your bag yet.
          </p>
          <Link to={`/${tenant}/shop`}>
            <Button>
              Continue Shopping
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getTotal();
  const shipping = items.reduce((sum, item) => sum + (item.shipping_cost || 0), 0);
  const total = subtotal + shipping;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-semibold mb-8">Shopping Bag</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.product_id}
              className="flex gap-4 p-4 border border-border rounded-lg bg-card"
            >
              <Link to={`/${tenant}/product/${item.slug}`}>
                <div className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                      No Image
                    </div>
                  )}
                </div>
              </Link>

              <div className="flex-1">
                <Link to={`/${tenant}/product/${item.slug}`}>
                  <h3 className="font-medium mb-2 hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                </Link>
                <p className="text-lg font-semibold mb-4">
                  ₹{item.price.toLocaleString()}
                </p>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 border border-border rounded-md">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      removeItem(item.product_id);
                      toast.success('Item removed from bag');
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>

              <div className="text-right">
                <p className="text-lg font-semibold">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Subtotal</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 border border-border rounded-lg p-6 bg-card space-y-4">
            <h2 className="text-xl font-semibold">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    `₹${shipping}`
                  )}
                </span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              className="w-full"
              size="lg"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Link to={`/${tenant}/shop`}>
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Login Prompt Dialog */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              Please login or signup to proceed with checkout.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLoginPrompt(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogin}>
              Login / Signup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}













