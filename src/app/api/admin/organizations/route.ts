import { NextRequest, NextResponse } from 'next/server';
import { fetchOrganizations, createOrganization } from '@/lib/admin/service';
import { Plan } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;
    const plan = searchParams.get('plan') as Plan | null;
    const isActive = searchParams.get('isActive') 
      ? searchParams.get('isActive') === 'true' 
      : undefined;

    const result = await fetchOrganizations({
      page,
      limit,
      search,
      plan: plan || undefined,
      isActive,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.slug || !body.email || !body.phone || !body.city || !body.countryId || !body.currencyId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const organization = await createOrganization({
      name: body.name,
      slug: body.slug,
      email: body.email,
      phone: body.phone,
      city: body.city,
      countryId: body.countryId,
      currencyId: body.currencyId,
      plan: body.plan as Plan,
    });

    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}
