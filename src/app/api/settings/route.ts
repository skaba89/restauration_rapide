// Settings API - Restaurant/Organization settings management
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';

// GET /api/settings - Get organization/restaurant settings
export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const restaurantId = searchParams.get('restaurantId');

    if (!organizationId && !restaurantId) {
      return apiError('organizationId ou restaurantId est requis');
    }

    // Get organization settings
    if (organizationId) {
      const organization = await db.organization.findUnique({
        where: { id: organizationId },
        include: {
          settings: true,
          users: {
            select: {
              id: true,
              role: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                  role: true,
                },
              },
            },
          },
          restaurants: {
            select: {
              id: true,
              name: true,
              city: true,
              isActive: true,
              isOpen: true,
            },
          },
          _count: {
            select: {
              restaurants: true,
              users: true,
            },
          },
        },
      });

      if (!organization) {
        return apiError('Organisation non trouvee', 404);
      }

      return apiSuccess({
        organization,
        settings: organization.settings,
      });
    }

    // Get restaurant settings
    if (restaurantId) {
      const restaurant = await db.restaurant.findUnique({
        where: { id: restaurantId },
        include: {
          settings: true,
          hours: {
            orderBy: { dayOfWeek: 'asc' },
          },
          deliveryZones: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
          tables: {
            select: {
              id: true,
              number: true,
              capacity: true,
              status: true,
            },
          },
          _count: {
            select: {
              menus: true,
              tables: true,
              orders: true,
            },
          },
        },
      });

      if (!restaurant) {
        return apiError('Restaurant non trouve', 404);
      }

      return apiSuccess({
        restaurant,
        settings: restaurant.settings,
        hours: restaurant.hours,
        deliveryZones: restaurant.deliveryZones,
      });
    }

    return apiError('Erreur de parametres');
  });
}

