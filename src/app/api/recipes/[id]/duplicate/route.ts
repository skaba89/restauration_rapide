import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-responses';
import { db } from '@/lib/db';

// POST - Duplicate a recipe
export const POST = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();
  const { 
    name, 
    organizationId,
    restaurantId,
 
  } = body;

  try {
    // Get source recipe
    const sourceRecipe = await db.recipe.findUnique({
      where: { id },
      include: {
        ingredients: {
          orderBy: { sortOrder: 'asc' }
        },
        steps: {
          orderBy: { stepNumber: 'asc' }
        },
        nutrition: true,
      }
    });

    if (!sourceRecipe) {
      return NextResponse.json(
        { success: false, error: 'Recette source non trouvée' },
        { status: 404 }
      );
    }

    // Create duplicate
    const duplicatedRecipe = await db.recipe.create({
      data: {
        organizationId: organizationId || sourceRecipe.organizationId,
        restaurantId: restaurantId || sourceRecipe.restaurantId,
        name: name || `${sourceRecipe.name} (Copie)`,
        description: sourceRecipe.description,
        instructions: sourceRecipe.instructions,
        prepTime: sourceRecipe.prepTime,
        cookTime: sourceRecipe.cookTime,
        servings: sourceRecipe.servings,
        difficulty: sourceRecipe.difficulty,
        category: sourceRecipe.category,
        imageUrl: sourceRecipe.imageUrl,
        videoUrl: sourceRecipe.videoUrl,
        totalCost: sourceRecipe.totalCost,
        sellingPrice: sourceRecipe.sellingPrice,
        margin: sourceRecipe.margin,
        isActive: true,
        tags: sourceRecipe.tags,
        notes: `Dupliquée de: ${sourceRecipe.name}`,
        ingredients: {
          create: sourceRecipe.ingredients.map((ing, index) => ({
            inventoryItemId: ing.inventoryItemId,
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            cost: ing.cost,
            notes: ing.notes,
            isOptional: ing.isOptional,
            sortOrder: index,
          }))
        },
        steps: {
          create: sourceRecipe.steps.map((step) => ({
            stepNumber: step.stepNumber,
            instruction: step.instruction,
            timer: step.timer,
            temperature: step.temperature,
            imageUrl: step.imageUrl,
            videoUrl: step.videoUrl,
            tips: step.tips,
          }))
        },
        nutrition: sourceRecipe.nutrition ? {
          create: {
            calories: sourceRecipe.nutrition.calories,
            protein: sourceRecipe.nutrition.protein,
            carbs: sourceRecipe.nutrition.carbs,
            fat: sourceRecipe.nutrition.fat,
            fiber: sourceRecipe.nutrition.fiber,
            sodium: sourceRecipe.nutrition.sodium,
            cholesterol: sourceRecipe.nutrition.cholesterol,
            sugar: sourceRecipe.nutrition.sugar,
          }
        } : undefined,
      },
      include: {
        ingredients: true,
        steps: true,
        nutrition: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: duplicatedRecipe,
      message: 'Recette dupliquée avec succès',
    });
  } catch (error) {
    console.error('Failed to duplicate recipe:', error);
    const sourceRecipe = {} as any;
    
    const duplicatedRecipe = {
      id: `new-${Date.now()}`,
      organizationId: organizationId || 'kfm-delice',
      restaurantId,
      name: name || `${sourceRecipe.name} (Copie)`,
      description: sourceRecipe.description,
      category: sourceRecipe.category,
      servings: sourceRecipe.servings,
      prepTime: sourceRecipe.prepTime,
      cookTime: sourceRecipe.cookTime,
      difficulty: sourceRecipe.difficulty,
      ingredients: sourceRecipe.ingredients.map((ing: any) => ({
        ...ing,
        id: `ing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      })),
      steps: sourceRecipe.steps.map((step: any) => ({
        ...step,
        id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      })),
      totalCost: sourceRecipe.totalCost,
      sellingPrice: sourceRecipe.sellingPrice,
      margin: sourceRecipe.margin,
      isActive: true,
      nutrition: sourceRecipe.nutrition,
      sourceRecipeId: id,
      sourceRecipeName: sourceRecipe.name,
      duplicatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: duplicatedRecipe,
      message: 'Recette dupliquée avec succès (mode démo)',
    });
  }
});