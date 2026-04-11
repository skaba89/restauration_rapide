import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Demo allergens data
const DEMO_ALLERGENS = [
  { id: 'peanuts', name: 'Arachides', icon: '🥜', description: 'Cacahuètes et dérivés' },
  { id: 'tree-nuts', name: 'Fruits à coque', icon: '🌰', description: 'Noix, amandes, noisettes, etc.' },
  { id: 'dairy', name: 'Lait/Lactose', icon: '🥛', description: 'Produits laitiers et dérivés' },
  { id: 'eggs', name: 'Œufs', icon: '🥚', description: 'Œufs et produits à base d\'œufs' },
  { id: 'fish', name: 'Poisson', icon: '🐟', description: 'Poissons et produits de la mer' },
  { id: 'shellfish', name: 'Crustacés', icon: '🦐', description: 'Crevettes, crabes, homards, etc.' },
  { id: 'gluten', name: 'Gluten', icon: '🌾', description: 'Blé, orge, seigle et dérivés' },
  { id: 'soy', name: 'Soja', icon: '🫘', description: 'Soja et produits à base de soja' },
  { id: 'sesame', name: 'Sésame', icon: '🦴', description: 'Graines de sésame et dérivés' },
];

// Demo menu items with nutrition and allergen info
const DEMO_MENU_ITEMS = [
  {
    id: '1',
    name: 'Attieké Poisson Grillé',
    calories: 450,
    protein: 32,
    carbs: 45,
    fat: 18,
    fiber: 3,
    sodium: 680,
    allergens: ['fish', 'gluten'],
    isVegetarian: false,
    isVegan: false,
    isHalal: true,
    isGlutenFree: false,
    isSpicy: false,
    spicyLevel: 0,
    price: 3500,
    category: 'Plats Principaux'
  },
  {
    id: '2',
    name: 'Kedjenou de Poulet',
    calories: 380,
    protein: 28,
    carbs: 35,
    fat: 15,
    fiber: 2,
    sodium: 520,
    allergens: [],
    isVegetarian: false,
    isVegan: false,
    isHalal: true,
    isGlutenFree: true,
    isSpicy: false,
    spicyLevel: 0,
    price: 3200,
    category: 'Plats Principaux'
  },
  {
    id: '3',
    name: 'Thiéboudienne',
    calories: 520,
    protein: 25,
    carbs: 65,
    fat: 12,
    fiber: 4,
    sodium: 890,
    allergens: ['fish', 'gluten'],
    isVegetarian: false,
    isVegan: false,
    isHalal: true,
    isGlutenFree: false,
    isSpicy: true,
    spicyLevel: 2,
    price: 3000,
    category: 'Plats Principaux'
  },
  {
    id: '4',
    name: 'Alloco Sauce Graine',
    calories: 420,
    protein: 8,
    carbs: 52,
    fat: 22,
    fiber: 5,
    sodium: 450,
    allergens: [],
    isVegetarian: true,
    isVegan: true,
    isHalal: true,
    isGlutenFree: true,
    isSpicy: true,
    spicyLevel: 1,
    price: 1500,
    category: 'Plats Principaux'
  },
  {
    id: '5',
    name: 'Riz Gras',
    calories: 380,
    protein: 6,
    carbs: 68,
    fat: 10,
    fiber: 1,
    sodium: 320,
    allergens: [],
    isVegetarian: true,
    isVegan: true,
    isHalal: true,
    isGlutenFree: true,
    isSpicy: false,
    spicyLevel: 0,
    price: 1200,
    category: 'Accompagnements'
  },
  {
    id: '6',
    name: 'Garba',
    calories: 350,
    protein: 18,
    carbs: 42,
    fat: 12,
    fiber: 2,
    sodium: 750,
    allergens: ['fish'],
    isVegetarian: false,
    isVegan: false,
    isHalal: true,
    isGlutenFree: true,
    isSpicy: true,
    spicyLevel: 3,
    price: 2000,
    category: 'Plats Principaux'
  },
  {
    id: '7',
    name: 'Foutou Banane',
    calories: 320,
    protein: 4,
    carbs: 72,
    fat: 2,
    fiber: 6,
    sodium: 180,
    allergens: [],
    isVegetarian: true,
    isVegan: true,
    isHalal: true,
    isGlutenFree: true,
    isSpicy: false,
    spicyLevel: 0,
    price: 1000,
    category: 'Accompagnements'
  },
  {
    id: '8',
    name: 'Jus de Bissap',
    calories: 120,
    protein: 1,
    carbs: 28,
    fat: 0,
    fiber: 0,
    sodium: 15,
    allergens: [],
    isVegetarian: true,
    isVegan: true,
    isHalal: true,
    isGlutenFree: true,
    isSpicy: false,
    spicyLevel: 0,
    price: 500,
    category: 'Boissons'
  },
  {
    id: '9',
    name: 'Jus de Gingembre',
    calories: 95,
    protein: 1,
    carbs: 22,
    fat: 0,
    fiber: 0,
    sodium: 10,
    allergens: [],
    isVegetarian: true,
    isVegan: true,
    isHalal: true,
    isGlutenFree: true,
    isSpicy: true,
    spicyLevel: 1,
    price: 500,
    category: 'Boissons'
  },
  {
    id: '10',
    name: 'Banane Plantain Frite',
    calories: 280,
    protein: 2,
    carbs: 45,
    fat: 12,
    fiber: 3,
    sodium: 120,
    allergens: [],
    isVegetarian: true,
    isVegan: true,
    isHalal: true,
    isGlutenFree: true,
    isSpicy: false,
    spicyLevel: 0,
    price: 800,
    category: 'Accompagnements'
  },
  {
    id: '11',
    name: 'Poulet Braisé',
    calories: 420,
    protein: 35,
    carbs: 8,
    fat: 28,
    fiber: 0,
    sodium: 650,
    allergens: [],
    isVegetarian: false,
    isVegan: false,
    isHalal: true,
    isGlutenFree: true,
    isSpicy: true,
    spicyLevel: 2,
    price: 4000,
    category: 'Plats Principaux'
  },
  {
    id: '12',
    name: 'Soupe de Poisson',
    calories: 280,
    protein: 24,
    carbs: 12,
    fat: 15,
    fiber: 2,
    sodium: 820,
    allergens: ['fish', 'shellfish'],
    isVegetarian: false,
    isVegan: false,
    isHalal: true,
    isGlutenFree: true,
    isSpicy: true,
    spicyLevel: 2,
    price: 3500,
    category: 'Plats Principaux'
  },
];

