import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/supabase-client';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/imageUtils';
import { Button } from '@/components/ui/button';

interface CustomProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  base_price: number;
  category: string;
  image_url?: string;
  measurement_keys: string[];
  measurement_video_url?: string;
  is_active: boolean;
}

export default function CustomOrderList() {
  const { tenant } = useParams<{ tenant: string }>();
  const [products, setProducts] = useState<CustomProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [resolvedImageMap, setResolvedImageMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (tenant) {
      loadProducts();
    }
  }, [tenant]);

  // Resolve product images (supabase:// → signed URLs)
  useEffect(() => {
    const resolveImages = async () => {
      for (const product of products) {
        if (!product.image_url || resolvedImageMap[product.id]) continue;
        
        const resolved = await getImageUrl(product.image_url);
        if (resolved) {
          setResolvedImageMap(prev => ({ ...prev, [product.id]: resolved }));
        }
      }
    };

    resolveImages();
  }, [products, resolvedImageMap]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('custom_products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error loading custom products:', error);
      toast.error('Failed to load custom products');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold mb-2">Custom Products</h1>
        <p className="text-muted-foreground">Bespoke and customizable products tailored to your specifications</p>
      </div>

      {/* Category Filters */}
      {products.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className="capitalize"
            >
              All
            </Button>
            {[...new Set(products.map(p => p.category).filter(Boolean))].map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      {(() => {
        const filteredProducts = selectedCategory === 'all' 
          ? products 
          : products.filter(p => p.category === selectedCategory);
        
        return filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              {products.length === 0 
                ? 'No custom products available at the moment.' 
                : 'No products found in this category.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
            <Link
              key={product.id}
              to={`/${tenant}/custom-order/${product.slug}`}
              className="group"
            >
              <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                {/* Image */}
                <div className="aspect-[3/4] bg-muted overflow-hidden relative">
                  {product.image_url ? (
                    <img
                      src={resolvedImageMap[product.id] || product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{product.category}</p>
                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-lg font-semibold text-primary">
                      ₹{product.base_price.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {product.measurement_keys.length} measurements available
                    </p>
                  </div>
                </div>
              </div>
            </Link>
            ))}
          </div>
        );
      })()}
    </div>
  );
}
