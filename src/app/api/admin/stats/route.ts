import { NextResponse, NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/auth-middleware';

export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { fetchAdminStats } = await import('@/lib/admin/service');
    const stats = await fetchAdminStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
});
