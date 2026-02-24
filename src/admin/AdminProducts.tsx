import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight, X, Upload, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import ProductPreview from './ProductPreview';
import { isSupabaseStorageImage, getImageUrl } from '@/lib/imageUtils';

interface Product {
  id: string;
  name: string;
  short_name?: string;
  slug: string;
  description?: string;
  price: number;
  shipping_cost?: number;
  category: string;
  stock_quantity: number;
  main_image_url?: string;
  images?: string[];
  shipping_returns_policy?: string;
  is_active: boolean;
}

const DEFAULT_POLICY = `Domestic delivery: 5 business days
International delivery: 7–9 business days
Order processing: Within 2 business days
Packaging: Double packed, waterproof + corrugated box

Important Information:
- Customer responsible for customs duties/taxes
- Remote Area Surcharge (RAS) communicated before shipping
- Seller not responsible for customs delays
- Minor color variations may occur due to photography or device settings

Return Policy:
Returns not available normally. Accepted only for admin-side issues. Unboxing video is mandatory. Return shipping borne by customer. For return requests, please email support.`;

export default function AdminProducts() {
  const { tenant } = useParams<{ tenant: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    short_name: '',
    category: '',
    price: 0,
    shipping_cost: 0,
    stock_quantity: 0,
    description: '',
    shipping_returns_policy: DEFAULT_POLICY,
    images: [],
    main_image_url: '',
    is_active: true,
  });
  const [imageInput, setImageInput] = useState('');
  const [resolvedAdminImages, setResolvedAdminImages] = useState<{[key: string]: string}>({});
  const [resolvedProductListImages, setResolvedProductListImages] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (tenant) {
      loadProducts();
    }
  }, [tenant]);

  // Resolve admin preview images (supabase:// → signed URLs)
  useEffect(() => {
    const resolveImages = async () => {
      const images = formData.images || [];
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (!resolvedAdminImages[img]) {
          const resolved = await getImageUrl(img);
          if (resolved) {
            setResolvedAdminImages(prev => ({ ...prev, [img]: resolved }));
          }
        }
      }
    };
    resolveImages();
  }, [formData.images, resolvedAdminImages]);

  // Resolve product list thumbnail images (supabase:// → signed URLs)
  useEffect(() => {
    const resolveProductImages = async () => {
      for (const product of products) {
        const imageRef = product.main_image_url || product.images?.[0];
        if (imageRef && !resolvedProductListImages[imageRef]) {
          const resolved = await getImageUrl(imageRef);
          if (resolved) {
            setResolvedProductListImages(prev => ({ ...prev, [imageRef]: resolved }));
          }
        }
      }
    };
    resolveProductImages();
  }, [products, resolvedProductListImages]);

  const loadProducts = async () => {
    if (!tenant) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('tenant', tenant)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
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

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        short_name: product.short_name || '',
        category: product.category || '',
        price: product.price || 0,
        stock_quantity: product.stock_quantity || 0,
        description: product.description || '',
        main_image_url: product.main_image_url || '',
        images: product.main_image_url ? [product.main_image_url] : [],
        is_active: product.is_active ?? true,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        short_name: '',
        category: '',
        price: 0,
        stock_quantity: 0,
        description: '',
        images: [],
        main_image_url: '',
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setImageInput('');
  };

  const validateForm = () => {
    const required = ['name', 'category', 'price', 'stock_quantity'];
    for (const field of required) {
      if (!formData[field as keyof Product] || (typeof formData[field as keyof Product] === 'number' && formData[field as keyof Product] === 0 && field === 'price')) {
        toast.error(`Please fill in ${field.replace(/_/g, ' ')}`);
        return false;
      }
    }
    // Images are optional now
    return true;
  };

  const handleAddImage = async (fileToUpload?: File) => {
    if (imageInput.trim()) {
      // URL input mode - add HTTP URL directly
      const images = [...(formData.images || [])];
      const imageUrl = imageInput.trim();
      
      if (!images.includes(imageUrl)) {
        images.push(imageUrl);
        const updatedFormData = { ...formData, images };
        if (!formData.main_image_url) {
          updatedFormData.main_image_url = imageUrl;
        }
        setFormData(updatedFormData);
        setImageInput('');
        toast.success('Image URL added');
      } else {
        toast.error('Image already exists');
      }
    } else if (fileToUpload) {
      // File upload mode - upload to Supabase Storage
      try {
        // Validate file
        const maxSizeBytes = 10 * 1024 * 1024; // 10MB
        if (fileToUpload.size > maxSizeBytes) {
          toast.error(`File too large. Maximum size: 10MB. Your file: ${(fileToUpload.size / 1024 / 1024).toFixed(1)}MB`);
          return;
        }

        // Generate unique filename using UUID
        const fileExtension = fileToUpload.name.split('.').pop() || 'jpg';
        const uniqueFilename = `${crypto.randomUUID()}.${fileExtension}`;

        // Upload to Supabase Storage
        console.log('Uploading file to storage:', uniqueFilename);
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(uniqueFilename, fileToUpload, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) {
          console.error('Storage upload error:', error);
          toast.error(`Upload failed: ${error.message}`);
          return;
        }

        // Create supabase:// reference
        const imageReference = `supabase://product-images/${data.path}`;
        console.log('File uploaded successfully:', imageReference);

        // Add reference to images array
        const images = [...(formData.images || [])];
        images.push(imageReference);
        const updatedFormData = { ...formData, images };
        
        // Set as main image if it's the first one
        if (!formData.main_image_url) {
          updatedFormData.main_image_url = imageReference;
        }
        
        setFormData(updatedFormData);
        toast.success('Image uploaded successfully');
      } catch (error: any) {
        console.error('Image upload error:', error);
        toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const images = [...(formData.images || [])];
    const removed = images.splice(index, 1)[0];
    if (formData.main_image_url === removed) {
      setFormData({ ...formData, images, main_image_url: images[0] || '' });
    } else {
      setFormData({ ...formData, images });
    }
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    const images = [...(formData.images || [])];
    if (direction === 'left' && index > 0) {
      [images[index], images[index - 1]] = [images[index - 1], images[index]];
    } else if (direction === 'right' && index < images.length - 1) {
      [images[index], images[index + 1]] = [images[index + 1], images[index]];
    }
    if (index === 0 && direction === 'left') {
      setFormData({ ...formData, images, main_image_url: images[0] });
    }
    setFormData({ ...formData, images });
  };

  const handleSetMainImage = (index: number) => {
    const images = [...(formData.images || [])];
    setFormData({ ...formData, main_image_url: images[index] });
    toast.success('Main image updated');
  };

  const handleSave = async () => {
    // Prevent multiple submissions
    if (isSaving) {
      console.warn('Save already in progress, ignoring duplicate click');
      return;
    }

    if (!validateForm() || !tenant) return;

    setIsSaving(true);

    try {
      // Create sanitized payload with all required fields
      const slug = String(formData.name || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');

      const payload = {
        tenant: 'mizuki',
        name: String(formData.name || '').trim(),
        short_name: String(formData.short_name || '').trim(),
        slug: slug,
        category: String(formData.category || '').trim(),
        price: Number(formData.price) || 0,
        stock_quantity: Number(formData.stock_quantity) || 0,
        description: String(formData.description || '').trim(),
        main_image_url: String(formData.main_image_url || '').trim(),
        images: (formData.images || []).map(img => String(img).trim()).filter(img => img.length > 0),
        is_active: Boolean(formData.is_active ?? true),
      };

      console.log('Inserting product payload:', payload);

      try {
        if (editingProduct) {
          const { error } = await Promise.race([
            supabase
              .from('products')
              .update(payload)
              .eq('id', editingProduct.id),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Save timeout - taking too long')), 10000)
            ),
          ]);

          if (error) {
            console.error('Supabase update error:', error.code, error.message, error.details);
            throw error;
          }
          console.log('Product updated successfully');
          toast.success('Product updated');
        } else {
          const { data, error } = await Promise.race([
            supabase
              .from('products')
              .insert([payload]),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Save timeout - taking too long')), 10000)
            ),
          ]);

          if (error) {
            console.error('Supabase insert error:', {
              code: error.code,
              message: error.message,
              details: error.details,
              payload: payload,
            });
            throw error;
          }
          console.log('Product inserted successfully:', data);
          toast.success('Product created');
        }

        handleCloseModal();
        await loadProducts();
      } catch (error: any) {
        console.error('Error saving product:', error);
        toast.error(`Failed to save product: ${error.message || 'Unknown error'}`);
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
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Product deleted');
      loadProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
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
          <h1 className="text-2xl font-semibold mb-1">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Products Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Thumbnail</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Stock</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Price</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No products found. Add your first product!
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-muted">
                        {product.main_image_url || product.images?.[0] ? (
                          <img
                            src={resolvedProductListImages[product.main_image_url || product.images?.[0]!] || product.main_image_url || product.images?.[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
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
                        {product.short_name && (
                          <p className="text-sm text-muted-foreground">{product.short_name}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.stock_quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">₹{product.price.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewProduct(product)}
                          title="Preview product"
                          aria-label="Preview product"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
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
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update product information' : 'Fill in all mandatory fields to create a new product'}
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
                <Label htmlFor="short_name">Short Name</Label>
                <Input
                  id="short_name"
                  value={formData.short_name || ''}
                  onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                  placeholder="Short name for cards"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Saree, Blouse"
                />
              </div>
              <div>
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price || 0}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  value={formData.stock_quantity || 0}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="shipping_cost">Shipping Cost (₹)</Label>
                <Input
                  id="shipping_cost"
                  type="number"
                  value={formData.shipping_cost || 0}
                  onChange={(e) => setFormData({ ...formData, shipping_cost: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  step="0.01"
                />
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color || ''}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="Product color"
                />
              </div>
              <div>
                <Label htmlFor="base_code">Base Code</Label>
                <Input
                  id="base_code"
                  value={formData.base_code || ''}
                  onChange={(e) => setFormData({ ...formData, base_code: e.target.value })}
                  placeholder="Product code"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description"
                rows={4}
              />
            </div>

            {/* Image Management */}
            <div>
              <Label>Images * (Add image URLs or upload files)</Label>
              <div className="flex gap-2 mt-2 flex-col">
                <div className="flex gap-2">
                  <Input
                    placeholder="Paste image URL here (e.g., https://example.com/image.jpg)"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddImage()}
                  />
                  <Button type="button" onClick={handleAddImage} variant="default">
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
                    className="hidden"
                    onChange={async (e) => {
                      if (e.target.files?.[0]) {
                        await handleAddImage(e.target.files[0]);
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 Upload: max 10MB per file | Link: paste direct HTTPS URLs from any source
                </p>
              </div>

              {formData.images && formData.images.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.images.map((img, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border border-border rounded-md">
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <img src={resolvedAdminImages[img] || img} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Image {index + 1}
                          {formData.main_image_url === img && (
                            <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">Main</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveImage(index, 'left')}
                          disabled={index === 0}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveImage(index, 'right')}
                          disabled={index === formData.images!.length - 1}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                        {formData.main_image_url !== img && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetMainImage(index)}
                          >
                            Set Main
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveImage(index)}
                          className="text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Policy Template */}
            <div>
              <Label htmlFor="shipping_returns_policy">Shipping & Returns Policy</Label>
              <Textarea
                id="shipping_returns_policy"
                value={formData.shipping_returns_policy || DEFAULT_POLICY}
                onChange={(e) => setFormData({ ...formData, shipping_returns_policy: e.target.value })}
                rows={8}
              />
              <p className="text-xs text-muted-foreground mt-1">
                This policy is auto-filled but can be edited per product
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
                <>{editingProduct ? 'Update' : 'Create'} Product</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Preview Modal */}
      {previewProduct && (
        <ProductPreview
          product={previewProduct}
          onClose={() => setPreviewProduct(null)}
        />
      )}
    </div>
  );
}
