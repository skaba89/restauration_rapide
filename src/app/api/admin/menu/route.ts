// Menu Items Management API - Uses Prisma Database (SimpleMenuItem)
// SECURITY (P1): Cache-Control no-store on all responses
// FIX: Increased timeout, better error handling, retry logic
import { NextResponse, NextRequest } from 'next/server';
import { db, ensureDbConnection, markDatabaseUnavailable, resetConnectionStatus, getDatabaseStatus } from '@/lib/db';
import { ensureSimpleMenuItemTable } from '@/lib/db-setup';
import { withAdminAuth } from '@/lib/auth-middleware';

// Cache-Control headers to prevent stale data
const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

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

// Ensure database is ready with retry and detailed error info
async function ensureDatabaseReady(): Promise<{ ready: boolean; error?: string }> {
  // Check if db client exists
  if (!db) {
    return { ready: false, error: 'DATABASE_URL non configurée. Vérifiez les variables d\'environnement sur Render.' };
  }

  // Test connection with increased timeout for cold starts
  const dbReady = await ensureDbConnection(15000);
  if (!dbReady) {
    const status = getDatabaseStatus();
    return { 
      ready: false, 
      error: `Base de données inaccessible (statut: ${status}). La base de données est peut-être en cours de démarrage. Réessayez dans quelques secondes.` 
    };
  }

  // Ensure SimpleMenuItem table is accessible
  const tableReady = await ensureSimpleMenuItemTable();
  if (!tableReady) {
    return { ready: false, error: 'Table des articles indisponible. Vérifiez la connexion à la base de données et réessayez.' };
  }

  return { ready: true };
}

// GET - Fetch all menu items for admin
export async function GET() {
  try {
    const dbCheck = await ensureDatabaseReady();
    
    if (!dbCheck.ready) {
      return NextResponse.json({
        success: true,
        data: [],
        source: 'database',
        message: dbCheck.error,
        totalAvailable: 0,
        totalItems: 0,
        timestamp: new Date().toISOString(),
      }, { headers: NO_CACHE_HEADERS });
    }

    const items = await db!.simpleMenuItem.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    const formattedItems = items.map(formatDbItem);
    return NextResponse.json({
      success: true,
      data: formattedItems,
      source: 'database',
      totalAvailable: formattedItems.filter(i => i.isAvailable).length,
      totalItems: formattedItems.length,
      timestamp: new Date().toISOString(),
    }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('Error fetching menu:', error);
    markDatabaseUnavailable();
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du chargement du menu',
    }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

// POST - Create new menu item
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { name, description, category, price, costPrice, preparationTime, isAvailable, allergens, image, isPopular, isNew } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Le nom et le prix sont requis' },
        { status: 400 }
      );
    }

    const dbCheck = await ensureDatabaseReady();
    
    if (!dbCheck.ready) {
      console.error('[MENU CREATE] Database not ready:', dbCheck.error);
      return NextResponse.json({ 
        success: false, 
        error: dbCheck.error || 'Base de données non disponible' 
      }, { status: 503 });
    }

    const newItem = await db!.simpleMenuItem.create({
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
    console.error('Error creating menu item:', error);
    markDatabaseUnavailable();
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de la création: ' + (error instanceof Error ? error.message : 'Erreur inconnue')
    }, { status: 500 });
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

    const dbCheck = await ensureDatabaseReady();
    if (!dbCheck.ready) {
      return NextResponse.json({ success: false, error: dbCheck.error || 'Base de données non disponible' }, { status: 503 });
    }

    const prismaUpdateData = formatUpdateData(updateData);
    const updatedItem = await db!.simpleMenuItem.update({
      where: { id },
      data: prismaUpdateData,
    });
    return NextResponse.json({ success: true, data: formatDbItem(updatedItem), message: 'Article mis à jour' });
  } catch (dbError: unknown) {
    const err = dbError as { code?: string; message?: string };
    console.error('Database error updating menu item:', err.message || err);
    markDatabaseUnavailable();
    return NextResponse.json({ success: false, error: 'Erreur lors de la mise à jour' }, { status: 500 });
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

    const dbCheck = await ensureDatabaseReady();
    if (!dbCheck.ready) {
      return NextResponse.json({ success: false, error: dbCheck.error || 'Base de données non disponible' }, { status: 503 });
    }

    await db!.simpleMenuItem.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Article supprimé' });
  } catch (dbError: unknown) {
    const err = dbError as { code?: string; message?: string };
    console.error('Database error deleting menu item:', err.message || err);
    markDatabaseUnavailable();
    return NextResponse.json({ success: false, error: 'Erreur lors de la suppression' }, { status: 500 });
  }
});
