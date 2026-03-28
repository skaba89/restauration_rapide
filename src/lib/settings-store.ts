import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Available currencies with their formatting
export const CURRENCIES = {
  XOF: { code: 'XOF', symbol: 'FCFA', name: 'Franc CFA (BCEAO)', locale: 'fr-SN', position: 'after' },
  XAF: { code: 'XAF', symbol: 'FCFA', name: 'Franc CFA (BEAC)', locale: 'fr-CM', position: 'after' },
  CDF: { code: 'CDF', symbol: 'FC', name: 'Franc Congolais', locale: 'fr-CD', position: 'after' },
  GHS: { code: 'GHS', symbol: 'GH₵', name: 'Cedi Ghanéen', locale: 'en-GH', position: 'before' },
  NGN: { code: 'NGN', symbol: '₦', name: 'Naira Nigérian', locale: 'en-NG', position: 'before' },
  KES: { code: 'KES', symbol: 'KSh', name: 'Shilling Kenyan', locale: 'en-KE', position: 'before' },
  UGX: { code: 'UGX', symbol: 'USh', name: 'Shilling Ougandais', locale: 'en-UG', position: 'before' },
  RWF: { code: 'RWF', symbol: 'FRw', name: 'Franc Rwandais', locale: 'fr-RW', position: 'after' },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'Rand Sud-Africain', locale: 'en-ZA', position: 'before' },
  USD: { code: 'USD', symbol: '$', name: 'Dollar US', locale: 'en-US', position: 'before' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'fr-FR', position: 'after' },
  MAD: { code: 'MAD', symbol: 'DH', name: 'Dirham Marocain', locale: 'ar-MA', position: 'after' },
  TND: { code: 'TND', symbol: 'DT', name: 'Dinar Tunisien', locale: 'ar-TN', position: 'after' },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

