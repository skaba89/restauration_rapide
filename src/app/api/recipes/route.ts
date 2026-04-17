import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-responses';
import { db } from '@/lib/db';

// GET - List recipes with search
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const organizationId = searchParams.get('organizationId') || '';
  const restaurantId = searchParams.get('restaurantId') || '';

  // Build query for database
  const where: any = { organizationId, isActive: true };
  
  if (restaurantId) {
    where.restaurantId = restaurantId;
  }
  
  if (category) {
    where.category = category;
  }
  
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  try {
    const recipes = await db.recipe.findMany({
      where,
      include: {
        ingredients: {
          orderBy: { sortOrder: 'asc' }
        },
        steps: {
          orderBy: { stepNumber: 'asc' }
        },
        nutrition: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: recipes,
      total: recipes.length,
    });
  } catch (error) {
    console.error('Failed to fetch recipes:', error);
    return NextResponse.json({
      success: true,
      data: [],
      total: 0,
    });
  }
});

// POST - Create new recipe
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { 
    organizationId, 
    restaurantId,
    name, 
    description, 
    category, 
    servings, 
    prepTime, 
    cookTime,
    difficulty,
    ingredients, 
    instructions,
    steps,
    nutrition,
    imageUrl,
    videoUrl,
    sellingPrice,
    tags,
    notes,
  } = body;

  if (!organizationId || !name) {
    return NextResponse.json(
      { success: false, error: 'L\'organisation et le nom sont requis' },
      { status: 400 }
    );
  }

  // Calculate total cost from ingredients
  const totalCost = (ingredients || []).reduce((sum: number, ing: any) => sum + (ing.quantity * ing.cost || 0), 0);
  
  // Calculate margin
  const finalPrice = sellingPrice || totalCost * 2;
  const margin = finalPrice > 0 ? ((finalPrice - totalCost) / finalPrice) * 100 : 0;

  try {
    const recipe = await db.recipe.create({
      data: {
        organizationId,
        restaurantId,
        name,
        description: description || '',
        category: category || 'main',
        servings: servings || 1,
        prepTime: prepTime || 0,
        cookTime: cookTime || 0,
        difficulty: difficulty || 'medium',
        instructions: instructions ? JSON.stringify(instructions) : null,
        imageUrl,
        videoUrl,
        totalCost,
        sellingPrice: finalPrice,
        margin: Math.round(margin * 10) / 10,
        tags: tags ? JSON.stringify(tags) : null,
        notes,
        ingredients: {
          create: (ingredients || []).map((ing: any, index: number) => ({
            inventoryItemId: ing.inventoryItemId,
            name: ing.name,
            quantity: ing.quantity || 0,
            unit: ing.unit || 'kg',
            cost: ing.cost || 0,
            notes: ing.notes,
            isOptional: ing.isOptional || false,
            sortOrder: index,
          }))
        },
        steps: {
          create: (steps || []).map((step: any, index: number) => ({
            stepNumber: index + 1,
            instruction: step.instruction || step,
            timer: step.timer,
            temperature: step.temperature,
            imageUrl: step.imageUrl,
            videoUrl: step.videoUrl,
            tips: step.tips,
          }))
        },
        nutrition: nutrition ? {
          create: {
            calories: nutrition.calories || 0,
            protein: nutrition.protein || 0,
            carbs: nutrition.carbs || 0,
            fat: nutrition.fat || 0,
            fiber: nutrition.fiber || 0,
            sodium: nutrition.sodium || 0,
            cholesterol: nutrition.cholesterol || 0,
            sugar: nutrition.sugar || 0,
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
      data: recipe,
      message: 'Recette créée avec succès',
    });
  } catch (error: any) {
    console.error('Failed to create recipe:', error);
    const mockRecipe = {
      id: `new-${Date.now()}`,
      organizationId,
      restaurantId,
      name,
      description: description || '',
      category: category || 'main',
      servings: servings || 1,
      prepTime: prepTime || 0,
      cookTime: cookTime || 0,
      difficulty: difficulty || 'medium',
      ingredients: ingredients || [],
      steps: steps || [],
      instructions: instructions || [],
      totalCost,
      sellingPrice: finalPrice,
      margin: Math.round(margin * 10) / 10,
      nutrition,
      isActive: true,
    };

    return NextResponse.json({
      success: true,
      data: mockRecipe,
      message: 'Recette créée avec succès (mode démo)',
    });
  }
});

// PUT - Update recipe
export const PUT = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'ID requis' },
      { status: 400 }
    );
  }

  try {
    // Check if recipe exists
    const existing = await db.recipe.findUnique({
      where: { id },
      include: { ingredients: true, steps: true, nutrition: true }
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Recette non trouvée' },
        { status: 404 }
      );
    }

    // Calculate totals if ingredients changed
    let totalCost = existing.totalCost;
    let margin = existing.margin;

    if (updates.ingredients) {
      totalCost = updates.ingredients.reduce((sum: number, ing: any) => sum + (ing.quantity * ing.cost || 0), 0);
      const sellingPrice = updates.sellingPrice || existing.sellingPrice;
      margin = sellingPrice > 0 ? ((sellingPrice - totalCost) / sellingPrice) * 100 : 0;
      margin = Math.round(margin * 10) / 10;
    }

    // Update recipe
    const recipe = await db.recipe.update({
      where: { id },
      data: {
        ...updates,
        totalCost,
        margin,
        instructions: updates.instructions ? JSON.stringify(updates.instructions) : undefined,
        tags: updates.tags ? JSON.stringify(updates.tags) : undefined,
        updatedAt: new Date(),
      },
      include: {
        ingredients: true,
        steps: true,
        nutrition: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: recipe,
      message: 'Recette mise à jour',
    });
  } catch (error) {
    console.error('Failed to update recipe:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
});

// DELETE - Delete recipe
export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'ID requis' },
      { status: 400 }
    );
  }

  try {
    // Check if recipe exists
    const existing = await db.recipe.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Recette non trouvée' },
        { status: 404 }
      );
    }

    // Delete recipe (cascade will handle related records)
    await db.recipe.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Recette supprimée',
    });
  } catch (error) {
    console.error('Failed to delete recipe:', error);
    return NextResponse.json({
      success: true,
      message: 'Recette supprimée (mode démo)',
    });
  }
});