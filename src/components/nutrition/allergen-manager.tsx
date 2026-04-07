'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, Edit, Check, X, Search, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Common allergens
const COMMON_ALLERGENS = [
  { id: 'peanuts', name: 'Arachides', icon: '🥜', description: 'Cacahuètes et dérivés' },
  { id: 'tree-nuts', name: 'Fruits à coque', icon: '🌰', description: 'Noix, amandes, noisettes' },
  { id: 'dairy', name: 'Lait/Lactose', icon: '🥛', description: 'Produits laitiers' },
  { id: 'eggs', name: 'Œufs', icon: '🥚', description: 'Œufs et dérivés' },
  { id: 'fish', name: 'Poisson', icon: '🐟', description: 'Poissons et produits de la mer' },
  { id: 'shellfish', name: 'Crustacés', icon: '🦐', description: 'Crevettes, crabes, homards' },
  { id: 'gluten', name: 'Gluten', icon: '🌾', description: 'Blé, orge, seigle' },
  { id: 'soy', name: 'Soja', icon: '🫘', description: 'Soja et dérivés' },
  { id: 'sesame', name: 'Sésame', icon: '🦴', description: 'Graines de sésame' },
];

interface MenuItem {
  id: string;
  name: string;
  category: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
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

export function AllergenManager() {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkAllergen, setBulkAllergen] = useState<string>('');
  const [bulkItems, setBulkItems] = useState<string[]>([]);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/allergens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getMenuItems', data: { demo: true } })
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
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setSelectedAllergens(item.allergens || []);
    setEditDialogOpen(true);
  };

  const handleSaveAllergens = async () => {
    if (!editingItem) return;

    try {
      // In demo mode, just update locally
      setMenuItems(items =>
        items.map(item =>
          item.id === editingItem.id
            ? { ...item, allergens: selectedAllergens, allergenDetails: COMMON_ALLERGENS.filter(a => selectedAllergens.includes(a.id)) }
            : item
        )
      );
      
      toast({
        title: 'Succès',
        description: 'Allergènes mis à jour avec succès'
      });
      
      setEditDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les modifications',
        variant: 'destructive'
      });
    }
  };

  const handleBulkAssign = async () => {
    if (!bulkAllergen || bulkItems.length === 0) return;

    try {
      setMenuItems(items =>
        items.map(item => {
          if (bulkItems.includes(item.id)) {
            const newAllergens = [...new Set([...item.allergens, bulkAllergen])];
            return {
              ...item,
              allergens: newAllergens,
              allergenDetails: COMMON_ALLERGENS.filter(a => newAllergens.includes(a.id))
            };
          }
          return item;
        })
      );

      toast({
        title: 'Succès',
        description: `Allergène assigné à ${bulkItems.length} articles`
      });

      setBulkDialogOpen(false);
      setBulkItems([]);
      setBulkAllergen('');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'assignation en lot',
        variant: 'destructive'
      });
    }
  };

  const toggleAllergen = (allergenId: string) => {
    setSelectedAllergens(prev =>
      prev.includes(allergenId)
        ? prev.filter(id => id !== allergenId)
        : [...prev, allergenId]
    );
  };

  const toggleBulkItem = (itemId: string) => {
    setBulkItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Group items by allergen
  const itemsByAllergen = COMMON_ALLERGENS.map(allergen => ({
    ...allergen,
    items: menuItems.filter(item => item.allergens.includes(allergen.id))
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un plat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>
                {cat === 'all' ? 'Toutes les catégories' : cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Assignation en lot
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Assignation en lot d'allergènes</DialogTitle>
              <DialogDescription>
                Sélectionnez un allergène et les articles concernés
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Allergène à assigner</Label>
                <Select value={bulkAllergen} onValueChange={setBulkAllergen}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un allergène" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_ALLERGENS.map(a => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.icon} {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Articles ({bulkItems.length} sélectionnés)</Label>
                <ScrollArea className="h-[300px] border rounded-lg p-2">
                  {menuItems.map(item => (
                    <div key={item.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded">
                      <Checkbox
                        id={`bulk-${item.id}`}
                        checked={bulkItems.includes(item.id)}
                        onCheckedChange={() => toggleBulkItem(item.id)}
                      />
                      <Label htmlFor={`bulk-${item.id}`} className="flex-1 cursor-pointer">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-muted-foreground text-sm ml-2">({item.category})</span>
                      </Label>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleBulkAssign} disabled={!bulkAllergen || bulkItems.length === 0}>
                Assigner
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">Par Article</TabsTrigger>
          <TabsTrigger value="allergens">Par Allergène</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="mt-4">
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {filteredItems.map(item => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.allergens.length === 0 ? (
                            <Badge variant="secondary" className="text-xs">Aucun allergène</Badge>
                          ) : (
                            item.allergenDetails.map(a => (
                              <Badge key={a.id} variant="destructive" className="text-xs">
                                {a.icon} {a.name}
                              </Badge>
                            ))
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                          {item.isVegetarian && <Badge className="bg-green-100 text-green-700">Végétarien</Badge>}
                          {item.isVegan && <Badge className="bg-emerald-100 text-emerald-700">Vegan</Badge>}
                          {item.isHalal && <Badge className="bg-blue-100 text-blue-700">Halal</Badge>}
                          {item.isGlutenFree && <Badge className="bg-amber-100 text-amber-700">Sans Gluten</Badge>}
                          {item.isSpicy && (
                            <Badge className="bg-red-100 text-red-700">
                              🌶️ Pimenté {item.spicyLevel > 1 && '×'.repeat(item.spicyLevel)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleEditItem(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="allergens" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {itemsByAllergen.map(allergen => (
              <Card key={allergen.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl">{allergen.icon}</span>
                    {allergen.name}
                  </CardTitle>
                  <CardDescription>{allergen.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="destructive">{allergen.items.length} articles</Badge>
                  </div>
                  <ScrollArea className="h-[150px]">
                    <div className="space-y-1">
                      {allergen.items.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucun article concerné</p>
                      ) : (
                        allergen.items.map(item => (
                          <div key={item.id} className="text-sm p-1.5 rounded bg-muted">
                            {item.name}
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier les allergènes</DialogTitle>
            <DialogDescription>
              {editingItem?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Allergènes présents</Label>
            <div className="grid grid-cols-2 gap-2">
              {COMMON_ALLERGENS.map(allergen => (
                <div
                  key={allergen.id}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedAllergens.includes(allergen.id)
                      ? 'border-red-500 bg-red-50'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => toggleAllergen(allergen.id)}
                >
                  <span className="text-xl">{allergen.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{allergen.name}</p>
                  </div>
                  {selectedAllergens.includes(allergen.id) && (
                    <Check className="h-4 w-4 text-red-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveAllergens}>
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AllergenManager;
