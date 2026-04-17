'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Calculator, Flame, Beef, Wheat, Droplet, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
  sodium: number | null;
  allergens: string[];
  allergenDetails: { id: string; name: string; icon: string }[];
  isVegetarian: boolean;
  isVegan: boolean;
  isHalal: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  spicyLevel: number;
}

interface CartItem extends MenuItem {
  quantity: number;
}

export function NutritionCalculator() {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/allergens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getMenuItems', data: { } })
      });
      const result = await response.json();
      if (result.success) {
        setMenuItems(result.data);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];

  const filteredItems = menuItems.filter(item => {
    return selectedCategory === 'all' || item.category === selectedCategory;
  });

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    
    toast({
      title: 'Article ajouté',
      description: `${item.name} ajouté au calculateur`
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev =>
      prev.map(i =>
        i.id === itemId ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculate totals
  const totals = cart.reduce(
    (acc, item) => ({
      calories: acc.calories + (item.calories || 0) * item.quantity,
      protein: acc.protein + (item.protein || 0) * item.quantity,
      carbs: acc.carbs + (item.carbs || 0) * item.quantity,
      fat: acc.fat + (item.fat || 0) * item.quantity,
      fiber: acc.fiber + (item.fiber || 0) * item.quantity,
      sodium: acc.sodium + (item.sodium || 0) * item.quantity,
      items: acc.items + item.quantity
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, items: 0 }
  );

  // Get all allergens in cart
  const cartAllergens = [...new Set(cart.flatMap(item => item.allergens))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Menu Items Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Ajouter des articles
          </CardTitle>
          <CardDescription>
            Sélectionnez les articles pour calculer les valeurs nutritionnelles totales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'Toutes les catégories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => addToCart(item)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.name}</p>
                      {item.isSpicy && <span>🌶️</span>}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.allergenDetails.slice(0, 3).map(a => (
                        <span key={a.id} className="text-sm" title={a.name}>{a.icon}</span>
                      ))}
                      {item.allergens.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{item.allergens.length - 3}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.calories || 0} kcal | {item.protein || 0}g protéines
                    </p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Cart & Totals */}
      <div className="space-y-4">
        {/* Selected Items */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Articles sélectionnés ({totals.items})
              </CardTitle>
              {cart.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearCart}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Vider
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucun article sélectionné</p>
                <p className="text-sm">Cliquez sur les articles pour les ajouter</p>
              </div>
            ) : (
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded bg-muted">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(item.calories || 0) * item.quantity} kcal
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Allergens Alert */}
        {cartAllergens.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-red-500">⚠️</span>
                <p className="font-medium text-red-700">Allergènes présents</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {cartAllergens.map(aId => {
                  const allergen = cart
                    .flatMap(i => i.allergenDetails)
                    .find(a => a.id === aId);
                  return allergen ? (
                    <Badge key={aId} variant="destructive">
                      {allergen.icon} {allergen.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Nutrition Totals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Total Nutritionnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Calories</span>
                </div>
                <p className="text-2xl font-bold">{Math.round(totals.calories)}</p>
                <p className="text-xs text-muted-foreground">kcal</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Beef className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Protéines</span>
                </div>
                <p className="text-2xl font-bold">{Math.round(totals.protein)}g</p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(totals.protein * 4)} kcal
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wheat className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Glucides</span>
                </div>
                <p className="text-2xl font-bold">{Math.round(totals.carbs)}g</p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(totals.carbs * 4)} kcal
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Droplet className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Lipides</span>
                </div>
                <p className="text-2xl font-bold">{Math.round(totals.fat)}g</p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(totals.fat * 9)} kcal
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Fibres:</span>
                <span className="ml-2 font-medium">{Math.round(totals.fiber || 0)}g</span>
              </div>
              <div>
                <span className="text-muted-foreground">Sodium:</span>
                <span className="ml-2 font-medium">{Math.round(totals.sodium || 0)}mg</span>
              </div>
            </div>

            {/* Macro distribution */}
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Répartition des calories</p>
              <div className="flex h-4 rounded-full overflow-hidden bg-muted">
                {totals.calories > 0 && (
                  <>
                    <div
                      className="bg-red-500"
                      style={{ width: `${(totals.protein * 4 / totals.calories) * 100}%` }}
                      title={`Protéines: ${Math.round((totals.protein * 4 / totals.calories) * 100)}%`}
                    />
                    <div
                      className="bg-amber-500"
                      style={{ width: `${(totals.carbs * 4 / totals.calories) * 100}%` }}
                      title={`Glucides: ${Math.round((totals.carbs * 4 / totals.calories) * 100)}%`}
                    />
                    <div
                      className="bg-blue-500"
                      style={{ width: `${(totals.fat * 9 / totals.calories) * 100}%` }}
                      title={`Lipides: ${Math.round((totals.fat * 9 / totals.calories) * 100)}%`}
                    />
                  </>
                )}
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-red-500">Protéines</span>
                <span className="text-amber-500">Glucides</span>
                <span className="text-blue-500">Lipides</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default NutritionCalculator;
