import { NextResponse } from 'next/server';

// Demo stats for when database is not available
const DEMO_STATS = {
  totalOrganizations: 127,
  activeOrganizations: 118,
  totalRestaurants: 384,
  activeRestaurants: 356,
  totalUsers: 2847,
  activeUsers: 2654,
  totalRevenue: 245000000,
  monthlyRevenue: 12450000,
  totalOrders: 45678,
  monthlyOrders: 3456,
  newSignupsThisMonth: 156,
  activeSubscriptions: 89,
};

export async function GET() {
  try {
    // In production, add authentication check here
    // const session = await getServerSession(authOptions);
    // if (!session || !ADMIN_ROLES.includes(session.user.role)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Try to import and use the admin service
    try {
      const { fetchAdminStats } = await import('@/lib/admin/service');
      const stats = await fetchAdminStats();
      return NextResponse.json(stats);
    } catch (dbError) {
      console.error('Database error, using demo stats:', dbError);
      // Return demo stats if database fails
      return NextResponse.json(DEMO_STATS);
    }
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    // Return demo stats on any error
    return NextResponse.json(DEMO_STATS);
  }
}
