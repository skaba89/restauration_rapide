// Public Menu API - Uses the shared demo menu store for consistency with admin
// Falls back to demo data when database is unavailable or table doesn't exist
import { NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';
import { getDemoMenuItems } from '@/lib/demo-menu-store';

// Helper: apply filters to items (works for both DB and demo items)
function filterItems(items: Array<{ category: string; isAvailable: boolean }>, category?: string | null, availableOnly?: boolean) {
  return items.filter(item => {
    if (category && item.category !== category) return false;
    if (availableOnly && !item.isAvailable) return false;
    return true;
  });
}

// GET - Fetch all menu items (public) - reads from shared store for demo consistency
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const availableOnly = searchParams.get('availableOnly') === 'true';

    // If database is not available, return demo data from shared store
    if (!isDatabaseAvailable() || !db) {
      const allItems = getDemoMenuItems();
      const filtered = filterItems(allItems, category, availableOnly);
      const menuItems = filtered.map(({ id, name, description, category: cat, price, isAvailable, preparationTime, isPopular, image }) => ({
        id, name, description, category: cat, price, isAvailable, preparationTime, isPopular, image,
      }));
      return NextResponse.json({
        success: true,
        data: menuItems,
        source: 'demo',
        timestamp: new Date().toISOString(),
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
    }

    // Try to fetch from database
    try {
      const where: Record<string, unknown> = {};
      
      if (category) {
        where.category = category;
      }
      
      if (availableOnly) {
        where.isAvailable = true;
      }

      const items = await db.simpleMenuItem.findMany({
        where,
        orderBy: [
          { category: 'asc' },
          { name: 'asc' },
        ],
      });

      // If database table exists but is empty, fallback to demo data from shared store
      if (items.length === 0) {
        const allItems = getDemoMenuItems();
        const filtered = filterItems(allItems, category, availableOnly);
        const menuItems = filtered.map(({ id, name, description, category: cat, price, isAvailable, preparationTime, isPopular, image }) => ({
          id, name, description, category: cat, price, isAvailable, preparationTime, isPopular, image,
        }));
        return NextResponse.json({
          success: true,
          data: menuItems,
          source: 'demo',
          timestamp: new Date().toISOString(),
        }, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache',
          },
        });
      }

      const menuItems = items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        category: item.category,
        price: item.price,
        isAvailable: item.isAvailable,
        preparationTime: item.preparationTime,
        isPopular: item.isPopular,
        image: item.image,
      }));

      return NextResponse.json({
        success: true,
        data: menuItems,
        source: 'database',
        timestamp: new Date().toISOString(),
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
    } catch (dbError) {
      // Database query failed (table doesn't exist, etc.) - fallback to shared store
      console.error('Database query failed, using demo data from shared store:', dbError);
      const allItems = getDemoMenuItems();
      const filtered = filterItems(allItems, category, availableOnly);
      const menuItems = filtered.map(({ id, name, description, category: cat, price, isAvailable, preparationTime, isPopular, image }) => ({
        id, name, description, category: cat, price, isAvailable, preparationTime, isPopular, image,
      }));
      return NextResponse.json({
        success: true,
        data: menuItems,
        source: 'demo',
        timestamp: new Date().toISOString(),
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
    }
  } catch (error) {
    console.error('Error fetching public menu:', error);
    const allItems = getDemoMenuItems();
    return NextResponse.json({
      success: true,
      data: allItems.map(({ id, name, description, category, price, isAvailable, preparationTime, isPopular, image }) => ({
        id, name, description, category, price, isAvailable, preparationTime, isPopular, image,
      })),
      source: 'demo',
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
  }
}
