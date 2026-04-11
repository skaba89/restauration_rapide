'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode, useState } from 'react';

/**
 * React Query Provider with optimized defaults
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: 5 minutes - data is considered fresh
            staleTime: 5 * 60 * 1000,
            // Cache time: 30 minutes - unused data stays in cache
            gcTime: 30 * 60 * 1000,
            // Retry failed requests up to 3 times
            retry: 3,
            // Retry delay with exponential backoff
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Refetch on window focus
            refetchOnWindowFocus: true,
            // Refetch on reconnect
            refetchOnReconnect: true,
            // Refetch interval (disabled by default)
            refetchInterval: false,
            // Don't refetch on mount if data is fresh
            refetchOnMount: true,
          },
          mutations: {
            // Retry mutations once
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}

/**
 * Query key factory for consistent key generation
 */
export const queryKeys = {
  // Orders
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.orders.lists(), filters] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
  },

  // Products / Menu
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
    byCategory: (categoryId: string) =>
      [...queryKeys.products.all, 'category', categoryId] as const,
  },

  // Categories
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: (restaurantId: string) =>
      [...queryKeys.categories.lists(), restaurantId] as const,
    details: () => [...queryKeys.categories.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.categories.details(), id] as const,
  },

  // Customers
  customers: {
    all: ['customers'] as const,
    lists: () => [...queryKeys.customers.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.customers.lists(), filters] as const,
    details: () => [...queryKeys.customers.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.customers.details(), id] as const,
    search: (query: string) => [...queryKeys.customers.all, 'search', query] as const,
  },

  // Reservations
  reservations: {
    all: ['reservations'] as const,
    lists: () => [...queryKeys.reservations.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.reservations.lists(), filters] as const,
    details: () => [...queryKeys.reservations.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.reservations.details(), id] as const,
  },

  // Deliveries
  deliveries: {
    all: ['deliveries'] as const,
    lists: () => [...queryKeys.deliveries.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.deliveries.lists(), filters] as const,
    details: () => [...queryKeys.deliveries.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.deliveries.details(), id] as const,
    tracking: (id: string) => [...queryKeys.deliveries.all, 'tracking', id] as const,
  },

  // Drivers
  drivers: {
    all: ['drivers'] as const,
    lists: () => [...queryKeys.drivers.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.drivers.lists(), filters] as const,
    details: () => [...queryKeys.drivers.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.drivers.details(), id] as const,
    available: () => [...queryKeys.drivers.all, 'available'] as const,
  },

  // Dashboard / Analytics
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    revenue: (period: string) =>
      [...queryKeys.dashboard.all, 'revenue', period] as const,
    orders: (period: string) =>
      [...queryKeys.dashboard.all, 'orders', period] as const,
    topProducts: (period: string) =>
      [...queryKeys.dashboard.all, 'top-products', period] as const,
  },

  // Settings
  settings: {
    all: ['settings'] as const,
    restaurant: () => [...queryKeys.settings.all, 'restaurant'] as const,
    payment: () => [...queryKeys.settings.all, 'payment'] as const,
    delivery: () => [...queryKeys.settings.all, 'delivery'] as const,
    notifications: () => [...queryKeys.settings.all, 'notifications'] as const,
  },

  // User / Auth
  user: {
    all: ['user'] as const,
    current: () => [...queryKeys.user.all, 'current'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
  },
} as const;

/**
 * Cache invalidation helpers
 */
export const cacheHelpers = {
  // Invalidate all order-related queries
  invalidateOrders: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
  },

  // Invalidate specific order
  invalidateOrder: (queryClient: QueryClient, id: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(id) });
  },

  // Invalidate all product-related queries
  invalidateProducts: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
  },

  // Invalidate dashboard data
  invalidateDashboard: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  },

  // Invalidate customer data
  invalidateCustomers: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
  },

  // Prefetch helper
  prefetch: async <T>(
    queryClient: QueryClient,
    queryKey: unknown[],
    queryFn: () => Promise<T>,
    staleTime?: number
  ) => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime,
    });
  },
};

export { QueryClient };
