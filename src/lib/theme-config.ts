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
    name: 'doux-chaleureux',
    label: 'Doux & Chaleureux',
    primary: '#1C3D5A',
    secondary: '#F0C75E',
    accent: '#8B1A1A',
    description: 'Bleu marine + Ambre doré + Rouge profond, restaurant africain chaleureux',
  },
  {
    name: 'ocean-bleu',
    label: 'Ocean Bleu',
    primary: '#0369A1',
    secondary: '#F0F9FF',
    accent: '#F97316',
    description: 'Bleu océan profond + accent orange, confiance et fraîcheur',
  },
  {
    name: 'teal-fresh',
    label: 'Teal Frais',
    primary: '#0D9488',
    secondary: '#F0FDFA',
    accent: '#E11D48',
    description: 'Teal dynamique + accent rose, moderne et vif',
  },
  {
    name: 'classique-orange',
    label: 'Classique Orange',
    primary: '#EA580C',
    secondary: '#FFF7ED',
    accent: '#7C3AED',
    description: 'Orange chaleureux + accent violet, restaurant premium',
  },
  {
    name: 'violet-royal',
    label: 'Violet Royal',
    primary: '#7C3AED',
    secondary: '#F5F3FF',
    accent: '#D97706',
    description: 'Violet premium + accent ambre, luxe et innovation',
  },
  {
    name: 'rouge-passion',
    label: 'Rouge Passion',
    primary: '#DC2626',
    secondary: '#FEF2F2',
    accent: '#0369A1',
    description: 'Rouge vibrant + accent bleu, audacieux et fort',
  },
  {
    name: 'rose-flamme',
    label: 'Rose Flamme',
    primary: '#DB2777',
    secondary: '#FDF2F8',
    accent: '#1E3A5F',
    description: 'Rose tendance + accent bleu nuit, style startup',
  },
  {
    name: 'ambre-dore',
    label: 'Ambre Doré',
    primary: '#B45309',
    secondary: '#FFFBEB',
    accent: '#1E3A5F',
    description: 'Ambre riche + accent bleu, chaleur et professionnalisme',
  },
  {
    name: 'slate-moderne',
    label: 'Slate Moderne',
    primary: '#334155',
    secondary: '#F1F5F9',
    accent: '#D97706',
    description: 'Neutre élégant + accent ambre, minimaliste',
  },
];

// --- Font Options ---

export const FONT_OPTIONS = [
  'Plus Jakarta Sans',
  'Outfit',
  'Poppins',
  'Montserrat',
  'Inter',
  'DM Sans',
  'Nunito',
  'Lato',
] as const;

export type FontOption = (typeof FONT_OPTIONS)[number];

// --- Default Config ---

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  preset: 'doux-chaleureux',
  primaryColor: '#1C3D5A',
  secondaryColor: '#F0C75E',
  accentColor: '#8B1A1A',
  fontHeading: 'Plus Jakarta Sans',
  fontBody: 'Outfit',
  borderRadius: 0.625,
  sidebarStyle: 'dark',
  sidebarColor: '#152D42',
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
      sidebarBg = hexToOkLCH(config.sidebarColor || '#0F2740');
      sidebarFg = hexToOkLCH('#E2E8F0');
      sidebarPrimary = hexToOkLCH(config.accentColor || '#D97706');
      sidebarPrimaryFg = hexToOkLCH('#ffffff');
      sidebarAccent = hexToOkLCH(lightenHex(config.sidebarColor || '#0F2740', 0.08));
      sidebarAccentFg = hexToOkLCH('#E2E8F0');
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
      sidebarBg = hexToOkLCH(config.sidebarColor || '#f8fafc');
      sidebarFg = hexToOkLCH('#1e293b');
      sidebarPrimary = hexToOkLCH(lightenHex(config.primaryColor, 0.08));
      sidebarPrimaryFg = hexToOkLCH('#ffffff');
      sidebarAccent = hexToOkLCH(lightenHex(config.secondaryColor, 0.1));
      sidebarAccentFg = hexToOkLCH('#1e293b');
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
    ? hexToOkLCH(lightenHex(config.sidebarColor || '#0F2740', 0.08))
    : config.sidebarStyle === 'colored'
    ? hexToOkLCH(lightenHex(config.sidebarColor, 0.15))
    : hexToOkLCH('#E2E8F0');
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
