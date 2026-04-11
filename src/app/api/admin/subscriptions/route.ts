import { NextRequest, NextResponse } from 'next/server';
import { fetchSubscriptionStats, fetchRecentPayments } from '@/lib/admin/service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const [stats, payments] = await Promise.all([
      fetchSubscriptionStats(),
      fetchRecentPayments({ page, limit }),
    ]);

    return NextResponse.json({
      stats,
      payments,
    });
  } catch (error) {
    console.error('Error fetching subscription data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription data' },
      { status: 500 }
    );
  }
}
