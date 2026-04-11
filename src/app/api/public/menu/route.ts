// Public Menu API - Uses the same database as admin API (SimpleMenuItem)
import { NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';

// GET - Fetch all menu items (public)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const availableOnly = searchParams.get('availableOnly') === 'true';

    // Check if database is available
    if (!isDatabaseAvailable() || !db) {
      return NextResponse.json({
        success: false,
        error: 'Base de données non disponible',
        data: [],
      }, { status: 503 });
    }

    // Build filter for database query
    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (availableOnly) {
      where.isAvailable = true;
    }

    // Fetch from database (same source as admin)
    const items = await db.simpleMenuItem.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    // Transform to match expected format (public view - less fields)
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
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error fetching public menu:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du chargement du menu',
      data: [],
    }, { status: 500 });
  }
}
