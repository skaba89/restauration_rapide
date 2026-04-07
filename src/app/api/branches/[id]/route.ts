import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler, apiSuccess, apiError } from '@/lib/api-responses';
import { db } from '@/lib/db';

// Demo branch detail data
const DEMO_BRANCH_DETAILS: Record<string, any> = {
  'branch-001': {
    id: 'branch-001',
    name: 'KFM DELICE - Kaloum',
    slug: 'kfm-delice-kaloum',
    code: 'KAL-001',
    address: 'Avenue de la République, Kaloum',
    city: 'Kaloum',
    district: 'Centre-ville',
    phone: '+224 62 123 45 67',
    email: 'kaloum@kfm-delice.com',
    managerId: 'user-001',
    managerName: 'Amadou Touré',
    managerPhone: '+224 66 111 22 33',
    status: 'ACTIVE',
    isOpen: true,
    isBusy: false,
    isMain: true,
    isActive: true,
    deliveryRadius: 10,
    totalStaff: 8,
    rating: 4.8,
    openingDate: '2023-01-15T00:00:00.000Z',
    coordinates: { lat: 9.6412, lng: -13.5784 },
    settings: {
      openingHours: { open: '08:00', close: '22:00' },
      deliveryRadius: 10,
      deliveryFee: 1500,
      minOrderAmount: 5000,
      paymentMethods: ['cash', 'orange_money', 'mtn'],
      acceptsDelivery: true,
      acceptsTakeaway: true,
      acceptsDineIn: true,
      maxOrdersPerHour: 50,
      avgPrepTime: 15,
      autoAcceptOrders: false,
    },
    hours: [
      { dayOfWeek: 0, openTime: '10:00', closeTime: '20:00', isClosed: false },
      { dayOfWeek: 1, openTime: '08:00', closeTime: '22:00', isClosed: false },
      { dayOfWeek: 2, openTime: '08:00', closeTime: '22:00', isClosed: false },
      { dayOfWeek: 3, openTime: '08:00', closeTime: '22:00', isClosed: false },
      { dayOfWeek: 4, openTime: '08:00', closeTime: '22:00', isClosed: false },
      { dayOfWeek: 5, openTime: '08:00', closeTime: '23:00', isClosed: false },
      { dayOfWeek: 6, openTime: '08:00', closeTime: '23:00', isClosed: false },
    ],
    users: [
      { id: 'bu-001', userId: 'user-001', userName: 'Amadou Touré', role: 'manager' },
      { id: 'bu-002', userId: 'user-002', userName: 'Fatou Sylla', role: 'supervisor' },
      { id: 'bu-003', userId: 'user-003', userName: 'Ibrahim Diallo', role: 'staff' },
    ],
    stats: {
      todayRevenue: 2850000,
      todayOrders: 145,
      activeOrders: 12,
      avgOrderValue: 19655,
      monthlyRevenue: 85200000,
      monthlyOrders: 4350,
    },
  },
  'branch-002': {
    id: 'branch-002',
    name: 'KFM DELICE - Dixinn',
    slug: 'kfm-delice-dixinn',
    code: 'DIX-001',
    address: "Quartier Dixinn, Route de l'Aéroport",
    city: 'Dixinn',
    district: 'Dixinn',
    phone: '+224 62 234 56 78',
    email: 'dixinn@kfm-delice.com',
    managerId: 'user-004',
    managerName: 'Fatou Diallo',
    managerPhone: '+224 66 222 33 44',
    status: 'ACTIVE',
    isOpen: true,
    isBusy: true,
    isMain: false,
    isActive: true,
    deliveryRadius: 12,
    totalStaff: 12,
    rating: 4.6,
    openingDate: '2023-06-01T00:00:00.000Z',
    coordinates: { lat: 9.6705, lng: -13.6543 },
    settings: {
      openingHours: { open: '09:00', close: '23:00' },
      deliveryRadius: 12,
      deliveryFee: 2000,
      minOrderAmount: 5000,
      paymentMethods: ['cash', 'orange_money', 'mtn', 'wave'],
      acceptsDelivery: true,
      acceptsTakeaway: true,
      acceptsDineIn: true,
      maxOrdersPerHour: 60,
      avgPrepTime: 12,
      autoAcceptOrders: true,
    },
    hours: [
      { dayOfWeek: 0, openTime: '10:00', closeTime: '21:00', isClosed: false },
      { dayOfWeek: 1, openTime: '09:00', closeTime: '23:00', isClosed: false },
      { dayOfWeek: 2, openTime: '09:00', closeTime: '23:00', isClosed: false },
      { dayOfWeek: 3, openTime: '09:00', closeTime: '23:00', isClosed: false },
      { dayOfWeek: 4, openTime: '09:00', closeTime: '23:00', isClosed: false },
      { dayOfWeek: 5, openTime: '09:00', closeTime: '00:00', isClosed: false },
      { dayOfWeek: 6, openTime: '09:00', closeTime: '00:00', isClosed: false },
    ],
    users: [
      { id: 'bu-004', userId: 'user-004', userName: 'Fatou Diallo', role: 'manager' },
      { id: 'bu-005', userId: 'user-005', userName: 'Moussa Condé', role: 'supervisor' },
    ],
    stats: {
      todayRevenue: 4150000,
      todayOrders: 210,
      activeOrders: 18,
      avgOrderValue: 19762,
      monthlyRevenue: 124500000,
      monthlyOrders: 6300,
    },
  },
  'branch-003': {
    id: 'branch-003',
    name: 'KFM DELICE - Matam',
    slug: 'kfm-delice-matam',
    code: 'MAT-001',
    address: 'Marché de Matam, Rue Principale',
    city: 'Matam',
    district: 'Matam',
    phone: '+224 62 345 67 89',
    email: 'matam@kfm-delice.com',
    managerId: 'user-006',
    managerName: 'Ibrahim Koné',
    managerPhone: '+224 66 333 44 55',
    status: 'ACTIVE',
    isOpen: true,
    isBusy: false,
    isMain: false,
    isActive: true,
    deliveryRadius: 8,
    totalStaff: 6,
    rating: 4.7,
    openingDate: '2023-09-15T00:00:00.000Z',
    coordinates: { lat: 9.6892, lng: -13.6132 },
    settings: {
      openingHours: { open: '07:00', close: '21:00' },
      deliveryRadius: 8,
      deliveryFee: 1000,
      minOrderAmount: 3000,
      paymentMethods: ['cash', 'orange_money'],
      acceptsDelivery: true,
      acceptsTakeaway: true,
      acceptsDineIn: true,
      maxOrdersPerHour: 30,
      avgPrepTime: 18,
      autoAcceptOrders: false,
    },
    hours: [
      { dayOfWeek: 0, openTime: '08:00', closeTime: '20:00', isClosed: false },
      { dayOfWeek: 1, openTime: '07:00', closeTime: '21:00', isClosed: false },
      { dayOfWeek: 2, openTime: '07:00', closeTime: '21:00', isClosed: false },
      { dayOfWeek: 3, openTime: '07:00', closeTime: '21:00', isClosed: false },
      { dayOfWeek: 4, openTime: '07:00', closeTime: '21:00', isClosed: false },
      { dayOfWeek: 5, openTime: '07:00', closeTime: '22:00', isClosed: false },
      { dayOfWeek: 6, openTime: '07:00', closeTime: '22:00', isClosed: false },
    ],
    users: [
      { id: 'bu-006', userId: 'user-006', userName: 'Ibrahim Koné', role: 'manager' },
    ],
    stats: {
      todayRevenue: 1850000,
      todayOrders: 85,
      activeOrders: 8,
      avgOrderValue: 21765,
      monthlyRevenue: 55500000,
      monthlyOrders: 2550,
    },
  },
  'branch-004': {
    id: 'branch-004',
    name: 'KFM DELICE - Ratoma',
    slug: 'kfm-delice-ratoma',
    code: 'RAT-001',
    address: 'Quartier Ratoma, Centre Commercial',
    city: 'Ratoma',
    district: 'Ratoma',
    phone: '+224 62 456 78 90',
    email: 'ratoma@kfm-delice.com',
    managerId: 'user-007',
    managerName: 'Mariama Sylla',
    managerPhone: '+224 66 444 55 66',
    status: 'CONSTRUCTION',
    isOpen: false,
    isBusy: false,
    isMain: false,
    isActive: false,
    deliveryRadius: 10,
    totalStaff: 0,
    rating: 0,
    openingDate: '2025-03-01T00:00:00.000Z',
    coordinates: { lat: 9.7123, lng: -13.6875 },
    settings: {
      openingHours: { open: '08:00', close: '22:00' },
      deliveryRadius: 10,
      deliveryFee: 1500,
      minOrderAmount: 5000,
      paymentMethods: ['cash', 'orange_money', 'mtn'],
      acceptsDelivery: true,
      acceptsTakeaway: true,
      acceptsDineIn: true,
      maxOrdersPerHour: 40,
      avgPrepTime: 15,
      autoAcceptOrders: false,
    },
    hours: [],
    users: [],
    stats: {
      todayRevenue: 0,
      todayOrders: 0,
      activeOrders: 0,
      avgOrderValue: 0,
      monthlyRevenue: 0,
      monthlyOrders: 0,
    },
  },
};

