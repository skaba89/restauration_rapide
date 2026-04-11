'use client';

import { useCurrency } from '@/lib/currency-context';
import { Badge } from '@/components/ui/badge';
import { Receipt } from 'lucide-react';

interface CurrencyDisplayProps {
  amount: number;
  showCode?: boolean;
  className?: string;
}

/**
 * Composant pour afficher un prix dans la devise courante
 * Utilise le CurrencyContext pour le formatage
 * Se met à jour automatiquement quand la devise change
 */
export function CurrencyDisplay({ amount, showCode = false, className }: CurrencyDisplayProps) {
  const { formatCurrency } = useCurrency();
  return (
    <span className={className}>
      {formatCurrency(amount, { showCode })}
    </span>
  );
}

/**
 * Hook pour formater les prix - à utiliser dans les composants client
 * Se met à jour automatiquement quand la devise change
 */
export function useFormatCurrency() {
  const { formatCurrency, currency, currencyCode, currencySymbol, currencyName } = useCurrency();
  
  return {
    format: formatCurrency,
    currencyCode,
    currencySymbol,
    currencyName,
    currency,
  };
}

/**
 * Hook pour obtenir les informations de devise courante
 */
export function useCurrencyInfo() {
  const { currency, currencyCode, currencySymbol, currencyName, currencies } = useCurrency();
  
  return {
    code: currencyCode,
    symbol: currencySymbol,
    name: currencyName,
    decimalPlaces: currency.decimalPlaces,
    symbolPosition: currency.symbolPosition,
    currencies,
  };
}

/**
 * Composant pour afficher le nom complet de la devise courante
 */
export function CurrencyName({ className }: { className?: string }) {
  const { currencyName } = useCurrency();
  return <span className={className}>{currencyName}</span>;
}

/**
 * Composant pour afficher le symbole de la devise courante
 */
export function CurrencySymbol({ className }: { className?: string }) {
  const { currencySymbol } = useCurrency();
  return <span className={className}>{currencySymbol}</span>;
}

/**
 * Composant pour afficher le code ISO de la devise courante
 */
export function CurrencyCode({ className }: { className?: string }) {
  const { currencyCode } = useCurrency();
  return <span className={className}>{currencyCode}</span>;
}

/**
 * Badge affichant la devise courante avec icône
 * Se met à jour automatiquement quand la devise change
 */
export function CurrencyBadge({ className }: { className?: string }) {
  const { currencyCode, currencySymbol } = useCurrency();
  return (
    <Badge variant="outline" className={`gap-1 ${className || ''}`}>
      <Receipt className="h-3 w-3" />
      {currencyCode}
    </Badge>
  );
}

/**
 * Composant pour afficher le symbole et le code de la devise
 */
export function CurrencyFull({ className }: { className?: string }) {
  const { currencyCode, currencySymbol, currencyName } = useCurrency();
  return (
    <span className={className}>
      {currencySymbol} ({currencyCode}) - {currencyName}
    </span>
  );
}

export default CurrencyDisplay;
