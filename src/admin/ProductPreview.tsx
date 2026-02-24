import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getImageUrl } from '@/lib/imageUtils';

interface Product {
  id: string;
  name: string;
  short_name?: string;
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
  shipping_returns_policy?: string;
}

interface ProductPreviewProps {
  product: Product;
  onClose: () => void;
}

export default function ProductPreview({ product, onClose }: ProductPreviewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [resolvedImages, setResolvedImages] = useState<{[key: number]: string}>({});

  const allImages = product.main_image_url
    ? [product.main_image_url, ...(product.images || [])]
    : product.images || [];
  
  const currentImage = resolvedImages[currentImageIndex] || allImages[currentImageIndex] || '';

  // Resolve all image URLs (handle supabase:// references for main and thumbnails)
  useEffect(() => {
    const resolveAllImages = async () => {
      for (let i = 0; i < allImages.length; i++) {
        const img = allImages[i];
        if (!img) continue;
        
        // Skip if already resolved
        if (resolvedImages[i]) continue;
        
        // Resolve the image URL
        const resolved = await getImageUrl(img);
        if (resolved) {
          setResolvedImages(prev => ({ ...prev, [i]: resolved }));
        }
      }
    };
    
    resolveAllImages();
  }, [allImages, resolvedImages]);

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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 bg-background/80 hover:bg-background rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
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
              </div>

              {/* Add to Bag Button */}
              <Button className="w-full" size="lg">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Add to Bag
              </Button>

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

              {/* Policy */}
              {product.shipping_returns_policy && (
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Shipping & Returns Policy</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {product.shipping_returns_policy}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}












