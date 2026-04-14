'use client';

import { useCurrencySafe } from './currency-context';
import { useMemo } from 'react';

/**
 * Hook that safely formats currency values without causing hydration mismatches.
 * Returns a stable formatted value during SSR and the correct value after hydration.
 *
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function useFormattedCurrency(
  amount: number,
  options?: { showCode?: boolean }
): string {
  const { formatCurrency } = useCurrencySafe();

  const formattedValue = useMemo(() => {
    return formatCurrency(amount, options);
  }, [amount, formatCurrency, options]);

  return formattedValue;
}

/**
 * Hook that returns currency info with hydration safety.
 * Returns default values during SSR and actual values after hydration.
 */
export function useCurrencyInfo() {
  const { currency, currencyCode, currencySymbol, currencyName, isHydrated } = useCurrencySafe();

  return useMemo(() => ({
    currency,
    currencyCode,
    currencySymbol,
    currencyName,
    isHydrated,
  }), [currency, currencyCode, currencySymbol, currencyName, isHydrated]);
}

/**
 * Component that renders formatted currency without hydration issues.
 */
export function FormattedCurrency({
  amount,
  showCode
}: {
  amount: number;
  showCode?: boolean;
}) {
  const formatted = useFormattedCurrency(amount, { showCode });
  return <>{formatted}</>;
}

export default useFormattedCurrency;
