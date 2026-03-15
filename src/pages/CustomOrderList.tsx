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
  garment: string;
  fabric?: string;
  design_selection?: string;
  sub_category?: string;
  design?: string;
  option1?: string;
  option2?: string;
  option3?: string;
  colors?: string[];
  images?: string[];
  image_url?: string;
  measurement_keys: string[];
  measurement_video_url?: string;
  is_active: boolean;
}

export default function CustomOrderList() {
  const { tenant } = useParams<{ tenant: string }>();
  const [allProducts, setAllProducts] = useState<CustomProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGarment, setSelectedGarment] = useState<string>('All');
  const [selectedDesignSelection, setSelectedDesignSelection] = useState<string>('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [selectedFabric, setSelectedFabric] = useState<string>('All');
  const [selectedDesign, setSelectedDesign] = useState<string>('All');
  const [selectedOption1, setSelectedOption1] = useState<string>('All');
  const [selectedOption2, setSelectedOption2] = useState<string>('All');
  const [selectedOption3, setSelectedOption3] = useState<string>('All');
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
        const primaryImageRef = (product.images && product.images.length > 0)
          ? product.images[0]
          : product.image_url;

        if (!primaryImageRef || resolvedImageMap[product.id]) continue;
        
        const resolved = await getImageUrl(primaryImageRef);
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

  const garments = [
    'All',
    ...new Set(allProducts.map(p => p.garment).filter(Boolean)),
  ] as string[];

  const designSelections = [
    'All',
    ...new Set(
      allProducts
        .filter(p => selectedGarment === 'All' || p.garment === selectedGarment)
        .map(p => p.design_selection)
        .filter(Boolean)
    ),
  ] as string[];

  const subCategories = [
    'All',
    ...new Set(
      allProducts
        .filter(p => selectedGarment === 'All' || p.garment === selectedGarment)
        .filter(p => selectedDesignSelection === 'All' || p.design_selection === selectedDesignSelection)
        .map(p => p.sub_category)
        .filter(Boolean)
    ),
  ] as string[];

  const designs = [
    'All',
    ...new Set(
      allProducts
        .filter(p => selectedGarment === 'All' || p.garment === selectedGarment)
        .filter(p => selectedDesignSelection === 'All' || p.design_selection === selectedDesignSelection)
        .filter(p => selectedSubCategory === 'All' || p.sub_category === selectedSubCategory)
        .map(p => p.design)
        .filter(Boolean)
    ),
  ] as string[];

  const option1List = [
    'All',
    ...new Set(
      allProducts
        .filter(p => selectedGarment === 'All' || p.garment === selectedGarment)
        .filter(p => selectedDesignSelection === 'All' || p.design_selection === selectedDesignSelection)
        .filter(p => selectedSubCategory === 'All' || p.sub_category === selectedSubCategory)
        .filter(p => selectedDesign === 'All' || p.design === selectedDesign)
        .map(p => p.option1)
        .filter(Boolean)
    ),
  ] as string[];

  const option2List = [
    'All',
    ...new Set(
      allProducts
        .filter(p => selectedGarment === 'All' || p.garment === selectedGarment)
        .filter(p => selectedDesignSelection === 'All' || p.design_selection === selectedDesignSelection)
        .filter(p => selectedSubCategory === 'All' || p.sub_category === selectedSubCategory)
        .filter(p => selectedDesign === 'All' || p.design === selectedDesign)
        .filter(p => selectedOption1 === 'All' || p.option1 === selectedOption1)
        .map(p => p.option2)
        .filter(Boolean)
    ),
  ] as string[];

  const option3List = [
    'All',
    ...new Set(
      allProducts
        .filter(p => selectedGarment === 'All' || p.garment === selectedGarment)
        .filter(p => selectedDesignSelection === 'All' || p.design_selection === selectedDesignSelection)
        .filter(p => selectedSubCategory === 'All' || p.sub_category === selectedSubCategory)
        .filter(p => selectedDesign === 'All' || p.design === selectedDesign)
        .filter(p => selectedOption1 === 'All' || p.option1 === selectedOption1)
        .filter(p => selectedOption2 === 'All' || p.option2 === selectedOption2)
        .map(p => p.option3)
        .filter(Boolean)
    ),
  ] as string[];

  const fabrics = [
    'All',
    ...new Set(
      allProducts
        .filter(p => selectedGarment === 'All' || p.garment === selectedGarment)
        .filter(p => selectedDesignSelection === 'All' || p.design_selection === selectedDesignSelection)
        .filter(p => selectedSubCategory === 'All' || p.sub_category === selectedSubCategory)
        .filter(p => selectedDesign === 'All' || p.design === selectedDesign)
        .filter(p => selectedOption1 === 'All' || p.option1 === selectedOption1)
        .filter(p => selectedOption2 === 'All' || p.option2 === selectedOption2)
        .filter(p => selectedOption3 === 'All' || p.option3 === selectedOption3)
        .map(p => p.fabric)
        .filter(Boolean)
    ),
  ] as string[];

  const filteredProducts = allProducts.filter((product) => {
    if (selectedGarment !== 'All' && product.garment !== selectedGarment) return false;
    if (selectedDesignSelection !== 'All' && product.design_selection !== selectedDesignSelection) return false;
    if (selectedSubCategory !== 'All' && product.sub_category !== selectedSubCategory) return false;
    if (selectedDesign !== 'All' && product.design !== selectedDesign) return false;
    if (selectedOption1 !== 'All' && product.option1 !== selectedOption1) return false;
    if (selectedOption2 !== 'All' && product.option2 !== selectedOption2) return false;
    if (selectedOption3 !== 'All' && product.option3 !== selectedOption3) return false;
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
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl md:text-4xl font-semibold">Custom Products</h1>
          <a
            href="https://wa.me/919942322743"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
          >
            Book an appoitment for more ideas
          </a>
        </div>
        <p className="text-muted-foreground">Bespoke and customizable products tailored to your specifications</p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="transition-all duration-300 animate-fade-in">
          <p className="text-sm font-medium mb-2">Garments</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {garments.map((garment) => (
              <button
                key={garment}
                type="button"
                onClick={() => {
                  setSelectedGarment(garment);
                  setSelectedDesignSelection('All');
                  setSelectedSubCategory('All');
                  setSelectedDesign('All');
                  setSelectedOption1('All');
                  setSelectedOption2('All');
                  setSelectedOption3('All');
                  setSelectedFabric('All');
                }}
                className={`px-4 py-2 rounded-full whitespace-nowrap border transition-all duration-300 ${
                  selectedGarment === garment
                    ? 'bg-black text-white border-black scale-105 shadow-md'
                    : 'bg-white text-black border hover:scale-105 hover:shadow-sm'
                }`}
              >
                {garment}
              </button>
            ))}
          </div>
        </div>

        {selectedGarment !== 'All' && designSelections.length > 1 && (
          <div className="transition-all duration-300 animate-fade-in">
            <p className="text-sm font-medium mb-2">Design Selections</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {designSelections.map((designSelection) => (
                <button
                  key={designSelection}
                  type="button"
                  onClick={() => {
                    setSelectedDesignSelection(designSelection);
                    setSelectedSubCategory('All');
                    setSelectedDesign('All');
                    setSelectedOption1('All');
                    setSelectedOption2('All');
                    setSelectedOption3('All');
                    setSelectedFabric('All');
                  }}
                  className={`px-4 py-2 rounded-full whitespace-nowrap border transition-all duration-300 ${
                    selectedDesignSelection === designSelection
                      ? 'bg-black text-white border-black scale-105 shadow-md'
                      : 'bg-white text-black border hover:scale-105 hover:shadow-sm'
                  }`}
                >
                  {designSelection}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedDesignSelection !== 'All' && subCategories.length > 1 && (
          <div className="transition-all duration-300 animate-fade-in">
            <p className="text-sm font-medium mb-2">Sub Categories</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {subCategories.map((subCategory) => (
                <button
                  key={subCategory}
                  type="button"
                  onClick={() => {
                    setSelectedSubCategory(subCategory);
                    setSelectedDesign('All');
                    setSelectedOption1('All');
                    setSelectedOption2('All');
                    setSelectedOption3('All');
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

        {selectedSubCategory !== 'All' && designs.length > 1 && (
          <div className="transition-all duration-300 animate-fade-in">
            <p className="text-sm font-medium mb-2">Design</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {designs.map((design) => (
                <button
                  key={design}
                  type="button"
                  onClick={() => {
                    setSelectedDesign(design);
                    setSelectedOption1('All');
                    setSelectedOption2('All');
                    setSelectedOption3('All');
                    setSelectedFabric('All');
                  }}
                  className={`px-4 py-2 rounded-full whitespace-nowrap border transition-all duration-300 ${
                    selectedDesign === design
                      ? 'bg-black text-white border-black scale-105 shadow-md'
                      : 'bg-white text-black border hover:scale-105 hover:shadow-sm'
                  }`}
                >
                  {design}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedDesign !== 'All' && option1List.length > 1 && (
          <div className="transition-all duration-300 animate-fade-in">
            <p className="text-sm font-medium mb-2">Option 1</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {option1List.map((option1) => (
                <button
                  key={option1}
                  type="button"
                  onClick={() => {
                    setSelectedOption1(option1);
                    setSelectedOption2('All');
                    setSelectedOption3('All');
                    setSelectedFabric('All');
                  }}
                  className={`px-4 py-2 rounded-full whitespace-nowrap border transition-all duration-300 ${
                    selectedOption1 === option1
                      ? 'bg-black text-white border-black scale-105 shadow-md'
                      : 'bg-white text-black border hover:scale-105 hover:shadow-sm'
                  }`}
                >
                  {option1}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedOption1 !== 'All' && option2List.length > 1 && (
          <div className="transition-all duration-300 animate-fade-in">
            <p className="text-sm font-medium mb-2">Option 2</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {option2List.map((option2) => (
                <button
                  key={option2}
                  type="button"
                  onClick={() => {
                    setSelectedOption2(option2);
                    setSelectedOption3('All');
                    setSelectedFabric('All');
                  }}
                  className={`px-4 py-2 rounded-full whitespace-nowrap border transition-all duration-300 ${
                    selectedOption2 === option2
                      ? 'bg-black text-white border-black scale-105 shadow-md'
                      : 'bg-white text-black border hover:scale-105 hover:shadow-sm'
                  }`}
                >
                  {option2}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedOption2 !== 'All' && option3List.length > 1 && (
          <div className="transition-all duration-300 animate-fade-in">
            <p className="text-sm font-medium mb-2">Option 3</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {option3List.map((option3) => (
                <button
                  key={option3}
                  type="button"
                  onClick={() => {
                    setSelectedOption3(option3);
                    setSelectedFabric('All');
                  }}
                  className={`px-4 py-2 rounded-full whitespace-nowrap border transition-all duration-300 ${
                    selectedOption3 === option3
                      ? 'bg-black text-white border-black scale-105 shadow-md'
                      : 'bg-white text-black border hover:scale-105 hover:shadow-sm'
                  }`}
                >
                  {option3}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedOption3 !== 'All' && (
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
              {selectedGarment === 'All'
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
                  {(() => {
                    const primaryImageRef = (product.images && product.images.length > 0)
                      ? product.images[0]
                      : product.image_url;

                    if (!primaryImageRef) {
                      return (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      );
                    }

                    const displayUrl = resolvedImageMap[product.id] || (!primaryImageRef.startsWith('supabase://') ? primaryImageRef : '');
                    return displayUrl ? (
                      <img
                        src={displayUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        Loading...
                      </div>
                    );
                  })()}
                </div>

                {/* Product Info */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{product.garment}</p>
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
