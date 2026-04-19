// Restaurant Settings API - Manage restaurant information
import { NextResponse, NextRequest } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';
import { withAdminAuth } from '@/lib/auth-middleware';

// Helper to ensure reference data exists
async function ensureReferenceData() {
  try {
    // Check if GNF currency exists
    let gnfCurrency = await db.currency.findUnique({ where: { code: 'GNF' } });
    if (!gnfCurrency) {
      gnfCurrency = await db.currency.create({
        data: { code: 'GNF', name: 'Franc Guinéen (FGN)', symbol: 'FGN', decimalPlaces: 0 },
      });
    }

    // Check if Guinea country exists
    let gnCountry = await db.country.findUnique({ where: { code: 'GN' } });
    if (!gnCountry) {
      gnCountry = await db.country.create({
        data: {
          code: 'GN',
          name: 'Guinée',
          dialCode: '+224',
          currencyId: gnfCurrency.id,
          isActive: true,
        },
      });
    }

    return { gnfCurrency, gnCountry };
  } catch (error) {
    console.error('Error ensuring reference data:', error);
    return { gnfCurrency: null, gnCountry: null };
  }
}

// GET - Fetch restaurant settings
export async function GET() {
  try {
    if (!isDatabaseAvailable() || !db) {
      return NextResponse.json({
        success: false,
        error: 'Base de données non disponible',
      }, { status: 503 });
    }

    // Ensure reference data exists
    const { gnfCurrency, gnCountry } = await ensureReferenceData();

    // Try to find existing restaurant
    let restaurant = await db.restaurant.findFirst({
      where: { slug: 'kfm-delice' },
      include: {
        settings: true,
        hours: { orderBy: { dayOfWeek: 'asc' } },
        deliveryZones: { where: { isActive: true }, orderBy: { name: 'asc' } },
      },
    });

    if (!restaurant) {
      // Create default restaurant if none exists
      const defaultCurrency = await db.currency.findUnique({ where: { code: 'GNF' } });
      const defaultCountry = await db.country.findUnique({ where: { code: 'GN' } });
      
      let organization = await db.organization.findFirst();
      
      if (!organization) {
        organization = await db.organization.create({
          data: {
            name: 'KFM DELICE',
            slug: 'kfm-delice-org',
            email: 'contact@kfm-delice.com',
            phone: '+224623217240',
            city: 'Conakry',
            countryId: defaultCountry?.id || 'default',
            currencyId: defaultCurrency?.id || 'default',
            plan: 'BUSINESS',
          },
        });
      }

      restaurant = await db.restaurant.create({
        data: {
          organizationId: organization.id,
          name: 'KFM DELICE',
          slug: 'kfm-delice',
          description: 'Restaurant fast-food guinéen - Saveurs authentiques',
          phone: '+224623217240',
          email: 'contact@kfm-delice.com',
          address: 'Nongo',
          city: 'Conakry',
          district: 'Ratoma',
          countryId: defaultCountry?.id || organization.countryId,
          restaurantType: 'restaurant',
          priceRange: 2,
          acceptsReservations: true,
          acceptsDelivery: true,
          acceptsTakeaway: true,
          acceptsDineIn: true,
          deliveryFee: 5000,
          minOrderAmount: 10000,
          maxDeliveryRadius: 10,
          isOpen: true,
          isActive: true,
          settings: {
            create: {
              minOrderAmount: 10000,
              deliveryFee: 5000,
              orderPrepTime: 20,
              loyaltyEnabled: true,
            },
          },
        },
        include: {
          settings: true,
          hours: true,
          deliveryZones: true,
        },
      });

      // Create default hours
      for (let i = 0; i < 7; i++) {
        await db.restaurantHour.create({
          data: {
            restaurantId: restaurant.id,
            dayOfWeek: i,
            openTime: i >= 5 ? '10:00' : '10:00',
            closeTime: i >= 5 ? '23:00' : '22:00',
            isClosed: false,
          },
        });
      }

      // Refresh with hours
      restaurant = await db.restaurant.findFirst({
        where: { id: restaurant.id },
        include: {
          settings: true,
          hours: { orderBy: { dayOfWeek: 'asc' } },
          deliveryZones: { where: { isActive: true }, orderBy: { name: 'asc' } },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error('Error fetching restaurant settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du chargement des paramètres',
    }, { status: 500 });
  }
}

// PATCH - Update restaurant settings
export const PATCH = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();

    if (!isDatabaseAvailable() || !db) {
      return NextResponse.json({
        success: false,
        error: 'Base de données non disponible',
      }, { status: 503 });
    }

    const restaurant = await db.restaurant.findFirst({
      where: { slug: 'kfm-delice' },
    });

    if (!restaurant) {
      return NextResponse.json({
        success: false,
        error: 'Restaurant non trouvé',
      }, { status: 404 });
    }

    // Update restaurant info
    const updateData: any = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.district !== undefined) updateData.district = body.district;
    if (body.isOpen !== undefined) updateData.isOpen = body.isOpen;
    if (body.acceptsDelivery !== undefined) updateData.acceptsDelivery = body.acceptsDelivery;
    if (body.acceptsTakeaway !== undefined) updateData.acceptsTakeaway = body.acceptsTakeaway;
    if (body.acceptsDineIn !== undefined) updateData.acceptsDineIn = body.acceptsDineIn;
    if (body.deliveryFee !== undefined) updateData.deliveryFee = parseFloat(body.deliveryFee);
    if (body.minOrderAmount !== undefined) updateData.minOrderAmount = parseFloat(body.minOrderAmount);
    if (body.logo !== undefined) updateData.logo = body.logo;
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage;

    const updatedRestaurant = await db.restaurant.update({
      where: { id: restaurant.id },
      data: updateData,
    });

    // Update settings if provided
    if (body.settings) {
      const settingsData: any = {};
      if (body.settings.orderPrepTime !== undefined) settingsData.orderPrepTime = parseInt(body.settings.orderPrepTime);
      if (body.settings.loyaltyEnabled !== undefined) settingsData.loyaltyEnabled = body.settings.loyaltyEnabled;
      
      if (Object.keys(settingsData).length > 0) {
        await db.restaurantSettings.updateMany({
          where: { restaurantId: restaurant.id },
          data: settingsData,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedRestaurant,
      message: 'Paramètres mis à jour',
    });
  } catch (error) {
    console.error('Error updating restaurant settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la mise à jour',
    }, { status: 500 });
  }
});
