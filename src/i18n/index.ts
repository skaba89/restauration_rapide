'use client';

import { useTranslations as useNextIntlTranslations } from 'next-intl';
import { useCallback } from 'react';

/**
 * Custom hook for translations with type safety
 * Usage: const t = useTranslations('common'); t('loading')
 */
export function useTranslations(namespace?: string) {
  const t = useNextIntlTranslations(namespace);
  return t;
}

/**
 * Hook to get all common translations
 */
export function useCommonTranslations() {
  return useTranslations('common');
}

/**
 * Hook to get auth translations
 */
export function useAuthTranslations() {
  return useTranslations('auth');
}

/**
 * Hook to get navigation translations
 */
export function useNavigationTranslations() {
  return useTranslations('navigation');
}

/**
 * Hook to get error translations
 */
export function useErrorTranslations() {
  return useTranslations('errors');
}

/**
 * Hook to get order translations
 */
export function useOrderTranslations() {
  return useTranslations('orders');
}

/**
 * Hook to get menu translations
 */
export function useMenuTranslations() {
  return useTranslations('menu');
}

/**
 * Hook to get customer translations
 */
export function useCustomerTranslations() {
  return useTranslations('customers');
}

/**
 * Hook to get delivery translations
 */
export function useDeliveryTranslations() {
  return useTranslations('deliveries');
}

/**
 * Hook to get driver translations
 */
export function useDriverTranslations() {
  return useTranslations('drivers');
}

/**
 * Hook to get payment translations
 */
export function usePaymentTranslations() {
  return useTranslations('payments');
}

/**
 * Hook to get settings translations
 */
export function useSettingsTranslations() {
  return useTranslations('settings');
}

/**
 * Format currency based on locale
 */
export function formatCurrency(
  amount: number,
  currency: string = 'XOF',
  locale: string = 'fr-FR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date based on locale
 */
export function formatDate(
  date: Date | string,
  locale: string = 'fr-FR',
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  }).format(d);
}

/**
 * Format time based on locale
 */
export function formatTime(
  date: Date | string,
  locale: string = 'fr-FR'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Format relative time (e.g., "il y a 5 minutes")
 */
export function formatRelativeTime(
  date: Date | string,
  locale: string = 'fr-FR'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffSec < 60) {
    return rtf.format(-diffSec, 'second');
  } else if (diffMin < 60) {
    return rtf.format(-diffMin, 'minute');
  } else if (diffHour < 24) {
    return rtf.format(-diffHour, 'hour');
  } else if (diffDay < 30) {
    return rtf.format(-diffDay, 'day');
  } else {
    return formatDate(d, locale);
  }
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string, countryCode: string = 'CI'): string {
  // Clean the phone number
  const cleaned = phone.replace(/\D/g, '');

  // Format based on country
  if (countryCode === 'CI' && cleaned.length === 10) {
    // Côte d'Ivoire format: +225 07 00 00 00 01
    return `+225 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
  }

  // Default: just add + if missing
  return phone.startsWith('+') ? phone : `+${phone}`;
}

// Export types
export type { Locale } from './config';
export { locales, defaultLocale, localeNames, localeFlags } from './config';
