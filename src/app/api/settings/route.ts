// Settings API - Restaurant/Organization settings management
import { db, isDatabaseAvailable } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withAdminAuth } from '@/lib/auth-middleware';

// Helper to get or create default organization
async function getOrCreateDefaultOrganization() {
  let organization = await db.organization.findFirst();
  
  if (!organization) {
    // Create required reference data
    let currency = await db.currency.findUnique({ where: { code: 'GNF' } });
    if (!currency) {
      currency = await db.currency.create({
        data: { code: 'GNF', name: 'Franc Guinéen (FGN)', symbol: 'FGN', decimalPlaces: 0 },
      });
    }
    
    let country = await db.country.findUnique({ where: { code: 'GN' } });
    if (!country) {
      country = await db.country.create({
        data: {
          code: 'GN',
          name: 'Guinée',
          dialCode: '+224',
          currencyId: currency.id,
          isActive: true,
        },
      });
    }
    
    organization = await db.organization.create({
      data: {
        name: 'KFM DELICE',
        slug: 'kfm-delice-org',
        email: 'contact@kfm-delice.com',
        phone: '+224623217240',
        city: 'Conakry',
        countryId: country.id,
        currencyId: currency.id,
        plan: 'BUSINESS',
        settings: {
          create: {
            minOrderAmount: 10000,
            defaultDeliveryFee: 5000,
            orderPrepTime: 20,
            loyaltyEnabled: true,
            acceptsCash: true,
            acceptsMobileMoney: true,
          },
        },
      },
      include: { settings: true },
    });
  }
  
  return organization;
}

// GET /api/settings - Get organization/restaurant settings (authenticated users)
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    if (!isDatabaseAvailable() || !db) {
      return NextResponse.json({
        success: false,
        error: 'Base de données non disponible',
      }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const restaurantId = searchParams.get('restaurantId');

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
        },
      });

      if (!organization) {
        return NextResponse.json({
          success: false,
          error: 'Organisation non trouvée',
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
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
          hours: { orderBy: { dayOfWeek: 'asc' } },
          deliveryZones: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        },
      });

      if (!restaurant) {
        return NextResponse.json({
          success: false,
          error: 'Restaurant non trouvé',
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        restaurant,
        settings: restaurant.settings,
        hours: restaurant.hours,
        deliveryZones: restaurant.deliveryZones,
      });
    }

    // No ID provided - return default organization
    const organization = await getOrCreateDefaultOrganization();
    
    return NextResponse.json({
      success: true,
      organization,
      settings: organization.settings,
    });
  } catch (error) {
    console.error('Error in settings GET:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du chargement des paramètres',
    }, { status: 500 });
  }
});

// PATCH /api/settings - Update settings (admin only)
export const PATCH = withAdminAuth(async (request: NextRequest, user) => {
  try {
    if (!isDatabaseAvailable() || !db) {
      return NextResponse.json({
        success: false,
        error: 'Base de données non disponible',
      }, { status: 503 });
    }

    const body = await request.json();
    const { type, organizationId, restaurantId, settings } = body;

    // Update organization settings
    if (type === 'organization' || !type) {
      let orgId = organizationId;
      
      // If no organizationId provided, get or create default
      if (!orgId) {
        const org = await getOrCreateDefaultOrganization();
        orgId = org.id;
      }

      const organization = await db.organization.findUnique({
        where: { id: orgId },
      });

      if (!organization) {
        return NextResponse.json({
          success: false,
          error: 'Organisation non trouvée',
        }, { status: 404 });
      }

      // Update organization basic info
      if (settings?.organization) {
        await db.organization.update({
          where: { id: orgId },
          data: {
            name: settings.organization.name,
            email: settings.organization.email,
            phone: settings.organization.phone,
            address: settings.organization.address,
            city: settings.organization.city,
          },
        });
      }

      // Update or create organization settings
      if (settings?.config) {
        await db.organizationSettings.upsert({
          where: { organizationId: orgId },
          update: {
            minOrderAmount: settings.config.minOrderAmount,
            maxDeliveryRadius: settings.config.maxDeliveryRadius,
            defaultDeliveryFee: settings.config.defaultDeliveryFee,
            autoAcceptOrders: settings.config.autoAcceptOrders,
            orderPrepTime: settings.config.orderPrepTime,
            reservationEnabled: settings.config.reservationEnabled,
            acceptsCash: settings.config.acceptsCash,
            acceptsMobileMoney: settings.config.acceptsMobileMoney,
            acceptsCard: settings.config.acceptsCard,
            deliveryEnabled: settings.config.deliveryEnabled,
            loyaltyEnabled: settings.config.loyaltyEnabled,
          },
          create: {
            organizationId: orgId,
            minOrderAmount: settings.config.minOrderAmount || 0,
            defaultDeliveryFee: settings.config.defaultDeliveryFee || 0,
            orderPrepTime: settings.config.orderPrepTime || 20,
            acceptsCash: settings.config.acceptsCash ?? true,
            acceptsMobileMoney: settings.config.acceptsMobileMoney ?? true,
            loyaltyEnabled: settings.config.loyaltyEnabled ?? true,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Paramètres mis à jour',
      });
    }

    // Update restaurant settings
    if (type === 'restaurant' && restaurantId) {
      const restaurant = await db.restaurant.findUnique({
        where: { id: restaurantId },
      });

      if (!restaurant) {
        return NextResponse.json({
          success: false,
          error: 'Restaurant non trouvé',
        }, { status: 404 });
      }

      // Update restaurant basic info
      if (settings?.restaurant) {
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
            acceptsDelivery: settings.restaurant.acceptsDelivery,
            acceptsTakeaway: settings.restaurant.acceptsTakeaway,
            acceptsDineIn: settings.restaurant.acceptsDineIn,
          },
        });
      }

      // Update hours if provided
      if (settings?.hours && Array.isArray(settings.hours)) {
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
            },
            create: {
              restaurantId,
              dayOfWeek: hour.dayOfWeek,
              openTime: hour.openTime,
              closeTime: hour.closeTime,
              isClosed: hour.isClosed || false,
            },
          });
        }
      }

      // Update or create restaurant settings
      if (settings?.config) {
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

      return NextResponse.json({
        success: true,
        message: 'Paramètres du restaurant mis à jour',
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Type ou ID manquant',
    }, { status: 400 });
  } catch (error) {
    console.error('Error in settings PATCH:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la mise à jour',
    }, { status: 500 });
  }
});
