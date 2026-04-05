'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  Clock, 
  Leaf, 
  Star,
  RefreshCw,
  Lightbulb,
  Target
} from 'lucide-react';
import { RecommendationEngine } from '@/components/recommendations/recommendation-engine';
import { PopularItems } from '@/components/recommendations/popular-items';

interface RecommendationStats {
  totalRecommendations: number;
  personalizedCount: number;
  popularCount: number;
  seasonalCount: number;
  conversionRate: number;
  avgOrderValueIncrease: number;
}

export default function RecommendationsPage() {
  const [stats, setStats] = useState<RecommendationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/recommendations?stats=true&demo=true');
      const result = await response.json();
      if (result.success) {
        setStats(result.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-orange-500" />
            Recommandations IA
          </h1>
          <p className="text-muted-foreground">
            Intelligence artificielle pour booster vos ventes
          </p>
        </div>
        <Button variant="outline" onClick={fetchStats} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Sparkles className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{stats?.totalRecommendations || 156}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Personnalisées</p>
                <p className="text-xl font-bold">{stats?.personalizedCount || 89}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Populaires</p>
                <p className="text-xl font-bold">{stats?.popularCount || 45}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Leaf className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saisonnières</p>
                <p className="text-xl font-bold">{stats?.seasonalCount || 22}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Target className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conversion</p>
                <p className="text-xl font-bold">{stats?.conversionRate || 23}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30">
                <TrendingUp className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Panier +</p>
                <p className="text-xl font-bold">{stats?.avgOrderValueIncrease || 18}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Recommandations
          </TabsTrigger>
          <TabsTrigger value="popular" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Populaires
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecommendationEngine />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Recommandations par moment
                </CardTitle>
                <CardDescription>
                  Suggestions basées sur l'heure de la journée
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Petit-déjeuner</p>
                      <p className="text-sm text-muted-foreground">6h - 10h</p>
                    </div>
                    <Badge variant="secondary">12 articles</Badge>
                  </div>
                </div>
                <div className="p-4 rounded-lg border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Déjeuner</p>
                      <p className="text-sm text-muted-foreground">11h - 14h</p>
                    </div>
                    <Badge variant="secondary">18 articles</Badge>
                  </div>
                </div>
                <div className="p-4 rounded-lg border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Dîner</p>
                      <p className="text-sm text-muted-foreground">18h - 22h</p>
                    </div>
                    <Badge variant="secondary">24 articles</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="popular">
          <PopularItems />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Suggestions d'optimisation
                </CardTitle>
                <CardDescription>
                  Recommandations pour améliorer vos performances
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg border bg-muted/50">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-green-100">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Ajouter des combos déjeuner</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Les combos pourraient augmenter le panier moyen de 15%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg border bg-muted/50">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-blue-100">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Programme de fidélité</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        45% des clients reviennent dans le mois
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg border bg-muted/50">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-orange-100">
                      <Clock className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Offres horaires</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Les ventes baissent entre 15h-17h, envisagez des promotions
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  Objectifs de vente
                </CardTitle>
                <CardDescription>
                  Suivez vos objectifs et performances
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="font-medium">Taux de conversion recommandé</p>
                    <p className="text-sm text-muted-foreground">23% / 30%</p>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-orange-500" style={{ width: '76%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="font-medium">Ventes additionnelles</p>
                    <p className="text-sm text-muted-foreground">156 / 200</p>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-green-500" style={{ width: '78%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="font-medium">Panier moyen</p>
                    <p className="text-sm text-muted-foreground">18% / 25%</p>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-blue-500" style={{ width: '72%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
