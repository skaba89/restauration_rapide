// Menu Items Management API - Uses Prisma Database
import { NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';

// Demo menu data - fallback when database is not available
const DEMO_MENU_ITEMS = [
  {
    id: '1',
    name: 'Poulet Grillé',
    description: 'Poulet grillé mariné aux épices',
    category: 'Plats',
    price: 25000,
    costPrice: 15000,
    isAvailable: true,
    preparationTime: 25,
    isPopular: true,
    allergens: [],
    image: null,
  },
  {
    id: '2',
    name: 'Poisson Braisé',
    description: 'Poisson frais braisé avec sauce',
    category: 'Plats',
    price: 30000,
    costPrice: 18000,
    isAvailable: true,
    preparationTime: 20,
    isPopular: true,
    allergens: ['Poisson'],
    image: null,
  },
  {
    id: '3',
    name: 'Riz Sauce',
    description: 'Riz accompagné de sauce tomate',
    category: 'Plats',
    price: 15000,
    costPrice: 8000,
    isAvailable: true,
    preparationTime: 15,
    isPopular: false,
    allergens: [],
    image: null,
  },
  {
    id: '4',
    name: 'Attieké Poisson',
    description: 'Attieké avec poisson grillé',
    category: 'Plats',
    price: 20000,
    costPrice: 12000,
    isAvailable: false,
    preparationTime: 20,
    isPopular: true,
    allergens: ['Poisson'],
    image: null,
  },
  {
    id: '5',
    name: 'Riz Gras',
    description: 'Riz gras traditionnel',
    category: 'Plats',
    price: 18000,
    costPrice: 10000,
    isAvailable: true,
    preparationTime: 30,
    isPopular: false,
    allergens: [],
    image: null,
  },
  {
    id: '6',
    name: 'Coca-Cola',
    description: 'Boisson gazeuse rafraîchissante',
    category: 'Boissons',
    price: 2000,
    costPrice: 1000,
    isAvailable: true,
    preparationTime: 1,
    isPopular: false,
    allergens: [],
    image: null,
  },
  {
    id: '7',
    name: 'Jus de Bissap',
    description: 'Jus naturel de bissap fait maison',
    category: 'Boissons',
    price: 3000,
    costPrice: 1500,
    isAvailable: true,
    preparationTime: 2,
    isPopular: true,
    allergens: [],
    image: null,
  },
  {
    id: '8',
    name: 'Frites',
    description: 'Pommes de terre frites croustillantes',
    category: 'Accompagnements',
    price: 5000,
    costPrice: 2500,
    isAvailable: true,
    preparationTime: 10,
    isPopular: false,
    allergens: [],
    image: null,
  },
  {
    id: '9',
    name: 'Alloco',
    description: 'Bananes plantain frites',
    category: 'Accompagnements',
    price: 3000,
    costPrice: 1500,
    isAvailable: true,
    preparationTime: 10,
    isPopular: true,
    allergens: [],
    image: null,
  },
  {
    id: '10',
    name: 'Salade Mixte',
    description: 'Salade fraîche avec légumes de saison',
    category: 'Entrées',
    price: 8000,
    costPrice: 4000,
    isAvailable: true,
    preparationTime: 8,
    isPopular: false,
    allergens: [],
    image: null,
  },
];

// GET - Fetch all menu items for admin
export async function GET() {
  try {
    // Check if database is available
    if (!isDatabaseAvailable() || !db) {
      console.log('Database not available, returning demo data');
      return NextResponse.json({
        success: true,
        data: DEMO_MENU_ITEMS,
        isDemo: true,
      });
    }

    // Fetch from database
    const items = await db.simpleMenuItem.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    // Transform to match expected format
    const menuItems = items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      category: item.category,
      price: item.price,
      costPrice: item.costPrice,
      isAvailable: item.isAvailable,
      preparationTime: item.preparationTime,
      isPopular: item.isPopular,
      isNew: item.isNew,
      allergens: item.allergens ? JSON.parse(item.allergens) : [],
      image: item.image,
      orderCount: item.orderCount,
    }));

    return NextResponse.json({
      success: true,
      data: menuItems,
      isDemo: false,
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    // Fallback to demo data on error
    return NextResponse.json({
      success: true,
      data: DEMO_MENU_ITEMS,
      isDemo: true,
    });
  }
}

