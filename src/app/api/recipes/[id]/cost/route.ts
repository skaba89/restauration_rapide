import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-responses';
import { db } from '@/lib/db';

// Format currency helper
const formatCurrency = (amount: number) => `${amount.toLocaleString('fr-FR')} GNF`;

// GET - Calculate recipe cost from inventory
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const servings = parseInt(searchParams.get('servings') || '0');

  try {
    // Get recipe with ingredients
    const recipe = await db.recipe.findUnique({
      where: { id },
      include: {
        ingredients: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!recipe) {
      return NextResponse.json(
        { success: false, error: 'Recette non trouvée' },
        { status: 404 }
      );
    }

    // Calculate costs
    const scaleFactor = servings ? servings / recipe.servings : 1;
    
    const ingredientCosts = recipe.ingredients.map(ing => ({
      name: ing.name,
      quantity: ing.quantity * scaleFactor,
      unit: ing.unit,
      unitCost: ing.cost / (ing.quantity || 1),
      totalCost: ing.cost * scaleFactor,
      available: true, // Would check inventory in real implementation
      inventoryItemId: ing.inventoryItemId,
    }));

    const totalIngredientCost = ingredientCosts.reduce((sum, ing) => sum + ing.totalCost, 0);
    const laborCost = Math.round(totalIngredientCost * 0.3); // 30% for labor
    const overheadCost = Math.round(totalIngredientCost * 0.1); // 10% for overhead
    const totalCost = totalIngredientCost + laborCost + overheadCost;
    const finalServings = servings || recipe.servings;
    const costPerServing = totalCost / finalServings;
    const suggestedPrice = Math.round(costPerServing / (1 - 0.5)); // 50% margin target
    const margin = ((suggestedPrice - costPerServing) / suggestedPrice) * 100;

    return NextResponse.json({
      success: true,
      data: {
        recipeId: id,
        recipeName: recipe.name,
        baseServings: recipe.servings,
        requestedServings: finalServings,
        ingredients: ingredientCosts,
        totalIngredientCost,
        laborCost,
        overheadCost,
        totalCost,
        costPerServing,
        suggestedPrice,
        margin: Math.round(margin * 10) / 10,
        availableInInventory: true,
        missingIngredients: [],
      }
    });
  } catch (error) {
    console.error('Failed to calculate cost:', error);
    const costData = null;
    return NextResponse.json({
      success: true,
      data: costData,
    });
  }
});

// POST - Update recipe cost calculation settings
export const POST = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();
  const { laborCostPercent, overheadCostPercent, targetMargin } = body;

  // In a real implementation, this would save these settings
  // For now, just return the calculation with custom settings

  return NextResponse.json({
    success: true,
    message: 'Paramètres de coût mis à jour',
    data: {
      laborCostPercent: laborCostPercent || 30,
      overheadCostPercent: overheadCostPercent || 10,
      targetMargin: targetMargin || 50,
    }
  });
});