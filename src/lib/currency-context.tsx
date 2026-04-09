'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { formatCurrency as formatCurrencyUtil, CURRENCIES, Currency } from '@/lib/currency';

interface CurrencyContextType {
  currency: Currency;
  currencyCode: string;
  currencySymbol: string;
  currencyName: string;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (amount: number, options?: { showCode?: boolean }) => string;
  isLoading: boolean;
  refreshCurrency: () => Promise<void>;
  isHydrated: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Default currency for Guinea (GNF) - Used for both SSR and initial client render
const DEFAULT_CURRENCY: Currency = {
  code: 'GNF',
  symbol: 'GNF',
  name: 'Franc Guinéen',
  decimalPlaces: 0,
};

// Get currency info from code
function getCurrencyFromCode(code: string): Currency {
  const found = CURRENCIES.find(c => c.code === code);
  if (found) return found;

  // Fallback currencies
  const fallbacks: Record<string, Currency> = {
    'GNF': { code: 'GNF', symbol: 'GNF', name: 'Franc Guinéen', decimalPlaces: 0 },
    'XOF': { code: 'XOF', symbol: 'FCFA', name: 'Franc CFA (BCEAO)', decimalPlaces: 0 },
    'XAF': { code: 'XAF', symbol: 'FCFA', name: 'Franc CFA (BEAC)', decimalPlaces: 0 },
    'EUR': { code: 'EUR', symbol: '€', name: 'Euro', decimalPlaces: 2 },
    'USD': { code: 'USD', symbol: '$', name: 'Dollar US', decimalPlaces: 2 },
  };

  return fallbacks[code] || DEFAULT_CURRENCY;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // Always start with default currency for consistent SSR/initial client render
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Mark as hydrated after first render (client-side only)
  useEffect(() => {
    // Use requestAnimationFrame to ensure hydration is complete
    const raf = requestAnimationFrame(() => {
      setIsHydrated(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Load currency from settings after hydration (client-side only)
  const loadCurrency = useCallback(async () => {
    // Only run on client after hydration
    if (typeof window === 'undefined' || !isHydrated) return;
    
    try {
      // First try the public settings API (works for both authenticated and public pages)
      const response = await fetch('/api/public/settings');
      if (response.ok) {
        const result = await response.json();
        if (result?.success && result?.data?.currency) {
          const currencyData = getCurrencyFromCode(result.data.currency);
          setCurrencyState(currencyData);
          // Save to localStorage for quick access
          try {
            localStorage.setItem('currency', JSON.stringify(currencyData));
            localStorage.setItem('currencyCode', result.data.currency);
          } catch (e) {
            // localStorage might not be available
          }
          setIsLoading(false);
          return;
        }
      }
    } catch (error) {
      // Silent fail - will use default
    }

    // Fallback to localStorage
    try {
      const savedCurrency = localStorage.getItem('currency');
      const savedCode = localStorage.getItem('currencyCode');
      if (savedCurrency) {
        try {
          const parsed = JSON.parse(savedCurrency);
          if (parsed && parsed.code) {
            setCurrencyState(getCurrencyFromCode(parsed.code));
            setIsLoading(false);
            return;
          }
        } catch {
          // Ignore parse errors
        }
      } else if (savedCode) {
        setCurrencyState(getCurrencyFromCode(savedCode));
        setIsLoading(false);
        return;
      }
    } catch (e) {
      // localStorage might not be available
    }

    // Use default currency
    setIsLoading(false);
  }, [isHydrated]);

  useEffect(() => {
    // Only load currency after hydration is complete
    if (isHydrated) {
      loadCurrency();
    }
  }, [isHydrated, loadCurrency]);

  // Set currency and save to both localStorage and API
  const setCurrency = useCallback(async (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    
    try {
      localStorage.setItem('currency', JSON.stringify(newCurrency));
      localStorage.setItem('currencyCode', newCurrency.code);
    } catch (e) {
      // localStorage might not be available
    }

    // Also save to organization settings via API
    try {
      // Get organization ID from localStorage or settings
      const orgResponse = await fetch('/api/public/settings');
      let organizationId = null;
      if (orgResponse.ok) {
        const orgData = await orgResponse.json();
        organizationId = orgData?.data?.id;
      }

      // Update currency via settings API
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'organization',
          organizationId,
          settings: {
            config: {
              currency: newCurrency.code,
            }
          }
        }),
      });
    } catch (error) {
      // Silent fail
    }
  }, []);

  // Refresh currency from server
  const refreshCurrency = useCallback(async () => {
    setIsLoading(true);
    await loadCurrency();
    setIsLoading(false);
  }, [loadCurrency]);

  // Format currency with current settings
  const formatCurrency = useCallback((amount: number, options?: { showCode?: boolean }): string => {
    return formatCurrencyUtil(amount, currency.code, options);
  }, [currency.code]);

  const value: CurrencyContextType = {
    currency,
    currencyCode: currency.code,
    currencySymbol: currency.symbol,
    currencyName: currency.name,
    setCurrency,
    formatCurrency,
    isLoading,
    refreshCurrency,
    isHydrated,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

// Safe version that returns default values if used outside provider
export function useCurrencySafe() {
  const context = useContext(CurrencyContext);
  if (!context) {
    return {
      currency: DEFAULT_CURRENCY,
      currencyCode: DEFAULT_CURRENCY.code,
      currencySymbol: DEFAULT_CURRENCY.symbol,
      currencyName: DEFAULT_CURRENCY.name,
      setCurrency: () => {},
      formatCurrency: (amount: number) => formatCurrencyUtil(amount, 'GNF'),
      isLoading: false,
      refreshCurrency: async () => {},
      isHydrated: false,
    };
  }
  return context;
}
