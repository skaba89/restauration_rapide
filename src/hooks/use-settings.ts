import { useSettingsStore, formatCurrency as formatCurrencyUtil, getCurrencySymbol as getCurrencySymbolUtil, type CurrencyCode } from '@/lib/settings-store';

// Hook for currency formatting
export function useCurrency() {
  const { currency, formatCurrency } = useSettingsStore();
  
  const format = (amount: number): string => {
    return formatCurrency(amount);
  };
  
  const symbol = getCurrencySymbolUtil(currency);
  
  const code = currency;
  
  return {
    format,
    symbol,
    code,
    formatWithCode: (amount: number) => `${format(amount)} (${currency})`,
  };
}

// Hook for settings
export function useSettings() {
  const store = useSettingsStore();
  
  return {
    // Currency & Country
    currency: store.currency,
    country: store.country,
    currencyInfo: store.getCurrencyInfo(),
    countryInfo: store.getCountryInfo(),
    setCurrency: store.setCurrency,
    setCountry: store.setCountry,
    
    // Restaurant
    currentRestaurant: store.currentRestaurant,
    restaurants: store.restaurants,
    setCurrentRestaurant: store.setCurrentRestaurant,
    setRestaurants: store.setRestaurants,
    
    // Features
    features: store.features,
    updateFeature: store.updateFeature,
    setFeatures: store.setFeatures,
    isFeatureEnabled: store.isFeatureEnabled,
    
    // UI
    language: store.language,
    theme: store.theme,
    setLanguage: store.setLanguage,
    setTheme: store.setTheme,
    
    // Helpers
    formatCurrency: store.formatCurrency,
  };
}
