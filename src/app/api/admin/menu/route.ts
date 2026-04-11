// Menu Items Management API - Uses Prisma Database (SimpleMenuItem)
// Auto-creates the table if missing and seeds demo data
// All modifications persist in PostgreSQL on Render
import { NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';
import { ensureSimpleMenuItemTable } from '@/lib/db-setup';
import { getDemoMenuItems, isDemoItemId, getDemoMenuItem, updateDemoMenuItem, addDemoMenuItem, removeDemoMenuItem } from '@/lib/demo-menu-store';

// Helper: merge update data with proper type conversion
function formatUpdateData(updateData: Record<string, unknown>) {
  const formatted: Record<string, unknown> = {};
  if (updateData.name !== undefined) formatted.name = updateData.name;
  if (updateData.description !== undefined) formatted.description = updateData.description;
  if (updateData.category !== undefined) formatted.category = updateData.category;
  if (updateData.price !== undefined) formatted.price = parseFloat(String(updateData.price));
  if (updateData.costPrice !== undefined) formatted.costPrice = parseFloat(String(updateData.costPrice));
  if (updateData.isAvailable !== undefined) formatted.isAvailable = updateData.isAvailable;
  if (updateData.isPopular !== undefined) formatted.isPopular = updateData.isPopular;
  if (updateData.isNew !== undefined) formatted.isNew = updateData.isNew;
  if (updateData.preparationTime !== undefined) formatted.preparationTime = parseInt(String(updateData.preparationTime));
  if (updateData.image !== undefined) formatted.image = updateData.image;
  if (updateData.allergens !== undefined) {
    formatted.allergens = updateData.allergens && (updateData.allergens as unknown[]).length > 0 
      ? JSON.stringify(updateData.allergens) 
      : null;
  }
  return formatted;
}

function formatDbItem(item: any) {
  return {
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
  };
}

// GET - Fetch all menu items for admin
export async function GET() {
  try {
    if (!isDatabaseAvailable() || !db) {
      return NextResponse.json({
        success: true,
        data: getDemoMenuItems(),
        source: 'demo',
        message: 'Mode démonstration - Base de données non disponible',
      });
    }

    try {
      // Ensure the table exists before querying
      const tableReady = await ensureSimpleMenuItemTable();
      if (!tableReady) {
        return NextResponse.json({
          success: true,
          data: getDemoMenuItems(),
          source: 'demo',
          message: 'Mode démonstration - Table non disponible',
        });
      }

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

      return NextResponse.json({
        success: true,
        data: items.map(formatDbItem),
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
      const newItem = addDemoMenuItem({
        name, description: description || '', category: category || 'Plats',
        price: parseFloat(price) || 0, costPrice: parseFloat(costPrice) || 0,
        isAvailable: isAvailable !== false, preparationTime: parseInt(preparationTime) || 15,
        isPopular: isPopular || false, isNew: isNew || false,
        allergens: allergens || [], image: image || null, orderCount: 0,
      });
      return NextResponse.json({ success: true, data: newItem, message: 'Article créé (mode démo)', demo: true });
    }

    try {
      const tableReady = await ensureSimpleMenuItemTable();
      if (!tableReady) {
        const newItem = addDemoMenuItem({
          name, description: description || '', category: category || 'Plats',
          price: parseFloat(price) || 0, costPrice: parseFloat(costPrice) || 0,
          isAvailable: isAvailable !== false, preparationTime: parseInt(preparationTime) || 15,
          isPopular: isPopular || false, isNew: isNew || false,
          allergens: allergens || [], image: image || null, orderCount: 0,
        });
        return NextResponse.json({ success: true, data: newItem, message: 'Article créé (mode démo)', demo: true });
      }

      const newItem = await db.simpleMenuItem.create({
        data: {
          name, description: description || '', category: category || 'Plats',
          price: parseFloat(price) || 0, costPrice: parseFloat(costPrice) || 0,
          isAvailable: isAvailable !== false, preparationTime: parseInt(preparationTime) || 15,
          isPopular: isPopular || false, isNew: isNew || false,
          allergens: allergens && allergens.length > 0 ? JSON.stringify(allergens) : null,
          image: image || null,
        },
      });

      return NextResponse.json({ success: true, data: formatDbItem(newItem), message: 'Article créé avec succès' });
    } catch (dbError) {
      console.error('Database error creating menu item:', dbError);
      const newItem = addDemoMenuItem({
        name, description: description || '', category: category || 'Plats',
        price: parseFloat(price) || 0, costPrice: parseFloat(costPrice) || 0,
        isAvailable: isAvailable !== false, preparationTime: parseInt(preparationTime) || 15,
        isPopular: isPopular || false, isNew: isNew || false,
        allergens: allergens || [], image: image || null, orderCount: 0,
      });
      return NextResponse.json({ success: true, data: newItem, message: 'Article créé (mode démo)', demo: true });
    }
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors de la création' }, { status: 500 });
  }
}

// PATCH - Update menu item
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID est requis' }, { status: 400 });
    }

    // Try database first if available
    if (isDatabaseAvailable() && db) {
      try {
        const tableReady = await ensureSimpleMenuItemTable();
        if (tableReady) {
          const prismaUpdateData = formatUpdateData(updateData);
          const updatedItem = await db.simpleMenuItem.update({
            where: { id },
            data: prismaUpdateData,
          });
          return NextResponse.json({ success: true, data: formatDbItem(updatedItem), message: 'Article mis à jour' });
        }
      } catch (dbError: unknown) {
        const err = dbError as { code?: string; message?: string };
        console.error('Database error updating menu item:', err.message || err);
        // Fall through to demo update
      }
    }

    // Fallback: update in shared demo store
    if (isDemoItemId(id)) {
      const demoItem = getDemoMenuItem(id);
      if (demoItem) {
        const updated = updateDemoMenuItem(demoItem.id, {
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
        if (updated) {
          return NextResponse.json({ success: true, data: updated, message: 'Article mis à jour (mode démo)', demo: true });
        }
      }
    }

    return NextResponse.json({ success: false, error: 'Article non trouvé' }, { status: 404 });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

// DELETE - Delete menu item
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID est requis' }, { status: 400 });
    }

    // Try database first if available
    if (isDatabaseAvailable() && db) {
      try {
        const tableReady = await ensureSimpleMenuItemTable();
        if (tableReady) {
          await db.simpleMenuItem.delete({ where: { id } });
          return NextResponse.json({ success: true, message: 'Article supprimé' });
        }
      } catch (dbError: unknown) {
        const err = dbError as { code?: string; message?: string };
        console.error('Database error deleting menu item:', err.message || err);
      }
    }

    // Fallback: remove from demo store
    if (isDemoItemId(id)) {
      removeDemoMenuItem(id);
      return NextResponse.json({ success: true, message: 'Article supprimé (mode démo)', demo: true });
    }

    return NextResponse.json({ success: false, error: 'Article non trouvé' }, { status: 404 });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
