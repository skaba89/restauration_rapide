// Drivers API - Driver management with location update and demo support
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler, getPaginationParams } from '@/lib/api-responses';
import { validatePhoneNumber } from '@/lib/utils-helpers';

// Demo drivers data
const DEMO_DRIVERS = [
  {
    id: 'demo-driver-1',
    firstName: 'Amadou',
    lastName: 'Touré',
    phone: '+2250700000100',
    email: 'amadou@email.com',
    avatar: null,
    vehicleType: 'motorcycle',
    vehicleBrand: 'Jakarta',
    vehicleModel: '125cc',
    vehiclePlate: 'AB 1234 CD',
    vehicleColor: 'Noir',
    isVerified: true,
    isActive: true,
    isAvailable: true,
    status: 'online',
    currentLat: 5.3599,
    currentLng: -4.0083,
    totalDeliveries: 156,
    totalEarnings: 156000,
    rating: 4.8,
    reviewCount: 45,
    wallet: { balance: 45000, pending: 12000 },
    createdAt: new Date('2023-06-15'),
  },
  {
    id: 'demo-driver-2',
    firstName: 'Ibrahim',
    lastName: 'Koné',
    phone: '+2250700000101',
    email: 'ibrahim@email.com',
    avatar: null,
    vehicleType: 'motorcycle',
    vehicleBrand: 'Haojue',
    vehicleModel: '150cc',
    vehiclePlate: 'AB 5678 EF',
    vehicleColor: 'Rouge',
    isVerified: true,
    isActive: true,
    isAvailable: true,
    status: 'online',
    currentLat: 5.3364,
    currentLng: -4.0267,
    totalDeliveries: 98,
    totalEarnings: 98000,
    rating: 4.5,
    reviewCount: 28,
    wallet: { balance: 28000, pending: 8000 },
    createdAt: new Date('2023-09-20'),
  },
  {
    id: 'demo-driver-3',
    firstName: 'Moussa',
    lastName: 'Diallo',
    phone: '+2250700000102',
    email: 'moussa@email.com',
    avatar: null,
    vehicleType: 'bicycle',
    vehicleBrand: null,
    vehicleModel: null,
    vehiclePlate: null,
    vehicleColor: 'Bleu',
    isVerified: true,
    isActive: true,
    isAvailable: false,
    status: 'busy',
    currentLat: 5.3412,
    currentLng: -4.0156,
    totalDeliveries: 67,
    totalEarnings: 67000,
    rating: 4.6,
    reviewCount: 19,
    wallet: { balance: 15000, pending: 15000 },
    createdAt: new Date('2024-01-10'),
  },
  {
    id: 'demo-driver-4',
    firstName: 'Yao',
    lastName: 'Kouassi',
    phone: '+2250700000103',
    email: 'yao@email.com',
    avatar: null,
    vehicleType: 'motorcycle',
    vehicleBrand: 'TVS',
    vehicleModel: 'Apache',
    vehiclePlate: 'AB 9012 GH',
    vehicleColor: 'Blanc',
    isVerified: true,
    isActive: true,
    isAvailable: true,
    status: 'online',
    currentLat: 5.3289,
    currentLng: -3.9987,
    totalDeliveries: 201,
    totalEarnings: 201000,
    rating: 4.9,
    reviewCount: 67,
    wallet: { balance: 72000, pending: 5000 },
    createdAt: new Date('2023-04-01'),
  },
  {
    id: 'demo-driver-5',
    firstName: 'Seydou',
    lastName: 'Bamba',
    phone: '+2250700000104',
    email: 'seydou@email.com',
    avatar: null,
    vehicleType: 'motorcycle',
    vehicleBrand: 'Bajaj',
    vehicleModel: 'Boxer',
    vehiclePlate: 'AB 3456 IJ',
    vehicleColor: 'Vert',
    isVerified: false,
    isActive: true,
    isAvailable: false,
    status: 'offline',
    currentLat: null,
    currentLng: null,
    totalDeliveries: 12,
    totalEarnings: 12000,
    rating: 4.2,
    reviewCount: 5,
    wallet: { balance: 5000, pending: 0 },
    createdAt: new Date('2024-02-28'),
  },
  {
    id: 'demo-driver-6',
    firstName: 'Aïssata',
    lastName: 'Traoré',
    phone: '+2250700000105',
    email: 'aissata@email.com',
    avatar: null,
    vehicleType: 'scooter',
    vehicleBrand: 'Honda',
    vehicleModel: 'PCX',
    vehiclePlate: 'AB 7890 KL',
    vehicleColor: 'Gris',
    isVerified: true,
    isActive: true,
    isAvailable: true,
    status: 'online',
    currentLat: 5.3756,
    currentLng: -4.0421,
    totalDeliveries: 89,
    totalEarnings: 89000,
    rating: 4.7,
    reviewCount: 32,
    wallet: { balance: 35000, pending: 10000 },
    createdAt: new Date('2023-11-15'),
  },
  {
    id: 'demo-driver-7',
    firstName: 'Jean-Baptiste',
    lastName: 'Kouakou',
    phone: '+2250700000106',
    email: 'jb@email.com',
    avatar: null,
    vehicleType: 'car',
    vehicleBrand: 'Toyota',
    vehicleModel: 'Corolla',
    vehiclePlate: 'AB 2345 MN',
    vehicleColor: 'Blanc',
    isVerified: true,
    isActive: true,
    isAvailable: false,
    status: 'offline',
    currentLat: null,
    currentLng: null,
    totalDeliveries: 145,
    totalEarnings: 145000,
    rating: 4.6,
    reviewCount: 41,
    wallet: { balance: 52000, pending: 8000 },
    createdAt: new Date('2023-07-20'),
  },
  {
    id: 'demo-driver-8',
    firstName: 'Fatoumata',
    lastName: 'Sylla',
    phone: '+2250700000107',
    email: 'fatou@email.com',
    avatar: null,
    vehicleType: 'motorcycle',
    vehicleBrand: 'Jakarta',
    vehicleModel: '125cc',
    vehiclePlate: 'AB 6789 OP',
    vehicleColor: 'Jaune',
    isVerified: true,
    isActive: false,
    isAvailable: false,
    status: 'suspended',
    currentLat: null,
    currentLng: null,
    totalDeliveries: 34,
    totalEarnings: 34000,
    rating: 3.8,
    reviewCount: 12,
    wallet: { balance: 8000, pending: 0 },
    createdAt: new Date('2023-12-05'),
  },
];

