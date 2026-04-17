// ============================================
// Employees API - List and Create
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler, getPagination } from '@/lib/api-responses';
import { withAdminAuth } from '@/lib/auth-middleware';
import { db } from '@/lib/db';
import { z } from 'zod';

// Role labels in French
const ROLE_LABELS: Record<string, string> = {
  manager: 'Directeur',
  chef: 'Chef Cuisinier',
  cook: 'Cuisinier',
  waiter: 'Serveur/Serveuse',
  cashier: 'Caissier(ère)',
  delivery_driver: 'Livreur',
  cleaner: 'Agent d\'entretien',
};

// Department labels
const DEPARTMENT_LABELS: Record<string, string> = {
  Direction: 'Direction',
  Cuisine: 'Cuisine',
  Service: 'Service',
  Livraison: 'Livraison',
  Maintenance: 'Maintenance',
};

// Validation schemas
const createEmployeeSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit avoir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit avoir au moins 2 caractères'),
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  email: z.string().email('Email invalide').optional().nullable(),
  role: z.enum(['manager', 'chef', 'cook', 'waiter', 'cashier', 'delivery_driver', 'cleaner']),
  department: z.string().optional(),
  hourlyRate: z.number().min(0, 'Le taux horaire doit être positif'),
  salary: z.number().min(0, 'Le salaire doit être positif').optional().nullable(),
  hireDate: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  emergencyContact: z.string().optional().nullable(),
  organizationId: z.string().optional(),
  restaurantId: z.string().optional().nullable(),
});

// GET - List employees with filters (admin only)
export const GET = withAdminAuth(async (request: NextRequest, user) => {
  return withErrorHandler<any>(async () => {
  const searchParams = request.nextUrl.searchParams;
  const organizationId = searchParams.get('organizationId') || '';
  const restaurantId = searchParams.get('restaurantId') || '';
  const role = searchParams.get('role');
  const status = searchParams.get('status');
  const department = searchParams.get('department');
  const search = searchParams.get('search');
  const { page, limit, skip } = getPagination(searchParams);

  // Real database query
  try {
    const where: any = { organizationId };

    if (role && role !== 'all') {
      where.role = role;
    }
    if (status && status !== 'all') {
      where.isActive = status === 'active';
    }
    if (restaurantId) {
      where.restaurantId = restaurantId;
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [staff, total] = await Promise.all([
      db.staffProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isActive: 'desc' }, { firstName: 'asc' }],
      }),
      db.staffProfile.count({ where }),
    ]);

    return apiSuccess({
      employees: staff.map(s => ({
        ...s,
        status: s.isActive ? 'active' : 'inactive',
        roleLabel: ROLE_LABELS[s.role] || s.role,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return apiError('Erreur lors de la récupération du personnel', 500);
  }
  });
});

// POST - Create new employee (admin only)
export const POST = withAdminAuth(async (request: NextRequest, user) => {
  return withErrorHandler<any>(async () => {
  const body = await request.json();
  const organizationId = body.organizationId || '';

  const validated = createEmployeeSchema.safeParse(body);
  if (!validated.success) {
    return apiError('Données invalides: ' + validated.error.errors[0].message, 400);
  }

  const data = validated.data;

  // Real database creation
  try {
    const employee = await db.staffProfile.create({
      data: {
        organizationId,
        restaurantId: data.restaurantId || null,
        userId: null,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email || null,
        role: data.role,
        hourlyRate: data.hourlyRate || 0,
        salary: data.salary || null,
        hireDate: data.hireDate ? new Date(data.hireDate) : new Date(),
        isActive: true,
        avatar: null,
      },
    });

    return apiSuccess({
      employee: { ...employee, status: 'active', roleLabel: ROLE_LABELS[data.role] || data.role },
      message: 'Employé créé avec succès',
    });
  } catch (error: any) {
    console.error('Error creating employee:', error);
    if (error.code === 'P2002') {
      return apiError('Un employé avec ce numéro de téléphone existe déjà', 400);
    }
    return apiError('Erreur lors de la création de l\'employé', 500);
  }
  });
});