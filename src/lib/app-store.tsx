// ============================================
// RESTAURANT OS - Global App Store
// Synchronized data across Admin, Customer, and Driver views
// ============================================

'use client';

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCartStore, CartItem } from './cart-store';
import { fetchWithAuth } from './api-client';

// ============================================
// Types
// ============================================

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  coverImage?: string;
  description?: string;
  currency?: string;
  currencySymbol?: string;
  openingHours?: Record<string, { open: string; close: string }>;
  deliveryZones?: Array<{
    id: string;
    name: string;
    fee: number;
    minOrder?: number;
  }>;
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  itemCount?: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  discountPrice?: number;
  image?: string;
  prepTime?: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  isNew: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isHalal?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
  spicyLevel?: number;
  calories?: number;
  category?: MenuCategory;
}

export interface OrderItem {
  id: string;
  itemName: string;
  itemImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status?: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  restaurantId: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  orderType: 'DELIVERY' | 'DINE_IN' | 'TAKEAWAY';
  source: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  tableNumber?: string;
  subtotal: number;
  discount?: number;
  deliveryFee?: number;
  tax?: number;
  total: number;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryNotes?: string;
  notes?: string;
  createdAt: Date | string;
  confirmedAt?: Date | string;
  preparingAt?: Date | string;
  readyAt?: Date | string;
  pickedUpAt?: Date | string;
  deliveredAt?: Date | string;
  completedAt?: Date | string;
  cancelledAt?: Date | string;
  cancellationReason?: string;
  items: OrderItem[];
  delivery?: DeliveryInfo;
}

export type OrderStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'PREPARING' 
  | 'READY' 
  | 'OUT_FOR_DELIVERY' 
  | 'DELIVERED' 
  | 'COMPLETED' 
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface DeliveryInfo {
  id: string;
  status: string;
  driverId?: string;
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    avatar?: string;
    vehicleType?: string;
    vehiclePlate?: string;
    rating?: number;
  };
  pickupAddress?: string;
  dropoffAddress?: string;
  estimatedTime?: number;
  distance?: number;
}

export interface DriverDelivery {
  id: string;
  orderId: string;
  status: string;
  pickupAddress: string;
  dropoffAddress: string;
  dropoffNotes?: string;
  deliveryFee: number;
  driverEarning: number;
  tip: number;
  distance?: number;
  estimatedTime?: number;
  assignedAt?: Date | string;
  pickedUpAt?: Date | string;
  deliveredAt?: Date | string;
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    avatar?: string;
    vehicleType?: string;
    vehiclePlate?: string;
    currentLat?: number;
    currentLng?: number;
    isAvailable?: boolean;
  };
  order: {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    total: number;
    restaurant: {
      name: string;
      address: string;
      phone?: string;
    };
    items: Array<{ itemName: string; quantity: number }>;
  };
  createdAt: Date | string;
}

// ============================================
// ============================================

// ============================================
// Context Types
// ============================================

interface AppStoreContextType {
  // Restaurant
  restaurant: Restaurant | null;
  isLoadingRestaurant: boolean;
  
  // Menu Categories
  categories: MenuCategory[];
  isLoadingCategories: boolean;
  refetchCategories: () => void;
  
  // Menu Items
  menuItems: MenuItem[];
  isLoadingMenuItems: boolean;
  refetchMenuItems: () => void;
  getItemsByCategory: (categoryId: string) => MenuItem[];
  getPopularItems: () => MenuItem[];
  getFeaturedItems: () => MenuItem[];
  
  // Cart (from existing cart-store)
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  
  // Orders
  orders: Order[];
  isLoadingOrders: boolean;
  refetchOrders: () => void;
  getActiveOrders: () => Order[];
  getPastOrders: () => Order[];
  
  // Deliveries (for driver)
  deliveries: DriverDelivery[];
  isLoadingDeliveries: boolean;
  refetchDeliveries: () => void;
  getPendingDeliveries: () => DriverDelivery[];
  getActiveDelivery: () => DriverDelivery | null;
  
  // Sync
  syncAll: () => void;
}

// ============================================
// Context
// ============================================

const AppStoreContext = createContext<AppStoreContextType | null>(null);