// GET /api/drivers - List drivers
export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const organizationId = searchParams.get('organizationId');
    const isAvailable = searchParams.get('isAvailable');
    const isActive = searchParams.get('isActive');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const demo = searchParams.get('demo');

    // Return demo data if demo mode or no organization specified
    if (demo === 'true' || !organizationId) {
      let filteredDrivers = [...DEMO_DRIVERS];
      
      // Apply filters
      if (isAvailable !== null) {
        filteredDrivers = filteredDrivers.filter(d => d.isAvailable === (isAvailable === 'true'));
      }
      if (isActive !== null) {
        filteredDrivers = filteredDrivers.filter(d => d.isActive === (isActive === 'true'));
      }
      if (status) {
        filteredDrivers = filteredDrivers.filter(d => d.status === status);
      }
      if (search) {
        const searchLower = search.toLowerCase();
        filteredDrivers = filteredDrivers.filter(d => 
          d.firstName.toLowerCase().includes(searchLower) ||
          d.lastName.toLowerCase().includes(searchLower) ||
          d.phone.includes(search) ||
          d.email?.toLowerCase().includes(searchLower)
        );
      }

      const total = filteredDrivers.length;
      const paginatedDrivers = filteredDrivers.slice(skip, skip + limit);

      return apiSuccess({
        data: paginatedDrivers.map(d => ({
          ...d,
          _count: { deliveries: d.totalDeliveries },
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }

    const where = {
      organizationId,
      ...(isAvailable !== null && { isAvailable: isAvailable === 'true' }),
      ...(isActive !== null && { isActive: isActive === 'true' }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { phone: { contains: search } },
          { email: { contains: search } },
        ],
      }),
    };

    const [drivers, total] = await Promise.all([
      db.driver.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          wallet: true,
          _count: {
            select: { deliveries: true },
          },
        },
      }),
      db.driver.count({ where }),
    ]);

    return apiSuccess({
      data: drivers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  });
}

