'use client';

import { createContext, useContext, ReactNode, useCallback } from 'react';

// Simple currency configuration for GNF (Guinea)
const DEFAULT_CURRENCY = {
  code: 'GNF',
  symbol: 'GNF',
  name: 'Franc Guinéen',
  decimalPlaces: 0,
};

type Currency = typeof DEFAULT_CURRENCY;

interface CurrencyContextType {
  currency: Currency;
  currencyCode: string;
  currencySymbol: string;
  currencyName: string;
  formatCurrency: (amount: number, options?: { showCode?: boolean }) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Format currency in GNF
function formatGNF(amount: number, options?: { showCode?: boolean }): string {
  const formatted = new Intl.NumberFormat('fr-GN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  
  if (options?.showCode) {
    return `${formatted} GNF`;
  }
  return `${formatted} GNF`;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const formatCurrency = useCallback((amount: number, options?: { showCode?: boolean }) => {
    return formatGNF(amount, options);
  }, []);

  const value: CurrencyContextType = {
    currency: DEFAULT_CURRENCY,
    currencyCode: DEFAULT_CURRENCY.code,
    currencySymbol: DEFAULT_CURRENCY.symbol,
    currencyName: DEFAULT_CURRENCY.name,
    formatCurrency,
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
      formatCurrency: formatGNF,
    };
  }
  return context;
}
