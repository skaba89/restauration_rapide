// Customers API - Customer CRM with demo support
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler, getPaginationParams } from '@/lib/api-responses';
import { validatePhoneNumber } from '@/lib/utils-helpers';

// Demo customers data
const DEMO_CUSTOMERS = [
  {
    id: 'demo-cust-1',
    firstName: 'Kouamé',
    lastName: 'Jean',
    phone: '+2250700000001',
    email: 'kouame@email.com',
    totalOrders: 15,
    totalSpent: 125000,
    avgOrderValue: 8333,
    loyaltyPoints: 125,
    loyaltyLevel: 2,
    isVip: false,
    lastOrderAt: new Date(),
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'demo-cust-2',
    firstName: 'Aya',
    lastName: 'Marie',
    phone: '+2250700000002',
    email: 'aya@email.com',
    totalOrders: 28,
    totalSpent: 245000,
    avgOrderValue: 8750,
    loyaltyPoints: 245,
    loyaltyLevel: 3,
    isVip: true,
    lastOrderAt: new Date(Date.now() - 5 * 60 * 1000),
    createdAt: new Date('2023-08-20'),
  },
  {
    id: 'demo-cust-3',
    firstName: 'Koné',
    lastName: 'Ibrahim',
    phone: '+2250700000003',
    email: 'kone@email.com',
    totalOrders: 8,
    totalSpent: 68000,
    avgOrderValue: 8500,
    loyaltyPoints: 68,
    loyaltyLevel: 1,
    isVip: false,
    lastOrderAt: new Date(Date.now() - 15 * 60 * 1000),
    createdAt: new Date('2024-02-10'),
  },
  {
    id: 'demo-cust-4',
    firstName: 'Diallo',
    lastName: 'Fatou',
    phone: '+2250700000004',
    email: 'diallo@email.com',
    totalOrders: 42,
    totalSpent: 385000,
    avgOrderValue: 9167,
    loyaltyPoints: 385,
    loyaltyLevel: 4,
    isVip: true,
    lastOrderAt: new Date(Date.now() - 30 * 60 * 1000),
    createdAt: new Date('2023-05-15'),
  },
  {
    id: 'demo-cust-5',
    firstName: 'Touré',
    lastName: 'Amadou',
    phone: '+2250700000005',
    email: 'toure@email.com',
    totalOrders: 12,
    totalSpent: 98000,
    avgOrderValue: 8167,
    loyaltyPoints: 98,
    loyaltyLevel: 1,
    isVip: false,
    lastOrderAt: new Date(Date.now() - 45 * 60 * 1000),
    createdAt: new Date('2024-01-20'),
  },
  {
    id: 'demo-cust-6',
    firstName: 'Bamba',
    lastName: 'Ismaël',
    phone: '+2250700000006',
    email: 'bamba@email.com',
    totalOrders: 5,
    totalSpent: 35000,
    avgOrderValue: 7000,
    loyaltyPoints: 35,
    loyaltyLevel: 1,
    isVip: false,
    lastOrderAt: new Date(Date.now() - 10 * 60 * 1000),
    createdAt: new Date('2024-03-01'),
  },
  {
    id: 'demo-cust-7',
    firstName: 'Koffi',
    lastName: 'Emmanuel',
    phone: '+2250700000007',
    email: 'koffi@email.com',
    totalOrders: 3,
    totalSpent: 18500,
    avgOrderValue: 6167,
    loyaltyPoints: 18,
    loyaltyLevel: 1,
    isVip: false,
    lastOrderAt: new Date(Date.now() - 2 * 60 * 1000),
    createdAt: new Date('2024-03-10'),
  },
  {
    id: 'demo-cust-8',
    firstName: 'Adjoua',
    lastName: 'Rose',
    phone: '+2250700000008',
    email: 'adjoua@email.com',
    totalOrders: 35,
    totalSpent: 312000,
    avgOrderValue: 8914,
    loyaltyPoints: 312,
    loyaltyLevel: 4,
    isVip: true,
    lastOrderAt: new Date(Date.now() - 60 * 60 * 1000),
    createdAt: new Date('2023-06-01'),
  },
];

