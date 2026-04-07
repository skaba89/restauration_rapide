import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-responses';
import { db } from '@/lib/db';

// POST - Scale recipe for different servings
export const POST = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();
  const { targetServings, demo = false } = body;

  if (!targetServings || targetServings < 1) {
    return NextResponse.json(
      { success: false, error: 'Le nombre de portions doit être supérieur à 0' },
      { status: 400 }
    );
  }

  // Demo recipes for scaling
  const DEMO_RECIPES: Record<string, any> = {
    'demo-1': {
      id: 'demo-1',
      name: 'Thiéboudienne',
      baseServings: 6,
      ingredients: [
        { name: 'Riz rouge', quantity: 0.5, unit: 'kg', cost: 2500 },
        { name: 'Poisson séché', quantity: 0.4, unit: 'kg', cost: 4000 },
        { name: 'Tomate', quantity: 0.3, unit: 'kg', cost: 750 },
        { name: 'Carottes', quantity: 0.2, unit: 'kg', cost: 400 },
        { name: 'Manioc', quantity: 0.3, unit: 'kg', cost: 600 },
      ],
      totalCost: 8250,
      prepTime: 30,
      cookTime: 45,
    },
    'demo-2': {
      id: 'demo-2',
      name: 'Yassa Poulet',
      baseServings: 4,
      ingredients: [
        { name: 'Poulet fermier', quantity: 1.2, unit: 'kg', cost: 6000 },
        { name: 'Oignons', quantity: 0.5, unit: 'kg', cost: 500 },
        { name: 'Citrons', quantity: 4, unit: 'pièce', cost: 800 },
        { name: 'Moutarde', quantity: 0.05, unit: 'kg', cost: 300 },
      ],
      totalCost: 7600,
      prepTime: 120,
      cookTime: 45,
    },
  };

  // Return demo data if requested
  if (demo || id.startsWith('demo-') || id.startsWith('new-')) {
    const recipe = DEMO_RECIPES[id] || DEMO_RECIPES['demo-1'];
    const scaleFactor = targetServings / recipe.baseServings;

    const scaledIngredients = recipe.ingredients.map((ing: any) => ({
      ...ing,
      originalQuantity: ing.quantity,
      quantity: Math.round(ing.quantity * scaleFactor * 100) / 100,
      cost: Math.round(ing.cost * scaleFactor),
    }));

    const scaledRecipe = {
      id: recipe.id,
      name: recipe.name,
      baseServings: recipe.baseServings,
      targetServings,
      scaleFactor: Math.round(scaleFactor * 100) / 100,
      ingredients: scaledIngredients,
      originalTotalCost: recipe.totalCost,
      scaledTotalCost: Math.round(recipe.totalCost * scaleFactor),
      costPerServing: Math.round(recipe.totalCost * scaleFactor / targetServings),
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      notes: generateScalingNotes(scaleFactor),
    };

    return NextResponse.json({
      success: true,
      data: scaledRecipe,
      message: `Recette adaptée pour ${targetServings} portions`,
    });
  }

  try {
    // Get recipe with ingredients
    const recipe = await db.recipe.findUnique({
      where: { id },
      include: {
        ingredients: {
          orderBy: { sortOrder: 'asc' }
        },
        steps: {
          orderBy: { stepNumber: 'asc' }
        }
      }
    });

    if (!recipe) {
      return NextResponse.json(
        { success: false, error: 'Recette non trouvée' },
        { status: 404 }
      );
    }

    // Calculate scale factor
    const scaleFactor = targetServings / recipe.servings;

    // Scale ingredients
    const scaledIngredients = recipe.ingredients.map(ing => ({
      id: ing.id,
      name: ing.name,
      originalQuantity: ing.quantity,
      quantity: Math.round(ing.quantity * scaleFactor * 100) / 100,
      unit: ing.unit,
      originalCost: ing.cost,
      cost: Math.round(ing.cost * scaleFactor),
      notes: ing.notes,
      isOptional: ing.isOptional,
    }));

    // Scale timer adjustments
    const scaledSteps = recipe.steps.map(step => ({
      ...step,
      originalTimer: step.timer,
      timer: step.timer ? Math.round(step.timer * Math.sqrt(scaleFactor)) : null,
    }));

    const scaledRecipe = {
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      category: recipe.category,
      difficulty: recipe.difficulty,
      baseServings: recipe.servings,
      targetServings,
      scaleFactor: Math.round(scaleFactor * 100) / 100,
      ingredients: scaledIngredients,
      steps: scaledSteps,
      originalTotalCost: recipe.totalCost,
      scaledTotalCost: Math.round(recipe.totalCost * scaleFactor),
      costPerServing: Math.round(recipe.totalCost * scaleFactor / targetServings),
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      notes: generateScalingNotes(scaleFactor),
    };

    return NextResponse.json({
      success: true,
      data: scaledRecipe,
      message: `Recette adaptée pour ${targetServings} portions`,
    });
  } catch (error) {
    console.error('Failed to scale recipe:', error);
    // Fall back to demo
    const recipe = DEMO_RECIPES['demo-1'];
    const scaleFactor = targetServings / recipe.baseServings;

    return NextResponse.json({
      success: true,
      data: {
        id: recipe.id,
        name: recipe.name,
        baseServings: recipe.baseServings,
        targetServings,
        scaleFactor: Math.round(scaleFactor * 100) / 100,
        ingredients: recipe.ingredients.map((ing: any) => ({
          ...ing,
          originalQuantity: ing.quantity,
          quantity: Math.round(ing.quantity * scaleFactor * 100) / 100,
          cost: Math.round(ing.cost * scaleFactor),
        })),
        originalTotalCost: recipe.totalCost,
        scaledTotalCost: Math.round(recipe.totalCost * scaleFactor),
        costPerServing: Math.round(recipe.totalCost * scaleFactor / targetServings),
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        notes: generateScalingNotes(scaleFactor),
      },
      message: `Recette adaptée pour ${targetServings} portions (mode démo)`,
    });
  }
});

// Helper function to generate scaling notes
function generateScalingNotes(scaleFactor: number): string[] {
  const notes: string[] = [];

  if (scaleFactor > 2) {
    notes.push('⚠️ Quantités importantes - vérifiez la capacité de vos équipements');
    notes.push('💡 Le temps de cuisson peut nécessiter un ajustement');
  } else if (scaleFactor > 1.5) {
    notes.push('⏱️ Surveillez la cuisson de près, le temps peut varier');
  } else if (scaleFactor < 0.5) {
    notes.push('📏 Petites quantités - les mesures peuvent être moins précises');
    notes.push('🔥 Réduisez la température et le temps de cuisson');
  } else if (scaleFactor < 0.75) {
    notes.push('⏱️ Réduisez légèrement le temps de cuisson');
  }

  if (scaleFactor === 1) {
    notes.push('✅ Recette à l\'échelle originale');
  }

  return notes;
}
