'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

// Theme configuration types
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textMuted: string;
}

export interface ThemeFonts {
  heading: string;
  body: string;
}

export interface ThemeLayout {
  headerStyle: 'fixed' | 'static' | 'transparent';
  footerStyle: 'minimal' | 'full' | 'none';
  heroStyle: 'full' | 'medium' | 'small' | 'none';
  cardStyle: 'rounded' | 'square' | 'pill';
}

export interface ThemePatterns {
  borders: boolean;
  backgrounds: boolean;
  pattern: 'kente' | 'tribal' | 'geometric' | 'none';
}

export interface ThemeConfig {
  colors: ThemeColors;
  fonts: ThemeFonts;
  layout: ThemeLayout;
  patterns?: ThemePatterns;
}

export interface ComponentsConfig {
  hero: boolean;
  featured: boolean;
  menu: boolean;
  gallery: boolean;
  reviews: boolean;
  contact: boolean;
  social: boolean;
  newsletter: boolean;
  reservations: boolean;
  delivery: boolean;
}

export interface TemplateImages {
  logo?: string;
  banner?: string;
  backgrounds?: string[];
}

export interface RestaurantTemplate {
  id: string;
  name: string;
  slug: string;
  description?: string;
  themeConfig: ThemeConfig;
  components: ComponentsConfig;
  images?: TemplateImages | null;
  customCss?: string | null;
  isPremium: boolean;
  isExclusive: boolean;
  exclusiveRestaurantId?: string | null;
  isActive: boolean;
}

export interface TemplateContextValue {
  template: RestaurantTemplate | null;
  theme: ThemeConfig;
  components: ComponentsConfig;
  isLoading: boolean;
  error: string | null;
  customColors: {
    primary: string | null;
    secondary: string | null;
  };
  // Helper functions
  getColor: (colorKey: keyof ThemeColors) => string;
  getFont: (fontKey: keyof ThemeFonts) => string;
  isComponentEnabled: (component: keyof ComponentsConfig) => boolean;
  applyCustomColors: (colors: { primary?: string; secondary?: string }) => void;
}

const defaultTheme: ThemeConfig = {
  colors: {
    primary: '#F97316',
    secondary: '#EA580C',
    accent: '#FFC107',
    background: '#FFFFFF',
    text: '#1F2937',
    textMuted: '#6B7280',
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
  },
  layout: {
    headerStyle: 'fixed',
    footerStyle: 'minimal',
    heroStyle: 'medium',
    cardStyle: 'rounded',
  },
};

const defaultComponents: ComponentsConfig = {
  hero: true,
  featured: true,
  menu: true,
  gallery: true,
  reviews: true,
  contact: true,
  social: true,
  newsletter: true,
  reservations: true,
  delivery: true,
};

const TemplateContext = createContext<TemplateContextValue | undefined>(undefined);

interface TemplateProviderProps {
  children: React.ReactNode;
  restaurantId?: string;
  initialTemplate?: RestaurantTemplate | null;
  initialCustomColors?: {
    primary: string | null;
    secondary: string | null;
  };
}

