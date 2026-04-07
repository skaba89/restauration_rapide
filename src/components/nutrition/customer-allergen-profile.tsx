'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  Settings,
  User,
  Save,
  Plus,
  X,
  Shield,
  Leaf,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Common allergens with icons
const COMMON_ALLERGENS = [
  { id: 'peanuts', name: 'Arachides', icon: '🥜', description: 'Cacahuètes et dérivés', severity: 'high' },
  { id: 'tree-nuts', name: 'Fruits à coque', icon: '🌰', description: 'Noix, amandes, noisettes', severity: 'high' },
  { id: 'dairy', name: 'Lait/Lactose', icon: '🥛', description: 'Produits laitiers', severity: 'medium' },
  { id: 'eggs', name: 'Œufs', icon: '🥚', description: 'Œufs et dérivés', severity: 'medium' },
  { id: 'fish', name: 'Poisson', icon: '🐟', description: 'Poissons et produits de la mer', severity: 'medium' },
  { id: 'shellfish', name: 'Crustacés', icon: '🦐', description: 'Crevettes, crabes, homards', severity: 'high' },
  { id: 'gluten', name: 'Gluten', icon: '🌾', description: 'Blé, orge, seigle', severity: 'medium' },
  { id: 'soy', name: 'Soja', icon: '🫘', description: 'Soja et dérivés', severity: 'low' },
  { id: 'sesame', name: 'Sésame', icon: '🦴', description: 'Graines de sésame', severity: 'medium' },
];

// Dietary preferences
const DIETARY_PREFERENCES = [
  { id: 'vegetarian', name: 'Végétarien', icon: '🥬', description: 'Pas de viande ni poisson' },
  { id: 'vegan', name: 'Vegan', icon: '🌱', description: 'Aucun produit animal' },
  { id: 'halal', name: 'Halal', icon: '☪️', description: 'Viande halal uniquement' },
  { id: 'kosher', name: 'Casher', icon: '✡️', description: 'Cacheroute' },
  { id: 'gluten-free', name: 'Sans Gluten', icon: '🌾', description: 'Sans gluten' },
  { id: 'dairy-free', name: 'Sans Lait', icon: '🥛', description: 'Sans produits laitiers' },
  { id: 'low-carb', name: 'Faible en Glucides', icon: '🍖', description: 'Régime low-carb/keto' },
  { id: 'low-sodium', name: 'Faible en Sel', icon: '🧂', description: 'Régime hyp sodé' },
];

interface CustomerAllergenProfileProps {
  customerId?: string;
  onProfileChange?: (profile: AllergenProfile) => void;
  compact?: boolean;
}

export interface AllergenProfile {
  allergens: string[];
  severityOverrides: Record<string, 'traces' | 'contains' | 'avoid'>;
  dietaryPreferences: string[];
  customAllergens: string[];
  alertsEnabled: boolean;
  strictMode: boolean;
}