// Available countries
export const COUNTRIES = {
  CI: { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮', currency: 'XOF', phoneCode: '+225' },
  SN: { code: 'SN', name: 'Sénégal', flag: '🇸🇳', currency: 'XOF', phoneCode: '+221' },
  ML: { code: 'ML', name: 'Mali', flag: '🇲🇱', currency: 'XOF', phoneCode: '+223' },
  BF: { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫', currency: 'XOF', phoneCode: '+226' },
  BJ: { code: 'BJ', name: 'Bénin', flag: '🇧🇯', currency: 'XOF', phoneCode: '+229' },
  NE: { code: 'NE', name: 'Niger', flag: '🇳🇪', currency: 'XOF', phoneCode: '+227' },
  TG: { code: 'TG', name: 'Togo', flag: '🇹🇬', currency: 'XOF', phoneCode: '+228' },
  GN: { code: 'GN', name: 'Guinée', flag: '🇬🇳', currency: 'GNF', phoneCode: '+224' },
  CM: { code: 'CM', name: 'Cameroun', flag: '🇨🇲', currency: 'XAF', phoneCode: '+237' },
  CD: { code: 'CD', name: 'RD Congo', flag: '🇨🇩', currency: 'CDF', phoneCode: '+243' },
  GH: { code: 'GH', name: 'Ghana', flag: '🇬🇭', currency: 'GHS', phoneCode: '+233' },
  NG: { code: 'NG', name: 'Nigeria', flag: '🇳🇬', currency: 'NGN', phoneCode: '+234' },
  KE: { code: 'KE', name: 'Kenya', flag: '🇰🇪', currency: 'KES', phoneCode: '+254' },
  UG: { code: 'UG', name: 'Ouganda', flag: '🇺🇬', currency: 'UGX', phoneCode: '+256' },
  RW: { code: 'RW', name: 'Rwanda', flag: '🇷🇼', currency: 'RWF', phoneCode: '+250' },
  ZA: { code: 'ZA', name: 'Afrique du Sud', flag: '🇿🇦', currency: 'ZAR', phoneCode: '+27' },
  MA: { code: 'MA', name: 'Maroc', flag: '🇲🇦', currency: 'MAD', phoneCode: '+212' },
  TN: { code: 'TN', name: 'Tunisie', flag: '🇹🇳', currency: 'TND', phoneCode: '+216' },
} as const;

export type CountryCode = keyof typeof COUNTRIES;

// Feature flags
export interface FeatureFlags {
  pos: boolean;
  deliveries: boolean;
  reservations: boolean;
  loyalty: boolean;
  kitchenDisplay: boolean;
  analytics: boolean;
  multiRestaurant: boolean;
  messaging: boolean;
  onlinePayment: boolean;
  cashPayment: boolean;
  mobileMoney: boolean;
  tips: boolean;
  reviews: boolean;
  promotions: boolean;
  inventory: boolean;
  staffManagement: boolean;
}

// Restaurant info
export interface RestaurantInfo {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  openingHours: {
    open: string;
    close: string;
    days: string[];
  };
  deliveryFee: number;
  minOrderAmount: number;
  deliveryTime: {
    min: number;
    max: number;
  };
}

// Settings store interface
interface SettingsStore {
  // Currency & Country
  currency: CurrencyCode;
  country: CountryCode;
  
  // Restaurant
  currentRestaurant: RestaurantInfo | null;
  restaurants: RestaurantInfo[];
  
  // Features
  features: FeatureFlags;
  
  // UI Preferences
  language: string;
  theme: 'light' | 'dark' | 'system';
  
  // Actions
  setCurrency: (currency: CurrencyCode) => void;
  setCountry: (country: CountryCode) => void;
  setCurrentRestaurant: (restaurant: RestaurantInfo) => void;
  setRestaurants: (restaurants: RestaurantInfo[]) => void;
  updateFeature: (feature: keyof FeatureFlags, value: boolean) => void;
  setFeatures: (features: FeatureFlags) => void;
  setLanguage: (language: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Helpers
  getCurrencyInfo: () => typeof CURRENCIES[CurrencyCode];
  getCountryInfo: () => typeof COUNTRIES[CountryCode];
  formatCurrency: (amount: number) => string;
  isFeatureEnabled: (feature: keyof FeatureFlags) => boolean;
}

// Default features
const DEFAULT_FEATURES: FeatureFlags = {
  pos: true,
  deliveries: true,
  reservations: true,
  loyalty: true,
  kitchenDisplay: true,
  analytics: true,
  multiRestaurant: false,
  messaging: true,
  onlinePayment: true,
  cashPayment: true,
  mobileMoney: true,
  tips: true,
  reviews: true,
  promotions: true,
  inventory: true,
  staffManagement: true,
};

// Default restaurant
const DEFAULT_RESTAURANT: RestaurantInfo = {
  id: 'default',
  name: 'Le Petit Maquis',
  slug: 'le-petit-maquis',
  address: 'Cocody, Riviera 2, Abidjan',
  phone: '+225 07 00 00 00 00',
  email: 'contact@lepetitmaquis.com',
  openingHours: {
    open: '11:00',
    close: '23:00',
    days: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
  },
  deliveryFee: 500,
  minOrderAmount: 1000,
  deliveryTime: {
    min: 25,
    max: 45,
  },
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // Initial values
      currency: 'XOF',
      country: 'CI',
      currentRestaurant: DEFAULT_RESTAURANT,
      restaurants: [DEFAULT_RESTAURANT],
      features: DEFAULT_FEATURES,
      language: 'fr',
      theme: 'system',
      
      // Actions
      setCurrency: (currency) => set({ currency }),
      setCountry: (country) => set({ country }),
      setCurrentRestaurant: (restaurant) => set({ currentRestaurant: restaurant }),
      setRestaurants: (restaurants) => set({ restaurants }),
      updateFeature: (feature, value) => set((state) => ({
        features: { ...state.features, [feature]: value }
      })),
      setFeatures: (features) => set({ features }),
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      
      // Helpers
      getCurrencyInfo: () => CURRENCIES[get().currency],
      getCountryInfo: () => COUNTRIES[get().country],
      
      formatCurrency: (amount) => {
        const { currency } = get();
        const currencyInfo = CURRENCIES[currency];
        
        if (currencyInfo.position === 'before') {
          return `${currencyInfo.symbol}${amount.toLocaleString(currencyInfo.locale)}`;
        }
        return `${amount.toLocaleString(currencyInfo.locale)} ${currencyInfo.symbol}`;
      },
      
      isFeatureEnabled: (feature) => get().features[feature],
    }),
    {
      name: 'restaurant-settings',
      partialize: (state) => ({
        currency: state.currency,
        country: state.country,
        currentRestaurant: state.currentRestaurant,
        features: state.features,
        language: state.language,
        theme: state.theme,
      }),
    }
  )
);

// Export helper functions for use outside React components
export const formatCurrency = (amount: number, currencyCode?: CurrencyCode): string => {
  const code = currencyCode || useSettingsStore.getState().currency;
  const currencyInfo = CURRENCIES[code];
  
  if (currencyInfo.position === 'before') {
    return `${currencyInfo.symbol}${amount.toLocaleString(currencyInfo.locale)}`;
  }
  return `${amount.toLocaleString(currencyInfo.locale)} ${currencyInfo.symbol}`;
};

export const getCurrencySymbol = (currencyCode?: CurrencyCode): string => {
  const code = currencyCode || useSettingsStore.getState().currency;
  return CURRENCIES[code].symbol;
};

export const getCountryPhoneCode = (countryCode?: CountryCode): string => {
  const code = countryCode || useSettingsStore.getState().country;
  return COUNTRIES[code].phoneCode;
};
