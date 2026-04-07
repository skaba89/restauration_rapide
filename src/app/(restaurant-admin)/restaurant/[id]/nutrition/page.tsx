'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Apple,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle,
  Edit,
  Flame,
  Droplets,
  Wheat,
} from 'lucide-react';
import { apiGet } from '@/lib/api-client';

interface NutritionInfo {
  id: string;
  menuItemId: string;
  menuItemName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  allergens: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
}

const DEMO_NUTRITION: NutritionInfo[] = [
  {
    id: '1',
    menuItemId: 'm1',
    menuItemName: 'Attiéké Poisson',
    calories: 450,
    protein: 35,
    carbs: 48,
    fat: 12,
    allergens: ['Poisson'],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
  },
  {
    id: '2',
    menuItemId: 'm2',
    menuItemName: 'Riz Gras',
    calories: 520,
    protein: 15,
    carbs: 65,
    fat: 22,
    allergens: [],
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
  },
  {
    id: '3',
    menuItemId: 'm3',
    menuItemName: 'Foutou Banane',
    calories: 380,
    protein: 8,
    carbs: 72,
    fat: 6,
    allergens: [],
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
  },
  {
    id: '4',
    menuItemId: 'm4',
    menuItemName: 'Poulet Braisé',
    calories: 350,
    protein: 42,
    carbs: 2,
    fat: 18,
    allergens: [],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
  },
];

const ALLERGENS = ['Gluten', 'Lait', 'Œufs', 'Poisson', 'Fruits de mer', 'Arachides', 'Soja', 'Sésame'];

export default function RestaurantNutritionPage() {
  const params = useParams();
  const restaurantId = params.id as string;
  const [nutritionData, setNutritionData] = useState<NutritionInfo[]>(DEMO_NUTRITION);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNutritionData();
  }, [restaurantId]);

  const loadNutritionData = async () => {
    try {
      const data = await apiGet<any>(`/nutrition?restaurantId=${restaurantId}`);
      if (data?.items?.length > 0) {
        setNutritionData(data.items);
      }
    } catch (error) {
      console.error('Failed to load nutrition data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = nutritionData.filter(item =>
    item.menuItemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const withAllergens = nutritionData.filter(i => i.allergens.length > 0).length;
  const vegetarianCount = nutritionData.filter(i => i.isVegetarian).length;
  const glutenFreeCount = nutritionData.filter(i => i.isGlutenFree).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Apple className="h-6 w-6 text-orange-500" />
            Allergènes & Nutrition
          </h1>
          <p className="text-muted-foreground">
            Gérez les informations nutritionnelles et allergènes
          </p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter info
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Apple className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{nutritionData.length}</p>
                <p className="text-sm text-muted-foreground">Plats documentés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{withAllergens}</p>
                <p className="text-sm text-muted-foreground">Avec allergènes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vegetarianCount}</p>
                <p className="text-sm text-muted-foreground">Végétariens</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Wheat className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{glutenFreeCount}</p>
                <p className="text-sm text-muted-foreground">Sans gluten</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Informations nutritionnelles</CardTitle>
              <CardDescription>Détails pour chaque plat du menu</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{item.menuItemName}</h4>
                    {item.isVegetarian && <Badge className="bg-green-100 text-green-700">Végétarien</Badge>}
                    {item.isVegan && <Badge className="bg-green-100 text-green-700">Vegan</Badge>}
                    {item.isGlutenFree && <Badge className="bg-purple-100 text-purple-700">Sans gluten</Badge>}
                  </div>
                  {item.allergens.length > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3 text-yellow-600" />
                      <span className="text-sm text-yellow-600">Allergènes: {item.allergens.join(', ')}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1 text-sm">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span>{item.calories} cal</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-red-500">{item.protein}g P</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-yellow-600">{item.carbs}g G</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-blue-500">{item.fat}g L</span>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="h-3 w-3 mr-1" />
                    Modifier
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