// ============================================
// Provider
// ============================================

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  
  // Use existing cart store
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotal = useCartStore((state) => state.getTotal);
  const getItemCount = useCartStore((state) => state.getItemCount);
  
  // Restaurant Query
  const { data: restaurantData, isLoading: isLoadingRestaurant } = useQuery({
    queryKey: ['restaurant', 'kfm-delice'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/restaurants?slug=kfm-delice');
        const data = await res.json();
        if (data.success && data.data?.length > 0) {
          return data.data[0];
        }
        throw new Error('Restaurant not found');
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Categories Query
  const { data: categoriesData, isLoading: isLoadingCategories, refetch: refetchCategories } = useQuery({
    queryKey: ['menu-categories'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/menu-categories');
        if (!res.ok) {
          console.warn('Categories API returned', res.status);
          return [];
        }
        const data = await res.json();
        // Handle various response formats
        if (Array.isArray(data)) {
          return data;
        }
        if (data.success && data.data?.data && Array.isArray(data.data.data)) {
          return data.data.data;
        }
        if (data.success && Array.isArray(data.data)) {
          return data.data;
        }
        if (data.data && Array.isArray(data.data)) {
          return data.data;
        }
        if (data.error || data.success === false) {
          console.warn('Categories API error:', data.error || data.message);
          return [];
        }
        return [];
      } catch (err) {
        console.warn('Categories fetch error:', err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
  
  // Menu Items Query
  const { data: menuItemsData, isLoading: isLoadingMenuItems, refetch: refetchMenuItems } = useQuery({
    queryKey: ['menu-items'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/menu-items');
        if (!res.ok) {
          console.warn('Menu items API returned', res.status);
          return [];
        }
        const data = await res.json();
        // Handle various response formats
        if (Array.isArray(data)) {
          return data;
        }
        if (data.success && data.data?.data && Array.isArray(data.data.data)) {
          return data.data.data;
        }
        if (data.success && Array.isArray(data.data)) {
          return data.data;
        }
        if (data.data && Array.isArray(data.data)) {
          return data.data;
        }
        if (data.error || data.success === false) {
          console.warn('Menu items API error:', data.error || data.message);
          return [];
        }
        return [];
      } catch (err) {
        console.warn('Menu items fetch error:', err);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  
  // Orders Query
  const { data: ordersData, isLoading: isLoadingOrders, refetch: refetchOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      try {
        const res = await fetchWithAuth('/api/orders');
        if (!res.ok) {
          console.warn('Orders API returned', res.status);
          return [];
        }
        const data = await res.json();
        // Handle various response formats
        if (Array.isArray(data)) {
          return data;
        }
        if (data.success && data.data?.data && Array.isArray(data.data.data)) {
          return data.data.data;
        }
        if (data.success && Array.isArray(data.data)) {
          return data.data;
        }
        if (data.data && Array.isArray(data.data)) {
          return data.data;
        }
        // If it's an error response, return empty array
        if (data.error || data.success === false) {
          console.warn('Orders API error:', data.error || data.message);
          return [];
        }
        return [];
      } catch (error) {
        console.warn('Orders fetch error:', error);
        return [];
      }
    },
    staleTime: 30 * 1000, // 30 seconds for orders
  });
  
  // Deliveries Query
  const { data: deliveriesData, isLoading: isLoadingDeliveries, refetch: refetchDeliveries } = useQuery({
    queryKey: ['deliveries'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/deliveries');
        if (!res.ok) {
          console.warn('Deliveries API returned', res.status);
          return [];
        }
        const data = await res.json();
        // Handle various response formats
        if (Array.isArray(data)) {
          return data;
        }
        if (data.success && data.data?.data && Array.isArray(data.data.data)) {
          return data.data.data;
        }
        if (data.success && Array.isArray(data.data)) {
          return data.data;
        }
        if (data.data && Array.isArray(data.data)) {
          return data.data;
        }
        // If it's an error response, return empty array
        if (data.error || data.success === false) {
          console.warn('Deliveries API error:', data.error || data.message);
          return [];
        }
        return [];
      } catch (error) {
        console.warn('Deliveries fetch error:', error);
        return [];
      }
    },
    staleTime: 30 * 1000, // 30 seconds for deliveries
  });
  
  // Derived data
  const restaurant = restaurantData || [];
  const categories = categoriesData || [];
  const menuItems = menuItemsData || [];
  const orders = ordersData || [];
  const deliveries = deliveriesData || [];
  
  // Helper functions
  const getItemsByCategory = useCallback((categoryId: string) => {
    if (categoryId === 'all') return menuItems;
    return menuItems.filter(item => item.categoryId === categoryId);
  }, [menuItems]);
  
  const getPopularItems = useCallback(() => {
    return menuItems.filter(item => item.isPopular);
  }, [menuItems]);
  
  const getFeaturedItems = useCallback(() => {
    return menuItems.filter(item => item.isFeatured);
  }, [menuItems]);
  
  const getActiveOrders = useCallback(() => {
    return orders.filter(order => 
      !['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(order.status)
    );
  }, [orders]);
  
  const getPastOrders = useCallback(() => {
    return orders.filter(order => 
      ['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(order.status)
    );
  }, [orders]);
  
  const getPendingDeliveries = useCallback(() => {
    return deliveries.filter(d => d.status === 'PENDING' || d.status === 'SEARCHING_DRIVER');
  }, [deliveries]);
  
  const getActiveDelivery = useCallback(() => {
    return deliveries.find(d => 
      ['DRIVER_ASSIGNED', 'ARRIVED_AT_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED_AT_DROPOFF'].includes(d.status)
    ) || null;
  }, [deliveries]);
  
  // Sync all data
  const syncAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['menu-categories'] });
    queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['deliveries'] });
  }, [queryClient]);
  
  const value: AppStoreContextType = {
    // Restaurant
    restaurant,
    isLoadingRestaurant,
    
    // Categories
    categories,
    isLoadingCategories,
    refetchCategories,
    
    // Menu Items
    menuItems,
    isLoadingMenuItems,
    refetchMenuItems,
    getItemsByCategory,
    getPopularItems,
    getFeaturedItems,
    
    // Cart
    cart: cartItems,
    addToCart: addItem,
    removeFromCart: removeItem,
    updateCartQuantity: updateQuantity,
    clearCart,
    getCartTotal: getTotal,
    getCartCount: getItemCount,
    
    // Orders
    orders,
    isLoadingOrders,
    refetchOrders,
    getActiveOrders,
    getPastOrders,
    
    // Deliveries
    deliveries,
    isLoadingDeliveries,
    refetchDeliveries,
    getPendingDeliveries,
    getActiveDelivery,
    
    // Sync
    syncAll,
  };
  
  return (
    <AppStoreContext.Provider value={value}>
      {children}
    </AppStoreContext.Provider>
  );
}

// ============================================
// Hooks
// ============================================

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppStoreProvider');
  }
  return context;
}

