// Drivers Tracking API - Real-time driver location tracking
import { NextResponse } from 'next/server';
import { broadcastDeliveryLocation } from '@/lib/sync-engine';

// Demo driver locations (simulated real-time GPS data)
const DEMO_DRIVER_LOCATIONS: Record<string, {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatar: string | null;
  vehicleType: string;
  vehiclePlate: string | null;
  vehicleColor: string | null;
  status: string;
  isAvailable: boolean;
  currentLat: number;
  currentLng: number;
  heading: number;
  speed: number;
  lastLocationAt: string;
  activeDelivery: {
    orderId: string;
    orderNumber: string;
    customerName: string;
    deliveryAddress: string;
    status: string;
    destinationLat: number;
    destinationLng: number;
  } | null;
}> = {};

// Initialize demo drivers with positions and random movement
function initDemoDrivers() {
  const drivers = [
    {
      id: 'demo-driver-1',
      firstName: 'Amadou',
      lastName: 'Touré',
      phone: '+2250700000100',
      avatar: null,
      vehicleType: 'motorcycle',
      vehiclePlate: 'AB 1234 CD',
      vehicleColor: 'Noir',
      status: 'busy',
      isAvailable: false,
      currentLat: 5.3599,
      currentLng: -4.0083,
      heading: 45,
      speed: 25,
      lastLocationAt: new Date().toISOString(),
      activeDelivery: {
        orderId: 'demo-ord-2',
        orderNumber: 'ORD-2024-0145',
        customerName: 'Kouamé Jean',
        deliveryAddress: 'Cocody, Riviera 3',
        status: 'IN_TRANSIT',
        destinationLat: 5.3699,
        destinationLng: -4.0283,
      },
    },
    {
      id: 'demo-driver-2',
      firstName: 'Ibrahim',
      lastName: 'Koné',
      phone: '+2250700000101',
      avatar: null,
      vehicleType: 'motorcycle',
      vehiclePlate: 'AB 5678 EF',
      vehicleColor: 'Rouge',
      status: 'busy',
      isAvailable: false,
      currentLat: 5.3364,
      currentLng: -4.0267,
      heading: 120,
      speed: 30,
      lastLocationAt: new Date().toISOString(),
      activeDelivery: {
        orderId: 'demo-ord-3',
        orderNumber: 'ORD-2024-0146',
        customerName: 'Aya Marie',
        deliveryAddress: 'Plateau, Rue du Commerce',
        status: 'PICKED_UP',
        destinationLat: 5.3489,
        destinationLng: -4.0110,
      },
    },
    {
      id: 'demo-driver-3',
      firstName: 'Moussa',
      lastName: 'Diallo',
      phone: '+2250700000102',
      avatar: null,
      vehicleType: 'bicycle',
      vehiclePlate: null,
      vehicleColor: 'Bleu',
      status: 'online',
      isAvailable: true,
      currentLat: 5.3412,
      currentLng: -4.0156,
      heading: 200,
      speed: 0,
      lastLocationAt: new Date().toISOString(),
      activeDelivery: null,
    },
    {
      id: 'demo-driver-4',
      firstName: 'Yao',
      lastName: 'Kouassi',
      phone: '+2250700000103',
      avatar: null,
      vehicleType: 'motorcycle',
      vehiclePlate: 'AB 9012 GH',
      vehicleColor: 'Blanc',
      status: 'busy',
      isAvailable: false,
      currentLat: 5.3289,
      currentLng: -3.9987,
      heading: 315,
      speed: 20,
      lastLocationAt: new Date().toISOString(),
      activeDelivery: {
        orderId: 'demo-ord-4',
        orderNumber: 'ORD-2024-0147',
        customerName: 'Koné Ibrahim',
        deliveryAddress: 'Cocody, Angré 7ème tranche',
        status: 'IN_TRANSIT',
        destinationLat: 5.3550,
        destinationLng: -4.0050,
      },
    },
    {
      id: 'demo-driver-6',
      firstName: 'Aïssata',
      lastName: 'Traoré',
      phone: '+2250700000105',
      avatar: null,
      vehicleType: 'scooter',
      vehiclePlate: 'AB 7890 KL',
      vehicleColor: 'Gris',
      status: 'online',
      isAvailable: true,
      currentLat: 5.3756,
      currentLng: -4.0421,
      heading: 90,
      speed: 0,
      lastLocationAt: new Date().toISOString(),
      activeDelivery: null,
    },
  ];

  drivers.forEach(d => {
    DEMO_DRIVER_LOCATIONS[d.id] = d;
  });
}

