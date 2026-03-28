// ============================================
// RESTAURANT OS - Multi-Currency Configuration
// No hardcoded currencies - fully dynamic
// ============================================

export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  format: string; // e.g., "{symbol}{amount}" or "{amount} {code}"
  thousandsSeparator: string;
  decimalSeparator: string;
  symbolPosition: 'before' | 'after';
  countries: string[];
}

// All supported currencies
export const CURRENCIES: Record<string, CurrencyConfig> = {
  // West African CFA Franc
  XOF: {
    code: 'XOF',
    name: 'Franc CFA (BCEAO)',
    symbol: 'FCFA',
    decimalPlaces: 0,
    format: '{amount} {symbol}',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    symbolPosition: 'after',
    countries: ['CI', 'SN', 'ML', 'BF', 'BJ', 'NE', 'TG', 'GW'],
  },
  // Central African CFA Franc
  XAF: {
    code: 'XAF',
    name: 'Franc CFA (BEAC)',
    symbol: 'FCFA',
    decimalPlaces: 0,
    format: '{amount} {symbol}',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    symbolPosition: 'after',
    countries: ['CM', 'CF', 'CG', 'GA', 'GQ', 'TD'],
  },
  // Nigerian Naira
  NGN: {
    code: 'NGN',
    name: 'Naira Nigérian',
    symbol: '₦',
    decimalPlaces: 2,
    format: '{symbol}{amount}',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    countries: ['NG'],
  },
  // Ghanaian Cedi
  GHS: {
    code: 'GHS',
    name: 'Cedi Ghanéen',
    symbol: 'GH₵',
    decimalPlaces: 2,
    format: '{symbol}{amount}',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    countries: ['GH'],
  },
  // Kenyan Shilling
  KES: {
    code: 'KES',
    name: 'Shilling Kenyan',
    symbol: 'KSh',
    decimalPlaces: 2,
    format: '{symbol} {amount}',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    countries: ['KE'],
  },
  // Ugandan Shilling
  UGX: {
    code: 'UGX',
    name: 'Shilling Ougandais',
    symbol: 'USh',
    decimalPlaces: 0,
    format: '{symbol}{amount}',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    countries: ['UG'],
  },
  // Tanzanian Shilling
  TZS: {
    code: 'TZS',
    name: 'Shilling Tanzanien',
    symbol: 'TSh',
    decimalPlaces: 2,
    format: '{symbol}{amount}',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    countries: ['TZ'],
  },
  // Congolese Franc
  CDF: {
    code: 'CDF',
    name: 'Franc Congolais',
    symbol: 'FC',
    decimalPlaces: 2,
    format: '{amount} {symbol}',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    symbolPosition: 'after',
    countries: ['CD'],
  },
  // Rwandan Franc
  RWF: {
    code: 'RWF',
    name: 'Franc Rwandais',
    symbol: 'FRw',
    decimalPlaces: 0,
    format: '{amount} {symbol}',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    symbolPosition: 'after',
    countries: ['RW'],
  },
  // Moroccan Dirham
  MAD: {
    code: 'MAD',
    name: 'Dirham Marocain',
    symbol: 'DH',
    decimalPlaces: 2,
    format: '{amount} {symbol}',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    symbolPosition: 'after',
    countries: ['MA'],
  },
  // Tunisian Dinar
  TND: {
    code: 'TND',
    name: 'Dinar Tunisien',
    symbol: 'DT',
    decimalPlaces: 3,
    format: '{amount} {symbol}',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    symbolPosition: 'after',
    countries: ['TN'],
  },
  // Egyptian Pound
  EGP: {
    code: 'EGP',
    name: 'Livre Égyptienne',
    symbol: 'E£',
    decimalPlaces: 2,
    format: '{symbol}{amount}',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    countries: ['EG'],
  },
  // South African Rand
  ZAR: {
    code: 'ZAR',
    name: 'Rand Sud-Africain',
    symbol: 'R',
    decimalPlaces: 2,
    format: '{symbol}{amount}',
    thousandsSeparator: ' ',
    decimalSeparator: '.',
    symbolPosition: 'before',
    countries: ['ZA'],
  },
  // Euro (for international)
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    decimalPlaces: 2,
    format: '{amount} {symbol}',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    symbolPosition: 'after',
    countries: ['FR', 'BE', 'DE', 'IT', 'ES', 'PT'],
  },
  // US Dollar (for international)
  USD: {
    code: 'USD',
    name: 'Dollar Américain',
    symbol: '$',
    decimalPlaces: 2,
    format: '{symbol}{amount}',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    countries: ['US'],
  },
  // British Pound
  GBP: {
    code: 'GBP',
    name: 'Livre Sterling',
    symbol: '£',
    decimalPlaces: 2,
    format: '{symbol}{amount}',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    countries: ['GB'],
  },
  // Guinean Franc
  GNF: {
    code: 'GNF',
    name: 'Franc Guinéen',
    symbol: 'GNF',
    decimalPlaces: 0,
    format: '{amount} {symbol}',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    symbolPosition: 'after',
    countries: ['GN'],
  },
};

