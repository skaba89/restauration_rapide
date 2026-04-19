'use client';

// ============================================
// Restaurant OS - Theme Initializer
// Applies saved theme config from localStorage on app load
// Forces migration to new Commercial Pro palette
// ============================================

import { useEffect } from 'react';
import { loadThemeConfig, applyTheme, DEFAULT_THEME_CONFIG } from '@/lib/theme-config';

const THEME_VERSION = 'restaurant-os-theme-v3';

export function ThemeInitializer() {
  useEffect(() => {
    // Check if theme has been migrated to v3 (Commercial Pro palette)
    const migrated = localStorage.getItem(THEME_VERSION);
    if (!migrated) {
      // Force-reset to new defaults (Commercial Pro palette)
      localStorage.setItem('restaurant-os-theme-config', JSON.stringify(DEFAULT_THEME_CONFIG));
      localStorage.setItem(THEME_VERSION, 'true');
      applyTheme(DEFAULT_THEME_CONFIG);
    } else {
      // Apply the saved theme config
      const config = loadThemeConfig();
      applyTheme(config);
    }
  }, []);

  // This component renders nothing visible
  return null;
}
