'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calculator, Plus, Trash2, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// Format GNF currency
const formatCurrency = (amount: number) => `${amount.toLocaleString('fr-FR')} GNF`;

// Common units
const UNITS = [
  { value: 'kg', label: 'Kilogramme (kg)' },
  { value: 'g', label: 'Gramme (g)' },
  { value: 'litre', label: 'Litre (L)' },
  { value: 'ml', label: 'Millilitre (ml)' },
  { value: 'pièce', label: 'Pièce' },
  { value: 'portion', label: 'Portion' },
];

// Inventory items for selection
const INVENTORY_ITEMS = [
  { id: 'rice', name: 'Riz', unit: 'kg', defaultCost: 2400 },
  { id: 'fish', name: 'Poisson', unit: 'kg', defaultCost: 5000 },
  { id: 'chicken', name: 'Poulet', unit: 'kg', defaultCost: 5000 },
  { id: 'meat', name: 'Viande de bœuf', unit: 'kg', defaultCost: 7500 },
  { id: 'tomato', name: 'Tomate', unit: 'kg', defaultCost: 2500 },
  { id: 'onion', name: 'Oignon', unit: 'kg', defaultCost: 1000 },
  { id: 'plantain', name: 'Banane plantain', unit: 'kg', defaultCost: 1000 },
  { id: 'oil', name: 'Huile végétale', unit: 'litre', defaultCost: 6000 },
  { id: 'palm-oil', name: 'Huile de palme', unit: 'litre', defaultCost: 8000 },
  { id: 'attieke', name: 'Attiéké', unit: 'kg', defaultCost: 3300 },
  { id: 'cassava', name: 'Manioc', unit: 'kg', defaultCost: 800 },
  { id: 'lemon', name: 'Citron', unit: 'pièce', defaultCost: 200 },
  { id: 'pepper', name: 'Piment', unit: 'kg', defaultCost: 5000 },
  { id: 'ginger', name: 'Gingembre', unit: 'kg', defaultCost: 3000 },
  { id: 'sugar', name: 'Sucre', unit: 'kg', defaultCost: 2000 },
  { id: 'mint', name: 'Menthe', unit: 'kg', defaultCost: 10000 },
  { id: 'bissap', name: 'Fleurs de bissap', unit: 'kg', defaultCost: 5000 },
  { id: 'eggplant', name: 'Aubergine', unit: 'kg', defaultCost: 2000 },
  { id: 'carrot', name: 'Carottes', unit: 'kg', defaultCost: 2000 },
  { id: 'tuna', name: 'Thon en conserve', unit: 'kg', defaultCost: 7500 },
  { id: 'mustard', name: 'Moutarde', unit: 'kg', defaultCost: 6000 },
  { id: 'palm-nut', name: 'Graines de palme', unit: 'kg', defaultCost: 1500 },
  { id: 'crayfish', name: 'Écrevisses séchées', unit: 'kg', defaultCost: 10000 },
];

interface Ingredient {
  id: string;
  inventoryItemId: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
}

interface RecipeCalculatorProps {
  initialIngredients?: Ingredient[];
  onCalculate?: (data: { totalCost: number; margin: number; suggestedPrice: number }) => void;
}

