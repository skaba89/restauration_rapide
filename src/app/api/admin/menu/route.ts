// Menu Items Management API - Uses Prisma Database (SimpleMenuItem)
// Falls back to demo data when database is unavailable or table doesn't exist
import { NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';

// Default menu items for demo mode
const DEFAULT_MENU_ITEMS = [  
  // PLATS IVOIRIENS
  { id: '1', name: 'Attieké Poisson Grillé', description: 'Semoule de manioc avec poisson grillé, sauce tomate et légumes frais', category: 'Plats Ivoiriens', price: 45000, costPrice: 25000, isAvailable: true, preparationTime: 20, isPopular: true, isNew: false, allergens: [], image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80', orderCount: 150 },
  { id: '2', name: 'Alloco Sauce Graine', description: 'Bananes plantains frites avec sauce graine de palme', category: 'Plats Ivoiriens', price: 25000, costPrice: 12000, isAvailable: true, preparationTime: 15, isPopular: true, isNew: false, allergens: [], image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80', orderCount: 120 },
  { id: '3', name: 'Garba', description: 'Attieké avec poisson frit, oignons et piment', category: 'Plats Ivoiriens', price: 30000, costPrice: 15000, isAvailable: true, preparationTime: 15, isPopular: true, isNew: false, allergens: ['fish'], image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80', orderCount: 200 },
  
  // PLATS SÉNÉGALAIS
  { id: '4', name: 'Thiéboudienne', description: 'Riz au poisson et légumes, plat national sénégalais', category: 'Plats Sénégalais', price: 45000, costPrice: 25000, isAvailable: true, preparationTime: 45, isPopular: true, isNew: false, allergens: ['fish'], image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80', orderCount: 180 },
  { id: '5', name: 'Yassa Poulet', description: 'Poulet mariné au citron et oignons caramélisés', category: 'Plats Sénégalais', price: 40000, costPrice: 22000, isAvailable: true, preparationTime: 30, isPopular: true, isNew: false, allergens: [], image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80', orderCount: 160 },
  { id: '6', name: 'Mafé', description: 'Ragoût de viande à la sauce d\'arachide crémeuse', category: 'Plats Sénégalais', price: 40000, costPrice: 20000, isAvailable: true, preparationTime: 35, isPopular: true, isNew: false, allergens: ['peanuts'], image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80', orderCount: 140 },
  
  // PLATS GUINÉENS
  { id: '7', name: 'Poulet Yassa Guinéen', description: 'Poulet mariné au citron style guinéen', category: 'Plats Guinéens', price: 45000, costPrice: 25000, isAvailable: true, preparationTime: 35, isPopular: true, isNew: false, allergens: [], image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80', orderCount: 100 },
  { id: '8', name: 'Konkoé', description: 'Pâte de manioc avec sauce aux arachides', category: 'Plats Guinéens', price: 30000, costPrice: 15000, isAvailable: true, preparationTime: 30, isPopular: true, isNew: false, allergens: ['peanuts'], image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80', orderCount: 80 },
  
  // GRILLADES
  { id: '9', name: 'Mix Grill', description: 'Assortiment de grillades (poulet, bœuf, agneau)', category: 'Grillades', price: 65000, costPrice: 35000, isAvailable: true, preparationTime: 30, isPopular: true, isNew: false, allergens: [], image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80', orderCount: 190 },
  { id: '10', name: 'Poulet Braisé', description: 'Demi-poulet grillé aux épices africaines', category: 'Grillades', price: 35000, costPrice: 18000, isAvailable: true, preparationTime: 30, isPopular: true, isNew: false, allergens: [], image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80', orderCount: 220 },
  { id: '11', name: 'Brochettes de Bœuf', description: '5 brochettes de bœuf marinées aux épices', category: 'Grillades', price: 30000, costPrice: 15000, isAvailable: true, preparationTime: 20, isPopular: false, isNew: false, allergens: [], image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80', orderCount: 130 },
  
  // FAST FOOD
  { id: '12', name: 'Burger KFM', description: 'Burger maison avec viande fraîche et sauce spéciale', category: 'Fast Food', price: 25000, costPrice: 12000, isAvailable: true, preparationTime: 15, isPopular: true, isNew: false, allergens: ['gluten'], image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80', orderCount: 250 },
  { id: '13', name: 'Chawarma Poulet', description: 'Chawarma au poulet grillé avec sauce blanche', category: 'Fast Food', price: 20000, costPrice: 10000, isAvailable: true, preparationTime: 10, isPopular: true, isNew: false, allergens: ['gluten'], image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&q=80', orderCount: 280 },
  { id: '14', name: 'Chawarma Viande', description: 'Chawarma à la viande épicée', category: 'Fast Food', price: 22000, costPrice: 11000, isAvailable: true, preparationTime: 10, isPopular: false, isNew: false, allergens: ['gluten'], image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800&q=80', orderCount: 150 },
  
  // BOISSONS
  { id: '15', name: 'Jus de Bissap', description: 'Jus naturel de fleur d\'hibiscus', category: 'Boissons', price: 4000, costPrice: 1500, isAvailable: true, preparationTime: 3, isPopular: true, isNew: false, allergens: [], image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80', orderCount: 300 },
  { id: '16', name: 'Jus de Gingembre', description: 'Jus de gingembre frais et épicé', category: 'Boissons', price: 4000, costPrice: 1500, isAvailable: true, preparationTime: 3, isPopular: true, isNew: false, allergens: [], image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80', orderCount: 250 },
  { id: '17', name: 'Jus de Baobab', description: 'Jus de fruit de baobab', category: 'Boissons', price: 5000, costPrice: 2000, isAvailable: true, preparationTime: 3, isPopular: false, isNew: false, allergens: [], image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&q=80', orderCount: 120 },
  { id: '18', name: 'Ataya', description: 'Thé à la menthe guinéen', category: 'Boissons', price: 3000, costPrice: 1000, isAvailable: true, preparationTime: 10, isPopular: false, isNew: false, allergens: [], image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80', orderCount: 180 },
];

// Helper: check if an ID is a demo item ID
function isDemoId(id: string): boolean {
  return DEFAULT_MENU_ITEMS.some(item => item.id === id);
}

// Helper: get a demo item by ID
function getDemoItem(id: string) {
  return DEFAULT_MENU_ITEMS.find(item => item.id === id) || null;
}

// Helper: merge update data into a demo item with proper type conversion
function mergeDemoUpdate(demoItem: typeof DEFAULT_MENU_ITEMS[0], updateData: Record<string, unknown>) {
  return {
    ...demoItem,
    ...updateData,
    price: updateData.price !== undefined ? parseFloat(String(updateData.price)) : demoItem.price,
    costPrice: updateData.costPrice !== undefined ? parseFloat(String(updateData.costPrice)) : demoItem.costPrice,
    preparationTime: updateData.preparationTime !== undefined ? parseInt(String(updateData.preparationTime)) : demoItem.preparationTime,
  };
}

// GET - Fetch all menu items for admin
export async function GET() {
  try {
    // Check if database is available
    if (!isDatabaseAvailable() || !db) {
      return NextResponse.json({
        success: true,
        data: DEFAULT_MENU_ITEMS,
        source: 'demo',
        message: 'Mode démonstration - Base de données non disponible',
      });
    }

    try {
      const items = await db.simpleMenuItem.findMany({
        orderBy: [
          { category: 'asc' },
          { name: 'asc' },
        ],
      });

      if (items.length === 0) {
        return NextResponse.json({
          success: true,
          data: DEFAULT_MENU_ITEMS,
          source: 'demo',
          message: 'Mode démonstration - Aucun article en base',
        });
      }

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
        source: 'database',
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({
        success: true,
        data: DEFAULT_MENU_ITEMS,
        source: 'demo',
        message: 'Mode démonstration - Erreur de base de données',
      });
    }
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json({
      success: true,
      data: DEFAULT_MENU_ITEMS,
      source: 'demo',
      message: 'Mode démonstration',
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

    if (!isDatabaseAvailable() || !db) {
      // Demo mode: create a mock item with generated ID
      const mockItem = {
        id: `demo-${Date.now()}`,
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
        data: mockItem,
        message: 'Article créé (mode démo)',
        demo: true,
      });
    }

    try {
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
    } catch (dbError) {
      console.error('Database error creating menu item:', dbError);
      // Fallback to demo mode
      const mockItem = {
        id: `demo-${Date.now()}`,
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
        data: mockItem,
        message: 'Article créé (mode démo - erreur base de données)',
        demo: true,
      });
    }
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

    // If the item ID is a demo ID, handle it entirely in demo mode (no DB call)
    if (isDemoId(id)) {
      const demoItem = getDemoItem(id);
      if (demoItem) {
        const updatedDemoItem = mergeDemoUpdate(demoItem, updateData);
        return NextResponse.json({
          success: true,
          data: updatedDemoItem,
          message: 'Article mis à jour (mode démo)',
          demo: true,
        });
      }
    }

    // For non-demo IDs, try the database
    if (!isDatabaseAvailable() || !db) {
      return NextResponse.json({
        success: false,
        error: 'Base de données non disponible',
        demo: true,
      }, { status: 503 });
    }

    // Prepare update data
    const prismaUpdateData: Record<string, unknown> = {};
    
    if (updateData.name !== undefined) prismaUpdateData.name = updateData.name;
    if (updateData.description !== undefined) prismaUpdateData.description = updateData.description;
    if (updateData.category !== undefined) prismaUpdateData.category = updateData.category;
    if (updateData.price !== undefined) prismaUpdateData.price = parseFloat(String(updateData.price));
    if (updateData.costPrice !== undefined) prismaUpdateData.costPrice = parseFloat(String(updateData.costPrice));
    if (updateData.isAvailable !== undefined) prismaUpdateData.isAvailable = updateData.isAvailable;
    if (updateData.isPopular !== undefined) prismaUpdateData.isPopular = updateData.isPopular;
    if (updateData.isNew !== undefined) prismaUpdateData.isNew = updateData.isNew;
    if (updateData.preparationTime !== undefined) prismaUpdateData.preparationTime = parseInt(String(updateData.preparationTime));
    if (updateData.image !== undefined) prismaUpdateData.image = updateData.image;
    if (updateData.allergens !== undefined) {
      prismaUpdateData.allergens = updateData.allergens && (updateData.allergens as unknown[]).length > 0 
        ? JSON.stringify(updateData.allergens) 
        : null;
    }

    try {
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
    } catch (dbError: unknown) {
      const err = dbError as { code?: string; message?: string };
      console.error('Database error updating menu item:', err.message || err);
      
      // Fallback: if it's a demo-looking ID or any DB error, check demo data
      const demoItem = getDemoItem(id);
      if (demoItem) {
        const updatedDemoItem = mergeDemoUpdate(demoItem, updateData);
        return NextResponse.json({
          success: true,
          data: updatedDemoItem,
          message: 'Article mis à jour (mode démo - fallback)',
          demo: true,
        });
      }
      
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour en base de données' },
        { status: 500 }
      );
    }
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

    // If the item ID is a demo ID, handle it entirely in demo mode (no DB call)
    if (isDemoId(id)) {
      return NextResponse.json({
        success: true,
        message: 'Article supprimé (mode démo)',
        demo: true,
      });
    }

    // For non-demo IDs, try the database
    if (!isDatabaseAvailable() || !db) {
      return NextResponse.json({
        success: false,
        error: 'Base de données non disponible',
        demo: true,
      }, { status: 503 });
    }

    try {
      await db.simpleMenuItem.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: 'Article supprimé',
      });
    } catch (dbError: unknown) {
      const err = dbError as { code?: string; message?: string };
      console.error('Database error deleting menu item:', err.message || err);
      
      // Fallback: if it's a demo-looking ID, return success
      if (isDemoId(id)) {
        return NextResponse.json({
          success: true,
          message: 'Article supprimé (mode démo - fallback)',
          demo: true,
        });
      }
      
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression en base de données' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
