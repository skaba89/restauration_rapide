// Customers API - Customer CRM with demo support
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler, getPaginationParams } from '@/lib/api-responses';
import { validatePhoneNumber } from '@/lib/utils-helpers';

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