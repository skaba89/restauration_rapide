import { NextRequest, NextResponse } from 'next/server';
import { 
  fetchRevenueData, 
  fetchGeographicData, 
  fetchFeatureUsage, 
  fetchGrowthData,
  fetchRecentSignups
} from '@/lib/admin/service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');
    const months = parseInt(searchParams.get('months') || '12');

    const [revenueData, geographicData, featureUsage, growthData, recentSignups] = await Promise.all([
      fetchRevenueData(days),
      fetchGeographicData(),
      fetchFeatureUsage(),
      fetchGrowthData(months),
      fetchRecentSignups(10),
    ]);

    return NextResponse.json({
      revenueData,
      geographicData,
      featureUsage,
      growthData,
      recentSignups,
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
