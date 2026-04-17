// Reservations API - Reservation system with availability check and demo support
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler, getPaginationParams } from '@/lib/api-responses';

// GET /api/reservations - List reservations
export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const restaurantId = searchParams.get('restaurantId');
    const organizationId = searchParams.get('organizationId');
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    const date = searchParams.get('date');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const search = searchParams.get('search');

    const where = {
      ...(restaurantId && { restaurantId }),
      ...(organizationId && { restaurant: { organizationId } }),
      ...(status && { status: status as string }),
      ...(customerId && { customerId }),
      ...(date && { date: new Date(date) }),
      ...(dateFrom || dateTo
        ? {
            date: {
              ...(dateFrom && { gte: new Date(dateFrom) }),
              ...(dateTo && { lte: new Date(dateTo) }),
            },
          }
        : {}),
      ...(search && {
        OR: [
          { guestName: { contains: search } },
          { guestPhone: { contains: search } },
          { guestEmail: { contains: search } },
        ],
      }),
    };

    const [reservations, total] = await Promise.all([
      db.reservation.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ date: 'asc' }, { time: 'asc' }],
        include: {
          customer: true,
          tables: {
            include: {
              table: true,
            },
          },
          restaurant: {
            select: { id: true, name: true, address: true, phone: true },
          },
        },
      }),
      db.reservation.count({ where }),
    ]);

    return apiSuccess({
      data: reservations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  });
}

// POST /api/reservations - Create reservation with availability check
export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const {
      restaurantId,
      customerId,
      guestName,
      guestPhone,
      guestEmail,
      partySize,
      date,
      time,
      duration = 120,
      tableIds,
      source = 'web',
      occasion,
      specialRequests,
      dietaryNotes,
      depositAmount,
    } = body;

    // Validation
    if (!restaurantId || !guestName || !guestPhone || !partySize || !date || !time) {
      return apiError('restaurant, nom, téléphone, nombre de personnes, date et heure sont requis');
    }

    const reservationDate = new Date(date);

    // Check restaurant exists and accepts reservations
    const restaurant = await db.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        tables: { where: { isActive: true } },
        hours: true,
      },
    });

    if (!restaurant) {
      return apiError('Restaurant non trouvé', 404);
    }

    if (!restaurant.acceptsReservations) {
      return apiError('Ce restaurant n\'accepte pas les réservations', 400);
    }

    // Check if restaurant is open on this day/time
    const dayOfWeek = reservationDate.getDay();
    const hour = await db.restaurantHour.findUnique({
      where: { restaurantId_dayOfWeek: { restaurantId, dayOfWeek } },
    });

    if (hour?.isClosed) {
      return apiError('Le restaurant est fermé ce jour', 400);
    }

    // Check table availability if tableIds provided
    if (tableIds && tableIds.length > 0) {
      const existingReservations = await db.reservation.findMany({
        where: {
          restaurantId,
          date: reservationDate,
          status: { in: ['PENDING', 'CONFIRMED', 'SEATED'] },
          tables: { some: { tableId: { in: tableIds } } },
        },
      });

      if (existingReservations.length > 0) {
        return apiError('Certaines tables ne sont pas disponibles pour ce créneau', 409);
      }
    }

    // Create reservation
    const reservation = await db.reservation.create({
      data: {
        restaurantId,
        customerId,
        guestName,
        guestPhone,
        guestEmail,
        partySize,
        date: reservationDate,
        time,
        duration,
        source,
        occasion,
        specialRequests,
        dietaryNotes,
        depositAmount,
        status: 'PENDING',
        tables: tableIds ? {
          create: tableIds.map((tableId: string) => ({ tableId })),
        } : undefined,
      },
      include: {
        tables: { include: { table: true } },
        restaurant: { select: { name: true, phone: true, address: true } },
      },
    });

    return apiSuccess(reservation, 'Réservation créée avec succès', 201);
  });
}

// PATCH /api/reservations - Update reservation status
export async function PATCH(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const {
      id,
      status,
      partySize,
      date,
      time,
      duration,
      tableIds,
      internalNotes,
      cancellationReason,
    } = body;

    if (!id) {
      return apiError('ID est requis');
    }

    const reservation = await db.reservation.findUnique({
      where: { id },
      include: { tables: true },
    });

    if (!reservation) {
      return apiError('Réservation non trouvée', 404);
    }

    const updateData: Record<string, unknown> = {
      ...(status && { status }),
      ...(partySize && { partySize }),
      ...(date && { date: new Date(date) }),
      ...(time && { time }),
      ...(duration && { duration }),
      ...(internalNotes !== undefined && { internalNotes }),
      ...(cancellationReason && { cancellationReason }),
    };

    // Update timestamps based on status
    if (status === 'CONFIRMED') updateData.confirmedAt = new Date();
    if (status === 'SEATED') updateData.seatedAt = new Date();
    if (status === 'COMPLETED') updateData.completedAt = new Date();
    if (status === 'CANCELLED') updateData.cancelledAt = new Date();
    if (status === 'NO_SHOW') updateData.noShowAt = new Date();

    // Update tables if provided
    if (tableIds) {
      // Remove existing table associations
      await db.reservationTable.deleteMany({ where: { reservationId: id } });
      // Add new table associations
      updateData.tables = {
        create: tableIds.map((tableId: string) => ({ tableId })),
      };
    }

    const updatedReservation = await db.reservation.update({
      where: { id },
      data: updateData,
      include: {
        tables: { include: { table: true } },
        customer: true,
      },
    });

    // Update table status if seated
    if (status === 'SEATED' && tableIds) {
      await db.table.updateMany({
        where: { id: { in: tableIds } },
        data: { status: 'OCCUPIED', currentPartySize: partySize || reservation.partySize },
      });
    }

    // Update table status if completed/cancelled
    if ((status === 'COMPLETED' || status === 'CANCELLED') && reservation.tables.length > 0) {
      await db.table.updateMany({
        where: { id: { in: reservation.tables.map(t => t.tableId) } },
        data: { status: 'AVAILABLE', currentPartySize: null },
      });
    }

    return apiSuccess(updatedReservation, 'Réservation mise à jour');
  });
}

// DELETE /api/reservations - Cancel reservation
export async function DELETE(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const reason = searchParams.get('reason');

    if (!id) {
      return apiError('ID est requis');
    }

    const reservation = await db.reservation.findUnique({
      where: { id },
      include: { tables: true },
    });

    if (!reservation) {
      return apiError('Réservation non trouvée', 404);
    }

    await db.reservation.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
    });

    // Free up tables
    if (reservation.tables.length > 0) {
      await db.table.updateMany({
        where: { id: { in: reservation.tables.map(t => t.tableId) } },
        data: { status: 'AVAILABLE', currentPartySize: null },
      });
    }

    return apiSuccess({ cancelled: true }, 'Réservation annulée');
  });
}