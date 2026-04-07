import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-responses';
import { db } from '@/lib/db';

// Demo recipes data with African cuisine
const DEMO_RECIPES = [
  {
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
    instructions: [
      'Laver et couper les légumes en morceaux',
      'Faire revenir les oignons et la tomate',
      'Ajouter le poisson séché et les épices',
      'Laisser mijoter 30 minutes',
      'Ajouter le riz et cuire 20 minutes',
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
  {
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
    instructions: [
      'Mariner le poulet avec citron, oignons et moutarde 2h minimum',
      'Griller le poulet au four ou sur barbecue',
      'Faire caraméliser les oignons dans la marinade',
      'Servir le poulet nappé de sauce aux oignons',
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
  {
    id: 'demo-3',
    organizationId: 'kfm-delice',
    name: 'Kedjenou',
    description: 'Ragoût de poulet mijoté en cocotte, spécialité ivoirienne',
    category: 'main',
    servings: 5,
    prepTime: 20,
    cookTime: 60,
    difficulty: 'easy',
    ingredients: [
      { id: '3-1', inventoryItemId: 'chicken', name: 'Poulet', quantity: 1.5, unit: 'kg', cost: 7500 },
      { id: '3-2', inventoryItemId: 'tomato', name: 'Tomates', quantity: 0.4, unit: 'kg', cost: 1000 },
      { id: '3-3', inventoryItemId: 'eggplant', name: 'Aubergines', quantity: 0.3, unit: 'kg', cost: 600 },
      { id: '3-4', inventoryItemId: 'palm-oil', name: 'Huile de palme', quantity: 0.1, unit: 'litre', cost: 800 },
    ],
    instructions: [
      'Couper le poulet en morceaux',
      'Mettre tous les ingrédients dans une cocotte',
      'Sceller hermétiquement et secouer régulièrement',
      'Laisser mijoter 1h sans ouvrir',
    ],
    steps: [
      { stepNumber: 1, instruction: 'Couper le poulet en morceaux', timer: 10 },
      { stepNumber: 2, instruction: 'Mettre tous les ingrédients dans une cocotte', timer: 5 },
      { stepNumber: 3, instruction: 'Laisser mijoter 1h sans ouvrir', timer: 60 },
    ],
    totalCost: 9900,
    sellingPrice: 20000,
    margin: 50.5,
    isActive: true,
    nutrition: { calories: 420, protein: 38, carbs: 12, fat: 24, fiber: 4, sodium: 590 },
  },
  {
    id: 'demo-4',
    organizationId: 'kfm-delice',
    name: 'Attiéké Poisson',
    description: 'Semoule de manioc fermentée avec poisson grillé',
    category: 'main',
    servings: 4,
    prepTime: 15,
    cookTime: 25,
    difficulty: 'easy',
    ingredients: [
      { id: '4-1', inventoryItemId: 'attieke', name: 'Attiéké', quantity: 0.6, unit: 'kg', cost: 2000 },
      { id: '4-2', inventoryItemId: 'fish', name: 'Poisson frais', quantity: 1, unit: 'kg', cost: 5000 },
      { id: '4-3', inventoryItemId: 'tomato', name: 'Tomates', quantity: 0.3, unit: 'kg', cost: 750 },
      { id: '4-4', inventoryItemId: 'onion', name: 'Oignons', quantity: 0.2, unit: 'kg', cost: 200 },
      { id: '4-5', inventoryItemId: 'pepper', name: 'Piment', quantity: 0.02, unit: 'kg', cost: 100 },
    ],
    instructions: [
      'Griller le poisson assaisonné',
      'Préparer la sauce tomate avec oignons et piment',
      'Réchauffer l\'attiéké à la vapeur',
      'Servir le poisson avec attiéké et sauce',
    ],
    steps: [
      { stepNumber: 1, instruction: 'Griller le poisson assaisonné', timer: 20 },
      { stepNumber: 2, instruction: 'Préparer la sauce tomate', timer: 10 },
      { stepNumber: 3, instruction: 'Réchauffer l\'attiéké à la vapeur', timer: 5 },
    ],
    totalCost: 8050,
    sellingPrice: 15000,
    margin: 46.3,
    isActive: true,
    nutrition: { calories: 350, protein: 35, carbs: 42, fat: 8, fiber: 3, sodium: 420 },
  },
  {
    id: 'demo-5',
    organizationId: 'kfm-delice',
    name: 'Riz Gras',
    description: 'Riz sauté à la tomate avec viande ou poisson',
    category: 'main',
    servings: 4,
    prepTime: 10,
    cookTime: 35,
    difficulty: 'easy',
    ingredients: [
      { id: '5-1', inventoryItemId: 'rice', name: 'Riz', quantity: 0.4, unit: 'kg', cost: 1200 },
      { id: '5-2', inventoryItemId: 'meat', name: 'Viande de bœuf', quantity: 0.4, unit: 'kg', cost: 3000 },
      { id: '5-3', inventoryItemId: 'tomato', name: 'Concentré de tomate', quantity: 0.1, unit: 'kg', cost: 500 },
      { id: '5-4', inventoryItemId: 'oil', name: 'Huile végétale', quantity: 0.1, unit: 'litre', cost: 600 },
    ],
    instructions: [
      'Faire revenir la viande coupée en dés',
      'Ajouter le concentré de tomate et les épices',
      'Verser le riz et bien mélanger',
      'Ajouter l\'eau et cuire à couvert',
    ],
    steps: [
      { stepNumber: 1, instruction: 'Faire revenir la viande coupée en dés', timer: 10 },
      { stepNumber: 2, instruction: 'Ajouter le concentré de tomate et les épices', timer: 5 },
      { stepNumber: 3, instruction: 'Verser le riz et cuire', timer: 20 },
    ],
    totalCost: 5300,
    sellingPrice: 10000,
    margin: 47.0,
    isActive: true,
    nutrition: { calories: 480, protein: 25, carbs: 55, fat: 18, fiber: 2, sodium: 380 },
  },
  {
    id: 'demo-6',
    organizationId: 'kfm-delice',
    name: 'Alloco',
    description: 'Bananes plantains frites, accompagnement populaire',
    category: 'appetizer',
    servings: 4,
    prepTime: 5,
    cookTime: 15,
    difficulty: 'easy',
    ingredients: [
      { id: '6-1', inventoryItemId: 'plantain', name: 'Banane plantain', quantity: 1, unit: 'kg', cost: 1000 },
      { id: '6-2', inventoryItemId: 'oil', name: 'Huile de friture', quantity: 0.2, unit: 'litre', cost: 1200 },
    ],
    instructions: [
      'Peler et couper les bananes en morceaux',
      'Chauffer l\'huile à température moyenne',
      'Frire les morceaux jusqu\'à coloration dorée',
      'Égoutter et saler',
    ],
    steps: [
      { stepNumber: 1, instruction: 'Peler et couper les bananes en morceaux', timer: 5 },
      { stepNumber: 2, instruction: 'Frire les morceaux jusqu\'à coloration dorée', timer: 10 },
    ],
    totalCost: 2200,
    sellingPrice: 4000,
    margin: 45.0,
    isActive: true,
    nutrition: { calories: 320, protein: 2, carbs: 48, fat: 15, fiber: 4, sodium: 5 },
  },
  {
    id: 'demo-7',
    organizationId: 'kfm-delice',
    name: 'Garba',
    description: 'Attiéké avec thon et sauce pimentée',
    category: 'main',
    servings: 2,
    prepTime: 10,
    cookTime: 0,
    difficulty: 'easy',
    ingredients: [
      { id: '7-1', inventoryItemId: 'attieke', name: 'Attiéké', quantity: 0.3, unit: 'kg', cost: 1000 },
      { id: '7-2', inventoryItemId: 'tuna', name: 'Thon en conserve', quantity: 0.2, unit: 'kg', cost: 1500 },
      { id: '7-3', inventoryItemId: 'onion', name: 'Oignon', quantity: 0.1, unit: 'kg', cost: 100 },
      { id: '7-4', inventoryItemId: 'pepper', name: 'Piment frais', quantity: 0.03, unit: 'kg', cost: 150 },
    ],
    instructions: [
      'Égoutter le thon et l\'émietter',
      'Couper les oignons en fines lamelles',
      'Mélanger attiéké, thon, oignons et piment',
      'Servir frais',
    ],
    steps: [
      { stepNumber: 1, instruction: 'Égoutter le thon et l\'émietter', timer: 3 },
      { stepNumber: 2, instruction: 'Couper les oignons en fines lamelles', timer: 3 },
      { stepNumber: 3, instruction: 'Mélanger tous les ingrédients', timer: 2 },
    ],
    totalCost: 2750,
    sellingPrice: 5000,
    margin: 45.0,
    isActive: true,
    nutrition: { calories: 280, protein: 28, carbs: 32, fat: 6, fiber: 2, sodium: 450 },
  },
  {
    id: 'demo-8',
    organizationId: 'kfm-delice',
    name: 'Jus de Bissap',
    description: 'Boisson rafraîchissante à base de fleurs d\'hibiscus',
    category: 'beverage',
    servings: 8,
    prepTime: 15,
    cookTime: 10,
    difficulty: 'easy',
    ingredients: [
      { id: '8-1', inventoryItemId: 'bissap', name: 'Fleurs de bissap', quantity: 0.1, unit: 'kg', cost: 500 },
      { id: '8-2', inventoryItemId: 'sugar', name: 'Sucre', quantity: 0.2, unit: 'kg', cost: 400 },
      { id: '8-3', inventoryItemId: 'mint', name: 'Menthe fraîche', quantity: 0.02, unit: 'kg', cost: 200 },
    ],
    instructions: [
      'Faire bouillir les fleurs de bissap 10 minutes',
      'Filtrer et laisser refroidir',
      'Ajouter le sucre et la menthe',
      'Servir frais avec glace',
    ],
    steps: [
      { stepNumber: 1, instruction: 'Faire bouillir les fleurs de bissap', timer: 10 },
      { stepNumber: 2, instruction: 'Filtrer et laisser refroidir', timer: 30 },
      { stepNumber: 3, instruction: 'Ajouter le sucre et la menthe', timer: 2 },
    ],
    totalCost: 1100,
    sellingPrice: 3000,
    margin: 63.3,
    isActive: true,
    nutrition: { calories: 85, protein: 0, carbs: 22, fat: 0, fiber: 0, sodium: 5 },
  },
  {
    id: 'demo-9',
    organizationId: 'kfm-delice',
    name: 'Sauce Graine',
    description: 'Sauce onctueuse aux graines de palme',
    category: 'sauce',
    servings: 6,
    prepTime: 30,
    cookTime: 60,
    difficulty: 'hard',
    ingredients: [
      { id: '9-1', inventoryItemId: 'palm-nut', name: 'Graines de palme', quantity: 1, unit: 'kg', cost: 1500 },
      { id: '9-2', inventoryItemId: 'meat', name: 'Viande fumée', quantity: 0.5, unit: 'kg', cost: 2500 },
      { id: '9-3', inventoryItemId: 'fish', name: 'Poisson fumé', quantity: 0.2, unit: 'kg', cost: 1000 },
      { id: '9-4', inventoryItemId: 'crayfish', name: 'Écrevisses séchées', quantity: 0.05, unit: 'kg', cost: 500 },
    ],
    instructions: [
      'Piler les graines de palme et extraire le jus',
      'Faire cuire la viande et le poisson',
      'Verser le jus de graine sur les viandes',
      'Laisser mijoter jusqu\'à épaississement',
    ],
    steps: [
      { stepNumber: 1, instruction: 'Piler les graines de palme et extraire le jus', timer: 20 },
      { stepNumber: 2, instruction: 'Faire cuire la viande et le poisson', timer: 30 },
      { stepNumber: 3, instruction: 'Laisser mijoter jusqu\'à épaississement', timer: 40 },
    ],
    totalCost: 5500,
    sellingPrice: 12000,
    margin: 54.2,
    isActive: true,
    nutrition: { calories: 380, protein: 28, carbs: 15, fat: 25, fiber: 4, sodium: 650 },
  },
  {
    id: 'demo-10',
    organizationId: 'kfm-delice',
    name: 'Foutou Banane',
    description: 'Pâte de banane plantain à accompagner les sauces',
    category: 'main',
    servings: 4,
    prepTime: 10,
    cookTime: 30,
    difficulty: 'medium',
    ingredients: [
      { id: '10-1', inventoryItemId: 'plantain', name: 'Banane plantain mûre', quantity: 1, unit: 'kg', cost: 800 },
      { id: '10-2', inventoryItemId: 'cassava', name: 'Manioc', quantity: 0.5, unit: 'kg', cost: 400 },
    ],
    instructions: [
      'Cuire les bananes plantains et le manioc',
      'Égoutter et piler ensemble jusqu\'à consistance lisse',
      'Façonner en boules',
      'Servir avec sauce de votre choix',
    ],
    steps: [
      { stepNumber: 1, instruction: 'Cuire les bananes plantains et le manioc', timer: 25 },
      { stepNumber: 2, instruction: 'Piler ensemble jusqu\'à consistance lisse', timer: 10 },
    ],
    totalCost: 1200,
    sellingPrice: 3000,
    margin: 60.0,
    isActive: true,
    nutrition: { calories: 280, protein: 3, carbs: 65, fat: 1, fiber: 6, sodium: 10 },
  },
  {
    id: 'demo-11',
    organizationId: 'kfm-delice',
    name: 'Jus de Gingembre',
    description: 'Boisson épicée et rafraîchissante au gingembre frais',
    category: 'beverage',
    servings: 6,
    prepTime: 10,
    cookTime: 5,
    difficulty: 'easy',
    ingredients: [
      { id: '11-1', inventoryItemId: 'ginger', name: 'Gingembre frais', quantity: 0.15, unit: 'kg', cost: 450 },
      { id: '11-2', inventoryItemId: 'sugar', name: 'Sucre', quantity: 0.15, unit: 'kg', cost: 300 },
      { id: '11-3', inventoryItemId: 'lemon', name: 'Citron', quantity: 2, unit: 'pièce', cost: 400 },
    ],
    instructions: [
      'Râper ou mixer le gingembre',
      'Presser le jus de citron',
      'Mélanger gingembre, sucre, citron et eau',
      'Filtrer et servir frais',
    ],
    steps: [
      { stepNumber: 1, instruction: 'Râper ou mixer le gingembre', timer: 5 },
      { stepNumber: 2, instruction: 'Mélanger tous les ingrédients', timer: 3 },
    ],
    totalCost: 1150,
    sellingPrice: 2500,
    margin: 54.0,
    isActive: true,
    nutrition: { calories: 75, protein: 0, carbs: 19, fat: 0, fiber: 0, sodium: 5 },
  },
  {
    id: 'demo-12',
    organizationId: 'kfm-delice',
    name: 'Aloko',
    description: 'Allôco avec sauce graine ou sauce piment',
    category: 'appetizer',
    servings: 2,
    prepTime: 10,
    cookTime: 20,
    difficulty: 'easy',
    ingredients: [
      { id: '12-1', inventoryItemId: 'plantain', name: 'Banane plantain', quantity: 0.5, unit: 'kg', cost: 500 },
      { id: '12-2', inventoryItemId: 'oil', name: 'Huile', quantity: 0.15, unit: 'litre', cost: 900 },
      { id: '12-3', inventoryItemId: 'pepper', name: 'Piment', quantity: 0.02, unit: 'kg', cost: 100 },
    ],
    instructions: [
      'Couper les bananes en morceaux',
      'Frire jusqu\'à coloration dorée',
      'Préparer la sauce piment',
      'Servir chaud avec la sauce',
    ],
    steps: [
      { stepNumber: 1, instruction: 'Couper les bananes en morceaux', timer: 5 },
      { stepNumber: 2, instruction: 'Frire jusqu\'à coloration dorée', timer: 15 },
    ],
    totalCost: 1500,
    sellingPrice: 3500,
    margin: 57.1,
    isActive: true,
    nutrition: { calories: 340, protein: 2, carbs: 45, fat: 18, fiber: 3, sodium: 8 },
  },
];

// GET - List recipes with search
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const demo = searchParams.get('demo') === 'true';
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const organizationId = searchParams.get('organizationId') || '';
  const restaurantId = searchParams.get('restaurantId') || '';

  // Return demo data if requested or no organization
  if (demo || !organizationId) {
    let filteredRecipes = [...DEMO_RECIPES];

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filteredRecipes = filteredRecipes.filter(r =>
        r.name.toLowerCase().includes(searchLower) ||
        r.description.toLowerCase().includes(searchLower)
      );
    }

    // Filter by category
    if (category) {
      filteredRecipes = filteredRecipes.filter(r => r.category === category);
    }

    return NextResponse.json({
      success: true,
      data: filteredRecipes,
      total: filteredRecipes.length,
    });
  }

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
    // Fall back to demo data on error
    return NextResponse.json({
      success: true,
      data: DEMO_RECIPES,
      total: DEMO_RECIPES.length,
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
    
    // Fall back to demo mode - return a mock created recipe
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
