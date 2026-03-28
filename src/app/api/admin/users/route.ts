import { NextRequest, NextResponse } from 'next/server';
import { fetchUsers, updateUser } from '@/lib/admin/service';
import { UserRole } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;
    const role = searchParams.get('role') as UserRole | null;
    const isActive = searchParams.get('isActive') 
      ? searchParams.get('isActive') === 'true' 
      : undefined;
    const organizationId = searchParams.get('organizationId') || undefined;

    const result = await fetchUsers({
      page,
      limit,
      search,
      role: role || undefined,
      isActive,
      organizationId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
