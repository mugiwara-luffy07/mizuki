import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/supabase-client';
import { useAuthStore } from './authStore';

export interface WishlistItem {
  product_id: string;
  name: string;
  price: number;
  image: string;
  slug?: string;
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  syncToDatabase: (tenant: string) => Promise<void>;
  loadFromDatabase: (tenant: string) => Promise<void>;
}

const WISHLIST_STORAGE_KEY = 'wishlist_items';

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addItem: (item: WishlistItem) => {
        const items = get().items;
        if (!items.find(i => i.product_id === item.product_id)) {
          set({ items: [...items, item] });
        }
      },

      removeItem: (productId: string) => {
        set({ items: get().items.filter(i => i.product_id !== productId) });
      },

      isInWishlist: (productId: string) => {
        return get().items.some(i => i.product_id === productId);
      },

      clearWishlist: () => {
        set({ items: [] });
      },

      syncToDatabase: async (tenant: string) => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        set({ isLoading: true });
        try {
          const items = get().items;
          
          // Clear existing wishlist items
          await supabase
            .from('wishlist')
            .delete()
            .eq('user_id', user.id)
            .eq('tenant', tenant);

          // Insert new items
          if (items.length > 0) {
            const wishlistItems = items.map(item => ({
              user_id: user.id,
              tenant,
              product_id: item.product_id,
            }));

            const { error } = await supabase
              .from('wishlist')
              .insert(wishlistItems);

            if (error) throw error;
          }
        } catch (error) {
          console.error('Error syncing wishlist to database:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      loadFromDatabase: async (tenant: string) => {
        const { user } = useAuthStore.getState();
        if (!user) {
          // Load from localStorage for guest users
          const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
          if (stored) {
            try {
              set({ items: JSON.parse(stored) });
            } catch (e) {
              console.error('Error loading wishlist from localStorage:', e);
            }
          }
          return;
        }

        set({ isLoading: true });
        try {
          const { data, error } = await supabase
            .from('wishlist')
            .select(`
              product_id,
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
            const items: WishlistItem[] = data.map((item: any) => ({
              product_id: item.product_id,
              name: item.products?.name || '',
              price: item.products?.price || 0,
              image: item.products?.main_image_url || item.products?.images?.[0] || '',
              slug: item.products?.slug,
            }));

            set({ items });
          }
        } catch (error) {
          console.error('Error loading wishlist from database:', error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: WISHLIST_STORAGE_KEY,
      partialize: (state) => ({ items: state.items }),
    }
  )
);













