import { NextRequest, NextResponse } from 'next/server';
import { fetchRestaurants, createRestaurant } from '@/lib/admin/service';
import { withAdminAuth } from '@/lib/auth-middleware';

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

// POST /api/admin/restaurants - Create a new restaurant
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'slug', 'organizationId', 'countryId', 'city', 'address', 'phone'];
    const missing = requiredFields.filter(f => !body[f]);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Champs requis manquants: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    const restaurant = await createRestaurant({
      organizationId: body.organizationId,
      brandId: body.brandId || null,
      name: body.name,
      slug: body.slug,
      description: body.description || null,
      coverImage: body.coverImage || null,
      logo: body.logo || null,
      email: body.email || null,
      phone: body.phone,
      website: body.website || null,
      address: body.address,
      address2: body.address2 || null,
      city: body.city,
      district: body.district || null,
      landmark: body.landmark || null,
      postalCode: body.postalCode || null,
      countryId: body.countryId,
      latitude: body.latitude || null,
      longitude: body.longitude || null,
      restaurantType: body.restaurantType || 'restaurant',
      cuisines: body.cuisines || null,
      priceRange: body.priceRange || 2,
      indoorCapacity: body.indoorCapacity || null,
      outdoorCapacity: body.outdoorCapacity || null,
      acceptsReservations: body.acceptsReservations !== false,
      acceptsDelivery: body.acceptsDelivery !== false,
      acceptsTakeaway: body.acceptsTakeaway !== false,
      acceptsDineIn: body.acceptsDineIn !== false,
      deliveryFee: body.deliveryFee || 0,
      minOrderAmount: body.minOrderAmount || 0,
      deliveryTime: body.deliveryTime || 30,
      isActive: body.isActive !== false,
    });

    return NextResponse.json(restaurant, { status: 201 });
  } catch (error: any) {
    console.error('Error creating restaurant:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create restaurant' },
      { status: 500 }
    );
  }
});
