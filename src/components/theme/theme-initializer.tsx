'use client';

// ============================================
// Restaurant OS - Theme Initializer
// Applies saved theme config from localStorage on app load
// ============================================

import { useEffect } from 'react';
import { loadThemeConfig, applyTheme } from '@/lib/theme-config';

export function ThemeInitializer() {
  useEffect(() => {
    // Apply the saved theme config on first mount
    const config = loadThemeConfig();
    applyTheme(config);
  }, []);

  // This component renders nothing visible
  return null;
}