// POST /api/drivers - Create driver
export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const {
      organizationId,
      firstName,
      lastName,
      phone,
      email,
      avatar,
      dateOfBirth,
      vehicleType = 'motorcycle',
      vehicleBrand,
      vehicleModel,
      vehiclePlate,
      vehicleColor,
    } = body;

    // Validation
    if (!organizationId || !firstName || !lastName || !phone) {
      return apiError('organisation, prénom, nom et téléphone sont requis');
    }

    // Validate phone
    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      return apiError('Numéro de téléphone inval');
    }

    // Check if driver exists
    const existing = await db.driver.findFirst({
      where: { organizationId, phone: phoneValidation.formatted || phone },
    });

    if (existing) {
      return apiError('Un livreur avec ce numéro existe déjà', 409);
    }

    // Create driver
    const driver = await db.driver.create({
      data: {
        organizationId,
        firstName,
        lastName,
        phone: phoneValidation.formatted || phone,
        email,
        avatar,
        dateOfBirth,
        vehicleType,
        vehicleBrand,
        vehicleModel,
        vehiclePlate,
        vehicleColor,
        isActive: true,
        isAvailable: false,
        status: 'offline',
      },
      include: {
        wallet: true,
      },
    });

    // Create driver wallet
    await db.driverWallet.create({
      data: {
        driverId: driver.id,
        balance: 0,
        pending: 0,
      },
    });

    return apiSuccess(driver, 'Livreur créé avec succès', 201);
  });
}

// PATCH /api/drivers - Update driver status/location
export async function PATCH(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const {
      id,
      isAvailable,
      isActive,
      status,
      currentLat,
      currentLng,
      currentAccuracy,
      currentZone,
      firstName,
      lastName,
      phone,
      email,
      vehicleType,
      vehicleBrand,
      vehicleModel,
      vehiclePlate,
      vehicleColor,
      isVerified,
    } = body;

    if (!id) {
      return apiError('ID est requis');
    }

    const driver = await db.driver.findUnique({ where: { id } });
    if (!driver) {
      return apiError('Livreur non trouvé', 404);
    }

    const updateData: Record<string, unknown> = {};

    // Handle availability
    if (isAvailable !== undefined) {
      updateData.isAvailable = isAvailable;
      updateData.status = isAvailable ? 'online' : 'offline';
    }

    // Handle active status
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    // Handle status directly
    if (status) {
      updateData.status = status;
    }

    // Handle location update
    if (currentLat !== undefined && currentLng !== undefined) {
      updateData.currentLat = currentLat;
      updateData.currentLng = currentLng;
      updateData.currentAccuracy = currentAccuracy;
      updateData.lastLocationAt = new Date();
      updateData.currentZone = currentZone;
    }

    // Handle profile updates
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) {
      const phoneValidation = validatePhoneNumber(phone);
      if (!phoneValidation.valid) {
        return apiError('Numéro de téléphone inval');
      }
      updateData.phone = phoneValidation.formatted || phone;
    }
    if (email !== undefined) updateData.email = email;
    if (vehicleType !== undefined) updateData.vehicleType = vehicleType;
    if (vehicleBrand !== undefined) updateData.vehicleBrand = vehicleBrand;
    if (vehicleModel !== undefined) updateData.vehicleModel = vehicleModel;
    if (vehiclePlate !== undefined) updateData.vehiclePlate = vehiclePlate;
    if (vehicleColor !== undefined) updateData.vehicleColor = vehicleColor;
    if (isVerified !== undefined) {
      updateData.isVerified = isVerified;
      if (isVerified) {
        updateData.verifiedAt = new Date();
      }
    }

    const updatedDriver = await db.driver.update({
      where: { id },
      data: updateData,
      include: { wallet: true },
    });

    // Create driver session if going online
    if (isAvailable === true && driver.status === 'offline') {
      await db.driverSession.create({
        data: {
          driverId: id,
          startedAt: new Date(),
        },
      });
    }

    // End driver session if going offline
    if (status === 'offline' && driver.status !== 'offline') {
      const activeSession = await db.driverSession.findFirst({
        where: { driverId: id, endedAt: null },
        orderBy: { startedAt: 'desc' },
      });

      if (activeSession) {
        await db.driverSession.update({
          where: { id: activeSession.id },
          data: { endedAt: new Date() },
        });
      }
    }

    return apiSuccess(updatedDriver, 'Livreur mis à jour');
  });
}

// DELETE /api/drivers - Delete driver
export async function DELETE(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('ID est requis');
    }

    const driver = await db.driver.findUnique({ where: { id } });
    if (!driver) {
      return apiError('Livreur non trouvé', 404);
    }

    await db.driver.update({
      where: { id },
      data: { isActive: false, status: 'suspended' },
    });

    return apiSuccess({ deleted: true }, 'Livreur désactivé');
  });
}
