// Public Settings API - Get global settings including currency
// This is a public endpoint for unauthenticated access (public menu pages, etc.)
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Default settings for demo/fallback
const DEFAULT_SETTINGS = {
  name: 'KFM DELICE',
  phone: '+224 62 00 00 00',
  email: 'contact@kfm-delice.com',
  address: 'Kaloum',
  city: 'Conakry',
  currency: 'GNF',
  country: 'GN',
  logo: null,
};

// GET /api/public/settings - Get global settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const restaurantSlug = searchParams.get('restaurantSlug');

    // Try to get settings from database
    try {
      // If organizationId is provided, get organization settings
      if (organizationId) {
        const organization = await db.organization.findUnique({
          where: { id: organizationId },
          select: {
            name: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            logo: true,
            currency: {
              select: {
                code: true,
                symbol: true,
                name: true,
              }
            }
          }
        });

        if (organization) {
          return NextResponse.json({
            success: true,
            data: {
              name: organization.name,
              email: organization.email,
              phone: organization.phone,
              address: organization.address,
              city: organization.city,
              logo: organization.logo,
              currency: organization.currency?.code || 'GNF',
              currencyInfo: organization.currency || { code: 'GNF', symbol: 'GNF', name: 'Franc Guinéen' },
            }
          });
        }
      }

      // If restaurantSlug is provided, get restaurant's organization settings
      if (restaurantSlug) {
        const restaurant = await db.restaurant.findFirst({
          where: { slug: restaurantSlug },
          select: {
            name: true,
            phone: true,
            email: true,
            address: true,
            city: true,
            logo: true,
            organization: {
              select: {
                id: true,
                name: true,
                currency: {
                  select: {
                    code: true,
                    symbol: true,
                    name: true,
                  }
                }
              }
            }
          }
        });

        if (restaurant) {
          return NextResponse.json({
            success: true,
            data: {
              name: restaurant.name,
              email: restaurant.email,
              phone: restaurant.phone,
              address: restaurant.address,
              city: restaurant.city,
              logo: restaurant.logo,
              currency: restaurant.organization?.currency?.code || 'GNF',
              currencyInfo: restaurant.organization?.currency || { code: 'GNF', symbol: 'GNF', name: 'Franc Guinéen' },
              organizationId: restaurant.organization?.id,
            }
          });
        }
      }

      // Try to get the first organization's settings (for authenticated users in main app)
      const firstOrg = await db.organization.findFirst({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          city: true,
          logo: true,
          currency: {
            select: {
              code: true,
              symbol: true,
              name: true,
            }
          },
          settings: true,
        }
      });

      if (firstOrg) {
        return NextResponse.json({
          success: true,
          data: {
            id: firstOrg.id,
            name: firstOrg.name,
            email: firstOrg.email,
            phone: firstOrg.phone,
            address: firstOrg.address,
            city: firstOrg.city,
            logo: firstOrg.logo,
            currency: firstOrg.currency?.code || 'GNF',
            currencyInfo: firstOrg.currency || { code: 'GNF', symbol: 'GNF', name: 'Franc Guinéen' },
            settings: firstOrg.settings,
          }
        });
      }
    } catch (dbError) {
      console.warn('Database not available, using default settings:', dbError);
    }

    // Return default settings
    return NextResponse.json({
      success: true,
      data: {
        ...DEFAULT_SETTINGS,
        currencyInfo: { code: 'GNF', symbol: 'GNF', name: 'Franc Guinéen' },
      }
    });
  } catch (error) {
    console.error('Error in public settings API:', error);
    return NextResponse.json({
      success: true,
      data: {
        ...DEFAULT_SETTINGS,
        currencyInfo: { code: 'GNF', symbol: 'GNF', name: 'Franc Guinéen' },
      }
    });
  }
}
