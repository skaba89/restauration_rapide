// ============================================
// AfrikaConnect - Utility Functions
// ============================================

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind merge utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================
// ORDER NUMBER GENERATION
// ============================================

export function generateOrderNumber(prefix: string = 'ORD'): string {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}-${random}`;
}

export function generateReceiptNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `REC-${year}${month}${day}-${random}`;
}

export function generateTransactionId(prefix: string = 'TXN'): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// ============================================
// CURRENCY & FORMATTING
// ============================================

export function formatCurrency(amount: number, currency: string = 'XOF'): string {
  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

// ============================================
// DATE & TIME FORMATTING
// ============================================

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return formatDate(d);
}

export function getEstimatedDeliveryTime(preparationMinutes: number = 15, deliveryMinutes: number = 20): number {
  return preparationMinutes + deliveryMinutes;
}

// ============================================
// PHONE NUMBER VALIDATION (Africa)
// ============================================

export function validatePhoneNumber(phone: string, country: string = 'CI'): { valid: boolean; formatted?: string; provider?: string } {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s\-]/g, '');
  
  // Côte d'Ivoire patterns
  if (country === 'CI') {
    // Orange: 07, 08, 09
    // MTN: 05, 04
    // Wave: 01
    const ciPatterns = {
      orange: /^(\+225|225)?(07|08|09)\d{7}$/,
      mtn: /^(\+225|225)?(05|04)\d{7}$/,
      wave: /^(\+225|225)?01\d{7}$/,
      moov: /^(\+225|225)?(02|06)\d{7}$/,
    };

    for (const [provider, pattern] of Object.entries(ciPatterns)) {
      if (pattern.test(cleaned)) {
        // Format to international
        let formatted = cleaned;
        if (!cleaned.startsWith('+')) {
          formatted = cleaned.startsWith('225') ? `+${cleaned}` : `+225${cleaned}`;
        }
        return { valid: true, formatted, provider };
      }
    }
  }

  // Generic validation (at least 8 digits)
  if (/^\+?\d{8,15}$/.test(cleaned)) {
    return { valid: true, formatted: cleaned.startsWith('+') ? cleaned : `+${cleaned}` };
  }

  return { valid: false };
}

export function getMobileMoneyProvider(phone: string): string | null {
  const validation = validatePhoneNumber(phone);
  if (!validation.valid || !validation.provider) return null;
  
  const providerMap: Record<string, string> = {
    orange: 'MOBILE_MONEY_ORANGE',
    mtn: 'MOBILE_MONEY_MTN',
    wave: 'MOBILE_MONEY_WAVE',
    moov: 'MOBILE_MONEY_MOOV',
  };
  
  return providerMap[validation.provider] || null;
}

// ============================================
// SLUG GENERATION
// ============================================

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ============================================
// DISTANCE CALCULATION
// ============================================

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function isWithinDeliveryRadius(
  orgLat: number,
  orgLng: number,
  customerLat: number,
  customerLng: number,
  maxRadius: number
): boolean {
  const distance = calculateDistance(orgLat, orgLng, customerLat, customerLng);
  return distance <= maxRadius;
}

// ============================================
// LOYALTY POINTS
// ============================================

export function calculateLoyaltyPoints(
  amount: number,
  pointsPerAmount: number,
  pointThreshold: number = 1000
): number {
  return Math.floor((amount / pointThreshold) * pointsPerAmount);
}

export function calculatePointsValue(
  points: number,
  pointValue: number = 10
): number {
  return points * pointValue;
}

// ============================================
// ORDER STATUS HELPERS
// ============================================

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-500',
    CONFIRMED: 'bg-blue-500',
    PREPARING: 'bg-orange-500',
    READY: 'bg-green-500',
    OUT_FOR_DELIVERY: 'bg-purple-500',
    DELIVERED: 'bg-green-600',
    COMPLETED: 'bg-emerald-600',
    CANCELLED: 'bg-red-500',
    REFUNDED: 'bg-gray-500',
  };
  return colors[status] || 'bg-gray-400';
}

export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmée',
    PREPARING: 'En préparation',
    READY: 'Prête',
    OUT_FOR_DELIVERY: 'En livraison',
    DELIVERED: 'Livrée',
    COMPLETED: 'Terminée',
    CANCELLED: 'Annulée',
    REFUNDED: 'Remboursée',
  };
  return labels[status] || status;
}

export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    MOBILE_MONEY_ORANGE: 'Orange Money',
    MOBILE_MONEY_MTN: 'MTN Mobile Money',
    MOBILE_MONEY_WAVE: 'Wave',
    MOBILE_MONEY_MPESA: 'M-Pesa',
    MOBILE_MONEY_MOOV: 'Moov Money',
    CASH: 'Espèces',
    CARD: 'Carte bancaire',
    BANK_TRANSFER: 'Virement bancaire',
    WALLET: 'Portefeuille',
  };
  return labels[method] || method;
}

// ============================================
// VALIDATION HELPERS
// ============================================

export function isValidEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins une majuscule' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins une minuscule' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins un chiffre' };
  }
  return { valid: true };
}

// ============================================
// DATA HELPERS
// ============================================

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ============================================
// LOCAL STORAGE HELPERS (for offline)
// ============================================

export const offlineStorage = {
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('LocalStorage error:', e);
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  },
};
