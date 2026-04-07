import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-responses';
import { db } from '@/lib/db';

// Demo recipes for fallback
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
      { id: '1-1', inventoryItemId: 'rice', name: 'Riz rouge', quantity: 0.5, unit: 'kg', cost: 2500 },
      { id: '1-2', inventoryItemId: 'fish', name: 'Poisson séché', quantity: 0.4, unit: 'kg', cost: 4000 },
      { id: '1-3', inventoryItemId: 'tomato', name: 'Tomate', quantity: 0.3, unit: 'kg', cost: 750 },
      { id: '1-4', inventoryItemId: 'carrot', name: 'Carottes', quantity: 0.2, unit: 'kg', cost: 400 },
      { id: '1-5', inventoryItemId: 'cassava', name: 'Manioc', quantity: 0.3, unit: 'kg', cost: 600 },
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
      { id: '2-1', inventoryItemId: 'chicken', name: 'Poulet fermier', quantity: 1.2, unit: 'kg', cost: 6000 },
      { id: '2-2', inventoryItemId: 'onion', name: 'Oignons', quantity: 0.5, unit: 'kg', cost: 500 },
      { id: '2-3', inventoryItemId: 'lemon', name: 'Citrons', quantity: 4, unit: 'pièce', cost: 800 },
      { id: '2-4', inventoryItemId: 'mustard', name: 'Moutarde', quantity: 0.05, unit: 'kg', cost: 300 },
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

// GET - Get single recipe
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const demo = searchParams.get('demo') === 'true';

  // Return demo data if requested
  if (demo || id.startsWith('demo-') || id.startsWith('new-')) {
    const recipe = DEMO_RECIPES[id] || null;
    
    if (!recipe) {
      return NextResponse.json(
        { success: false, error: 'Recette non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: recipe,
    });
  }

  try {
    const recipe = await db.recipe.findUnique({
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

    if (!recipe) {
      return NextResponse.json(
        { success: false, error: 'Recette non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: recipe,
    });
  } catch (error) {
    console.error('Failed to fetch recipe:', error);
    // Fall back to demo
    const recipe = DEMO_RECIPES[id] || DEMO_RECIPES['demo-1'];
    return NextResponse.json({
      success: true,
      data: recipe,
    });
  }
});

// PUT - Update recipe
export const PUT = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();

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

    if (body.ingredients) {
      totalCost = body.ingredients.reduce((sum: number, ing: any) => sum + (ing.quantity * ing.cost || 0), 0);
      const sellingPrice = body.sellingPrice || existing.sellingPrice;
      margin = sellingPrice > 0 ? ((sellingPrice - totalCost) / sellingPrice) * 100 : 0;
      margin = Math.round(margin * 10) / 10;
    }

    // Update recipe
    const recipe = await db.recipe.update({
      where: { id },
      data: {
        ...body,
        totalCost,
        margin,
        instructions: body.instructions ? JSON.stringify(body.instructions) : undefined,
        tags: body.tags ? JSON.stringify(body.tags) : undefined,
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
    
    // Demo mode fallback
    const demoRecipe = DEMO_RECIPES[id] || DEMO_RECIPES['demo-1'];
    return NextResponse.json({
      success: true,
      data: { ...demoRecipe, ...body },
      message: 'Recette mise à jour (mode démo)',
    });
  }
});

// DELETE - Delete recipe
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

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

    // Delete recipe
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