export function CustomerAllergenProfile({
  customerId,
  onProfileChange,
  compact = false
}: CustomerAllergenProfileProps) {
  const { toast } = useToast();
  const [profile, setProfile] = useState<AllergenProfile>({
    allergens: [],
    severityOverrides: {},
    dietaryPreferences: [],
    customAllergens: [],
    alertsEnabled: true,
    strictMode: false,
  });
  const [customAllergenInput, setCustomAllergenInput] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('allergenProfile');
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error('Failed to parse allergen profile:', e);
      }
    }
  }, []);

  const toggleAllergen = (allergenId: string) => {
    setProfile(prev => {
      const newAllergens = prev.allergens.includes(allergenId)
        ? prev.allergens.filter(a => a !== allergenId)
        : [...prev.allergens, allergenId];
      
      const newProfile = {
        ...prev,
        allergens: newAllergens,
      };
      
      saveProfile(newProfile);
      return newProfile;
    });
  };

  const toggleDietaryPreference = (prefId: string) => {
    setProfile(prev => {
      const newPreferences = prev.dietaryPreferences.includes(prefId)
        ? prev.dietaryPreferences.filter(p => p !== prefId)
        : [...prev.dietaryPreferences, prefId];
      
      const newProfile = {
        ...prev,
        dietaryPreferences: newPreferences,
      };
      
      saveProfile(newProfile);
      return newProfile;
    });
  };

  const addCustomAllergen = () => {
    if (!customAllergenInput.trim()) return;
    
    setProfile(prev => {
      if (prev.customAllergens.includes(customAllergenInput.trim())) {
        return prev;
      }
      
      const newProfile = {
        ...prev,
        customAllergens: [...prev.customAllergens, customAllergenInput.trim()],
      };
      
      saveProfile(newProfile);
      setCustomAllergenInput('');
      return newProfile;
    });
  };

  const removeCustomAllergen = (allergen: string) => {
    setProfile(prev => {
      const newProfile = {
        ...prev,
        customAllergens: prev.customAllergens.filter(a => a !== allergen),
      };
      
      saveProfile(newProfile);
      return newProfile;
    });
  };

  const saveProfile = (newProfile: AllergenProfile) => {
    localStorage.setItem('allergenProfile', JSON.stringify(newProfile));
    onProfileChange?.(newProfile);
  };

  const handleSaveToAccount = async () => {
    setSaving(true);
    try {
      // In demo mode, just show success
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: 'Profil sauvegardé',
        description: 'Vos préférences ont été enregistrées',
      });
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder le profil',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getAllergenSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-300 bg-red-50';
      case 'medium': return 'border-amber-200 bg-amber-50';
      case 'low': return 'border-gray-200 bg-gray-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (compact) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Shield className="h-4 w-4" />
            {profile.allergens.length > 0 ? (
              <Badge variant="secondary" className="ml-1">
                {profile.allergens.length} allergènes
              </Badge>
            ) : (
              'Mon Profil'
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-500" />
              Mon Profil Allergènes
            </DialogTitle>
            <DialogDescription>
              Configurez vos allergies et préférences alimentaires
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            <ProfileContent
              profile={profile}
              customAllergenInput={customAllergenInput}
              setCustomAllergenInput={setCustomAllergenInput}
              toggleAllergen={toggleAllergen}
              toggleDietaryPreference={toggleDietaryPreference}
              addCustomAllergen={addCustomAllergen}
              removeCustomAllergen={removeCustomAllergen}
              getAllergenSeverityColor={getAllergenSeverityColor}
              setProfile={setProfile}
              saveProfile={saveProfile}
            />
          </ScrollArea>
          <DialogFooter className="mt-4">
            <Button onClick={handleSaveToAccount} disabled={saving}>
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Alert */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Important</p>
              <p className="text-sm text-amber-700">
                Ces informations sont fournies à titre indicatif. Veuillez toujours vérifier 
                avec le personnel du restaurant en cas d'allergie sévère.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProfileContent
        profile={profile}
        customAllergenInput={customAllergenInput}
        setCustomAllergenInput={setCustomAllergenInput}
        toggleAllergen={toggleAllergen}
        toggleDietaryPreference={toggleDietaryPreference}
        addCustomAllergen={addCustomAllergen}
        removeCustomAllergen={removeCustomAllergen}
        getAllergenSeverityColor={getAllergenSeverityColor}
        setProfile={setProfile}
        saveProfile={saveProfile}
      />
    </div>
  );
}

