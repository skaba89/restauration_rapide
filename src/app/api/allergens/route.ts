import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List allergens or get menu item allergens
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const menuItemId = searchParams.get('menuItemId');
  
  try {
    
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
      data: allergens.length > 0 ? allergens : []
    });
  } catch (error) {
    console.error('Error fetching allergens:', error);
    return NextResponse.json({
      success: true,
      data: []
    });
  }
}

// GET menu items with nutrition info
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, data } = body;
  
  try {
    
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
  const { menuItemId, nutrition } = body;
  
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