'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, cacheHelpers } from '@/lib/react-query';
import { useToast } from '@/hooks/use-toast';

// API base URL
const API_BASE = '/api';

/**
 * Generic fetcher with error handling
 */
async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// ============================================
// Orders Hooks
// ============================================

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  customer?: {
    id: string;
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    price: number;
    product?: {
      name: string;
    };
  }>;
}

interface OrdersFilters {
  status?: string;
  restaurantId?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * Hook to fetch orders list
 */
export function useOrders(filters: OrdersFilters = {}) {
  return useQuery({
    queryKey: queryKeys.orders.list(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
      return fetcher<{ orders: Order[]; total: number; pages: number }>(
        `/orders?${params.toString()}`
      );
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch single order
 */
export function useOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => fetcher<Order>(`/orders/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create order
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<Order>) =>
      fetcher<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      cacheHelpers.invalidateOrders(queryClient);
      toast({
        title: 'Commande créée',
        description: 'La commande a été créée avec succès.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to update order status
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      fetcher<Order>(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.id) });
      cacheHelpers.invalidateOrders(queryClient);
      toast({
        title: 'Statut mis à jour',
        description: 'Le statut de la commande a été mis à jour.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// ============================================
// Products / Menu Hooks
// ============================================

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  restaurantId: string;
  available: boolean;
  image?: string;
}

interface ProductsFilters {
  restaurantId?: string;
  categoryId?: string;
  available?: boolean;
  search?: string;
}

/**
 * Hook to fetch products
 */
export function useProducts(filters: ProductsFilters = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
      return fetcher<{ products: Product[] }>(`/products?${params.toString()}`);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch single product
 */
export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => fetcher<Product>(`/products/${id}`),
    enabled: !!id,
  });
}

/**
 * Hook to create product
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<Product>) =>
      fetcher<Product>('/products', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      cacheHelpers.invalidateProducts(queryClient);
      toast({
        title: 'Produit créé',
        description: 'Le produit a été créé avec succès.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to update product
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      fetcher<Product>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(variables.id) });
      cacheHelpers.invalidateProducts(queryClient);
      toast({
        title: 'Produit mis à jour',
        description: 'Le produit a été mis à jour avec succès.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// ============================================
// Customers Hooks
// ============================================

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  loyaltyPoints: number;
  totalOrders: number;
  totalSpent: number;
}

/**
 * Hook to fetch customers
 */
export function useCustomers(filters: { search?: string; page?: number } = {}) {
  return useQuery({
    queryKey: queryKeys.customers.list(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
      return fetcher<{ customers: Customer[]; total: number }>(
        `/customers?${params.toString()}`
      );
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to search customers
 */
export function useCustomerSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.customers.search(query),
    queryFn: () => fetcher<Customer[]>(`/customers/search?q=${encodeURIComponent(query)}`),
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// ============================================
// Dashboard Hooks
// ============================================

interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  activeOrders: number;
  newCustomers: number;
  avgOrderValue: number;
}

/**
 * Hook to fetch dashboard stats
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: () => fetcher<DashboardStats>('/dashboard'),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Auto-refetch every minute
  });
}

// ============================================
// Reservations Hooks
// ============================================

interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string;
  time: string;
  partySize: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
  tableId?: string;
}

interface ReservationsFilters {
  date?: string;
  status?: string;
  restaurantId?: string;
}

/**
 * Hook to fetch reservations
 */
export function useReservations(filters: ReservationsFilters = {}) {
  return useQuery({
    queryKey: queryKeys.reservations.list(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
      return fetcher<{ reservations: Reservation[] }>(
        `/reservations?${params.toString()}`
      );
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to create reservation
 */
export function useCreateReservation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<Reservation>) =>
      fetcher<Reservation>('/reservations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations.all });
      toast({
        title: 'Réservation créée',
        description: 'La réservation a été créée avec succès.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// ============================================
// Deliveries Hooks
// ============================================

interface Delivery {
  id: string;
  orderId: string;
  driverId?: string;
  status: 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  pickupAddress: string;
  deliveryAddress: string;
  estimatedTime?: number;
  trackingCode: string;
  driver?: {
    id: string;
    name: string;
    phone: string;
  };
}

/**
 * Hook to fetch deliveries
 */
export function useDeliveries(filters: { status?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.deliveries.list(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
      return fetcher<{ deliveries: Delivery[] }>(`/deliveries?${params.toString()}`);
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto-refetch for real-time tracking
  });
}

/**
 * Hook to track delivery
 */
export function useDeliveryTracking(trackingCode: string) {
  return useQuery({
    queryKey: queryKeys.deliveries.tracking(trackingCode),
    queryFn: () => fetcher<Delivery>(`/deliveries/track/${trackingCode}`),
    enabled: !!trackingCode,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 10 * 1000, // Real-time updates
  });
}

// ============================================
// Drivers Hooks
// ============================================

interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  currentLocation?: {
    lat: number;
    lng: number;
  };
  activeDeliveries: number;
  completedToday: number;
  rating: number;
}

/**
 * Hook to fetch available drivers
 */
export function useAvailableDrivers() {
  return useQuery({
    queryKey: queryKeys.drivers.available(),
    queryFn: () => fetcher<{ drivers: Driver[] }>('/drivers/available'),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to assign driver to delivery
 */
export function useAssignDriver() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ deliveryId, driverId }: { deliveryId: string; driverId: string }) =>
      fetcher<Delivery>(`/deliveries/${deliveryId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ driverId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deliveries.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.drivers.all });
      toast({
        title: 'Livreur assigné',
        description: 'Le livreur a été assigné avec succès.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export { fetcher };
