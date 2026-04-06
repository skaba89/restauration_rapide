'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { formatCurrency as formatCurrencyUtil, CURRENCIES, Currency } from '@/lib/currency';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const DEFAULT_CURRENCY: Currency = {
  code: 'GNF',
  symbol: 'GNF',
  name: 'Franc Guinéen',
  decimalPlaces: 0,
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);

  useEffect(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('currency');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.code) {
          setCurrencyState(parsed);
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('currency', JSON.stringify(newCurrency));
  };

  const formatCurrency = (amount: number): string => {
    return formatCurrencyUtil(amount, currency.code);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency }}>
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
      setCurrency: () => {},
      formatCurrency: (amount: number) => formatCurrencyUtil(amount, 'GNF'),
    };
  }
  return context;
}
