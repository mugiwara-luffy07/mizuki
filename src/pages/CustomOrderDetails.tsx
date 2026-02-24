import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2, Check } from 'lucide-react';
import { supabase } from '@/supabase-client';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/imageUtils';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

interface MeasurementMaster {
  id: string;
  key: string;
  label: string;
  unit: string;
  is_required: boolean;
}

export default function CustomOrderDetails() {
  const { tenant, slug } = useParams<{ tenant: string; slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const [product, setProduct] = useState<CustomProduct | null>(null);
  const [measurements, setMeasurements] = useState<MeasurementMaster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolvedImage, setResolvedImage] = useState<string>('');
  const [step, setStep] = useState<'measurements' | 'summary'>('measurements');
  const [enteredMeasurements, setEnteredMeasurements] = useState<Record<string, string>>({});

  useEffect(() => {
    if (tenant && slug) {
      loadProduct();
      loadMeasurements();
    }
  }, [tenant, slug]);

  // Resolve product image (supabase:// → signed URL)
  useEffect(() => {
    const resolveImage = async () => {
      if (!product?.image_url) return;
      
      const resolved = await getImageUrl(product.image_url);
      if (resolved) {
        setResolvedImage(resolved);
      }
    };

    resolveImage();
  }, [product?.image_url]);

  const loadProduct = async () => {
    if (!tenant || !slug) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('custom_products')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error: any) {
      console.error('Error loading custom product:', error);
      toast.error('Custom product not found');
      navigate(`/${tenant}/custom-order`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMeasurements = async () => {
    try {
      const { data, error } = await supabase
        .from('measurement_master')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMeasurements(data || []);
    } catch (error: any) {
      console.error('Error loading measurements:', error);
    }
  };

  const getSelectedMeasurements = () => {
    if (!product?.measurement_keys) return [];
    return product.measurement_keys
      .map(key => measurements.find(m => m.key === key))
      .filter(Boolean) as MeasurementMaster[];
  };

  const handleMeasurementChange = (key: string, value: string) => {
    setEnteredMeasurements(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmitMeasurements = async () => {
    const selectedMeasurements = getSelectedMeasurements();
    
    // Validate required fields
    for (const m of selectedMeasurements) {
      if (m.is_required && !enteredMeasurements[m.key]?.trim()) {
        toast.error(`${m.label} is required`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Log measurement data
      const measurementData = {
        product_id: product?.id,
        product_name: product?.name,
        product_slug: product?.slug,
        base_price: product?.base_price,
        measurements: enteredMeasurements,
        timestamp: new Date().toISOString(),
      };
      
      console.log('Measurement submission:', measurementData);
      toast.success('Measurements confirmed!');
      setStep('summary');
    } catch (error: any) {
      console.error('Error processing measurements:', error);
      toast.error('Error processing measurements');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMeasurements = () => {
    setStep('measurements');
  };

  const handleConfirmAndContinue = async () => {
    // Check authentication first
    if (!user) {
      // Store redirect path for after login
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate(`/${tenant}/login`);
      toast.info('Please login to proceed with checkout');
      return;
    }

    if (!tenant) {
      toast.error('Tenant information missing');
      return;
    }

    try {
      // Create cart item with custom product data
      const cartItem = {
        product_id: product!.id,
        name: product!.name,
        price: product!.base_price,
        image: resolvedImage || product!.image_url || '',
        quantity: 1, // Custom products are typically quantity 1
        slug: product!.slug,
        custom_data: {
          measurements: enteredMeasurements,
          is_custom: true,
          category: product!.category,
        },
      };

      // Add to cart using existing cart store
      addItem(cartItem);
      toast.success('Custom product added to cart');

      // Navigate to checkout (reuses existing route)
      navigate(`/${tenant}/product-checkout`);
    } catch (error: any) {
      console.error('Error proceeding to checkout:', error);
      toast.error('Failed to proceed to checkout');
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
        <Button variant="ghost" asChild className="mb-8">
          <Link to={`/${tenant}/custom-order`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Custom Products
          </Link>
        </Button>
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">Custom product not found</p>
        </div>
      </div>
    );
  }

  const selectedMeasurements = getSelectedMeasurements();

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-8">
        <Link to={`/${tenant}/custom-order`}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Custom Products
        </Link>
      </Button>

      {/* Product Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="bg-muted rounded-lg overflow-hidden aspect-[3/4] flex items-center justify-center">
          {product.image_url ? (
            <img
              src={resolvedImage || product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-muted-foreground">No Image</div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-between">
          {/* Header */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
            <h1 className="text-3xl md:text-4xl font-semibold mb-4">{product.name}</h1>

            {/* Price */}
            <div className="mb-6">
              <p className="text-2xl font-bold text-primary">
                ₹{product.base_price.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Base price (customizations may apply)</p>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h2 className="font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Measurements Step */}
            {step === 'measurements' && selectedMeasurements.length > 0 && (
              <div className="mb-6">
                <h2 className="font-semibold mb-4">Enter Your Measurements</h2>
                <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
                  {selectedMeasurements.map((m) => (
                    <div key={m.key}>
                      <Label htmlFor={m.key}>
                        {m.label}
                        {m.is_required && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id={m.key}
                          type="number"
                          placeholder="Enter value"
                          value={enteredMeasurements[m.key] || ''}
                          onChange={(e) => handleMeasurementChange(m.key, e.target.value)}
                          disabled={isSubmitting}
                          min="0"
                          step="0.1"
                        />
                        <span className="flex items-center text-sm text-muted-foreground whitespace-nowrap">
                          {m.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Step */}
            {step === 'summary' && (
              <div className="mb-6 space-y-4 p-4 bg-secondary/20 rounded-lg border border-border">
                <h2 className="font-semibold text-lg">Order Summary</h2>
                
                {/* Summary Items */}
                <div className="space-y-3">
                  <div className="flex justify-between items-start pb-3 border-b border-border">
                    <span className="text-sm text-muted-foreground">Product</span>
                    <span className="font-medium text-right">{product.name}</span>
                  </div>
                  
                  <div className="flex justify-between items-start pb-3 border-b border-border">
                    <span className="text-sm text-muted-foreground">Base Price</span>
                    <span className="font-medium">₹{product.base_price.toLocaleString()}</span>
                  </div>

                  {selectedMeasurements.length > 0 && (
                    <div className="pb-3 border-b border-border">
                      <p className="text-sm text-muted-foreground mb-2">Measurements</p>
                      <div className="space-y-1 pl-2">
                        {selectedMeasurements.map((m) => (
                          <div key={m.key} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{m.label}</span>
                            <span className="font-medium">
                              {enteredMeasurements[m.key]} {m.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Video Button */}
            {product.measurement_video_url && (
              <Button
                asChild
                variant="outline"
                className="mb-6 w-full"
              >
                <a
                  href={product.measurement_video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  How to Measure (Watch Video)
                </a>
              </Button>
            )}
          </div>

          {/* CTA Section */}
          <div className="pt-6 border-t border-border space-y-3">
            {step === 'measurements' && selectedMeasurements.length > 0 && (
              <Button 
                onClick={handleSubmitMeasurements}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Continue to Summary'
                )}
              </Button>
            )}

            {step === 'summary' && (
              <>
                <Button 
                  onClick={handleConfirmAndContinue}
                  className="w-full"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Proceed to Checkout
                </Button>
                <Button 
                  onClick={handleEditMeasurements}
                  variant="outline"
                  className="w-full"
                >
                  Edit Measurements
                </Button>
              </>
            )}

            {selectedMeasurements.length === 0 && step === 'measurements' && (
              <div className="bg-secondary/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  No measurements needed for this product
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
