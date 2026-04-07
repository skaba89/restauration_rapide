// ============================================
// Employees API - List and Create
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler, getPagination } from '@/lib/api-responses';
import { db } from '@/lib/db';
import { z } from 'zod';

// Demo staff data for KFM DELICE
const DEMO_STAFF = [
  { id: '1', firstName: 'Amadou', lastName: 'Diallo', phone: '+224 62 123 45 67', email: 'amadou@kfmdelice.com', role: 'manager', hourlyRate: 15000, salary: 5000000, hireDate: new Date('2022-01-15'), status: 'active', avatar: null, address: 'Conakry, Kaloum', emergencyContact: 'Fatou Diallo - +224 62 111 11 11', department: 'Direction' },
  { id: '2', firstName: 'Fatou', lastName: 'Sylla', phone: '+224 62 234 56 78', email: 'fatou@kfmdelice.com', role: 'chef', hourlyRate: 12000, salary: 4000000, hireDate: new Date('2022-03-01'), status: 'active', avatar: null, address: 'Conakry, Dixinn', emergencyContact: 'Ibrahima Sylla - +224 62 222 22 22', department: 'Cuisine' },
  { id: '3', firstName: 'Ibrahim', lastName: 'Keita', phone: '+224 62 345 67 89', email: 'ibrahim@kfmdelice.com', role: 'cook', hourlyRate: 8000, salary: 2500000, hireDate: new Date('2023-01-10'), status: 'active', avatar: null, address: 'Conakry, Matam', emergencyContact: 'Aminata Keita - +224 62 333 33 33', department: 'Cuisine' },
  { id: '4', firstName: 'Marie', lastName: 'Koulibaly', phone: '+224 62 456 78 90', email: 'marie@kfmdelice.com', role: 'waiter', hourlyRate: 5000, salary: 1500000, hireDate: new Date('2023-06-15'), status: 'active', avatar: null, address: 'Conakry, Ratoma', emergencyContact: 'Jean Koulibaly - +224 62 444 44 44', department: 'Service' },
  { id: '5', firstName: 'Moussa', lastName: 'Camara', phone: '+224 62 567 89 01', email: 'moussa@kfmdelice.com', role: 'delivery_driver', hourlyRate: 5000, salary: 1200000, hireDate: new Date('2023-09-01'), status: 'active', avatar: null, address: 'Conakry, Matoto', emergencyContact: 'Aissata Camara - +224 62 555 55 55', department: 'Livraison' },
  { id: '6', firstName: 'Aissatou', lastName: 'Traore', phone: '+224 62 678 90 12', email: 'aissatou@kfmdelice.com', role: 'cashier', hourlyRate: 6000, salary: 1800000, hireDate: new Date('2023-04-20'), status: 'active', avatar: null, address: 'Conakry, Kaloum', emergencyContact: 'Mamadou Traore - +224 62 666 66 66', department: 'Service' },
  { id: '7', firstName: 'Sekou', lastName: 'Konate', phone: '+224 62 789 01 23', email: 'sekou@kfmdelice.com', role: 'cook', hourlyRate: 7500, salary: 2200000, hireDate: new Date('2023-11-05'), status: 'on_leave', avatar: null, address: 'Conakry, Dixinn', emergencyContact: 'Fatoumata Konate - +224 62 777 77 77', department: 'Cuisine' },
  { id: '8', firstName: 'Fanta', lastName: 'Diarra', phone: '+224 62 890 12 34', email: 'fanta@kfmdelice.com', role: 'waiter', hourlyRate: 5000, salary: 1500000, hireDate: new Date('2024-01-15'), status: 'active', avatar: null, address: 'Conakry, Matam', emergencyContact: 'Moussa Diarra - +224 62 888 88 88', department: 'Service' },
  { id: '9', firstName: 'Oumar', lastName: 'Bah', phone: '+224 62 901 23 45', email: 'oumar@kfmdelice.com', role: 'cleaner', hourlyRate: 4000, salary: 1000000, hireDate: new Date('2024-02-01'), status: 'active', avatar: null, address: 'Conakry, Ratoma', emergencyContact: 'Mariama Bah - +224 62 999 99 99', department: 'Maintenance' },
  { id: '10', firstName: 'Adama', lastName: 'Sow', phone: '+224 62 012 34 56', email: 'adama@kfmdelice.com', role: 'delivery_driver', hourlyRate: 5000, salary: 1200000, hireDate: new Date('2024-03-10'), status: 'inactive', avatar: null, address: 'Conakry, Matoto', emergencyContact: 'Ibrahima Sow - +224 62 000 00 00', department: 'Livraison' },
];

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

