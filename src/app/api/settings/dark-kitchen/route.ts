import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-responses';

// Demo dark kitchen settings
const DEMO_DARK_KITCHEN_SETTINGS = {
  enabled: false,
  deliveryOnly: true,
  acceptedOrderTypes: ['delivery', 'takeaway'] as ('delivery' | 'takeaway')[],
  deliveryPartners: ['Orange Money Delivery', 'Jumia Food', 'Yassir'],
  averagePrepTime: 15,
  kitchenCapacity: 50,
  maxConcurrentOrders: 20,
  autoAssignDrivers: true,
  hideDineIn: true,
  peakHoursPrepBoost: true,
  lastUpdated: new Date().toISOString(),
};

// In-memory store for demo mode
let darkKitchenSettings = { ...DEMO_DARK_KITCHEN_SETTINGS };

// GET - Get dark kitchen settings
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const demo = searchParams.get('demo') === 'true';
  const organizationId = searchParams.get('organizationId');

  // Use demo mode if no organization or demo param
  if (demo || !organizationId) {
    return NextResponse.json({
      success: true,
      settings: darkKitchenSettings,
      isDemo: true,
    });
  }

  // In production, fetch from database
  // const settings = await db.darkKitchenSettings.findUnique({ where: { organizationId } });
  
  return NextResponse.json({
    success: true,
    settings: darkKitchenSettings,
  });
});

// PUT - Update dark kitchen settings
export const PUT = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { 
    enabled, 
    deliveryOnly, 
    acceptedOrderTypes, 
    deliveryPartners,
    averagePrepTime,
    kitchenCapacity,
    maxConcurrentOrders,
    autoAssignDrivers,
    hideDineIn,
    peakHoursPrepBoost,
    organizationId,
    demo = false,
  } = body;

  // Use demo mode
  if (demo || !organizationId) {
    // Update in-memory settings
    darkKitchenSettings = {
      ...darkKitchenSettings,
      ...(enabled !== undefined && { enabled }),
      ...(deliveryOnly !== undefined && { deliveryOnly }),
      ...(acceptedOrderTypes && { acceptedOrderTypes }),
      ...(deliveryPartners && { deliveryPartners }),
      ...(averagePrepTime !== undefined && { averagePrepTime }),
      ...(kitchenCapacity !== undefined && { kitchenCapacity }),
      ...(maxConcurrentOrders !== undefined && { maxConcurrentOrders }),
      ...(autoAssignDrivers !== undefined && { autoAssignDrivers }),
      ...(hideDineIn !== undefined && { hideDineIn }),
      ...(peakHoursPrepBoost !== undefined && { peakHoursPrepBoost }),
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      settings: darkKitchenSettings,
      message: enabled 
        ? 'Mode Dark Kitchen activé avec succès' 
        : 'Mode Dark Kitchen désactivé avec succès',
      isDemo: true,
    });
  }

  // In production, update database
  // const settings = await db.darkKitchenSettings.upsert({
  //   where: { organizationId },
  //   update: { ...body },
  //   create: { organizationId, ...body },
  // });

  return NextResponse.json({
    success: true,
    settings: darkKitchenSettings,
    message: enabled 
      ? 'Mode Dark Kitchen activé avec succès' 
      : 'Mode Dark Kitchen désactivé avec succès',
  });
});

// PATCH - Toggle dark kitchen mode
export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { enabled, organizationId, demo = false } = body;

  if (demo || !organizationId) {
    darkKitchenSettings = {
      ...darkKitchenSettings,
      enabled: enabled ?? !darkKitchenSettings.enabled,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      settings: darkKitchenSettings,
      message: darkKitchenSettings.enabled 
        ? 'Mode Dark Kitchen activé - Seules les commandes livraison/emporté sont acceptées' 
        : 'Mode Dark Kitchen désactivé - Toutes les commandes sont acceptées',
      isDemo: true,
    });
  }

  return NextResponse.json({
    success: true,
    settings: darkKitchenSettings,
    message: darkKitchenSettings.enabled 
      ? 'Mode Dark Kitchen activé' 
      : 'Mode Dark Kitchen désactivé',
  });
});
