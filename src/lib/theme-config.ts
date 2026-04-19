'use client';

// ============================================
// Restaurant OS - Theme Configuration System
// Comprehensive theme customization with OKLCH color support
// ============================================

// --- Types ---

export interface ThemeConfig {
  preset: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontHeading: string;
  fontBody: string;
  borderRadius: number;
  sidebarStyle: 'dark' | 'light' | 'colored';
  sidebarColor: string;
  targetPages: string[];
}

// --- Color Presets (African Restaurant Inspired) ---

export interface ColorPreset {
  name: string;
  label: string;
  primary: string;
  secondary: string;
  accent: string;
  description: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    name: 'moderne-pro',
    label: 'Moderne Pro',
    primary: '#059669',
    secondary: '#d1fae5',
    accent: '#047857',
    description: 'Palette moderne émeraude, élégante et professionnelle',
  },
  {
    name: 'classique-orange',
    label: 'Classique Orange',
    primary: '#f97316',
    secondary: '#fed7aa',
    accent: '#ea580c',
    description: 'Le thème original chaleureux de Restaurant OS',
  },
  {
    name: 'vert-afrique',
    label: 'Vert Afrique',
    primary: '#16a34a',
    secondary: '#bbf7d0',
    accent: '#15803d',
    description: 'Tons émeraude inspirés des forêts africaines',
  },
  {
    name: 'bleu-ocean',
    label: 'Bleu Océan',
    primary: '#0ea5e9',
    secondary: '#bae6fd',
    accent: '#0284c7',
    description: 'Tons bleus océaniques frais et apaisants',
  },
  {
    name: 'rouge-passion',
    label: 'Rouge Passion',
    primary: '#dc2626',
    secondary: '#fecaca',
    accent: '#b91c1c',
    description: 'Rouge passion pour une ambiance vibrante',
  },
  {
    name: 'violet-royal',
    label: 'Violet Royal',
    primary: '#9333ea',
    secondary: '#e9d5ff',
    accent: '#7e22ce',
    description: 'Tons violet pour une touche royale',
  },
  {
    name: 'rose-flamme',
    label: 'Rose Flamme',
    primary: '#ec4899',
    secondary: '#fce7f3',
    accent: '#db2777',
    description: 'Rose vif pour une ambiance moderne',
  },
  {
    name: 'ambre-dore',
    label: 'Ambre Doré',
    primary: '#d97706',
    secondary: '#fef3c7',
    accent: '#b45309',
    description: 'Tons dorés et ambrés pour un luxe subtil',
  },
  {
    name: 'slate-moderne',
    label: 'Slate Moderne',
    primary: '#475569',
    secondary: '#e2e8f0',
    accent: '#334155',
    description: 'Palette neutre et professionnelle',
  },
];

// --- Font Options ---

export const FONT_OPTIONS = [
  'Inter',
  'Poppins',
  'Montserrat',
  'Roboto',
  'Playfair Display',
  'Nunito',
  'Lato',
  'Plus Jakarta Sans',
  'Outfit',
  'DM Sans',
] as const;

export type FontOption = (typeof FONT_OPTIONS)[number];

// --- Default Config ---

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  preset: 'moderne-pro',
  primaryColor: '#059669',
  secondaryColor: '#d1fae5',
  accentColor: '#047857',
  fontHeading: 'Inter',
  fontBody: 'Inter',
  borderRadius: 0.625,
  sidebarStyle: 'dark',
  sidebarColor: '#064e3b',
  targetPages: ['admin', 'pos', 'kitchen', 'driver', 'public', 'organisateur'],
};

// --- Storage Keys ---

const THEME_CONFIG_STORAGE_KEY = 'restaurant-os-theme-config';

// --- Color Conversion Utilities ---

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ];
}

function linearRgbToOkLab(r: number, g: number, b: number): [number, number, number] {
  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  ];
}

export function hexToOkLCH(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  const linearize = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const [L, a, b2] = linearRgbToOkLab(linearize(r), linearize(g), linearize(b));
  const C = Math.sqrt(a * a + b2 * b2);
  let H = Math.atan2(b2, a) * (180 / Math.PI);
  if (H < 0) H += 360;
  return `oklch(${L.toFixed(4)} ${(C * 100).toFixed(2)} ${H.toFixed(2)})`;
}

/**
 * Determine whether to use white or black text on a given hex color
 * based on relative luminance.
 */
function getContrastForeground(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.4 ? '#000000' : '#ffffff';
}

/**
 * Lighten a hex color by a given amount (0-1).
 */
