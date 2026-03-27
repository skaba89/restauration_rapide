// ============================================
// RESTAURANT OS - API Client
// Centralized API fetching with error handling
// ============================================

const API_BASE = '/api';

export interface ApiError {
  message: string;
  status?: number;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Helper to get auth token
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

// Helper to set auth token
export function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

// Generic fetcher with auth
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    const error: ApiError = {
      message: data.error || 'Une erreur est survenue',
      status: response.status,
      details: data.details,
    };
    throw error;
  }

  return data.data ?? data;
}

// GET helper
export async function apiGet<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<T> {
  let url = endpoint;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  return apiFetch<T>(url);
}

// POST helper
export async function apiPost<T>(endpoint: string, body?: unknown): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

// PATCH helper
export async function apiPatch<T>(endpoint: string, body?: unknown): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

// DELETE helper
export async function apiDelete<T>(
  endpoint: string,
  params?: Record<string, string>
): Promise<T> {
  let url = endpoint;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }
  return apiFetch<T>(url, { method: 'DELETE' });
}

// ============================================
// AUTH API
// ============================================

export interface LoginCredentials {
  email?: string;
  phone?: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    phone?: string;
    role: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export const authApi = {
  login: (credentials: LoginCredentials) =>
    apiPost<AuthResponse>('/auth', { action: 'login', ...credentials }),
  
  register: (data: RegisterData) =>
    apiPost<AuthResponse>('/auth', { action: 'register', ...data }),
  
  logout: () =>
    apiDelete<{ loggedOut: boolean }>('/auth'),
  
  getSession: () =>
    apiGet<AuthResponse>('/auth'),
  
  requestOtp: (phone: string, type = 'LOGIN') =>
    apiPost('/auth', { action: 'request-otp', phone, type }),
  
  verifyOtp: (code: string, phone: string, type = 'LOGIN') =>
    apiPost<AuthResponse>('/auth', { action: 'verify-otp', otpCode: code, phone, type }),
  
  refreshToken: (refreshToken: string) =>
    apiPost<{ token: string; refreshToken: string; expiresAt: string }>('/auth', { action: 'refresh', refreshToken }),
};

// ============================================
// ORDERS API
// ============================================

export const ordersApi = {
  list: (params?: {
    restaurantId?: string;
    organizationId?: string;
    status?: string;
    customerId?: string;
    orderType?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => apiGet<PaginatedResponse<any>>('/orders', params),
  
  get: (id: string) => apiGet<any>(`/orders?id=${id}`),
  
  create: (data: any) => apiPost<any>('/orders', data),
  
  update: (id: string, data: any) => apiPatch<any>('/orders', { id, ...data }),
  
  cancel: (id: string, reason?: string) =>
    apiDelete<{ cancelled: boolean }>(`/orders`, { id, reason: reason || '' }),
};

// ============================================
// RESTAURANTS API
// ============================================

export const restaurantsApi = {
  list: (params?: {
    organizationId?: string;
    isActive?: boolean;
    isOpen?: boolean;
    search?: string;
    city?: string;
    lat?: number;
    lng?: number;
    radius?: number;
    page?: number;
    limit?: number;
  }) => apiGet<PaginatedResponse<any>>('/restaurants', params),
  
  get: (id: string) => apiGet<any>(`/restaurants?id=${id}`),
  
  create: (data: any) => apiPost<any>('/restaurants', data),
  
  update: (id: string, data: any) => apiPatch<any>('/restaurants', { id, ...data }),
  
  delete: (id: string) => apiDelete<{ deleted: boolean }>(`/restaurants?id=${id}`),
};

// ============================================
// RESERVATIONS API
// ============================================

export const reservationsApi = {
  list: (params?: {
    restaurantId?: string;
    organizationId?: string;
    status?: string;
    customerId?: string;
    date?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => apiGet<PaginatedResponse<any>>('/reservations', params),
  
  create: (data: any) => apiPost<any>('/reservations', data),
  
  update: (id: string, data: any) => apiPatch<any>('/reservations', { id, ...data }),
  
  cancel: (id: string, reason?: string) =>
    apiDelete<{ cancelled: boolean }>(`/reservations`, { id, reason: reason || '' }),
  
  checkAvailability: (params: {
    restaurantId: string;
    date: string;
    time: string;
    partySize: number;
  }) => apiGet<{ available: boolean; availableTables?: number; suggestedTimes?: string[] }>(
    `/reservations/availability`,
    params
  ),
};

// ============================================
// DRIVERS API
// ============================================

export const driversApi = {
  list: (params?: {
    organizationId: string;
    isAvailable?: boolean;
    isActive?: boolean;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => apiGet<PaginatedResponse<any>>('/drivers', params),
  
  create: (data: any) => apiPost<any>('/drivers', data),
  
  update: (id: string, data: any) => apiPatch<any>('/drivers', { id, ...data }),
  
  updateLocation: (id: string, lat: number, lng: number, accuracy?: number) =>
    apiPatch<any>('/drivers', { id, currentLat: lat, currentLng: lng, currentAccuracy: accuracy }),
  
  setAvailability: (id: string, isAvailable: boolean) =>
    apiPatch<any>('/drivers', { id, isAvailable }),
  
  delete: (id: string) => apiDelete<{ deleted: boolean }>(`/drivers?id=${id}`),
};

// ============================================
// DELIVERIES API
// ============================================

export const deliveriesApi = {
  list: (params?: {
    organizationId?: string;
    driverId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => apiGet<PaginatedResponse<any>>('/deliveries', params),
  
  update: (id: string, data: any) => apiPatch<any>('/deliveries', { id, ...data }),
  
  assignDriver: (id: string, driverId: string) =>
    apiPatch<any>('/deliveries', { id, driverId }),
};

// ============================================
// CUSTOMERS API
// ============================================

export const customersApi = {
  list: (params?: {
    organizationId?: string;
    search?: string;
    isVip?: boolean;
    page?: number;
    limit?: number;
  }) => apiGet<PaginatedResponse<any>>('/customers', params),
  
  get: (id: string) => apiGet<any>(`/customers?id=${id}`),
  
  create: (data: any) => apiPost<any>('/customers', data),
  
  update: (id: string, data: any) => apiPatch<any>('/customers', { id, ...data }),
};

// ============================================
// DASHBOARD API
// ============================================

export const dashboardApi = {
  get: (params: {
    organizationId?: string;
    restaurantId?: string;
    period?: 'today' | 'week' | 'month' | 'year';
    demo?: string;
  }) => apiGet<any>('/dashboard', params),
};

// ============================================
// ANALYTICS API
// ============================================

export const analyticsApi = {
  get: (params: {
    organizationId?: string;
    restaurantId?: string;
    startDate?: string;
    endDate?: string;
    metrics?: string;
  }) => apiGet<any>('/analytics', params),
};

// ============================================
// LOYALTY API
// ============================================

export const loyaltyApi = {
  getTransactions: (params: {
    organizationId?: string;
    customerId?: string;
    page?: number;
    limit?: number;
  }) => apiGet<PaginatedResponse<any>>('/loyalty', params),
  
  getRewards: (organizationId: string) =>
    apiGet<any>(`/loyalty/rewards?organizationId=${organizationId}`),
  
  redeemPoints: (customerId: string, points: number, rewardId?: string) =>
    apiPost<any>('/loyalty', { action: 'redeem', customerId, points, rewardId }),
};

// ============================================
// PAYMENTS API
// ============================================

export const paymentsApi = {
  list: (params: {
    orderId?: string;
    status?: string;
    method?: string;
    page?: number;
    limit?: number;
  }) => apiGet<PaginatedResponse<any>>('/payments', params),
  
  create: (data: any) => apiPost<any>('/payments', data),
  
  processMobileMoney: (paymentId: string, phoneNumber: string, provider: string) =>
    apiPost<any>('/payments', { action: 'process_mobile_money', paymentId, phoneNumber, provider }),
};

// ============================================
// MENU API
// ============================================

export const menuApi = {
  list: (params: {
    restaurantId: string;
    isActive?: boolean;
  }) => apiGet<any>('/menu', params),
  
  getCategories: (restaurantId: string) =>
    apiGet<any>(`/categories?restaurantId=${restaurantId}`),
  
  getItems: (params: {
    restaurantId?: string;
    categoryId?: string;
    isAvailable?: boolean;
    search?: string;
  }) => apiGet<any>('/products', params),
  
  createItem: (data: any) => apiPost<any>('/products', data),
  
  updateItem: (id: string, data: any) => apiPatch<any>('/products', { id, ...data }),
};
