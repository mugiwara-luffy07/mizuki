import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Wishlist() {
  const { tenant } = useParams<{ tenant: string }>();
  const { items, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();

  const handleAddToCart = (item: typeof items[0]) => {
    addItem({
      product_id: item.product_id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
      slug: item.slug,
    });
    toast.success('Added to bag');
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-6">
            Start adding items you love to your wishlist!
          </p>
          <Link to={`/${tenant}/shop`}>
            <Button>
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-semibold mb-8">Wishlist</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div
            key={item.product_id}
            className="group relative bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <Link to={`/${tenant}/product/${item.slug}`}>
              <div className="aspect-[3/4] relative overflow-hidden bg-muted">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No Image
                  </div>
                )}
              </div>
            </Link>

            <div className="p-4">
              <Link to={`/${tenant}/product/${item.slug}`}>
                <h3 className="font-medium mb-2 line-clamp-2 hover:text-primary transition-colors">
                  {item.name}
                </h3>
              </Link>
              
              <p className="text-lg font-semibold mb-4">
                ₹{item.price.toLocaleString()}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleAddToCart(item)}
                  className="flex-1"
                  size="sm"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Add to Bag
                </Button>
                <Button
                  onClick={() => {
                    removeItem(item.product_id);
                    toast.success('Removed from wishlist');
                  }}
                  variant="outline"
                  size="sm"
                  className="px-3 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}