export function RecipeCalculator({ initialIngredients = [], onCalculate }: RecipeCalculatorProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialIngredients.length > 0 ? initialIngredients : [
      { id: '1', inventoryItemId: '', name: '', quantity: 0, unit: 'kg', cost: 0 }
    ]
  );
  const [servings, setServings] = useState(4);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [targetMargin, setTargetMargin] = useState(50);

  // Calculate totals using useMemo instead of useEffect
  const calculations = useMemo(() => {
    const totalCost = ingredients.reduce((sum, ing) => sum + (ing.quantity * ing.cost), 0);
    const costPerServing = totalCost / servings;
    const margin = sellingPrice > 0 ? ((sellingPrice - costPerServing) / sellingPrice) * 100 : 0;
    const suggestedPrice = costPerServing > 0 ? (costPerServing / (1 - targetMargin / 100)) : 0;
    return { totalCost, costPerServing, margin, suggestedPrice };
  }, [ingredients, servings, sellingPrice, targetMargin]);

  const { totalCost, costPerServing, margin, suggestedPrice } = calculations;

  // Add ingredient
  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { id: `${Date.now()}`, inventoryItemId: '', name: '', quantity: 0, unit: 'kg', cost: 0 }
    ]);
  };

  // Remove ingredient
  const removeIngredient = (id: string) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter(i => i.id !== id));
    }
  };

  // Update ingredient
  const updateIngredient = (id: string, field: keyof Ingredient, value: any) => {
    setIngredients(ingredients.map(ing => {
      if (ing.id === id) {
        const updated = { ...ing, [field]: value };
        
        // Auto-fill from inventory item
        if (field === 'inventoryItemId') {
          const item = INVENTORY_ITEMS.find(i => i.id === value);
          if (item) {
            updated.name = item.name;
            updated.unit = item.unit;
            updated.cost = item.defaultCost;
          }
        }
        
        return updated;
      }
      return ing;
    }));
  };

  // Apply suggested price
  const applySuggestedPrice = () => {
    setSellingPrice(Math.round(suggestedPrice));
    toast.success('Prix suggéré appliqué');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculateur de Recette
          </CardTitle>
          <CardDescription>
            Ajoutez vos ingrédients pour calculer le coût et la marge
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Servings input */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nombre de portions</Label>
              <Input
                type="number"
                value={servings}
                onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
              />
            </div>
            <div>
              <Label>Prix de vente (GNF)</Label>
              <Input
                type="number"
                value={sellingPrice || ''}
                onChange={(e) => setSellingPrice(parseInt(e.target.value) || 0)}
                placeholder="Ex: 15000"
              />
            </div>
          </div>

          {/* Ingredients table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingrédient</TableHead>
                  <TableHead className="w-24">Quantité</TableHead>
                  <TableHead className="w-28">Unité</TableHead>
                  <TableHead className="w-28">Coût/unité</TableHead>
                  <TableHead className="w-28">Total</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredients.map((ing) => (
                  <TableRow key={ing.id}>
                    <TableCell>
                      <Select
                        value={ing.inventoryItemId}
                        onValueChange={(v) => updateIngredient(ing.id, 'inventoryItemId', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent>
                          {INVENTORY_ITEMS.map(item => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={ing.quantity || ''}
                        onChange={(e) => updateIngredient(ing.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-20"
                        min={0}
                        step={0.1}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={ing.unit}
                        onValueChange={(v) => updateIngredient(ing.id, 'unit', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNITS.map(u => (
                            <SelectItem key={u.value} value={u.value}>
                              {u.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={ing.cost || ''}
                        onChange={(e) => updateIngredient(ing.id, 'cost', parseInt(e.target.value) || 0)}
                        className="w-24"
                        min={0}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(ing.quantity * ing.cost)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeIngredient(ing.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button variant="outline" onClick={addIngredient} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un ingrédient
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Coût Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(totalCost)}</p>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(costPerServing)} par portion
            </p>
          </CardContent>
        </Card>

        <Card className={margin >= 40 ? 'bg-green-50' : margin >= 25 ? 'bg-yellow-50' : 'bg-red-50'}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Marge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${margin >= 40 ? 'text-green-600' : margin >= 25 ? 'text-yellow-600' : 'text-red-600'}`}>
              {margin.toFixed(1)}%
            </p>
            <div className="flex items-center gap-2 mt-1">
              {margin < 25 && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Marge faible
                </Badge>
              )}
              {margin >= 40 && (
                <Badge className="bg-green-100 text-green-700 text-xs">
                  Excellente marge
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price suggestion */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Suggestion de Prix</CardTitle>
          <CardDescription>
            Définissez la marge cible pour obtenir un prix suggéré
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Marge cible: {targetMargin}%</Label>
            <Slider
              value={[targetMargin]}
              onValueChange={(v) => setTargetMargin(v[0])}
              min={20}
              max={70}
              step={5}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>20%</span>
              <span>45%</span>
              <span>70%</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Prix suggéré pour {targetMargin}% de marge</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(Math.round(suggestedPrice))}</p>
            </div>
            <Button onClick={applySuggestedPrice}>
              Appliquer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RecipeCalculator;
