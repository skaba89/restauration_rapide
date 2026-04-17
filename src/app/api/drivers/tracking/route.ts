// Drivers Tracking API - Real-time driver location tracking
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { broadcastDeliveryLocation } from '@/lib/sync-engine';

// In-memory store for real-time locations (persisted to DB periodically)
const driverLocations: Record<string, any> = {};

// Simulate driver movement for drivers with active deliveries
function simulateDriverMovement() {
  Object.values(driverLocations).forEach((driver: any) => {
    if (driver.status === 'busy' && driver.activeDelivery && driver.speed > 0) {
      const destLat = driver.activeDelivery.destinationLat;
      const destLng = driver.activeDelivery.destinationLng;
      const dLat = destLat - driver.currentLat;
      const dLng = destLng - driver.currentLng;
      const distance = Math.sqrt(dLat * dLat + dLng * dLng);

      if (distance > 0.001) {
        const step = 0.0005 + Math.random() * 0.0005;
        driver.currentLat += (dLat / distance) * step + (Math.random() - 0.5) * 0.0002;
        driver.currentLng += (dLng / distance) * step + (Math.random() - 0.5) * 0.0002;
        driver.heading = Math.atan2(dLng, dLat) * (180 / Math.PI);
      } else {
        driver.speed = 0;
        driver.activeDelivery.status = 'ARRIVED_AT_CUSTOMER';
      }

      driver.lastLocationAt = new Date().toISOString();
    } else if (driver.status === 'online' && driver.isAvailable) {
      driver.currentLat += (Math.random() - 0.5) * 0.0001;
      driver.currentLng += (Math.random() - 0.5) * 0.0001;
      driver.lastLocationAt = new Date().toISOString();
    }
  });
}

