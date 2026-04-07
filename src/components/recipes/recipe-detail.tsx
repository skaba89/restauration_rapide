'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Clock,
  Users,
  ChefHat,
  Printer,
  DollarSign,
  TrendingUp,
  CheckCircle,
  ArrowLeft,
  Edit,
  Trash2
} from 'lucide-react';
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
};

const CATEGORY_COLORS: Record<string, string> = {
  main: 'bg-orange-100 text-orange-700',
  appetizer: 'bg-green-100 text-green-700',
  dessert: 'bg-pink-100 text-pink-700',
  beverage: 'bg-blue-100 text-blue-700',
  sauce: 'bg-purple-100 text-purple-700',
};

interface RecipeIngredient {
  id: string;
  inventoryItemId: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  category: 'main' | 'appetizer' | 'dessert' | 'beverage' | 'sauce';
  servings: number;
  prepTime: number;
  cookTime: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  totalCost: number;
  suggestedPrice: number;
  actualPrice?: number;
  margin: number;
  isActive: boolean;
}

interface RecipeDetailProps {
  recipe: Recipe;
  onBack?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function RecipeDetail({ recipe, onBack, onEdit, onDelete }: RecipeDetailProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  // Calculate cost per serving
  const costPerServing = recipe.totalCost / recipe.servings;

  // Print recipe card
  const handlePrint = () => {
    setIsPrinting(true);
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${recipe.name} - KFM DELICE</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #f97316;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .header h1 {
            color: #f97316;
            margin: 0;
          }
          .header p {
            color: #666;
            margin: 5px 0;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 20px;
          }
          .info-box {
            background: #f5f5f5;
            padding: 10px;
            border-radius: 8px;
            text-align: center;
          }
          .info-box label {
            font-size: 12px;
            color: #666;
            display: block;
          }
          .info-box span {
            font-size: 18px;
            font-weight: bold;
          }
          .section {
            margin-bottom: 20px;
          }
          .section h2 {
            color: #333;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          .ingredients-table {
            width: 100%;
            border-collapse: collapse;
          }
          .ingredients-table th,
          .ingredients-table td {
            padding: 8px;
            border-bottom: 1px solid #eee;
            text-align: left;
          }
          .ingredients-table th {
            background: #f5f5f5;
          }
          .instructions {
            counter-reset: step;
          }
          .instructions li {
            margin-bottom: 10px;
            padding-left: 30px;
            position: relative;
          }
          .instructions li:before {
            counter-increment: step;
            content: counter(step);
            position: absolute;
            left: 0;
            width: 22px;
            height: 22px;
            background: #f97316;
            color: white;
            border-radius: 50%;
            text-align: center;
            line-height: 22px;
            font-size: 12px;
          }
          .cost-summary {
            background: #fef3c7;
            padding: 15px;
            border-radius: 8px;
          }
          .cost-summary .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${recipe.name}</h1>
          <p>${recipe.description}</p>
        </div>
        
        <div class="info-grid">
          <div class="info-box">
            <label>Portions</label>
            <span>${recipe.servings}</span>
          </div>
          <div class="info-box">
            <label>Préparation</label>
            <span>${recipe.prepTime} min</span>
          </div>
          <div class="info-box">
            <label>Cuisson</label>
            <span>${recipe.cookTime} min</span>
          </div>
          <div class="info-box">
            <label>Marge</label>
            <span>${recipe.margin.toFixed(1)}%</span>
          </div>
        </div>
        
        <div class="section">
          <h2>Ingrédients</h2>
          <table class="ingredients-table">
            <thead>
              <tr>
                <th>Ingrédient</th>
                <th>Quantité</th>
                <th>Coût</th>
              </tr>
            </thead>
            <tbody>
              ${recipe.ingredients.map(ing => `
                <tr>
                  <td>${ing.name}</td>
                  <td>${ing.quantity} ${ing.unit}</td>
                  <td>${formatCurrency(ing.cost)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <h2>Instructions</h2>
          <ol class="instructions">
            ${recipe.instructions.map(inst => `<li>${inst}</li>`).join('')}
          </ol>
        </div>
        
        <div class="section">
          <h2>Résumé des Coûts</h2>
          <div class="cost-summary">
            <div class="row">
              <span>Coût total:</span>
              <strong>${formatCurrency(recipe.totalCost)}</strong>
            </div>
            <div class="row">
              <span>Coût par portion:</span>
              <strong>${formatCurrency(costPerServing)}</strong>
            </div>
            <div class="row">
              <span>Prix de vente:</span>
              <strong>${formatCurrency(recipe.actualPrice || recipe.suggestedPrice)}</strong>
            </div>
            <div class="row">
              <span>Marge:</span>
              <strong>${recipe.margin.toFixed(1)}%</strong>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>KFM DELICE • Fiche Recette</p>
          <p>Imprimé le ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
    
    setIsPrinting(false);
    toast.success('Fiche recette prête pour impression');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold">{recipe.name}</h2>
              <Badge className={CATEGORY_COLORS[recipe.category]}>
                {CATEGORY_LABELS[recipe.category]}
              </Badge>
              {recipe.isActive && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Actif
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">{recipe.description}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} disabled={isPrinting}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Portions</p>
                <p className="text-xl font-bold">{recipe.servings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Préparation</p>
                <p className="text-xl font-bold">{recipe.prepTime} min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ChefHat className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cuisson</p>
                <p className="text-xl font-bold">{recipe.cookTime} min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Marge</p>
                <p className="text-xl font-bold">{recipe.margin.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ingredients */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ingrédients</CardTitle>
            <CardDescription>
              Liste complète des ingrédients nécessaires
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recipe.ingredients.map((ing, index) => (
                <div
                  key={ing.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-medium text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{ing.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {ing.quantity} {ing.unit}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(ing.cost)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(ing.cost / ing.quantity)}/{ing.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cost breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Analyse des Coûts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Coût total</span>
                <span className="font-bold">{formatCurrency(recipe.totalCost)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Par portion</span>
                <span className="font-bold">{formatCurrency(costPerServing)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Prix de vente</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(recipe.actualPrice || recipe.suggestedPrice)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Bénéfice/portion</span>
                <span className="font-bold text-blue-600">
                  {formatCurrency((recipe.actualPrice || recipe.suggestedPrice) - costPerServing)}
                </span>
              </div>
            </div>

            <Separator />

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-700">Marge bénéficiaire</span>
              </div>
              <p className="text-3xl font-bold text-green-600">{recipe.margin.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions de Préparation</CardTitle>
          <CardDescription>
            Étapes détaillées pour préparer cette recette
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recipe.instructions.map((instruction, index) => (
              <div
                key={index}
                className="flex gap-4 p-4 rounded-lg bg-muted/50"
              >
                <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <p className="pt-2">{instruction}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RecipeDetail;
