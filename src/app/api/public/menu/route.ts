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
