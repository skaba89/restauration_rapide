// ============================================
// RESTAURANT OS - Configuration Store
// Global configuration management (no hardcoded values)
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  format: string;
  thousandsSeparator: string;
  decimalSeparator: string;
  symbolPosition: 'before' | 'after';
}

export interface CountryConfig {
  code: string;
  name: string;
  dialCode: string;
  currencyCode: string;
  language: string;
  timezone: string;
  taxIncluded: boolean;
  mobileMoneyEnabled: boolean;
}

export interface RestaurantConfig {
  id: string;
  name: string;
  slug: string;
  slogan: string;
  logo?: string;
  color: string;
  currencyCode: string;
  countryCode: string;
  city: string;
  district: string;
  phone: string;
  email: string;
  deliveryFee: number;
  minOrderAmount: number;
  deliveryRadius: number;
  acceptsCash: boolean;
  acceptsMobileMoney: boolean;
  acceptsCard: boolean;
  isOpen: boolean;
}

// Default currencies
const DEFAULT_CURRENCIES: Record<string, Currency> = {
  XOF: {
    code: 'XOF',
    name: 'Franc CFA (BCEAO)',
    symbol: 'FCFA',
    decimalPlaces: 0,
    format: '{amount} {symbol}',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    symbolPosition: 'after',
  },
  XAF: {
    code: 'XAF',
    name: 'Franc CFA (BEAC)',
    symbol: 'FCFA',
    decimalPlaces: 0,
    format: '{amount} {symbol}',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    symbolPosition: 'after',
  },
  NGN: {
    code: 'NGN',
    name: 'Naira Nigérian',
    symbol: '₦',
    decimalPlaces: 2,
    format: '{symbol}{amount}',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
  },
  GHS: {
    code: 'GHS',
    name: 'Cedi Ghanéen',
    symbol: 'GH₵',
    decimalPlaces: 2,
    format: '{symbol}{amount}',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
  },
  KES: {
    code: 'KES',
    name: 'Shilling Kenyan',
    symbol: 'KSh',
    decimalPlaces: 2,
    format: '{symbol} {amount}',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
  },
  MAD: {
    code: 'MAD',
    name: 'Dirham Marocain',
    symbol: 'DH',
    decimalPlaces: 2,
    format: '{amount} {symbol}',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    symbolPosition: 'after',
  },
  TND: {
    code: 'TND',
    name: 'Dinar Tunisien',
    symbol: 'DT',
    decimalPlaces: 3,
    format: '{amount} {symbol}',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    symbolPosition: 'after',
  },
  ZAR: {
    code: 'ZAR',
    name: 'Rand Sud-Africain',
    symbol: 'R',
    decimalPlaces: 2,
    format: '{symbol}{amount}',
    thousandsSeparator: ' ',
    decimalSeparator: '.',
    symbolPosition: 'before',
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    decimalPlaces: 2,
    format: '{amount} {symbol}',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    symbolPosition: 'after',
  },
  USD: {
    code: 'USD',
    name: 'Dollar US',
    symbol: '$',
    decimalPlaces: 2,
    format: '{symbol}{amount}',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
  },
};