// GET /api/drivers/tracking - Get all active driver locations
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId');
    const status = searchParams.get('status');
    const organizationId = searchParams.get('organizationId');

    // Simulate movement
    simulateDriverMovement();

    // Try to get real data from database
    let drivers = [];
    try {
      const where: any = { isActive: true };
      if (organizationId) where.organizationId = organizationId;
      
      const dbDrivers = await db.driver.findMany({
        where,
        include: {
          deliveries: {
            where: { status: { in: ['PENDING', 'DRIVER_ASSIGNED', 'PICKED_UP'] } },
            take: 1,
            include: {
              order: {
                select: {
                  id: true,
                  orderNumber: true,
                  customerName: true,
                  deliveryAddress: true,
                },
              },
            },
          },
        },
      });

      drivers = dbDrivers.map((d: any) => {
        const activeDelivery = d.deliveries[0];
        const stored = driverLocations[d.id];
        
        return {
          id: d.id,
          firstName: d.firstName || d.user?.firstName || '',
          lastName: d.lastName || d.user?.lastName || '',
          phone: d.phone || d.user?.phone || '',
          avatar: d.avatar || d.user?.avatar || null,
          vehicleType: d.vehicleType || 'motorcycle',
          vehiclePlate: d.vehiclePlate || null,
          vehicleColor: d.vehicleColor || null,
          status: d.isAvailable ? 'online' : 'offline',
          isAvailable: d.isAvailable,
          currentLat: stored?.currentLat || d.currentLat || 5.3599,
          currentLng: stored?.currentLng || d.currentLng || -4.0083,
          heading: stored?.heading || 0,
          speed: stored?.speed || 0,
          lastLocationAt: stored?.lastLocationAt || new Date().toISOString(),
          activeDelivery: activeDelivery ? {
            orderId: activeDelivery.order?.id,
            orderNumber: activeDelivery.order?.orderNumber,
            customerName: activeDelivery.order?.customerName,
            deliveryAddress: activeDelivery.dropoffAddress || activeDelivery.order?.deliveryAddress,
            status: activeDelivery.status === 'PICKED_UP' ? 'IN_TRANSIT' : 'PENDING',
            destinationLat: activeDelivery.dropoffLat || 5.3599,
            destinationLng: activeDelivery.dropoffLng || -4.0083,
          } : null,
        };
      });
    } catch (dbError) {
      console.error('DB error in driver tracking:', dbError);
    }

    // Merge in-memory locations
    if (driverId) {
      const driver = drivers.find((d: any) => d.id === driverId) || driverLocations[driverId];
      if (!driver) {
        return NextResponse.json({ success: false, message: 'Driver non trouvé' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: driver });
    }

    // Filter by status
    if (status) {
      drivers = drivers.filter((d: any) => d.status === status);
    }

    const activeDrivers = drivers.filter((d: any) => d.status !== 'offline' && d.status !== 'suspended');

    const stats = {
      total: activeDrivers.length,
      online: activeDrivers.filter((d: any) => d.status === 'online').length,
      busy: activeDrivers.filter((d: any) => d.status === 'busy').length,
      offline: drivers.filter((d: any) => d.status === 'offline').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        drivers: activeDrivers,
        stats,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching driver tracking:', error);
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/drivers/tracking - Update driver location (called by driver app)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { driverId, lat, lng, heading, speed, accuracy, status } = body;

    if (!driverId || lat === undefined || lng === undefined) {
      return NextResponse.json(
        { success: false, message: 'driverId, lat et lng sont requis' },
        { status: 400 }
      );
    }

    // Validate coordinates
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { success: false, message: 'Coordonnées invalides' },
        { status: 400 }
      );
    }

    // Update in-memory store
    if (!driverLocations[driverId]) {
      driverLocations[driverId] = {};
    }
    driverLocations[driverId].currentLat = lat;
    driverLocations[driverId].currentLng = lng;
    driverLocations[driverId].heading = heading ?? 0;
    driverLocations[driverId].speed = speed ?? 0;
    driverLocations[driverId].lastLocationAt = new Date().toISOString();
    if (status) {
      driverLocations[driverId].status = status;
      driverLocations[driverId].isAvailable = status === 'online';
    }

    // Update database
    try {
      await db.driver.update({
        where: { id: driverId },
        data: { currentLat: lat, currentLng: lng },
      });
    } catch (dbError) {
      console.warn('Failed to persist driver location:', dbError);
    }

    // Broadcast to Pusher for real-time admin tracking
    const driver = driverLocations[driverId];
    if (driver.activeDelivery) {
      try {
        await broadcastDeliveryLocation({
          orderId: driver.activeDelivery.orderId,
          driverId: driver.id,
          lat: driver.currentLat,
          lng: driver.currentLng,
          status: driver.activeDelivery.status,
          etaMinutes: driver.speed > 0
            ? Math.round(calculateDistance(
                driver.currentLat,
                driver.currentLng,
                driver.activeDelivery.destinationLat,
                driver.activeDelivery.destinationLng
              ) / (driver.speed / 60))
            : undefined,
        });
      } catch (pusherError) {
        console.warn('Pusher broadcast failed:', pusherError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Position mise à jour',
      data: driverLocations[driverId] || null,
    });
  } catch (error) {
    console.error('Error updating driver location:', error);
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH /api/drivers/tracking - Update driver status/tracking state
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { driverId, status, isAvailable } = body;

    if (!driverId) {
      return NextResponse.json(
        { success: false, message: 'driverId est requis' },
        { status: 400 }
      );
    }

    // Update database
    try {
      const updateData: any = {};
      if (status) updateData.isActive = status === 'online';
      if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
      
      await db.driver.update({
        where: { id: driverId },
        data: updateData,
      });
    } catch (dbError) {
      console.error('Failed to update driver in DB:', dbError);
    }

    // Update in-memory
    if (driverLocations[driverId]) {
      if (status) driverLocations[driverId].status = status;
      if (isAvailable !== undefined) driverLocations[driverId].isAvailable = isAvailable;
      driverLocations[driverId].lastLocationAt = new Date().toISOString();
    }

    return NextResponse.json({
      success: true,
      message: 'Statut du driver mis à jour',
      data: driverLocations[driverId] || null,
    });
  } catch (error) {
    console.error('Error updating driver tracking:', error);
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}

// Haversine distance in km
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
