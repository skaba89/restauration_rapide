import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Demo branches data for fallback
const DEMO_BRANCHES = [
  {
    id: 'branch-1',
    name: 'Le Savana - Cocody',
    slug: 'le-savana-cocody',
    restaurantId: 'rest-1',
    address: 'Rue des Jardins, Cocody',
    city: 'Abidjan',
    district: 'Cocody',
    phone: '+225 07 00 00 00 01',
    email: 'cocody@savana.ci',
    isActive: true,
    isOpen: true,
    rating: 4.8,
    reviewCount: 256,
    totalCapacity: 80,
    latitude: 5.3494,
    longitude: -4.0266,
    createdAt: new Date('2023-06-15'),
    organization: { id: 'org-1', name: 'Le Groupe Savana', plan: 'BUSINESS' },
    _count: { orders: 1250, tables: 20 },
    stats: { monthlyOrders: 245, monthlyRevenue: 3850000, totalCustomers: 189 },
  },
  {
    id: 'branch-2',
    name: 'Le Savana - Plateau',
    slug: 'le-savana-plateau',
    restaurantId: 'rest-1',
    address: 'Avenue Chardy, Plateau',
    city: 'Abidjan',
    district: 'Plateau',
    phone: '+225 07 00 00 00 02',
    email: 'plateau@savana.ci',
    isActive: true,
    isOpen: true,
    rating: 4.6,
    reviewCount: 189,
    totalCapacity: 60,
    latitude: 5.3364,
    longitude: -4.0267,
    createdAt: new Date('2023-08-20'),
    organization: { id: 'org-1', name: 'Le Groupe Savana', plan: 'BUSINESS' },
    _count: { orders: 890, tables: 15 },
    stats: { monthlyOrders: 178, monthlyRevenue: 2950000, totalCustomers: 145 },
  },
  {
    id: 'branch-3',
    name: 'Saveurs d\'Afrique - Marcory',
    slug: 'saveurs-afrique-marcory',
    restaurantId: 'rest-2',
    address: 'Boulevard de Marseille, Marcory',
    city: 'Abidjan',
    district: 'Marcory',
    phone: '+225 07 00 00 00 03',
    email: 'marcory@saveurs.ci',
    isActive: true,
    isOpen: false,
    rating: 4.5,
    reviewCount: 145,
    totalCapacity: 50,
    latitude: 5.3067,
    longitude: -4.0178,
    createdAt: new Date('2023-10-05'),
    organization: { id: 'org-2', name: 'Saveurs d\'Afrique Group', plan: 'PRO' },
    _count: { orders: 456, tables: 12 },
    stats: { monthlyOrders: 89, monthlyRevenue: 1250000, totalCustomers: 78 },
  },
  {
    id: 'branch-4',
    name: 'Saveurs d\'Afrique - Treichville',
    slug: 'saveurs-afrique-treichville',
    restaurantId: 'rest-2',
    address: 'Rue 12, Treichville',
    city: 'Abidjan',
    district: 'Treichville',
    phone: '+225 07 00 00 00 04',
    email: 'treichville@saveurs.ci',
    isActive: true,
    isOpen: true,
    rating: 4.4,
    reviewCount: 98,
    totalCapacity: 40,
    latitude: 5.2833,
    longitude: -4.0167,
    createdAt: new Date('2023-11-12'),
    organization: { id: 'org-2', name: 'Saveurs d\'Afrique Group', plan: 'PRO' },
    _count: { orders: 345, tables: 10 },
    stats: { monthlyOrders: 67, monthlyRevenue: 890000, totalCustomers: 56 },
  },
  {
    id: 'branch-5',
    name: 'Le Petit Bistro - Riviera',
    slug: 'petit-bistro-riviera',
    restaurantId: 'rest-3',
    address: 'Riviera 3, Abidjan',
    city: 'Abidjan',
    district: 'Riviera',
    phone: '+225 07 00 00 00 05',
    email: 'riviera@bistro.ci',
    isActive: false,
    isOpen: false,
    rating: 4.2,
    reviewCount: 78,
    totalCapacity: 35,
    latitude: 5.3833,
    longitude: -4.0167,
    createdAt: new Date('2023-09-25'),
    organization: { id: 'org-3', name: 'Restaurant Le Petit Bistro', plan: 'STARTER' },
    _count: { orders: 234, tables: 8 },
    stats: { monthlyOrders: 45, monthlyRevenue: 670000, totalCustomers: 34 },
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const demo = searchParams.get('demo') === 'true';
    const includeStats = searchParams.get('includeStats') === 'true';
    const restaurantId = searchParams.get('restaurantId') || undefined;
    const organizationId = searchParams.get('organizationId') || undefined;
    const isActive = searchParams.get('isActive') 
      ? searchParams.get('isActive') === 'true' 
      : undefined;
    const city = searchParams.get('city') || undefined;

    // Return demo data if demo=true or if no real data exists
    if (demo) {
      let filteredBranches = [...DEMO_BRANCHES];
      
      if (restaurantId) {
        filteredBranches = filteredBranches.filter(b => b.restaurantId === restaurantId);
      }
      if (organizationId) {
        filteredBranches = filteredBranches.filter(b => b.organization?.id === organizationId);
      }
      if (isActive !== undefined) {
        filteredBranches = filteredBranches.filter(b => b.isActive === isActive);
      }
      if (city) {
        filteredBranches = filteredBranches.filter(b => 
          b.city.toLowerCase().includes(city.toLowerCase())
        );
      }
      
      return NextResponse.json({
        success: true,
        data: filteredBranches,
        total: filteredBranches.length,
      });
    }

    // Try to fetch from database
    const where: Record<string, unknown> = {};
    
    if (restaurantId) {
      where.restaurantId = restaurantId;
    }
    if (organizationId) {
      where.organization = { id: organizationId };
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (city) {
      where.city = { contains: city };
    }

    const restaurants = await db.restaurant.findMany({
      where,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            plan: true,
          },
        },
        _count: {
          select: {
            orders: true,
            tables: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // If no data in database, return demo data
    if (restaurants.length === 0) {
      return NextResponse.json({
        success: true,
        data: DEMO_BRANCHES,
        total: DEMO_BRANCHES.length,
        demo: true,
      });
    }

    // Transform restaurants to branches format
    let branches = restaurants.map(r => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      restaurantId: r.organizationId,
      address: r.address,
      city: r.city,
      district: r.district,
      phone: r.phone,
      email: r.email,
      isActive: r.isActive,
      isOpen: r.isOpen,
      rating: r.rating,
      reviewCount: r.reviewCount,
      totalCapacity: r.totalCapacity,
      latitude: r.latitude,
      longitude: r.longitude,
      createdAt: r.createdAt,
      organization: r.organization,
      _count: r._count,
    }));

    // Include stats if requested
    if (includeStats) {
      branches = await Promise.all(
        branches.map(async (branch) => {
          try {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            
            const [monthlyOrders, monthlyRevenue, totalCustomers] = await Promise.all([
              db.order.count({
                where: {
                  restaurantId: branch.id,
                  createdAt: { gte: startOfMonth },
                },
              }),
              db.order.aggregate({
                where: {
                  restaurantId: branch.id,
                  status: 'COMPLETED',
                  createdAt: { gte: startOfMonth },
                },
                _sum: { total: true },
              }),
              db.customerProfile.count({
                where: { organizationId: branch.restaurantId },
              }),
            ]);

            return {
              ...branch,
              stats: {
                monthlyOrders,
                monthlyRevenue: monthlyRevenue._sum.total || 0,
                totalCustomers,
              },
            };
          } catch {
            return {
              ...branch,
              stats: {
                monthlyOrders: 0,
                monthlyRevenue: 0,
                totalCustomers: 0,
              },
            };
          }
        })
      );
    }

    return NextResponse.json({
      success: true,
      data: branches,
      total: branches.length,
    });
  } catch (error) {
    console.error('Error fetching branches:', error);
    // Return demo data on error
    return NextResponse.json({
      success: true,
      data: DEMO_BRANCHES,
      total: DEMO_BRANCHES.length,
      demo: true,
      error: 'Database unavailable, using demo data',
    });
  }
}
