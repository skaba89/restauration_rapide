import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Demo staff data for fallback
const DEMO_STAFF = [
  {
    id: 'staff-1',
    userId: 'user-1',
    restaurantId: 'rest-1',
    role: 'MANAGER',
    firstName: 'Amadou',
    lastName: 'Diallo',
    email: 'amadou@restaurant-os.com',
    phone: '+225 07 00 00 00 01',
    avatar: null,
    isActive: true,
    createdAt: new Date('2023-06-15'),
    restaurant: { id: 'rest-1', name: 'Le Savana' },
  },
  {
    id: 'staff-2',
    userId: 'user-2',
    restaurantId: 'rest-1',
    role: 'CHEF',
    firstName: 'Fatou',
    lastName: 'Ndiaye',
    email: 'fatou@restaurant-os.com',
    phone: '+225 07 00 00 00 02',
    avatar: null,
    isActive: true,
    createdAt: new Date('2023-08-20'),
    restaurant: { id: 'rest-1', name: 'Le Savana' },
  },
  {
    id: 'staff-3',
    userId: 'user-3',
    restaurantId: 'rest-2',
    role: 'WAITER',
    firstName: 'Kofi',
    lastName: 'Mensah',
    email: 'kofi@restaurant-os.com',
    phone: '+225 07 00 00 00 03',
    avatar: null,
    isActive: true,
    createdAt: new Date('2023-10-05'),
    restaurant: { id: 'rest-2', name: 'Saveurs d\'Afrique' },
  },
  {
    id: 'staff-4',
    userId: 'user-4',
    restaurantId: 'rest-1',
    role: 'CASHIER',
    firstName: 'Aisha',
    lastName: 'Bamba',
    email: 'aisha@restaurant-os.com',
    phone: '+225 07 00 00 00 04',
    avatar: null,
    isActive: true,
    createdAt: new Date('2023-11-12'),
    restaurant: { id: 'rest-1', name: 'Le Savana' },
  },
  {
    id: 'staff-5',
    userId: 'user-5',
    restaurantId: 'rest-3',
    role: 'MANAGER',
    firstName: 'Moussa',
    lastName: 'Koné',
    email: 'moussa@restaurant-os.com',
    phone: '+225 07 00 00 00 05',
    avatar: null,
    isActive: false,
    createdAt: new Date('2023-09-25'),
    restaurant: { id: 'rest-3', name: 'Le Petit Bistro' },
  },
  {
    id: 'staff-6',
    userId: 'user-6',
    restaurantId: 'rest-2',
    role: 'CHEF',
    firstName: 'Adama',
    lastName: 'Touré',
    email: 'adama@restaurant-os.com',
    phone: '+225 07 00 00 00 06',
    avatar: null,
    isActive: true,
    createdAt: new Date('2024-01-05'),
    restaurant: { id: 'rest-2', name: 'Saveurs d\'Afrique' },
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const demo = searchParams.get('demo') === 'true';
    const restaurantId = searchParams.get('restaurantId') || undefined;
    const isActive = searchParams.get('isActive') 
      ? searchParams.get('isActive') === 'true' 
      : undefined;
    const role = searchParams.get('role') || undefined;

    // Return demo data if demo=true or if no real data exists
    if (demo) {
      let filteredStaff = [...DEMO_STAFF];
      
      if (restaurantId) {
        filteredStaff = filteredStaff.filter(s => s.restaurantId === restaurantId);
      }
      if (isActive !== undefined) {
        filteredStaff = filteredStaff.filter(s => s.isActive === isActive);
      }
      if (role) {
        filteredStaff = filteredStaff.filter(s => s.role === role);
      }
      
      return NextResponse.json({
        success: true,
        data: filteredStaff,
        total: filteredStaff.length,
      });
    }

    // Try to fetch from database
    const where: Record<string, unknown> = {};
    
    if (restaurantId) {
      where.restaurantId = restaurantId;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (role) {
      where.role = role;
    }

    const staff = await db.staffProfile.findMany({
      where,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // If no data in database, return demo data
    if (staff.length === 0) {
      return NextResponse.json({
        success: true,
        data: DEMO_STAFF,
        total: DEMO_STAFF.length,
        demo: true,
      });
    }

    // Transform to match expected format
    const transformedStaff = staff.map(s => ({
      id: s.id,
      userId: s.userId,
      restaurantId: s.restaurantId,
      role: s.role,
      firstName: s.user?.firstName || s.user?.email?.split('@')[0] || '',
      lastName: s.user?.lastName || '',
      email: s.user?.email || '',
      phone: s.user?.phone || null,
      avatar: s.user?.avatar || null,
      isActive: s.isActive,
      createdAt: s.createdAt,
      restaurant: s.restaurant,
    }));

    return NextResponse.json({
      success: true,
      data: transformedStaff,
      total: staff.length,
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    // Return demo data on error
    return NextResponse.json({
      success: true,
      data: DEMO_STAFF,
      total: DEMO_STAFF.length,
      demo: true,
      error: 'Database unavailable, using demo data',
    });
  }
}
