// Menu Items Management API - Uses Prisma Database (SimpleMenuItem)
// Direct DB access with automatic retry on cold starts
import { NextResponse, NextRequest } from 'next/server';
import { db, ensureDbConnection } from '@/lib/db';
import { ensureSimpleMenuItemTable } from '@/lib/db-setup';
import { withAdminAuth } from '@/lib/auth-middleware';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

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

// GET - Fetch all menu items
export async function GET() {
  try {
    if (!db) {
      return NextResponse.json({ success: false, error: 'Base de données non configurée' }, { status: 503, headers: NO_CACHE_HEADERS });
    }

    await ensureDbConnection(15000);
    await ensureSimpleMenuItemTable();

    const items = await db.simpleMenuItem.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json({
      success: true,
      data: items.map(formatDbItem),
      source: 'database',
      totalAvailable: items.filter(i => i.isAvailable).length,
      totalItems: items.length,
      timestamp: new Date().toISOString(),
    }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('[MENU GET] Error:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors du chargement du menu: ' + (error instanceof Error ? error.message : 'Erreur inconnue') }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

// POST - Create new menu item
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { name, description, category, price, costPrice, preparationTime, isAvailable, allergens, image, isPopular, isNew } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ success: false, error: 'Le nom et le prix sont requis' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ success: false, error: 'Base de données non configurée' }, { status: 503 });
    }

    await ensureDbConnection(15000);

    // Try to create directly - table exists from prisma db push
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
  } catch (error) {
    console.error('[MENU POST] Error:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors de la création: ' + (error instanceof Error ? error.message : 'Erreur inconnue') }, { status: 500 });
  }
});

// PATCH - Update menu item
export const PATCH = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID est requis' }, { status: 400 });
    }

    const prismaUpdateData = formatUpdateData(updateData);
    const updatedItem = await db.simpleMenuItem.update({ where: { id }, data: prismaUpdateData });
    return NextResponse.json({ success: true, data: formatDbItem(updatedItem), message: 'Article mis à jour' });
  } catch (error) {
    console.error('[MENU PATCH] Error:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors de la mise à jour: ' + (error instanceof Error ? error.message : 'Erreur inconnue') }, { status: 500 });
  }
});

// DELETE - Delete menu item
export const DELETE = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID est requis' }, { status: 400 });
    }

    await db.simpleMenuItem.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Article supprimé' });
  } catch (error) {
    console.error('[MENU DELETE] Error:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors de la suppression: ' + (error instanceof Error ? error.message : 'Erreur inconnue') }, { status: 500 });
  }
});
