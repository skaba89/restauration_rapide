'use client';

import { createContext, useContext, ReactNode, useCallback, useState, useEffect } from 'react';

// Currency configuration
const DEFAULT_CURRENCY = {
  code: 'GNF',
  symbol: 'FGN',
  name: 'Franc Guinéen (FGN)',
  decimalPlaces: 0,
};

const STORAGE_KEY = 'restaurant-os-currency';

type Currency = typeof DEFAULT_CURRENCY;

interface CurrencyContextType {
  currency: Currency;
  currencyCode: string;
  currencySymbol: string;
  currencyName: string;
  formatCurrency: (amount: number, options?: { showCode?: boolean }) => string;
  setCurrency: (code: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// All supported currencies
const ALL_CURRENCIES: Record<string, Currency> = {
  GNF: { code: 'GNF', symbol: 'FGN', name: 'Franc Guinéen (FGN)', decimalPlaces: 0 },
  XOF: { code: 'XOF', symbol: 'FCFA', name: 'Franc CFA (BCEAO)', decimalPlaces: 0 },
  XAF: { code: 'XAF', symbol: 'FCFA', name: 'Franc CFA (BEAC)', decimalPlaces: 0 },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', decimalPlaces: 2 },
  GHS: { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', decimalPlaces: 2 },
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', decimalPlaces: 2 },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', decimalPlaces: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimalPlaces: 2 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimalPlaces: 2 },
};

// Format with NaN protection
function safeFormatAmount(amount: number, currency: Currency): string {
  // Guard against NaN, undefined, null
  const safeAmount = (typeof amount === 'number' && isFinite(amount)) ? amount : 0;

  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: currency.decimalPlaces,
    maximumFractionDigits: currency.decimalPlaces,
  }).format(safeAmount);

  return `${formatted} ${currency.symbol}`;
}

function loadSavedCurrency(): Currency {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ALL_CURRENCIES[saved]) {
      return ALL_CURRENCIES[saved];
    }
  } catch {
    // Ignore
  }
  return DEFAULT_CURRENCY;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);

  // Load saved currency from localStorage on mount
  useEffect(() => {
    setCurrencyState(loadSavedCurrency());
  }, []);

  const setCurrency = useCallback((code: string) => {
    const newCurrency = ALL_CURRENCIES[code] || DEFAULT_CURRENCY;
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // Ignore
    }
  }, []);

  const formatCurrency = useCallback((amount: number, options?: { showCode?: boolean }) => {
    const formatted = safeFormatAmount(amount, currency);
    if (options?.showCode === false) {
      // Remove the code part, keep just the formatted number
      return formatted.replace(` ${currency.symbol}`, '');
    }
    return formatted;
  }, [currency]);

  const value: CurrencyContextType = {
    currency,
    currencyCode: currency.code,
    currencySymbol: currency.symbol,
    currencyName: currency.name,
    formatCurrency,
    setCurrency,
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
      formatCurrency: (amount: number) => safeFormatAmount(amount, DEFAULT_CURRENCY),
      setCurrency: () => {},
    };
  }
  return context;
}
