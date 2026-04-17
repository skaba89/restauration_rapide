import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeStats = searchParams.get('includeStats') === 'true';
    const restaurantId = searchParams.get('restaurantId') || undefined;
    const organizationId = searchParams.get('organizationId') || undefined;
    const isActive = searchParams.get('isActive') 
      ? searchParams.get('isActive') === 'true' 
      : undefined;
    const city = searchParams.get('city') || undefined;

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
    return NextResponse.json({
      success: true,
      data: [],
      total: 0,
      error: 'Database unavailable, using demo data',
    });
  }
}