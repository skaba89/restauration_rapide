// ============================================
// RESTAURANT OS - Global App Store
// Synchronized data across Admin, Customer, and Driver views
// ============================================

'use client';

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCartStore, CartItem } from './cart-store';

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
// Demo Data
// ============================================

const DEMO_RESTAURANT: Restaurant = {
  id: 'kfm-delice-1',
  name: 'KFM DELICE',
  slug: 'kfm-delice',
  address: 'Kaloum, Conakry, Guinée',
  phone: '+224622000001',
  email: 'contact@kfm-delice.com',
  description: 'Restaurant africain authentique - Saveurs de Guinée',
  currency: 'GNF',
  currencySymbol: 'GNF',
  openingHours: {
    monday: { open: '08:00', close: '22:00' },
    tuesday: { open: '08:00', close: '22:00' },
    wednesday: { open: '08:00', close: '22:00' },
    thursday: { open: '08:00', close: '22:00' },
    friday: { open: '08:00', close: '23:00' },
    saturday: { open: '09:00', close: '23:00' },
    sunday: { open: '10:00', close: '21:00' },
  },
  deliveryZones: [
    { id: 'zone-1', name: 'Kaloum', fee: 5000 },
    { id: 'zone-2', name: 'Dixinn', fee: 7000 },
    { id: 'zone-3', name: 'Ratoma', fee: 8000 },
    { id: 'zone-4', name: 'Matam', fee: 8000 },
    { id: 'zone-5', name: 'Matoto', fee: 10000 },
  ],
};

const DEMO_CATEGORIES: MenuCategory[] = [
  { id: 'cat-1', name: 'Plats Ivoiriens', slug: 'plats-ivoiriens', description: 'Spécialités de Côte d\'Ivoire', icon: '🍽️', isActive: true, sortOrder: 1 },
  { id: 'cat-2', name: 'Plats Sénégalais', slug: 'plats-senegalais', description: 'Cuisine sénégalaise authentique', icon: '🍚', isActive: true, sortOrder: 2 },
  { id: 'cat-3', name: 'Plats Guinéens', slug: 'plats-guineens', description: 'Saveurs traditionnelles de Guinée', icon: '🥘', isActive: true, sortOrder: 3 },
  { id: 'cat-4', name: 'Grillades', slug: 'grillades', description: 'Viandes et poissons grillés', icon: '🍖', isActive: true, sortOrder: 4 },
  { id: 'cat-5', name: 'Fast Food', slug: 'fast-food', description: 'Burgers, tacos et plus', icon: '🍔', isActive: true, sortOrder: 5 },
  { id: 'cat-6', name: 'Accompagnements', slug: 'accompagnements', description: 'Frites, sauces et légumes', icon: '🍟', isActive: true, sortOrder: 6 },
  { id: 'cat-7', name: 'Boissons', slug: 'boissons', description: 'Jus frais et boissons', icon: '🥤', isActive: true, sortOrder: 7 },
  { id: 'cat-8', name: 'Desserts', slug: 'desserts', description: 'Douceurs et desserts', icon: '🍰', isActive: true, sortOrder: 8 },
];