function lightenHex(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const lighten = (c: number) => Math.min(1, c + (1 - c) * amount);
  const toHex = (c: number) =>
    Math.round(c * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(lighten(r))}${toHex(lighten(g))}${toHex(lighten(b))}`;
}

/**
 * Darken a hex color by a given amount (0-1).
 */
function darkenHex(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const darken = (c: number) => Math.max(0, c * (1 - amount));
  const toHex = (c: number) =>
    Math.round(c * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(darken(r))}${toHex(darken(g))}${toHex(darken(b))}`;
}

/**
 * Get the relative luminance of a hex color (0-1).
 */
function getLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// --- Google Fonts Loading ---

const loadedFonts = new Set<string>();

export function loadGoogleFont(fontName: string): void {
  if (loadedFonts.has(fontName)) return;

  const weightMap: Record<string, string> = {
    'Playfair Display': '400;500;600;700',
    'Poppins': '300;400;500;600;700',
    'Montserrat': '300;400;500;600;700',
    'Roboto': '300;400;500;700',
    'Inter': '300;400;500;600;700',
    'Nunito': '300;400;500;600;700',
    'Lato': '300;400;700',
    'Plus Jakarta Sans': '300;400;500;600;700',
    'Outfit': '300;400;500;600;700',
    'DM Sans': '300;400;500;600;700',
  };

  const weights = weightMap[fontName] || '400;500;600';
  const encodedFont = fontName.replace(/ /g, '+');

  const linkId = `google-font-${encodedFont}`;
  if (document.getElementById(linkId)) {
    loadedFonts.add(fontName);
    return;
  }

  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@${weights}&display=swap`;
  document.head.appendChild(link);
  loadedFonts.add(fontName);
}

// --- Apply Theme ---

export function applyTheme(config: ThemeConfig): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // 1. Convert colors to OKLCH and set CSS variables
  const primaryOkLCH = hexToOkLCH(config.primaryColor);
  const primaryFg = hexToOkLCH(getContrastForeground(config.primaryColor));
  const secondaryOkLCH = hexToOkLCH(config.secondaryColor);
  const secondaryFg = hexToOkLCH(getContrastForeground(config.secondaryColor));
  const accentOkLCH = hexToOkLCH(config.accentColor);
  const accentFg = hexToOkLCH(getContrastForeground(config.accentColor));

  // Muted tones derived from secondary
  const mutedOkLCH = hexToOkLCH(lightenHex(config.secondaryColor, 0.1));
  const mutedForegroundOkLCH = hexToOkLCH(darkenHex(config.secondaryColor, 0.5));

  root.style.setProperty('--primary', primaryOkLCH);
  root.style.setProperty('--primary-foreground', primaryFg);
  root.style.setProperty('--secondary', secondaryOkLCH);
  root.style.setProperty('--secondary-foreground', secondaryFg);
  root.style.setProperty('--accent', accentOkLCH);
  root.style.setProperty('--accent-foreground', accentFg);
  root.style.setProperty('--muted', mutedOkLCH);
  root.style.setProperty('--muted-foreground', mutedForegroundOkLCH);
  root.style.setProperty('--ring', hexToOkLCH(config.primaryColor));

  // Chart colors derived from primary palette
  const chartColors = [
    config.primaryColor,
    lightenHex(config.primaryColor, 0.2),
    lightenHex(config.primaryColor, 0.4),
    config.accentColor,
    config.secondaryColor,
  ];
  chartColors.forEach((color, i) => {
    root.style.setProperty(`--chart-${i + 1}`, hexToOkLCH(color));
  });

  // 2. Border radius
  root.style.setProperty('--radius', `${config.borderRadius}rem`);

  // 3. Fonts
  const headingFamily = `'${config.fontHeading}', sans-serif`;
  const bodyFamily = `'${config.fontBody}', sans-serif`;
  root.style.setProperty('--font-heading', headingFamily);
  root.style.setProperty('--font-body', bodyFamily);

  // Apply heading font to heading elements
  const headingElements = root.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headingElements.forEach((el) => {
    (el as HTMLElement).style.fontFamily = headingFamily;
  });

  // Apply body font to body
  document.body.style.fontFamily = bodyFamily;

  // 4. Sidebar
  let sidebarBg: string;
  let sidebarFg: string;
  let sidebarPrimary: string;
  let sidebarPrimaryFg: string;
  let sidebarAccent: string;
  let sidebarAccentFg: string;

  switch (config.sidebarStyle) {
    case 'dark':
      sidebarBg = hexToOkLCH(config.sidebarColor || '#064e3b');
      sidebarFg = hexToOkLCH('#f0fdf4');
      sidebarPrimary = primaryOkLCH;
      sidebarPrimaryFg = primaryFg;
      sidebarAccent = hexToOkLCH(lightenHex(config.sidebarColor || '#064e3b', 0.1));
      sidebarAccentFg = hexToOkLCH('#f0fdf4');
      break;
    case 'colored':
      sidebarBg = hexToOkLCH(config.sidebarColor);
      sidebarFg = hexToOkLCH(getContrastForeground(config.sidebarColor));
      sidebarPrimary = hexToOkLCH(lightenHex(config.sidebarColor, 0.15));
      sidebarPrimaryFg = hexToOkLCH(getContrastForeground(lightenHex(config.sidebarColor, 0.15)));
      sidebarAccent = hexToOkLCH(lightenHex(config.sidebarColor, 0.1));
      sidebarAccentFg = hexToOkLCH(getContrastForeground(lightenHex(config.sidebarColor, 0.1)));
      break;
    case 'light':
    default:
      sidebarBg = hexToOkLCH('#f5f5f4');
      sidebarFg = hexToOkLCH('#1c1917');
      sidebarPrimary = primaryOkLCH;
      sidebarPrimaryFg = primaryFg;
      sidebarAccent = hexToOkLCH('#e7e5e4');
      sidebarAccentFg = hexToOkLCH('#1c1917');
      break;
  }

  root.style.setProperty('--sidebar', sidebarBg);
  root.style.setProperty('--sidebar-foreground', sidebarFg);
  root.style.setProperty('--sidebar-primary', sidebarPrimary);
  root.style.setProperty('--sidebar-primary-foreground', sidebarPrimaryFg);
  root.style.setProperty('--sidebar-accent', sidebarAccent);
  root.style.setProperty('--sidebar-accent-foreground', sidebarAccentFg);

  // Border colors for sidebar
  const sidebarBorder = config.sidebarStyle === 'dark'
    ? hexToOkLCH(lightenHex(config.sidebarColor || '#064e3b', 0.1))
    : config.sidebarStyle === 'colored'
    ? hexToOkLCH(lightenHex(config.sidebarColor, 0.15))
    : hexToOkLCH('#e7e5e4');
  root.style.setProperty('--sidebar-border', sidebarBorder);

  // 5. Load Google Fonts
  loadGoogleFont(config.fontHeading);
  loadGoogleFont(config.fontBody);

  // 6. Store data attributes on root for downstream use
  root.setAttribute('data-sidebar-style', config.sidebarStyle);
}

// --- Storage ---

export function saveThemeConfig(config: ThemeConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // localStorage might be unavailable
  }
}

export function loadThemeConfig(): ThemeConfig {
  if (typeof window === 'undefined') return DEFAULT_THEME_CONFIG;
  try {
    const stored = localStorage.getItem(THEME_CONFIG_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle missing keys
      return {
        ...DEFAULT_THEME_CONFIG,
        ...parsed,
        targetPages: parsed.targetPages || DEFAULT_THEME_CONFIG.targetPages,
      };
    }
  } catch {
    // Invalid JSON or unavailable
  }
  return DEFAULT_THEME_CONFIG;
}

// --- React Hook ---

import { useState, useEffect, useCallback, useRef } from 'react';

export function useThemeConfig(): {
  config: ThemeConfig;
  updateConfig: (partial: Partial<ThemeConfig>) => void;
  applyPreset: (presetName: string) => void;
  resetToDefaults: () => void;
} {
  const [config, setConfig] = useState<ThemeConfig>(() => {
    // Initialize from localStorage synchronously (only runs on first render)
    return loadThemeConfig();
  });

  // Apply theme whenever config changes (proper side effect via useEffect)
  useEffect(() => {
    applyTheme(config);
  }, [config]);

  const updateConfig = useCallback((partial: Partial<ThemeConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      saveThemeConfig(next);
      return next;
    });
  }, []);

  const applyPreset = useCallback((presetName: string) => {
    const preset = COLOR_PRESETS.find((p) => p.name === presetName);
    if (!preset) return;
    setConfig((prev) => {
      const next: ThemeConfig = {
        ...prev,
        preset: preset.name,
        primaryColor: preset.primary,
        secondaryColor: preset.secondary,
        accentColor: preset.accent,
      };
      saveThemeConfig(next);
      return next;
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    setConfig(DEFAULT_THEME_CONFIG);
    saveThemeConfig(DEFAULT_THEME_CONFIG);
  }, []);

  return { config, updateConfig, applyPreset, resetToDefaults };
}
