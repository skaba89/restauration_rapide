'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Gift,
  Search,
  Sparkles,
  Heart,
  Cake,
  PartyPopper,
  Briefcase,
  Baby,
  GraduationCap,
  ThumbsUp,
  CheckCircle,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/api-client';
import { useCurrencySafe } from '@/lib/currency-context';

// Occasion icons
const OCCASION_ICONS: Record<string, React.ElementType> = {
  general: Gift,
  birthday: Cake,
  wedding: Heart,
  holiday: PartyPopper,
  thank_you: ThumbsUp,
  corporate: Briefcase,
  new_baby: Baby,
  graduation: GraduationCap,
};

// Occasion labels in French
const OCCASION_LABELS: Record<string, string> = {
  general: 'Général',
  birthday: 'Anniversaire',
  wedding: 'Mariage',
  holiday: 'Fêtes',
  thank_you: 'Remerciement',
  corporate: 'Entreprise',
  new_baby: 'Nouveau-né',
  graduation: 'Diplômé',
};

// Template interface
interface GiftCardTemplate {
  id: string;
  name: string;
  description: string;
  occasion: string;
  design: {
    primaryColor: string;
    secondaryColor: string;
    pattern: string;
    borderRadius: number;
  };
  imageUrl: string | null;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
}

interface GiftCardTemplatesGalleryProps {
  onSelect?: (template: GiftCardTemplate) => void;
  selectedTemplateId?: string | null;
}

export function GiftCardTemplatesGallery({ onSelect, selectedTemplateId }: GiftCardTemplatesGalleryProps) {
  const { formatCurrency } = useCurrencySafe();
  const [templates, setTemplates] = useState<GiftCardTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('all');
  const [occasions, setOccasions] = useState<string[]>([]);
  const [previewTemplate, setPreviewTemplate] = useState<GiftCardTemplate | null>(null);

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const response = await fetchWithAuth('/api/gift-cards/templates');
        if (response.ok) {
          const data = await response.json();
          setTemplates(data.data || []);
          setOccasions(data.occasions || []);
        }
      } catch (error) {
        console.error('Failed to fetch templates:', error);
        toast.error('Erreur lors du chargement des templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOccasion = selectedOccasion === 'all' || template.occasion === selectedOccasion;
    return matchesSearch && matchesOccasion && template.isActive;
  });

  // Group by occasion
  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    const occasion = template.occasion || 'general';
    if (!acc[occasion]) {
      acc[occasion] = [];
    }
    acc[occasion].push(template);
    return acc;
  }, {} as Record<string, GiftCardTemplate[]>);

  // Handle select
  const handleSelect = (template: GiftCardTemplate) => {
    if (onSelect) {
      onSelect(template);
      toast.success(`Template "${template.name}" sélectionné`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un template..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedOccasion} onValueChange={setSelectedOccasion}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Occasion" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les occasions</SelectItem>
            {occasions.map((occasion) => (
              <SelectItem key={occasion} value={occasion}>
                {OCCASION_LABELS[occasion] || occasion}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Chargement des templates...
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Gift className="h-12 w-12 mx-auto mb-2 opacity-50" />
          Aucun template trouvé
        </div>
      ) : (
        <ScrollArea className="h-[500px]">
          <div className="space-y-6 pr-4">
            {Object.entries(groupedTemplates).map(([occasion, occTemplates]) => {
              const OccasionIcon = OCCASION_ICONS[occasion] || Gift;
              return (
                <div key={occasion}>
                  <div className="flex items-center gap-2 mb-3">
                    <OccasionIcon className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold text-lg">
                      {OCCASION_LABELS[occasion] || occasion}
                    </h3>
                    <Badge variant="secondary" className="ml-2">
                      {occTemplates.length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {occTemplates.map((template) => {
                      const isSelected = selectedTemplateId === template.id;
                      return (
                        <Card
                          key={template.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            isSelected ? 'ring-2 ring-orange-500' : ''
                          }`}
                        >
                          <div
                            className="h-24 rounded-t-lg"
                            style={{
                              background: `linear-gradient(135deg, ${template.design.primaryColor}, ${template.design.secondaryColor})`,
                            }}
                          >
                            <div className="h-full flex items-center justify-center">
                              <Gift className="h-10 w-10 text-white/80" />
                            </div>
                          </div>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{template.name}</CardTitle>
                              {template.isDefault && (
                                <Badge variant="outline" className="text-xs">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Par défaut
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="text-xs line-clamp-2">
                              {template.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => setPreviewTemplate(template)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Aperçu
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1"
                                onClick={() => handleSelect(template)}
                              >
                                {isSelected ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Sélectionné
                                  </>
                                ) : (
                                  'Sélectionner'
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
            <DialogDescription>{previewTemplate?.description}</DialogDescription>
          </DialogHeader>
          
          {previewTemplate && (
            <div className="space-y-4">
              {/* Preview Card */}
              <div
                className="rounded-xl overflow-hidden shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${previewTemplate.design.primaryColor}, ${previewTemplate.design.secondaryColor})`,
                  borderRadius: previewTemplate.design.borderRadius,
                }}
              >
                <div className="p-6 text-white text-center">
                  <Gift className="h-12 w-12 mx-auto mb-4 opacity-80" />
                  <p className="font-bold text-2xl mb-1">KFM DELICE</p>
                  <p className="text-sm opacity-80 mb-4">Carte Cadeau</p>
                  <div className="bg-white/10 rounded-lg p-4 mb-4">
                    <p className="text-xs opacity-60 mb-1">Montant</p>
                    <p className="font-bold text-3xl">{formatCurrency(50000)}</p>
                  </div>
                  <p className="text-xs opacity-60">Valable jusqu'au 31/12/2025</p>
                </div>
              </div>

              {/* Template details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Occasion</p>
                  <p className="font-medium">{OCCASION_LABELS[previewTemplate.occasion] || previewTemplate.occasion}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Style</p>
                  <p className="font-medium capitalize">{previewTemplate.design.pattern}</p>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  handleSelect(previewTemplate);
                  setPreviewTemplate(null);
                }}
              >
                Utiliser ce template
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default GiftCardTemplatesGallery;
