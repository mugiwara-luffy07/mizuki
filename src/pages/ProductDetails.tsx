import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingBag, ChevronLeft, ChevronRight, ZoomIn, Truck } from 'lucide-react';
import { supabase } from '@/supabase-client';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { getImageUrl } from '@/lib/imageUtils';

type BlouseStitchingOption = 'with' | 'without';

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  main_image_url?: string;
  images?: string[];
  category?: string;
  fabric?: string;
  origin?: string;
  length?: string;
  weight?: string;
  color?: string;
  base_code?: string;
  body_design?: string;
  washcare?: string;
  blouse_length?: string;
  saree_length?: string;
  stock_quantity?: number;
}

export default function ProductDetails() {
  const { tenant, slug } = useParams<{ tenant: string; slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [resolvedImages, setResolvedImages] = useState<{[key: number]: string}>({});
  const [blouseStitching, setBlouseStitching] = useState<BlouseStitchingOption>('without');
  const { addItem } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    if (tenant && slug) {
      loadProduct();
    }
  }, [tenant, slug]);

  // Resolve all image URLs (handle supabase:// references for main and thumbnails)
  useEffect(() => {
    const resolveAllImages = async () => {
      if (!product) return;
      const allImages = product.main_image_url
        ? [product.main_image_url, ...(product.images || [])]
        : product.images || [];
      
      for (let i = 0; i < allImages.length; i++) {
        const img = allImages[i];
        if (!img) continue;
        
        // Skip if already resolved
        if (resolvedImages[i]) continue;
        
        const resolved = await getImageUrl(img);
        if (resolved) {
          setResolvedImages(prev => ({ ...prev, [i]: resolved }));
        }
      }
    };
    
    resolveAllImages();
  }, [product, resolvedImages]);

  const loadProduct = async () => {
    if (!tenant || !slug) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('tenant', tenant)
        .eq('slug', slug)
        .single();

      if (error) throw error;

      setProduct(data);
      // Set main image as first if available
      if (data?.main_image_url) {
        const allImages = [data.main_image_url, ...(data.images || [])];
        setProduct({ ...data, images: allImages });
      }
    } catch (error: any) {
      console.error('Error loading product:', error);
      toast.error('Product not found');
      navigate(`/${tenant}/shop`);
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

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Product not found</p>
        <Link to={`/${tenant}/shop`} className="text-center block mt-4 text-primary">
          Back to Shop
        </Link>
      </div>
    );
  }

  const allImages = product.main_image_url
    ? [product.main_image_url, ...(product.images?.filter(img => img !== product.main_image_url) || [])]
    : product.images || [];
  
  const currentImage = resolvedImages[currentImageIndex] || allImages[currentImageIndex] || '';
  const isSareeProduct = (product.category || '').toLowerCase().includes('saree');

  const handleAddToCart = () => {
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: currentImage,
      quantity,
      slug: product.slug,
      shipping_cost: product.shipping_cost || 0,
      custom_data: isSareeProduct
        ? {
            blouse_stitching: blouseStitching,
          }
        : undefined,
    });
    toast.success('Added to bag');
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist({
        product_id: product.id,
        name: product.name,
        price: product.price,
        image: currentImage,
        slug: product.slug,
      });
      toast.success('Added to wishlist');
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const specs = [
    { label: 'Color', value: product.color },
    { label: 'Base Code', value: product.base_code },
    { label: 'Body Design', value: product.body_design },
    { label: 'Washcare', value: product.washcare },
    { label: 'Fabric', value: product.fabric },
    { label: 'Blouse Length', value: product.blouse_length },
    { label: 'Weight', value: product.weight },
    { label: 'Saree Length', value: product.saree_length },
    { label: 'Category', value: product.category },
  ].filter(spec => spec.value);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <Button
        variant="ghost"
        onClick={() => navigate(`/${tenant}/shop`)}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Shop
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Carousel */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden group">
            {currentImage ? (
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
            
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                    index === currentImageIndex
                      ? 'border-primary'
                      : 'border-transparent hover:border-muted-foreground'
                  }`}
                >
                  <img
                    src={resolvedImages[index] || img}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold mb-2">{product.name}</h1>
            {product.body_design && (
              <p className="text-muted-foreground">{product.body_design}</p>
            )}
          </div>

          <div>
            <p className="text-3xl font-bold mb-2">₹{product.price.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Inclusive of all taxes</p>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" />
              Courier charges extra (based on location and weight)
            </p>
          </div>

          {isSareeProduct && (
            <div className="border border-border rounded-lg p-4 space-y-4 bg-card">
              <div>
                <h2 className="text-xl font-semibold">Blouse Stitching</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose whether you want blouse stitching included with this saree.
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer">
                  <input
                    type="radio"
                    name="blouse-stitching"
                    value="without"
                    checked={blouseStitching === 'without'}
                    onChange={() => setBlouseStitching('without')}
                  />
                  <span className="font-medium">Without Stitching</span>
                </label>

                <label className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer">
                  <input
                    type="radio"
                    name="blouse-stitching"
                    value="with"
                    checked={blouseStitching === 'with'}
                    onChange={() => setBlouseStitching('with')}
                  />
                  <span className="font-medium">With Stitching</span>
                </label>
              </div>
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="font-medium">Quantity:</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleAddToCart} className="flex-1" size="lg">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Add to Bag
              </Button>
              <Button
                onClick={handleWishlistToggle}
                variant={isInWishlist(product.id) ? 'default' : 'outline'}
                size="lg"
                className="px-6"
              >
                <Heart
                  className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`}
                />
              </Button>
            </div>
          </div>

          {/* Specifications */}
          {specs.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Product Specifications</h2>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody>
                    {specs.map((spec, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? 'bg-muted/30' : ''}
                      >
                        <td className="px-4 py-3 font-medium border-r border-border">
                          {spec.label}:
                        </td>
                        <td className="px-4 py-3">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </div>
          )}

          {/* Delivery & Shipping */}
          <div className="border border-border rounded-lg p-4 space-y-2">
            <h3 className="font-semibold">Delivery & Shipping</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Domestic delivery: 5 business days</li>
              <li>International delivery: 7–9 business days</li>
              <li>Order processing: Within 2 business days</li>
              <li>Packaging: Double packed, waterproof + corrugated box</li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="border border-border rounded-lg p-4 bg-muted/30">
            <h3 className="font-semibold mb-2">Important Information</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Customer responsible for customs duties/taxes</li>
              <li>Remote Area Surcharge (RAS) communicated before shipping</li>
              <li>Seller not responsible for customs delays</li>
              <li>Minor color variations may occur due to photography or device settings</li>
            </ul>
          </div>

          {/* Return Policy */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Return Policy</h3>
            <p className="text-sm text-muted-foreground">
              Returns not available normally. Accepted only for admin-side issues. 
              Unboxing video is mandatory. Return shipping borne by customer. 
              For return requests, please email support.
            </p>
          </div>
        </div>
      </div>

      {/* Reviews Section - Placeholder */}
      <div className="mt-12 border-t border-border pt-8">
        <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
        <p className="text-muted-foreground">No reviews yet</p>
      </div>
    </div>
  );
}













