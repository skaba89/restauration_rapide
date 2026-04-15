// Public Menu API - Uses the database (auto-creates SimpleMenuItem table if missing)
// Falls back to demo data when database is unavailable
import { NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';
import { ensureSimpleMenuItemTable } from '@/lib/db-setup';
import { getDemoMenuItems } from '@/lib/demo-menu-store';

function filterItems(items: Array<{ category: string; isAvailable: boolean }>, category?: string | null, availableOnly?: boolean) {
  return items.filter(item => {
    if (category && item.category !== category) return false;
    if (availableOnly && !item.isAvailable) return false;
    return true;
  });
}

function formatPublicItem(item: any) {
  return {
    id: item.id,
    name: item.name,
    description: item.description || '',
    category: item.category,
    price: item.price,
    isAvailable: item.isAvailable,
    preparationTime: item.preparationTime,
    isPopular: item.isPopular,
    image: item.image,
  };
}

function makeResponse(data: any, source: string) {
  return NextResponse.json({
    success: true,
    data,
    source,
    timestamp: new Date().toISOString(),
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    },
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const availableOnly = searchParams.get('availableOnly') === 'true';
    const restaurantSlug = searchParams.get('restaurantSlug');
    const restaurantId = searchParams.get('restaurantId');

    // Si restaurantSlug ou restaurantId est fourni, récupérer le menu depuis l'API principale
    if (restaurantSlug || restaurantId) {
      try {
        const internalUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/menu`);
        if (restaurantId) internalUrl.searchParams.set('restaurantId', restaurantId);
        if (restaurantSlug) internalUrl.searchParams.set('slug', restaurantSlug);
        
        const res = await fetch(internalUrl.toString());
        if (res.ok) {
          const data = await res.json();
          // Transformer les données pour correspondre au format attendu par le public
          if (Array.isArray(data) && data.length > 0) {
            const menu = data[0];
            const formattedData = [{
              id: menu.id,
              name: menu.name,
              categories: menu.categories?.map((cat: any) => ({
                id: cat.id,
                name: cat.name,
                items: cat.items?.map((item: any) => ({
                  id: item.id,
                  name: item.name,
                  description: item.description || '',
                  price: item.price,
                  isAvailable: item.isAvailable !== false,
                  preparationTime: item.prepTime,
                  isPopular: item.isPopular,
                  image: item.image,
                })) || []
              })) || []
            }];
            return makeResponse(formattedData, 'database-full');
          }
        }
      } catch (err) {
        console.error('Failed to fetch full menu, using simple menu:', err);
      }
    }

    if (!isDatabaseAvailable() || !db) {
      const allItems = getDemoMenuItems();
      const filtered = filterItems(allItems, category, availableOnly);
      return makeResponse(filtered.map(formatPublicItem), 'demo');
    }

    try {
      const tableReady = await ensureSimpleMenuItemTable();
      if (!tableReady) {
        const allItems = getDemoMenuItems();
        const filtered = filterItems(allItems, category, availableOnly);
        return makeResponse(filtered.map(formatPublicItem), 'demo');
      }

      const where: Record<string, unknown> = {};
      if (category) where.category = category;
      if (availableOnly) where.isAvailable = true;

      const items = await db.simpleMenuItem.findMany({
        where,
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      });

      if (items.length === 0) {
        const allItems = getDemoMenuItems();
        const filtered = filterItems(allItems, category, availableOnly);
        return makeResponse(filtered.map(formatPublicItem), 'demo');
      }

      return makeResponse(items.map(formatPublicItem), 'database');
    } catch (dbError) {
      console.error('Database query failed, using demo data:', dbError);
      const allItems = getDemoMenuItems();
      const filtered = filterItems(allItems, category, availableOnly);
      return makeResponse(filtered.map(formatPublicItem), 'demo');
    }
  } catch (error) {
    console.error('Error fetching public menu:', error);
    const allItems = getDemoMenuItems();
    return makeResponse(allItems.map(formatPublicItem), 'demo');
  }
}