// GET - List allergens or get menu item allergens
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const menuItemId = searchParams.get('menuItemId');
  const demo = searchParams.get('demo') === 'true';
  
  try {
    // Demo mode
    if (demo) {
      if (menuItemId) {
        const item = DEMO_MENU_ITEMS.find(i => i.id === menuItemId);
        if (!item) {
          return NextResponse.json({ success: false, error: 'Article non trouvé' }, { status: 404 });
        }
        
        const allergenDetails = item.allergens.map(aId => 
          DEMO_ALLERGENS.find(a => a.id === aId)
        ).filter(Boolean);
        
        return NextResponse.json({
          success: true,
          data: {
            ...item,
            allergenDetails
          }
        });
      }
      
      // Return all allergens
      return NextResponse.json({
        success: true,
        data: DEMO_ALLERGENS
      });
    }
    
    // Real database queries
    if (menuItemId) {
      const menuItem = await db.menuItem.findUnique({
        where: { id: menuItemId },
        include: {
          allergens: {
            include: {
              allergen: true
            }
          },
          category: {
            select: { name: true }
          }
        }
      });
      
      if (!menuItem) {
        return NextResponse.json({ success: false, error: 'Article non trouvé' }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        data: {
          id: menuItem.id,
          name: menuItem.name,
          calories: menuItem.calories,
          protein: menuItem.protein,
          carbs: menuItem.carbs,
          fat: menuItem.fat,
          fiber: menuItem.fiber,
          sodium: menuItem.sodium,
          isVegetarian: menuItem.isVegetarian,
          isVegan: menuItem.isVegan,
          isHalal: menuItem.isHalal,
          isGlutenFree: menuItem.isGlutenFree,
          isSpicy: menuItem.isSpicy,
          spicyLevel: menuItem.spicyLevel,
          price: menuItem.price,
          category: menuItem.category.name,
          allergens: menuItem.allergens.map(a => a.allergenId),
          allergenDetails: menuItem.allergens.map(a => a.allergen)
        }
      });
    }
    
    // Get all allergens from database
    const allergens = await db.allergen.findMany({
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json({
      success: true,
      data: allergens.length > 0 ? allergens : DEMO_ALLERGENS
    });
  } catch (error) {
    console.error('Error fetching allergens:', error);
    return NextResponse.json({
      success: true,
      data: DEMO_ALLERGENS
    });
  }
}

// GET menu items with nutrition info
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, data } = body;
  const demo = data?.demo === true;
  
  try {
    // Demo mode
    if (demo) {
      switch (action) {
        case 'getMenuItems':
          return NextResponse.json({
            success: true,
            data: DEMO_MENU_ITEMS.map(item => ({
              ...item,
              allergenDetails: item.allergens.map(aId => 
                DEMO_ALLERGENS.find(a => a.id === aId)
              ).filter(Boolean)
            }))
          });
          
        case 'addMenuItemAllergen':
          return NextResponse.json({
            success: true,
            message: 'Allergène ajouté avec succès (mode démo)'
          });
          
        case 'updateNutrition':
          return NextResponse.json({
            success: true,
            message: 'Informations nutritionnelles mises à jour (mode démo)'
          });
          
        case 'bulkAssignAllergens':
          return NextResponse.json({
            success: true,
            message: 'Allergènes assignés en lot (mode démo)'
          });
          
        default:
          return NextResponse.json({
            success: false,
            error: 'Action non reconnue'
          }, { status: 400 });
      }
    }
    
    // Real database operations
    switch (action) {
      case 'getMenuItems': {
        const menuItems = await db.menuItem.findMany({
          include: {
            category: {
              select: { name: true }
            },
            allergens: {
              include: {
                allergen: true
              }
            }
          },
          orderBy: { name: 'asc' }
        });
        
        return NextResponse.json({
          success: true,
          data: menuItems.map(item => ({
            id: item.id,
            name: item.name,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            fiber: item.fiber,
            sodium: item.sodium,
            isVegetarian: item.isVegetarian,
            isVegan: item.isVegan,
            isHalal: item.isHalal,
            isGlutenFree: item.isGlutenFree,
            isSpicy: item.isSpicy,
            spicyLevel: item.spicyLevel,
            price: item.price,
            category: item.category.name,
            allergens: item.allergens.map(a => a.allergenId),
            allergenDetails: item.allergens.map(a => a.allergen)
          }))
        });
      }
      
      case 'addMenuItemAllergen': {
        const { menuItemId, allergenId } = data;
        
        // Check if allergen exists, if not create it
        let allergen = await db.allergen.findUnique({
          where: { id: allergenId }
        });
        
        if (!allergen) {
          const demoAllergen = DEMO_ALLERGENS.find(a => a.id === allergenId);
          if (demoAllergen) {
            allergen = await db.allergen.create({
              data: {
                id: allergenId,
                name: demoAllergen.name,
                icon: demoAllergen.icon,
                description: demoAllergen.description
              }
            });
          }
        }
        
        await db.menuItemAllergen.create({
          data: {
            menuItemId,
            allergenId
          }
        });
        
        return NextResponse.json({
          success: true,
          message: 'Allergène ajouté avec succès'
        });
      }
      
      case 'updateNutrition': {
        const { menuItemId, nutrition } = data;
        
        await db.menuItem.update({
          where: { id: menuItemId },
          data: {
            calories: nutrition.calories,
            protein: nutrition.protein,
            carbs: nutrition.carbs,
            fat: nutrition.fat,
            fiber: nutrition.fiber,
            sodium: nutrition.sodium,
            isVegetarian: nutrition.isVegetarian,
            isVegan: nutrition.isVegan,
            isHalal: nutrition.isHalal,
            isGlutenFree: nutrition.isGlutenFree,
            isSpicy: nutrition.isSpicy,
            spicyLevel: nutrition.spicyLevel
          }
        });
        
        return NextResponse.json({
          success: true,
          message: 'Informations nutritionnelles mises à jour'
        });
      }
      
      case 'bulkAssignAllergens': {
        const { menuItemIds, allergenIds } = data;
        
        // Create all allergen associations
        const createPromises = menuItemIds.flatMap(menuItemId =>
          allergenIds.map(allergenId =>
            db.menuItemAllergen.upsert({
              where: {
                menuItemId_allergenId: { menuItemId, allergenId }
              },
              create: { menuItemId, allergenId },
              update: {}
            })
          )
        );
        
        await Promise.all(createPromises);
        
        return NextResponse.json({
          success: true,
          message: `${createPromises.length} associations créées`
        });
      }
      
      case 'removeMenuItemAllergen': {
        const { menuItemId, allergenId } = data;
        
        await db.menuItemAllergen.delete({
          where: {
            menuItemId_allergenId: { menuItemId, allergenId }
          }
        });
        
        return NextResponse.json({
          success: true,
          message: 'Allergène retiré'
        });
      }
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Action non reconnue'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in allergens API:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
}

// PUT - Update nutrition info
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { menuItemId, nutrition, demo } = body;
  
  if (demo) {
    return NextResponse.json({
      success: true,
      message: 'Informations nutritionnelles mises à jour (mode démo)'
    });
  }
  
  try {
    await db.menuItem.update({
      where: { id: menuItemId },
      data: {
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        fiber: nutrition.fiber,
        sodium: nutrition.sodium,
        isVegetarian: nutrition.isVegetarian,
        isVegan: nutrition.isVegan,
        isHalal: nutrition.isHalal,
        isGlutenFree: nutrition.isGlutenFree,
        isSpicy: nutrition.isSpicy,
        spicyLevel: nutrition.spicyLevel
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Informations nutritionnelles mises à jour'
    });
  } catch (error) {
    console.error('Error updating nutrition:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la mise à jour'
    }, { status: 500 });
  }
}