// Separate component for profile content to avoid duplication
function ProfileContent({
  profile,
  customAllergenInput,
  setCustomAllergenInput,
  toggleAllergen,
  toggleDietaryPreference,
  addCustomAllergen,
  removeCustomAllergen,
  getAllergenSeverityColor,
  setProfile,
  saveProfile,
}: {
  profile: AllergenProfile;
  customAllergenInput: string;
  setCustomAllergenInput: (v: string) => void;
  toggleAllergen: (id: string) => void;
  toggleDietaryPreference: (id: string) => void;
  addCustomAllergen: () => void;
  removeCustomAllergen: (a: string) => void;
  getAllergenSeverityColor: (s: string) => string;
  setProfile: (p: AllergenProfile | ((prev: AllergenProfile) => AllergenProfile)) => void;
  saveProfile: (p: AllergenProfile) => void;
}) {
  return (
    <div className="space-y-6">
      {/* My Allergens */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Mes Allergènes
          </CardTitle>
          <CardDescription>
            Sélectionnez les allergènes que vous devez éviter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {COMMON_ALLERGENS.map(allergen => (
              <div
                key={allergen.id}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                  profile.allergens.includes(allergen.id)
                    ? 'border-red-500 bg-red-50'
                    : getAllergenSeverityColor(allergen.severity)
                }`}
                onClick={() => toggleAllergen(allergen.id)}
              >
                <Checkbox
                  checked={profile.allergens.includes(allergen.id)}
                  onCheckedChange={() => toggleAllergen(allergen.id)}
                />
                <span className="text-xl">{allergen.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{allergen.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{allergen.description}</p>
                </div>
                {profile.allergens.includes(allergen.id) && (
                  <CheckCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            ))}
          </div>

          {/* Custom Allergens */}
          <Separator className="my-4" />
          <div className="space-y-3">
            <Label>Autres allergènes</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ajouter un allergène..."
                value={customAllergenInput}
                onChange={(e) => setCustomAllergenInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomAllergen()}
              />
              <Button onClick={addCustomAllergen} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {profile.customAllergens.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.customAllergens.map(allergen => (
                  <Badge key={allergen} variant="destructive" className="gap-1">
                    {allergen}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeCustomAllergen(allergen)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dietary Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-500" />
            Préférences Alimentaires
          </CardTitle>
          <CardDescription>
            Vos habitudes et préférences alimentaires
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {DIETARY_PREFERENCES.map(pref => (
              <div
                key={pref.id}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                  profile.dietaryPreferences.includes(pref.id)
                    ? 'border-green-500 bg-green-50'
                    : 'hover:bg-muted'
                }`}
                onClick={() => toggleDietaryPreference(pref.id)}
              >
                <Checkbox
                  checked={profile.dietaryPreferences.includes(pref.id)}
                  onCheckedChange={() => toggleDietaryPreference(pref.id)}
                />
                <span className="text-lg">{pref.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{pref.name}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alert Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Paramètres d'Alerte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Alertes allergènes</Label>
              <p className="text-sm text-muted-foreground">
                Recevoir des alertes lors de la commande
              </p>
            </div>
            <Switch
              checked={profile.alertsEnabled}
              onCheckedChange={(checked) => {
                const newProfile = { ...profile, alertsEnabled: checked };
                setProfile(newProfile);
                saveProfile(newProfile);
              }}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Mode strict</Label>
              <p className="text-sm text-muted-foreground">
                Masquer automatiquement les plats contenant vos allergènes
              </p>
            </div>
            <Switch
              checked={profile.strictMode}
              onCheckedChange={(checked) => {
                const newProfile = { ...profile, strictMode: checked };
                setProfile(newProfile);
                saveProfile(newProfile);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {profile.allergens.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="font-medium text-red-800 mb-2">
              Vous avez {profile.allergens.length + profile.customAllergens.length} allergène(s) enregistré(s)
            </p>
            <div className="flex flex-wrap gap-1">
              {profile.allergens.map(aId => {
                const allergen = COMMON_ALLERGENS.find(a => a.id === aId);
                return allergen && (
                  <Badge key={aId} variant="destructive" className="text-xs">
                    {allergen.icon} {allergen.name}
                  </Badge>
                );
              })}
              {profile.customAllergens.map(a => (
                <Badge key={a} variant="destructive" className="text-xs">
                  {a}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default CustomerAllergenProfile;
