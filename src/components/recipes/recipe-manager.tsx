'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Plus, Search, Calculator, DollarSign, ChefHat, Edit, Trash2, Eye, RefreshCw, 
  Copy, Scale, Printer, Clock, Users, Flame, Info
} from 'lucide-react';
import { RecipeCalculator } from './recipe-calculator';
import { RecipeDetail } from './recipe-detail';
import { toast } from 'sonner';

// Format GNF currency
const formatCurrency = (amount: number) => `${amount.toLocaleString('fr-FR')} GNF`;

// Category labels
const CATEGORY_LABELS: Record<string, string> = {
  main: 'Plat Principal',
  appetizer: 'Entrée',
  dessert: 'Dessert',
  beverage: 'Boisson',
  sauce: 'Sauce',
  side: 'Accompagnement',
};

const CATEGORY_COLORS: Record<string, string> = {
  main: 'bg-orange-100 text-orange-700',
  appetizer: 'bg-green-100 text-green-700',
  dessert: 'bg-pink-100 text-pink-700',
  beverage: 'bg-blue-100 text-blue-700',
  sauce: 'bg-purple-100 text-purple-700',
  side: 'bg-amber-100 text-amber-700',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Facile',
  medium: 'Moyen',
  hard: 'Difficile',
};

// Types
interface RecipeIngredient {
  id: string;
  inventoryItemId?: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
  notes?: string;
  isOptional?: boolean;
}

interface RecipeStep {
  id?: string;
  stepNumber: number;
  instruction: string;
  timer?: number;
  temperature?: string;
  imageUrl?: string;
  tips?: string;
}

interface RecipeNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  category: 'main' | 'appetizer' | 'dessert' | 'beverage' | 'sauce' | 'side';
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: RecipeIngredient[];
  steps?: RecipeStep[];
  instructions?: string[];
  totalCost: number;
  sellingPrice: number;
  suggestedPrice?: number;
  margin: number;
  isActive: boolean;
  nutrition?: RecipeNutrition;
  imageUrl?: string;
  videoUrl?: string;
}

