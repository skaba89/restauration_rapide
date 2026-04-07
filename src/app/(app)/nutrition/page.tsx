'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import NutritionInfo from '@/components/nutrition/nutrition-info';
import AllergenManager from '@/components/nutrition/allergen-manager';
import NutritionCalculator from '@/components/nutrition/nutrition-calculator';
import { Info, Settings, Calculator } from 'lucide-react';

export default function NutritionPage() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Allergènes & Nutrition</h1>
        <p className="text-muted-foreground mt-1">
          Gérez les informations nutritionnelles et allergènes de vos plats
        </p>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span className="hidden sm:inline">Informations</span>
          </TabsTrigger>
          <TabsTrigger value="manager" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Gestion</span>
          </TabsTrigger>
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Calculateur</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <NutritionInfo />
        </TabsContent>

        <TabsContent value="manager">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Allergènes</CardTitle>
              <CardDescription>
                Assignez et modifiez les allergènes pour chaque plat du menu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AllergenManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator">
          <Card>
            <CardHeader>
              <CardTitle>Calculateur Nutritionnel</CardTitle>
              <CardDescription>
                Calculez les valeurs nutritionnelles totales pour une commande personnalisée
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NutritionCalculator />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
