// Restaurants API - Restaurant CRUD with location search
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler, getPaginationParams } from '@/lib/api-responses';
import { generateSlug, calculateDistance } from '@/lib/utils-helpers';

// GET /api/restaurants - List restaurants with location search
export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const organizationId = searchParams.get('organizationId');
    const isActive = searchParams.get('isActive');
    const isOpen = searchParams.get('isOpen');
    const search = searchParams.get('search');
    const city = searchParams.get('city');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = parseFloat(searchParams.get('radius') || '10');
    const restaurantType = searchParams.get('restaurantType');

    if (!organizationId && !lat && !lng) {
      return apiError('organizationId ou coordonnées (lat, lng) sont requis');
    }

    const where = {
      ...(organizationId && { organizationId }),
      ...(isActive !== null && { isActive: isActive === 'true' }),
      ...(isOpen !== null && { isOpen: isOpen === 'true' }),
      ...(city && { city: { contains: city } }),
      ...(restaurantType && { restaurantType }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
          { address: { contains: search } },
        ],
      }),
    };

    let restaurants = await db.restaurant.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        hours: true,
        _count: {
          select: { tables: true, menus: true, orders: true },
        },
      },
    });

    // Filter by distance if coordinates provided
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      restaurants = restaurants.filter((restaurant) => {
        if (!restaurant.latitude || !restaurant.longitude) return false;
        const distance = calculateDistance(
          userLat,
          userLng,
          restaurant.latitude,
          restaurant.longitude
        );
        return distance <= radius;
      }).map((restaurant) => ({
        ...restaurant,
        distance: calculateDistance(
          userLat,
          userLng,
          restaurant.latitude!,
          restaurant.longitude!
        ),
      })).sort((a, b) => (a.distance as number) - (b.distance as number));
    }

    const total = await db.restaurant.count({ where });

    return apiSuccess({
      data: restaurants,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  });
}

// POST /api/restaurants - Create restaurant
export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const {
      organizationId,
      brandId,
      name,
      description,
      coverImage,
      logo,
      email,
      phone,
      address,
      address2,
      city,
      district,
      landmark,
      postalCode,
      countryId = 'ci',
      latitude,
      longitude,
      restaurantType = 'restaurant',
      cuisines,
      priceRange = 2,
      indoorCapacity,
      outdoorCapacity,
      totalCapacity,
      acceptsReservations = true,
      acceptsWalkins = true,
      acceptsDelivery = true,
      acceptsTakeaway = true,
      acceptsDineIn = true,
      hasParking = false,
      hasWifi = true,
      hasTerrace = false,
      hasVipRoom = false,
      deliveryFee = 0,
      minOrderAmount = 0,
      maxDeliveryRadius = 10,
      deliveryTime = 30,
      hours,
    } = body;

    // Validation
    if (!organizationId || !name || !phone || !address || !city) {
      return apiError('organisation, nom, téléphone, adresse et ville sont requis');
    }

    const slug = generateSlug(name);

    // Check slug uniqueness within organization
    const existing = await db.restaurant.findFirst({
      where: { organizationId, slug },
    });
    if (existing) {
      return apiError('Un restaurant avec ce nom existe déjà', 409);
    }

    // Get or create country
    let country = await db.country.findFirst({ where: { code: countryId.toUpperCase() } });
    if (!country) {
      country = await db.country.create({
        data: {
          code: countryId.toUpperCase(),
          name: countryId.toUpperCase() === 'CI' ? 'Côte d\'Ivoire' : countryId,
          dialCode: '+225',
          defaultLanguage: 'fr',
          timezone: 'Africa/Abidjan',
          taxIncluded: true,
          defaultTaxRate: 18,
          mobileMoneyEnabled: true,
          isActive: true,
        },
      });
    }

    // Create restaurant
    const restaurant = await db.restaurant.create({
      data: {
        organizationId,
        brandId,
        name,
        slug,
        description,
        coverImage,
        logo,
        email,
        phone,
        address,
        address2,
        city,
        district,
        landmark,
        postalCode,
        countryId: country.id,
        latitude,
        longitude,
        restaurantType,
        cuisines: cuisines ? JSON.stringify(cuisines) : null,
        priceRange,
        indoorCapacity,
        outdoorCapacity,
        totalCapacity,
        acceptsReservations,
        acceptsWalkins,
        acceptsDelivery,
        acceptsTakeaway,
        acceptsDineIn,
        hasParking,
        hasWifi,
        hasTerrace,
        hasVipRoom,
        deliveryFee,
        minOrderAmount,
        maxDeliveryRadius,
        deliveryTime,
        hours: hours ? {
          create: hours,
        } : undefined,
      },
      include: {
        hours: true,
      },
    });

    return apiSuccess(restaurant, 'Restaurant créé avec succès', 201);
  });
}

// PATCH /api/restaurants - Update restaurant
export async function PATCH(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const { id, hours, ...updateData } = body;

    if (!id) {
      return apiError('ID est requis');
    }

    const existing = await db.restaurant.findUnique({ where: { id } });
    if (!existing) {
      return apiError('Restaurant non trouvé', 404);
    }

    // Process cuisines if provided
    if (updateData.cuisines && Array.isArray(updateData.cuisines)) {
      updateData.cuisines = JSON.stringify(updateData.cuisines);
    }

    // Update restaurant
    const restaurant = await db.restaurant.update({
      where: { id },
      data: updateData,
      include: { hours: true },
    });

    // Update hours if provided
    if (hours && Array.isArray(hours)) {
      for (const hour of hours) {
        await db.restaurantHour.upsert({
          where: {
            restaurantId_dayOfWeek: {
              restaurantId: id,
              dayOfWeek: hour.dayOfWeek,
            },
          },
          create: { restaurantId: id, ...hour },
          update: hour,
        });
      }
    }

    return apiSuccess(restaurant, 'Restaurant mis à jour');
  });
}

// DELETE /api/restaurants - Delete restaurant
export async function DELETE(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('ID est requis');
    }

    const restaurant = await db.restaurant.findUnique({ where: { id } });
    if (!restaurant) {
      return apiError('Restaurant non trouvé', 404);
    }

    await db.restaurant.update({
      where: { id },
      data: { isActive: false },
    });

    return apiSuccess({ deleted: true }, 'Restaurant désactivé');
  });
}