export function TemplateProvider({
  children,
  restaurantId,
  initialTemplate,
  initialCustomColors,
}: TemplateProviderProps) {
  const [template, setTemplate] = useState<RestaurantTemplate | null>(initialTemplate || null);
  const [customColors, setCustomColors] = useState<{
    primary: string | null;
    secondary: string | null;
  }>(initialCustomColors || { primary: null, secondary: null });
  const [isLoading, setIsLoading] = useState(!initialTemplate && !!restaurantId);
  const [error, setError] = useState<string | null>(null);

  // Fetch template if restaurantId provided and no initial template
  useEffect(() => {
    if (!restaurantId || initialTemplate) {
      setIsLoading(false);
      return;
    }

    const fetchTemplate = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/restaurants/${restaurantId}/template`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch template');
        }

        const data = await response.json();
        
        if (data.success) {
          setTemplate(data.data.template);
          setCustomColors(data.data.customColors || { primary: null, secondary: null });
        }
      } catch (err) {
        console.error('Error fetching template:', err);
        setError(err instanceof Error ? err.message : 'Failed to load template');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplate();
  }, [restaurantId, initialTemplate]);

  // Merge theme with custom colors
  const theme = useMemo(() => {
    const baseTheme = template?.themeConfig || defaultTheme;
    
    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        ...(customColors.primary && { primary: customColors.primary }),
        ...(customColors.secondary && { secondary: customColors.secondary }),
      },
    };
  }, [template, customColors]);

  const components = useMemo(() => {
    return template?.components || defaultComponents;
  }, [template]);

  // Apply CSS custom properties for theming
  useEffect(() => {
    const root = document.documentElement;
    
    // Set color variables
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-text', theme.colors.text);
    root.style.setProperty('--color-text-muted', theme.colors.textMuted);
    
    // Set font variables
    root.style.setProperty('--font-heading', theme.fonts.heading);
    root.style.setProperty('--font-body', theme.fonts.body);
    
    // Apply custom CSS if provided
    if (template?.customCss) {
      const styleId = 'template-custom-css';
      let styleElement = document.getElementById(styleId) as HTMLStyleElement;
      
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      
      styleElement.textContent = template.customCss;
    }
    
    // Add font imports if needed
    const fontsToLoad = new Set([theme.fonts.heading, theme.fonts.body]);
    fontsToLoad.forEach((font) => {
      if (font !== 'Inter') {
        const linkId = `font-${font.toLowerCase().replace(/\s+/g, '-')}`;
        if (!document.getElementById(linkId)) {
          const link = document.createElement('link');
          link.id = linkId;
          link.rel = 'stylesheet';
          link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, '+')}:wght@400;500;600;700&display=swap`;
          document.head.appendChild(link);
        }
      }
    });
  }, [theme, template?.customCss]);

  // Helper functions
  const getColor = (colorKey: keyof ThemeColors): string => {
    return theme.colors[colorKey];
  };

  const getFont = (fontKey: keyof ThemeFonts): string => {
    return theme.fonts[fontKey];
  };

  const isComponentEnabled = (component: keyof ComponentsConfig): boolean => {
    return components[component];
  };

  const applyCustomColors = (colors: { primary?: string; secondary?: string }) => {
    setCustomColors((prev) => ({
      primary: colors.primary || prev.primary,
      secondary: colors.secondary || prev.secondary,
    }));
  };

  const value: TemplateContextValue = {
    template,
    theme,
    components,
    isLoading,
    error,
    customColors,
    getColor,
    getFont,
    isComponentEnabled,
    applyCustomColors,
  };

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplate() {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error('useTemplate must be used within a TemplateProvider');
  }
  return context;
}

// HOC for wrapping components with template
export function withTemplate<P extends object>(
  Component: React.ComponentType<P>,
  templateOptions?: { restaurantId?: string }
) {
  return function WithTemplateWrapper(props: P) {
    return (
      <TemplateProvider restaurantId={templateOptions?.restaurantId}>
        <Component {...props} />
      </TemplateProvider>
    );
  };
}

// Utility hook for template-aware styling
export function useTemplateStyles() {
  const { theme, template } = useTemplate();
  
  return {
    // Button styles based on theme
    primaryButton: {
      backgroundColor: theme.colors.primary,
      color: '#FFFFFF',
    },
    secondaryButton: {
      backgroundColor: theme.colors.secondary,
      color: '#FFFFFF',
    },
    
    // Card styles
    card: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.layout.cardStyle === 'pill' ? '9999px' : 
                   theme.layout.cardStyle === 'square' ? '0' : '0.75rem',
    },
    
    // Header styles
    header: {
      position: theme.layout.headerStyle === 'fixed' ? 'fixed' : 'static',
      backgroundColor: theme.layout.headerStyle === 'transparent' ? 'transparent' : theme.colors.background,
    },
    
    // Pattern classes
    patternClass: theme.patterns?.pattern || 'none',
    hasKentePattern: theme.patterns?.pattern === 'kente',
    hasTribalPattern: theme.patterns?.pattern === 'tribal',
    
    // Template info
    isExclusive: template?.isExclusive || false,
    isPremium: template?.isPremium || false,
    templateName: template?.name || 'Default',
  };
}

export default TemplateProvider;
