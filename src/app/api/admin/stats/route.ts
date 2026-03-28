import { NextResponse } from 'next/server';
import { fetchAdminStats } from '@/lib/admin/service';

export async function GET() {
  try {
    // In production, add authentication check here
    // const session = await getServerSession(authOptions);
    // if (!session || !ADMIN_ROLES.includes(session.user.role)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const stats = await fetchAdminStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
