// ============================================
// Employee by ID API - Get, Update, Delete
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
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

// Validation schema for update
const updateEmployeeSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().min(8).optional(),
  email: z.string().email().nullable().optional(),
  role: z.enum(['manager', 'chef', 'cook', 'waiter', 'cashier', 'delivery_driver', 'cleaner']).optional(),
  department: z.string().optional(),
  hourlyRate: z.number().min(0).optional(),
  salary: z.number().min(0).nullable().optional(),
  hireDate: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  emergencyContact: z.string().nullable().optional(),
  status: z.enum(['active', 'on_leave', 'inactive']).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get employee by ID (admin only)
export const GET = withAdminAuth(async (request: NextRequest, user, context: any) => {
  return withErrorHandler<any>(async () => {
  const { params } = (context || {}) as RouteParams;
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const organizationId = searchParams.get('organizationId') || '';

  // Real database query
  try {
    const employee = await db.staffProfile.findUnique({
      where: { id },
      include: {
        ordersHandled: {
          where: {
            createdAt: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
            },
          },
          select: {
            id: true,
            total: true,
            createdAt: true,
          },
        },
        tables: {
          select: {
            id: true,
            number: true,
            status: true,
          },
        },
      },
    });

    if (!employee) {
      return apiError('Employé non trouvé', 404);
    }

    const hireDate = employee.hireDate || new Date();
    const now = new Date();
    const monthsEmployed = (now.getFullYear() - hireDate.getFullYear()) * 12 + (now.getMonth() - hireDate.getMonth());

    return apiSuccess({
      employee: {
        ...employee,
        status: employee.isActive ? 'active' : 'inactive',
        roleLabel: ROLE_LABELS[employee.role] || employee.role,
        monthsEmployed,
        hireDateFormatted: hireDate.toLocaleDateString('fr-FR'),
      },
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    return apiError('Erreur lors de la récupération de l\'employé', 500);
  }
  });
});

// PUT - Update employee (admin only)
export const PUT = withAdminAuth(async (request: NextRequest, user, context: any) => {
  return withErrorHandler<any>(async () => {
  const { params } = (context || {}) as RouteParams;
  const { id } = await params;
  const body = await request.json();
  const organizationId = body.organizationId || '';

  const validated = updateEmployeeSchema.safeParse(body);
  if (!validated.success) {
    return apiError('Données invalides: ' + validated.error.errors[0].message, 400);
  }

  const data = validated.data;

  // Real database update
  try {
    const employee = await db.staffProfile.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        role: data.role,
        hourlyRate: data.hourlyRate,
        salary: data.salary,
        hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
        isActive: data.status === 'active',
      },
    });

    return apiSuccess({
      employee: {
        ...employee,
        status: employee.isActive ? 'active' : 'inactive',
        roleLabel: ROLE_LABELS[employee.role] || employee.role,
      },
      message: 'Employé mis à jour avec succès',
    });
  } catch (error: any) {
    console.error('Error updating employee:', error);
    if (error.code === 'P2025') {
      return apiError('Employé non trouvé', 404);
    }
    return apiError('Erreur lors de la mise à jour de l\'employé', 500);
  }
  });
});

// DELETE - Delete employee (admin only)
export const DELETE = withAdminAuth(async (request: NextRequest, user, context: any) => {
  return withErrorHandler<any>(async () => {
  const { params } = (context || {}) as RouteParams;
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const organizationId = searchParams.get('organizationId') || '';

  // Real database deletion
  try {
    await db.staffProfile.delete({ where: { id } });
    return apiSuccess({ message: 'Employé supprimé avec succès' });
  } catch (error: any) {
    console.error('Error deleting employee:', error);
    if (error.code === 'P2025') {
      return apiError('Employé non trouvé', 404);
    }
    return apiError('Erreur lors de la suppression de l\'employé', 500);
  }
  });
});