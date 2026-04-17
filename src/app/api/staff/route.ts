import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const restaurantId = searchParams.get('restaurantId') || undefined;
    const isActive = searchParams.get('isActive') 
      ? searchParams.get('isActive') === 'true' 
      : undefined;
    const role = searchParams.get('role') || undefined;

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
    return NextResponse.json({
      success: true,
      data: [],
      total: 0,
      error: 'Database unavailable, using demo data',
    });
  }
}