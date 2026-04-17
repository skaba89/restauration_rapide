// ============================================
// Employee by ID API - Get, Update, Delete
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { withAdminAuth } from '@/lib/auth-middleware';
import { db } from '@/lib/db';
import { z } from 'zod';

// Demo staff data for KFM DELICE
const DEMO_STAFF: Record<string, any> = {
  '1': { id: '1', firstName: 'Amadou', lastName: 'Diallo', phone: '+224 62 123 45 67', email: 'amadou@kfmdelice.com', role: 'manager', hourlyRate: 15000, salary: 5000000, hireDate: new Date('2022-01-15'), status: 'active', avatar: null, address: 'Conakry, Kaloum', emergencyContact: 'Fatou Diallo - +224 62 111 11 11', department: 'Direction' },
  '2': { id: '2', firstName: 'Fatou', lastName: 'Sylla', phone: '+224 62 234 56 78', email: 'fatou@kfmdelice.com', role: 'chef', hourlyRate: 12000, salary: 4000000, hireDate: new Date('2022-03-01'), status: 'active', avatar: null, address: 'Conakry, Dixinn', emergencyContact: 'Ibrahima Sylla - +224 62 222 22 22', department: 'Cuisine' },
  '3': { id: '3', firstName: 'Ibrahim', lastName: 'Keita', phone: '+224 62 345 67 89', email: 'ibrahim@kfmdelice.com', role: 'cook', hourlyRate: 8000, salary: 2500000, hireDate: new Date('2023-01-10'), status: 'active', avatar: null, address: 'Conakry, Matam', emergencyContact: 'Aminata Keita - +224 62 333 33 33', department: 'Cuisine' },
  '4': { id: '4', firstName: 'Marie', lastName: 'Koulibaly', phone: '+224 62 456 78 90', email: 'marie@kfmdelice.com', role: 'waiter', hourlyRate: 5000, salary: 1500000, hireDate: new Date('2023-06-15'), status: 'active', avatar: null, address: 'Conakry, Ratoma', emergencyContact: 'Jean Koulibaly - +224 62 444 44 44', department: 'Service' },
  '5': { id: '5', firstName: 'Moussa', lastName: 'Camara', phone: '+224 62 567 89 01', email: 'moussa@kfmdelice.com', role: 'delivery_driver', hourlyRate: 5000, salary: 1200000, hireDate: new Date('2023-09-01'), status: 'active', avatar: null, address: 'Conakry, Matoto', emergencyContact: 'Aissata Camara - +224 62 555 55 55', department: 'Livraison' },
  '6': { id: '6', firstName: 'Aissatou', lastName: 'Traore', phone: '+224 62 678 90 12', email: 'aissatou@kfmdelice.com', role: 'cashier', hourlyRate: 6000, salary: 1800000, hireDate: new Date('2023-04-20'), status: 'active', avatar: null, address: 'Conakry, Kaloum', emergencyContact: 'Mamadou Traore - +224 62 666 66 66', department: 'Service' },
  '7': { id: '7', firstName: 'Sekou', lastName: 'Konate', phone: '+224 62 789 01 23', email: 'sekou@kfmdelice.com', role: 'cook', hourlyRate: 7500, salary: 2200000, hireDate: new Date('2023-11-05'), status: 'on_leave', avatar: null, address: 'Conakry, Dixinn', emergencyContact: 'Fatoumata Konate - +224 62 777 77 77', department: 'Cuisine' },
  '8': { id: '8', firstName: 'Fanta', lastName: 'Diarra', phone: '+224 62 890 12 34', email: 'fanta@kfmdelice.com', role: 'waiter', hourlyRate: 5000, salary: 1500000, hireDate: new Date('2024-01-15'), status: 'active', avatar: null, address: 'Conakry, Matam', emergencyContact: 'Moussa Diarra - +224 62 888 88 88', department: 'Service' },
  '9': { id: '9', firstName: 'Oumar', lastName: 'Bah', phone: '+224 62 901 23 45', email: 'oumar@kfmdelice.com', role: 'cleaner', hourlyRate: 4000, salary: 1000000, hireDate: new Date('2024-02-01'), status: 'active', avatar: null, address: 'Conakry, Ratoma', emergencyContact: 'Mariama Bah - +224 62 999 99 99', department: 'Maintenance' },
  '10': { id: '10', firstName: 'Adama', lastName: 'Sow', phone: '+224 62 012 34 56', email: 'adama@kfmdelice.com', role: 'delivery_driver', hourlyRate: 5000, salary: 1200000, hireDate: new Date('2024-03-10'), status: 'inactive', avatar: null, address: 'Conakry, Matoto', emergencyContact: 'Ibrahima Sow - +224 62 000 00 00', department: 'Livraison' },
};

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
  const demo = searchParams.get('demo') === 'true';
  const organizationId = searchParams.get('organizationId') || '';

  // Demo mode
  if (demo || !organizationId) {
    const employee = DEMO_STAFF[id];
    if (!employee) {
      return apiError('Employé non trouvé', 404);
    }

    // Calculate additional info
    const hireDate = new Date(employee.hireDate);
    const now = new Date();
    const monthsEmployed = (now.getFullYear() - hireDate.getFullYear()) * 12 + (now.getMonth() - hireDate.getMonth());

    return apiSuccess({
      employee: {
        ...employee,
        roleLabel: ROLE_LABELS[employee.role] || employee.role,
        monthsEmployed,
        hireDateFormatted: hireDate.toLocaleDateString('fr-FR'),
      },
    });
  }

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
  const demo = body.demo === true;
  const organizationId = body.organizationId || '';

  const validated = updateEmployeeSchema.safeParse(body);
  if (!validated.success) {
    return apiError('Données invalides: ' + validated.error.errors[0].message, 400);
  }

  const data = validated.data;

  // Demo mode
  if (demo || !organizationId) {
    const employee = DEMO_STAFF[id];
    if (!employee) {
      return apiError('Employé non trouvé', 404);
    }

    const updatedEmployee = {
      ...employee,
      ...data,
      hireDate: data.hireDate ? new Date(data.hireDate) : employee.hireDate,
      roleLabel: data.role ? ROLE_LABELS[data.role] : ROLE_LABELS[employee.role],
    };

    return apiSuccess({
      employee: updatedEmployee,
      message: 'Employé mis à jour (mode démo)',
    });
  }

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
  const demo = searchParams.get('demo') === 'true';
  const organizationId = searchParams.get('organizationId') || '';

  // Demo mode
  if (demo || !organizationId) {
    const employee = DEMO_STAFF[id];
    if (!employee) {
      return apiError('Employé non trouvé', 404);
    }
    return apiSuccess({ message: 'Employé supprimé (mode démo)' });
  }

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
