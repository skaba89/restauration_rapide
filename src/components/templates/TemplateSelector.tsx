'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Crown,
  Palette,
  Check,
  Star,
  Lock,
  Sparkles,
} from 'lucide-react';
import type { RestaurantTemplate, ThemeConfig, ComponentsConfig } from './TemplateProvider';

interface TemplateSelectorProps {
  restaurantId: string;
  currentTemplateId?: string | null;
  currentColors: {
    primary: string;
    secondary: string;
  };
  onTemplateSelect: (templateId: string | null, customColors?: { primary?: string; secondary?: string }) => Promise<void>;
  onColorsChange: (colors: { primary: string; secondary: string }) => Promise<void>;
}

interface TemplateWithSelection extends RestaurantTemplate {
  isSelected?: boolean;
}

export function TemplateSelector({
  restaurantId,
  currentTemplateId,
  currentColors,
  onTemplateSelect,
  onColorsChange,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<TemplateWithSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<RestaurantTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<RestaurantTemplate | null>(null);
  const [applying, setApplying] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/templates?restaurantId=${restaurantId}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const templatesWithSelection = data.data.data.map((t: RestaurantTemplate) => ({
              ...t,
              isSelected: t.id === currentTemplateId,
            }));
            setTemplates(templatesWithSelection);
          }
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [restaurantId, currentTemplateId]);

  // Filter templates based on tab
  const filteredTemplates = templates.filter((template) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'premium') return template.isPremium;
    if (activeTab === 'free') return !template.isPremium;
    if (activeTab === 'exclusive') return template.isExclusive;
    return true;
  });

  // Handle template selection
  const handleSelectTemplate = async (template: RestaurantTemplate) => {
    if (template.isSelected) return;
    
    setApplying(true);
    try {
      await onTemplateSelect(template.id, {
        primary: template.themeConfig.colors.primary,
        secondary: template.themeConfig.colors.secondary,
      });
      
      // Update local state
      setTemplates((prev) =>
        prev.map((t) => ({
          ...t,
          isSelected: t.id === template.id,
        }))
      );
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error applying template:', error);
    } finally {
      setApplying(false);
    }
  };

  // Handle remove template
  const handleRemoveTemplate = async () => {
    setApplying(true);
    try {
      await onTemplateSelect(null);
      setTemplates((prev) =>
        prev.map((t) => ({
          ...t,
          isSelected: false,
        }))
      );
    } catch (error) {
      console.error('Error removing template:', error);
    } finally {
      setApplying(false);
    }
  };

  // Render color palette
  const renderColorPalette = (colors: ThemeConfig['colors']) => (
    <div className="flex gap-1 mt-2">
      {Object.entries(colors).slice(0, 4).map(([name, color]) => (
        <div
          key={name}
          className="w-6 h-6 rounded-full border"
          style={{ backgroundColor: color }}
          title={name}
        />
      ))}
    </div>
  );

  // Render template card
  const renderTemplateCard = (template: TemplateWithSelection) => (
    <Card
      key={template.id}
      className={`cursor-pointer transition-all hover:shadow-md relative overflow-hidden ${
        template.isSelected ? 'ring-2 ring-orange-500' : ''
      }`}
      onClick={() => setPreviewTemplate(template)}
    >
      {/* Preview background with theme colors */}
      <div
        className="h-24 relative"
        style={{
          background: `linear-gradient(135deg, ${template.themeConfig.colors.primary} 0%, ${template.themeConfig.colors.secondary} 100%)`,
        }}
      >
        {/* Kente pattern overlay for Guinée Savane */}
        {template.themeConfig.patterns?.pattern === 'kente' && (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 10px,
                ${template.themeConfig.colors.accent} 10px,
                ${template.themeConfig.colors.accent} 12px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 10px,
                ${template.themeConfig.colors.accent} 10px,
                ${template.themeConfig.colors.accent} 12px
              )`,
            }}
          />
        )}
        
        {/* Badges */}
        <div className="absolute top-2 right-2 flex gap-1">
          {template.isExclusive && (
            <Badge className="bg-yellow-500 text-white">
              <Crown className="w-3 h-3 mr-1" />
              Exclusif
            </Badge>
          )}
          {template.isPremium && !template.isExclusive && (
            <Badge className="bg-purple-500 text-white">
              <Star className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>
        
        {/* Selected indicator */}
        {template.isSelected && (
          <div className="absolute bottom-2 right-2">
            <div className="bg-green-500 text-white rounded-full p-1">
              <Check className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg">{template.name}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{template.description}</p>
        
        {/* Color palette */}
        {renderColorPalette(template.themeConfig.colors)}
        
        {/* Font info */}
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
          <span>Titres: {template.themeConfig.fonts.heading}</span>
          <span>•</span>
          <span>Corps: {template.themeConfig.fonts.body}</span>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <Skeleton className="h-24 rounded-none" />
            <CardContent className="p-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-2/3 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="free">
            <Sparkles className="w-4 h-4 mr-1" />
            Gratuit
          </TabsTrigger>
          <TabsTrigger value="premium">
            <Star className="w-4 h-4 mr-1" />
            Premium
          </TabsTrigger>
          <TabsTrigger value="exclusive">
            <Crown className="w-4 h-4 mr-1" />
            Exclusif
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Templates grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(renderTemplateCard)}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Palette className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun template disponible dans cette catégorie</p>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {previewTemplate && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {previewTemplate.name}
                  {previewTemplate.isExclusive && (
                    <Badge className="bg-yellow-500 text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      Exclusif
                    </Badge>
                  )}
                  {previewTemplate.isPremium && !previewTemplate.isExclusive && (
                    <Badge className="bg-purple-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription>{previewTemplate.description}</DialogDescription>
              </DialogHeader>

              {/* Preview */}
              <div className="space-y-4">
                {/* Hero preview */}
                <div
                  className="h-48 rounded-lg relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${previewTemplate.themeConfig.colors.primary} 0%, ${previewTemplate.themeConfig.colors.secondary} 100%)`,
                  }}
                >
                  {previewTemplate.themeConfig.patterns?.pattern === 'kente' && (
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `repeating-linear-gradient(
                          0deg,
                          transparent,
                          transparent 20px,
                          ${previewTemplate.themeConfig.colors.accent} 20px,
                          ${previewTemplate.themeConfig.colors.accent} 24px
                        ),
                        repeating-linear-gradient(
                          90deg,
                          transparent,
                          transparent 20px,
                          ${previewTemplate.themeConfig.colors.accent} 20px,
                          ${previewTemplate.themeConfig.colors.accent} 24px
                        )`,
                      }}
                    />
                  )}
                  <div className="absolute bottom-4 left-4">
                    <h2
                      className="text-3xl font-bold text-white"
                      style={{ fontFamily: previewTemplate.themeConfig.fonts.heading }}
                    >
                      Nom du Restaurant
                    </h2>
                    <p className="text-white/80">Cuisine africaine traditionnelle</p>
                  </div>
                </div>

                {/* Color palette */}
                <div>
                  <h4 className="font-medium mb-2">Palette de couleurs</h4>
                  <div className="flex gap-2">
                    {Object.entries(previewTemplate.themeConfig.colors).map(([name, color]) => (
                      <div key={name} className="text-center">
                        <div
                          className="w-12 h-12 rounded-lg border shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                        <p className="text-xs text-gray-500 mt-1 capitalize">{name}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Components */}
                <div>
                  <h4 className="font-medium mb-2">Composants inclus</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(previewTemplate.components)
                      .filter(([_, enabled]) => enabled)
                      .map(([name]) => (
                        <Badge key={name} variant="secondary">
                          {name}
                        </Badge>
                      ))}
                  </div>
                </div>

                {/* Sample buttons */}
                <div>
                  <h4 className="font-medium mb-2">Boutons</h4>
                  <div className="flex gap-2">
                    <Button
                      style={{
                        backgroundColor: previewTemplate.themeConfig.colors.primary,
                        color: '#fff',
                      }}
                    >
                      Commander
                    </Button>
                    <Button
                      variant="outline"
                      style={{
                        borderColor: previewTemplate.themeConfig.colors.secondary,
                        color: previewTemplate.themeConfig.colors.secondary,
                      }}
                    >
                      Réservation
                    </Button>
                  </div>
                </div>

                {/* Custom CSS */}
                {previewTemplate.customCss && (
                  <div>
                    <h4 className="font-medium mb-2">Styles personnalisés</h4>
                    <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
                      {previewTemplate.customCss}
                    </pre>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t">
                {previewTemplate.isSelected ? (
                  <div className="flex items-center text-green-600">
                    <Check className="w-5 h-5 mr-2" />
                    Ce template est actuellement appliqué
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">
                    Cliquez sur "Appliquer" pour utiliser ce template
                  </div>
                )}
                <div className="flex gap-2">
                  {!previewTemplate.isSelected && (
                    <Button
                      className="bg-orange-500 hover:bg-orange-600"
                      onClick={() => handleSelectTemplate(previewTemplate)}
                      disabled={applying}
                    >
                      {applying ? 'Application...' : 'Appliquer'}
                    </Button>
                  )}
                  {previewTemplate.isSelected && (
                    <Button variant="outline" onClick={handleRemoveTemplate} disabled={applying}>
                      Supprimer
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TemplateSelector;
