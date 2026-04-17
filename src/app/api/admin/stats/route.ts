import { NextResponse, NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/auth-middleware';

export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    // In production, add authentication check here
    // const session = await getServerSession(authOptions);
    // if (!session || !ADMIN_ROLES.includes(session.user.role)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Try to import and use the admin service dynamically
    try {
      const { fetchAdminStats } = await import('@/lib/admin/service');
      const stats = await fetchAdminStats();
      return NextResponse.json(stats);
    } catch (dbError) {
      console.error('Database error, using demo stats:', dbError);
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json([]);
  }
});