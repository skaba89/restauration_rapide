'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, Info, Leaf, Star, Flame, Loader2 } from 'lucide-react';

// Common allergens with icons
const ALLERGENS = [
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

// Dietary labels
const DIETARY_LABELS = [
  { id: 'vegetarian', name: 'Végétarien', icon: '🥬', color: 'bg-green-100 text-green-700 border-green-300' },
  { id: 'vegan', name: 'Vegan', icon: '🌱', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { id: 'halal', name: 'Halal', icon: '☪️', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { id: 'gluten-free', name: 'Sans Gluten', icon: '🌾', color: 'bg-amber-100 text-amber-700 border-amber-300' },
];

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

export function NutritionInfo() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

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

  // Group items by allergen
  const itemsByAllergen = ALLERGENS.map(allergen => ({
    ...allergen,
    items: menuItems.filter(item => item.allergens.includes(allergen.id))
  }));

  // Get dietary filtered items
  const vegetarianItems = menuItems.filter(item => item.isVegetarian);
  const veganItems = menuItems.filter(item => item.isVegan);
  const halalItems = menuItems.filter(item => item.isHalal);
  const glutenFreeItems = menuItems.filter(item => item.isGlutenFree);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Allergens Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Allergènes
          </CardTitle>
          <CardDescription>
            Informations sur les allergènes courants présents dans nos plats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {ALLERGENS.map(allergen => (
              <div
                key={allergen.id}
                className={`p-3 rounded-lg border ${
                  allergen.severity === 'high'
                    ? 'border-red-300 bg-red-50'
                    : allergen.severity === 'medium'
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{allergen.icon}</span>
                  <div>
                    <p className="font-medium">{allergen.name}</p>
                    <p className="text-xs text-muted-foreground">{allergen.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dietary Labels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-500" />
            Régimes spéciaux
          </CardTitle>
          <CardDescription>
            Filtrez nos plats selon vos préférences alimentaires
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {DIETARY_LABELS.map(label => {
              const count = label.id === 'vegetarian'
                ? vegetarianItems.length
                : label.id === 'vegan'
                ? veganItems.length
                : label.id === 'halal'
                ? halalItems.length
                : glutenFreeItems.length;

              return (
                <div
                  key={label.id}
                  className={`p-4 rounded-lg border text-center ${label.color}`}
                >
                  <span className="text-2xl">{label.icon}</span>
                  <p className="font-medium mt-1">{label.name}</p>
                  <p className="text-xs mt-1">{count} plats disponibles</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Menu Items Nutrition */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Informations Nutritionnelles
          </CardTitle>
          <CardDescription>
            Valeurs nutritionnelles moyennes par portion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="table">
            <TabsList className="mb-4">
              <TabsTrigger value="table">Tableau</TabsTrigger>
              <TabsTrigger value="allergens">Par Allergène</TabsTrigger>
              <TabsTrigger value="dietary">Par Régime</TabsTrigger>
            </TabsList>

            <TabsContent value="table">
              <div className="mb-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-[200px]">
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
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium">Plat</th>
                      <th className="text-center p-3 font-medium">Calories</th>
                      <th className="text-center p-3 font-medium">Protéines</th>
                      <th className="text-center p-3 font-medium">Glucides</th>
                      <th className="text-center p-3 font-medium">Lipides</th>
                      <th className="text-left p-3 font-medium">Allergènes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map(item => (
                      <tr
                        key={item.id}
                        className="border-b hover:bg-muted/30 cursor-pointer"
                        onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                      >
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <div className="flex items-center gap-1 mt-1">
                              {item.isVegetarian && <span className="text-sm" title="Végétarien">🥬</span>}
                              {item.isVegan && <span className="text-sm" title="Vegan">🌱</span>}
                              {item.isHalal && <span className="text-sm" title="Halal">☪️</span>}
                              {item.isGlutenFree && <span className="text-sm" title="Sans Gluten">🌾</span>}
                              {item.isSpicy && (
                                <span className="text-sm" title="Pimenté">
                                  🌶️{item.spicyLevel > 1 && '×'.repeat(item.spicyLevel)}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="text-center p-3">{item.calories || '-'}</td>
                        <td className="text-center p-3">{item.protein || '-'}g</td>
                        <td className="text-center p-3">{item.carbs || '-'}g</td>
                        <td className="text-center p-3">{item.fat || '-'}g</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {item.allergens.length === 0 ? (
                              <Badge variant="secondary" className="text-xs">Aucun</Badge>
                            ) : (
                              item.allergenDetails.map(a => (
                                <span
                                  key={a.id}
                                  className="text-lg"
                                  title={a.name}
                                >
                                  {a.icon}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>

              {/* Selected Item Detail */}
              {selectedItem && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">{selectedItem.name}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Calories:</span>
                      <span className="ml-2 font-medium">{selectedItem.calories} kcal</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Protéines:</span>
                      <span className="ml-2 font-medium">{selectedItem.protein}g</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Glucides:</span>
                      <span className="ml-2 font-medium">{selectedItem.carbs}g</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lipides:</span>
                      <span className="ml-2 font-medium">{selectedItem.fat}g</span>
                    </div>
                    {selectedItem.fiber && (
                      <div>
                        <span className="text-muted-foreground">Fibres:</span>
                        <span className="ml-2 font-medium">{selectedItem.fiber}g</span>
                      </div>
                    )}
                    {selectedItem.sodium && (
                      <div>
                        <span className="text-muted-foreground">Sodium:</span>
                        <span className="ml-2 font-medium">{selectedItem.sodium}mg</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="allergens">
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {itemsByAllergen.filter(a => a.items.length > 0).map(allergen => (
                    <div
                      key={allergen.id}
                      className="p-4 rounded-lg border border-red-200 bg-red-50"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{allergen.icon}</span>
                        <div>
                          <p className="font-medium">{allergen.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {allergen.items.length} plat(s) concerné(s)
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {allergen.items.map(item => (
                          <div
                            key={item.id}
                            className="p-2 rounded bg-white border"
                          >
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.category}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Items with no allergens */}
                  <div className="p-4 rounded-lg border border-green-200 bg-green-50">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">✅</span>
                      <div>
                        <p className="font-medium">Sans allergènes majeurs</p>
                        <p className="text-xs text-muted-foreground">
                          {menuItems.filter(i => i.allergens.length === 0).length} plat(s)
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {menuItems.filter(i => i.allergens.length === 0).map(item => (
                        <div
                          key={item.id}
                          className="p-2 rounded bg-white border"
                        >
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="dietary">
              <ScrollArea className="h-[400px]">
                <div className="space-y-6">
                  {/* Vegetarian */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">🥬</span>
                      <h3 className="font-medium">Plats Végétariens ({vegetarianItems.length})</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {vegetarianItems.map(item => (
                        <div key={item.id} className="p-3 rounded-lg border bg-green-50 border-green-200">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                          <p className="text-xs mt-1">{item.calories} kcal</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vegan */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">🌱</span>
                      <h3 className="font-medium">Plats Vegans ({veganItems.length})</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {veganItems.map(item => (
                        <div key={item.id} className="p-3 rounded-lg border bg-emerald-50 border-emerald-200">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                          <p className="text-xs mt-1">{item.calories} kcal</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Halal */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">☪️</span>
                      <h3 className="font-medium">Plats Halal ({halalItems.length})</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {halalItems.slice(0, 6).map(item => (
                        <div key={item.id} className="p-3 rounded-lg border bg-blue-50 border-blue-200">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                          <p className="text-xs mt-1">{item.calories} kcal</p>
                        </div>
                      ))}
                      {halalItems.length > 6 && (
                        <div className="p-3 rounded-lg border bg-blue-50 border-blue-200 flex items-center justify-center">
                          <p className="text-sm text-muted-foreground">+{halalItems.length - 6} autres</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Gluten Free */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">🌾</span>
                      <h3 className="font-medium">Plats Sans Gluten ({glutenFreeItems.length})</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {glutenFreeItems.map(item => (
                        <div key={item.id} className="p-3 rounded-lg border bg-amber-50 border-amber-200">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                          <p className="text-xs mt-1">{item.calories} kcal</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default NutritionInfo;
