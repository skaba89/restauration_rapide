'use client';

import { useCurrencySafe } from '@/lib/currency-context';
import { ReactNode } from 'react';

interface CurrencyTextProps {
  amount: number;
  showCode?: boolean;
  className?: string;
}

/**
 * Component that safely displays formatted currency values without hydration issues.
 * Uses suppressHydrationWarning to allow server/client text differences.
 */
export function CurrencyText({ amount, showCode, className }: CurrencyTextProps) {
  const { formatCurrency } = useCurrencySafe();
  
  return (
    <span className={className} suppressHydrationWarning>
      {formatCurrency(amount, { showCode })}
    </span>
  );
}

/**
 * HOC to wrap any component that displays dynamic text that may differ between server and client.
 */
export function DynamicText({ 
  children, 
  className,
  as: Component = 'span'
}: { 
  children: ReactNode; 
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}) {
  return (
    <Component className={className} suppressHydrationWarning>
      {children}
    </Component>
  );
}

export default CurrencyText;
