// Menu Items Management API
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Demo menu data - shared with public API
let DEMO_MENU_ITEMS = [
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
export async function GET(request: Request) {
  try {
    return NextResponse.json({
      success: true,
      data: DEMO_MENU_ITEMS,
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json({
      success: true,
      data: DEMO_MENU_ITEMS,
    });
  }
}

// POST - Create new menu item
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, category, price, costPrice, preparationTime, isAvailable, allergens } = body;

    if (!name || !price) {
      return NextResponse.json(
        { success: false, error: 'Le nom et le prix sont requis' },
        { status: 400 }
      );
    }

    const newItem = {
      id: Date.now().toString(),
      name,
      description: description || '',
      category: category || 'Plats',
      price: parseFloat(price) || 0,
      costPrice: parseFloat(costPrice) || 0,
      isAvailable: isAvailable !== false,
      preparationTime: parseInt(preparationTime) || 15,
      isPopular: false,
      allergens: allergens || [],
      image: null,
    };

    DEMO_MENU_ITEMS.push(newItem);

    return NextResponse.json({
      success: true,
      data: newItem,
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

    const itemIndex = DEMO_MENU_ITEMS.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    DEMO_MENU_ITEMS[itemIndex] = {
      ...DEMO_MENU_ITEMS[itemIndex],
      ...updateData,
      price: updateData.price !== undefined ? parseFloat(updateData.price) : DEMO_MENU_ITEMS[itemIndex].price,
      costPrice: updateData.costPrice !== undefined ? parseFloat(updateData.costPrice) : DEMO_MENU_ITEMS[itemIndex].costPrice,
      preparationTime: updateData.preparationTime !== undefined ? parseInt(updateData.preparationTime) : DEMO_MENU_ITEMS[itemIndex].preparationTime,
    };

    return NextResponse.json({
      success: true,
      data: DEMO_MENU_ITEMS[itemIndex],
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

    DEMO_MENU_ITEMS = DEMO_MENU_ITEMS.filter(item => item.id !== id);

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

// Export for sharing with public API
export { DEMO_MENU_ITEMS };
