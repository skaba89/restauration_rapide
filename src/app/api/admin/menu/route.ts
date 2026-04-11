// Menu Items Management API - Uses Prisma Database (SimpleMenuItem)
// Falls back to demo data when database is unavailable or table doesn't exist
// Demo modifications are persisted in shared store so public page reflects changes
import { NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';
import { getDemoMenuItems, isDemoItemId, getDemoMenuItem, updateDemoMenuItem, addDemoMenuItem, removeDemoMenuItem } from '@/lib/demo-menu-store';

// Helper: merge update data into a demo item with proper type conversion
function mergeDemoUpdate(demoItem: ReturnType<typeof getDemoMenuItem>, updateData: Record<string, unknown>) {
  if (!demoItem) return null;
  return updateDemoMenuItem(demoItem.id, {
    name: updateData.name !== undefined ? String(updateData.name) : demoItem.name,
    description: updateData.description !== undefined ? String(updateData.description) : demoItem.description,
    category: updateData.category !== undefined ? String(updateData.category) : demoItem.category,
    price: updateData.price !== undefined ? parseFloat(String(updateData.price)) : demoItem.price,
    costPrice: updateData.costPrice !== undefined ? parseFloat(String(updateData.costPrice)) : demoItem.costPrice,
    isAvailable: updateData.isAvailable !== undefined ? Boolean(updateData.isAvailable) : demoItem.isAvailable,
    preparationTime: updateData.preparationTime !== undefined ? parseInt(String(updateData.preparationTime)) : demoItem.preparationTime,
    isPopular: updateData.isPopular !== undefined ? Boolean(updateData.isPopular) : demoItem.isPopular,
    isNew: updateData.isNew !== undefined ? Boolean(updateData.isNew) : demoItem.isNew,
    allergens: updateData.allergens !== undefined ? (updateData.allergens as string[]) : demoItem.allergens,
    image: updateData.image !== undefined ? (updateData.image as string | null) : demoItem.image,
  });
}

// GET - Fetch all menu items for admin
export async function GET() {
  try {
    // Check if database is available
    if (!isDatabaseAvailable() || !db) {
      return NextResponse.json({
        success: true,
        data: getDemoMenuItems(),
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
          data: getDemoMenuItems(),
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
        data: getDemoMenuItems(),
        source: 'demo',
        message: 'Mode démonstration - Erreur de base de données',
      });
    }
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json({
      success: true,
      data: getDemoMenuItems(),
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
      // Demo mode: create item in shared store
      const newItem = addDemoMenuItem({
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
      });
      return NextResponse.json({
        success: true,
        data: newItem,
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
      // Fallback to demo mode - create in shared store
      const newItem = addDemoMenuItem({
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
      });
      return NextResponse.json({
        success: true,
        data: newItem,
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

    // If the item ID is a demo item, update it in the shared store (persists across requests)
    if (isDemoItemId(id)) {
      const demoItem = getDemoMenuItem(id);
      if (demoItem) {
        const updatedDemoItem = mergeDemoUpdate(demoItem, updateData);
        if (updatedDemoItem) {
          return NextResponse.json({
            success: true,
            data: updatedDemoItem,
            message: 'Article mis à jour (mode démo)',
            demo: true,
          });
        }
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
      const demoItem = getDemoMenuItem(id);
      if (demoItem) {
        const updatedDemoItem = mergeDemoUpdate(demoItem, updateData);
        if (updatedDemoItem) {
          return NextResponse.json({
            success: true,
            data: updatedDemoItem,
            message: 'Article mis à jour (mode démo - fallback)',
            demo: true,
          });
        }
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

    // If the item ID is a demo item, remove it from the shared store
    if (isDemoItemId(id)) {
      const removed = removeDemoMenuItem(id);
      if (removed) {
        return NextResponse.json({
          success: true,
          message: 'Article supprimé (mode démo)',
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
      if (isDemoItemId(id)) {
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