// GET /api/customers - List customers
export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const organizationId = searchParams.get('organizationId');
    const search = searchParams.get('search');
    const isVip = searchParams.get('isVip');
    const loyaltyLevel = searchParams.get('loyaltyLevel');
    const tags = searchParams.get('tags');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const minSpent = searchParams.get('minSpent');
    const demo = searchParams.get('demo');

    // Return demo data if demo mode or no organization specified
    if (demo === 'true' || !organizationId) {
      let filteredCustomers = [...DEMO_CUSTOMERS];
      
      // Apply filters
      if (search) {
        const searchLower = search.toLowerCase();
        filteredCustomers = filteredCustomers.filter(c => 
          c.firstName.toLowerCase().includes(searchLower) ||
          c.lastName.toLowerCase().includes(searchLower) ||
          c.phone.includes(search) ||
          c.email?.toLowerCase().includes(searchLower)
        );
      }
      if (isVip !== null) {
        filteredCustomers = filteredCustomers.filter(c => c.isVip === (isVip === 'true'));
      }
      if (loyaltyLevel) {
        filteredCustomers = filteredCustomers.filter(c => c.loyaltyLevel === parseInt(loyaltyLevel));
      }
      if (minSpent) {
        filteredCustomers = filteredCustomers.filter(c => c.totalSpent >= parseFloat(minSpent));
      }
      if (dateFrom) {
        filteredCustomers = filteredCustomers.filter(c => new Date(c.createdAt) >= new Date(dateFrom));
      }
      if (dateTo) {
        filteredCustomers = filteredCustomers.filter(c => new Date(c.createdAt) <= new Date(dateTo));
      }

      const total = filteredCustomers.length;
      const paginatedCustomers = filteredCustomers.slice(skip, skip + limit);

      return apiSuccess({
        data: paginatedCustomers.map(c => ({
          ...c,
          _count: { orders: c.totalOrders },
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }

    const where = {
      organizationId,
      ...(search && {
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { phone: { contains: search } },
          { email: { contains: search } },
        ],
      }),
      ...(isVip !== null && { isVip: isVip === 'true' }),
      ...(loyaltyLevel && { loyaltyLevel: parseInt(loyaltyLevel) }),
      ...(minSpent && { totalSpent: { gte: parseFloat(minSpent) } }),
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom && { gte: new Date(dateFrom) }),
              ...(dateTo && { lte: new Date(dateTo) }),
            },
          }
        : {}),
    };

    const [customers, total] = await Promise.all([
      db.customerProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { orders: true },
          },
        },
      }),
      db.customerProfile.count({ where }),
    ]);

    return apiSuccess({
      data: customers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  });
}

// POST /api/customers - Create customer
export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const {
      organizationId,
      userId,
      firstName,
      lastName,
      phone,
      email,
      avatar,
      dateOfBirth,
      language = 'fr',
      currency = 'XOF',
      addresses,
      dietaryPreferences,
      allergies,
      tags,
      notes,
    } = body;

    // Validation
    if (!organizationId || !phone) {
      return apiError('organisation et téléphone sont requis');
    }

    // Validate phone
    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      return apiError('Numéro de téléphone invalide');
    }

    // Check if customer exists
    const existing = await db.customerProfile.findFirst({
      where: { organizationId, phone: phoneValidation.formatted || phone },
    });

    if (existing) {
      return apiSuccess(existing, 'Client existant');
    }

    // Create customer
    const customer = await db.customerProfile.create({
      data: {
        organizationId,
        userId,
        firstName,
        lastName,
        phone: phoneValidation.formatted || phone,
        email,
        avatar,
        dateOfBirth,
        language,
        currency,
        addresses: addresses ? JSON.stringify(addresses) : undefined,
        dietaryPreferences: dietaryPreferences ? JSON.stringify(dietaryPreferences) : undefined,
        allergies: allergies ? JSON.stringify(allergies) : undefined,
        tags: tags ? JSON.stringify(tags) : undefined,
        notes,
      },
    });

    return apiSuccess(customer, 'Client créé avec succès', 201);
  });
}

// PATCH /api/customers - Update customer
export async function PATCH(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const {
      id,
      firstName,
      lastName,
      phone,
      email,
      avatar,
      dateOfBirth,
      language,
      currency,
      addresses,
      dietaryPreferences,
      allergies,
      tags,
      isVip,
      notes,
    } = body;

    if (!id) {
      return apiError('ID est requis');
    }

    const customer = await db.customerProfile.findUnique({ where: { id } });
    if (!customer) {
      return apiError('Client non trouvé', 404);
    }

    const updateData: Record<string, unknown> = {};

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
    if (avatar !== undefined) updateData.avatar = avatar;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (language !== undefined) updateData.language = language;
    if (currency !== undefined) updateData.currency = currency;
    if (addresses !== undefined) updateData.addresses = JSON.stringify(addresses);
    if (dietaryPreferences !== undefined) updateData.dietaryPreferences = JSON.stringify(dietaryPreferences);
    if (allergies !== undefined) updateData.allergies = JSON.stringify(allergies);
    if (tags !== undefined) updateData.tags = JSON.stringify(tags);
    if (isVip !== undefined) updateData.isVip = isVip;
    if (notes !== undefined) updateData.notes = notes;

    const updatedCustomer = await db.customerProfile.update({
      where: { id },
      data: updateData,
    });

    return apiSuccess(updatedCustomer, 'Client mis à jour');
  });
}

// DELETE /api/customers - Delete customer
export async function DELETE(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('ID est requis');
    }

    const customer = await db.customerProfile.findUnique({ where: { id } });
    if (!customer) {
      return apiError('Client non trouvé', 404);
    }

    // Soft delete by anonymizing
    await db.customerProfile.update({
      where: { id },
      data: {
        firstName: 'Anonyme',
        lastName: '',
        phone: `deleted_${id}`,
        email: null,
        avatar: null,
        notes: '[Compte supprimé]',
      },
    });

    return apiSuccess({ deleted: true }, 'Client supprimé');
  });
}