// GET - List employees with filters
export const GET = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const demo = searchParams.get('demo') === 'true';
  const organizationId = searchParams.get('organizationId') || '';
  const restaurantId = searchParams.get('restaurantId') || '';
  const role = searchParams.get('role');
  const status = searchParams.get('status');
  const department = searchParams.get('department');
  const search = searchParams.get('search');
  const { page, limit, skip } = getPagination(searchParams);

  // Return demo data
  if (demo || !organizationId) {
    let filteredStaff = [...DEMO_STAFF];

    if (role && role !== 'all') {
      filteredStaff = filteredStaff.filter(s => s.role === role);
    }
    if (status && status !== 'all') {
      filteredStaff = filteredStaff.filter(s => s.status === status);
    }
    if (department && department !== 'all') {
      filteredStaff = filteredStaff.filter(s => s.department === department);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filteredStaff = filteredStaff.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchLower) ||
        s.phone.includes(search) ||
        s.email?.toLowerCase().includes(searchLower)
      );
    }

    const total = filteredStaff.length;
    const paginatedStaff = filteredStaff.slice(skip, skip + limit);

    // Calculate stats
    const stats = {
      total: filteredStaff.length,
      active: filteredStaff.filter(s => s.status === 'active').length,
      onLeave: filteredStaff.filter(s => s.status === 'on_leave').length,
      inactive: filteredStaff.filter(s => s.status === 'inactive').length,
      byDepartment: {
        direction: filteredStaff.filter(s => s.department === 'Direction').length,
        cuisine: filteredStaff.filter(s => s.department === 'Cuisine').length,
        service: filteredStaff.filter(s => s.department === 'Service').length,
        livraison: filteredStaff.filter(s => s.department === 'Livraison').length,
        maintenance: filteredStaff.filter(s => s.department === 'Maintenance').length,
      },
      byRole: {
        manager: filteredStaff.filter(s => s.role === 'manager').length,
        chef: filteredStaff.filter(s => s.role === 'chef').length,
        cook: filteredStaff.filter(s => s.role === 'cook').length,
        waiter: filteredStaff.filter(s => s.role === 'waiter').length,
        cashier: filteredStaff.filter(s => s.role === 'cashier').length,
        delivery_driver: filteredStaff.filter(s => s.role === 'delivery_driver').length,
        cleaner: filteredStaff.filter(s => s.role === 'cleaner').length,
      },
    };

    return apiSuccess({
      employees: paginatedStaff.map(s => ({
        ...s,
        roleLabel: ROLE_LABELS[s.role] || s.role,
      })),
      stats,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }

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

// POST - Create new employee
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const demo = body.demo === true;
  const organizationId = body.organizationId || '';

  const validated = createEmployeeSchema.safeParse(body);
  if (!validated.success) {
    return apiError('Données invalides: ' + validated.error.errors[0].message, 400);
  }

  const data = validated.data;

  // Demo mode
  if (demo || !organizationId) {
    const newEmployee = {
      id: `${Date.now()}`,
      ...data,
      status: 'active',
      hireDate: data.hireDate ? new Date(data.hireDate) : new Date(),
      avatar: null,
    };
    return apiSuccess({
      employee: { ...newEmployee, roleLabel: ROLE_LABELS[data.role] || data.role },
      message: 'Employé créé (mode démo)',
    });
  }

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
