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
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Default currency for Guinea (GNF)
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
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);
  const [isLoading, setIsLoading] = useState(true);

  // Load currency from organization settings on mount
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        // Try to fetch from organization settings API
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          if (data?.currency) {
            const currencyData = getCurrencyFromCode(data.currency);
            setCurrencyState(currencyData);
            // Also save to localStorage for quick access
            localStorage.setItem('currency', JSON.stringify(currencyData));
            return;
          }
        }
      } catch (error) {
        console.log('Could not load currency from API, using localStorage');
      }

      // Fallback to localStorage
      const saved = localStorage.getItem('currency');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.code) {
            setCurrencyState(getCurrencyFromCode(parsed.code));
          }
        } catch {
          // Ignore parse errors
        }
      }
      
      setIsLoading(false);
    };

    loadCurrency();
  }, []);

  // Set currency and save to both localStorage and API
  const setCurrency = useCallback(async (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('currency', JSON.stringify(newCurrency));
    
    // Also save to organization settings via API
    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: newCurrency.code }),
      });
    } catch (error) {
      console.log('Could not save currency to API');
    }
  }, []);

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
    };
  }
  return context;
}