const DEMO_MENU_ITEMS: MenuItem[] = [
  // Plats Ivoiriens
  { id: 'item-1', categoryId: 'cat-1', name: 'Attieké Poisson Grillé', slug: 'attieke-poisson-grille', price: 15000, description: 'Semoule de manioc avec poisson grillé et sauce tomate', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', prepTime: 20, isAvailable: true, isFeatured: true, isPopular: true, isNew: false },
  { id: 'item-2', categoryId: 'cat-1', name: 'Garba', slug: 'garba', price: 8000, description: 'Attieké au thon frit avec piment', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', prepTime: 15, isAvailable: true, isFeatured: true, isPopular: true, isNew: false, isSpicy: true, spicyLevel: 2 },
  { id: 'item-3', categoryId: 'cat-1', name: 'Kedjenou de Poulet', slug: 'kedjenou-de-poulet', price: 18000, description: 'Poulet braisé aux légumes dans une sauce épaisse', image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400', prepTime: 25, isAvailable: true, isFeatured: true, isPopular: true, isNew: false },
  { id: 'item-4', categoryId: 'cat-1', name: 'Alloco Sauce Graine', slug: 'alloco-sauce-graine', price: 10000, description: 'Bananes plantain frites avec sauce graine', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400', prepTime: 15, isAvailable: true, isFeatured: false, isPopular: true, isNew: false, isVegetarian: true },
  
  // Plats Sénégalais
  { id: 'item-5', categoryId: 'cat-2', name: 'Thiéboudienne', slug: 'thieboudienne', price: 15000, description: 'Riz au poisson et légumes, plat national sénégalais', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400', prepTime: 30, isAvailable: true, isFeatured: true, isPopular: true, isNew: false },
  { id: 'item-6', categoryId: 'cat-2', name: 'Yassa Poulet', slug: 'yassa-poulet', price: 16000, description: 'Poulet mariné au citron et oignons caramélisés', image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400', prepTime: 25, isAvailable: true, isFeatured: false, isPopular: true, isNew: true },
  { id: 'item-7', categoryId: 'cat-2', name: 'Mafé', slug: 'mafe', price: 14000, description: 'Ragoût de viande à la sauce d\'arachide', image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400', prepTime: 30, isAvailable: true, isFeatured: false, isPopular: false, isNew: false },
  
  // Plats Guinéens
  { id: 'item-8', categoryId: 'cat-3', name: 'Konkoé', slug: 'konkoe', price: 12000, description: 'Ragoût de poisson fumé aux légumes', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', prepTime: 25, isAvailable: true, isFeatured: true, isPopular: true, isNew: false },
  { id: 'item-9', categoryId: 'cat-3', name: 'Fou Fou', slug: 'fou-fou', price: 10000, description: 'Pâte de manioc avec sauce feuilles', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400', prepTime: 20, isAvailable: true, isFeatured: false, isPopular: false, isNew: false, isVegetarian: true },
  
  // Grillades
  { id: 'item-10', categoryId: 'cat-4', name: 'Brochettes de Poulet', slug: 'brochettes-poulet', price: 8000, description: 'Brochettes de poulet mariné grillées', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', prepTime: 15, isAvailable: true, isFeatured: true, isPopular: true, isNew: false },
  { id: 'item-11', categoryId: 'cat-4', name: 'Poulet Braisé', slug: 'poulet-braise', price: 15000, description: 'Demi-poulet grillé aux épices', image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400', prepTime: 20, isAvailable: true, isFeatured: false, isPopular: true, isNew: false },
  { id: 'item-12', categoryId: 'cat-4', name: 'Mix Grill', slug: 'mix-grill', price: 25000, description: 'Assortiment de viandes grillées', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', prepTime: 25, isAvailable: true, isFeatured: true, isPopular: false, isNew: true },
  
  // Fast Food
  { id: 'item-13', categoryId: 'cat-5', name: 'Burger Africain', slug: 'burger-africain', price: 12000, description: 'Burger avec sauce attiéké', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', prepTime: 15, isAvailable: true, isFeatured: false, isPopular: true, isNew: true },
  { id: 'item-14', categoryId: 'cat-5', name: 'Chawarma Poulet', slug: 'chawarma-poulet', price: 10000, description: 'Chawarma au poulet épicé', image: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=400', prepTime: 10, isAvailable: true, isFeatured: false, isPopular: true, isNew: false, isSpicy: true, spicyLevel: 1 },
  
  // Accompagnements
  { id: 'item-15', categoryId: 'cat-6', name: 'Frites', slug: 'frites', price: 5000, description: 'Frites maison croustillantes', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', prepTime: 10, isAvailable: true, isFeatured: false, isPopular: false, isNew: false, isVegetarian: true },
  { id: 'item-16', categoryId: 'cat-6', name: 'Attieké', slug: 'attieke', price: 4000, description: 'Semoule de manioc', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', prepTime: 5, isAvailable: true, isFeatured: false, isPopular: false, isNew: false, isVegetarian: true, isVegan: true },
  { id: 'item-17', categoryId: 'cat-6', name: 'Riz Blanc', slug: 'riz-blanc', price: 3000, description: 'Riz blanc parfumé', image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400', prepTime: 5, isAvailable: true, isFeatured: false, isPopular: false, isNew: false, isVegetarian: true, isVegan: true },
  
  // Boissons
  { id: 'item-18', categoryId: 'cat-7', name: 'Jus de Bissap', slug: 'jus-bissap', price: 3000, description: 'Jus naturel d\'hibiscus', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', prepTime: 3, isAvailable: true, isFeatured: true, isPopular: true, isNew: false, isVegetarian: true, isVegan: true },
  { id: 'item-19', categoryId: 'cat-7', name: 'Jus de Gingembre', slug: 'jus-gingembre', price: 3000, description: 'Jus de gingembre frais', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', prepTime: 3, isAvailable: true, isFeatured: false, isPopular: true, isNew: false, isVegetarian: true, isVegan: true },
  { id: 'item-20', categoryId: 'cat-7', name: 'Café Touba', slug: 'cafe-touba', price: 2000, description: 'Café épicé sénégalais', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', prepTime: 5, isAvailable: true, isFeatured: false, isPopular: false, isNew: true, isVegetarian: true, isVegan: true },
  { id: 'item-21', categoryId: 'cat-7', name: 'Ataya', slug: 'ataya', price: 2500, description: 'Thé vert à la menthe', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', prepTime: 5, isAvailable: true, isFeatured: false, isPopular: false, isNew: false, isVegetarian: true, isVegan: true },
  
  // Desserts
  { id: 'item-22', categoryId: 'cat-8', name: 'Thiakry', slug: 'thiakry', price: 5000, description: 'Semoule sucrée au lait', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400', prepTime: 5, isAvailable: true, isFeatured: false, isPopular: true, isNew: false, isVegetarian: true },
  { id: 'item-23', categoryId: 'cat-8', name: 'Fruits Frais', slug: 'fruits-frais', price: 6000, description: 'Assortiment de fruits de saison', image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400', prepTime: 5, isAvailable: true, isFeatured: false, isPopular: false, isNew: false, isVegetarian: true, isVegan: true },
  { id: 'item-24', categoryId: 'cat-8', name: 'Glaces', slug: 'glaces', price: 4000, description: 'Glaces maison', image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400', prepTime: 2, isAvailable: true, isFeatured: false, isPopular: false, isNew: false, isVegetarian: true },
];

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
        return DEMO_RESTAURANT;
      } catch {
        return DEMO_RESTAURANT;
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
          return DEMO_CATEGORIES;
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
        // If it's an error response, return demo data
        if (data.error || data.success === false) {
          console.warn('Categories API error:', data.error || data.message);
          return DEMO_CATEGORIES;
        }
        return DEMO_CATEGORIES;
      } catch (error) {
        console.warn('Categories fetch error:', error);
        return DEMO_CATEGORIES;
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
          return DEMO_MENU_ITEMS;
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
        // If it's an error response, return demo data
        if (data.error || data.success === false) {
          console.warn('Menu items API error:', data.error || data.message);
          return DEMO_MENU_ITEMS;
        }
        return DEMO_MENU_ITEMS;
      } catch (error) {
        console.warn('Menu items fetch error:', error);
        return DEMO_MENU_ITEMS;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  
  // Orders Query
  const { data: ordersData, isLoading: isLoadingOrders, refetch: refetchOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/orders');
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
  const restaurant = restaurantData || DEMO_RESTAURANT;
  const categories = categoriesData || DEMO_CATEGORIES;
  const menuItems = menuItemsData || DEMO_MENU_ITEMS;
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
