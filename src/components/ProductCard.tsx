import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getImageUrl } from '@/lib/imageUtils';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    short_name?: string;
    slug: string;
    price: number;
    main_image_url?: string;
    images?: string[];
  };
  tenant: string;
  inWishlist: boolean;
  onAddToCart: (product: any) => void;
  onToggleWishlist: (productId: string) => void;
}

export function ProductCard({
  product,
  tenant,
  inWishlist,
  onAddToCart,
  onToggleWishlist,
}: ProductCardProps) {
  const [resolvedImage, setResolvedImage] = useState('');

  useEffect(() => {
    const resolveImage = async () => {
      const imageUrl = product.main_image_url || product.images?.[0] || '';
      if (imageUrl) {
        const resolved = await getImageUrl(imageUrl);
        setResolvedImage(resolved);
      }
    };

    resolveImage();
  }, [product]);

  return (
    <div className="group relative bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/${tenant}/product/${product.slug}`}>
        <div className="aspect-[3/4] relative overflow-hidden bg-muted">
          {resolvedImage ? (
            <img
              src={resolvedImage}
              alt={product.name}
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
        <Link to={`/${tenant}/product/${product.slug}`}>
          <h3 className="font-medium mb-2 line-clamp-2 hover:text-primary transition-colors">
            {product.short_name || product.name}
          </h3>
        </Link>

        <p className="text-lg font-semibold mb-4">
          ₹{product.price.toLocaleString()}
        </p>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => onAddToCart(product)}
            className="flex-1"
            size="sm"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Add
          </Button>
          <Button
            onClick={() => onToggleWishlist(product.id)}
            variant={inWishlist ? 'default' : 'outline'}
            size="sm"
            className="px-3"
          >
            <Heart
              className={`w-4 h-4 ${
                inWishlist ? 'fill-current' : ''
              }`}
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