// PATCH /api/settings - Update settings
export async function PATCH(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const { type, organizationId, restaurantId, settings } = body;

    if (type === 'organization' && organizationId) {
      // Update organization settings
      const organization = await db.organization.findUnique({
        where: { id: organizationId },
      });

      if (!organization) {
        return apiError('Organisation non trouvee', 404);
      }

      // Update organization basic info
      if (settings.organization) {
        await db.organization.update({
          where: { id: organizationId },
          data: {
            name: settings.organization.name,
            email: settings.organization.email,
            phone: settings.organization.phone,
            address: settings.organization.address,
            city: settings.organization.city,
            countryId: settings.organization.countryId,
          },
        });
      }

      // Update or create organization settings
      if (settings.config) {
        await db.organizationSettings.upsert({
          where: { organizationId },
          update: {
            minOrderAmount: settings.config.minOrderAmount,
            maxDeliveryRadius: settings.config.maxDeliveryRadius,
            defaultDeliveryFee: settings.config.defaultDeliveryFee,
            autoAcceptOrders: settings.config.autoAcceptOrders,
            orderPrepTime: settings.config.orderPrepTime,
            reservationEnabled: settings.config.reservationEnabled,
            autoConfirmReservations: settings.config.autoConfirmReservations,
            defaultTableTime: settings.config.defaultTableTime,
            noShowFee: settings.config.noShowFee,
            acceptsCash: settings.config.acceptsCash,
            acceptsMobileMoney: settings.config.acceptsMobileMoney,
            acceptsCard: settings.config.acceptsCard,
            acceptsWallet: settings.config.acceptsWallet,
            deliveryEnabled: settings.config.deliveryEnabled,
            selfDelivery: settings.config.selfDelivery,
            thirdPartyDelivery: settings.config.thirdPartyDelivery,
            loyaltyEnabled: settings.config.loyaltyEnabled,
            pointsPerAmount: settings.config.pointsPerAmount,
            pointValue: settings.config.pointValue,
          },
          create: {
            organizationId,
            minOrderAmount: settings.config.minOrderAmount || 0,
            maxDeliveryRadius: settings.config.maxDeliveryRadius || 10,
            defaultDeliveryFee: settings.config.defaultDeliveryFee || 0,
            autoAcceptOrders: settings.config.autoAcceptOrders || false,
            orderPrepTime: settings.config.orderPrepTime || 15,
            reservationEnabled: settings.config.reservationEnabled ?? true,
            autoConfirmReservations: settings.config.autoConfirmReservations ?? true,
            defaultTableTime: settings.config.defaultTableTime || 120,
            noShowFee: settings.config.noShowFee || 0,
            acceptsCash: settings.config.acceptsCash ?? true,
            acceptsMobileMoney: settings.config.acceptsMobileMoney ?? true,
            acceptsCard: settings.config.acceptsCard ?? false,
            acceptsWallet: settings.config.acceptsWallet ?? false,
            deliveryEnabled: settings.config.deliveryEnabled ?? true,
            selfDelivery: settings.config.selfDelivery ?? true,
            thirdPartyDelivery: settings.config.thirdPartyDelivery ?? false,
            loyaltyEnabled: settings.config.loyaltyEnabled ?? true,
            pointsPerAmount: settings.config.pointsPerAmount || 1,
            pointValue: settings.config.pointValue || 10,
          },
        });
      }

      return apiSuccess({ updated: true }, 'Parametres mis a jour');
    }

    if (type === 'restaurant' && restaurantId) {
      // Update restaurant settings
      const restaurant = await db.restaurant.findUnique({
        where: { id: restaurantId },
      });

      if (!restaurant) {
        return apiError('Restaurant non trouve', 404);
      }

      // Update restaurant basic info
      if (settings.restaurant) {
        await db.restaurant.update({
          where: { id: restaurantId },
          data: {
            name: settings.restaurant.name,
            email: settings.restaurant.email,
            phone: settings.restaurant.phone,
            address: settings.restaurant.address,
            city: settings.restaurant.city,
            deliveryFee: settings.restaurant.deliveryFee,
            minOrderAmount: settings.restaurant.minOrderAmount,
            maxDeliveryRadius: settings.restaurant.maxDeliveryRadius,
            deliveryTime: settings.restaurant.deliveryTime,
            acceptsReservations: settings.restaurant.acceptsReservations,
            acceptsDelivery: settings.restaurant.acceptsDelivery,
            acceptsTakeaway: settings.restaurant.acceptsTakeaway,
            acceptsDineIn: settings.restaurant.acceptsDineIn,
          },
        });
      }

      // Update hours if provided
      if (settings.hours && Array.isArray(settings.hours)) {
        for (const hour of settings.hours) {
          await db.restaurantHour.upsert({
            where: {
              restaurantId_dayOfWeek: {
                restaurantId,
                dayOfWeek: hour.dayOfWeek,
              },
            },
            update: {
              openTime: hour.openTime,
              closeTime: hour.closeTime,
              isClosed: hour.isClosed,
              breakStart: hour.breakStart,
              breakEnd: hour.breakEnd,
            },
            create: {
              restaurantId,
              dayOfWeek: hour.dayOfWeek,
              openTime: hour.openTime,
              closeTime: hour.closeTime,
              isClosed: hour.isClosed || false,
              breakStart: hour.breakStart,
              breakEnd: hour.breakEnd,
            },
          });
        }
      }

      // Update or create restaurant settings
      if (settings.config) {
        await db.restaurantSettings.upsert({
          where: { restaurantId },
          update: {
            minOrderAmount: settings.config.minOrderAmount,
            deliveryFee: settings.config.deliveryFee,
            orderPrepTime: settings.config.orderPrepTime,
            loyaltyEnabled: settings.config.loyaltyEnabled,
          },
          create: {
            restaurantId,
            minOrderAmount: settings.config.minOrderAmount,
            deliveryFee: settings.config.deliveryFee,
            orderPrepTime: settings.config.orderPrepTime,
            loyaltyEnabled: settings.config.loyaltyEnabled,
          },
        });
      }

      return apiSuccess({ updated: true }, 'Parametres du restaurant mis a jour');
    }

    return apiError('Type ou ID manquant');
  });
}

// POST /api/settings - Create delivery zone or other settings
export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const { action, restaurantId, deliveryZone } = body;

    // Create delivery zone
    if (action === 'create-delivery-zone' && restaurantId && deliveryZone) {
      const zone = await db.deliveryZone.create({
        data: {
          restaurantId,
          name: deliveryZone.name,
          description: deliveryZone.description,
          districts: deliveryZone.districts ? JSON.stringify(deliveryZone.districts) : null,
          baseFee: deliveryZone.baseFee || 0,
          perKmFee: deliveryZone.perKmFee || 0,
          minOrder: deliveryZone.minOrder || 0,
          minTime: deliveryZone.minTime || 15,
          maxTime: deliveryZone.maxTime || 45,
          isActive: true,
        },
      });

      return apiSuccess(zone, 'Zone de livraison creee', 201);
    }

    return apiError('Action non reconnue');
  });
}

// DELETE /api/settings - Delete delivery zone
export async function DELETE(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    if (action === 'delete-delivery-zone' && id) {
      await db.deliveryZone.update({
        where: { id },
        data: { isActive: false },
      });

      return apiSuccess({ deleted: true }, 'Zone de livraison supprimee');
    }

    return apiError('Action ou ID manquant');
  });
}
