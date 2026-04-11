// Public Menu API - Uses the same database as admin API (SimpleMenuItem)
// Falls back to demo data when database table doesn't exist
import { NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';

// Default menu items (same as admin API for consistency)
const DEFAULT_MENU_ITEMS = [  
  { id: '1', name: 'Attieké Poisson Grillé', description: 'Semoule de manioc avec poisson grillé, sauce tomate et légumes frais', category: 'Plats Ivoiriens', price: 45000, isAvailable: true, preparationTime: 20, isPopular: true, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80' },
  { id: '2', name: 'Alloco Sauce Graine', description: 'Bananes plantains frites avec sauce graine de palme', category: 'Plats Ivoiriens', price: 25000, isAvailable: true, preparationTime: 15, isPopular: true, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80' },
  { id: '3', name: 'Garba', description: 'Attieké avec poisson frit, oignons et piment', category: 'Plats Ivoiriens', price: 30000, isAvailable: true, preparationTime: 15, isPopular: true, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80' },
  { id: '4', name: 'Thiéboudienne', description: 'Riz au poisson et légumes, plat national sénégalais', category: 'Plats Sénégalais', price: 45000, isAvailable: true, preparationTime: 45, isPopular: true, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80' },
  { id: '5', name: 'Yassa Poulet', description: 'Poulet mariné au citron et oignons caramélisés', category: 'Plats Sénégalais', price: 40000, isAvailable: true, preparationTime: 30, isPopular: true, image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80' },
  { id: '6', name: 'Mafé', description: 'Ragoût de viande à la sauce d\'arachide crémeuse', category: 'Plats Sénégalais', price: 40000, isAvailable: true, preparationTime: 35, isPopular: true, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80' },
  { id: '7', name: 'Poulet Yassa Guinéen', description: 'Poulet mariné au citron style guinéen', category: 'Plats Guinéens', price: 45000, isAvailable: true, preparationTime: 35, isPopular: true, image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80' },
  { id: '8', name: 'Konkoé', description: 'Pâte de manioc avec sauce aux arachides', category: 'Plats Guinéens', price: 30000, isAvailable: true, preparationTime: 30, isPopular: true, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80' },
  { id: '9', name: 'Mix Grill', description: 'Assortiment de grillades (poulet, bœuf, agneau)', category: 'Grillades', price: 65000, isAvailable: true, preparationTime: 30, isPopular: true, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80' },
  { id: '10', name: 'Poulet Braisé', description: 'Demi-poulet grillé aux épices africaines', category: 'Grillades', price: 35000, isAvailable: true, preparationTime: 30, isPopular: true, image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80' },
  { id: '11', name: 'Brochettes de Bœuf', description: '5 brochettes de bœuf marinées aux épices', category: 'Grillades', price: 30000, isAvailable: true, preparationTime: 20, isPopular: false, image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80' },
  { id: '12', name: 'Burger KFM', description: 'Burger maison avec viande fraîche et sauce spéciale', category: 'Fast Food', price: 25000, isAvailable: true, preparationTime: 15, isPopular: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80' },
  { id: '13', name: 'Chawarma Poulet', description: 'Chawarma au poulet grillé avec sauce blanche', category: 'Fast Food', price: 20000, isAvailable: true, preparationTime: 10, isPopular: true, image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&q=80' },
  { id: '14', name: 'Chawarma Viande', description: 'Chawarma à la viande épicée', category: 'Fast Food', price: 22000, isAvailable: true, preparationTime: 10, isPopular: false, image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800&q=80' },
  { id: '15', name: 'Jus de Bissap', description: 'Jus naturel de fleur d\'hibiscus', category: 'Boissons', price: 4000, isAvailable: true, preparationTime: 3, isPopular: true, image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80' },
  { id: '16', name: 'Jus de Gingembre', description: 'Jus de gingembre frais et épicé', category: 'Boissons', price: 4000, isAvailable: true, preparationTime: 3, isPopular: true, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80' },
  { id: '17', name: 'Jus de Baobab', description: 'Jus de fruit de baobab', category: 'Boissons', price: 5000, isAvailable: true, preparationTime: 3, isPopular: false, image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&q=80' },
  { id: '18', name: 'Ataya', description: 'Thé à la menthe guinéen', category: 'Boissons', price: 3000, isAvailable: true, preparationTime: 10, isPopular: false, image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80' },
];

// Helper: apply filters to items (works for both DB and demo items)
function filterItems(items: Array<{ category: string; isAvailable: boolean }>, category?: string | null, availableOnly?: boolean) {
  return items.filter(item => {
    if (category && item.category !== category) return false;
    if (availableOnly && !item.isAvailable) return false;
    return true;
  });
}

// GET - Fetch all menu items (public)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const availableOnly = searchParams.get('availableOnly') === 'true';

    // If database is not available, return demo data directly
    if (!isDatabaseAvailable() || !db) {
      const filtered = filterItems(DEFAULT_MENU_ITEMS, category, availableOnly);
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

      // If database table exists but is empty, fallback to demo data
      if (items.length === 0) {
        const filtered = filterItems(DEFAULT_MENU_ITEMS, category, availableOnly);
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
      // Database query failed (table doesn't exist, etc.) - fallback to demo data
      console.error('Database query failed, using demo data:', dbError);
      const filtered = filterItems(DEFAULT_MENU_ITEMS, category, availableOnly);
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
    return NextResponse.json({
      success: true,
      data: DEFAULT_MENU_ITEMS.map(({ id, name, description, category, price, isAvailable, preparationTime, isPopular, image }) => ({
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