// GET - Get branch by ID with full details
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const demo = searchParams.get('demo') === 'true';
  const organizationId = searchParams.get('organizationId');
  const includeSettings = searchParams.get('includeSettings') === 'true';
  const includeHours = searchParams.get('includeHours') === 'true';
  const includeUsers = searchParams.get('includeUsers') === 'true';

  // Demo mode
  if (demo || !organizationId) {
    const branch = DEMO_BRANCH_DETAILS[id];
    
    if (!branch) {
      return apiError('Succursale non trouvée', 404);
    }

    // Return only requested fields
    const response: Record<string, any> = { ...branch };
    if (!includeSettings) delete response.settings;
    if (!includeHours) delete response.hours;
    if (!includeUsers) delete response.users;

    return apiSuccess(response);
  }

  // Production mode - fetch from database
  try {
    const branch = await db.branch.findUnique({
      where: { id },
      include: {
        settings: includeSettings,
        hours: includeHours ? { orderBy: { dayOfWeek: 'asc' } } : false,
        users: includeUsers ? { include: { user: true } } : false,
      },
    });

    if (!branch) {
      return apiError('Succursale non trouvée', 404);
    }

    return apiSuccess(branch);
  } catch (error) {
    console.error('Database error:', error);
    return apiError('Erreur lors de la récupération de la succursale', 500);
  }
});

