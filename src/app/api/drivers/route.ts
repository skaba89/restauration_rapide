// Drivers API - Driver management with location update and demo support
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler, getPaginationParams } from '@/lib/api-responses';
import { validatePhoneNumber } from '@/lib/utils-helpers';

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