// Default countries
const DEFAULT_COUNTRIES: CountryConfig[] = [
  { code: 'CI', name: 'Côte d\'Ivoire', dialCode: '+225', currencyCode: 'XOF', language: 'fr', timezone: 'Africa/Abidjan', taxIncluded: true, mobileMoneyEnabled: true },
  { code: 'SN', name: 'Sénégal', dialCode: '+221', currencyCode: 'XOF', language: 'fr', timezone: 'Africa/Dakar', taxIncluded: true, mobileMoneyEnabled: true },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', currencyCode: 'NGN', language: 'en', timezone: 'Africa/Lagos', taxIncluded: false, mobileMoneyEnabled: true },
  { code: 'GH', name: 'Ghana', dialCode: '+233', currencyCode: 'GHS', language: 'en', timezone: 'Africa/Accra', taxIncluded: false, mobileMoneyEnabled: true },
  { code: 'KE', name: 'Kenya', dialCode: '+254', currencyCode: 'KES', language: 'en', timezone: 'Africa/Nairobi', taxIncluded: true, mobileMoneyEnabled: true },
  { code: 'MA', name: 'Maroc', dialCode: '+212', currencyCode: 'MAD', language: 'fr', timezone: 'Africa/Casablanca', taxIncluded: true, mobileMoneyEnabled: true },
  { code: 'TN', name: 'Tunisie', dialCode: '+216', currencyCode: 'TND', language: 'fr', timezone: 'Africa/Tunis', taxIncluded: true, mobileMoneyEnabled: true },
  { code: 'EG', name: 'Égypte', dialCode: '+20', currencyCode: 'EGP', language: 'ar', timezone: 'Africa/Cairo', taxIncluded: true, mobileMoneyEnabled: true },
  { code: 'ZA', name: 'Afrique du Sud', dialCode: '+27', currencyCode: 'ZAR', language: 'en', timezone: 'Africa/Johannesburg', taxIncluded: true, mobileMoneyEnabled: false },
  { code: 'CM', name: 'Cameroun', dialCode: '+237', currencyCode: 'XAF', language: 'fr', timezone: 'Africa/Douala', taxIncluded: true, mobileMoneyEnabled: true },
  { code: 'CD', name: 'RD Congo', dialCode: '+243', currencyCode: 'CDF', language: 'fr', timezone: 'Africa/Kinshasa', taxIncluded: true, mobileMoneyEnabled: true },
  { code: 'RW', name: 'Rwanda', dialCode: '+250', currencyCode: 'RWF', language: 'fr', timezone: 'Africa/Kigali', taxIncluded: true, mobileMoneyEnabled: true },
  { code: 'TZ', name: 'Tanzanie', dialCode: '+255', currencyCode: 'TZS', language: 'en', timezone: 'Africa/Dar_es_Salaam', taxIncluded: true, mobileMoneyEnabled: true },
  { code: 'UG', name: 'Ouganda', dialCode: '+256', currencyCode: 'UGX', language: 'en', timezone: 'Africa/Kampala', taxIncluded: true, mobileMoneyEnabled: true },
];

// Restaurant logos (SVG data URLs)
const RESTAURANT_LOGOS: Record<string, string> = {
  'palais-abidjan': 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#D4AF37" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">🍽️</text></svg>'),
  'maquis-koffi': 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#8B4513" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">🔥</text></svg>'),
  'jardin-savane': 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#228B22" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">🌿</text></svg>'),
  'teranga-abidjan': 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#FF6347" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">🤝</text></svg>'),
  'cafe-cacao': 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#6F4E37" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">☕</text></svg>'),
  'dakh-dakar': 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#1E90FF" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">🐟</text></svg>'),
  'chez-loutcha': 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#FF8C00" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">🏠</text></svg>'),
  'le-ngor': 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#20B2AA" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">🏝️</text></svg>'),
  'kitchen-lagos': 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#008000" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">🍲</text></svg>'),
  'mama-cass': 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#DC143C" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">👩‍🍳</text></svg>'),
  'yellow-chilli': 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#FFD700" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">🌶️</text></svg>'),
  'nok-alara': 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#8B0000" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">🎭</text></svg>'),
  'buka-accra': 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#FF4500" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">🍯</text></svg>'),
  'azmera-accra': 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#4169E1" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">🌟</text></svg>'),
  'papaye-accra': 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#32CD32" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">🍈</text></svg>'),
  'carnivore-nairobi': 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#800000" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">🥩</text></svg>'),
  'talisman-nairobi': 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#4B0082" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">✨</text></svg>'),
  'mama-oliech': 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#FF1493" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">🐟</text></svg>'),
  'maison-arabe': 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#C71585" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">🕌</text></svg>'),
  'nomad-marrakech': 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#DAA520" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">🐪</text></svg>'),
  'cabestan-casablanca': 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#006400" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">⚓</text></svg>'),
  'test-kitchen': 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#2F4F4F" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">🔬</text></svg>'),
  'la-table-ronde': 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#556B2F" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">👑</text></svg>'),
};

