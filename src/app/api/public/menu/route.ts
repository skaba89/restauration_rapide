// Public Menu API - Uses the same database as admin API
import { NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';

// Demo menu data - fallback when database is not available
const DEMO_MENU_ITEMS = [
  {
    id: '1',
    name: 'Poulet Grillé',
    description: 'Poulet grillé mariné aux épices',
    category: 'Plats',
    price: 25000,
    isAvailable: true,
    preparationTime: 25,
    isPopular: true,
    image: null,
  },
  {
    id: '2',
    name: 'Poisson Braisé',
    description: 'Poisson frais braisé avec sauce',
    category: 'Plats',
    price: 30000,
    isAvailable: true,
    preparationTime: 20,
    isPopular: true,
    image: null,
  },
  {
    id: '3',
    name: 'Riz Sauce',
    description: 'Riz accompagné de sauce tomate',
    category: 'Plats',
    price: 15000,
    isAvailable: true,
    preparationTime: 15,
    isPopular: false,
    image: null,
  },
  {
    id: '4',
    name: 'Attieké Poisson',
    description: 'Attieké avec poisson grillé',
    category: 'Plats',
    price: 20000,
    isAvailable: false,
    preparationTime: 20,
    isPopular: true,
    image: null,
  },
  {
    id: '5',
    name: 'Riz Gras',
    description: 'Riz gras traditionnel',
    category: 'Plats',
    price: 18000,
    isAvailable: true,
    preparationTime: 30,
    isPopular: false,
    image: null,
  },
  {
    id: '6',
    name: 'Coca-Cola',
    description: 'Boisson gazeuse rafraîchissante',
    category: 'Boissons',
    price: 2000,
    isAvailable: true,
    preparationTime: 1,
    isPopular: false,
    image: null,
  },
  {
    id: '7',
    name: 'Jus de Bissap',
    description: 'Jus naturel de bissap fait maison',
    category: 'Boissons',
    price: 3000,
    isAvailable: true,
    preparationTime: 2,
    isPopular: true,
    image: null,
  },
  {
    id: '8',
    name: 'Frites',
    description: 'Pommes de terre frites croustillantes',
    category: 'Accompagnements',
    price: 5000,
    isAvailable: true,
    preparationTime: 10,
    isPopular: false,
    image: null,
  },
  {
    id: '9',
    name: 'Alloco',
    description: 'Bananes plantain frites',
    category: 'Accompagnements',
    price: 3000,
    isAvailable: true,
    preparationTime: 10,
    isPopular: true,
    image: null,
  },
  {
    id: '10',
    name: 'Salade Mixte',
    description: 'Salade fraîche avec légumes de saison',
    category: 'Entrées',
    price: 8000,
    isAvailable: true,
    preparationTime: 8,
    isPopular: false,
    image: null,
  },
];

// GET - Fetch all menu items (public)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const availableOnly = searchParams.get('availableOnly') === 'true';

    // Check if database is available
    if (!isDatabaseAvailable() || !db) {
      console.log('Database not available, returning demo data for public menu');
      let filteredItems = [...DEMO_MENU_ITEMS];
      
      if (category) {
        filteredItems = filteredItems.filter(item => item.category === category);
      }
      
      if (availableOnly) {
        filteredItems = filteredItems.filter(item => item.isAvailable);
      }

      return NextResponse.json({
        success: true,
        data: filteredItems,
        isDemo: true,
      });
    }

    // Build filter for database query
    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (availableOnly) {
      where.isAvailable = true;
    }

    // Fetch from database
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
      isDemo: false,
    });
  } catch (error) {
    console.error('Error fetching public menu:', error);
    // Fallback to demo data on error
    return NextResponse.json({
      success: true,
      data: DEMO_MENU_ITEMS,
      isDemo: true,
    });
  }
}
