'use client';

// ============================================
// Restaurant OS - Theme Customizer Component
// Comprehensive theme customization panel
// ============================================

import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Palette,
  Type,
  Sun,
  Moon,
  Monitor,
  RotateCcw,
  Check,
  Paintbrush,
  Layout,
  Eye,
} from 'lucide-react';
import {
  useThemeConfig,
  COLOR_PRESETS,
  FONT_OPTIONS,
  DEFAULT_THEME_CONFIG,
  type ThemeConfig,
} from '@/lib/theme-config';

// --- Sub-components ---

function ColorSwatch({ color, size = 'md' }: { color: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  return (
    <div
      className={`${sizeClasses[size]} rounded-md border border-border shadow-sm`}
      style={{ backgroundColor: color }}
    />
  );
}

function ColorPickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-10 h-10"
        />
        <div
          className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer transition-all hover:scale-105 shadow-sm"
          style={{ backgroundColor: value }}
        />
      </div>
      <div className="flex flex-col">
        <Label className="text-sm font-medium">{label}</Label>
        <span className="text-xs text-muted-foreground font-mono uppercase">{value}</span>
      </div>
    </div>
  );
}

function PresetCard({
  preset,
  isActive,
  onClick,
}: {
  preset: (typeof COLOR_PRESETS)[0];
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer ${
            isActive
              ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
        >
          {isActive && (
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
          <div className="flex gap-1">
            <ColorSwatch color={preset.primary} size="sm" />
            <ColorSwatch color={preset.secondary} size="sm" />
            <ColorSwatch color={preset.accent} size="sm" />
          </div>
          <span className="text-xs font-medium text-center leading-tight">
            {preset.label}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{preset.label}</p>
        <p className="text-xs text-muted-foreground">{preset.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}

// --- Main Component ---

export function ThemeCustomizer() {
  const { theme, setTheme } = useTheme();
  const { config, updateConfig, applyPreset, resetToDefaults } = useThemeConfig();

  const currentPreset = COLOR_PRESETS.find((p) => p.name === config.preset);

  const handleResetCustomColors = () => {
    if (currentPreset) {
      updateConfig({
        primaryColor: currentPreset.primary,
        secondaryColor: currentPreset.secondary,
        accentColor: currentPreset.accent,
      });
    }
  };

  const handleToggleAllPages = () => {
    const allPages = ['admin', 'pos', 'kitchen', 'driver', 'public', 'organisateur'];
    const allSelected = allPages.every((p) => config.targetPages.includes(p));
    updateConfig({
      targetPages: allSelected ? [] : allPages,
    });
  };

  const handleTogglePage = (page: string) => {
    const current = config.targetPages;
    const updated = current.includes(page)
      ? current.filter((p) => p !== page)
      : [...current, page];
    updateConfig({ targetPages: updated });
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Mode Clair/Sombre */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sun className="h-4 w-4" />
            Mode d&apos;affichage
          </CardTitle>
          <CardDescription>
            Choisir entre le mode clair, sombre ou automatique
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[
              { value: 'light', icon: Sun, label: 'Clair' },
              { value: 'dark', icon: Moon, label: 'Sombre' },
              { value: 'system', icon: Monitor, label: 'Système' },
            ].map((mode) => (
              <Button
                key={mode.value}
                variant={theme === mode.value ? 'default' : 'outline'}
                onClick={() => setTheme(mode.value)}
                className="flex-1 gap-2"
              >
                <mode.icon className="h-4 w-4" />
                {mode.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Palette de Couleurs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" />
            Palette de couleurs
          </CardTitle>
          <CardDescription>
            Sélectionner une palette prédéfinie inspirée de l&apos;Afrique
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {COLOR_PRESETS.map((preset) => (
              <PresetCard
                key={preset.name}
                preset={preset}
                isActive={config.preset === preset.name}
                onClick={() => applyPreset(preset.name)}
              />
            ))}
          </div>
          {currentPreset && (
            <p className="mt-3 text-xs text-muted-foreground text-center">
              {currentPreset.description}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Couleurs Personnalisées */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Paintbrush className="h-4 w-4" />
            Couleurs personnalisées
          </CardTitle>
          <CardDescription>
            Ajuster les couleurs individuellement pour un thème unique
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ColorPickerField
              label="Couleur primaire"
              value={config.primaryColor}
              onChange={(v) => updateConfig({ primaryColor: v })}
            />
            <ColorPickerField
              label="Couleur secondaire"
              value={config.secondaryColor}
              onChange={(v) => updateConfig({ secondaryColor: v })}
            />
            <ColorPickerField
              label="Couleur d'accent"
              value={config.accentColor}
              onChange={(v) => updateConfig({ accentColor: v })}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetCustomColors}
            className="gap-2"
          >
            <RotateCcw className="h-3 w-3" />
            Réinitialiser aux valeurs de la palette
          </Button>
        </CardContent>
      </Card>

      {/* Section 4 & 5: Typographie & Border Radius */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Typographie */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Type className="h-4 w-4" />
              Typographie
            </CardTitle>
            <CardDescription>
              Choisir les polices pour les titres et le texte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Police des titres</Label>
              <Select
                value={config.fontHeading}
                onValueChange={(v) => updateConfig({ fontHeading: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font} value={font}>
                      <span style={{ fontFamily: `'${font}', sans-serif` }}>
                        {font}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p
                className="text-lg font-semibold text-muted-foreground"
                style={{ fontFamily: `'${config.fontHeading}', sans-serif` }}
              >
                Aperçu du titre
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm font-medium">Police du texte</Label>
              <Select
                value={config.fontBody}
                onValueChange={(v) => updateConfig({ fontBody: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font} value={font}>
                      <span style={{ fontFamily: `'${font}', sans-serif` }}>
                        {font}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p
                className="text-sm text-muted-foreground"
                style={{ fontFamily: `'${config.fontBody}', sans-serif` }}
              >
                Ceci est un aperçu du texte du corps avec la police sélectionnée.
                La lisibilité est importante pour une bonne expérience utilisateur.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Rayon de Bordure */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Layout className="h-4 w-4" />
              Rayon de bordure
            </CardTitle>
            <CardDescription>
              Ajuster l&apos;arrondi des coins des éléments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Arrondi</Label>
                <Badge variant="secondary" className="font-mono">
                  {config.borderRadius.toFixed(2)}rem
                </Badge>
              </div>
              <Slider
                value={[config.borderRadius]}
                min={0}
                max={1.5}
                step={0.025}
                onValueChange={([v]) => updateConfig({ borderRadius: v })}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Aucun</span>
                <span>Très arrondi</span>
              </div>
            </div>
            <Separator />
            {/* Live Preview */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Aperçu</Label>
              <div className="flex items-center gap-3 flex-wrap">
                <div
                  className="p-3 border-2 border-primary bg-primary/10"
                  style={{ borderRadius: `${config.borderRadius}rem` }}
                >
                  <span className="text-xs font-medium" style={{ color: config.primaryColor }}>
                    Carte
                  </span>
                </div>
                <Button
                  size="sm"
                  style={{ borderRadius: `${config.borderRadius}rem` }}
                >
                  Bouton
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  style={{ borderRadius: `${config.borderRadius}rem` }}
                >
                  Secondaire
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 6: Style de la Barre Latérale */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Layout className="h-4 w-4" />
            Style de la barre latérale
          </CardTitle>
          <CardDescription>
            Personnaliser l&apos;apparence de la barre de navigation latérale
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            {[
              { value: 'light' as const, label: 'Clair', preview: '#f5f5f4', textColor: '#1c1917' },
              { value: 'dark' as const, label: 'Sombre', preview: '#1c1917', textColor: '#fafaf9' },
              { value: 'colored' as const, label: 'Coloré', preview: config.sidebarColor, textColor: '#ffffff' },
            ].map((style) => (
              <button
                key={style.value}
                onClick={() => updateConfig({ sidebarStyle: style.value })}
                className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  config.sidebarStyle === style.value
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div
                  className="w-full h-10 rounded-lg"
                  style={{
                    backgroundColor: style.preview,
                    borderRadius: `${config.borderRadius}rem`,
                  }}
                >
                  <div className="flex items-center gap-1 p-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: style.textColor, opacity: 0.6 }}
                    />
                    <div
                      className="w-8 h-1.5 rounded-full"
                      style={{ backgroundColor: style.textColor, opacity: 0.4 }}
                    />
                  </div>
                </div>
                <span className="text-xs font-medium">{style.label}</span>
              </button>
            ))}
          </div>

          {config.sidebarStyle === 'colored' && (
            <div className="flex items-center gap-3 pt-2">
              <div className="relative">
                <input
                  type="color"
                  value={config.sidebarColor}
                  onChange={(e) => updateConfig({ sidebarColor: e.target.value })}
                  className="absolute inset-0 opacity-0 cursor-pointer w-10 h-10"
                />
                <div
                  className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer transition-all hover:scale-105 shadow-sm"
                  style={{ backgroundColor: config.sidebarColor }}
                />
              </div>
              <div className="flex flex-col">
                <Label className="text-sm font-medium">Couleur de la barre latérale</Label>
                <span className="text-xs text-muted-foreground font-mono uppercase">
                  {config.sidebarColor}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 7: Pages Ciblées */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="h-4 w-4" />
            Pages ciblées
          </CardTitle>
          <CardDescription>
            Choisir les pages auxquelles le thème s&apos;applique
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { value: 'admin', label: 'Administration' },
              { value: 'pos', label: 'Point de vente' },
              { value: 'kitchen', label: 'Cuisine' },
              { value: 'driver', label: 'Livreur' },
              { value: 'public', label: 'Page publique' },
              { value: 'organisateur', label: 'Organisateur' },
            ].map((page) => (
              <label
                key={page.value}
                className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors"
              >
                <Checkbox
                  checked={config.targetPages.includes(page.value)}
                  onCheckedChange={() => handleTogglePage(page.value)}
                />
                <span className="text-sm font-medium">{page.label}</span>
              </label>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleAllPages}
            className="gap-2"
          >
            {config.targetPages.length === 6 ? (
              <>
                <RotateCcw className="h-3 w-3" />
                Désélectionner tout
              </>
            ) : (
              <>
                <Check className="h-3 w-3" />
                Tout appliquer
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="h-4 w-4" />
            Aperçu en direct
          </CardTitle>
          <CardDescription>
            Prévisualiser le rendu du thème actuel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border rounded-xl overflow-hidden bg-background"
            style={{ borderRadius: `${config.borderRadius}rem` }}
          >
            {/* Header bar */}
            <div
              className="p-4"
              style={{
                backgroundColor: config.primaryColor,
                borderRadius: `${config.borderRadius}rem ${config.borderRadius}rem 0 0`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <span className="text-sm font-bold" style={{ color: getContrastForeground(config.primaryColor) }}>
                    R
                  </span>
                </div>
                <div>
                  <h4
                    className="text-sm font-semibold"
                    style={{
                      fontFamily: `'${config.fontHeading}', sans-serif`,
                      color: getContrastForeground(config.primaryColor),
                    }}
                  >
                    Restaurant OS
                  </h4>
                  <p
                    className="text-xs opacity-80"
                    style={{
                      fontFamily: `'${config.fontBody}', sans-serif`,
                      color: getContrastForeground(config.primaryColor),
                    }}
                  >
                    Aperçu du thème
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4" style={{ fontFamily: `'${config.fontBody}', sans-serif` }}>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  style={{ borderRadius: `${config.borderRadius}rem` }}
                >
                  Primaire
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  style={{ borderRadius: `${config.borderRadius}rem` }}
                >
                  Secondaire
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  style={{ borderRadius: `${config.borderRadius}rem` }}
                >
                  Contour
                </Button>
              </div>

              <div
                className="p-3 border bg-card"
                style={{ borderRadius: `${config.borderRadius}rem` }}
              >
                <h5
                  className="font-semibold mb-1"
                  style={{ fontFamily: `'${config.fontHeading}', sans-serif` }}
                >
                  Carte exemple
                </h5>
                <p className="text-xs text-muted-foreground">
                  Ceci est un aperçu d&apos;une carte avec le thème actuel.
                  Les couleurs et la typographie s&apos;appliquent automatiquement.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="default">Badge</Badge>
                <Badge variant="secondary">Secondaire</Badge>
                <Badge variant="outline">Contour</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={resetToDefaults} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Réinitialiser par défaut
        </Button>
      </div>
    </div>
  );
}

// Helper function (client-side only)
function getContrastForeground(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.4 ? '#000000' : '#ffffff';
}