// Demo restaurants with full configuration
const DEMO_RESTAURANTS: RestaurantConfig[] = [
  {
    id: 'r1',
    name: "Le Palais d'Abidjan",
    slug: 'palais-abidjan',
    slogan: "L'art culinaire ivoirien",
    logo: RESTAURANT_LOGOS['palais-abidjan'],
    color: '#D4AF37',
    currencyCode: 'XOF',
    countryCode: 'CI',
    city: 'Abidjan',
    district: 'Plateau',
    phone: '+2250701010101',
    email: 'contact@palais-abidjan.com',
    deliveryFee: 500,
    minOrderAmount: 1000,
    deliveryRadius: 15,
    acceptsCash: true,
    acceptsMobileMoney: true,
    acceptsCard: true,
    isOpen: true,
  },
  {
    id: 'r2',
    name: 'Maquis Chez Koffi',
    slug: 'maquis-koffi',
    slogan: 'Le vrai goût de l\'Afrique',
    logo: RESTAURANT_LOGOS['maquis-koffi'],
    color: '#8B4513',
    currencyCode: 'XOF',
    countryCode: 'CI',
    city: 'Abidjan',
    district: 'Treichville',
    phone: '+2250702020202',
    email: 'koffi@maquis.ci',
    deliveryFee: 300,
    minOrderAmount: 500,
    deliveryRadius: 10,
    acceptsCash: true,
    acceptsMobileMoney: true,
    acceptsCard: false,
    isOpen: true,
  },
  {
    id: 'r3',
    name: 'The Kitchen Lagos',
    slug: 'kitchen-lagos',
    slogan: 'Naija flavors, global taste',
    logo: RESTAURANT_LOGOS['kitchen-lagos'],
    color: '#008000',
    currencyCode: 'NGN',
    countryCode: 'NG',
    city: 'Lagos',
    district: 'Victoria Island',
    phone: '+2348012345678',
    email: 'info@kitchenlagos.com',
    deliveryFee: 1500,
    minOrderAmount: 5000,
    deliveryRadius: 20,
    acceptsCash: true,
    acceptsMobileMoney: true,
    acceptsCard: true,
    isOpen: true,
  },
  {
    id: 'r4',
    name: 'Buka Restaurant',
    slug: 'buka-accra',
    slogan: 'Authentic African cuisine',
    logo: RESTAURANT_LOGOS['buka-accra'],
    color: '#FF4500',
    currencyCode: 'GHS',
    countryCode: 'GH',
    city: 'Accra',
    district: 'Osu',
    phone: '+233201234567',
    email: 'hello@bukaaccra.com',
    deliveryFee: 15,
    minOrderAmount: 50,
    deliveryRadius: 12,
    acceptsCash: true,
    acceptsMobileMoney: true,
    acceptsCard: true,
    isOpen: true,
  },
  {
    id: 'r5',
    name: 'Carnivore Nairobi',
    slug: 'carnivore-nairobi',
    slogan: "Africa's greatest eating experience",
    logo: RESTAURANT_LOGOS['carnivore-nairobi'],
    color: '#800000',
    currencyCode: 'KES',
    countryCode: 'KE',
    city: 'Nairobi',
    district: 'Langata',
    phone: '+254712345678',
    email: 'info@carnivore.co.ke',
    deliveryFee: 350,
    minOrderAmount: 1500,
    deliveryRadius: 25,
    acceptsCash: true,
    acceptsMobileMoney: true,
    acceptsCard: true,
    isOpen: true,
  },
  {
    id: 'r6',
    name: 'Le Dakh de Dakar',
    slug: 'dakh-dakar',
    slogan: 'L\'excellence sénégalaise',
    logo: RESTAURANT_LOGOS['dakh-dakar'],
    color: '#1E90FF',
    currencyCode: 'XOF',
    countryCode: 'SN',
    city: 'Dakar',
    district: 'Plateau',
    phone: '+221771234567',
    email: 'contact@ledakh.sn',
    deliveryFee: 600,
    minOrderAmount: 1500,
    deliveryRadius: 15,
    acceptsCash: true,
    acceptsMobileMoney: true,
    acceptsCard: true,
    isOpen: true,
  },
  {
    id: 'r7',
    name: 'La Maison Arabe',
    slug: 'maison-arabe',
    slogan: 'Legendary Moroccan hospitality',
    logo: RESTAURANT_LOGOS['maison-arabe'],
    color: '#C71585',
    currencyCode: 'MAD',
    countryCode: 'MA',
    city: 'Marrakech',
    district: 'Medina',
    phone: '+212524438404',
    email: 'reservation@lamaisonarabe.com',
    deliveryFee: 40,
    minOrderAmount: 150,
    deliveryRadius: 10,
    acceptsCash: true,
    acceptsMobileMoney: true,
    acceptsCard: true,
    isOpen: true,
  },
  {
    id: 'r8',
    name: 'The Test Kitchen',
    slug: 'test-kitchen',
    slogan: "Cape Town's finest dining",
    logo: RESTAURANT_LOGOS['test-kitchen'],
    color: '#2F4F4F',
    currencyCode: 'ZAR',
    countryCode: 'ZA',
    city: 'Le Cap',
    district: 'Woodstock',
    phone: '+27214487444',
    email: 'book@testkitchen.co.za',
    deliveryFee: 50,
    minOrderAmount: 200,
    deliveryRadius: 15,
    acceptsCash: true,
    acceptsMobileMoney: false,
    acceptsCard: true,
    isOpen: true,
  },
];

