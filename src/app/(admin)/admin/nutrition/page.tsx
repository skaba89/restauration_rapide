'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Apple, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Allergen {
  id: number;
  name: string;
  icon: string;
  items: number;
  severity: 'high' | 'medium' | 'low';
}

const allergens = [
  { id: 1, name: 'Gluten', icon: '🌾', items: 15, severity: 'high' as const },
  { id: 2, name: 'Arachides', icon: '🥜', items: 8, severity: 'high' as const },
  { id: 3, name: 'Fruits de mer', icon: '🦐', items: 12, severity: 'high' as const },
  { id: 4, name: 'Lait/Lactose', icon: '🥛', items: 20, severity: 'medium' as const },
  { id: 5, name: 'Œufs', icon: '🥚', items: 18, severity: 'medium' as const },
  { id: 6, name: 'Soja', icon: '🫘', items: 6, severity: 'low' as const },
];

const menuItems = [
  { id: 1, name: 'Poulet Grillé', calories: 450, protein: 35, carbs: 5, fat: 20, allergens: ['Gluten'] },
  { id: 2, name: 'Poisson Braisé', calories: 380, protein: 40, carbs: 2, fat: 18, allergens: ['Fruits de mer'] },
  { id: 3, name: 'Riz Sauce', calories: 320, protein: 8, carbs: 55, fat: 10, allergens: ['Gluten'] },
  { id: 4, name: 'Attieké Poisson', calories: 400, protein: 30, carbs: 45, fat: 12, allergens: ['Fruits de mer', 'Gluten'] },
];

const ICON_OPTIONS = ['🌾', '🥜', '🦐', '🥛', '🥚', '🫘', '🐟', '🥗', '🍞', '🥦'];

export default function NutritionPage() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [allergenList, setAllergenList] = useState<Allergen[]>(allergens);
  const [newAllergen, setNewAllergen] = useState({
    name: '',
    icon: '🌾',
    severity: 'medium' as const,
  });

  const handleAddAllergen = () => {
    if (!newAllergen.name) {
      toast({
        title: 'Erreur',
        description: 'Le nom de l\'allergène est obligatoire.',
        variant: 'destructive',
      });
      return;
    }
    // Create new allergen
    const newAllergenEntry: Allergen = {
      id: Date.now(),
      name: newAllergen.name,
      icon: newAllergen.icon,
      items: 0,
      severity: newAllergen.severity,
    };
    setAllergenList(prev => [...prev, newAllergenEntry]);
    toast({
      title: 'Allergène ajouté',
      description: `L'allergène "${newAllergen.name}" a été ajouté avec succès.`,
    });
    setIsAddDialogOpen(false);
    setNewAllergen({ name: '', icon: '🌾', severity: 'medium' });
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge className="bg-red-100 text-red-700">Élevé</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-700">Moyen</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-700">Faible</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Allergènes & Nutrition</h1>
          <p className="text-gray-500">Gérer les informations nutritionnelles et allergènes</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter allergène
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Nouvel allergène</DialogTitle>
              <DialogDescription>
                Ajoutez un nouvel allergène à la liste
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="allergen-name">Nom de l'allergène</Label>
                <Input
                  id="allergen-name"
                  value={newAllergen.name}
                  onChange={(e) => setNewAllergen({ ...newAllergen, name: e.target.value })}
                  placeholder="Ex: Gluten, Arachides..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Icône</Label>
                  <Select
                    value={newAllergen.icon}
                    onValueChange={(v) => setNewAllergen({ ...newAllergen, icon: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          <span className="text-lg">{icon}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sévérité</Label>
                  <Select
                    value={newAllergen.severity}
                    onValueChange={(v) => setNewAllergen({ ...newAllergen, severity: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Élevé</SelectItem>
                      <SelectItem value="medium">Moyen</SelectItem>
                      <SelectItem value="low">Faible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                <span className="text-2xl">{newAllergen.icon}</span>
                <div>
                  <p className="font-medium">{newAllergen.name || 'Nom de l\'allergène'}</p>
                  {getSeverityBadge(newAllergen.severity)}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddAllergen}>
                Ajouter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Allergens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Allergènes Connus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allergenList.map((allergen) => (
              <div key={allergen.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{allergen.icon}</span>
                  <div>
                    <p className="font-medium">{allergen.name}</p>
                    <p className="text-sm text-gray-500">{allergen.items} articles</p>
                  </div>
                </div>
                {getSeverityBadge(allergen.severity)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Nutritional Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Apple className="h-5 w-5 text-green-500" />
            Informations Nutritionnelles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Article</th>
                  <th className="text-center py-3 px-4">Calories</th>
                  <th className="text-center py-3 px-4">Protéines (g)</th>
                  <th className="text-center py-3 px-4">Glucides (g)</th>
                  <th className="text-center py-3 px-4">Lipides (g)</th>
                  <th className="text-left py-3 px-4">Allergènes</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{item.name}</td>
                    <td className="py-3 px-4 text-center">{item.calories}</td>
                    <td className="py-3 px-4 text-center">{item.protein}g</td>
                    <td className="py-3 px-4 text-center">{item.carbs}g</td>
                    <td className="py-3 px-4 text-center">{item.fat}g</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {item.allergens.map((a, i) => (
                          <Badge key={i} variant="secondary" className="bg-orange-100 text-orange-700">
                            {a}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
