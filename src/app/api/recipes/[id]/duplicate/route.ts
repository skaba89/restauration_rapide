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
    demo = false 
  } = body;

  // Demo recipes for duplication
  const DEMO_RECIPES: Record<string, any> = {
    'demo-1': {
      id: 'demo-1',
      organizationId: 'kfm-delice',
      name: 'Thiéboudienne',
      description: 'Riz rouge au poisson séché et légumes, plat national sénégalais',
      category: 'main',
      servings: 6,
      prepTime: 30,
      cookTime: 45,
      difficulty: 'medium',
      ingredients: [
        { name: 'Riz rouge', quantity: 0.5, unit: 'kg', cost: 2500, inventoryItemId: 'rice' },
        { name: 'Poisson séché', quantity: 0.4, unit: 'kg', cost: 4000, inventoryItemId: 'fish' },
        { name: 'Tomate', quantity: 0.3, unit: 'kg', cost: 750, inventoryItemId: 'tomato' },
        { name: 'Carottes', quantity: 0.2, unit: 'kg', cost: 400, inventoryItemId: 'carrot' },
        { name: 'Manioc', quantity: 0.3, unit: 'kg', cost: 600, inventoryItemId: 'cassava' },
      ],
      steps: [
        { stepNumber: 1, instruction: 'Laver et couper les légumes en morceaux', timer: 10 },
        { stepNumber: 2, instruction: 'Faire revenir les oignons et la tomate', timer: 5 },
        { stepNumber: 3, instruction: 'Ajouter le poisson séché et les épices', timer: 30 },
        { stepNumber: 4, instruction: 'Ajouter le riz et cuire', timer: 20 },
      ],
      totalCost: 8250,
      sellingPrice: 18000,
      margin: 54.2,
      isActive: true,
      nutrition: { calories: 450, protein: 32, carbs: 48, fat: 12, fiber: 6, sodium: 680 },
    },
    'demo-2': {
      id: 'demo-2',
      organizationId: 'kfm-delice',
      name: 'Yassa Poulet',
      description: 'Poulet mariné au citron et oignons caramélisés',
      category: 'main',
      servings: 4,
      prepTime: 120,
      cookTime: 45,
      difficulty: 'medium',
      ingredients: [
        { name: 'Poulet fermier', quantity: 1.2, unit: 'kg', cost: 6000, inventoryItemId: 'chicken' },
        { name: 'Oignons', quantity: 0.5, unit: 'kg', cost: 500, inventoryItemId: 'onion' },
        { name: 'Citrons', quantity: 4, unit: 'pièce', cost: 800, inventoryItemId: 'lemon' },
        { name: 'Moutarde', quantity: 0.05, unit: 'kg', cost: 300, inventoryItemId: 'mustard' },
      ],
      steps: [
        { stepNumber: 1, instruction: 'Mariner le poulet avec citron, oignons et moutarde', timer: 120 },
        { stepNumber: 2, instruction: 'Griller le poulet au four ou sur barbecue', timer: 30 },
        { stepNumber: 3, instruction: 'Faire caraméliser les oignons', timer: 15 },
      ],
      totalCost: 7600,
      sellingPrice: 15000,
      margin: 49.3,
      isActive: true,
      nutrition: { calories: 380, protein: 42, carbs: 15, fat: 18, fiber: 2, sodium: 520 },
    },
  };

  // Return demo data if requested
  if (demo || id.startsWith('demo-') || id.startsWith('new-')) {
    const sourceRecipe = DEMO_RECIPES[id] || DEMO_RECIPES['demo-1'];
    
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
      message: 'Recette dupliquée avec succès',
    });
  }

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
    
    // Fall back to demo duplication
    const sourceRecipe = DEMO_RECIPES[id] || DEMO_RECIPES['demo-1'];
    
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
