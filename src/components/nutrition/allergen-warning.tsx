'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Info,
  X,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

// Common allergens data
const ALLERGEN_DATA: Record<string, { name: string; icon: string; severity: 'high' | 'medium' | 'low' }> = {
  'peanuts': { name: 'Arachides', icon: '🥜', severity: 'high' },
  'tree-nuts': { name: 'Fruits à coque', icon: '🌰', severity: 'high' },
  'dairy': { name: 'Lait/Lactose', icon: '🥛', severity: 'medium' },
  'eggs': { name: 'Œufs', icon: '🥚', severity: 'medium' },
  'fish': { name: 'Poisson', icon: '🐟', severity: 'medium' },
  'shellfish': { name: 'Crustacés', icon: '🦐', severity: 'high' },
  'gluten': { name: 'Gluten', icon: '🌾', severity: 'medium' },
  'soy': { name: 'Soja', icon: '🫘', severity: 'low' },
  'sesame': { name: 'Sésame', icon: '🦴', severity: 'medium' },
};

export interface MenuItemAllergenInfo {
  id: string;
  name: string;
  allergens: string[];
  allergenDetails?: Array<{
    id: string;
    name: string;
    icon: string;
    severity?: 'traces' | 'contains';
  }>;
  isVegetarian: boolean;
  isVegan: boolean;
  isHalal: boolean;
  isGlutenFree: boolean;
}

export interface AllergenWarningProps {
  item: MenuItemAllergenInfo;
  userAllergens?: string[];
  showDetails?: boolean;
  compact?: boolean;
  onProceed?: () => void;
  onCancel?: () => void;
}

export function AllergenWarning({
  item,
  userAllergens = [],
  showDetails = false,
  compact = false,
  onProceed,
  onCancel,
}: AllergenWarningProps) {
  const [showDialog, setShowDialog] = useState(false);
  
  // Find conflicting allergens
  const conflictingAllergens = item.allergens.filter(a => userAllergens.includes(a));
  const hasConflict = conflictingAllergens.length > 0;

  // Load user allergens from localStorage if not provided
  useEffect(() => {
    if (userAllergens.length === 0) {
      try {
        const savedProfile = localStorage.getItem('allergenProfile');
        if (savedProfile) {
          const profile = JSON.parse(savedProfile);
          // This would update userAllergens in a real implementation
        }
      } catch (e) {
        console.error('Failed to load allergen profile:', e);
      }
    }
  }, [userAllergens]);

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-amber-600 bg-amber-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-amber-600 bg-amber-100';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {item.allergens.slice(0, 3).map(aId => {
          const allergen = ALLERGEN_DATA[aId] || { name: aId, icon: '⚠️', severity: 'medium' as const };
          const isConflicting = conflictingAllergens.includes(aId);
          
          return (
            <span
              key={aId}
              className={`text-lg ${isConflicting ? 'animate-pulse' : ''}`}
              title={`${allergen.name}${isConflicting ? ' - ALLERGÈNE DÉTECTÉ' : ''}`}
            >
              {allergen.icon}
            </span>
          );
        })}
        {item.allergens.length > 3 && (
          <Badge variant="secondary" className="text-xs">
            +{item.allergens.length - 3}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <>
      {hasConflict && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-red-800">
                  Attention - Allergènes détectés
                </p>
                <p className="text-sm text-red-700 mt-1">
                  Ce plat contient des allergènes que vous avez indiqués :
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {conflictingAllergens.map(aId => {
                    const allergen = ALLERGEN_DATA[aId] || { name: aId, icon: '⚠️' };
                    return (
                      <Badge key={aId} variant="destructive" className="gap-1">
                        <span>{allergen.icon}</span>
                        {allergen.name}
                      </Badge>
                    );
                  })}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onCancel}
                    className="text-red-700 border-red-300"
                  >
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowDialog(true)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Continuer quand même
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showDetails && !hasConflict && item.allergens.length > 0 && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4 mt-0.5" />
          <div>
            <span>Allergènes: </span>
            {item.allergens.map((aId, idx) => {
              const allergen = ALLERGEN_DATA[aId] || { name: aId, icon: '⚠️' };
              return (
                <span key={aId}>
                  {allergen.icon} {allergen.name}
                  {idx < item.allergens.length - 1 && ', '}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {!hasConflict && item.allergens.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>Aucun allergène connu</span>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Confirmer malgré les allergènes ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Vous avez indiqué être allergique à :{' '}
              <strong>
                {conflictingAllergens.map(aId => {
                  const allergen = ALLERGEN_DATA[aId] || { name: aId };
                  return allergen.name;
                }).join(', ')}
              </strong>
              <br /><br />
              Ce plat contient ces allergènes. Êtes-vous sûr de vouloir continuer ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Annuler
            </Button>
            <AlertDialogAction
              onClick={() => {
                setShowDialog(false);
                onProceed?.();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Je comprends, continuer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Dietary Labels Display Component
export function DietaryLabelsDisplay({
  isVegetarian,
  isVegan,
  isHalal,
  isGlutenFree,
  compact = false,
}: {
  isVegetarian: boolean;
  isVegan: boolean;
  isHalal: boolean;
  isGlutenFree: boolean;
  compact?: boolean;
}) {
  const labels = [];

  if (isVegetarian) {
    labels.push({ id: 'vegetarian', icon: '🥬', name: 'Végétarien', color: 'bg-green-100 text-green-700' });
  }
  if (isVegan) {
    labels.push({ id: 'vegan', icon: '🌱', name: 'Vegan', color: 'bg-emerald-100 text-emerald-700' });
  }
  if (isHalal) {
    labels.push({ id: 'halal', icon: '☪️', name: 'Halal', color: 'bg-blue-100 text-blue-700' });
  }
  if (isGlutenFree) {
    labels.push({ id: 'gluten-free', icon: '🌾', name: 'Sans Gluten', color: 'bg-amber-100 text-amber-700' });
  }

  if (labels.length === 0) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {labels.map(label => (
          <span key={label.id} className="text-sm" title={label.name}>
            {label.icon}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {labels.map(label => (
        <Badge key={label.id} className={`${label.color} text-xs`}>
          {label.icon} {label.name}
        </Badge>
      ))}
    </div>
  );
}

export default AllergenWarning;
