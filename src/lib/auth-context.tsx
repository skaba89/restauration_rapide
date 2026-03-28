// ============================================
// RESTAURANT OS - Authentication Context
// React context for managing auth state
// ============================================

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost, apiGet, setAuthToken } from './api-client';

// Types
interface User {
  id: string;
  email: string;
  phone?: string;
  role: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  language?: string;
  isActive?: boolean;
  organizations?: Array<{
    id: string;
    name: string;
    slug: string;
    role: string;
  }>;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithOtp: (phone: string, otpCode: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiGet<{ user: User }>('/auth');
        setUser(response.user);
      } catch (error) {
        // Token is invalid, clear it
        setAuthToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // Login with email and password
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiPost<{ user: User; token: string; expiresAt: string }>('/auth', {
        action: 'login',
        email,
        password,
      });
      
      setAuthToken(response.token);
      setUser(response.user);
      
      // Redirect based on role
      redirectBasedOnRole(response.user.role);
    } catch (error: any) {
      throw new Error(error.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Login with OTP
  const loginWithOtp = useCallback(async (phone: string, otpCode: string) => {
    setIsLoading(true);
    try {
      const response = await apiPost<{ user: User; token: string }>('/auth', {
        action: 'verify-otp',
        type: 'LOGIN',
        phone,
        otpCode,
      });
      
      setAuthToken(response.token);
      setUser(response.user);
      redirectBasedOnRole(response.user.role);
    } catch (error: any) {
      throw new Error(error.message || 'Code OTP invalide');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Register
  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await apiPost<{ user: User; token: string }>('/auth', {
        action: 'register',
        ...data,
      });
      
      setAuthToken(response.token);
      setUser(response.user);
      
      // New users are always customers
      router.push('/customer');
    } catch (error: any) {
      throw new Error(error.message || "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Logout
  const logout = useCallback(async () => {
    try {
      await apiPost('/auth', { action: 'logout' });
    } catch (error) {
      // Ignore logout API errors
    } finally {
      setAuthToken(null);
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  // Refresh session
  const refreshSession = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const response = await apiGet<{ user: User }>('/auth');
      setUser(response.user);
    } catch (error) {
      setAuthToken(null);
      setUser(null);
    }
  }, []);

  // Helper to redirect based on role
  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case 'CUSTOMER':
        router.push('/customer');
        break;
      case 'DRIVER':
        router.push('/driver');
        break;
      case 'SUPER_ADMIN':
        router.push('/admin');
        break;
      default:
        router.push('/dashboard');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithOtp,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

// Hook for protected routes
export function useRequireAuth(allowedRoles?: string[]) {
  const { user, isLoading, isAuthenticated } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!isLoading && isAuthenticated && allowedRoles && user) {
      if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate page based on role
        switch (user.role) {
          case 'CUSTOMER':
            router.push('/customer');
            break;
          case 'DRIVER':
            router.push('/driver');
            break;
          default:
            router.push('/dashboard');
        }
      }
    }
  }, [user, isLoading, isAuthenticated, allowedRoles, router]);

  return { user, isLoading, isAuthenticated };
}
