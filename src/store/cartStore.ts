import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/supabase-client';
import { useAuthStore } from './authStore';

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  slug?: string;
  shipping_cost?: number;
  custom_data?: Record<string, any>; // For custom products: measurements, etc.
}

const getBlouseStitchingVariant = (item: CartItem) => {
  return item.custom_data?.blouse_stitching || 'standard';
};

export const getCartItemMatchKey = (item: CartItem) => {
  return `${item.product_id}::${getBlouseStitchingVariant(item)}`;
};

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, blouseStitching?: string) => void;
  updateQuantity: (productId: string, quantity: number, blouseStitching?: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  syncToDatabase: (tenant: string) => Promise<void>;
  loadFromDatabase: (tenant: string) => Promise<void>;
}

const CART_STORAGE_KEY = 'cart_items';

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addItem: (item: CartItem) => {
        const items = get().items;
        const itemKey = getCartItemMatchKey(item);
        const existingItem = items.find(i => getCartItemMatchKey(i) === itemKey);
        
        if (existingItem) {
          set({
            items: items.map(i =>
              getCartItemMatchKey(i) === itemKey
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...items, item] });
        }
      },

      removeItem: (productId: string, blouseStitching?: string) => {
        set({
          items: get().items.filter(i => {
            const matchesProduct = i.product_id === productId;
            if (!matchesProduct) {
              return true;
            }

            if (blouseStitching === undefined) {
              return false;
            }

            return getBlouseStitchingVariant(i) !== blouseStitching;
          }),
        });
      },

      updateQuantity: (productId: string, quantity: number, blouseStitching?: string) => {
        if (quantity <= 0) {
          get().removeItem(productId, blouseStitching);
          return;
        }

        set({
          items: get().items.map(i =>
            i.product_id === productId &&
            (blouseStitching === undefined || getBlouseStitchingVariant(i) === blouseStitching)
              ? { ...i, quantity }
              : i
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      syncToDatabase: async (tenant: string) => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        set({ isLoading: true });
        try {
          const items = get().items;
          
          // Clear existing cart items
          await supabase
            .from('cart')
            .delete()
            .eq('user_id', user.id)
            .eq('tenant', tenant);

          // Insert new items
          if (items.length > 0) {
            const cartItems = items.map(item => ({
              user_id: user.id,
              tenant,
              product_id: item.product_id,
              quantity: item.quantity,
            }));

            const { error } = await supabase
              .from('cart')
              .insert(cartItems);

            if (error) throw error;
          }
        } catch (error) {
          console.error('Error syncing cart to database:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      loadFromDatabase: async (tenant: string) => {
        const { user } = useAuthStore.getState();
        if (!user) {
          // Load from localStorage for guest users
          const stored = localStorage.getItem(CART_STORAGE_KEY);
          if (stored) {
            try {
              set({ items: JSON.parse(stored) });
            } catch (e) {
              console.error('Error loading cart from localStorage:', e);
            }
          }
          return;
        }

        set({ isLoading: true });
        try {
          const { data, error } = await supabase
            .from('cart')
            .select(`
              product_id,
              quantity,
              products:product_id (
                name,
                price,
                main_image_url,
                images,
                slug
              )
            `)
            .eq('user_id', user.id)
            .eq('tenant', tenant);

          if (error) throw error;

          if (data) {
            const items: CartItem[] = data.map((item: any) => ({
              product_id: item.product_id,
              name: item.products?.name || '',
              price: item.products?.price || 0,
              image: item.products?.main_image_url || item.products?.images?.[0] || '',
              quantity: item.quantity,
              slug: item.products?.slug,
            }));

            set({ items });
          }
        } catch (error) {
          console.error('Error loading cart from database:', error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: CART_STORAGE_KEY,
      partialize: (state) => ({ items: state.items }),
    }
  )
);