// Format currency amount
export function formatCurrency(
  amount: number,
  currencyCode: string,
  options?: { showCode?: boolean }
): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  
  // Round to decimal places
  const rounded = Number(amount.toFixed(currency.decimalPlaces));
  
  // Format number
  const parts = rounded.toFixed(currency.decimalPlaces).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandsSeparator);
  let formattedAmount = integerPart;
  
  if (currency.decimalPlaces > 0 && parts[1]) {
    formattedAmount += currency.decimalSeparator + parts[1];
  }
  
  // Apply format
  let result = currency.format
    .replace('{amount}', formattedAmount)
    .replace('{symbol}', currency.symbol)
    .replace('{code}', currency.code);
  
  if (options?.showCode) {
    result += ` ${currency.code}`;
  }
  
  return result;
}

// Parse currency string to number
export function parseCurrency(value: string, currencyCode: string): number {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  
  // Remove symbol and code
  let cleaned = value
    .replace(currency.symbol, '')
    .replace(currency.code, '')
    .replace(currency.thousandsSeparator, '')
    .replace(currency.decimalSeparator, '.')
    .trim();
  
  return parseFloat(cleaned) || 0;
}

// Get currency by country
export function getCurrencyByCountry(countryCode: string): CurrencyConfig {
  for (const currency of Object.values(CURRENCIES)) {
    if (currency.countries.includes(countryCode)) {
      return currency;
    }
  }
  return CURRENCIES.USD; // Default fallback
}

// Exchange rates (would be fetched from API in production)
export const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  XOF: { USD: 0.00165, EUR: 0.00152, NGN: 2.54, GHS: 0.025 },
  XAF: { USD: 0.00165, EUR: 0.00152, USD: 0.00165 },
  NGN: { USD: 0.00065, EUR: 0.0006, XOF: 0.39 },
  GHS: { USD: 0.065, EUR: 0.06, XOF: 40 },
  KES: { USD: 0.0077, EUR: 0.0071 },
  UGX: { USD: 0.00026, EUR: 0.00024 },
  TZS: { USD: 0.00039, EUR: 0.00036 },
  CDF: { USD: 0.00035, EUR: 0.00032 },
  RWF: { USD: 0.00079, EUR: 0.00073 },
  MAD: { USD: 0.099, EUR: 0.091 },
  TND: { USD: 0.31, EUR: 0.29 },
  EGP: { USD: 0.02, EUR: 0.018 },
  ZAR: { USD: 0.054, EUR: 0.05 },
  EUR: { USD: 1.08, XOF: 655.96, NGN: 1550 },
  USD: { EUR: 0.93, XOF: 607.5, NGN: 1538 },
  GBP: { USD: 1.27, EUR: 1.17 },
};

// Convert between currencies
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) return amount;
  
  const rates = EXCHANGE_RATES[fromCurrency];
  if (rates && rates[toCurrency]) {
    return amount * rates[toCurrency];
  }
  
  // Try via USD as intermediary
  if (rates && rates.USD && EXCHANGE_RATES.USD[toCurrency]) {
    return amount * rates.USD * EXCHANGE_RATES.USD[toCurrency];
  }
  
  return amount; // Fallback
}
