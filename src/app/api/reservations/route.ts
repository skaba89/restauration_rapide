// Reservations API - Reservation system with availability check and demo support
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler, getPaginationParams } from '@/lib/api-responses';

// Demo reservations data
const DEMO_RESERVATIONS = [
  {
    id: 'demo-res-1',
    restaurantId: 'demo-rest-1',
    guestName: 'Adjoua Marie',
    guestPhone: '+2250700000001',
    guestEmail: 'adjoua@email.com',
    partySize: 4,
    date: new Date().toISOString(),
    time: '12:30',
    duration: 120,
    status: 'CONFIRMED',
    source: 'web',
    occasion: 'birthday',
    specialRequests: 'Table près de la fenêtre',
    confirmedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    tables: [{ table: { id: 't1', number: 'T5', capacity: 4 } }],
  },
  {
    id: 'demo-res-2',
    restaurantId: 'demo-rest-1',
    guestName: 'Kouadio Jean',
    guestPhone: '+2250700000002',
    guestEmail: 'kouadio@email.com',
    partySize: 2,
    date: new Date().toISOString(),
    time: '13:00',
    duration: 90,
    status: 'PENDING',
    source: 'phone',
    specialRequests: 'Anniversaire de mariage',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    tables: [],
  },
  {
    id: 'demo-res-3',
    restaurantId: 'demo-rest-1',
    guestName: 'Brou Ismaël',
    guestPhone: '+2250700000003',
    guestEmail: 'brou@email.com',
    partySize: 6,
    date: new Date().toISOString(),
    time: '19:30',
    duration: 120,
    status: 'CONFIRMED',
    source: 'app',
    occasion: 'business',
    specialRequests: 'Espace calme pour réunion',
    confirmedAt: new Date(Date.now() - 30 * 60 * 1000),
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    tables: [{ table: { id: 't2', number: 'T12', capacity: 8 } }],
  },
  {
    id: 'demo-res-4',
    restaurantId: 'demo-rest-1',
    guestName: 'Yao Sébastien',
    guestPhone: '+2250700000004',
    partySize: 3,
    date: new Date().toISOString(),
    time: '20:00',
    duration: 90,
    status: 'SEATED',
    source: 'walkin',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    seatedAt: new Date(Date.now() - 30 * 60 * 1000),
    tables: [{ table: { id: 't3', number: 'T8', capacity: 4 } }],
  },
  {
    id: 'demo-res-5',
    restaurantId: 'demo-rest-1',
    guestName: 'Konan Aya',
    guestPhone: '+2250700000005',
    partySize: 5,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    time: '12:00',
    duration: 120,
    status: 'COMPLETED',
    source: 'web',
    occasion: 'birthday',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
    tables: [{ table: { id: 't4', number: 'T3', capacity: 6 } }],
  },
  {
    id: 'demo-res-6',
    restaurantId: 'demo-rest-1',
    guestName: 'Diallo Fatim',
    guestPhone: '+2250700000006',
    guestEmail: 'fatim@email.com',
    partySize: 2,
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    time: '19:00',
    duration: 90,
    status: 'CONFIRMED',
    source: 'web',
    confirmedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    tables: [{ table: { id: 't5', number: 'T7', capacity: 2 } }],
  },
  {
    id: 'demo-res-7',
    restaurantId: 'demo-rest-1',
    guestName: 'Touré Amadou',
    guestPhone: '+2250700000007',
    guestEmail: 'toure@email.com',
    partySize: 8,
    date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    time: '20:30',
    duration: 150,
    status: 'PENDING',
    source: 'phone',
    occasion: 'anniversary',
    specialRequests: 'Gâteau d\'anniversaire si possible',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    tables: [],
  },
  {
    id: 'demo-res-8',
    restaurantId: 'demo-rest-1',
    guestName: 'Coulibaly Ibrahim',
    guestPhone: '+2250700000008',
    partySize: 4,
    date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    time: '13:30',
    duration: 90,
    status: 'CANCELLED',
    source: 'app',
    cancellationReason: 'Client malade',
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
    cancelledAt: new Date(Date.now() - 50 * 60 * 60 * 1000),
    tables: [],
  },
  {
    id: 'demo-res-9',
    restaurantId: 'demo-rest-1',
    guestName: 'Sylla Ramata',
    guestPhone: '+2250700000009',
    guestEmail: 'ramata@email.com',
    partySize: 2,
    date: new Date().toISOString(),
    time: '14:00',
    duration: 60,
    status: 'NO_SHOW',
    source: 'web',
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
    noShowAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    tables: [],
  },
  {
    id: 'demo-res-10',
    restaurantId: 'demo-rest-1',
    guestName: 'Koffi Emmanuel',
    guestPhone: '+2250700000010',
    partySize: 3,
    date: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    time: '19:30',
    duration: 120,
    status: 'PENDING',
    source: 'web',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    tables: [],
  },
];

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
    const demo = searchParams.get('demo');

    // Return demo data if demo mode or no organization/restaurant specified
    if (demo === 'true' || (!restaurantId && !organizationId)) {
      let filteredReservations = [...DEMO_RESERVATIONS];
      
      // Apply filters
      if (status) {
        filteredReservations = filteredReservations.filter(r => r.status === status);
      }
      if (customerId) {
        filteredReservations = filteredReservations.filter(r => r.customerId === customerId);
      }
      if (restaurantId) {
        filteredReservations = filteredReservations.filter(r => r.restaurantId === restaurantId);
      }
      if (date) {
        filteredReservations = filteredReservations.filter(r => 
          new Date(r.date).toDateString() === new Date(date).toDateString()
        );
      }
      if (dateFrom) {
        filteredReservations = filteredReservations.filter(r => new Date(r.date) >= new Date(dateFrom));
      }
      if (dateTo) {
        filteredReservations = filteredReservations.filter(r => new Date(r.date) <= new Date(dateTo));
      }
      if (search) {
        const searchLower = search.toLowerCase();
        filteredReservations = filteredReservations.filter(r => 
          r.guestName.toLowerCase().includes(searchLower) ||
          r.guestPhone.includes(search) ||
          r.guestEmail?.toLowerCase().includes(searchLower)
        );
      }

      const total = filteredReservations.length;
      const paginatedReservations = filteredReservations.slice(skip, skip + limit);

      return apiSuccess({
        data: paginatedReservations.map(r => ({
          ...r,
          restaurant: { id: 'demo-rest-1', name: 'Restaurant Chez Maman', address: 'Cocovy, Abidjan', phone: '+2250700000001' },
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }

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