// POST - Create new menu item
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, category, price, costPrice, preparationTime, isAvailable, allergens, image, isPopular, isNew } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Le nom et le prix sont requis' },
        { status: 400 }
      );
    }

    // Check if database is available
    if (!isDatabaseAvailable() || !db) {
      // Return simulated success for demo mode
      const newItem = {
        id: Date.now().toString(),
        name,
        description: description || '',
        category: category || 'Plats',
        price: parseFloat(price) || 0,
        costPrice: parseFloat(costPrice) || 0,
        isAvailable: isAvailable !== false,
        preparationTime: parseInt(preparationTime) || 15,
        isPopular: isPopular || false,
        isNew: isNew || false,
        allergens: allergens || [],
        image: image || null,
        orderCount: 0,
      };
      return NextResponse.json({
        success: true,
        data: newItem,
        message: 'Article créé (mode démo)',
        isDemo: true,
      });
    }

    // Create in database
    const newItem = await db.simpleMenuItem.create({
      data: {
        name,
        description: description || '',
        category: category || 'Plats',
        price: parseFloat(price) || 0,
        costPrice: parseFloat(costPrice) || 0,
        isAvailable: isAvailable !== false,
        preparationTime: parseInt(preparationTime) || 15,
        isPopular: isPopular || false,
        isNew: isNew || false,
        allergens: allergens && allergens.length > 0 ? JSON.stringify(allergens) : null,
        image: image || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newItem.id,
        name: newItem.name,
        description: newItem.description,
        category: newItem.category,
        price: newItem.price,
        costPrice: newItem.costPrice,
        isAvailable: newItem.isAvailable,
        preparationTime: newItem.preparationTime,
        isPopular: newItem.isPopular,
        isNew: newItem.isNew,
        allergens: newItem.allergens ? JSON.parse(newItem.allergens) : [],
        image: newItem.image,
        orderCount: newItem.orderCount,
      },
      message: 'Article créé avec succès',
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création' },
      { status: 500 }
    );
  }
}

// PATCH - Update menu item
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID est requis' },
        { status: 400 }
      );
    }

    // Check if database is available
    if (!isDatabaseAvailable() || !db) {
      // Return simulated success for demo mode
      return NextResponse.json({
        success: true,
        data: { id, ...updateData },
        message: 'Article mis à jour (mode démo)',
        isDemo: true,
      });
    }

    // Prepare update data
    const prismaUpdateData: any = {};
    
    if (updateData.name !== undefined) prismaUpdateData.name = updateData.name;
    if (updateData.description !== undefined) prismaUpdateData.description = updateData.description;
    if (updateData.category !== undefined) prismaUpdateData.category = updateData.category;
    if (updateData.price !== undefined) prismaUpdateData.price = parseFloat(updateData.price);
    if (updateData.costPrice !== undefined) prismaUpdateData.costPrice = parseFloat(updateData.costPrice);
    if (updateData.isAvailable !== undefined) prismaUpdateData.isAvailable = updateData.isAvailable;
    if (updateData.isPopular !== undefined) prismaUpdateData.isPopular = updateData.isPopular;
    if (updateData.isNew !== undefined) prismaUpdateData.isNew = updateData.isNew;
    if (updateData.preparationTime !== undefined) prismaUpdateData.preparationTime = parseInt(updateData.preparationTime);
    if (updateData.image !== undefined) prismaUpdateData.image = updateData.image;
    if (updateData.allergens !== undefined) {
      prismaUpdateData.allergens = updateData.allergens && updateData.allergens.length > 0 
        ? JSON.stringify(updateData.allergens) 
        : null;
    }

    // Update in database
    const updatedItem = await db.simpleMenuItem.update({
      where: { id },
      data: prismaUpdateData,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedItem.id,
        name: updatedItem.name,
        description: updatedItem.description,
        category: updatedItem.category,
        price: updatedItem.price,
        costPrice: updatedItem.costPrice,
        isAvailable: updatedItem.isAvailable,
        preparationTime: updatedItem.preparationTime,
        isPopular: updatedItem.isPopular,
        isNew: updatedItem.isNew,
        allergens: updatedItem.allergens ? JSON.parse(updatedItem.allergens) : [],
        image: updatedItem.image,
        orderCount: updatedItem.orderCount,
      },
      message: 'Article mis à jour',
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

// DELETE - Delete menu item
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID est requis' },
        { status: 400 }
      );
    }

    // Check if database is available
    if (!isDatabaseAvailable() || !db) {
      // Return simulated success for demo mode
      return NextResponse.json({
        success: true,
        message: 'Article supprimé (mode démo)',
        isDemo: true,
      });
    }

    // Delete from database
    await db.simpleMenuItem.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Article supprimé',
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
