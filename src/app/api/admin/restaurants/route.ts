import { NextRequest, NextResponse } from 'next/server';
import { fetchRestaurants } from '@/lib/admin/service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;
    const organizationId = searchParams.get('organizationId') || undefined;
    const isActive = searchParams.get('isActive') 
      ? searchParams.get('isActive') === 'true' 
      : undefined;

    const result = await fetchRestaurants({
      page,
      limit,
      search,
      organizationId,
      isActive,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    );
  }
}
