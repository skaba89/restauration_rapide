'use client';

import { useCurrency } from '@/lib/currency-context';
import { CURRENCIES } from '@/lib/currency';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign } from 'lucide-react';

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();

  return (
    <Select value={currency.code} onValueChange={setCurrency}>
      <SelectTrigger className="w-[120px]">
        <DollarSign className="h-4 w-4 mr-2" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(CURRENCIES).map(([code, config]) => (
          <SelectItem key={code} value={code}>
            {config.symbol} - {config.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default CurrencySelector;