export function useRestaurant() {
  const { restaurant, isLoadingRestaurant } = useAppStore();
  return { restaurant, isLoading: isLoadingRestaurant };
}

export function useMenu() {
  const { 
    categories, 
    menuItems, 
    isLoadingCategories, 
    isLoadingMenuItems,
    refetchCategories,
    refetchMenuItems,
    getItemsByCategory,
    getPopularItems,
    getFeaturedItems,
  } = useAppStore();
  
  return {
    categories,
    menuItems,
    isLoading: isLoadingCategories || isLoadingMenuItems,
    refetchCategories,
    refetchMenuItems,
    getItemsByCategory,
    getPopularItems,
    getFeaturedItems,
  };
}

export function useCart() {
  const { 
    cart, 
    addToCart, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart, 
    getCartTotal, 
    getCartCount 
  } = useAppStore();
  
  return {
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    total: getCartTotal(),
    count: getCartCount(),
  };
}

export function useOrders() {
  const { 
    orders, 
    isLoadingOrders, 
    refetchOrders, 
    getActiveOrders, 
    getPastOrders 
  } = useAppStore();
  
  return {
    orders,
    isLoading: isLoadingOrders,
    refetch: refetchOrders,
    activeOrders: getActiveOrders(),
    pastOrders: getPastOrders(),
  };
}

export function useDeliveries() {
  const { 
    deliveries, 
    isLoadingDeliveries, 
    refetchDeliveries, 
    getPendingDeliveries, 
    getActiveDelivery 
  } = useAppStore();
  
  return {
    deliveries,
    isLoading: isLoadingDeliveries,
    refetch: refetchDeliveries,
    pendingDeliveries: getPendingDeliveries(),
    activeDelivery: getActiveDelivery(),
  };
}

export function useSync() {
  const { syncAll, refetchOrders, refetchMenuItems, refetchCategories, refetchDeliveries } = useAppStore();
  
  return {
    syncAll,
    syncOrders: refetchOrders,
    syncMenu: refetchMenuItems,
    syncCategories: refetchCategories,
    syncDeliveries: refetchDeliveries,
  };
}