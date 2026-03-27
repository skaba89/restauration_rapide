// ============================================
// RESTAURANT OS - React Query Hooks
// API hooks for data fetching and mutations
// ============================================

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  authApi,
  ordersApi,
  restaurantsApi,
  reservationsApi,
  driversApi,
  deliveriesApi,
  customersApi,
  dashboardApi,
  analyticsApi,
  loyaltyApi,
  paymentsApi,
  menuApi,
  setAuthToken,
  type PaginatedResponse,
} from '@/lib/api-client';

// ============================================
// AUTH HOOKS
// ============================================

export function useAuth() {
  const { data: session, isLoading, error } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: () => authApi.getSession(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user: session?.user,
    isAuthenticated: !!session?.user,
    isLoading,
    error,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: Parameters<typeof authApi.login>[0]) =>
      authApi.login(credentials),
    onSuccess: (data) => {
      setAuthToken(data.token);
      queryClient.setQueryData(['auth', 'session'], data);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof authApi.register>[0]) =>
      authApi.register(data),
    onSuccess: (data) => {
      setAuthToken(data.token);
      queryClient.setQueryData(['auth', 'session'], data);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      setAuthToken(null);
      queryClient.clear();
    },
  });
}

// ============================================
// DASHBOARD HOOKS
// ============================================

export function useDashboard(params: {
  organizationId?: string;
  restaurantId?: string;
  period?: 'today' | 'week' | 'month' | 'year';
}) {
  return useQuery({
    queryKey: ['dashboard', params],
    queryFn: () => dashboardApi.get(params),
    enabled: !!(params.organizationId || params.restaurantId),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// ============================================
// ORDERS HOOKS
// ============================================

export function useOrders(params?: Parameters<typeof ordersApi.list>[0]) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => ordersApi.list(params),
    enabled: !!(params?.restaurantId || params?.organizationId),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => ordersApi.get(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      ordersApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      ordersApi.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ============================================
// RESTAURANTS HOOKS
// ============================================

export function useRestaurants(params?: Parameters<typeof restaurantsApi.list>[0]) {
  return useQuery({
    queryKey: ['restaurants', params],
    queryFn: () => restaurantsApi.list(params),
    enabled: !!(params?.organizationId || params?.lat),
  });
}

export function useRestaurant(id: string) {
  return useQuery({
    queryKey: ['restaurants', id],
    queryFn: () => restaurantsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restaurantsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
}

export function useUpdateRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      restaurantsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['restaurants', id] });
    },
  });
}

// ============================================
// RESERVATIONS HOOKS
// ============================================

export function useReservations(params?: Parameters<typeof reservationsApi.list>[0]) {
  return useQuery({
    queryKey: ['reservations', params],
    queryFn: () => reservationsApi.list(params),
    enabled: !!(params?.restaurantId || params?.organizationId),
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reservationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      reservationsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservations', id] });
    },
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      reservationsApi.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
}

export function useAvailability(params: {
  restaurantId: string;
  date: string;
  time: string;
  partySize: number;
}) {
  return useQuery({
    queryKey: ['availability', params],
    queryFn: () => reservationsApi.checkAvailability(params),
    enabled: !!(params.restaurantId && params.date && params.time && params.partySize),
  });
}

// ============================================
// DRIVERS HOOKS
// ============================================

export function useDrivers(params: Parameters<typeof driversApi.list>[0]) {
  return useQuery({
    queryKey: ['drivers', params],
    queryFn: () => driversApi.list(params),
    enabled: !!params?.organizationId,
  });
}

export function useCreateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: driversApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      driversApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['drivers', id] });
    },
  });
}

export function useUpdateDriverLocation() {
  return useMutation({
    mutationFn: ({ id, lat, lng, accuracy }: { 
      id: string; 
      lat: number; 
      lng: number; 
      accuracy?: number 
    }) => driversApi.updateLocation(id, lat, lng, accuracy),
  });
}

export function useSetDriverAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      driversApi.setAvailability(id, isAvailable),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['drivers', id] });
    },
  });
}

// ============================================
// DELIVERIES HOOKS
// ============================================

export function useDeliveries(params?: Parameters<typeof deliveriesApi.list>[0]) {
  return useQuery({
    queryKey: ['deliveries', params],
    queryFn: () => deliveriesApi.list(params),
  });
}

export function useUpdateDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      deliveriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useAssignDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ deliveryId, driverId }: { deliveryId: string; driverId: string }) =>
      deliveriesApi.assignDriver(deliveryId, driverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

// ============================================
// CUSTOMERS HOOKS
// ============================================

export function useCustomers(params?: Parameters<typeof customersApi.list>[0]) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => customersApi.list(params),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => customersApi.get(id),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      customersApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', id] });
    },
  });
}

// ============================================
// ANALYTICS HOOKS
// ============================================

export function useAnalytics(params: Parameters<typeof analyticsApi.get>[0]) {
  return useQuery({
    queryKey: ['analytics', params],
    queryFn: () => analyticsApi.get(params),
    enabled: !!(params.organizationId || params.restaurantId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================
// LOYALTY HOOKS
// ============================================

export function useLoyaltyTransactions(params: Parameters<typeof loyaltyApi.getTransactions>[0]) {
  return useQuery({
    queryKey: ['loyalty', params],
    queryFn: () => loyaltyApi.getTransactions(params),
    enabled: !!(params.organizationId || params.customerId),
  });
}

export function useLoyaltyRewards(organizationId: string) {
  return useQuery({
    queryKey: ['loyalty', 'rewards', organizationId],
    queryFn: () => loyaltyApi.getRewards(organizationId),
    enabled: !!organizationId,
  });
}

export function useRedeemPoints() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customerId, points, rewardId }: { 
      customerId: string; 
      points: number; 
      rewardId?: string;
    }) => loyaltyApi.redeemPoints(customerId, points, rewardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

// ============================================
// PAYMENTS HOOKS
// ============================================

export function usePayments(params: Parameters<typeof paymentsApi.list>[0]) {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: () => paymentsApi.list(params),
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: paymentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useProcessMobileMoney() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, phoneNumber, provider }: { 
      paymentId: string; 
      phoneNumber: string; 
      provider: string;
    }) => paymentsApi.processMobileMoney(paymentId, phoneNumber, provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// ============================================
// MENU HOOKS
// ============================================

export function useMenu(params: Parameters<typeof menuApi.list>[0]) {
  return useQuery({
    queryKey: ['menu', params],
    queryFn: () => menuApi.list(params),
    enabled: !!params.restaurantId,
  });
}

export function useMenuCategories(restaurantId: string) {
  return useQuery({
    queryKey: ['menu', 'categories', restaurantId],
    queryFn: () => menuApi.getCategories(restaurantId),
    enabled: !!restaurantId,
  });
}

export function useMenuItems(params: Parameters<typeof menuApi.getItems>[0]) {
  return useQuery({
    queryKey: ['menu', 'items', params],
    queryFn: () => menuApi.getItems(params),
  });
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: menuApi.createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      menuApi.updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
  });
}
