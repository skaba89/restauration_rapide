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
import { Button } from '@/components/ui/button';
import { Coins } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useState } from 'react';

const POPULAR_CURRENCIES = ['GNF', 'XOF', 'NGN', 'GHS', 'USD', 'EUR'];

export function CurrencySelector() {
  const { currencyCode, setCurrency, currencySymbol } = useCurrency();

  return (
    <Select value={currencyCode} onValueChange={setCurrency}>
      <SelectTrigger className="w-[130px] h-9">
        <Coins className="h-4 w-4 mr-1 text-muted-foreground" />
        <SelectValue placeholder="Devise" />
      </SelectTrigger>
      <SelectContent>
        {POPULAR_CURRENCIES.map((code) => {
          const curr = CURRENCIES[code];
          if (!curr) return null;
          return (
            <SelectItem key={code} value={code}>
              <span className="flex items-center gap-2">
                <span className="font-medium">{curr.symbol}</span>
                <span className="text-muted-foreground">{code}</span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

export function CurrencySelectorFull() {
  const { currencyCode, setCurrency, currencySymbol } = useCurrency();
  const [search, setSearch] = useState('');

  const filteredCurrencies = Object.entries(CURRENCIES)
    .filter(([code, curr]) => 
      code.toLowerCase().includes(search.toLowerCase()) ||
      curr.name.toLowerCase().includes(search.toLowerCase()) ||
      curr.symbol.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      // Sort popular currencies first
      const aPopular = POPULAR_CURRENCIES.includes(a[0]);
      const bPopular = POPULAR_CURRENCIES.includes(b[0]);
      if (aPopular && !bPopular) return -1;
      if (!aPopular && bPopular) return 1;
      return a[0].localeCompare(b[0]);
    });

  return (
    <Select value={currencyCode} onValueChange={setCurrency}>
      <SelectTrigger className="w-full">
        <Coins className="h-4 w-4 mr-2 text-muted-foreground" />
        <SelectValue placeholder="Sélectionner une devise" />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        <div className="p-2 border-b sticky top-0 bg-popover">
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full h-8 px-2 text-sm border rounded"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        {filteredCurrencies.map(([code, curr]) => (
          <SelectItem key={code} value={code}>
            <span className="flex items-center gap-2">
              <span className="font-bold w-12">{curr.symbol}</span>
              <span className="flex-1">{curr.name}</span>
              <span className="text-xs text-muted-foreground">({code})</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function CurrencySelectorPopover() {
  const { currencyCode, setCurrency, currencySymbol, currencyName, currencies } = useCurrency();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Coins className="h-4 w-4" />
          <span className="font-medium">{currencySymbol}</span>
          <span className="text-muted-foreground text-xs">{currencyCode}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="end">
        <div className="p-3 border-b">
          <h4 className="font-medium">Devise</h4>
          <p className="text-sm text-muted-foreground">
            Actuelle: {currencyName}
          </p>
        </div>
        <div className="p-2 max-h-[250px] overflow-auto">
          <div className="mb-2">
            <p className="text-xs text-muted-foreground px-2 py-1">Populaires</p>
            {POPULAR_CURRENCIES.map((code) => {
              const curr = CURRENCIES[code];
              if (!curr) return null;
              const isSelected = code === currencyCode;
              return (
                <button
                  key={code}
                  onClick={() => {
                    setCurrency(code);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <span className="font-bold w-10">{curr.symbol}</span>
                  <span className="flex-1">{curr.name}</span>
                  <span className={`text-xs ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {code}
                  </span>
                </button>
              );
            })}
          </div>
          <div>
            <p className="text-xs text-muted-foreground px-2 py-1">Toutes les devises</p>
            {Object.entries(CURRENCIES)
              .filter(([code]) => !POPULAR_CURRENCIES.includes(code))
              .map(([code, curr]) => {
                const isSelected = code === currencyCode;
                return (
                  <button
                    key={code}
                    onClick={() => {
                      setCurrency(code);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <span className="font-bold w-10">{curr.symbol}</span>
                    <span className="flex-1 truncate">{curr.name}</span>
                    <span className={`text-xs ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {code}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default CurrencySelector;
