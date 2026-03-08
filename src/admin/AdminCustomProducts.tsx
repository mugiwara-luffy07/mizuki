import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Edit, Trash2, X, Upload, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
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

interface MeasurementMaster {
  id: string;
  key: string;
  label: string;
  unit: string;
  is_required: boolean;
}

export default function AdminCustomProducts() {
  const { tenant } = useParams<{ tenant: string }>();
  const MAX_IMAGES = 10;
  const [products, setProducts] = useState<CustomProduct[]>([]);
  const [measurements, setMeasurements] = useState<MeasurementMaster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CustomProduct | null>(null);
  const [formData, setFormData] = useState<Partial<CustomProduct>>({
    name: '',
    category: '',
    fabric: '',
    sub_category: '',
    variety: '',
    design: '',
    option1: '',
    option2: '',
    option3: '',
    colors: [],
    images: [],
    base_price: 0,
    description: '',
    image_url: '',
    measurement_keys: [],
    measurement_video_url: '',
    is_active: true,
  });
  const [colorInput, setColorInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [resolvedAdminImage, setResolvedAdminImage] = useState<string>('');
  const [resolvedModalImages, setResolvedModalImages] = useState<{[key: string]: string}>({});
  const [resolvedProductListImages, setResolvedProductListImages] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (tenant) {
      loadMeasurements();
      loadProducts();
    }
  }, [tenant]);

  // Resolve admin preview image (supabase:// → signed URL)
  useEffect(() => {
    const resolveImage = async () => {
      if (formData.image_url && !resolvedAdminImage) {
        const resolved = await getImageUrl(formData.image_url);
        if (resolved) {
          setResolvedAdminImage(resolved);
        }
      } else if (!formData.image_url) {
        setResolvedAdminImage('');
      }
    };
    resolveImage();
  }, [formData.image_url, resolvedAdminImage]);

  useEffect(() => {
    const resolveModalImages = async () => {
      for (const imageUrl of imageUrls) {
        if (!imageUrl || resolvedModalImages[imageUrl]) continue;
        if (!imageUrl.startsWith('supabase://')) continue;

        const resolved = await getImageUrl(imageUrl);
        if (resolved) {
          setResolvedModalImages(prev => ({ ...prev, [imageUrl]: resolved }));
        }
      }
    };

    resolveModalImages();
  }, [imageUrls, resolvedModalImages]);

  // Resolve product list thumbnail images (supabase:// → signed URLs)
  useEffect(() => {
    const resolveProductImages = async () => {
      for (const product of products) {
        const primaryImageRef = (product.images && product.images.length > 0)
          ? product.images[0]
          : product.image_url;

        if (primaryImageRef && !resolvedProductListImages[primaryImageRef]) {
          const resolved = await getImageUrl(primaryImageRef);
          if (resolved) {
            setResolvedProductListImages(prev => ({ ...prev, [primaryImageRef]: resolved }));
          }
        }
      }
    };
    resolveProductImages();
  }, [products, resolvedProductListImages]);

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
      toast.error('Failed to load measurements');
    }
  };

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('custom_products')
        .select('*')
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

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleOpenModal = (product?: CustomProduct) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        category: product.category || '',
        fabric: product.fabric || '',
        sub_category: product.sub_category || '',
        variety: product.variety || '',
        design: product.design || '',
        option1: product.option1 || '',
        option2: product.option2 || '',
        option3: product.option3 || '',
        colors: product.colors || [],
        images: product.images || (product.image_url ? [product.image_url] : []),
        base_price: product.base_price || 0,
        description: product.description || '',
        image_url: product.image_url || '',
        measurement_keys: product.measurement_keys || [],
        measurement_video_url: product.measurement_video_url || '',
        is_active: product.is_active ?? true,
      });
      setImageUrls(product.images && product.images.length > 0 ? product.images : (product.image_url ? [product.image_url] : []));
      setResolvedAdminImage('');
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: '',
        fabric: '',
        sub_category: '',
        variety: '',
        design: '',
        option1: '',
        option2: '',
        option3: '',
        colors: [],
        images: [],
        base_price: 0,
        description: '',
        image_url: '',
        measurement_keys: [],
        measurement_video_url: '',
        is_active: true,
      });
      setImageUrls([]);
      setResolvedAdminImage('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setImageInput('');
    setImageUrls([]);
    setColorInput('');
    setResolvedAdminImage('');
    setResolvedModalImages({});
  };

  const validateForm = () => {
    const required = ['name', 'category', 'base_price'];
    for (const field of required) {
      if (!formData[field as keyof CustomProduct] || (typeof formData[field as keyof CustomProduct] === 'number' && formData[field as keyof CustomProduct] === 0 && field === 'base_price')) {
        toast.error(`Please fill in ${field.replace(/_/g, ' ')}`);
        return false;
      }
    }
    return true;
  };

  const handleAddImage = async (filesToUpload?: File[]) => {
    if (imageUrls.length >= MAX_IMAGES && !imageInput.trim()) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    if (imageInput.trim()) {
      // URL input mode - add HTTP URL directly
      const imageUrl = imageInput.trim();
      if (imageUrls.length >= MAX_IMAGES) {
        toast.error(`Maximum ${MAX_IMAGES} images allowed`);
        return;
      }
      const nextImageUrls = [...imageUrls, imageUrl];
      setImageUrls(nextImageUrls);
      setFormData({ ...formData, image_url: nextImageUrls[0] || '', images: nextImageUrls });
      setImageInput('');
      toast.success('Image URL added');
    } else if (filesToUpload && filesToUpload.length > 0) {
      // File upload mode - upload to Supabase Storage (same as products)
      try {
        const remainingSlots = MAX_IMAGES - imageUrls.length;
        const files = filesToUpload.slice(0, remainingSlots);

        if (filesToUpload.length > remainingSlots) {
          toast.error(`Only ${remainingSlots} more image(s) can be added`);
        }

        const uploadedReferences: string[] = [];

        for (const fileToUpload of files) {
          const maxSizeBytes = 10 * 1024 * 1024; // 10MB
          if (fileToUpload.size > maxSizeBytes) {
            toast.error(`File too large: ${fileToUpload.name} (max 10MB)`);
            continue;
          }

          const fileExtension = fileToUpload.name.split('.').pop() || 'jpg';
          const uniqueFilename = `${crypto.randomUUID()}.${fileExtension}`;

          console.log('Uploading file to storage:', uniqueFilename);
          const { data, error } = await supabase.storage
            .from('product-images')
            .upload(uniqueFilename, fileToUpload, {
              cacheControl: '3600',
              upsert: false,
            });

          if (error) {
            console.error('Storage upload error:', error);
            toast.error(`Upload failed for ${fileToUpload.name}: ${error.message}`);
            continue;
          }

          const imageReference = `supabase://product-images/${data.path}`;
          console.log('File uploaded successfully:', imageReference);
          uploadedReferences.push(imageReference);
        }

        if (uploadedReferences.length > 0) {
          const nextImageUrls = [...imageUrls, ...uploadedReferences].slice(0, MAX_IMAGES);
          setImageUrls(nextImageUrls);
          setFormData({ ...formData, image_url: nextImageUrls[0] || '', images: nextImageUrls });
          toast.success(`${uploadedReferences.length} image(s) uploaded successfully`);
        }
      } catch (error: any) {
        console.error('Image upload error:', error);
        toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const nextImageUrls = imageUrls.filter((_, index) => index !== indexToRemove);
    setImageUrls(nextImageUrls);
    setFormData({ ...formData, image_url: nextImageUrls[0] || '', images: nextImageUrls });
    setResolvedAdminImage('');
  };

  const handleMeasurementToggle = (key: string, isSelected: boolean) => {
    const measurementKeys = [...(formData.measurement_keys || [])];
    if (isSelected) {
      if (!measurementKeys.includes(key)) {
        measurementKeys.push(key);
      }
    } else {
      const index = measurementKeys.indexOf(key);
      if (index > -1) {
        measurementKeys.splice(index, 1);
      }
    }
    setFormData({ ...formData, measurement_keys: measurementKeys });
  };

  const handleAddColor = () => {
    const color = colorInput.trim();
    if (!color) return;

    const existingColors = formData.colors || [];
    const alreadyExists = existingColors.some(c => c.toLowerCase() === color.toLowerCase());
    if (alreadyExists) {
      toast.error('Color already added');
      return;
    }

    setFormData({ ...formData, colors: [...existingColors, color] });
    setColorInput('');
  };

  const handleRemoveColor = (colorToRemove: string) => {
    setFormData({
      ...formData,
      colors: (formData.colors || []).filter(color => color !== colorToRemove),
    });
  };

  const handleSave = async () => {
    // Prevent multiple submissions
    if (isSaving) {
      console.warn('Save already in progress, ignoring duplicate click');
      return;
    }

    if (!validateForm()) return;

    setIsSaving(true);

    try {
      // Create sanitized payload
      const slug = String(formData.name || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');

      const payload = {
        name: String(formData.name || '').trim(),
        slug: slug,
        category: String(formData.category || '').trim(),
        fabric: String(formData.fabric || '').trim(),
        sub_category: String(formData.sub_category || '').trim(),
        variety: String(formData.variety || '').trim(),
        design: String(formData.design || '').trim(),
        option1: String(formData.option1 || '').trim(),
        option2: String(formData.option2 || '').trim(),
        option3: String(formData.option3 || '').trim(),
        colors: (formData.colors || []).map(c => String(c).trim()).filter(Boolean),
        images: imageUrls.map(url => String(url).trim()).filter(Boolean),
        base_price: Number(formData.base_price) || 0,
        description: String(formData.description || '').trim(),
        image_url: String((imageUrls[0] || formData.image_url || '')).trim(),
        measurement_keys: (formData.measurement_keys || []).map(k => String(k).trim()),
        measurement_video_url: String(formData.measurement_video_url || '').trim(),
        is_active: Boolean(formData.is_active ?? true),
      };

      console.log('Saving custom product payload:', payload);

      try {
        if (editingProduct) {
          const { error } = await Promise.race([
            supabase
              .from('custom_products')
              .update(payload)
              .eq('id', editingProduct.id),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Save timeout - taking too long')), 10000)
            ),
          ]) as any;

          if (error) {
            console.error('Supabase update error:', error.code, error.message, error.details);
            throw error;
          }
          console.log('Custom product updated successfully');
          toast.success('Custom product updated');
        } else {
          const { data, error } = await Promise.race([
            supabase
              .from('custom_products')
              .insert([payload]),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Save timeout - taking too long')), 10000)
            ),
          ]) as any;

          if (error) {
            console.error('Supabase insert error:', {
              code: error.code,
              message: error.message,
              details: error.details,
              payload: payload,
            });
            throw error;
          }
          console.log('Custom product inserted successfully:', data);
          toast.success('Custom product created');
        }

        handleCloseModal();
        await loadProducts();
      } catch (error: any) {
        console.error('Error saving custom product:', error);
        toast.error(`Failed to save custom product: ${error.message || 'Unknown error'}`);
        setIsSaving(false);
        return;
      }

      setIsSaving(false);
    } finally {
      // Ensure isSaving is reset in all cases
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom product?')) return;

    try {
      const { error } = await supabase
        .from('custom_products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Custom product deleted');
      loadProducts();
    } catch (error: any) {
      console.error('Error deleting custom product:', error);
      toast.error('Failed to delete custom product');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Custom Products</h1>
          <p className="text-muted-foreground">Manage bespoke/customizable products</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Custom Product
        </Button>
      </div>

      {/* Custom Products Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Thumbnail</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Base Price</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Measurements</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No custom products found. Add your first custom product!
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-muted">
                        {((product.images && product.images[0]) || product.image_url) ? (
                          (() => {
                            const primaryImageRef = (product.images && product.images.length > 0)
                              ? product.images[0]
                              : product.image_url;
                            if (!primaryImageRef) {
                              return (
                                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                  No Image
                                </div>
                              );
                            }

                            const displayUrl = resolvedProductListImages[primaryImageRef] || (!primaryImageRef.startsWith('supabase://') ? primaryImageRef : '');
                            return displayUrl ? (
                              <img
                                src={displayUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                Loading...
                              </div>
                            );
                          })()
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                            No Image
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">₹{product.base_price.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {product.measurement_keys.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {product.measurement_keys.map((key) => {
                            const measurement = measurements.find(m => m.key === key);
                            return (
                              <span key={key} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                                {measurement?.label || key}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">None</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenModal(product)}
                          title="Edit product"
                          aria-label="Edit product"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          className="text-destructive hover:text-destructive"
                          title="Delete product"
                          aria-label="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Custom Product' : 'Add Custom Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update custom product information' : 'Fill in all mandatory fields to create a new custom product'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full product name"
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Custom Saree, Bespoke Blouse"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="sub_category">Sub Category</Label>
                <Input
                  id="sub_category"
                  value={formData.sub_category || ''}
                  onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                  placeholder="e.g., Bridal, Party Wear"
                />
              </div>
              <div>
                <Label htmlFor="variety">Variety</Label>
                <Input
                  id="variety"
                  value={formData.variety || ''}
                  onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                  placeholder="e.g., Handloom"
                />
              </div>
              <div>
                <Label htmlFor="design">Design</Label>
                <Input
                  id="design"
                  value={formData.design || ''}
                  onChange={(e) => setFormData({ ...formData, design: e.target.value })}
                  placeholder="e.g., Floral"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="option1">Option 1</Label>
                <Input
                  id="option1"
                  value={formData.option1 || ''}
                  onChange={(e) => setFormData({ ...formData, option1: e.target.value })}
                  placeholder="Option 1 (e.g., Neck Style)"
                />
              </div>
              <div>
                <Label htmlFor="option2">Option 2</Label>
                <Input
                  id="option2"
                  value={formData.option2 || ''}
                  onChange={(e) => setFormData({ ...formData, option2: e.target.value })}
                  placeholder="Option 2 (e.g., Sleeve Style)"
                />
              </div>
              <div>
                <Label htmlFor="option3">Option 3</Label>
                <Input
                  id="option3"
                  value={formData.option3 || ''}
                  onChange={(e) => setFormData({ ...formData, option3: e.target.value })}
                  placeholder="Option 3 (e.g., Back Style)"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="fabric">Fabric</Label>
                <Input
                  id="fabric"
                  value={formData.fabric || ''}
                  onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                  placeholder="e.g., Silk"
                />
              </div>
            </div>

            <div>
              <Label>Colors</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddColor();
                    }
                  }}
                  placeholder="Enter color (e.g., Red)"
                />
                <Button type="button" onClick={handleAddColor} variant="outline">
                  Add Color
                </Button>
              </div>

              {(formData.colors || []).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {(formData.colors || []).map((color) => (
                    <span
                      key={color}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-secondary text-secondary-foreground text-sm"
                    >
                      {color}
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(color)}
                        className="hover:text-destructive"
                        aria-label={`Remove ${color}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="base_price">Base Price (₹) *</Label>
                <Input
                  id="base_price"
                  type="number"
                  value={formData.base_price ?? ''}
                  onFocus={() => {
                    if (formData.base_price === 0) {
                      setFormData({ ...formData, base_price: undefined });
                    }
                  }}
                  onChange={(e) => {
                    if (e.target.value === '') {
                      setFormData({ ...formData, base_price: undefined });
                      return;
                    }
                    const nextValue = parseFloat(e.target.value);
                    setFormData({ ...formData, base_price: Number.isNaN(nextValue) ? undefined : nextValue });
                  }}
                  onBlur={(e) => {
                    if (e.target.value === '') {
                      setFormData({ ...formData, base_price: 0 });
                    }
                  }}
                  placeholder="0"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="is_active">Status</Label>
                <select
                  id="is_active"
                  value={formData.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Product description..."
              />
            </div>

            {/* Image Management */}
            <div>
              <Label>Product Image (Single image, optional)</Label>
              <div className="flex gap-2 mt-2 flex-col">
                <div className="flex gap-2">
                  <Input
                    placeholder="Paste image URL here (e.g., https://example.com/image.jpg)"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddImage()}
                  />
                  <Button type="button" onClick={() => handleAddImage()} variant="default">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Add URL
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        await handleAddImage(Array.from(e.target.files));
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 Upload: max 10 images, 10MB per file | Link: paste direct HTTPS URLs
                </p>
              </div>

              {imageUrls.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Product Images ({imageUrls.length}/{MAX_IMAGES})</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {imageUrls.map((imageUrl, index) => (
                      <div key={`${imageUrl}-${index}`} className="flex items-center gap-2 p-2 border border-border rounded-md">
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          {(() => {
                            const resolved = index === 0 ? resolvedAdminImage : resolvedModalImages[imageUrl];
                            const displayUrl = resolved || (!imageUrl.startsWith('supabase://') ? imageUrl : '');

                            return displayUrl ? (
                              <img
                                src={displayUrl}
                                alt={`Product ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
                                Loading...
                              </div>
                            );
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium">{index === 0 ? 'Primary' : `Image ${index + 1}`}</p>
                          <p className="text-xs text-muted-foreground truncate">{imageUrl}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveImage(index)}
                          className="text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Measurements Selection */}
            <div>
              <Label>Measurements Available for This Product</Label>
              <p className="text-xs text-muted-foreground mb-3">Select which measurements customers should provide</p>
              <div className="grid grid-cols-2 gap-3 border border-border rounded-md p-4 bg-muted/30">
                {measurements.length === 0 ? (
                  <p className="text-sm text-muted-foreground col-span-2">No measurements available. Please add some first.</p>
                ) : (
                  measurements.map((measurement) => (
                    <label key={measurement.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.measurement_keys?.includes(measurement.key) || false}
                        onChange={(e) => handleMeasurementToggle(measurement.key, e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">
                        {measurement.label}
                        {measurement.is_required && <span className="text-destructive ml-1">*</span>}
                        <span className="text-xs text-muted-foreground ml-1">({measurement.unit})</span>
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Video URL */}
            <div>
              <Label htmlFor="measurement_video_url">Measurement Guide Video URL (YouTube link)</Label>
              <Input
                id="measurement_video_url"
                value={formData.measurement_video_url || ''}
                onChange={(e) => setFormData({ ...formData, measurement_video_url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Paste YouTube link for measurement instructions (optional)
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={handleCloseModal} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editingProduct ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>{editingProduct ? 'Update' : 'Create'} Custom Product</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
