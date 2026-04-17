// ============================================
// Clear All Demo Data Endpoint
// POST /api/clear-data - Deletes all data from database
// SECURITY: Blocked in production, requires admin auth
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withAdminAuth } from '@/lib/auth-middleware';

export const POST = withAdminAuth(async (request: NextRequest) => {
  // Block in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({
      success: false,
      error: 'This endpoint is disabled in production',
    }, { status: 403 });
  }

  try {
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Base de données non disponible',
      }, { status: 500 });
    }

    console.log('🧹 Starting data cleanup...');

    // Delete in correct order to respect foreign key constraints
    // Level 1 - deepest children
    console.log('Deleting level 1 tables...');
    await db.driverLocation.deleteMany().catch(() => {});
    await db.driverWalletTransaction.deleteMany().catch(() => {});
    await db.deliveryTrackingEvent.deleteMany().catch(() => {});
    await db.orderStatusHistory.deleteMany().catch(() => {});
    await db.loyaltyTransaction.deleteMany().catch(() => {});
    await db.driverEarning.deleteMany().catch(() => {});
    await db.driverDocument.deleteMany().catch(() => {});

    // Level 2
    console.log('Deleting level 2 tables...');
    await db.orderItem.deleteMany().catch(() => {});
    await db.cartItem.deleteMany().catch(() => {});
    await db.payment.deleteMany().catch(() => {});
    await db.delivery.deleteMany().catch(() => {});
    await db.reservationTable.deleteMany().catch(() => {});
    await db.menuItemAllergen.deleteMany().catch(() => {});
    await db.menuItemIngredient.deleteMany().catch(() => {});
    await db.menuItemOptionValue.deleteMany().catch(() => {});
    await db.menuItemVariant.deleteMany().catch(() => {});
    await db.menuItemOption.deleteMany().catch(() => {});
    await db.driverSession.deleteMany().catch(() => {});

    // Level 3
    console.log('Deleting level 3 tables...');
    await db.order.deleteMany().catch(() => {});
    await db.cart.deleteMany().catch(() => {});
    await db.reservation.deleteMany().catch(() => {});
    await db.waitlistEntry.deleteMany().catch(() => {});
    await db.qrSession.deleteMany().catch(() => {});
    await db.menuItem.deleteMany().catch(() => {});
    await db.table.deleteMany().catch(() => {});
    await db.driverWallet.deleteMany().catch(() => {});
    await db.driver.deleteMany().catch(() => {});

    // Level 4
    console.log('Deleting level 4 tables...');
    await db.menuCategory.deleteMany().catch(() => {});
    await db.menu.deleteMany().catch(() => {});
    await db.diningRoom.deleteMany().catch(() => {});
    await db.deliveryZone.deleteMany().catch(() => {});
    await db.restaurantHour.deleteMany().catch(() => {});
    await db.restaurantSpecialHour.deleteMany().catch(() => {});
    await db.restaurantSettings.deleteMany().catch(() => {});
    await db.review.deleteMany().catch(() => {});

    // Level 5
    console.log('Deleting level 5 tables...');
    await db.restaurant.deleteMany().catch(() => {});
    await db.brand.deleteMany().catch(() => {});

    // Level 6 - Customer profiles
    console.log('Deleting customer data...');
    await db.customerFeedback.deleteMany().catch(() => {});
    await db.customerProfile.deleteMany().catch(() => {});

    // Level 7 - Organization
    console.log('Deleting organization data...');
    await db.organizationSettings.deleteMany().catch(() => {});
    await db.organizationUser.deleteMany().catch(() => {});
    await db.organization.deleteMany().catch(() => {});

    // Level 8 - Core data
    console.log('Deleting core data...');
    await db.ingredient.deleteMany().catch(() => {});
    await db.allergen.deleteMany().catch(() => {});
    await db.stockMovement.deleteMany().catch(() => {});
    await db.customerTag.deleteMany().catch(() => {});
    await db.loyaltyReward.deleteMany().catch(() => {});
    await db.loyaltyLevel.deleteMany().catch(() => {});
    await db.promotion.deleteMany().catch(() => {});

    // Level 9 - Users (keep SUPER_ADMIN users)
    console.log('Deleting users...');
    await db.session.deleteMany().catch(() => {});
    await db.refreshToken.deleteMany().catch(() => {});
    await db.otpCode.deleteMany().catch(() => {});
    await db.auditLog.deleteMany().catch(() => {});
    await db.staffProfile.deleteMany().catch(() => {});
    
    // Delete non-super-admin users
    await db.user.deleteMany({
      where: {
        role: { not: 'SUPER_ADMIN' }
      }
    }).catch(() => {});

    // Level 10 - Countries and currencies (keep them for reference)
    // Don't delete countries and currencies as they are reference data

    console.log('✅ Data cleanup completed!');

    return NextResponse.json({
      success: true,
      message: 'Toutes les données de démo ont été supprimées avec succès',
      deleted: [
        'orders', 'payments', 'deliveries', 'reservations',
        'menu items', 'menu categories', 'menus',
        'drivers', 'customers', 'restaurants', 'organizations',
        'users (non-super-admin)', 'tables', 'reviews'
      ],
    });
  } catch (error) {
    console.error('❌ Clear data error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la suppression des données',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
});

// GET - Return info about the endpoint (admin auth required)
export const GET = withAdminAuth(async (request: NextRequest) => {
  return NextResponse.json({
    endpoint: '/api/clear-data',
    method: 'POST',
    description: 'Supprime toutes les données de démo de la base de données',
    warning: 'Cette action est irréversible!',
  });
});
