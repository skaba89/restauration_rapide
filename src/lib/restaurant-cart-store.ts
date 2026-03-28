// ============================================
// RESTAURANT CART STORE
// Per-restaurant cart with Zustand
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartMenuItem {
  id: string;
  name: string;
  price: number;
  image?: string | null;
  quantity: number;
  notes?: string;
  variantId?: string;
  variantName?: string;
  options?: Array<{
    optionId: string;
    optionName: string;
    valueId: string;
    valueName: string;
    price: number;
  }>;
}

export interface RestaurantCartState {
  restaurantId: string | null;
  restaurantSlug: string | null;
  items: CartMenuItem[];
  
  // Actions
  setRestaurant: (restaurantId: string, restaurantSlug: string) => void;
  addItem: (item: CartMenuItem, restaurantId: string, restaurantSlug: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateNotes: (id: string, notes: string) => void;
  clearCart: () => void;
  
  // Computed
  getSubtotal: () => number;
  getTotalItems: () => number;
  getItemById: (id: string) => CartMenuItem | undefined;
}

export const useRestaurantCartStore = create<RestaurantCartState>()(
  persist(
    (set, get) => ({
      restaurantId: null,
      restaurantSlug: null,
      items: [],
      
      setRestaurant: (restaurantId, restaurantSlug) => {
        const current = get();
        // Clear cart if switching to a different restaurant
        if (current.restaurantId && current.restaurantId !== restaurantId) {
          set({ restaurantId, restaurantSlug, items: [] });
        } else {
          set({ restaurantId, restaurantSlug });
        }
      },
      
      addItem: (item, restaurantId, restaurantSlug) => {
        set((state) => {
          // Clear cart if different restaurant
          if (state.restaurantId && state.restaurantId !== restaurantId) {
            return {
              restaurantId,
              restaurantSlug,
              items: [{ ...item, quantity: item.quantity || 1 }],
            };
          }
          
          // Generate unique key for item with options
          const itemKey = generateItemKey(item);
          
          // Check for existing item with same options
          const existingIndex = state.items.findIndex(
            (i) => generateItemKey(i) === itemKey
          );
          
          if (existingIndex >= 0) {
            // Update quantity
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + (item.quantity || 1),
            };
            return {
              restaurantId: restaurantId || state.restaurantId,
              restaurantSlug: restaurantSlug || state.restaurantSlug,
              items: updatedItems,
            };
          }
          
          // Add new item
          return {
            restaurantId: restaurantId || state.restaurantId,
            restaurantSlug: restaurantSlug || state.restaurantSlug,
            items: [...state.items, { ...item, quantity: item.quantity || 1 }],
          };
        });
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      
      updateQuantity: (id, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((item) => item.id !== id) };
          }
          return {
            items: state.items.map((item) =>
              item.id === id ? { ...item, quantity } : item
            ),
          };
        });
      },
      
      updateNotes: (id, notes) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, notes } : item
          ),
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getSubtotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const optionsTotal = (item.options || []).reduce(
            (sum, opt) => sum + opt.price,
            0
          );
          return total + (item.price + optionsTotal) * item.quantity;
        }, 0);
      },
      
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
      
      getItemById: (id) => {
        return get().items.find((item) => item.id === id);
      },
    }),
    {
      name: 'restaurant-public-cart',
    }
  )
);

// Helper to generate unique key for item with variants/options
function generateItemKey(item: CartMenuItem): string {
  const optionsKey = (item.options || [])
    .map((o) => `${o.optionId}:${o.valueId}`)
    .sort()
    .join('|');
  return `${item.id}:${item.variantId || ''}:${optionsKey}`;
}
