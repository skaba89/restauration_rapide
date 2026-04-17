import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-responses';
let darkKitchenSettings = {  };

// GET - Get dark kitchen settings
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organizationId');

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
  } = body;

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
  const { enabled, organizationId } = body;

  return NextResponse.json({
    success: true,
    settings: darkKitchenSettings,
    message: darkKitchenSettings.enabled 
      ? 'Mode Dark Kitchen activé' 
      : 'Mode Dark Kitchen désactivé',
  });
});