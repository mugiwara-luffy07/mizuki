import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/supabase-client';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/imageUtils';

interface CustomProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  base_price: number;
  category: string;
  fabric?: string;
  sub_category?: string;
  variety?: string;
  design?: string;
  colors?: string[];
  image_url?: string;
  measurement_keys: string[];
  measurement_video_url?: string;
  is_active: boolean;
}

export default function CustomOrderList() {
  const { tenant } = useParams<{ tenant: string }>();
  const [allProducts, setAllProducts] = useState<CustomProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [selectedVariety, setSelectedVariety] = useState<string>('All');
  const [selectedFabric, setSelectedFabric] = useState<string>('All');
  const [resolvedImageMap, setResolvedImageMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (tenant) {
      loadProducts();
    }
  }, [tenant]);

  // Resolve product images (supabase:// → signed URLs)
  useEffect(() => {
    const resolveImages = async () => {
      for (const product of allProducts) {
        if (!product.image_url || resolvedImageMap[product.id]) continue;
        
        const resolved = await getImageUrl(product.image_url);
        if (resolved) {
          setResolvedImageMap(prev => ({ ...prev, [product.id]: resolved }));
        }
      }
    };

    resolveImages();
  }, [allProducts, resolvedImageMap]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('custom_products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllProducts(data || []);
    } catch (error: any) {
      console.error('Error loading custom products:', error);
      toast.error('Failed to load custom products');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['All', ...new Set(allProducts.map((product) => product.category).filter(Boolean))] as string[];

  const subCategories = [
    'All',
    ...new Set(
      allProducts
        .filter((product) => selectedCategory === 'All' || product.category === selectedCategory)
        .map((product) => product.sub_category)
        .filter((subCategory): subCategory is string => Boolean(subCategory))
    ),
  ] as string[];

  const varieties = [
    'All',
    ...new Set(
      allProducts
        .filter((product) => selectedCategory === 'All' || product.category === selectedCategory)
        .filter((product) => selectedSubCategory === 'All' || product.sub_category === selectedSubCategory)
        .map((product) => product.variety)
        .filter((variety): variety is string => Boolean(variety))
    ),
  ] as string[];

  const fabrics = [
    'All',
    ...new Set(
      allProducts
        .filter((product) => selectedCategory === 'All' || product.category === selectedCategory)
        .filter((product) => selectedSubCategory === 'All' || product.sub_category === selectedSubCategory)
        .filter((product) => selectedVariety === 'All' || product.variety === selectedVariety)
        .map((product) => product.fabric)
        .filter((fabric): fabric is string => Boolean(fabric))
    ),
  ] as string[];

  const filteredProducts = allProducts.filter((product) => {
    if (selectedCategory !== 'All' && product.category !== selectedCategory) return false;
    if (selectedSubCategory !== 'All' && product.sub_category !== selectedSubCategory) return false;
    if (selectedVariety !== 'All' && product.variety !== selectedVariety) return false;
    if (selectedFabric !== 'All' && product.fabric !== selectedFabric) return false;
    return true;
  });

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
      <div className="mb-8 space-y-4">
        <div className="transition-all duration-300 animate-fade-in">
          <p className="text-sm font-medium mb-2">Categories</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setSelectedCategory(category);
                  setSelectedSubCategory('All');
                  setSelectedVariety('All');
                  setSelectedFabric('All');
                }}
                className={`px-4 py-2 rounded-full whitespace-nowrap border transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-black text-white border-black scale-105 shadow-md'
                    : 'bg-white text-black border hover:scale-105 hover:shadow-sm'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {selectedCategory !== 'All' && subCategories.length > 1 && (
          <div className="transition-all duration-300 animate-fade-in">
            <p className="text-sm font-medium mb-2">Sub Categories</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {subCategories.map((subCategory) => (
                <button
                  key={subCategory}
                  type="button"
                  onClick={() => {
                    setSelectedSubCategory(subCategory);
                    setSelectedVariety('All');
                    setSelectedFabric('All');
                  }}
                  className={`px-4 py-2 rounded-full whitespace-nowrap border transition-all duration-300 ${
                    selectedSubCategory === subCategory
                      ? 'bg-black text-white border-black scale-105 shadow-md'
                      : 'bg-white text-black border hover:scale-105 hover:shadow-sm'
                  }`}
                >
                  {subCategory}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedSubCategory !== 'All' && varieties.length > 1 && (
          <div className="transition-all duration-300 animate-fade-in">
            <p className="text-sm font-medium mb-2">Varieties</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {varieties.map((variety) => (
                <button
                  key={variety}
                  type="button"
                  onClick={() => {
                    setSelectedVariety(variety);
                    setSelectedFabric('All');
                  }}
                  className={`px-4 py-2 rounded-full whitespace-nowrap border transition-all duration-300 ${
                    selectedVariety === variety
                      ? 'bg-black text-white border-black scale-105 shadow-md'
                      : 'bg-white text-black border hover:scale-105 hover:shadow-sm'
                  }`}
                >
                  {variety}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedVariety !== 'All' && fabrics.length > 1 && (
          <div className="transition-all duration-300 animate-fade-in">
            <p className="text-sm font-medium mb-2">Fabrics</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {fabrics.map((fabric) => (
                <button
                  key={fabric}
                  type="button"
                  onClick={() => setSelectedFabric(fabric)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap border transition-all duration-300 ${
                    selectedFabric === fabric
                      ? 'bg-black text-white border-black scale-105 shadow-md'
                      : 'bg-white text-black border hover:scale-105 hover:shadow-sm'
                  }`}
                >
                  {fabric}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {(() => {
        return filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              {selectedCategory === 'All'
                ? 'No custom products available at the moment.'
                : 'No products found for selected filters.'}
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