interface ConfigState {
  // Current selections
  currentRestaurant: RestaurantConfig | null;
  currentCurrency: Currency;
  currentCountry: CountryConfig;
  
  // Data
  restaurants: RestaurantConfig[];
  currencies: Record<string, Currency>;
  countries: CountryConfig[];
  
  // Actions
  setCurrentRestaurant: (restaurant: RestaurantConfig) => void;
  setCurrentCurrency: (currencyCode: string) => void;
  setCurrentCountry: (countryCode: string) => void;
  
  // Helpers
  formatCurrency: (amount: number) => string;
  getCurrency: (code: string) => Currency;
  getCountry: (code: string) => CountryConfig | undefined;
  getRestaurant: (slug: string) => RestaurantConfig | undefined;
}

export const useConfig = create<ConfigState>()(
  persist(
    (set, get) => ({
      // Default state
      currentRestaurant: DEMO_RESTAURANTS[0],
      currentCurrency: DEFAULT_CURRENCIES.XOF,
      currentCountry: DEFAULT_COUNTRIES[0],
      restaurants: DEMO_RESTAURANTS,
      currencies: DEFAULT_CURRENCIES,
      countries: DEFAULT_COUNTRIES,
      
      // Actions
      setCurrentRestaurant: (restaurant) => {
        const currency = DEFAULT_CURRENCIES[restaurant.currencyCode];
        const country = DEFAULT_COUNTRIES.find(c => c.code === restaurant.countryCode);
        set({ 
          currentRestaurant: restaurant,
          currentCurrency: currency || DEFAULT_CURRENCIES.XOF,
          currentCountry: country || DEFAULT_COUNTRIES[0],
        });
      },
      
      setCurrentCurrency: (currencyCode) => {
        const currency = DEFAULT_CURRENCIES[currencyCode];
        if (currency) {
          set({ currentCurrency: currency });
        }
      },
      
      setCurrentCountry: (countryCode) => {
        const country = DEFAULT_COUNTRIES.find(c => c.code === countryCode);
        if (country) {
          const currency = DEFAULT_CURRENCIES[country.currencyCode];
          set({ 
            currentCountry: country,
            currentCurrency: currency || get().currentCurrency,
          });
        }
      },
      
      // Helper: Format currency based on current settings
      formatCurrency: (amount: number) => {
        const { currentCurrency } = get();
        const formatted = amount.toLocaleString('fr-FR', {
          minimumFractionDigits: currentCurrency.decimalPlaces,
          maximumFractionDigits: currentCurrency.decimalPlaces,
        });
        
        if (currentCurrency.symbolPosition === 'before') {
          return `${currentCurrency.symbol}${formatted}`;
        }
        return `${formatted} ${currentCurrency.symbol}`;
      },
      
      // Helper: Get currency by code
      getCurrency: (code: string) => {
        return DEFAULT_CURRENCIES[code] || DEFAULT_CURRENCIES.XOF;
      },
      
      // Helper: Get country by code
      getCountry: (code: string) => {
        return DEFAULT_COUNTRIES.find(c => c.code === code);
      },
      
      // Helper: Get restaurant by slug
      getRestaurant: (slug: string) => {
        return DEMO_RESTAURANTS.find(r => r.slug === slug);
      },
    }),
    {
      name: 'restaurant-os-config',
      partialize: (state) => ({
        currentRestaurant: state.currentRestaurant,
      }),
    }
  )
);

export { DEFAULT_CURRENCIES, DEFAULT_COUNTRIES, DEMO_RESTAURANTS, RESTAURANT_LOGOS };
