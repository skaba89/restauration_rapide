'use client';

// ============================================
// Restaurant OS - Theme Initializer
// Applies saved theme config from localStorage on app load
// Includes migration to force new emerald theme
// ============================================

import { useEffect } from 'react';
import { loadThemeConfig, applyTheme, DEFAULT_THEME_CONFIG } from '@/lib/theme-config';

const THEME_VERSION = 'restaurant-os-theme-v2';

export function ThemeInitializer() {
  useEffect(() => {
    // Check if theme has been migrated to v2 (emerald palette)
    const migrated = localStorage.getItem(THEME_VERSION);
    if (!migrated) {
      // Force-reset to new defaults (emerald theme)
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
