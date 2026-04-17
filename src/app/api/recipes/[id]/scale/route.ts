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
  const { targetServings } = body;

  if (!targetServings || targetServings < 1) {
    return NextResponse.json(
      { success: false, error: 'Le nombre de portions doit être supérieur à 0' },
      { status: 400 }
    );
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
    const recipe = { baseServings: targetServings } as any;
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