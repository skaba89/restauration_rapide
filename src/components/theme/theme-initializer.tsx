'use client';

// ============================================
// Restaurant OS - Theme Initializer
// Forces migration to Menthe Vive palette v6
// ============================================

import { useEffect } from 'react';
import { loadThemeConfig, applyTheme, DEFAULT_THEME_CONFIG } from '@/lib/theme-config';

const THEME_VERSION = 'restaurant-os-theme-v6';

export function ThemeInitializer() {
  useEffect(() => {
    const migrated = localStorage.getItem(THEME_VERSION);
    if (!migrated) {
      localStorage.setItem('restaurant-os-theme-config', JSON.stringify(DEFAULT_THEME_CONFIG));
      localStorage.setItem(THEME_VERSION, 'true');
      applyTheme(DEFAULT_THEME_CONFIG);
    } else {
      const config = loadThemeConfig();
      applyTheme(config);
    }
  }, []);

  return null;
}