// Initialize on first import
initDemoDrivers();

// Simulate driver movement (called on each request to create illusion of real-time)
function simulateDriverMovement() {
  Object.values(DEMO_DRIVER_LOCATIONS).forEach(driver => {
    if (driver.status === 'busy' && driver.activeDelivery && driver.speed > 0) {
      // Move towards destination with some randomness
      const destLat = driver.activeDelivery.destinationLat;
      const destLng = driver.activeDelivery.destinationLng;
      const dLat = destLat - driver.currentLat;
      const dLng = destLng - driver.currentLng;
      const distance = Math.sqrt(dLat * dLat + dLng * dLng);

      if (distance > 0.001) {
        // Move a small step towards destination
        const step = 0.0005 + Math.random() * 0.0005;
        driver.currentLat += (dLat / distance) * step + (Math.random() - 0.5) * 0.0002;
        driver.currentLng += (dLng / distance) * step + (Math.random() - 0.5) * 0.0002;
        driver.heading = Math.atan2(dLng, dLat) * (180 / Math.PI);
      } else {
        // Arrived at destination
        driver.speed = 0;
        driver.activeDelivery.status = 'ARRIVED_AT_CUSTOMER';
      }

      driver.lastLocationAt = new Date().toISOString();
    } else if (driver.status === 'online' && driver.isAvailable) {
      // Random small drift for available drivers
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

    // Simulate movement
    simulateDriverMovement();

    let drivers = Object.values(DEMO_DRIVER_LOCATIONS);

    // Filter by specific driver
    if (driverId) {
      const driver = DEMO_DRIVER_LOCATIONS[driverId];
      if (!driver) {
        return NextResponse.json({ success: false, message: 'Driver non trouvé' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: driver });
    }

    // Filter by status
    if (status) {
      drivers = drivers.filter(d => d.status === status);
    }

    // Return all active drivers (online + busy)
    const activeDrivers = drivers.filter(d => d.status !== 'offline' && d.status !== 'suspended');

    const stats = {
      total: activeDrivers.length,
      online: activeDrivers.filter(d => d.status === 'online').length,
      busy: activeDrivers.filter(d => d.status === 'busy').length,
      offline: drivers.filter(d => d.status === 'offline').length,
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

    // Validate coordinates (Conakry area roughly)
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { success: false, message: 'Coordonnées invalides' },
        { status: 400 }
      );
    }

    // Update in demo store
    if (DEMO_DRIVER_LOCATIONS[driverId]) {
      DEMO_DRIVER_LOCATIONS[driverId].currentLat = lat;
      DEMO_DRIVER_LOCATIONS[driverId].currentLng = lng;
      DEMO_DRIVER_LOCATIONS[driverId].heading = heading ?? DEMO_DRIVER_LOCATIONS[driverId].heading;
      DEMO_DRIVER_LOCATIONS[driverId].speed = speed ?? 0;
      DEMO_DRIVER_LOCATIONS[driverId].lastLocationAt = new Date().toISOString();
      if (status) {
        DEMO_DRIVER_LOCATIONS[driverId].status = status;
        DEMO_DRIVER_LOCATIONS[driverId].isAvailable = status === 'online';
      }

      // Broadcast to Pusher for real-time admin tracking
      const driver = DEMO_DRIVER_LOCATIONS[driverId];

      // Broadcast to the orders channel (admin can see driver movement)
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
          // Don't fail if Pusher is not configured
          console.warn('Pusher broadcast failed:', pusherError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Position mise à jour',
      data: DEMO_DRIVER_LOCATIONS[driverId] || null,
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

    const driver = DEMO_DRIVER_LOCATIONS[driverId];
    if (!driver) {
      return NextResponse.json({ success: false, message: 'Driver non trouvé' }, { status: 404 });
    }

    if (status) driver.status = status;
    if (isAvailable !== undefined) driver.isAvailable = isAvailable;
    driver.lastLocationAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      message: 'Statut du driver mis à jour',
      data: driver,
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