export function RecipeManager() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isScaleDialogOpen, setIsScaleDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [scaleServings, setScaleServings] = useState(1);
  const [scaledRecipe, setScaledRecipe] = useState<any>(null);
  const [isScaling, setIsScaling] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'main' as Recipe['category'],
    servings: 4,
    prepTime: 15,
    cookTime: 30,
    difficulty: 'medium' as Recipe['difficulty'],
    instructions: '',
    sellingPrice: 0,
  });

  // Calculator state
  const [calculatorIngredients, setCalculatorIngredients] = useState<any[]>([]);
  const [calculatorTotalCost, setCalculatorTotalCost] = useState(0);

  // Fetch recipes
  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/recipes?demo=true&search=${searchTerm}&category=${categoryFilter === 'all' ? '' : categoryFilter}`);
      if (response.ok) {
        const data = await response.json();
        setRecipes(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
      toast.error('Erreur lors du chargement des recettes');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // Filtered recipes
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = searchTerm
      ? recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchesCategory = categoryFilter === 'all' || recipe.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Stats
  const stats = {
    total: recipes.length,
    avgCost: recipes.length > 0
      ? recipes.reduce((sum, r) => sum + r.totalCost, 0) / recipes.length
      : 0,
    avgMargin: recipes.length > 0
      ? recipes.reduce((sum, r) => sum + r.margin, 0) / recipes.length
      : 0,
    avgPrepTime: recipes.length > 0
      ? recipes.reduce((sum, r) => sum + r.prepTime + r.cookTime, 0) / recipes.length
      : 0,
  };

  // Handle view recipe
  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setViewMode('detail');
  };

  // Handle back to list
  const handleBackToList = () => {
    setSelectedRecipe(null);
    setViewMode('list');
  };

  // Handle create
  const handleCreate = () => {
    setIsEditMode(false);
    setFormData({
      name: '',
      description: '',
      category: 'main',
      servings: 4,
      prepTime: 15,
      cookTime: 30,
      difficulty: 'medium',
      instructions: '',
      sellingPrice: 0,
    });
    setCalculatorIngredients([]);
    setCalculatorTotalCost(0);
    setIsCreateDialogOpen(true);
  };

  // Handle edit
  const handleEdit = () => {
    if (selectedRecipe) {
      setIsEditMode(true);
      setFormData({
        name: selectedRecipe.name,
        description: selectedRecipe.description,
        category: selectedRecipe.category,
        servings: selectedRecipe.servings,
        prepTime: selectedRecipe.prepTime,
        cookTime: selectedRecipe.cookTime,
        difficulty: selectedRecipe.difficulty,
        instructions: selectedRecipe.instructions?.join('\n') || '',
        sellingPrice: selectedRecipe.sellingPrice,
      });
      setCalculatorIngredients(selectedRecipe.ingredients);
      setCalculatorTotalCost(selectedRecipe.totalCost);
      setIsCreateDialogOpen(true);
    }
  };

  // Handle duplicate
  const handleDuplicate = async () => {
    if (!selectedRecipe) return;
    
    try {
      const response = await fetch(`/api/recipes/${selectedRecipe.id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demo: true,
          name: `${selectedRecipe.name} (Copie)`
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success('Recette dupliquée avec succès');
        fetchRecipes();
        handleBackToList();
      }
    } catch (error) {
      toast.error('Erreur lors de la duplication');
    }
  };

  // Handle scale
  const handleScale = async () => {
    if (!selectedRecipe) return;
    
    setIsScaling(true);
    try {
      const response = await fetch(`/api/recipes/${selectedRecipe.id}/scale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetServings: scaleServings,
          demo: true
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setScaledRecipe(data.data);
        toast.success(`Recette adaptée pour ${scaleServings} portions`);
      }
    } catch (error) {
      toast.error('Erreur lors de l\'adaptation');
    } finally {
      setIsScaling(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedRecipe) return;
    
    try {
      const response = await fetch(`/api/recipes/${selectedRecipe.id}?demo=true`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Recette supprimée');
        setRecipes(recipes.filter(r => r.id !== selectedRecipe.id));
        handleBackToList();
        setIsDeleteDialogOpen(false);
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Handle save recipe
  const handleSaveRecipe = async () => {
    const totalCost = calculatorIngredients.reduce((sum, ing) => sum + (ing.quantity * ing.cost), 0);
    const sellingPrice = formData.sellingPrice || totalCost * 2;
    const margin = sellingPrice > 0 ? ((sellingPrice - totalCost) / sellingPrice) * 100 : 0;

    const recipeData = {
      ...formData,
      organizationId: 'kfm-delice',
      ingredients: calculatorIngredients,
      instructions: formData.instructions.split('\n').filter(i => i.trim()),
      totalCost,
      sellingPrice,
      margin: Math.round(margin * 10) / 10,
      demo: true,
    };

    try {
      if (isEditMode && selectedRecipe) {
        const response = await fetch(`/api/recipes/${selectedRecipe.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedRecipe.id, ...recipeData }),
        });
        
        if (response.ok) {
          toast.success('Recette mise à jour');
          fetchRecipes();
        }
      } else {
        const response = await fetch('/api/recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(recipeData),
        });
        
        if (response.ok) {
          toast.success('Recette créée avec succès');
          fetchRecipes();
        }
      }
      
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  // Render detail view
  if (viewMode === 'detail' && selectedRecipe) {
    return (
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button variant="ghost" onClick={handleBackToList}>
            ← Retour à la liste
          </Button>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setIsScaleDialogOpen(true)}>
              <Scale className="h-4 w-4 mr-2" />
              Adapter
            </Button>
            <Button variant="outline" onClick={handleDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Dupliquer
            </Button>
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>

        {/* Recipe Detail Component */}
        <RecipeDetail
          recipe={selectedRecipe}
          onBack={handleBackToList}
          onEdit={handleEdit}
          onDelete={() => setIsDeleteDialogOpen(true)}
        />

        {/* Scale Dialog */}
        <Dialog open={isScaleDialogOpen} onOpenChange={setIsScaleDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adapter la recette</DialogTitle>
              <DialogDescription>
                Ajustez le nombre de portions pour recalculer les quantités
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label>Portions originales:</Label>
                <Badge variant="outline">{selectedRecipe.servings}</Badge>
              </div>
              
              <div className="flex items-center gap-4">
                <Label>Nouveau nombre de portions:</Label>
                <Input
                  type="number"
                  value={scaleServings}
                  onChange={(e) => setScaleServings(parseInt(e.target.value) || 1)}
                  min={1}
                  max={100}
                  className="w-24"
                />
              </div>

              <Button onClick={handleScale} disabled={isScaling}>
                {isScaling ? 'Calcul en cours...' : 'Calculer'}
              </Button>

              {scaledRecipe && (
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Facteur d'échelle:</span>
                      <Badge>{scaledRecipe.scaleFactor}x</Badge>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Coût total:</span>
                      <span className="font-bold">{formatCurrency(scaledRecipe.scaledTotalCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coût par portion:</span>
                      <span className="font-bold">{formatCurrency(scaledRecipe.costPerServing)}</span>
                    </div>
                  </div>

                  {scaledRecipe.notes?.length > 0 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm font-medium text-amber-800 mb-2">Conseils:</p>
                      <ul className="text-sm text-amber-700 space-y-1">
                        {scaledRecipe.notes.map((note: string, i: number) => (
                          <li key={i}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <ScrollArea className="h-64 border rounded-lg">
                    <div className="p-4">
                      <h4 className="font-medium mb-3">Ingrédients adaptés:</h4>
                      <div className="space-y-2">
                        {scaledRecipe.ingredients.map((ing: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{ing.name}</span>
                            <span className="font-medium">
                              {ing.quantity.toFixed(2)} {ing.unit} ({formatCurrency(ing.cost)})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsScaleDialogOpen(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer la recette?</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer "{selectedRecipe?.name}"? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total recettes</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <ChefHat className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Coût moyen</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.avgCost)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Marge moyenne</p>
                <p className="text-2xl font-bold">{stats.avgMargin.toFixed(1)}%</p>
              </div>
              <Calculator className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Temps moyen</p>
                <p className="text-2xl font-bold">{Math.round(stats.avgPrepTime)} min</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une recette..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                <SelectItem value="main">Plats principaux</SelectItem>
                <SelectItem value="appetizer">Entrées</SelectItem>
                <SelectItem value="dessert">Desserts</SelectItem>
                <SelectItem value="beverage">Boissons</SelectItem>
                <SelectItem value="sauce">Sauces</SelectItem>
                <SelectItem value="side">Accompagnements</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchRecipes} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle recette
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="grid gap-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Chargement...
                </div>
              ) : filteredRecipes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune recette trouvée
                </div>
              ) : (
                filteredRecipes.map(recipe => (
                  <Card 
                    key={recipe.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{recipe.name}</CardTitle>
                          <Badge className={CATEGORY_COLORS[recipe.category]}>
                            {CATEGORY_LABELS[recipe.category]}
                          </Badge>
                          <Badge variant="outline">
                            {DIFFICULTY_LABELS[recipe.difficulty]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={recipe.margin >= 40 ? 'bg-green-100 text-green-700' : recipe.margin >= 25 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}>
                            {recipe.margin.toFixed(0)}% marge
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewRecipe(recipe);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{recipe.description}</p>
                      <div className="grid grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Portions</p>
                          <p className="font-medium flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {recipe.servings}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Préparation</p>
                          <p className="font-medium flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {recipe.prepTime} min
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Cuisson</p>
                          <p className="font-medium flex items-center gap-1">
                            <Flame className="h-3 w-3" />
                            {recipe.cookTime} min
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Coût total</p>
                          <p className="font-medium">{formatCurrency(recipe.totalCost)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Prix</p>
                          <p className="font-medium text-green-600">{formatCurrency(recipe.sellingPrice)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Modifier la recette' : 'Nouvelle recette'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Modifiez les informations de la recette'
                : 'Créez une nouvelle recette avec calcul automatique des coûts'}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="info" className="space-y-4">
            <TabsList>
              <TabsTrigger value="info">Informations</TabsTrigger>
              <TabsTrigger value="calculator">Calculateur</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom de la recette *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Attiéké Poisson"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData({ ...formData, category: v as Recipe['category'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">Plat Principal</SelectItem>
                      <SelectItem value="appetizer">Entrée</SelectItem>
                      <SelectItem value="dessert">Dessert</SelectItem>
                      <SelectItem value="beverage">Boisson</SelectItem>
                      <SelectItem value="sauce">Sauce</SelectItem>
                      <SelectItem value="side">Accompagnement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de la recette..."
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Portions</Label>
                  <Input
                    type="number"
                    value={formData.servings}
                    onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || 1 })}
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Préparation (min)</Label>
                  <Input
                    type="number"
                    value={formData.prepTime}
                    onChange={(e) => setFormData({ ...formData, prepTime: parseInt(e.target.value) || 0 })}
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cuisson (min)</Label>
                  <Input
                    type="number"
                    value={formData.cookTime}
                    onChange={(e) => setFormData({ ...formData, cookTime: parseInt(e.target.value) || 0 })}
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Difficulté</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(v) => setFormData({ ...formData, difficulty: v as Recipe['difficulty'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Facile</SelectItem>
                      <SelectItem value="medium">Moyen</SelectItem>
                      <SelectItem value="hard">Difficile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Instructions (une par ligne)</Label>
                <Textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Étape 1...&#10;Étape 2...&#10;Étape 3..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Prix de vente (GNF)</Label>
                <Input
                  type="number"
                  value={formData.sellingPrice || ''}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: parseInt(e.target.value) || 0 })}
                  placeholder="Ex: 15000"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="calculator">
              <RecipeCalculator 
                initialIngredients={calculatorIngredients}
                onCalculate={(data) => {
                  setCalculatorTotalCost(data.totalCost);
                }}
              />
            </TabsContent>

            <TabsContent value="nutrition" className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Les informations nutritionnelles seront calculées automatiquement à partir des ingrédients
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Cette fonctionnalité sera disponible prochainement. Les données nutritionnelles pourront être
                entrées manuellement ou calculées automatiquement à partir des ingrédients.
              </p>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveRecipe}>
              {isEditMode ? 'Enregistrer' : 'Créer la recette'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RecipeManager;
