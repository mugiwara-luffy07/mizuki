import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Loader2 } from 'lucide-react';
import { supabase } from '@/supabase-client';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/imageUtils';
import { ProductCard } from '@/components/ProductCard';
import { DEFAULT_TENANT } from '@/config/defaultTenant';

interface Product {
  id: string;
  name: string;
  short_name?: string;
  slug: string;
  price: number;
  main_image_url?: string;
  images?: string[];
  category?: string;
  fabric?: string;
  color?: string;
  stock_quantity?: number;
  is_active: boolean;
}

export default function Shop() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [resolvedImageMap, setResolvedImageMap] = useState<Record<string, string>>({});
  const { addItem } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, products]);

  // Resolve product main images
  useEffect(() => {
    const resolveImages = async () => {
      for (const product of products) {
        if (!product.main_image_url || resolvedImageMap[product.id]) continue;
        
        if (product.main_image_url.startsWith('supabase://')) {
          const resolved = await getImageUrl(product.main_image_url);
          if (resolved) {
            setResolvedImageMap(prev => ({ ...prev, [product.id]: resolved }));
          }
        }
      }
    };

    resolveImages();
  }, [products, resolvedImageMap]);

  const loadProducts = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) throw error;

      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (error: any) {
      const isAbortError = error.name === 'AbortError' || error.code === 'ABORT_ERR';
      
      if (!isAbortError) {
        console.error('Error loading products:', error);
        toast.error('Failed to load products. Please refresh the page.');
      }
      
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(query) ||
        p.short_name?.toLowerCase().includes(query) ||
        p.fabric?.toLowerCase().includes(query) ||
        p.color?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: resolvedImageMap[product.id] || product.main_image_url || product.images?.[0] || '',
      quantity: 1,
      slug: product.slug,
      shipping_cost: product.shipping_cost || 0,
    });
    toast.success('Added to bag');
  };

  const handleWishlistToggle = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist({
        product_id: product.id,
        name: product.name,
        price: product.price,
        image: resolvedImageMap[product.id] || product.main_image_url || product.images?.[0] || '',
        slug: product.slug,
      });
      toast.success('Added to wishlist');
    }
  };

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-semibold mb-8">Shop</h1>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, fabric, color, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
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

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">
            {searchQuery ? 'No products found matching your search.' : 'No products available.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const inWishlist = isInWishlist(product.id);
            const productWithResolvedImage = {
              ...product,
              main_image_url: resolvedImageMap[product.id] || product.main_image_url,
            };

            return (
              <ProductCard
                key={product.id}
                product={productWithResolvedImage}
                tenant={DEFAULT_TENANT}
                inWishlist={inWishlist}
                onAddToCart={handleAddToCart}
                onToggleWishlist={() => handleWishlistToggle(product)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}