// PUT - Update branch
export const PUT = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();
  const { organizationId, demo = false, settings, hours, ...updates } = body;

  // Demo mode
  if (demo || !organizationId) {
    const branch = DEMO_BRANCH_DETAILS[id];
    
    if (!branch) {
      return apiError('Succursale non trouvée', 404);
    }

    // Update in-memory data
    Object.assign(branch, updates);
    if (settings) {
      branch.settings = { ...branch.settings, ...settings };
    }
    if (hours) {
      branch.hours = hours;
    }

    return apiSuccess(branch, 'Succursale mise à jour avec succès');
  }

  // Production mode
  try {
    // Check if branch exists
    const existing = await db.branch.findUnique({ where: { id } });
    if (!existing) {
      return apiError('Succursale non trouvée', 404);
    }

    // Update branch with settings and hours
    const branch = await db.branch.update({
      where: { id },
      data: {
        ...updates,
        ...(settings && {
          settings: {
            upsert: {
              create: settings,
              update: settings,
            },
          },
        }),
      },
      include: {
        settings: true,
        hours: true,
      },
    });

    // Update hours if provided
    if (hours && Array.isArray(hours)) {
      // Delete existing hours
      await db.branchHour.deleteMany({ where: { branchId: id } });
      
      // Create new hours
      await db.branchHour.createMany({
        data: hours.map((h: any) => ({
          branchId: id,
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: h.isClosed,
          breakStart: h.breakStart,
          breakEnd: h.breakEnd,
        })),
      });
    }

    return apiSuccess(branch, 'Succursale mise à jour avec succès');
  } catch (error) {
    console.error('Database error:', error);
    return apiError('Erreur lors de la mise à jour de la succursale', 500);
  }
});

// DELETE - Archive/deactivate branch
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organizationId');
  const demo = searchParams.get('demo') === 'true';

  // Demo mode
  if (demo || !organizationId) {
    const branch = DEMO_BRANCH_DETAILS[id];
    
    if (!branch) {
      return apiError('Succursale non trouvée', 404);
    }

    if (branch.isMain) {
      return apiError('Impossible de supprimer la succursale principale', 400);
    }

    branch.isActive = false;
    branch.status = 'CLOSED';
    branch.isOpen = false;

    return apiSuccess({ id }, 'Succursale archivée avec succès');
  }

  // Production mode
  try {
    const branch = await db.branch.findUnique({ where: { id } });
    
    if (!branch) {
      return apiError('Succursale non trouvée', 404);
    }

    if (branch.isMain) {
      return apiError('Impossible de supprimer la succursale principale', 400);
    }

    await db.branch.update({
      where: { id },
      data: {
        isActive: false,
        status: 'CLOSED',
        isOpen: false,
      },
    });

    return apiSuccess({ id }, 'Succursale archivée avec succès');
  } catch (error) {
    console.error('Database error:', error);
    return apiError('Erreur lors de l\'archivage de la succursale', 500);
  }
});
